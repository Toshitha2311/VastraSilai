from fastapi import APIRouter, HTTPException, Depends
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/tailors", tags=["Tailors"])


class TailorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    shop_name: Optional[str] = None
    address: Optional[str] = None
    language: Optional[str] = None


@router.get("/me")
def get_my_profile(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    result = client.table("Tailors").select("*").eq("tailor_id", user["tailor_id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Tailor profile not found")
    return result.data


@router.put("/me")
def update_my_profile(body: TailorUpdate, user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = client.table("Tailors").update(updates).eq("tailor_id", user["tailor_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Update failed")
    return {"message": "Profile updated", "tailor": result.data[0]}


@router.put("/me/language")
def set_language(language: str, user=Depends(get_current_user)):
    SUPPORTED = ["en", "hi", "ta", "te", "mr", "bn", "kn", "gu", "pa"]
    if language not in SUPPORTED:
        raise HTTPException(status_code=400, detail=f"Language '{language}' not supported. Choose from: {SUPPORTED}")
    client = get_user_client(user["token"])
    client.table("Tailors").update({"language": language}).eq("tailor_id", user["tailor_id"]).execute()
    return {"message": f"Language set to '{language}' successfully"}
