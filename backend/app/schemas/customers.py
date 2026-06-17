from pydantic import BaseModel, EmailStr
from typing import Optional


class CustomerCreate(BaseModel):
    customer_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    language: Optional[str] = "en"


class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    language: Optional[str] = None


class CustomerResponse(BaseModel):
    customer_id: str
    tailor_id: str
    customer_name: str
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    language: Optional[str]
    created_at: Optional[str]
