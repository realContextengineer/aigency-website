#!/usr/bin/env python3
"""Archive approved official sources and index them into Archie's own Qdrant collection.

This intentionally has no search feature. Archie can fetch only the versioned
registry supplied with her profile, so her retrieval base remains traceable.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import mimetypes
import re
import ssl
import subprocess
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import certifi


ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "sources" / "official-source-registry.json"
ARCHIVE = ROOT / "source-archive"
RAW = ARCHIVE / "raw"
NORMALISED = ARCHIVE / "normalised"
MANIFEST = ARCHIVE / "source-manifest.jsonl"
USER_AGENT = "AiGENCY-Archie-SourceArchive/1.0 (+https://aigency.ltd)"
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


class TextExtractor(HTMLParser):
    """Small dependency-free HTML extractor for primary-source pages."""

    BLOCK_TAGS = {"article", "br", "div", "h1", "h2", "h3", "h4", "li", "p", "section", "table", "td", "th", "tr"}
    SKIP_TAGS = {"script", "style", "svg", "noscript", "template"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skipping = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.SKIP_TAGS:
            self.skipping += 1
        if not self.skipping and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP_TAGS and self.skipping:
            self.skipping -= 1
        if not self.skipping and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.skipping:
            self.parts.append(data)

    def text(self) -> str:
        value = html.unescape(" ".join(self.parts))
        value = re.sub(r"[ \t]+", " ", value)
        value = re.sub(r"\n\s*\n\s*\n+", "\n\n", value)
        return value.strip()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", type=Path, default=REGISTRY_PATH)
    parser.add_argument("--source", action="append", help="Registry source id. May be repeated; defaults to all.")
    parser.add_argument("--reindex", action="store_true", help="Run Archie's isolated Qdrant indexer after a successful archive.")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def load_registry(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data.get("sources"), list) or not isinstance(data.get("allowed_hosts"), list):
        raise SystemExit(f"Invalid source registry: {path}")
    return data


def allowed(url: str, allowed_hosts: set[str]) -> bool:
    parsed = urlparse(url)
    return parsed.scheme == "https" and (parsed.hostname or "").lower() in allowed_hosts


def fetch(url: str, allowed_hosts: set[str]) -> tuple[bytes, str, str]:
    if not allowed(url, allowed_hosts):
        raise ValueError(f"Registry URL is not an allow-listed HTTPS origin: {url}")
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/pdf,text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1"})
    with urlopen(request, timeout=45, context=SSL_CONTEXT) as response:  # nosec B310: source registry is controlled above
        final_url = response.geturl()
        if not allowed(final_url, allowed_hosts):
            raise ValueError(f"Redirect left the allow-listed source set: {final_url}")
        data = response.read(25 * 1024 * 1024 + 1)
        if len(data) > 25 * 1024 * 1024:
            raise ValueError("Source exceeded Archie's 25 MiB archive limit")
        content_type = response.headers.get_content_type() or "application/octet-stream"
    return data, final_url, content_type


def pdf_to_text(data: bytes) -> str:
    try:
        import pymupdf  # type: ignore
    except ImportError as error:
        raise RuntimeError("PDF text extraction requires PyMuPDF in the Archie Hermes environment") from error
    document = pymupdf.open(stream=data, filetype="pdf")
    try:
        return "\n\n".join(page.get_text("text") for page in document).strip()
    finally:
        document.close()


def normalise(data: bytes, content_type: str) -> tuple[str, str]:
    if content_type == "application/pdf" or data.startswith(b"%PDF-"):
        return pdf_to_text(data), ".pdf"
    decoded = data.decode("utf-8", errors="replace")
    if "html" in content_type or "<html" in decoded[:1000].lower():
        parser = TextExtractor()
        parser.feed(decoded)
        parser.close()
        return parser.text(), ".html"
    return decoded.strip(), mimetypes.guess_extension(content_type) or ".txt"


def yaml_safe(value: str) -> str:
    return value.replace("\n", " ").replace('"', "'").strip()


def write_source(source: dict[str, Any], registry: dict[str, Any], dry_run: bool) -> dict[str, Any]:
    source_id = str(source["id"])
    allowed_hosts = {str(item).lower() for item in registry["allowed_hosts"]}
    if dry_run:
        return {"id": source_id, "status": "would_fetch", "url": source["url"]}

    data, final_url, content_type = fetch(str(source["url"]), allowed_hosts)
    digest = hashlib.sha256(data).hexdigest()
    body, suffix = normalise(data, content_type)
    if len(body) < 120:
        raise RuntimeError(f"Extracted source text is unexpectedly short for {source_id}")

    fetched_at = datetime.now(timezone.utc).isoformat()
    raw_dir = RAW / source_id
    raw_dir.mkdir(parents=True, exist_ok=True)
    NORMALISED.mkdir(parents=True, exist_ok=True)
    raw_path = raw_dir / f"{digest}{suffix}"
    raw_path.write_bytes(data)
    normalised_path = NORMALISED / f"{source_id}.md"
    frontmatter = "\n".join(
        [
            "---",
            "knowledge_pack: official-source",
            f"authority_level: {yaml_safe(str(source.get('authority_level', 'official-source')))}",
            f"source_id: {yaml_safe(source_id)}",
            f"source_title: {yaml_safe(str(source['title']))}",
            f"source_url: {yaml_safe(final_url)}",
            f"publisher: {yaml_safe(str(source['publisher']))}",
            f"source_version: {yaml_safe(str(source.get('version', '')))}",
            f"downloaded_at: {fetched_at}",
            f"raw_sha256: {digest}",
            "---",
            "",
        ]
    )
    normalised_path.write_text(frontmatter + body + "\n", encoding="utf-8")
    item = {
        "id": source_id,
        "title": source["title"],
        "publisher": source["publisher"],
        "requested_url": source["url"],
        "final_url": final_url,
        "content_type": content_type,
        "downloaded_at": fetched_at,
        "raw_sha256": digest,
        "raw_path": str(raw_path),
        "normalised_path": str(normalised_path),
        "characters_indexable": len(body),
        "status": "archived",
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(item, ensure_ascii=False) + "\n")
    return item


def main() -> None:
    args = parse_args()
    registry = load_registry(args.registry)
    requested = set(args.source or [])
    sources = [item for item in registry["sources"] if not requested or item["id"] in requested]
    missing = requested - {item["id"] for item in sources}
    if missing:
        raise SystemExit(f"Unknown registry source id(s): {', '.join(sorted(missing))}")
    results: list[dict[str, Any]] = []
    for source in sources:
        try:
            results.append(write_source(source, registry, args.dry_run))
        except Exception as error:  # preserve the result for Archie to explain
            results.append({"id": source["id"], "status": "failed", "error": str(error)})

    if args.reindex and not args.dry_run and any(item.get("status") == "archived" for item in results):
        indexer = ROOT / "scripts" / "index_archie_knowledge.py"
        completed = subprocess.run([sys.executable, str(indexer)], cwd=ROOT, text=True, capture_output=True, check=False)
        results.append({"id": "qdrant-index", "status": "completed" if completed.returncode == 0 else "failed", "output": completed.stdout.strip(), "error": completed.stderr.strip()})
    print(json.dumps({"registry_version": registry.get("registry_version"), "results": results}, indent=2, ensure_ascii=False))
    if any(item.get("status") == "failed" for item in results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
