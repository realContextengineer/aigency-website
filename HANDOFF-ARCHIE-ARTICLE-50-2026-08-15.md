# Archie / Article 50 service handoff

**Date:** 15 August 2026  
**Scope:** AiGENCY website, the Article 50 visible-evidence scanner, Archie as a Hermes agent, and the relationship to Arthur Light and AEO Expert.

This is a factual handoff. It distinguishes the working parts, the parts that are only designed, and the parts that must be rebuilt cleanly.

## 1. The product being built

AiGENCY is developing an AI-transparency service around the public-facing evidence a website provides about AI use. The immediate product is an **Article 50 visible-evidence health check**:

1. A visitor enters a public website URL.
2. A free check establishes that the site is public and reviews a small, bounded number of public HTML pages.
3. It returns understandable findings, not just a technical checklist: what the business appears to be doing well, what needs checking, and what is missing from the visible public evidence.
4. A low-cost deeper review is intended as the next step, currently discussed at **£2.99**.
5. A human review is intended as the premium service, currently discussed at **£299**, with a conversation with the customer or their developer where necessary.
6. Ongoing monitoring ("Archie Watch") may later be a monthly service for businesses that publish or update AI-assisted material frequently.

The service must look at the reality of the public website, not merely ask a user to complete a questionnaire.

## 2. What Article 50 means in this product

The practical question Archie is being designed to answer is:

> On the public parts of this website, is there visible evidence that AI-generated or AI-manipulated interaction, content, imagery, audio, video, or public-interest text is being transparently disclosed where relevant?

The scanner must not pretend it can prove the invisible origin of every image, sentence, recording, or video. Its job is to collect and assess **observable evidence**:

- AI chatbot / AI assistant disclosure at the point of interaction.
- Clear route to a human where an AI is dealing with a visitor.
- AI-generated or materially manipulated images, audio, and video, including labels, adjacent disclosure, metadata/provenance where available, and machine-readable signals.
- Synthetic/deepfake disclosure signals.
- AI-generated public-interest text where relevant.
- Technical public signals that make a site more inspectable and discoverable: robots.txt, llms.txt, structured data, content credentials, page/image metadata and accessible media descriptions.

The visible health-check language needs to be written for a business owner: a percentage or band, clear priorities, evidence links/screenshots, and the next sensible action. The detailed technical findings remain available underneath for developers.

## 3. The commercial funnel under discussion

| Tier | Intended customer outcome | Current status |
| --- | --- | --- |
| Free public check | Bounded public-page scan, simple score/band, visible findings and practical next step. It proves that the service can read their public site. | Local prototype exists; score and business-facing summary still need implementation. |
| £2.99 deeper crawl | More pages, page screenshots, media inventory, image/provenance checks, AI-text review, evidence-led report and saved result. | Product design only; needs payment, job queue, report storage and Archie workflow. |
| £299 human review | An evidence pack reviewed by a person, with customer/developer discussion and a prioritised remediation plan. | Product design only. |
| Archie Watch, possibly £29.99/month | Repeat checks after site/content changes, trend history, alerts and an update queue. Useful for businesses publishing frequently. | Product design only. |

The intended acquisition logic is low friction: free proof first, a small paid step that feels immediately useful, then human expertise where it matters.

## 4. The existing website scanner

The website work is in this checkout:

`/Users/aigencyltd/Documents/DESIGN PROJECTS/aigency-website-main`

The current local working tree contains uncommitted Article 50 scanner work, including:

- `ai-transparency.html`
- `aigency_local_server.py`
- `css/style.css`
- `js/article50-scan.js`
- `netlify/functions/article50-scan.mjs`
- `netlify/functions/lib/`
- `tests/`
- `package.json` and `package-lock.json`

It has been demonstrated locally in the browser. One local run against a public AiGENCY site displayed a bounded six-page public review and a list of found / not-found / confirm items. The screenshot showed 13 found, 1 not found and 2 items needing confirmation.

What it does now:

