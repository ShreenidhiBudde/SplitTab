import psycopg2.extras
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from database import get_connection, release_connection
from models.dashboard import DashboardSummary, RecentActivity
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard(current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        uid = current_user["sub"]

        # Total groups
        cursor.execute(
            "SELECT COUNT(*) AS cnt FROM group_members WHERE user_id = %s;", (uid,)
        )
        total_groups = cursor.fetchone()["cnt"]

        # Total expenses caller was involved in (paid or split)
        cursor.execute(
            """
            SELECT COUNT(DISTINCT e.id) AS cnt
            FROM expenses e
            JOIN group_members gm ON gm.group_id = e.group_id
            WHERE gm.user_id = %s;
            """,
            (uid,)
        )
        total_expenses = cursor.fetchone()["cnt"]

        # Total amount spent by caller (what they paid out)
        cursor.execute(
            "SELECT COALESCE(SUM(total_amount), 0) AS total FROM expenses WHERE paid_by = %s;",
            (uid,)
        )
        total_amount_spent = Decimal(str(cursor.fetchone()["total"]))

        # Net balance across all groups
        cursor.execute(
            """
            WITH my_groups AS (
                SELECT group_id FROM group_members WHERE user_id = %s
            ),
            paid AS (
                SELECT COALESCE(SUM(total_amount), 0) AS v
                FROM expenses WHERE paid_by = %s
                AND group_id IN (SELECT group_id FROM my_groups)
            ),
            owed AS (
                SELECT COALESCE(SUM(es.amount_owed), 0) AS v
                FROM expense_splits es
                JOIN expenses e ON e.id = es.expense_id
                WHERE es.user_id = %s
                AND e.group_id IN (SELECT group_id FROM my_groups)
            ),
            sent AS (
                SELECT COALESCE(SUM(amount), 0) AS v
                FROM settlements
                WHERE paid_by = %s
                AND group_id IN (SELECT group_id FROM my_groups)
            ),
            received AS (
                SELECT COALESCE(SUM(amount), 0) AS v
                FROM settlements
                WHERE paid_to = %s
                AND group_id IN (SELECT group_id FROM my_groups)
            )
            SELECT
                (SELECT v FROM paid) -
                (SELECT v FROM owed) +
                (SELECT v FROM received) -
                (SELECT v FROM sent) AS net;
            """,
            (uid, uid, uid, uid, uid)
        )
        net_balance = Decimal(str(cursor.fetchone()["net"]))

        amount_to_receive = max(net_balance, Decimal("0.00"))
        amount_owed = abs(min(net_balance, Decimal("0.00")))

        # Recent activity — last 10 expenses + settlements across caller's groups
        cursor.execute(
            """
            SELECT
                'expense'       AS type,
                e.group_id::TEXT,
                g.name          AS group_name,
                e.description,
                e.total_amount  AS amount,
                e.created_at    AS timestamp
            FROM expenses e
            JOIN groups g ON g.id = e.group_id
            JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = %s

            UNION ALL

            SELECT
                'settlement'    AS type,
                s.group_id::TEXT,
                g.name          AS group_name,
                CONCAT('Settlement: ', pu.username, ' → ', pe.username) AS description,
                s.amount,
                s.settled_at    AS timestamp
            FROM settlements s
            JOIN groups g  ON g.id  = s.group_id
            JOIN users  pu ON pu.id = s.paid_by
            JOIN users  pe ON pe.id = s.paid_to
            JOIN group_members gm ON gm.group_id = s.group_id AND gm.user_id = %s

            ORDER BY timestamp DESC
            LIMIT 10;
            """,
            (uid, uid)
        )
        activity = [dict(r) for r in cursor.fetchall()]
        cursor.close()

        return {
            "total_groups": total_groups,
            "total_expenses": total_expenses,
            "total_amount_spent": total_amount_spent,
            "amount_owed": amount_owed,
            "amount_to_receive": amount_to_receive,
            "net_balance": net_balance,
            "recent_activity": activity,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)