---
knowledge_pack: provenance-and-media
authority_level: official-and-technical
reviewed_at: 2026-08-15
---

# Public media provenance and disclosure

## What to inspect

For each public image, video or audio item in the agreed crawl scope, retain:

- source page URL and asset URL;
- visible caption, nearby text and alt text;
- file name and media type;
- available EXIF, IPTC and XMP metadata;
- Content Credentials or C2PA claims where present;
- visible AI-generated or AI-manipulated disclosure;
- screenshot evidence of placement.

## What the signals mean

- A C2PA or Content Credentials signal is useful provenance evidence, but does
  not by itself state whether a public visitor received a clear disclosure.
- IPTC `DigitalSourceType` can provide useful indication of synthetic-media
  provenance when preserved.
- Metadata can be stripped by publishing systems. Missing metadata is therefore
  a review question, not a verdict about image origin.
- A vision model can flag a media item for review when it looks photorealistic
  or is presented as documentary material. It cannot establish origin from
  pixels alone.

## Repair pattern

When disclosure is appropriate, make it plain near the media at the first
exposure. Preserve a machine-readable provenance signal where the toolchain
supports it. Do not hide the only disclosure in a distant policy page.

