from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


class SettlementCreate(BaseModel):
    paid_to: str
    amount: Decimal
    note: str | None = None


class SettlementSuggestion(BaseModel):
    from_user_id: str
    from_username: str
    to_user_id: str
    to_username: str
    amount: Decimal


class SettlementResponse(BaseModel):
    id: str
    group_id: str
    paid_by: str
    paid_by_username: str
    paid_to: str
    paid_to_username: str
    amount: Decimal
    note: str | None
    settled_at: datetime