from fastapi import APIRouter, HTTPException, Depends
from app.schemas.customers import CustomerCreate, CustomerUpdate, CustomerResponse
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from typing import List

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse)
def create_customer(body: CustomerCreate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    payload = body.model_dump()
    payload["tailor_id"] = user["tailor_id"]
    result = client.table("Customers").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create customer")
    return result.data[0]


@router.get("/", response_model=List[CustomerResponse])
def list_customers(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    result = client.table("Customers").select("*").eq("tailor_id", user["tailor_id"]).order("created_at", desc=True).execute()
    return result.data or []


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    result = client.table("Customers").select("*").eq("customer_id", customer_id).eq("tailor_id", user["tailor_id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return result.data


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: str, body: CustomerUpdate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = client.table("Customers").update(updates).eq("customer_id", customer_id).eq("tailor_id", user["tailor_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Customer not found or not yours")
    return result.data[0]


@router.delete("/{customer_id}")
def delete_customer(customer_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    client.table("Customers").delete().eq("customer_id", customer_id).eq("tailor_id", user["tailor_id"]).execute()
    return {"message": "Customer deleted successfully"}


@router.get("/{customer_id}/orders")
def get_customer_order_history(customer_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    cust = client.table("Customers").select("customer_id").eq("customer_id", customer_id).eq("tailor_id", user["tailor_id"]).single().execute()
    if not cust.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    orders = client.table("Orders").select("*, Payments(*)").eq("customer_id", customer_id).order("created_at", desc=True).execute()
    return {"customer_id": customer_id, "orders": orders.data or []}
