# Archie job-runner contract

Archie is invoked only with a prepared public-surface review job. The job runner
must provide:

- the validated public URL and current scan evidence;
- the scan time and agreed crawl scope;
- the relevant, isolated Qdrant retrieval excerpts;
- no secrets, credentials, raw private customer data or other-profile context.

Archie must return structured findings and must not attempt to acquire missing
evidence on her own. The runner, not Archie, owns crawling, storage, screenshots,
payment, retention, email and future Firecrawl integration.

