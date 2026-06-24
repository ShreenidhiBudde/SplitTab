import psycopg2.extras
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from database import get_connection, release_connection
from models.balance import BalanceResponse
from auth import get_current_user

router = APIRouter(prefix="/groups", tags=["balances"])


def _is_member(cursor, group_id: str, user_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM group_members WHERE group_id = %s AND user_id = %s;",
        (group_id, user_id)
    )
    return cursor.fetchone() is not None


@router.get("/{group_id}/balances", response_model=list[BalanceResponse])
def get_balances(group_id: str, current_user: dict = Depends(get_current_user)):
    """
    Algorithm
    ---------
    For each member, net balance = total_paid - total_owed + total_received_settlements - total_sent_settlements

    total_paid:
        SUM of expenses.total_amount where paid_by = user

    total_owed:
        SUM of expense_splits.amount_owed where user_id = user
        (includes their own share when they paid)

    total_received_settlements:
        SUM of settlements.amount where paid_to = user

    total_sent_settlements:
        SUM of settlements.amount where paid_by = user

    net = (paid - owed) + (received - sent)

    Positive  → group owes this person money
    Negative  → this person owes the group money
    Zero      → fully settled
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _is_member(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        cursor.execute(
            """
            WITH members AS (
                SELECT
                    gm.user_id,
                    u.username,
                    u.display_name
                FROM group_members gm
                JOIN users u ON u.id = gm.user_id
                WHERE gm.group_id = %s
            ),

            paid AS (
                SELECT paid_by AS user_id, COALESCE(SUM(total_amount), 0) AS total_paid
                FROM expenses
                WHERE group_id = %s
                GROUP BY paid_by
            ),

            owed AS (
                SELECT es.user_id, COALESCE(SUM(es.amount_owed), 0) AS total_owed
                FROM expense_splits es
                JOIN expenses e ON e.id = es.expense_id
                WHERE e.group_id = %s
                GROUP BY es.user_id
            ),

            sent AS (
                SELECT paid_by AS user_id, COALESCE(SUM(amount), 0) AS total_sent
                FROM settlements
                WHERE group_id = %s
                GROUP BY paid_by
            ),

            received AS (
                SELECT paid_to AS user_id, COALESCE(SUM(amount), 0) AS total_received
                FROM settlements
                WHERE group_id = %s
                GROUP BY paid_to
            )

            SELECT
                m.user_id::TEXT,
                m.username,
                m.display_name,
                (
                    COALESCE(p.total_paid,     0) -
                    COALESCE(o.total_owed,     0) +
                    COALESCE(r.total_received, 0) -
                    COALESCE(s.total_sent,     0)
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

        rows = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return rows

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)