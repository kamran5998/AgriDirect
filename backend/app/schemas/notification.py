"""Pydantic schemas for Notifications."""

from datetime import datetime
from pydantic import BaseModel, Field
from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    user_id: int
    title: str = Field(..., max_length=200)
    message: str
    type: NotificationType = NotificationType.SYSTEM_NOTICE


class NotificationRead(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
