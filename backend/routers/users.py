import psycopg2.extras
from fastapi import APIRouter, HTTPException, Depends, status
from database import get_connection, release_connection
from models.user import UserRegister, UserLogin, UserResponse, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


# ── helpers ──────────────────────────────────────────────────────────────────

def _fetch_user_by_email(cursor, email: str):
    cursor.execute(
        "SELECT id, email, username, display_name, password_hash, created_at "
        "FROM users WHERE email = %s;",
        (email,)
    )
    return cursor.fetchone()


def _fetch_user_by_id(cursor, user_id: str):
    cursor.execute(
        "SELECT id, email, username, display_name, created_at "
        "FROM users WHERE id = %s;",
        (user_id,)
    )
    return cursor.fetchone()


# ── routes ───────────────────────────────────────────────────────────────────

@router.get("/")
def get_all_users():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT id, email, username, display_name, created_at FROM users;"
        )
        users = cursor.fetchall()
        cursor.close()
        return [dict(u) for u in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserRegister):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Reject duplicate email
        if _fetch_user_by_email(cursor, body.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Reject duplicate username
        cursor.execute(
            "SELECT id FROM users WHERE username = %s;", (body.username,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )

        hashed = hash_password(body.password)

        cursor.execute(
            """
            INSERT INTO users (email, username, password_hash, display_name)
            VALUES (%s, %s, %s, %s)
            RETURNING id, email, username, display_name, created_at;
            """,
            (body.email, body.username, hashed, body.display_name)
        )
        new_user = dict(cursor.fetchone())
        conn.commit()
        cursor.close()

        token = create_access_token(str(new_user["id"]), new_user["email"])

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": new_user
        }

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        user = _fetch_user_by_email(cursor, body.email)

        # Deliberately vague: don't reveal whether email or password was wrong
        if not user or not verify_password(body.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        cursor.close()

        token = create_access_token(str(user["id"]), user["email"])

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "username": user["username"],
                "display_name": user["display_name"],
                "created_at": user["created_at"],
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        user = _fetch_user_by_id(cursor, current_user["sub"])
        cursor.close()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return dict(user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)