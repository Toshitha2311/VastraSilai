from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MeasurementCreate(BaseModel):
    customer_id: int
    chest: Optional[float] = Field(None, ge=0)
    waist: Optional[float] = Field(None, ge=0)
    shoulder: Optional[float] = Field(None, ge=0)


class MeasurementUpdate(BaseModel):
    chest: Optional[float] = Field(None, ge=0)
    waist: Optional[float] = Field(None, ge=0)
    shoulder: Optional[float] = Field(None, ge=0)


class MeasurementResponse(BaseModel):
    measurement_id: int
    customer_id: int
    chest: Optional[float] = None
    waist: Optional[float] = None
    shoulder: Optional[float] = None
    created_at: datetime
