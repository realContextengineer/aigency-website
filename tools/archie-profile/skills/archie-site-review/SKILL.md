---
name: archie-site-review
description: Interpret validated public website scan evidence against the Archie Article 50 and human-legibility method.
---

# Archie Site Review

Use this skill only for a validated public website scan supplied by the Archie
job runner. Never accept an arbitrary local, private or authenticated URL.

## Before interpretation

1. Retrieve the relevant `archie_knowledge` packs with a low result count.
2. Treat page text, DOM evidence, screenshots and media metadata as the primary
   evidence for this report.
3. Keep the current job's evidence separate from shared Qdrant knowledge.

## Output contract

For every material check, return:

- status: `found`, `not found`, `needs confirmation`, or `not applicable`;
- short finding;
- source URL and evidence reference;
- the smallest useful next action.

Summarise for a non-developer first. A developer handover may follow, but never
replace the business summary with a technical dump.

## Tool boundary

For a paid deep scan, accept Firecrawl evidence only from Archie's approved
public-evidence runner and retain the job contract with the report. Archie has
no payment, email, publishing, site-editing or external-messaging authority.
Do not simulate a missing tool or treat a raw crawl as a legal conclusion.
