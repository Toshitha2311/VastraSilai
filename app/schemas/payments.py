from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class PaymentStatus(str, Enum):
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    UNPAID = "UNPAID"


class PaymentCreate(BaseModel):
    order_id: int
    total_amount: float = Field(..., ge=0)
    advance_amount: float = Field(0, ge=0)


class PaymentUpdate(BaseModel):
    total_amount: Optional[float] = Field(None, ge=0)
    advance_amount: Optional[float] = Field(None, ge=0)


class PaymentResponse(BaseModel):
    payment_id: int
    order_id: int
    total_amount: float
    advance_amount: float
    remaining_amount: float
    payment_status: str
    created_at: datetime
