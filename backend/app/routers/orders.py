from fastapi import APIRouter, HTTPException, Depends
from app.schemas.orders import OrderCreate, OrderUpdate, OrderResponse
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from typing import List

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse)
def create_order(body: OrderCreate, user=Depends(get_current_user)):
    """Create an order only for a customer owned by the authenticated tailor."""
    client = get_user_client(user["token"])
    cust = client.table("Customers").select("customer_id").eq("customer_id", body.customer_id).eq("tailor_id", user["tailor_id"]).single().execute()
    if not cust.data:
        raise HTTPException(status_code=403, detail="Customer not found")
    payload = body.model_dump()
    if payload.get("delivery_date"):
        payload["delivery_date"] = str(payload["delivery_date"])
    result = client.table("Orders").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create order")
    return result.data[0]

@router.get("/", response_model=List[OrderResponse])
def list_orders(user=Depends(get_current_user), status: str = None):
    """List orders for the authenticated tailor, optionally filtered by status."""
    client = get_user_client(user["token"])
    custs = client.table("Customers").select("customer_id").eq("tailor_id", user["tailor_id"]).execute()
    cids = [c["customer_id"] for c in (custs.data or [])]
    if not cids:
        return []
    q = client.table("Orders").select("*").in_("customer_id", cids).order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    return q.execute().data or []

@router.get("/delivery-schedule")
def delivery_schedule(user=Depends(get_current_user)):
    """Return upcoming deliveries for the authenticated tailor's customers."""
    client = get_user_client(user["token"])
    custs = client.table("Customers").select("customer_id").eq("tailor_id", user["tailor_id"]).execute()
    cids = [c["customer_id"] for c in (custs.data or [])]
    if not cids:
        return {"schedule": []}
    result = client.table("Orders").select("order_id, cloth_type, delivery_date, status, Customers(customer_name, phone)").in_("customer_id", cids).not_.is_("delivery_date", "null").in_("status", ["pending", "in_progress"]).order("delivery_date").execute()
    return {"schedule": result.data or []}

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    try:
        result = client.table("Orders").select("*").eq("order_id", order_id).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Order not found")
    if not result.data: raise HTTPException(status_code=404, detail="Order not found")
    return result.data

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: str, body: OrderUpdate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates.get("delivery_date"): updates["delivery_date"] = str(updates["delivery_date"])
    if not updates: raise HTTPException(status_code=400, detail="No fields to update")
    result = client.table("Orders").update(updates).eq("order_id", order_id).execute()
    if not result.data: raise HTTPException(status_code=404, detail="Order not found")
    return result.data[0]

@router.delete("/{order_id}")
def delete_order(order_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    client.table("Orders").delete().eq("order_id", order_id).execute()
    return {"message": "Order deleted successfully"}
