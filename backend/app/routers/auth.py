from fastapi import APIRouter, HTTPException
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.supabase_client import supabase

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -------------------------
# REGISTER
# -------------------------

@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest):

    try:

        auth = supabase.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
            }
        )

        if auth.user is None:
            raise HTTPException(
                status_code=400,
                detail="Registration failed"
            )

        user_id = auth.user.id

        supabase.table("TAILORS").insert(
            {
                "auth_user_id": user_id,
                "name": request.name,
                "phone": request.phone,
                "email": request.email,
                "shop_name": request.shop_name,
                "address": request.address,
            }
        ).execute()

        return {
            "message": "Registration Successful"
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# -------------------------
# LOGIN
# -------------------------

@router.post("/login")
def login(request: LoginRequest):

    try:

        auth = supabase.auth.sign_in_with_password(
            {
                "email": request.email,
                "password": request.password,
            }
        )

        if auth.user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        tailor = (
            supabase.table("TAILORS")
            .select("*")
            .eq("auth_user_id", auth.user.id)
            .execute()
        )

        if len(tailor.data) == 0:
            raise HTTPException(
                status_code=404,
                detail="Tailor profile not found"
            )

        tailor = tailor.data[0]

        return {
            "message": "Login Successful",
            "access_token": auth.session.access_token,
            "tailor": tailor
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )