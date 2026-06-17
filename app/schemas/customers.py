from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CustomerCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None


class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None


class CustomerResponse(BaseModel):
    customer_id: int
    tailor_id: int
    customer_name: str
    phone: Optional[str] = None
    created_at: datetime
