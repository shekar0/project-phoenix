"""Supabase service — database operations and file storage."""

import os
import uuid
from datetime import datetime, timezone

from supabase import Client, create_client


class SupabaseService:
    """Wraps Supabase DB + Storage interactions."""

    def __init__(self) -> None:
        self.client: Client = create_client(
            os.getenv("SUPABASE_URL", ""),
            os.getenv("SUPABASE_KEY", ""),
        )
        self.bucket = "generations"

    # ── Database ──────────────────────────────────────────────

    def save_generation(
        self,
        *,
        user_id: str,
        prompt: str,
        style: str,
        resolution: str,
        aspect_ratio: str,
        gen_type: str,
        output_url: str,
    ) -> dict:
        """Insert a generation record into the *generations* table."""
        row = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "prompt": prompt,
            "style": style,
            "resolution": resolution,
            "aspect_ratio": aspect_ratio,
            "type": gen_type,
            "output_url": output_url,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = self.client.table("generations").insert(row).execute()
        return result.data[0] if result.data else row

    def get_user_history(self, user_id: str) -> list:
        """Return all generations for *user_id*, newest first."""
        result = (
            self.client.table("generations")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    # ── Storage ───────────────────────────────────────────────

    def upload_file(self, path: str, data: bytes, content_type: str) -> str:
        """Upload *data* to the *generations* bucket and return its public URL."""
        self.client.storage.from_(self.bucket).upload(
            path=path,
            file=data,
            file_options={"content-type": content_type},
        )
        return self.client.storage.from_(self.bucket).get_public_url(path)


# ── Lazy singleton ────────────────────────────────────────────

_instance: SupabaseService | None = None


def get_supabase_service() -> SupabaseService:
    global _instance
    if _instance is None:
        _instance = SupabaseService()
    return _instance
