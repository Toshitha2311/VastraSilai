from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.supabase_client import supabase, get_user_client

# This adds the 🔒 "Authorize" button to Swagger UI
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency that validates the Bearer token and returns (tailor_id, token).
    Use this in any endpoint that needs authentication.
    """
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        if user.user is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        auth_user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

    client = get_user_client(token)
    result = (
        client.table("Tailors")
        .select("tailor_id")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Tailor profile not found")

    return {"tailor_id": result.data["tailor_id"], "token": token}
