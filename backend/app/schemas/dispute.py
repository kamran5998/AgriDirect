"""Pydantic schemas for Dispute and Grievance management."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.dispute import DisputeStatus


class DisputeBase(BaseModel):
    trade_id: Optional[int] = Field(None, description="Related trade or request ID")
    gate_pass_id: Optional[str] = Field(None, max_length=50, description="Related dispatch gate pass ID")
    farmer_id: Optional[int] = Field(None, description="Farmer profile ID")
    buyer_id: Optional[int] = Field(None, description="Buyer profile ID")
    reason: str = Field(..., max_length=255, description="Primary reason or category of dispute")


class DisputeCreate(BaseModel):
    trade_id: Optional[int] = Field(None, description="Related trade ID")
    gate_pass_id: Optional[str] = Field(None, max_length=50, description="Gate pass ID")
    farmer_id: Optional[int] = Field(None, description="Farmer profile ID")
    buyer_id: Optional[int] = Field(None, description="Buyer profile ID")
    reason: str = Field(..., max_length=255, description="Primary reason or category")
    resolution_notes: Optional[str] = None


class DisputeResolve(BaseModel):
    status: DisputeStatus = Field(default=DisputeStatus.RESOLVED, description="Resolution status")
    resolution_notes: str = Field(..., min_length=3, description="Mediation outcome and notes")


class DisputeResponse(BaseModel):
    id: int
    trade_id: Optional[int] = None
    gate_pass_id: Optional[str] = None
    farmer_id: Optional[int] = None
    buyer_id: Optional[int] = None
    reason: str
    status: DisputeStatus
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
