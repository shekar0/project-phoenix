"""Safety Agent — rejects unsafe prompts before generation."""

from app.models.state import GenerationState
from app.services.gemini_service import get_gemini_service


async def safety_agent(state: GenerationState) -> dict:
    """Run a safety check on *final_prompt*. Sets error state if unsafe."""
    if state.get("error"):
        return {}

    final_prompt = state.get("final_prompt", "")

    try:
        gemini = get_gemini_service()
        result = await gemini.check_safety(final_prompt)
        if not result["safe"]:
            return {
                "error": f"Prompt rejected: {result['reason']}",
                "status": "rejected",
            }
        return {"status": "safe"}
    except Exception:
        # Fail-open: allow generation if the safety check itself errors
        return {"status": "safe"}
