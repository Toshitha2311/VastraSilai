from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    order_id: int
    message: str = Field(..., min_length=1)
    type: Optional[str] = Field(None, max_length=50)


class NotificationResponse(BaseModel):
    notification_id: int
    order_id: int
    message: Optional[str] = None
    type: Optional[str] = None
    sent_status: bool
    created_at: datetime
