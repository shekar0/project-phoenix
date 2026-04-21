"""Gemini service — text enhancement, safety checking, image & video generation."""

import asyncio
import os
import uuid

from google import genai
from google.genai import types


class GeminiService:
    """Wraps all Google Gemini / Veo API interactions."""

    IMAGE_MODEL = "gemini-2.5-flash-image"
    VIDEO_MODEL = "veo-3.1-lite-generate-preview"
    TEXT_MODEL = "gemini-2.0-flash"

    def __init__(self) -> None:
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))

    # ── Text helpers ──────────────────────────────────────────

    async def enhance_prompt(self, prompt: str) -> str:
        """Use Gemini LLM to produce a richer generation prompt."""
        system = (
            "You are an expert prompt engineer for AI image and video generation. "
            "Enhance the given prompt to produce higher-quality, more detailed results. "
            "Keep the original intent but add artistic details, lighting, composition "
            "and quality descriptors. Return ONLY the enhanced prompt text."
        )
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=self.TEXT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.7,
                max_output_tokens=500,
            ),
        )
        return response.text.strip()

    async def check_safety(self, prompt: str) -> dict:
        """Return ``{"safe": bool, "reason": str | None}``."""
        system = (
            "You are a content-safety classifier. Analyse the prompt and respond "
            "with exactly SAFE or UNSAFE. If unsafe, append a pipe and a brief reason, "
            "e.g. 'UNSAFE|Contains violent content'."
        )
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=self.TEXT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.0,
                max_output_tokens=100,
            ),
        )
        text = response.text.strip()
        if text.upper().startswith("SAFE"):
            return {"safe": True, "reason": None}
        reason = text.split("|", 1)[1].strip() if "|" in text else "Content flagged as unsafe"
        return {"safe": False, "reason": reason}

    async def evaluate_quality(self, prompt: str, output_url: str) -> float:
        """Evaluate generation quality (0-1). Placeholder until vision evaluation is wired."""
        return 0.85

    # ── Generation ────────────────────────────────────────────

    async def generate_image(self, prompt: str) -> bytes:
        """Generate an image with Gemini and return raw bytes."""
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=self.IMAGE_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                return part.inline_data.data
        raise RuntimeError("Gemini returned no image data")

    async def generate_video(self, prompt: str) -> dict:
        """Start an async Veo video generation job."""
        operation = await asyncio.to_thread(
            self.client.models.generate_videos,
            model=self.VIDEO_MODEL,
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio="16:9",
                number_of_videos=1,
            ),
        )
        op_name = getattr(operation, "name", str(uuid.uuid4()))
        return {
            "job_id": str(uuid.uuid4()),
            "operation_name": op_name,
            "status": "processing",
        }

    async def check_video_status(self, operation_name: str) -> dict:
        """Poll the status of a video generation operation."""
        try:
            operation = await asyncio.to_thread(
                self.client.operations.get, operation_name
            )
            if operation.done:
                videos = operation.result.generated_videos
                if videos:
                    return {"status": "completed", "video_data": videos[0].video}
            return {"status": "processing"}
        except Exception as exc:
            return {"status": "error", "error": str(exc)}


# ── Lazy singleton ────────────────────────────────────────────

_instance: GeminiService | None = None


def get_gemini_service() -> GeminiService:
    global _instance
    if _instance is None:
        _instance = GeminiService()
    return _instance
