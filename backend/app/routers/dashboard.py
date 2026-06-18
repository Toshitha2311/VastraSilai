from fastapi import APIRouter, HTTPException, Depends
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/dashboard", tags=["Customer Dashboard"])


@router.get("/")
def tailor_dashboard(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    profile = client.table("Tailors").select("*").eq("tailor_id", user["tailor_id"]).single().execute()
    custs = client.table("Customers").select("customer_id").eq("tailor_id", user["tailor_id"]).execute()
    cids = [c["customer_id"] for c in (custs.data or [])]
    orders_result, oids = [], []
    if cids:
        oq = client.table("Orders").select("order_id, cloth_type, delivery_date, status, created_at, Customers(customer_name, phone)").in_("customer_id", cids).order("created_at", desc=True).execute()
        orders_result = oq.data or []
        oids = [o["order_id"] for o in orders_result]
    total_revenue = collected = pending = 0
    if oids:
        pmts = client.table("Payments").select("total_amount, advance_amount, remaining_amount").in_("order_id", oids).execute()
        total_revenue = sum(p["total_amount"] for p in (pmts.data or []))
        collected = sum(p["advance_amount"] for p in (pmts.data or []))
        pending = sum(p["remaining_amount"] or 0 for p in (pmts.data or []))
    status_count = {}
    for o in orders_result: status_count[o["status"]] = status_count.get(o["status"], 0) + 1
    upcoming = sorted([o for o in orders_result if o.get("delivery_date") and o["status"] in ("pending", "in_progress")], key=lambda x: x["delivery_date"])[:7]
    unsent = 0
    if oids:
        n = client.table("Notifications").select("notification_id").in_("order_id", oids).eq("sent_status", False).execute()
        unsent = len(n.data or [])
    return {"tailor": profile.data, "summary": {"total_customers": len(cids), "total_orders": len(orders_result), "total_revenue": total_revenue, "collected": collected, "pending_dues": pending, "orders_by_status": status_count, "unsent_notifications": unsent}, "upcoming_deliveries": upcoming, "recent_orders": orders_result[:5]}


@router.get("/customer/{customer_id}")
def customer_dashboard(customer_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    cust = client.table("Customers").select("*").eq("customer_id", customer_id).eq("tailor_id", user["tailor_id"]).single().execute()
    if not cust.data: raise HTTPException(status_code=404, detail="Customer not found")
    meas = client.table("Measurements").select("*").eq("customer_id", customer_id).order("recorded_at", desc=True).limit(1).execute()
    orders = client.table("Orders").select("*, Payments(*)").eq("customer_id", customer_id).order("created_at", desc=True).execute()
    oids = [o["order_id"] for o in (orders.data or [])]
    notifs = []
    if oids: notifs = (client.table("Notifications").select("*").in_("order_id", oids).order("created_at", desc=True).execute()).data or []
    return {"customer": cust.data, "latest_measurement": meas.data[0] if meas.data else None, "orders": orders.data or [], "notifications": notifs}
