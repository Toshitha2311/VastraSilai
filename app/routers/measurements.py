from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_tailor, get_owned_customer, get_owned_measurement
from app.schemas.measurements import MeasurementCreate, MeasurementResponse, MeasurementUpdate
from app.supabase_client import supabase

router = APIRouter(prefix="/measurements", tags=["Measurements"])


@router.post("/", response_model=MeasurementResponse, status_code=status.HTTP_201_CREATED)
def create_measurement(
    payload: MeasurementCreate, current_tailor: dict = Depends(get_current_tailor)
):
    get_owned_customer(payload.customer_id, current_tailor["tailor_id"])

    try:
        result = (
            supabase.table("measurements")
            .insert(
                {
                    "customer_id": payload.customer_id,
                    "chest": payload.chest,
                    "waist": payload.waist,
                    "shoulder": payload.shoulder,
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create measurement"
        )
    return result.data[0]


@router.get("/{customer_id}", response_model=List[MeasurementResponse])
def get_measurements(customer_id: int, current_tailor: dict = Depends(get_current_tailor)):
    get_owned_customer(customer_id, current_tailor["tailor_id"])

    result = (
        supabase.table("measurements")
        .select("*")
        .eq("customer_id", customer_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.put("/{measurement_id}", response_model=MeasurementResponse)
def update_measurement(
    measurement_id: int,
    payload: MeasurementUpdate,
    current_tailor: dict = Depends(get_current_tailor),
):
    get_owned_measurement(measurement_id, current_tailor["tailor_id"])

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    result = (
        supabase.table("measurements").update(updates).eq("measurement_id", measurement_id).execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Measurement not found")
    return result.data[0]


@router.delete("/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement(measurement_id: int, current_tailor: dict = Depends(get_current_tailor)):
    get_owned_measurement(measurement_id, current_tailor["tailor_id"])

    supabase.table("measurements").delete().eq("measurement_id", measurement_id).execute()
    return None
