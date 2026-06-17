from typing import List, Tuple

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_tailor, get_owned_order, get_owned_payment
from app.schemas.payments import PaymentCreate, PaymentResponse, PaymentStatus, PaymentUpdate
from app.supabase_client import supabase

router = APIRouter(prefix="/payments", tags=["Payments"])


def _compute_status(total: float, advance: float) -> Tuple[float, str]:
    remaining = round(total - advance, 2)
    if remaining <= 0:
        return 0.0, PaymentStatus.PAID.value
    if advance > 0:
        return remaining, PaymentStatus.PARTIAL.value
    return remaining, PaymentStatus.UNPAID.value


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, current_tailor: dict = Depends(get_current_tailor)):
    get_owned_order(payload.order_id, current_tailor["tailor_id"])

    remaining, payment_status = _compute_status(payload.total_amount, payload.advance_amount)

    try:
        result = (
            supabase.table("payments")
            .insert(
                {
                    "order_id": payload.order_id,
                    "total_amount": payload.total_amount,
                    "advance_amount": payload.advance_amount,
                    "remaining_amount": remaining,
                    "payment_status": payment_status,
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create payment"
        )
    return result.data[0]


@router.get("/", response_model=List[PaymentResponse])
def list_payments(current_tailor: dict = Depends(get_current_tailor)):
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
        supabase.table("payments")
        .select("*")
        .in_("order_id", order_ids)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, current_tailor: dict = Depends(get_current_tailor)):
    return get_owned_payment(payment_id, current_tailor["tailor_id"])


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int, payload: PaymentUpdate, current_tailor: dict = Depends(get_current_tailor)
):
    payment = get_owned_payment(payment_id, current_tailor["tailor_id"])

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    total = updates.get("total_amount", payment["total_amount"])
    advance = updates.get("advance_amount", payment["advance_amount"])
    remaining, payment_status = _compute_status(total, advance)
    updates["remaining_amount"] = remaining
    updates["payment_status"] = payment_status

    result = supabase.table("payments").update(updates).eq("payment_id", payment_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return result.data[0]
