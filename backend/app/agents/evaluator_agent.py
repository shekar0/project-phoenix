"""Evaluator Agent — scores generation quality and optionally triggers a retry."""

from app.models.state import GenerationState
from app.services.gemini_service import get_gemini_service


async def evaluator_agent(state: GenerationState) -> dict:
    """Evaluate quality of the generated output. Low scores may trigger retry."""
    if state.get("error"):
        return {}

    # Videos that are still processing can't be evaluated yet
    if state.get("type") == "video" and state.get("status") == "processing":
        return {"quality_score": 0.0}

    output_url = state.get("output_url", "")
    if not output_url:
        return {"quality_score": 0.0}

    try:
        gemini = get_gemini_service()
        score = await gemini.evaluate_quality(
            state.get("final_prompt", ""), output_url
        )
        retry_count = state.get("retry_count", 0)
        return {
            "quality_score": score,
            "retry_count": retry_count + 1,
        }
    except Exception:
        return {"quality_score": 0.5, "retry_count": state.get("retry_count", 0) + 1}
