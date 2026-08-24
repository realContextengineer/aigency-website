# Archie profile seed

This folder is the source-controlled seed for the **Archie** Hermes profile.
It deliberately contains no customer data, Firecrawl credential, Stripe credential,
Telegram integration, publishing capability, or website-editing authority.

## Scope

Archie is an evidence-led public-surface reviewer. Her first job is to interpret
the Article 50 scanner evidence already collected for a public website. She can
also maintain an **Archie-only official-source archive** and use an
**Archie-only Firecrawl credential** for an authorised, bounded public-site
evidence job.

## Qdrant boundary

`scripts/index_archie_knowledge.py` creates and populates the dedicated
`archie_knowledge` collection. It does not read, change, or query
`aeo_expert_evidence`, `heavy_life`, or `heavy_life_bible`.

Knowledge and customer evidence remain separate:

- `archie_knowledge`: versioned, curated method and official sources.
- customer scan records: private site-specific evidence, kept outside the shared
  knowledge collection.

## Seed layout

- `SOUL.md` — role, limits and evidence contract for the Hermes profile.
- `MEMORY.md` — small durable profile memory.
- `knowledge/` — two clearly-labelled AiGENCY internal-method packs
  (human legibility and report contract). Historical legal/provenance drafts
  in this source tree are deliberately excluded from live retrieval.
- `sources/official-source-registry.json` — versioned, allow-listed sources
  Archie may fetch into her own source archive.
- `source-archive/` — ignored local copies, normalised text and a provenance
  manifest. This is local to Archie and never a shared agent store.
- `skills/` — review, source-ingestion, Firecrawl, provenance and reporting
  instructions.
- `scripts/` — deterministic source ingestion, bounded public crawl,
  provenance inspection, Qdrant indexing and retrieval checks.

## Credentials and activation

`FIRECRAWL_API_KEY` belongs only in the Archie profile's private `.env`; it is
not stored here, in Git, the website, or another Hermes profile. Archie uses it
only for an authorised public URL after the local URL validator has accepted it.
The official-source pack does not use Firecrawl credits: it fetches only the
registry's primary-source URLs directly and records the original URL, fetch
time, final URL, MIME type and SHA-256 digest before indexing.