- Accepts a public URL.
- Makes a bounded review of public HTML pages.
- Produces individual evidence-style checks in the browser.
- Explains that it reads public material only and does not log in, submit forms or change the target website.

What it does **not** yet do:

- Calculate and explain a business-facing percentage/band.
- Run a paid deep crawl.
- Capture and store a paid evidence pack/screenshot set.
- Use Firecrawl.
- Run an Archie job.
- Take payment through Stripe.
- Store customers, orders, jobs, reports or monitoring history in Supabase.
- Run in production. Nothing in this current scanner work has been committed or pushed as part of this activity.

## 5. The agent architecture

These are separate roles. They must not be merged merely because they all concern AI.

| Agent / system | Role | Boundary |
| --- | --- | --- |
| Arthur Light | Public-facing AiGENCY website guide and customer conversation. | Remains Hermes-backed and separate from publication/crawling work. |
| AEO Expert / Arthur Heavy | Research and approved Insight-post workflow. | Remains its own Hermes profile, evidence library and Qdrant collection. Do not use it as Archie’s knowledge base. |
| Archie | Article 50 / AI-transparency evidence worker. Her Telegram bot is `@Article50_bot`. | Own profile, own Obsidian evidence library, own Qdrant collection and later her own customer-site crawling workflow. |
| Deterministic publisher | A small approval-gated program that places an approved Insight in Supabase. | Separate from agent reasoning. It should not be replaced by Archie. |

The longer-term AEO/GEO service overlaps with transparency work at the website-crawl layer, but it is a different question:

- **Archie:** “Is there visible evidence of responsible AI transparency on this public site?”
- **AEO/GEO:** “Can AI search systems understand, retrieve and accurately represent this organisation?”

They may later share a crawler, media inventory and report infrastructure. They should retain separate scoring models, evidence rules, reports and customer promises.

## 6. Archie’s intended role

Archie is a focused workhorse, not a generic chatbot. Her role is to turn a customer URL into a bounded, traceable public-evidence review.

For a paid job, the intended workflow is:

1. Receive an authorised public URL and validate that it is a genuinely public website.
2. Reuse the existing lightweight public-URL check from the free scanner.
3. Crawl the defined public scope using Archie’s own Firecrawl account/key when that is configured.
4. Capture a page inventory, links, HTML/visible text, page screenshots and a media inventory.
5. Inspect visible disclosure text, structured data, media labels, image metadata/provenance where available, alt text/captions and relevant technical signals.
6. Use a constrained review rubric grounded in Archie’s approved evidence library.
7. Create an evidence-led report: what was seen, where it was seen, what was not seen, confidence/limitations, and a practical fix order.
8. Escalate uncertain, material or nuanced cases to the human review instead of inventing a conclusion.

The intended selling point is not that Archie has supernatural certainty. It is that she has a persistent, curated evidence library; a repeatable review process; source-backed reporting; and a human escalation path. That makes her more useful than a one-off generic chat prompt.

## 7. Archie’s required capabilities

### Knowledge and evidence

- Download an original official document from an explicit URL supplied by Karl or explicitly approved for Archie.
- Save the untouched original source file visibly in Archie’s Obsidian Vault.
- Record source URL, final URL, download date/time, content type and SHA-256 hash.
- Keep unreviewed downloads separate from approved evidence.
- Promote a source to approved evidence only by explicit instruction.
- Rebuild her own Qdrant index only from approved Archie evidence.
- Answer legal/technical claims with the original source path, URL and page/section where available.
- Say that evidence is absent when it cannot retrieve it. It must never fill a gap with its own general model memory.

### Customer-site review

- Public URL validation and scope control.
- Public-page crawling and sitemap/link discovery.
- HTML, visible-text and structured-data extraction.
- Screenshot capture.
- Media inventory for images, audio and video.
- Image metadata / C2PA-content-credentials inspection where present.
- OCR / document-text extraction where needed.
- AI-text pattern review as a supporting signal, not a claimed origin detector.
- Evidence-to-finding mapping.
- Clear report assembly in human language.

### Useful supporting skills

