import psycopg2.extras
from decimal import Decimal, ROUND_DOWN
from fastapi import APIRouter, HTTPException, Depends, status
from database import get_connection, release_connection
from models.expense import ExpenseCreate, ExpenseResponse
from auth import get_current_user
from datetime import date

router = APIRouter(prefix="/groups", tags=["expenses"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _is_member(cursor, group_id: str, user_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM group_members WHERE group_id = %s AND user_id = %s;",
        (group_id, user_id)
    )
    return cursor.fetchone() is not None


def _group_exists(cursor, group_id: str) -> bool:
    cursor.execute("SELECT 1 FROM groups WHERE id = %s;", (group_id,))
    return cursor.fetchone() is not None


def _compute_equal_splits(total: Decimal, n: int) -> list[Decimal]:
    """
    Divide total into n equal shares.
    Distribute any remainder penny-by-penny to the first shares
    so that sum(shares) == total exactly.
    """
    share = (total / n).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
    remainder = total - share * n
    shares = [share] * n
    remainder_paise = int(remainder * 100)
    for i in range(remainder_paise):
        shares[i] += Decimal("0.01")
    return shares


def _fetch_expense_with_splits(cursor, expense_id: str) -> dict:
    cursor.execute(
        """
        SELECT
            e.id::TEXT,
            e.group_id::TEXT,
            e.paid_by::TEXT,
            u.username         AS payer_username,
            u.display_name     AS payer_display_name,
            e.description,
            e.total_amount,
            e.currency,
            e.expense_date,
            e.created_at
        FROM expenses e
        JOIN users u ON u.id = e.paid_by
        WHERE e.id = %s;
        """,
        (expense_id,)
    )
    expense = dict(cursor.fetchone())

    cursor.execute(
        """
        SELECT
            es.user_id::TEXT,
            u.username,
            u.display_name,
            es.amount_owed
        FROM expense_splits es
        JOIN users u ON u.id = es.user_id
        WHERE es.expense_id = %s
        ORDER BY u.username ASC;
        """,
        (expense_id,)
    )
    expense["splits"] = [dict(row) for row in cursor.fetchall()]
    return expense


# ── routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/{group_id}/expenses",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_expense(
    group_id: str,
    body: ExpenseCreate,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _group_exists(cursor, group_id):
            raise HTTPException(status_code=404, detail="Group not found")

        if not _is_member(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        if not body.split_among:
            raise HTTPException(status_code=422, detail="split_among cannot be empty")

        if body.total_amount <= 0:
            raise HTTPException(status_code=422, detail="total_amount must be greater than zero")

        # Validate every user in split_among is a group member
        for uid in body.split_among:
            if not _is_member(cursor, group_id, uid):
                raise HTTPException(
                    status_code=422,
                    detail=f"User {uid} is not a member of this group"
                )

        shares = _compute_equal_splits(body.total_amount, len(body.split_among))

        expense_date = body.expense_date or date.today()
        cursor.execute(
            """
            INSERT INTO expenses (group_id, paid_by, description, total_amount, expense_date)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id::TEXT;
            """,
            (
                group_id,
                current_user["sub"],
                body.description,
                body.total_amount,
                expense_date,
            )
        )
        expense_id = cursor.fetchone()["id"]

        for uid, share in zip(body.split_among, shares):
            cursor.execute(
                "INSERT INTO expense_splits (expense_id, user_id, amount_owed) VALUES (%s, %s, %s);",
                (expense_id, uid, share)
            )

        conn.commit()

        expense = _fetch_expense_with_splits(cursor, expense_id)
        cursor.close()
        return expense

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.get("/{group_id}/expenses", response_model=list[ExpenseResponse])
def get_expenses(group_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _group_exists(cursor, group_id):
            raise HTTPException(status_code=404, detail="Group not found")

        if not _is_member(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        cursor.execute(
            "SELECT id::TEXT FROM expenses WHERE group_id = %s ORDER BY expense_date DESC, created_at DESC;",
            (group_id,)
        )
        expense_ids = [row["id"] for row in cursor.fetchall()]

        expenses = [_fetch_expense_with_splits(cursor, eid) for eid in expense_ids]
        cursor.close()
        return expenses

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)