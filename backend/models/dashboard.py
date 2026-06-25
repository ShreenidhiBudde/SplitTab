from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


class RecentActivity(BaseModel):
    type: str          # "expense" or "settlement"
    group_id: str
    group_name: str
    description: str
    amount: Decimal
    timestamp: datetime


class DashboardSummary(BaseModel):
    total_groups: int
    total_expenses: int
    total_amount_spent: Decimal
    amount_owed: Decimal       # caller owes others (negative balance sum)
    amount_to_receive: Decimal # others owe caller (positive balance sum)
    net_balance: Decimal
    recent_activity: list[RecentActivity]