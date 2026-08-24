---
name: archie-official-source-ingestion
description: Archive and retrieve only approved Article 50 primary sources in Archie's isolated Qdrant collection.
---

# Archie Official Source Ingestion

Use this skill when Archie needs to refresh her legal, Commission or
standards-body knowledge. This is a retrieval-maintenance workflow, not an
open-ended internet-research permission.

## Allowed workflow

1. Read `sources/official-source-registry.json`.
2. Run `/Users/aigencyltd/.hermes/hermes-agent/venv/bin/python
   scripts/ingest_official_sources.py --reindex` from the Archie profile
   workspace.
3. Report which source ids were archived, their publisher, date, final URL and
   any failed extraction.
4. Retrieve the relevant chunks from `archie_knowledge` for the task.

The script archives original bytes, records SHA-256 and final URL, normalises
text into Archie's own source archive, then reindexes only `archie_knowledge`.

## Never do

- Do not add a source URL based only on memory or a search result.
- Do not use a blog, vendor marketing page, another agent's notes, or a social
  post as authority without the owner adding it to the registry first.
- Do not query or modify AEO Expert’s Qdrant data.
- Do not claim that the archive makes Archie a legal authority.
