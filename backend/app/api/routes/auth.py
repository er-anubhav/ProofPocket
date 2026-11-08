from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "authenticated": True,
    }
