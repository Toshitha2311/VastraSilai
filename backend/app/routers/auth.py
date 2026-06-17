from fastapi import APIRouter, HTTPException
from app.schemas.auth import LoginRequest, LoginResponse
from app.supabase_client import supabase

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):

    try:
        # Authenticate user
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if response.user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        user_id = response.user.id

        # Fetch tailor profile
        tailor = (
            supabase.table("TAILORS")
            .select("*")
            .eq("auth_user_id", user_id)
            .execute()
        )

        if len(tailor.data) == 0:
            raise HTTPException(
                status_code=404,
                detail="Tailor profile not found"
            )

        tailor = tailor.data[0]

        return LoginResponse(
            access_token=response.session.access_token,
            token_type="Bearer",
            tailor_id=tailor["tailor_id"],
            name=tailor["name"],
            email=tailor["email"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )