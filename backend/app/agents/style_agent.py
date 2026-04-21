"""Style Agent — appends the chosen artistic style to the enhanced prompt."""

from app.models.state import GenerationState

# Canonical style descriptors (mapped from short labels)
STYLE_MAP: dict[str, str] = {
    "Photorealistic": "photorealistic, ultra realistic photograph, natural lighting",
    "Digital Art": "digital art, vibrant colors, detailed illustration",
    "Anime": "anime style, cel-shaded, Japanese animation aesthetic",
    "Oil Painting": "oil painting, textured brush strokes, fine art",
    "3D Render": "3D render, octane render, volumetric lighting, ray-traced",
    "Watercolor": "watercolor painting, soft edges, translucent pigments",
}


def style_agent(state: GenerationState) -> dict:
    """Merge the user-selected style into the enhanced prompt."""
    if state.get("error"):
        return {}

    base = state.get("enhanced_prompt") or state.get("prompt", "")
    style = state.get("style", "")

    if style:
        descriptor = STYLE_MAP.get(style, style)
        return {"enhanced_prompt": f"{base}, {descriptor}"}

    return {"enhanced_prompt": base}
