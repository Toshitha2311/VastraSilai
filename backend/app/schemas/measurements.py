from pydantic import BaseModel
from typing import Optional


class MeasurementCreate(BaseModel):
    customer_id: str
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    shoulder: Optional[float] = None
    sleeve_length: Optional[float] = None
    neck: Optional[float] = None
    inseam: Optional[float] = None
    notes: Optional[str] = None


class MeasurementUpdate(BaseModel):
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    shoulder: Optional[float] = None
    sleeve_length: Optional[float] = None
    neck: Optional[float] = None
    inseam: Optional[float] = None
    notes: Optional[str] = None


class MeasurementResponse(BaseModel):
    measurement_id: str
    customer_id: str
    chest: Optional[float]
    waist: Optional[float]
    hips: Optional[float]
    shoulder: Optional[float]
    sleeve_length: Optional[float]
    neck: Optional[float]
    inseam: Optional[float]
    notes: Optional[str]
    recorded_at: Optional[str]
