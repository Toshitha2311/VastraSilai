

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    phone: str
    email: EmailStr
    password: str
    shop_name: str
    address: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    message: str