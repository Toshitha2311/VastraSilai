from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_tailor, get_owned_order
from app.schemas.notifications import NotificationCreate, NotificationResponse
from app.supabase_client import supabase

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate, current_tailor: dict = Depends(get_current_tailor)
):
    get_owned_order(payload.order_id, current_tailor["tailor_id"])

    try:
        result = (
            supabase.table("notifications")
            .insert(
                {
                    "order_id": payload.order_id,
                    "message": payload.message,
                    "type": payload.type,
                    "sent_status": False,
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create notification"
        )
    return result.data[0]


@router.get("/", response_model=List[NotificationResponse])
def list_notifications(current_tailor: dict = Depends(get_current_tailor)):
    customers_result = (
        supabase.table("customers")
        .select("customer_id")
        .eq("tailor_id", current_tailor["tailor_id"])
        .execute()
    )
    customer_ids = [c["customer_id"] for c in customers_result.data]
    if not customer_ids:
        return []

    orders_result = (
        supabase.table("orders").select("order_id").in_("customer_id", customer_ids).execute()
    )
    order_ids = [o["order_id"] for o in orders_result.data]
    if not order_ids:
        return []

    result = (
        supabase.table("notifications")
        .select("*")
        .in_("order_id", order_ids)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
