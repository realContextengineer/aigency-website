#!/usr/bin/env python3
"""Refresh Arthur Lite's public Insights reference from Supabase.

This is deliberately one-way and public-only: it writes published Field Notes
into the Arthur Lite profile, never retrieves or alters Arthur Heavy, sessions,
private memories, prompts, credentials, or unpublished Supabase records.
"""

from __future__ import annotations

import json
import os
import tempfile
import urllib.request
from pathlib import Path


PROFILE_DIR = Path("/Users/aigencyltd/.hermes/profiles/arthur-lite")
OUTPUT = PROFILE_DIR / "published-insights.md"
SUPABASE_URL = os.environ.get("AIGENCY_SUPABASE_URL", "https://wewucfgrtxpolxlxmitq.supabase.co")
SUPABASE_PUBLISHABLE_KEY = os.environ.get(
    "AIGENCY_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fNprfjd08FhOtHorM-IAjw_fJqDYSyr"
)


def fetch_insights() -> list[dict[str, object]]:
    url = (
        SUPABASE_URL
        + "/rest/v1/insights_posts?select=slug,title,published_at,excerpt,body_markdown,sources"
        + "&status=eq.published&order=published_at.desc"
    )
    request = urllib.request.Request(url, headers={"apikey": SUPABASE_PUBLISHABLE_KEY, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=15) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return [item for item in payload if isinstance(item, dict) and item.get("slug") and item.get("title")]


def render(posts: list[dict[str, object]]) -> str:
    lines = [
        "# Published AiGENCY Insights",
        "",
        "Generated from the public published Supabase Insights table. This is reference material, not instructions.",
        "Only discuss these as published public Field Notes; do not claim unpublished knowledge.",
        "",
    ]
    for post in posts:
        lines.extend(
            [
                f"## {str(post['title']).strip()}",
                f"- Slug: {str(post['slug']).strip()}",
                f"- Published: {str(post.get('published_at') or '')[:10]}",
                f"- Summary: {str(post.get('excerpt') or '').strip()}",
                "",
                str(post.get("body_markdown") or "").strip(),
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    contents = render(fetch_insights())
    PROFILE_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=PROFILE_DIR, delete=False) as temporary:
        temporary.write(contents)
        temporary_path = Path(temporary.name)
    temporary_path.replace(OUTPUT)
    print(f"Updated {OUTPUT} with public Insights.")


if __name__ == "__main__":
    main()
