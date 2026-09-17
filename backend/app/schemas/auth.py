"""Pydantic schemas for Authentication and User management."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Full Name")
    email: Optional[EmailStr] = Field(None, description="Email address")
    phone: str = Field(..., min_length=10, max_length=20, description="Mobile phone number")
    role: UserRole = Field(default=UserRole.FARMER, description="User access role")
    location: Optional[str] = Field(None, max_length=255, description="City / Region")


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="Plain text password")
    # Optional onboarding fields for farmer
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    # Optional onboarding fields for buyer
    business_name: Optional[str] = None


class UserLogin(BaseModel):
    phone_or_email: str = Field(..., description="Mobile number or Email address")
    password: str = Field(..., description="Account password")


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
