"""Generator Agent — calls the appropriate Gemini model (image or video)."""

import base64
import uuid

from app.models.state import GenerationState
from app.services.gemini_service import get_gemini_service
from app.services.supabase_service import get_supabase_service


async def generator_agent(state: GenerationState) -> dict:
    """Generate content via the correct model and upload to Supabase Storage.

    Falls back to a base64 data-URL if Supabase Storage bucket is unavailable.
    """
    if state.get("error"):
        return {}

    final_prompt = state.get("final_prompt", "")
    gen_type = state.get("type", "image")
    user_id = state.get("user_id", "anonymous")

    gemini = get_gemini_service()
    supabase = get_supabase_service()

    try:
        if gen_type == "image":
            image_bytes = await gemini.generate_image(final_prompt)

            # Try uploading to Supabase Storage; fall back to base64 data URL
            # if the bucket does not exist yet.
            output_url: str = ""
            try:
                filename = f"images/{user_id}/{uuid.uuid4()}.png"
                output_url = supabase.upload_file(filename, image_bytes, "image/png")
            except Exception as storage_exc:
                # Bucket not found or any other storage error — serve inline.
                b64 = base64.b64encode(image_bytes).decode("utf-8")
                output_url = f"data:image/png;base64,{b64}"

            return {"output_url": output_url, "status": "completed"}

        elif gen_type == "video":
            result = await gemini.generate_video(final_prompt)
            return {
                "job_id": result["job_id"],
                "status": "processing",
                "output_url": "",
            }

        return {"error": "Invalid generation type"}

    except Exception as exc:
        return {"error": f"Generation failed: {exc}"}
