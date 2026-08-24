import assert from "node:assert/strict";
import test from "node:test";
import article50Scan from "../netlify/functions/article50-scan.mjs";
import { ScanInputError, buildArticle50Checks, validatePublicTarget } from "../netlify/functions/lib/article50-scan.mjs";

const publicResolver = async () => [{ address: "93.184.216.34", family: 4 }];

test("accepts a public website and normalises a missing protocol", async () => {
  const target = await validatePublicTarget("example.com/about", { resolver: publicResolver });
  assert.equal(target.href, "https://example.com/about");
});

test("rejects private and loopback targets before any crawl", async () => {
  await assert.rejects(() => validatePublicTarget("http://127.0.0.1:8796", { resolver: publicResolver }), ScanInputError);
  await assert.rejects(() => validatePublicTarget("http://intranet.example", { resolver: async () => [{ address: "10.0.0.4", family: 4 }] }), ScanInputError);
});

test("keeps the report evidence-led and reserves editorial responsibility for confirmation", () => {
  const checks = buildArticle50Checks({
    robotsFound: "https://example.com/robots.txt",
    llmsFound: null,
    pages: [{
      url: "https://example.com/",
      text: "Our AI assistant helps visitors. You are chatting with an AI assistant. Contact our team.",
      html: '<html lang="en"><script type="application/ld+json">{"@type":"Organization"}</script><a href="mailto:hello@example.com">Contact our team</a></html>',
      jsonLd: '{"@type":"Organization"}',
      links: [{ href: "mailto:hello@example.com", text: "Contact our team" }],
      hasLang: true,
      hasFormControls: false,
      hasLabelledControls: true,
    }],
  });
  assert.equal(checks.length, 16);
  assert.equal(checks.find((item) => item.id === "A50-1.2").status, "found");
  assert.equal(checks.find((item) => item.id === "A50-4.2").status, "confirm");
  assert.equal(checks.find((item) => item.id === "WEB-1").status, "found");
});

test("the endpoint refuses malformed and private-target requests", async () => {
  const malformed = await article50Scan(new Request("http://local/api/article50-scan", { method: "POST", body: "not-json" }));
  assert.equal(malformed.status, 400);
  const privateTarget = await article50Scan(new Request("http://local/api/article50-scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: "http://127.0.0.1" }) }));
  assert.equal(privateTarget.status, 422);
});
