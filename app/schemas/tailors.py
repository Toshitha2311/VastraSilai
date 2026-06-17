from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TailorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    shop_name: Optional[str] = None
    address: Optional[str] = None


class TailorResponse(BaseModel):
    tailor_id: int
    name: str
    phone: Optional[str] = None
    email: EmailStr
    shop_name: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
