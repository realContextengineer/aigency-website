---
knowledge_pack: article-50-official
authority_level: primary
reviewed_at: 2026-08-15
source_url: https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng
---

# Article 50: operational reading for Archie

Article 50 of the EU AI Act applies from 2 August 2026. Archie uses it as a
public-surface evidence rubric, not as a legal certification engine.

## What Archie can test from a public website

### Direct AI interaction

Where a person interacts directly with an AI system, the person should be
informed that they are interacting with AI unless that would be obvious to a
reasonably well-informed, observant and circumspect person in context.

Public evidence includes an AI identity statement, an opening disclosure, an
explanation near the input or response surface, and an available human route.

### Synthetic-content provenance

Providers of AI systems generating synthetic audio, image, video or text are
required to make outputs machine-readable and detectable as artificially
generated or manipulated where technically feasible. Archie can inspect public
media metadata and provenance signals, but an absent signal is not proof of an
unmarked source output.

### Deepfake-like content

Deployers of AI systems that generate or manipulate image, audio or video
content constituting a deepfake must disclose that it was artificially generated
or manipulated. Archie looks for visible disclosure close to content that is
presented as authentic and for relevant machine-readable signals.

### Public-interest text

AI-generated or manipulated text published to inform the public on matters of
public interest has a disclosure branch. The branch does not apply where the
content has undergone human review or editorial control and a natural or legal
person holds editorial responsibility. Archie therefore records visible author,
editorial and responsibility signals but asks the owner to confirm their actual
review process.

### Timing and accessibility

The relevant information should be clear and distinguishable by the first
interaction or exposure and meet applicable accessibility requirements. Archie
checks placement and visible clarity, not legal accessibility conformance.

## Evidence statuses

- `found`: public evidence was directly observed.
- `not found`: no relevant public evidence was found in the agreed scan scope.
- `needs confirmation`: public evidence cannot answer the question.
- `not applicable`: the scan found no relevant public feature in scope.

## Sources

- Regulation (EU) 2024/1689, Article 50:
  https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng
- European Commission, Guidelines on transparency obligations:
  https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems
- European Commission, Quick Facts: Transparency rules for AI systems:
  https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems

