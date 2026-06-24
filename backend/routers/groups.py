import psycopg2.extras
from fastapi import APIRouter, HTTPException, Depends, status
from database import get_connection, release_connection
from models.group import (
    GroupCreate, GroupResponse, GroupDetailResponse, AddMemberRequest
)
from auth import get_current_user

router = APIRouter(prefix="/groups", tags=["groups"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _is_member(cursor, group_id: str, user_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM group_members WHERE group_id = %s AND user_id = %s;",
        (group_id, user_id)
    )
    return cursor.fetchone() is not None


def _is_admin(cursor, group_id: str, user_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM group_members WHERE group_id = %s AND user_id = %s AND role = 'admin';",
        (group_id, user_id)
    )
    return cursor.fetchone() is not None


def _group_exists(cursor, group_id: str) -> bool:
    cursor.execute("SELECT 1 FROM groups WHERE id = %s;", (group_id,))
    return cursor.fetchone() is not None


def _user_exists(cursor, user_id: str) -> bool:
    cursor.execute("SELECT 1 FROM users WHERE id = %s;", (user_id,))
    return cursor.fetchone() is not None


def _fetch_members(cursor, group_id: str) -> list:
    cursor.execute(
        """
        SELECT
            gm.user_id::TEXT,
            u.username,
            u.display_name,
            gm.role,
            gm.joined_at
        FROM group_members gm
        JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id = %s
        ORDER BY gm.joined_at ASC;
        """,
        (group_id,)
    )
    return [dict(row) for row in cursor.fetchall()]


def _admin_count(cursor, group_id: str) -> int:
    cursor.execute(
        "SELECT COUNT(*) FROM group_members WHERE group_id = %s AND role = 'admin';",
        (group_id,)
    )
    return cursor.fetchone()["count"]


# ── group routes ──────────────────────────────────────────────────────────────

@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(body: GroupCreate, current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(
            """
            INSERT INTO groups (name, description, created_by)
            VALUES (%s, %s, %s)
            RETURNING id::TEXT, name, description, created_by::TEXT, created_at;
            """,
            (body.name, body.description, current_user["sub"])
        )
        group = dict(cursor.fetchone())

        cursor.execute(
            "INSERT INTO group_members (group_id, user_id, role) VALUES (%s, %s, 'admin');",
            (group["id"], current_user["sub"])
        )

        conn.commit()
        cursor.close()
        return group

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.get("/", response_model=list[GroupResponse])
def get_my_groups(current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(
            """
            SELECT g.id::TEXT, g.name, g.description, g.created_by::TEXT, g.created_at
            FROM groups g
            JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.user_id = %s
            ORDER BY g.created_at DESC;
            """,
            (current_user["sub"],)
        )
        groups = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return groups

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.get("/{group_id}", response_model=GroupDetailResponse)
def get_group(group_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _is_member(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        cursor.execute(
            "SELECT id::TEXT, name, description, created_by::TEXT, created_at FROM groups WHERE id = %s;",
            (group_id,)
        )
        group = cursor.fetchone()
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        group = dict(group)
        group["members"] = _fetch_members(cursor, group_id)
        cursor.close()
        return group

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


# ── member routes ─────────────────────────────────────────────────────────────

@router.post("/{group_id}/members", status_code=status.HTTP_201_CREATED)
def add_member(
    group_id: str,
    body: AddMemberRequest,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _group_exists(cursor, group_id):
            raise HTTPException(status_code=404, detail="Group not found")

        if not _is_admin(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="Only admins can add members")

        if not _user_exists(cursor, body.user_id):
            raise HTTPException(status_code=404, detail="User not found")

        if _is_member(cursor, group_id, body.user_id):
            raise HTTPException(status_code=409, detail="User is already a member")

        cursor.execute(
            "INSERT INTO group_members (group_id, user_id, role) VALUES (%s, %s, 'member');",
            (group_id, body.user_id)
        )
        conn.commit()
        cursor.close()
        return {"detail": "Member added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_200_OK)
def remove_member(
    group_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if not _group_exists(cursor, group_id):
            raise HTTPException(status_code=404, detail="Group not found")

        if not _is_admin(cursor, group_id, current_user["sub"]):
            raise HTTPException(status_code=403, detail="Only admins can remove members")

        if not _is_member(cursor, group_id, user_id):
            raise HTTPException(status_code=404, detail="User is not a member of this group")

        # Prevent removing the last admin
        target_is_admin = _is_admin(cursor, group_id, user_id)
        if target_is_admin and _admin_count(cursor, group_id) == 1:
            raise HTTPException(
                status_code=409,
                detail="Cannot remove the last admin. Promote another member first."
            )

        cursor.execute(
            "DELETE FROM group_members WHERE group_id = %s AND user_id = %s;",
            (group_id, user_id)
        )
        conn.commit()
        cursor.close()
        return {"detail": "Member removed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            release_connection(conn)