- Grounded citations.
- PDF handling.
- OCR and document extraction.
- Humaniser, solely to make reports legible and non-robotic; it must not alter the evidence or invent conclusions.
- Later: Firecrawl public-site evidence and media provenance skills.

## 8. The correct source-of-truth design

Karl’s requirement is that no model is treated as an oracle. That includes Codex, Grok, GLM and Archie.

The correct pattern is the same shape as AEO Expert:

```text
Original official source file, visibly stored in Obsidian
        ↓ explicit human approval / promotion
Approved Evidence Library in Obsidian
        ↓ explicit rebuild
Archie-only Qdrant collection (retrieval pointers and chunks)
        ↓
Archie answer with source path, URL, hash and page/section
```

Qdrant is **not** the source of truth. It is a rebuildable retrieval index. The original raw document remains visible in Obsidian, so any claim can be checked directly.

The planned Archie Vault is:

```text
/Users/aigencyltd/Documents/Obsidian Vault/Archie/
  00 Archie Home.md
  01 Inbox - Unreviewed/
    Downloaded Sources/
    Archive - Raw Intake/
  02 Evidence Library/
  03 Archie Knowledge Base/
  04 Profile and Skills/
    SOUL.md
    ARCHIE-EVIDENCE-WORKFLOW.md
    scripts/
    skills/
  05 Review Jobs/
  06 Reports/
  07 Decisions and Handoffs/
  Qdrant Index Manifest.md
```

There must be no preloaded legal “snippets” presented as original sources. Archie downloads the whole original document, preserves it, records provenance, and only then can it become retrievable evidence.

## 9. Current Archie state — verified on 15 August 2026

| Item | Verified state |
| --- | --- |
| Hermes runtime profile | Exists at `/Users/aigencyltd/.hermes/profiles/archie/`. |
| Telegram identity | `@Article50_bot` exists and its identity/name must be preserved. Do not recreate, rename or delete the bot. |
| Telegram credentials | Remain in Archie's private Hermes `.env`; they are not included in this handoff or Obsidian. |
| Archie Obsidian Vault | Does **not** yet exist at `/Users/aigencyltd/Documents/Obsidian Vault/Archie/`. |
| Archie Qdrant collection | Does **not** exist. Current local Qdrant only has `aeo_expert_evidence`, `heavy_life`, and `heavy_life_bible`. |
| Firecrawl | No Archie-specific Firecrawl key is configured. Do not use an old/global Firecrawl credential. |
| Current skills | Nine local skills are enabled; see the next section. |
| Website work | Local-only, dirty working tree; do not commit or push without an explicit instruction. |

### Current enabled skills in the existing Archie profile

These exist, but several were created before the source-of-truth decision and should be replaced or rewired:

1. `archie-firecrawl-public-evidence`
2. `archie-media-provenance`
3. `archie-official-source-ingestion`
4. `archie-report-assembly`
5. `archie-site-review`
6. `grounded-citations`
7. `humanizer`
8. `ocr-and-documents`
9. `pdf`

The old `archie-official-source-ingestion` pattern wrote material under Archie's hidden Hermes workspace. That is the wrong pattern and must not be used for the rebuilt system.

## 10. Important correction: what went wrong earlier

An earlier attempt wrongly initiated an official-source ingest through Archie's hidden Hermes workspace. That blurred three distinct things:

- Archie herself downloading an original document after Karl instructs her.
- Codex starting a download on Archie's behalf.
- A model-generated summary/snippet versus the original source document.

That is why the approach is being reset.

There is old hidden Archie source material under:

`/Users/aigencyltd/.hermes/profiles/archie/workspace/source-archive/`

It must not be used as Archie’s evidence base. It is not the approved, visible Obsidian source library. The old Archie Qdrant collection was already removed; it is currently absent.

Do **not** delete the Archie Telegram bot or its `.env` while cleaning this up. The bot’s public identity and its credentials are a separate concern from source documents and Qdrant.

## 11. AEO Expert is the precedent

AEO Expert already uses the intended architecture:

