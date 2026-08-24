# AI Transparency Check — Service, Pricing and Funnel Plan

**Date:** 16 August 2026  
**Parent company:** AiGENCY Ltd  
**Specialist analyst:** Archie  
**Product domain:** AITransparencyCheck.com  

## 1. Product model

The service should do as much work as possible with AiGENCY's own deterministic scanner and use Firecrawl only when ordinary collection cannot produce reliable evidence.

The operating distinction is:

- **Mapping** discovers which public pages exist.
- **Crawling** opens and examines selected pages.
- **Archie's review** interprets the collected evidence against approved sources.
- **Human review** adds the website owner's actual AI use, resolves uncertainty and approves the repair plan.

The customer funnel is:

```text
Visitor enters website
        ↓
Free map and six-page health check
        ↓
Useful score and visible findings
        ↓
£2.99 automated detailed report
        ↓
Owner answers five short questions
        ↓
Archie compares public evidence with declared AI use
        ↓
£299 human review where needed
        ↓
Possible ongoing monitoring later
```

The free scan must be genuinely useful. The £2.99 report must be substantially deeper. The £299 service must involve real human judgement and practical remediation, not simply a longer automated report.

---

## 2. Free AI Transparency Check

### 2.1 What happens automatically

The visitor enters a public website address.

The existing Crawlee scanner then:

1. Validates the address.
2. Confirms it is a public website.
3. Blocks private networks, local addresses and unsafe redirects.
4. Checks `robots.txt`.
5. Checks `llms.txt`.
6. Looks for a sitemap.
7. Discovers internal links.
8. Estimates how many public pages the site contains.
9. Groups the pages into likely sections.
10. Selects up to six useful representative pages.
11. Reviews those pages for visible AI-transparency evidence.

The six pages should not simply be the first six links. The selector should favour:

- The homepage.
- About page.
- Contact or support page.
- AI, chatbot or service page.
- Blog, news or Insights article.
- Privacy, legal or AI policy.
- A representative media-heavy page.
- A page containing an interactive AI feature.

Only six pages are opened and analysed, but the wider website can still be mapped or inventoried without reading every page.

### 2.2 Firecrawl use

Firecrawl is not used by default for the free scan.

The free scan uses:

- Sitemap discovery.
- Normal HTTP requests.
- Crawlee and Cheerio.
- Public HTML and metadata.
- Deterministic checks.

If a page requires substantial JavaScript and cannot be read reliably, the free result should say:

> This page could not be fully examined by the free public scan.

That limitation becomes a legitimate reason to offer the detailed report.

### 2.3 What the visitor receives

#### AI-transparency visibility score

Example:

```text
AI Transparency Visibility: 58/100
Needs attention
```

It must be called a **visibility score** or **public-evidence score**, not a compliance score.

Suggested bands:

| Score | Result |
|---:|---|
| 80–100 | Strong visible evidence |
| 60–79 | Generally visible, with gaps |
| 40–59 | Important evidence is unclear |
| 20–39 | Weak public transparency |
| 0–19 | Very little visible evidence |

#### Four understandable categories

Instead of only presenting 16 technical checks, group the result into business-readable categories:

```text
AI interactions             70%
Generated content labels    35%
Human responsibility        60%
Technical provenance        25%
```

The individual technical checks can remain underneath.

#### Business explanation

Example:

> We found a general AI disclosure and an accessible human contact route. We could not find clear item-level labels on several illustrative images. The site's public policy helps, but visitors may still be unsure which individual content was created or materially altered using AI.

#### Three highest-priority actions

For example:

1. Add an AI notice at the beginning of the chatbot interaction.
2. Place labels beside individual AI-created images.
3. Add a named human editorial-responsibility statement to relevant articles.

#### Exact reviewed scope

The result must state exactly what happened:

```text
47 public URLs discovered
6 pages examined
12 relevant signals found
3 signals not found within the reviewed scope
2 items require owner confirmation
```

This prevents a six-page sample from being mistaken for a complete assessment.

### 2.4 Customer details and access

The free scan should not require an account.

The strongest funnel is:

1. Let the visitor see the result first.
2. Offer to email the result or unlock the detailed report.
3. Request their email when they choose the £2.99 product.

A registration wall before the result would reduce usage.

The free service can still apply:

- Three scans per visitor per day.
- Rate limits.
- Domain cooldowns.
- Bot protection.
- A safe maximum mapping size.

