from pydantic import BaseModel
from decimal import Decimal


class BalanceResponse(BaseModel):
    user_id: str
    username: str
    display_name: str
    balance: Decimal