```text
Hermes runtime/profile:
/Users/aigencyltd/.hermes/profiles/aeoexpert/

Visible source/evidence library:
/Users/aigencyltd/Documents/Obsidian Vault/AEO Expert/

Derived retrieval index:
Qdrant collection `aeo_expert_evidence`
```

Its visible evidence workflow is:

```text
01 Inbox - Unreviewed/Downloaded Sources
        ↓ review and approval
02 Evidence Library
        ↓ index
aeo_expert_evidence
```

Archie should follow this model exactly, with separate files and a separate collection. She must never read from `AEO Expert` or `aeo_expert_evidence`.

## 12. Clean rebuild plan for Archie

Do these in this order.

1. Create the empty visible Archie Obsidian Vault structure shown above. No legal documents or inferred summaries should be put in it during this step.
2. Put the visible source-controlled Archie operating documents in `04 Profile and Skills/`: her SOUL, evidence workflow, scripts and skill descriptions.
3. Point the active Hermes profile’s working directory at the Archie Vault, while keeping only runtime state and secrets in `/Users/aigencyltd/.hermes/profiles/archie/`.
4. Replace the old hidden-workspace ingestion skill with four explicit workflows:
   - **Download original source**: direct URL → unchanged original file in `01 Inbox - Unreviewed/Downloaded Sources/` plus metadata/hash.
   - **Promote evidence**: explicit instruction → original preserved in `02 Evidence Library/`, with derived readable text as a companion, not a replacement.
   - **Rebuild Archie index**: approved Evidence Library only → `archie_knowledge` Qdrant collection.
   - **Query evidence**: report source path, original URL, hash, page/section and excerpt with each answer.
5. Produce a visible `Qdrant Index Manifest.md` in the Archie Vault after each rebuild. It must show the exact approved source files, hashes, source URLs, chunk count, embedding model and rebuild time.
6. Keep `archie_knowledge` empty until Archie has actually downloaded and promoted at least one original source document.
7. Only then add Firecrawl to Archie for customer-site paid reviews, using Archie’s dedicated credential and hard page/depth/domain limits.
8. Add Stripe/Supabase job flow after the deeper-review report is working locally and can be inspected end-to-end.

## 13. Rules for the next implementation pass

- Do not download official sources in advance as Codex “helping.” Archie must download them from a direct instruction, visibly into her Inbox.
- Do not treat an LLM response, a model summary, a blog interpretation or a copied snippet as primary evidence.
- Do not add information to Qdrant without preserving the original source document and provenance in Obsidian.
- Do not use `aeo_expert_evidence`, AEO Expert files, Arthur Light files or any other profile’s data.
- Do not use Karl’s Firecrawl credits for Codex research. Firecrawl is for Archie’s approved customer-site workflow once her own key is configured.
- Do not recreate or rename `@Article50_bot`.
- Do not stop the Archie gateway merely to change source documents. Preserve the bot’s availability.
- Do not commit, push or deploy the website scanner without Karl’s explicit request.
- Do not describe an inference as evidence. The correct response to an unavailable source is “not established from the evidence library.”

## 14. What needs a decision from Karl

The clean Vault/Qdrant architecture does not need further product decisions. These later items do:

1. The customer-facing name: **Archie**, **Archie Watch**, and whether she uses a female image while retaining the name Archie.
2. The precise free-scan score/band language.
3. Whether the deeper paid report is £1.99 or £2.99.
4. The exact contents of the paid report and the customer data collected before payment.
5. When to connect a dedicated Firecrawl account/key.
6. When to add Stripe and Supabase order/job/report tables.
7. Whether monitoring is initially monthly, weekly or triggered by detected site changes.

## 15. The immediate next task

Build the empty, visible Archie evidence system in Obsidian and repoint the Hermes profile to it—without downloading any sources and without changing the Telegram bot.

Once that is visible, Karl can send Archie a direct official source URL in Telegram and watch the exact original document land in:

`/Users/aigencyltd/Documents/Obsidian Vault/Archie/01 Inbox - Unreviewed/Downloaded Sources/`

That is the first proof that the new system is functioning correctly.