---

## 3. £2.99 automated Archie report

Suggested name:

> **Archie Detailed AI Transparency Report — £2.99**

This is a one-off, low-friction purchase.

The customer provides:

- Name.
- Email address.
- Website address.
- Confirmation that they are authorised to request the public review.
- Payment through Stripe.

They should not need to create a conventional password.

### 3.1 Five owner questions

After payment, ask:

1. Does your website contain a chatbot, AI assistant or automated conversation?
2. Do you use AI-generated or materially AI-altered images?
3. Do you publish AI-assisted text, articles or public-interest information?
4. Do you use synthetic audio, video, avatars or deepfakes?
5. Do any website features process voice, camera, biometric or emotion-related information?

Available answers:

```text
Yes
No
Unsure
```

This provides the **owner truth** that Archie compares with the **public truth**.

### 3.2 Site-size boundary

#### Up to 50 accessible public pages

The automated £2.99 report can examine every accessible page.

#### 51–250 public pages

The system:

- Maps the discoverable site.
- Selects up to 50 representative pages.
- Clearly labels the report as a sampled review.
- Offers a human review when complete coverage is important.

#### More than 250 public pages

The system must not imply that a £2.99 product can responsibly assess the entire site.

It should:

- Return the map and estimated size.
- Review a small diagnostic sample where appropriate.
- Explain that the site requires scoping.
- Refer the customer to the human service or a custom quotation.

### 3.3 Representative page selection

For sites over 50 pages, select across different page types:

- Main landing pages.
- Product and service pages.
- Blog articles.
- News or public-interest content.
- AI-interaction pages.
- Media-heavy pages.
- Legal and policy pages.
- Contact and support pages.
- Recently updated pages.
- Repeated templates.

If a website has hundreds of articles using the same template, representative examples are more useful than spending resources examining near-identical pages.

### 3.4 Collection order

The paid system uses the cheapest adequate collection method first.

#### Stage 1 — Free discovery

Use:

- `robots.txt`.
- Sitemap files.
- Sitemap indexes.
- Internal-link discovery.
- Canonical URLs.
- Page titles and basic headers.

This builds the inventory without Firecrawl.

#### Stage 2 — Direct Crawlee extraction

Attempt to collect every selected page using the existing crawler.

Extract:

- Visible text.
- Headings.
- Links.
- Image URLs.
- Alt text.
- Captions.
- Metadata.
- Structured data.
- Relevant script references.
- AI-disclosure language.
- Chatbot entry points.
- Public policy links.

Firecrawl is still not used if direct extraction is reliable.

#### Stage 3 — Browser rendering where needed

Some meaningful content appears only after JavaScript runs.

Those pages can be rendered through a controlled browser worker or Crawlee's browser-based crawler. This avoids using Firecrawl for ordinary static pages.

#### Stage 4 — Firecrawl fallback

Use Firecrawl only where it adds clear value:

- JavaScript-heavy pages that cannot otherwise be extracted reliably.
- Pages where important content is absent from raw HTML.
- Selected screenshots.
- Difficult layouts.
- Dynamic chatbot or disclosure surfaces.
- Pages where the local crawler produces incomplete evidence.
- High-priority pages identified by Archie.

A 50-page report therefore does not automatically mean 50 Firecrawl credits.

Example:

```text
50 pages mapped
43 pages collected directly
5 pages rendered using the controlled browser worker
2 difficult pages sent to Firecrawl
```

More complicated JavaScript applications may need greater Firecrawl use, so each £2.99 order must have a maximum Firecrawl budget.

### 3.5 Media and image analysis

The detailed report should create an inventory of:

- Images.
- Video.
- Audio.
- Avatars.
- Embedded media.
- Captions and labels.
- Nearby disclosure language.
- C2PA or Content Credentials signals where available.
- Relevant metadata that survives public delivery.

Archie must not say that an asset is definitely AI-generated unless the evidence establishes that conclusion.

Permitted result language includes:

```text
Visible AI label found
Content Credentials found
Owner confirms AI generation but no nearby label was found
No public provenance signal was detected
Visual origin cannot be determined from appearance alone
```

This is more defensible and useful than relying on an uncertain visual AI detector.

### 3.6 Screenshots

The £2.99 report does not need a screenshot of every page.

Capture screenshots for:

- Homepage.
- Primary AI interaction.
- Strongest disclosure example.
- Most important missing-disclosure example.
- Representative generated-media page.
- Relevant policy or editorial-responsibility page.

