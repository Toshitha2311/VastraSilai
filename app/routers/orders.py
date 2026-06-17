from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_tailor, get_owned_customer, get_owned_order
from app.schemas.orders import OrderCreate, OrderResponse, OrderUpdate
from app.supabase_client import supabase

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, current_tailor: dict = Depends(get_current_tailor)):
    get_owned_customer(payload.customer_id, current_tailor["tailor_id"])

    try:
        result = (
            supabase.table("orders")
            .insert(
                {
                    "customer_id": payload.customer_id,
                    "cloth_type": payload.cloth_type,
                    "delivery_date": (
                        payload.delivery_date.isoformat() if payload.delivery_date else None
                    ),
                    "status": payload.status.value,
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create order"
        )
    return result.data[0]


@router.get("/", response_model=List[OrderResponse])
def list_orders(current_tailor: dict = Depends(get_current_tailor)):
    customers_result = (
        supabase.table("customers")
        .select("customer_id")
        .eq("tailor_id", current_tailor["tailor_id"])
        .execute()
    )
    customer_ids = [c["customer_id"] for c in customers_result.data]
    if not customer_ids:
        return []

    result = (
        supabase.table("orders")
        .select("*")
        .in_("customer_id", customer_ids)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, current_tailor: dict = Depends(get_current_tailor)):
    return get_owned_order(order_id, current_tailor["tailor_id"])


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int, payload: OrderUpdate, current_tailor: dict = Depends(get_current_tailor)
):
    get_owned_order(order_id, current_tailor["tailor_id"])

    updates = payload.model_dump(exclude_unset=True)
    if updates.get("delivery_date") is not None:
        updates["delivery_date"] = updates["delivery_date"].isoformat()
    if updates.get("status") is not None:
        updates["status"] = updates["status"].value
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    result = supabase.table("orders").update(updates).eq("order_id", order_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return result.data[0]


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, current_tailor: dict = Depends(get_current_tailor)):
    get_owned_order(order_id, current_tailor["tailor_id"])
    supabase.table("orders").delete().eq("order_id", order_id).execute()
    return None
