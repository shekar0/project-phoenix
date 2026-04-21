"""LangGraph state definition for the generation pipeline."""

from typing import TypedDict, Literal, Optional


class GenerationState(TypedDict, total=False):
    """State object passed through the LangGraph agent pipeline."""

    # User input
    prompt: str
    style: str
    resolution: str
    aspect_ratio: str
    type: Literal["image", "video"]
    user_id: str

    # Pipeline state
    enhanced_prompt: str
    final_prompt: str
    output_url: str
    error: Optional[str]
    quality_score: Optional[float]
    job_id: Optional[str]
    status: Optional[str]
    retry_count: int
