

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    name: str
    phone: str
    email: EmailStr
    password: str
    shop_name: str
    address: str

    @field_validator('name', 'phone', 'email', 'password', 'shop_name', 'address', mode='before')
    def trim_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator('email', 'password', mode='before')
    def trim_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


class AuthResponse(BaseModel):
    message: str