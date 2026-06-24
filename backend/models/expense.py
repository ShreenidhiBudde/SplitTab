from pydantic import BaseModel
from datetime import date, datetime
from typing import List
from decimal import Decimal


class SplitDetail(BaseModel):
    user_id: str
    username: str
    display_name: str
    amount_owed: Decimal


class ExpenseCreate(BaseModel):
    description: str
    total_amount: Decimal
    expense_date: date | None = None
    split_among: List[str]   # list of user_ids to split equally among


class ExpenseResponse(BaseModel):
    id: str
    group_id: str
    paid_by: str
    payer_username: str
    payer_display_name: str
    description: str
    total_amount: Decimal
    currency: str
    expense_date: date
    created_at: datetime
    splits: List[SplitDetail]