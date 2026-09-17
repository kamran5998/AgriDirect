"""Pydantic schemas for Crops."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.crop import CropCategory


class CropBase(BaseModel):
    name: str = Field(..., max_length=100)
    category: CropCategory
    description: Optional[str] = None


class CropCreate(CropBase):
    pass


class CropRead(CropBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
