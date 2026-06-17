from pydantic import BaseModel
from typing import Optional


class PaymentCreate(BaseModel):
    order_id: str
    total_amount: float
    advance_amount: float = 0.0
    payment_status: Optional[str] = "pending"


class PaymentUpdate(BaseModel):
    total_amount: Optional[float] = None
    advance_amount: Optional[float] = None
    payment_status: Optional[str] = None


class PaymentResponse(BaseModel):
    payment_id: str
    order_id: str
    total_amount: float
    advance_amount: float
    remaining_amount: Optional[float]
    payment_status: str
    paid_at: Optional[str]
    created_at: Optional[str]
