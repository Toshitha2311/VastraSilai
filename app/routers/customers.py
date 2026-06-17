from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_tailor
from app.schemas.customers import CustomerCreate, CustomerResponse, CustomerUpdate
from app.supabase_client import supabase

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, current_tailor: dict = Depends(get_current_tailor)):
    try:
        result = (
            supabase.table("customers")
            .insert(
                {
                    "tailor_id": current_tailor["tailor_id"],
                    "customer_name": payload.customer_name,
                    "phone": payload.phone,
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create customer"
        )
    return result.data[0]


@router.get("/", response_model=List[CustomerResponse])
def list_customers(current_tailor: dict = Depends(get_current_tailor)):
    try:
        result = (
            supabase.table("customers")
            .select("*")
            .eq("tailor_id", current_tailor["tailor_id"])
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return result.data


# NOTE: this route must be declared before "/{customer_id}" or FastAPI
# will try to parse "search" as a customer_id and fail.
@router.get("/search", response_model=List[CustomerResponse])
def search_customers(
    q: str = Query(..., min_length=1, description="Search by customer name or phone"),
    current_tailor: dict = Depends(get_current_tailor),
):
    try:
        result = (
            supabase.table("customers")
            .select("*")
            .eq("tailor_id", current_tailor["tailor_id"])
            .or_(f"customer_name.ilike.%{q}%,phone.ilike.%{q}%")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return result.data


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, current_tailor: dict = Depends(get_current_tailor)):
    result = (
        supabase.table("customers")
        .select("*")
        .eq("customer_id", customer_id)
        .eq("tailor_id", current_tailor["tailor_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return result.data[0]


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int, payload: CustomerUpdate, current_tailor: dict = Depends(get_current_tailor)
):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    result = (
        supabase.table("customers")
        .update(updates)
        .eq("customer_id", customer_id)
        .eq("tailor_id", current_tailor["tailor_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return result.data[0]


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, current_tailor: dict = Depends(get_current_tailor)):
    result = (
        supabase.table("customers")
        .delete()
        .eq("customer_id", customer_id)
        .eq("tailor_id", current_tailor["tailor_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return None
