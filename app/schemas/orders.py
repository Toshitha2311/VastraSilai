from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    READY = "Ready"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"


class OrderCreate(BaseModel):
    customer_id: int
    cloth_type: str = Field(..., min_length=1, max_length=100)
    delivery_date: Optional[date] = None
    status: OrderStatus = OrderStatus.PENDING


class OrderUpdate(BaseModel):
    cloth_type: Optional[str] = Field(None, min_length=1, max_length=100)
    delivery_date: Optional[date] = None
    status: Optional[OrderStatus] = None


class OrderResponse(BaseModel):
    order_id: int
    customer_id: int
    cloth_type: str
    delivery_date: Optional[date] = None
    status: str
    created_at: datetime
