(() => {
  const form = document.querySelector("#article50-scan-form");
  const input = document.querySelector("#article50-website");
  const submit = document.querySelector("#article50-scan-submit");
  const result = document.querySelector("#article50-scan-result");
  if (!form || !input || !submit || !result) return;

  const labels = { found: "Found", not_found: "Not found", confirm: "Confirm" };

  function element(name, className, text) {
    const node = document.createElement(name);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function clearResult() {
    result.replaceChildren();
    result.hidden = false;
  }

  function setBusy(busy) {
    input.disabled = busy;
    submit.disabled = busy;
    form.classList.toggle("is-running", busy);
    submit.textContent = busy ? "Reviewing public pages…" : "Run free review";
  }

  function showProgress() {
    clearResult();
    const progress = element("div", "article50-result-progress");
    progress.append(element("span", "article50-result-spinner"));
    const copy = element("div");
    copy.append(element("strong", "", "Reviewing public pages"));
    copy.append(element("p", "", "Checking the website boundary, robots guidance and visible transparency signals. No forms will be submitted and no site changes will be made."));
    progress.append(copy);
    result.append(progress);
  }

  function showError(message) {
    clearResult();
    const error = element("div", "article50-result-error");
    error.append(element("strong", "", "The review could not start"));
    error.append(element("p", "", message));
    result.append(error);
  }

  function checkRow(item) {
    const details = element("details", "article50-result-check");
    const summary = element("summary");
    summary.append(element("span", `article50-result-status is-${item.status}`, labels[item.status] || "Review"));
    const title = element("strong", "", item.title);
    summary.append(title);
    summary.append(element("small", "", item.id));
    details.append(summary);

    const body = element("div", "article50-result-check-body");
    body.append(element("p", "", item.detail));
    if (item.evidence?.snippet) {
      const evidence = element("blockquote", "article50-result-evidence", item.evidence.snippet);
      const link = element("a", "", "Open public evidence ↗");
      link.href = item.evidence.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      evidence.append(document.createElement("br"));
      evidence.append(link);
      body.append(evidence);
    }
    if (item.next_step) body.append(element("p", "article50-result-next", `Next: ${item.next_step}`));
    details.append(body);
    return details;
  }

  function showReport(report) {
    clearResult();
    const heading = element("div", "article50-result-heading");
    const headingCopy = element("div");
    headingCopy.append(element("span", "article50-result-kicker", "PUBLIC-SURFACE REVIEW READY"));
    headingCopy.append(element("strong", "", report.target.hostname));
    headingCopy.append(element("p", "", `${report.scope.pages_scanned} public HTML page${report.scope.pages_scanned === 1 ? "" : "s"} reviewed. Results stay in this browser.`));
    heading.append(headingCopy);
    const score = element("div", "article50-result-score", `${report.checks.length} checks`);
    heading.append(score);
    result.append(heading);

    const summary = element("div", "article50-result-summary");
    ["found", "not_found", "confirm"].forEach((status) => {
      const item = element("span", `is-${status}`);
      item.append(element("b", "", String(report.summary[status])));
      item.append(document.createTextNode(` ${labels[status].toLowerCase()}`));
      summary.append(item);
    });
    result.append(summary);

    const checks = element("div", "article50-result-checks");
    report.checks.forEach((item) => checks.append(checkRow(item)));
    result.append(checks);

    if (report.warnings?.length) {
      const warnings = element("div", "article50-result-warnings");
      warnings.append(element("strong", "", "Review boundaries"));
      const list = element("ul");
      report.warnings.forEach((warning) => list.append(element("li", "", warning)));
      warnings.append(list);
      result.append(warnings);
    }
    result.append(element("p", "article50-result-limitation", report.limitation));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    setBusy(true);
    showProgress();
    try {
      const response = await fetch("/api/article50-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: input.value.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The review could not be completed.");
      showReport(payload);
    } catch (error) {
      showError(error instanceof Error ? error.message : "The review could not be completed.");
    } finally {
      setBusy(false);
    }
  });
})();
