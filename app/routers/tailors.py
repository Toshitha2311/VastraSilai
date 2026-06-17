from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_tailor
from app.schemas.tailors import TailorResponse, TailorUpdate
from app.supabase_client import supabase, supabase_admin

router = APIRouter(prefix="/tailors", tags=["Tailors"])


@router.get("/me", response_model=TailorResponse)
def get_my_profile(current_tailor: dict = Depends(get_current_tailor)):
    return current_tailor


@router.put("/me", response_model=TailorResponse)
def update_my_profile(payload: TailorUpdate, current_tailor: dict = Depends(get_current_tailor)):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    try:
        result = (
            supabase.table("tailors")
            .update(updates)
            .eq("tailor_id", current_tailor["tailor_id"])
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tailor not found")

    return result.data[0]


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(current_tailor: dict = Depends(get_current_tailor)):
    try:
        supabase.table("tailors").delete().eq("tailor_id", current_tailor["tailor_id"]).execute()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    # Best-effort: also remove the underlying Supabase Auth user.
    # Requires SUPABASE_SERVICE_KEY to be set; silently skipped otherwise.
    if supabase_admin is not None:
        try:
            supabase_admin.auth.admin.delete_user(current_tailor["auth_user_id"])
        except Exception:
            pass

    return None
