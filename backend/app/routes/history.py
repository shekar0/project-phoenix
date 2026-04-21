"""History endpoint — returns the authenticated user's generation history."""

from fastapi import APIRouter, Depends

from app.services.supabase_service import get_supabase_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
async def get_history(user_id: str = Depends(get_current_user)):
    """Return all past generations for the current user, newest first."""
    svc = get_supabase_service()
    history = svc.get_user_history(user_id)
    return {"data": history}
