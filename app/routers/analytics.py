from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies import get_current_tailor
from app.supabase_client import supabase

router = APIRouter(prefix="/analytics", tags=["Analytics"])


class CountResponse(BaseModel):
    count: int


class PaymentSummaryResponse(BaseModel):
    paid: int
    partial: int
    unpaid: int
    total_payments: int


class RevenueSummaryResponse(BaseModel):
    total_revenue: float
    total_collected: float
    total_outstanding: float


def _customer_ids_for_tailor(tailor_id: int) -> List[int]:
    result = supabase.table("customers").select("customer_id").eq("tailor_id", tailor_id).execute()
    return [c["customer_id"] for c in result.data]


def _order_ids_for_customers(customer_ids: List[int]) -> List[int]:
    if not customer_ids:
        return []
    result = supabase.table("orders").select("order_id").in_("customer_id", customer_ids).execute()
    return [o["order_id"] for o in result.data]


@router.get("/customers/count", response_model=CountResponse)
def customer_count(current_tailor: dict = Depends(get_current_tailor)):
    result = (
        supabase.table("customers")
        .select("customer_id", count="exact")
        .eq("tailor_id", current_tailor["tailor_id"])
        .execute()
    )
    return CountResponse(count=result.count or 0)


@router.get("/orders/count", response_model=CountResponse)
def order_count(current_tailor: dict = Depends(get_current_tailor)):
    customer_ids = _customer_ids_for_tailor(current_tailor["tailor_id"])
    if not customer_ids:
        return CountResponse(count=0)

    result = (
        supabase.table("orders").select("order_id", count="exact").in_("customer_id", customer_ids).execute()
    )
    return CountResponse(count=result.count or 0)


@router.get("/payments/summary", response_model=PaymentSummaryResponse)
def payment_summary(current_tailor: dict = Depends(get_current_tailor)):
    customer_ids = _customer_ids_for_tailor(current_tailor["tailor_id"])
    order_ids = _order_ids_for_customers(customer_ids)
    if not order_ids:
        return PaymentSummaryResponse(paid=0, partial=0, unpaid=0, total_payments=0)

    result = supabase.table("payments").select("payment_status").in_("order_id", order_ids).execute()
    statuses = [p["payment_status"] for p in result.data]
    return PaymentSummaryResponse(
        paid=statuses.count("PAID"),
        partial=statuses.count("PARTIAL"),
        unpaid=statuses.count("UNPAID"),
        total_payments=len(statuses),
    )


@router.get("/revenue/summary", response_model=RevenueSummaryResponse)
def revenue_summary(current_tailor: dict = Depends(get_current_tailor)):
    customer_ids = _customer_ids_for_tailor(current_tailor["tailor_id"])
    order_ids = _order_ids_for_customers(customer_ids)
    if not order_ids:
        return RevenueSummaryResponse(total_revenue=0, total_collected=0, total_outstanding=0)

    result = (
        supabase.table("payments")
        .select("total_amount, advance_amount, remaining_amount")
        .in_("order_id", order_ids)
        .execute()
    )
    total_revenue = sum(p["total_amount"] or 0 for p in result.data)
    total_outstanding = sum(p["remaining_amount"] or 0 for p in result.data)
    total_collected = total_revenue - total_outstanding

    return RevenueSummaryResponse(
        total_revenue=round(total_revenue, 2),
        total_collected=round(total_collected, 2),
        total_outstanding=round(total_outstanding, 2),
    )
