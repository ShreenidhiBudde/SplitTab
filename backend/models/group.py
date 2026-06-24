from pydantic import BaseModel
from datetime import datetime
from typing import List


class GroupCreate(BaseModel):
    name: str
    description: str | None = None


class GroupMemberResponse(BaseModel):
    user_id: str
    username: str
    display_name: str
    role: str
    joined_at: datetime


class GroupResponse(BaseModel):
    id: str
    name: str
    description: str | None
    created_by: str
    created_at: datetime


class GroupDetailResponse(BaseModel):
    id: str
    name: str
    description: str | None
    created_by: str
    created_at: datetime
    members: List[GroupMemberResponse]