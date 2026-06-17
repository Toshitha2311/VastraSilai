from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.dependencies import get_current_tailor
from app.supabase_client import supabase

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class CustomerCard(BaseModel):
    customer_id: int
    customer_name: str
    phone: Optional[str] = None
    order_id: Optional[int] = None
    cloth_type: Optional[str] = None
    order_status: Optional[str] = None
    delivery_date: Optional[date] = None
    total_amount: Optional[float] = None
    advance_amount: Optional[float] = None
    remaining_amount: Optional[float] = None
    payment_status: Optional[str] = None


def _build_customer_cards(tailor_id: int) -> List[CustomerCard]:
    customers_result = supabase.table("customers").select("*").eq("tailor_id", tailor_id).execute()
    customers = customers_result.data
    if not customers:
        return []

    customer_ids = [c["customer_id"] for c in customers]

    orders_result = (
        supabase.table("orders")
        .select("*")
        .in_("customer_id", customer_ids)
        .order("created_at", desc=True)
        .execute()
    )
    # Keep only the most recent order per customer (results are already
    # newest-first, so the first one seen per customer_id wins).
    orders_by_customer = {}
    for order in orders_result.data:
        orders_by_customer.setdefault(order["customer_id"], order)

    order_ids = [o["order_id"] for o in orders_result.data]
    payments_by_order = {}
    if order_ids:
        payments_result = (
            supabase.table("payments")
            .select("*")
            .in_("order_id", order_ids)
            .order("created_at", desc=True)
            .execute()
        )
        for payment in payments_result.data:
            payments_by_order.setdefault(payment["order_id"], payment)

    cards: List[CustomerCard] = []
    for customer in customers:
        order = orders_by_customer.get(customer["customer_id"])
        payment = payments_by_order.get(order["order_id"]) if order else None
        cards.append(
            CustomerCard(
                customer_id=customer["customer_id"],
                customer_name=customer["customer_name"],
                phone=customer.get("phone"),
                order_id=order["order_id"] if order else None,
                cloth_type=order["cloth_type"] if order else None,
                order_status=order["status"] if order else None,
                delivery_date=order["delivery_date"] if order else None,
                total_amount=payment["total_amount"] if payment else None,
                advance_amount=payment["advance_amount"] if payment else None,
                remaining_amount=payment["remaining_amount"] if payment else None,
                payment_status=payment["payment_status"] if payment else None,
            )
        )
    return cards


@router.get("/cards", response_model=List[CustomerCard])
def get_customer_cards(current_tailor: dict = Depends(get_current_tailor)):
    """All customers with their latest order + payment info, for the main dashboard view."""
    return _build_customer_cards(current_tailor["tailor_id"])


@router.get("/paid", response_model=List[CustomerCard])
def get_paid_customers(current_tailor: dict = Depends(get_current_tailor)):
    cards = _build_customer_cards(current_tailor["tailor_id"])
    return [c for c in cards if c.payment_status == "PAID"]


@router.get("/unpaid", response_model=List[CustomerCard])
def get_unpaid_customers(current_tailor: dict = Depends(get_current_tailor)):
    cards = _build_customer_cards(current_tailor["tailor_id"])
    return [c for c in cards if c.payment_status == "UNPAID"]


@router.get("/partial", response_model=List[CustomerCard])
def get_partial_customers(current_tailor: dict = Depends(get_current_tailor)):
    cards = _build_customer_cards(current_tailor["tailor_id"])
    return [c for c in cards if c.payment_status == "PARTIAL"]


@router.get("/due-soon", response_model=List[CustomerCard])
def get_due_soon_customers(
    days: int = Query(3, ge=0, description="Window size in days counted as 'due soon'"),
    current_tailor: dict = Depends(get_current_tailor),
):
    today = date.today()
    cutoff = today + timedelta(days=days)
    cards = _build_customer_cards(current_tailor["tailor_id"])
    return [c for c in cards if c.delivery_date is not None and today <= c.delivery_date <= cutoff]


@router.get("/search", response_model=List[CustomerCard])
def search_dashboard(
    q: str = Query(..., min_length=1),
    current_tailor: dict = Depends(get_current_tailor),
):
    cards = _build_customer_cards(current_tailor["tailor_id"])
    q_lower = q.lower()
    return [
        c
        for c in cards
        if q_lower in c.customer_name.lower() or (c.phone and q_lower in c.phone.lower())
    ]
