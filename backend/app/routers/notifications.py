from fastapi import APIRouter, HTTPException, Depends
from app.schemas.notifications import NotificationCreate, NotificationResponse
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/", response_model=NotificationResponse)
def send_notification(body: NotificationCreate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    payload = body.model_dump()
    if body.type == "whatsapp":
        payload["sent_status"] = True
        payload["sent_at"] = datetime.now(timezone.utc).isoformat()
    result = client.table("Notifications").insert(payload).execute()
    if not result.data: raise HTTPException(status_code=400, detail="Failed to save notification")
    return result.data[0]

@router.get("/order/{order_id}", response_model=List[NotificationResponse])
def list_notifications_for_order(order_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    return (client.table("Notifications").select("*").eq("order_id", order_id).order("created_at", desc=True).execute()).data or []

@router.get("/pending", response_model=List[NotificationResponse])
def list_pending_notifications(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    custs = client.table("Customers").select("customer_id").eq("tailor_id", user["tailor_id"]).execute()
    cids = [c["customer_id"] for c in (custs.data or [])]
    if not cids: return []
    orders = client.table("Orders").select("order_id").in_("customer_id", cids).execute()
    oids = [o["order_id"] for o in (orders.data or [])]
    if not oids: return []
    return (client.table("Notifications").select("*").in_("order_id", oids).eq("sent_status", False).order("created_at", desc=True).execute()).data or []

@router.put("/{notification_id}/mark-sent", response_model=NotificationResponse)
def mark_sent(notification_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    r = client.table("Notifications").update({"sent_status": True, "sent_at": datetime.now(timezone.utc).isoformat()}).eq("notification_id", notification_id).execute()
    if not r.data: raise HTTPException(status_code=404, detail="Notification not found")
    return r.data[0]

@router.post("/whatsapp-webhook")
def whatsapp_webhook(payload: dict):
    try:
        messages = payload.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {}).get("messages", [])
        if not messages: return {"status": "no messages"}
        text = messages[0].get("text", {}).get("body", "").strip().lower()
        if "status" in text or "order" in text: reply = "Please share your order ID to check status."
        elif "payment" in text: reply = "Please contact your tailor for payment details."
        elif "hello" in text or "hi" in text: reply = "Hello! Welcome to VastraSilai 🪡"
        else: reply = "Reply with: ORDER, PAYMENT, or DELIVERY"
        return {"status": "received", "reply_preview": reply}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/whatsapp-webhook")
def whatsapp_verify(hub_mode: str = None, hub_challenge: str = None, hub_verify_token: str = None):
    if hub_mode == "subscribe" and hub_verify_token == "vastrasilai_verify_token": return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Verification failed")
