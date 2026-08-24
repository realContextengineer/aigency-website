#!/usr/bin/env python3
"""Run a small, isolated retrieval check against Archie’s Qdrant collection."""

from __future__ import annotations

import argparse
import json

from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

COLLECTION = "archie_knowledge"
PROJECT_ID = "archie"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("--limit", type=int, default=3)
    args = parser.parse_args()

    # Archie runs from the local model cache; a retrieval check must not make a
    # network request to Hugging Face.
    model = SentenceTransformer(MODEL_NAME, local_files_only=True)
    vector = model.encode(args.query, normalize_embeddings=True).tolist()
    client = QdrantClient(url="http://127.0.0.1:6333")
    result = client.query_points(
        collection_name=COLLECTION,
        query=vector,
        query_filter=models.Filter(
            must=[models.FieldCondition(key="project_id", match=models.MatchValue(value=PROJECT_ID))]
        ),
        limit=args.limit,
        with_payload=True,
    )
    print(
        json.dumps(
            [
                {
                    "score": round(point.score, 4),
                    "knowledge_pack": point.payload.get("knowledge_pack"),
                    "title": point.payload.get("title"),
                    "source_url": point.payload.get("source_url"),
                    "text": point.payload.get("text"),
                }
                for point in result.points
            ],
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
