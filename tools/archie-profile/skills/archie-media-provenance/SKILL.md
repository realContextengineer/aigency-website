---
name: archie-media-provenance
description: Inspect downloaded public media for C2PA or other machine-readable provenance without guessing AI origin from pixels.
---

# Archie Media Provenance

Use this after the public crawler has collected an individual public asset.
Run:

```bash
/Users/aigencyltd/.hermes/hermes-agent/venv/bin/python scripts/inspect_media_provenance.py asset-file --output provenance.json
```

If `c2patool` is installed, retain the complete JSON result as an evidence
attachment. If it is not installed, record `not inspected` for C2PA rather than
inventing an answer. IPTC/XMP/EXIF checks are additional technical evidence;
they are not verdicts on whether a person made the media.

Never infer synthetic origin from visual style, compression, apparent artefacts,
image-model guessers, or “AI-like” writing. C2PA itself validates integrity and
assertions, not whether a disclosure is morally or legally sufficient.
