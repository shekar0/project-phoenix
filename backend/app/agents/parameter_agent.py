"""Parameter Agent — injects resolution and aspect-ratio into the final prompt."""

from app.models.state import GenerationState


def parameter_agent(state: GenerationState) -> dict:
    """Build the *final_prompt* by appending technical parameters."""
    if state.get("error"):
        return {}

    base = state.get("enhanced_prompt") or state.get("prompt", "")
    resolution = state.get("resolution", "")
    aspect_ratio = state.get("aspect_ratio", "")

    parts = [base]
    if resolution:
        parts.append(f"resolution {resolution}")
    if aspect_ratio:
        parts.append(f"aspect ratio {aspect_ratio}")
    parts.append("ultra detailed, high quality")

    return {"final_prompt": ", ".join(parts)}
