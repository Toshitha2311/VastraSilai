from pydantic import BaseModel
from typing import Optional


class NotificationCreate(BaseModel):
    order_id: str
    message: str
    type: Optional[str] = "whatsapp"   # whatsapp | sms | email | push


class NotificationUpdate(BaseModel):
    sent_status: Optional[bool] = None
    message: Optional[str] = None


class NotificationResponse(BaseModel):
    notification_id: str
    order_id: str
    message: str
    type: str
    sent_status: bool
    sent_at: Optional[str]
    created_at: Optional[str]
