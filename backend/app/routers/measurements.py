from fastapi import APIRouter, HTTPException, Depends
from app.schemas.measurements import MeasurementCreate, MeasurementUpdate, MeasurementResponse
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from typing import List

router = APIRouter(prefix="/measurements", tags=["Measurements"])


def verify_customer(customer_id, tailor_id, client):
    r = client.table("Customers").select("customer_id").eq("customer_id", customer_id).eq("tailor_id", tailor_id).single().execute()
    if not r.data: raise HTTPException(status_code=403, detail="Customer not found or access denied")


@router.post("/", response_model=MeasurementResponse)
def add_measurement(body: MeasurementCreate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    verify_customer(body.customer_id, user["tailor_id"], client)
    result = client.table("Measurements").insert(body.model_dump()).execute()
    if not result.data: raise HTTPException(status_code=400, detail="Failed to save measurement")
    return result.data[0]

@router.get("/customer/{customer_id}", response_model=List[MeasurementResponse])
def list_measurements(customer_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    verify_customer(customer_id, user["tailor_id"], client)
    return (client.table("Measurements").select("*").eq("customer_id", customer_id).order("recorded_at", desc=True).execute()).data or []

@router.get("/customer/{customer_id}/latest", response_model=MeasurementResponse)
def get_latest_measurement(customer_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    verify_customer(customer_id, user["tailor_id"], client)
    r = client.table("Measurements").select("*").eq("customer_id", customer_id).order("recorded_at", desc=True).limit(1).execute()
    if not r.data: raise HTTPException(status_code=404, detail="No measurements found")
    return r.data[0]

@router.put("/{measurement_id}", response_model=MeasurementResponse)
def update_measurement(measurement_id: str, body: MeasurementUpdate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates: raise HTTPException(status_code=400, detail="No fields to update")
    result = client.table("Measurements").update(updates).eq("measurement_id", measurement_id).execute()
    if not result.data: raise HTTPException(status_code=404, detail="Measurement not found")
    return result.data[0]

@router.delete("/{measurement_id}")
def delete_measurement(measurement_id: str, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    client.table("Measurements").delete().eq("measurement_id", measurement_id).execute()
    return {"message": "Measurement deleted successfully"}