A practical limit is approximately five to eight screenshots.

### 3.7 Archie's role

Once collection is complete, Archie receives a structured evidence package rather than unrestricted control of the website.

The package contains:

- Reviewed URLs.
- Collection timestamps.
- Extracted public text.
- Relevant HTML and metadata.
- Media inventory.
- Screenshots.
- C2PA and provenance observations.
- Owner-questionnaire answers.
- Collection failures.
- Exact reviewed scope.

Archie retrieves relevant approved evidence from `archie_knowledge`, including:

- The EU AI Act.
- European Commission Article 50 guidance.
- European Commission Article 50 FAQ.
- Transparency Code of Practice.
- C2PA Technical Specification.
- C2PA UX Guidance.

She then explains the result using the observed website evidence and approved sources.

### 3.8 What the customer receives

#### Secure browser report

A private report page accessed through a secure, expiring link.

#### Downloadable PDF

The PDF contains:

1. Executive summary.
2. AI-transparency visibility score.
3. Site size and reviewed scope.
4. Owner-declared AI use.
5. Public evidence found.
6. Gaps between owner truth and public truth.
7. Page-by-page findings.
8. Media and image-disclosure findings.
9. AI-interaction and human-handover findings.
10. Technical-provenance findings.
11. Screenshots and evidence excerpts.
12. Prioritised repair plan.
13. Suggested disclosure wording.
14. Uncertainties requiring human confirmation.
15. Relevant source references.
16. Clear scope and limitations.

#### Practical copy

Where applicable, provide usable drafts for:

- Chatbot first-contact disclosure.
- AI-image caption.
- AI-assisted article disclosure.
- Human editorial-responsibility statement.
- General AI-transparency policy paragraph.

### 3.9 Cost protection

The £2.99 workflow needs hard limits:

```text
Maximum pages fully examined: 50
Maximum screenshots: 8
Maximum Firecrawl calls: configurable
Maximum media assets inventoried: approximately 200
Maximum report-generation attempts: 1 plus a controlled retry
Maximum processing time: defined job timeout
```

If a limit is reached, the report states what was and was not covered. It must never silently spend unlimited credits.

---

## 4. £299 human AI-transparency review

Suggested name:

> **AiGENCY Human AI Transparency Review — £299**

This is not simply Archie's £2.99 report with more pages. It adds Karl's judgement, context and responsibility.

### 4.1 When to recommend it

Recommend the human review when:

- The site contains more than 50 significant pages.
- It has more than 250 discoverable URLs.
- It uses several AI systems.
- It publishes news, public-interest or regulated information.
- It contains synthetic audio or video.
- It uses biometric, emotion, camera or voice processing.
- The owner's answers conflict with what is publicly visible.
- Important evidence remains uncertain.
- The customer needs disclosure wording reviewed.
- The customer wants support implementing repairs.
- The website's developer needs a technical action plan.
- The organisation requires a human-reviewed result.

### 4.2 Base £299 scope

The base service should include:

- Archie automated evidence report.
- Review of up to 50 priority pages.
- Wider site map and template analysis.
- Owner questionnaire.
- A 45–60 minute call.
- Human validation of important findings.
- Review of the customer's actual AI use.
- Prioritised remediation plan.
- Disclosure-language recommendations.
- Developer implementation brief.
- One follow-up recheck within 30 days.
- Final human-reviewed report.

For very large or highly regulated sites, £299 becomes the initial review price, followed by a custom quotation for extensive remediation.

### 4.3 What the customer receives

#### Human-reviewed findings

Karl determines which automated findings are meaningful and which are false positives, edge cases or incomplete.

#### Disclosure architecture

The review covers:

- First interaction.
- Item-level media labelling.
- Site-wide policy.
- Human handover.
- Editorial responsibility.
- Technical provenance.
- Accessibility of notices.
- Mobile presentation.
- Repeated templates.
- Developer responsibilities.

#### Developer brief

The implementation document contains:

- Affected URLs and templates.
- Exact placement recommendations.
- Suggested wording.
- Structured-data or metadata recommendations.
- C2PA-preservation considerations.
- CDN and image-processing concerns.
- Verification checklist.

#### Recheck

After the customer makes changes, rerun relevant checks and confirm whether the public evidence has improved.

```text
Evidence → explanation → repair → verification
```

---

