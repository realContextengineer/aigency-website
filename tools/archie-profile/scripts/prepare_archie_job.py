#!/usr/bin/env python3
"""Prepare an isolated Archie interpretation job from an existing free scan."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

COLLECTION = "archie_knowledge"
PROJECT_ID = "archie"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
RETRIEVAL_QUERIES = [
    "Article 50 disclosure at first interaction and first exposure",
    "synthetic media provenance content credentials and visible disclosure",
    "human legibility and the smallest useful repair",
]


def retrieve() -> list[dict[str, object]]:
    model = SentenceTransformer(MODEL_NAME, local_files_only=True)
    client = QdrantClient(url="http://127.0.0.1:6333")
    seen: set[str] = set()
    excerpts: list[dict[str, object]] = []
    filter_ = models.Filter(
        must=[models.FieldCondition(key="project_id", match=models.MatchValue(value=PROJECT_ID))]
    )
    for query in RETRIEVAL_QUERIES:
        vector = model.encode(query, normalize_embeddings=True).tolist()
        results = client.query_points(
            collection_name=COLLECTION,
            query=vector,
            query_filter=filter_,
            limit=2,
            with_payload=True,
        ).points
        for point in results:
            chunk_id = str(point.payload.get("chunk_id", ""))
            if not chunk_id or chunk_id in seen:
                continue
            seen.add(chunk_id)
            excerpts.append(
                {
                    "query": query,
                    "score": round(point.score, 4),
                    "knowledge_pack": point.payload.get("knowledge_pack"),
                    "authority_level": point.payload.get("authority_level"),
                    "source_url": point.payload.get("source_url"),
                    "text": point.payload.get("text"),
                }
            )
    return excerpts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scan", required=True, type=Path, help="Article 50 scanner JSON output")
    parser.add_argument("--out", required=True, type=Path, help="Prepared Archie job JSON output")
    args = parser.parse_args()

    scan = json.loads(args.scan.read_text(encoding="utf-8"))
    target = scan.get("target") or {}
    scope = scan.get("scope") or {}
    checks = scan.get("checks")
    if not isinstance(checks, list) or not target.get("submitted_url") or not scope.get("boundary"):
        raise SystemExit("The supplied JSON is not a valid Article 50 public-surface scan.")

    scan_hash = hashlib.sha256(
        json.dumps(scan, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    job = {
        "job_version": "0.1-local-foundation",
        "job_id": f"archie-{scan_hash[:16]}",
        "prepared_at": datetime.now(timezone.utc).isoformat(),
        "task": "Interpret supplied Article 50 public-surface evidence using Archie’s curated knowledge.",
        "target": target,
        "scope": scope,
        "scan_summary": scan.get("summary", {}),
        "checks": checks,
        "warnings": scan.get("warnings", []),
        "scan_limitations": scan.get("limitation", ""),
        "retrieved_knowledge": retrieve(),
        "required_response": {
            "statuses": ["found", "not found", "needs confirmation", "not applicable"],
            "must_include": [
                "plain-English health-check summary",
                "three evidence-led priority actions",
                "owner questions public crawling cannot answer",
                "developer-ready repair notes where appropriate",
            ],
        },
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(job, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"job_id": job["job_id"], "retrieval_excerpts": len(job["retrieved_knowledge"])}, indent=2))


if __name__ == "__main__":
    main()

