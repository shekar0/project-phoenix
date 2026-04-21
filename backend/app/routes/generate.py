"""Generation endpoints — image and video creation via the agent pipeline."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.graph.workflow import generation_graph
from app.services.supabase_service import get_supabase_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/generate", tags=["generation"])


# ── Request / Response schemas ────────────────────────────────


class GenerateRequest(BaseModel):
    prompt: str
    style: Optional[str] = ""
    resolution: Optional[str] = "1024x1024"
    aspect_ratio: Optional[str] = "1:1"


class GenerateResponse(BaseModel):
    output_url: Optional[str] = None
    job_id: Optional[str] = None
    status: str
    error: Optional[str] = None
    quality_score: Optional[float] = None


# ── Helpers ───────────────────────────────────────────────────


def _initial_state(req: GenerateRequest, gen_type: str, user_id: str) -> dict:
    return {
        "prompt": req.prompt,
        "style": req.style or "",
        "resolution": req.resolution or ("1024x1024" if gen_type == "image" else "1920x1080"),
        "aspect_ratio": req.aspect_ratio or ("1:1" if gen_type == "image" else "16:9"),
        "type": gen_type,
        "user_id": user_id,
        "enhanced_prompt": "",
        "final_prompt": "",
        "output_url": "",
        "error": None,
        "quality_score": None,
        "job_id": None,
        "status": "pending",
        "retry_count": 0,
    }


async def _run_pipeline(req: GenerateRequest, gen_type: str, user_id: str) -> GenerateResponse:
    try:
        state = _initial_state(req, gen_type, user_id)
        result = await generation_graph.ainvoke(state)

        if result.get("error"):
            raise HTTPException(status_code=400, detail=result["error"])

        # Persist to Supabase
        svc = get_supabase_service()
        svc.save_generation(
            user_id=user_id,
            prompt=req.prompt,
            style=req.style or "",
            resolution=req.resolution or "1024x1024",
            aspect_ratio=req.aspect_ratio or "1:1",
            gen_type=gen_type,
            output_url=result.get("output_url", ""),
        )

        return GenerateResponse(
            output_url=result.get("output_url"),
            job_id=result.get("job_id"),
            status=result.get("status", "completed"),
            quality_score=result.get("quality_score"),
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed internally: {str(e)}")


# ── Endpoints ─────────────────────────────────────────────────


@router.post("/image", response_model=GenerateResponse)
async def generate_image(
    request: GenerateRequest,
    user_id: str = Depends(get_current_user),
):
    """Generate an image using the agentic pipeline."""
    return await _run_pipeline(request, "image", user_id)


@router.post("/video", response_model=GenerateResponse)
async def generate_video(
    request: GenerateRequest,
    user_id: str = Depends(get_current_user),
):
    """Start an async video generation job."""
    return await _run_pipeline(request, "video", user_id)