## 5. Dashboard decision

### 5.1 MVP recommendation

The first version does not need a conventional customer dashboard.

A full dashboard adds:

- Authentication.
- Password recovery.
- Account management.
- More personal data.
- More support work.
- Greater Supabase and security complexity.
- More screens before the customer receives value.

That is excessive for a £2.99 one-off purchase.

### 5.2 Secure report portal

The first version should instead provide:

- A secure report link.
- Email access.
- Current job status.
- Browser report.
- PDF download.
- Human-review upgrade button.
- A button to request another scan.

The report page can show:

```text
Payment confirmed
Mapping website
Reviewing 34 pages
Examining media
Archie is assembling the report
Report ready
```

This provides the useful part of a dashboard without requiring a password-based account platform.

### 5.3 When a full dashboard becomes worthwhile

Build a dashboard when introducing:

- Archie Watch.
- Scheduled rescans.
- Multiple websites per customer.
- Historical score comparisons.
- Team members.
- Developer task tracking.
- Repeated reports.
- Subscription billing.
- Alerts.

The later dashboard could show:

```text
Current visibility score
Previous score
New or changed pages
New unlabelled media
Disclosures that disappeared
Open repair actions
Monitoring history
Reports and invoices
```

The recommended sequence is:

1. Secure report portal without passwords.
2. Full dashboard for recurring customers and Archie Watch.

---

## 6. Commercial funnel

### 6.1 Traffic sources

Visitors may arrive through:

- Google search.
- AI, AEO and GEO recommendations.
- AiGENCY's AI-transparency page.
- Article 50 articles and Insights.
- Archie's public identity.
- A2A discovery later.
- Direct searches for AI-transparency checks.

### 6.2 Conversion stages

#### Stage 1 — Curiosity

> Is my website clearly explaining how it uses AI?

The visitor enters the domain without registering.

#### Stage 2 — Useful concern

The free result shows:

- A score.
- Real evidence.
- A limited six-page scope.
- Practical gaps.

#### Stage 3 — Low-risk purchase

> Review up to 50 pages and give me the detailed Archie report for £2.99.

At £2.99, the purchase requires little deliberation.

#### Stage 4 — Owner truth

The questionnaire reveals whether the business uses AI in ways that are not publicly disclosed.

Example:

> You told us that AI-generated images are used across the website. We found a general footer statement, but no item-level disclosure on the reviewed images.

#### Stage 5 — Human support

> AiGENCY can review this with you and your developer for £299.

The £299 service is justified by interpretation and implementation support, not fear.

#### Stage 6 — Monitoring

After repairs:

> Archie Watch can check whether future pages and media continue to carry the expected disclosures.

---

## 7. Recommended service boundaries

| Website size | Free scan | £2.99 report | Human route |
|---|---|---|---|
| 1–6 pages | Review all accessible pages | Full detailed review | Optional |
| 7–50 pages | Map site and review six | Review all accessible pages | Offered where uncertainty exists |
| 51–250 pages | Map site and review six | Representative review of up to 50 pages | Recommended for complete review |
| More than 250 pages | Map to a safe limit and review a small sample | Diagnostic sample only | Human scoping required |
| Complex or regulated AI use | Bounded public result | Automated evidence report | Human review strongly recommended |
| Access-controlled site | Record blocked scope | Review accessible public material only | Arrange authorised evidence separately |

---

## 8. Central promise

The product must not promise:

> We can magically detect all AI.

The credible promise is:

> We show what your visitors can see about your use of AI, compare that with what you tell us is actually happening, identify the gap, and explain what to repair.

The operating model is:

```text
PUBLIC TRUTH
What can an ordinary visitor actually see?

OWNER TRUTH
How does the organisation say it actually uses AI?

THE GAP
Where does actual AI use lack clear public evidence?

REPAIR
What should be labelled, disclosed, rewritten or moved?

PROOF
Can the organisation show that the repair is now visible and traceable?
```

The free scanner begins with public truth.

The £2.99 Archie report deepens the evidence and introduces owner truth.

The £299 human service resolves uncertainty, interprets the gap and supports repair.

Archie Watch can preserve proof over time.

---

## 9. Product identity

Recommended presentation:

```text
AI Transparency Check
Powered by AiGENCY Ltd
Reviewed by Archie
```

The service is a public-evidence AI-transparency health check informed by Article 50. It is not legal advice, certification or a definitive determination of content origin.
