#!/usr/bin/env python3
"""Index Archie’s approved knowledge packs into an isolated Qdrant collection."""

from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE = ROOT / "knowledge"
OFFICIAL_SOURCES = ROOT / "source-archive" / "normalised"
INTERNAL_METHOD_PACKS = ("03-human-legibility.md", "04-report-contract.md")
COLLECTION = "archie_knowledge"
PROJECT_ID = "archie"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 1200
OVERLAP = 180


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---\n"):
        return {}, text
    _, raw, body = text.split("---\n", 2)
    metadata: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            metadata[key.strip()] = value.strip()
    return metadata, body.strip()


def chunk_text(text: str) -> list[str]:
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if not text:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + CHUNK_SIZE)
        item = text[start:end].strip()
        if item:
            chunks.append(item)
        if end >= len(text):
            break
        start = max(start + 1, end - OVERLAP)
    return chunks


def stable_id(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:32]


def main() -> None:
    client = QdrantClient(url="http://127.0.0.1:6333")
    collections = {item.name for item in client.get_collections().collections}
    if COLLECTION not in collections:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )

    # This selector is confined to Archie’s isolated collection and project ID.
    client.delete(
        collection_name=COLLECTION,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[models.FieldCondition(key="project_id", match=models.MatchValue(value=PROJECT_ID))]
            )
        ),
        wait=True,
    )

    points: list[models.PointStruct] = []
    manifest_sources: list[dict[str, str]] = []
    # The two original legal/provenance seed notes remain in the source tree as
    # historical drafts, but never enter Archie's live retrieval collection.
    # Her Article 50 and provenance material comes from the archived source
    # registry; only AiGENCY's clearly-labelled internal method packs remain.
    knowledge_files = [KNOWLEDGE / name for name in INTERNAL_METHOD_PACKS if (KNOWLEDGE / name).is_file()]
    knowledge_files += sorted(OFFICIAL_SOURCES.glob("*.md"))
    for path in knowledge_files:
        raw = path.read_text(encoding="utf-8")
        metadata, body = parse_frontmatter(raw)
        digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        source_id = metadata.get("source_id") or stable_id(str(path.resolve()))
        manifest_sources.append(
            {
                "source_id": source_id,
                "file_path": str(path),
                "sha256": digest,
                "source_url": metadata.get("source_url", ""),
                "authority_level": metadata.get("authority_level", "internal-method"),
            }
        )
        for chunk_no, text in enumerate(chunk_text(body)):
            chunk_id = f"{source_id}:{chunk_no}"
            points.append(
                models.PointStruct(
                    id=stable_id(chunk_id),
                    vector=[],
                    payload={
                        "project_id": PROJECT_ID,
                        "source_id": source_id,
                        "chunk_id": chunk_id,
                        "chunk_number": chunk_no,
                        "title": metadata.get("source_title", path.stem.replace("-", " ")),
                        "file_path": str(path),
                        "sha256": digest,
                        "knowledge_pack": metadata.get("knowledge_pack", "general"),
                        "authority_level": metadata.get("authority_level", "internal-method"),
                        "reviewed_at": metadata.get("reviewed_at", ""),
                        "source_url": metadata.get("source_url", ""),
                        "text": text,
                    },
                )
            )

    if not points:
        raise SystemExit("No Archie knowledge packs were found.")

    # The embedding model is already present in Hermes' local cache. Keeping
    # retrieval offline avoids a network dependency for every Archie scan.
    model = SentenceTransformer(MODEL_NAME, local_files_only=True)
    vectors = model.encode(
        [point.payload["text"] for point in points],
        normalize_embeddings=True,
        show_progress_bar=True,
    ).tolist()
    for point, vector in zip(points, vectors):
        point.vector = vector

    for offset in range(0, len(points), 64):
        client.upsert(collection_name=COLLECTION, points=points[offset : offset + 64], wait=True)

    manifest = {
        "collection": COLLECTION,
        "project_id": PROJECT_ID,
        "embedding_model": MODEL_NAME,
        "embedding_dimensions": 384,
        "indexed_at": datetime.now(timezone.utc).isoformat(),
        "source_count": len(manifest_sources),
        "chunk_count": len(points),
        "sources": manifest_sources,
    }
    (ROOT / "qdrant-index-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    info = client.get_collection(COLLECTION)
    print(json.dumps({"collection": COLLECTION, "sources": len(manifest_sources), "points": info.points_count}, indent=2))


if __name__ == "__main__":
    main()
