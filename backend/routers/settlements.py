import psycopg2.extras
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends, status
from database import get_connection, release_connection
from models.settlement import SettlementCreate, SettlementSuggestion, SettlementResponse
from auth import get_current_user

router = APIRouter(prefix="/groups", tags=["settlements"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _is_member(cursor, group_id: str, user_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM group_members WHERE group_id = %s AND user_id = %s;",
        (group_id, user_id)
    )
    return cursor.fetchone() is not None


def _get_balances(cursor, group_id: str) -> list[dict]:
    cursor.execute(
        """
        WITH members AS (
            SELECT gm.user_id, u.username, u.display_name
            FROM group_members gm
            JOIN users u ON u.id = gm.user_id
            WHERE gm.group_id = %s
        ),
        paid AS (
            SELECT paid_by AS user_id, COALESCE(SUM(total_amount), 0) AS total_paid
            FROM expenses WHERE group_id = %s GROUP BY paid_by
        ),
        owed AS (
            SELECT es.user_id, COALESCE(SUM(es.amount_owed), 0) AS total_owed
            FROM expense_splits es
            JOIN expenses e ON e.id = es.expense_id
            WHERE e.group_id = %s GROUP BY es.user_id
        ),
        sent AS (
            SELECT paid_by AS user_id, COALESCE(SUM(amount), 0) AS total_sent
            FROM settlements WHERE group_id = %s GROUP BY paid_by
        ),
        received AS (
            SELECT paid_to AS user_id, COALESCE(SUM(amount), 0) AS total_received
            FROM settlements WHERE group_id = %s GROUP BY paid_to
        )
        SELECT
            m.user_id::TEXT,
            m.username,
            m.display_name,
            (
                COALESCE(p.total_paid, 0) -
                COALESCE(o.total_owed, 0) +
                COALESCE(r.total_received, 0) -
                COALESCE(s.total_sent, 0)
            ) AS balance
        FROM members m
        LEFT JOIN paid     p ON p.user_id = m.user_id
        LEFT JOIN owed     o ON o.user_id = m.user_id
        LEFT JOIN sent     s ON s.user_id = m.user_id
        LEFT JOIN received r ON r.user_id = m.user_id
        ORDER BY balance DESC;
        """,
        (group_id, group_id, group_id, group_id, group_id)
    )
    return [dict(row) for row in cursor.fetchall()]


def _greedy_settlements(balances: list[dict]) -> list[dict]:
    """
    Greedy debt-minimisation algorithm.

    Build two lists from the balance rows:
      creditors  — people with balance > 0 (are owed money)
      debtors    — people with balance < 0 (owe money)

    Each iteration:
      Take the largest creditor and the largest debtor.
      The debtor pays min(what_debtor_owes, what_creditor_is_owed).
      Reduce both balances by that amount.
      If either reaches zero, remove from the list.
    Repeat until both lists are empty.

    Produces at most n-1 transactions for n people,
    versus the naive n*(n-1)/2 approach.
    """
    creditors = []
    debtors = []

    for b in balances:
        bal = Decimal(str(b["balance"]))
        if bal > 0:
            creditors.append({"user_id": b["user_id"], "username": b["username"], "amount": bal})
        elif bal < 0:
            debtors.append({"user_id": b["user_id"], "username": b["username"], "amount": -bal})

    creditors.sort(key=lambda x: x["amount"], reverse=True)
    debtors.sort(key=lambda x: x["amount"], reverse=True)

    suggestions = []

    while creditors and debtors:
        creditor = creditors[0]
        debtor = debtors[0]

        transfer = min(creditor["amount"], debtor["amount"])
        transfer = transfer.quantize(Decimal("0.01"))

        suggestions.append({
            "from_user_id": debtor["user_id"],
            "from_username": debtor["username"],
            "to_user_id": creditor["user_id"],
            "to_username": creditor["username"],
            "amount": transfer,
        })

        creditor["amount"] -= transfer
        debtor["amount"] -= transfer

        if creditor["amount"] == 0:
            creditors.pop(0)
        if debtor["amount"] == 0:
            debtors.pop(0)

    return suggestions


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("/{group_id}/settlements/suggestions", response_model=list[SettlementSuggestion])
def get_suggestions(group_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _is_member(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        balances = _get_balances(cursor, group_id)
        cursor.close()
        return _greedy_settlements(balances)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.post(
    "/{group_id}/settlements",
    response_model=SettlementResponse,
    status_code=status.HTTP_201_CREATED
)
def record_settlement(
    group_id: str,
    body: SettlementCreate,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _is_member(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        if not _is_member(cursor, group_id, body.paid_to):
            raise HTTPException(status_code=422, detail="paid_to user is not a member of this group")

        if current_user["sub"] == body.paid_to:
            raise HTTPException(status_code=422, detail="Cannot settle with yourself")

        if body.amount <= 0:
            raise HTTPException(status_code=422, detail="Amount must be greater than zero")

        cursor.execute(
            """
            INSERT INTO settlements (group_id, paid_by, paid_to, amount, note)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id::TEXT, group_id::TEXT, paid_by::TEXT, paid_to::TEXT,
                      amount, note, settled_at;
            """,
            (group_id, current_user["sub"], body.paid_to, body.amount, body.note)
        )
        row = dict(cursor.fetchone())
        conn.commit()

        # Fetch usernames for response
        cursor.execute(
            "SELECT id::TEXT, username FROM users WHERE id = ANY(%s::uuid[]);",
            ([current_user["sub"], body.paid_to],)
        )
        user_map = {r["id"]: r["username"] for r in cursor.fetchall()}
        cursor.close()

        row["paid_by_username"] = user_map.get(row["paid_by"], "")
        row["paid_to_username"] = user_map.get(row["paid_to"], "")
        return row

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.get("/{group_id}/settlements", response_model=list[SettlementResponse])
def get_settlements(group_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _is_member(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        cursor.execute(
            """
            SELECT
                s.id::TEXT,
                s.group_id::TEXT,
                s.paid_by::TEXT,
                payer.username   AS paid_by_username,
                s.paid_to::TEXT,
                payee.username   AS paid_to_username,
                s.amount,
                s.note,
                s.settled_at
            FROM settlements s
            JOIN users payer ON payer.id = s.paid_by
            JOIN users payee ON payee.id = s.paid_to
            WHERE s.group_id = %s
            ORDER BY s.settled_at DESC;
            """,
            (group_id,)
        )
        rows = [dict(r) for r in cursor.fetchall()]
        cursor.close()
        return rows

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)