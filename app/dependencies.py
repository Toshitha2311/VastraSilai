"""
Shared FastAPI dependencies.

This file is the one addition to the original folder structure: a single
place for (a) verifying the Supabase Auth bearer token and resolving the
calling tailor, and (b) checking that a nested resource (customer / order /
measurement / payment) actually belongs to that tailor before any router
reads or mutates it. Keeping this logic here avoids duplicating the same
checks across customers.py, orders.py, measurements.py, payments.py, and
notifications.py.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.supabase_client import supabase

bearer_scheme = HTTPBearer()


def get_current_tailor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates the Supabase Auth access token sent as:
        Authorization: Bearer <access_token>
    and returns the matching row from the `tailors` table.
    """
    token = credentials.credentials

    try:
        user_response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = getattr(user_response, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    try:
        result = (
            supabase.table("tailors")
            .select("*")
            .eq("auth_user_id", user.id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load tailor profile: {exc}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tailor profile not found for this account",
        )

    return result.data[0]


def get_owned_customer(customer_id: int, tailor_id: int) -> dict:
    """Returns the customer row, only if it belongs to this tailor."""
    result = (
        supabase.table("customers")
        .select("*")
        .eq("customer_id", customer_id)
        .eq("tailor_id", tailor_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return result.data[0]


def get_owned_order(order_id: int, tailor_id: int) -> dict:
    """Returns the order row, only if its customer belongs to this tailor."""
    order_result = supabase.table("orders").select("*").eq("order_id", order_id).execute()
    if not order_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order = order_result.data[0]
    get_owned_customer(order["customer_id"], tailor_id)  # raises 404 if not owned
    return order


def get_owned_measurement(measurement_id: int, tailor_id: int) -> dict:
    """Returns the measurement row, only if its customer belongs to this tailor."""
    result = (
        supabase.table("measurements").select("*").eq("measurement_id", measurement_id).execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Measurement not found")

    measurement = result.data[0]
    get_owned_customer(measurement["customer_id"], tailor_id)
    return measurement


def get_owned_payment(payment_id: int, tailor_id: int) -> dict:
    """Returns the payment row, only if its order belongs to this tailor."""
    result = supabase.table("payments").select("*").eq("payment_id", payment_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    payment = result.data[0]
    get_owned_order(payment["order_id"], tailor_id)
    return payment
