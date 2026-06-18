from pydantic import BaseModel
from typing import Optional
from datetime import date


class OrderCreate(BaseModel):
    customer_id: str
    cloth_type: str
    description: Optional[str] = None
    delivery_date: Optional[date] = None
    status: Optional[str] = "pending"


class OrderUpdate(BaseModel):
    cloth_type: Optional[str] = None
    description: Optional[str] = None
    delivery_date: Optional[date] = None
    status: Optional[str] = None


class OrderResponse(BaseModel):
    order_id: str
    customer_id: str
    cloth_type: str
    description: Optional[str]
    delivery_date: Optional[str]
    status: str
    created_at: Optional[str]
