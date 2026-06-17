from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    # 1. Create the Supabase Auth user.
    try:
        auth_response = supabase.auth.sign_up(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create auth user: {exc}",
        )

    user = getattr(auth_response, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. The email may already be in use.",
        )

    # 2. Insert the tailor profile, linked to the new auth user.
    try:
        insert_result = (
            supabase.table("tailors")
            .insert(
                {
                    "auth_user_id": user.id,
                    "name": payload.name,
                    "phone": payload.phone,
                    "email": payload.email,
                    "shop_name": payload.shop_name,
                    "address": payload.address,
                }
            )
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Auth user was created but the tailor profile could not be saved. "
                f"Please contact support. Details: {exc}"
            ),
        )

    if not insert_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Tailor profile could not be created.",
        )

    tailor = insert_result.data[0]
    return RegisterResponse(
        message="Tailor registered successfully",
        tailor_id=tailor["tailor_id"],
        email=tailor["email"],
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    session = getattr(auth_response, "session", None)
    user = getattr(auth_response, "user", None)
    if session is None or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    result = supabase.table("tailors").select("*").eq("auth_user_id", user.id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tailor profile not found for this account",
        )

    tailor = result.data[0]
    return LoginResponse(
        access_token=session.access_token,
        token_type="bearer",
        tailor_id=tailor["tailor_id"],
        name=tailor["name"],
        email=tailor["email"],
    )
