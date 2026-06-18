from fastapi import APIRouter, HTTPException, Depends
from app.schemas.payments import PaymentCreate, PaymentUpdate, PaymentResponse
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=PaymentResponse)
def create_payment(body: PaymentCreate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    payload = body.model_dump()
    if payload["advance_amount"] >= payload["total_amount"]:
        payload["payment_status"] = "paid"
        payload["paid_at"] = datetime.now(timezone.utc).isoformat()
    elif payload["advance_amount"] > 0:
        payload["payment_status"] = "partial"
    try:
        result = client.table("Payments").insert(payload).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create payment: {e}")
    if not result.data: raise HTTPException(status_code=400, detail="Failed to create payment")
    return result.data[0]

@router.get("/", response_model=List[PaymentResponse])
def list_payments(user=Depends(get_current_user), payment_status: str = None):
    client = get_user_client(user["token"])
    custs = client.table("Customers").select("customer_id").eq("tailor_id", user["tailor_id"]).execute()
    cids = [c["customer_id"] for c in (custs.data or [])]
    if not cids: return []
    orders = client.table("Orders").select("order_id").in_("customer_id", cids).execute()
    oids = [o["order_id"] for o in (orders.data or [])]
    if not oids: return []
    q = client.table("Payments").select("*").in_("order_id", oids).order("created_at", desc=True)
    if payment_status: q = q.eq("payment_status", payment_status)
    return q.execute().data or []

@router.get("/order/{order_id}", response_model=PaymentResponse)
def get_payment_by_order(order_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    try:
        r = client.table("Payments").select("*").eq("order_id", order_id).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Payment not found")
    if not r.data: raise HTTPException(status_code=404, detail="Payment not found")
    return r.data

@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(payment_id: str, body: PaymentUpdate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    try:
        existing = client.table("Payments").select("total_amount, advance_amount").eq("payment_id", payment_id).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Payment not found")
    if not existing.data:
        raise HTTPException(status_code=404, detail="Payment not found")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    total = float(updates.get("total_amount", existing.data["total_amount"]))
    advance = float(updates.get("advance_amount", existing.data["advance_amount"]))
    if advance >= total:
        updates["payment_status"] = "paid"
        updates["paid_at"] = datetime.now(timezone.utc).isoformat()
    elif advance > 0:
        updates["payment_status"] = "partial"
        updates["paid_at"] = None
    else:
        updates["payment_status"] = "pending"
        updates["paid_at"] = None
    try:
        result = client.table("Payments").update(updates).eq("payment_id", payment_id).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update payment: {e}")
    if not result.data:
        raise HTTPException(status_code=404, detail="Payment not found")
    return result.data[0]

@router.get("/summary/overview")
def payment_summary(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    custs = client.table("Customers").select("customer_id").eq("tailor_id", user["tailor_id"]).execute()
    cids = [c["customer_id"] for c in (custs.data or [])]
    if not cids: return {"total_revenue": 0, "collected": 0, "pending_dues": 0, "orders_count": 0}
    orders = client.table("Orders").select("order_id").in_("customer_id", cids).execute()
    oids = [o["order_id"] for o in (orders.data or [])]
    if not oids: return {"total_revenue": 0, "collected": 0, "pending_dues": 0, "orders_count": 0}
    payments = client.table("Payments").select("total_amount, advance_amount, remaining_amount").in_("order_id", oids).execute()
    return {
        "total_revenue": sum(p["total_amount"] for p in (payments.data or [])),
        "collected": sum(p["advance_amount"] for p in (payments.data or [])),
        "pending_dues": sum(p["remaining_amount"] or 0 for p in (payments.data or [])),
        "orders_count": len(oids)
    }
