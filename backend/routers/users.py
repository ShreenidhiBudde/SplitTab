import psycopg2
import psycopg2.extras
from fastapi import APIRouter, HTTPException
import psycopg2
from database import get_connection, release_connection

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/")
def get_all_users():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id, email, username, display_name, created_at FROM users;")
        users = cursor.fetchall()
        cursor.close()
        return [dict(user) for user in users]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            release_connection(conn)