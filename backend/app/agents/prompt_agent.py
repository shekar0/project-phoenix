"""Prompt Enhancer Agent — uses Gemini LLM to improve prompt quality."""

from app.models.state import GenerationState
from app.services.gemini_service import get_gemini_service


async def prompt_agent(state: GenerationState) -> dict:
    """Enhance the raw user prompt for higher-quality generation."""
    if state.get("error"):
        return {}

    prompt = state.get("prompt", "")
    if not prompt:
        return {"error": "No prompt provided"}

    try:
        gemini = get_gemini_service()
        enhanced = await gemini.enhance_prompt(prompt)
        return {"enhanced_prompt": enhanced}
    except Exception:
        # If enhancement fails, fall back to the original prompt
        return {"enhanced_prompt": prompt}
