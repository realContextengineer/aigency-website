---
name: archie-firecrawl-public-evidence
description: Run an authorised, bounded Firecrawl crawl to collect public Article 50 evidence.
---

# Archie Firecrawl Public Evidence

Use this only for an authorised Archie review after the target URL has passed
public-URL validation. Firecrawl is the collection worker; Archie is the
evidence interpreter. Do not present Firecrawl output as a legal result.

## Run

```bash
/Users/aigencyltd/.hermes/hermes-agent/venv/bin/python scripts/archie_firecrawl_public_evidence.py \
  "https://example.com/" \
  --job-id "archie-YYYYMMDD-001" \
  --page-limit 25
```

The runner requires `FIRECRAWL_API_KEY` in Archie's private `.env`; never ask a
customer to send the key and never print it. It stores a job contract and
Firecrawl response only in Archie's workspace.

## Fixed limits

- public `http` or `https` URL only; DNS must resolve to globally routable IPs;
- same submitted domain only;
- maximum 25 pages and link depth 2;
- screenshots, raw HTML, links, images and text only;
- no search, no Firecrawl interact, no login, no forms, no payment, no browser
  session and no third-party domain crawl.

Use the evidence to identify visible AI interaction/disclosure, public labels,
media provenance signals and human-legibility issues. Missing evidence is
`not found within the reviewed scope`, never proof of a breach or proof that an
asset is AI-generated.
