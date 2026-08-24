import dns from "node:dns/promises";
import { isIP } from "node:net";
import { CheerioCrawler, Configuration } from "crawlee";

const MAX_PUBLIC_HTML_PAGES = 6;
const MAX_REQUESTS = MAX_PUBLIC_HTML_PAGES + 2;
const REQUEST_TIMEOUT_MS = 8_000;
const USER_AGENT = "AiGENCY-Article50-Review/0.1 (+https://aigency.ltd/ai-transparency.html)";

export class ScanInputError extends Error {}
export class ScanUnavailableError extends Error {}

function isPublicIpv4(address) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (a === 198 && (b === 18 || b === 19 || b === 51)) return false;
  if (a === 203 && b === 0) return false;
  return true;
}

function isPublicIp(address) {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family !== 6) return false;

  const normalised = address.toLowerCase();
  if (normalised === "::" || normalised === "::1" || normalised.startsWith("fe8") || normalised.startsWith("fe9") || normalised.startsWith("fea") || normalised.startsWith("feb")) return false;
  if (normalised.startsWith("fc") || normalised.startsWith("fd") || normalised.startsWith("2001:db8")) return false;
  if (normalised.startsWith("::ffff:")) return isPublicIpv4(normalised.slice(7));
  return true;
}

function isBlockedHostname(hostname) {
  const value = hostname.toLowerCase().replace(/\.$/, "");
  return value === "localhost" || value.endsWith(".localhost") || value.endsWith(".local") || value.endsWith(".internal");
}

async function resolvePublicAddresses(hostname, resolver = dns.lookup) {
  if (isBlockedHostname(hostname)) throw new ScanInputError("Local and internal addresses cannot be reviewed.");
  const directFamily = isIP(hostname);
  const addresses = directFamily
    ? [{ address: hostname, family: directFamily }]
    : await resolver(hostname, { all: true, verbatim: true });

  if (!Array.isArray(addresses) || addresses.length === 0) throw new ScanInputError("That website could not be resolved.");
  if (addresses.some(({ address }) => !isPublicIp(address))) {
    throw new ScanInputError("Only publicly reachable websites can be reviewed.");
  }
  return addresses;
}

export async function validatePublicTarget(rawUrl, { resolver = dns.lookup } = {}) {
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0 || rawUrl.trim().length > 2_048) {
    throw new ScanInputError("Please enter a public website address.");
  }

  let target;
  try {
    target = new URL(rawUrl.trim().includes("://") ? rawUrl.trim() : `https://${rawUrl.trim()}`);
  } catch {
    throw new ScanInputError("Please enter a valid website address.");
  }

  if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) {
    throw new ScanInputError("Please enter a public http or https website address.");
  }

  target.hash = "";
  await resolvePublicAddresses(target.hostname, resolver);
  return target;
}

function safeDnsLookup(resolver = dns.lookup) {
  return (hostname, options, callback) => {
    resolvePublicAddresses(hostname, resolver)
      .then((addresses) => {
        if (options?.all) return callback(null, addresses);
        return callback(null, addresses[0].address, addresses[0].family);
      })
      .catch((error) => callback(error));
  };
}

function compactText(value, maxLength = 260) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

function evidence(url, text) {
  const snippet = compactText(text);
  return snippet ? { url, snippet } : null;
}

function findTextEvidence(page, pattern) {
  const match = page.text.match(pattern);
  if (!match) return null;
  const index = match.index || 0;
  return evidence(page.url, page.text.slice(Math.max(0, index - 90), index + match[0].length + 150));
}

function findHtmlEvidence(page, pattern) {
  const match = page.html.match(pattern);
  if (!match) return null;
  const index = match.index || 0;
  return evidence(page.url, page.html.slice(Math.max(0, index - 70), index + match[0].length + 160).replace(/<[^>]*>/g, " "));
}

function firstEvidence(pages, detector) {
  for (const page of pages) {
    const result = detector(page);
    if (result) return result;
  }
  return null;
}

function check(id, title, status, detail, foundEvidence = null, nextStep = "") {
  return {
    id,
    title,
    status,
    detail,
    evidence: foundEvidence,
    next_step: nextStep || undefined,
  };
}

function makeObservation({ $, request, body }) {
  const url = request.loadedUrl || request.url;
  const html = $.html() || String(body || "");
  const text = compactText($("body").text() || $.root().text(), 30_000);
  const links = $("a[href]").map((_, node) => ({
    href: $(node).attr("href") || "",
    text: compactText($(node).text(), 180),
  })).get();
  const jsonLd = $("script[type='application/ld+json']").map((_, node) => $(node).text()).get().join("\n");
  const inputs = $("input, textarea, select");
  const labelledControls = inputs.filter((_, node) => {
    const id = $(node).attr("id");
    return Boolean($(node).attr("aria-label") || $(node).attr("title") || (id && $(`label[for='${id.replace(/'/g, "\\'")}']`).length));
  }).length;

  return {
    url,
    text,
    html,
    links,
    jsonLd,
    hasLang: Boolean($("html").attr("lang")),
    hasFormControls: inputs.length > 0,
    hasLabelledControls: inputs.length === 0 || labelledControls === inputs.length,
  };
}

export function buildArticle50Checks({ pages, robotsFound, llmsFound }) {
  const humanRoute = firstEvidence(pages, (page) => {
    const link = page.links.find((item) => /^(mailto:|tel:)/i.test(item.href) || /(?:contact|talk to|speak to|human|support)/i.test(item.text));
    return link ? evidence(page.url, `${link.text || "Contact route"} · ${link.href}`) : null;
  });
  const aiEntry = firstEvidence(pages, (page) => findHtmlEvidence(page, /(?:data-[\w-]*(?:chat|assistant)|(?:class|id|aria-label)=["'][^"']*(?:chat|assistant|copilot|ai-guide)[^"']*["'])/i));
  const aiDisclosure = firstEvidence(pages, (page) => findTextEvidence(page, /(?:you(?:'|’)re|you are) (?:speaking|chatting|interacting) with (?:an )?AI|AI (?:assistant|chatbot|agent|guide)|virtual assistant powered by AI/i));
  const visualLabel = firstEvidence(pages, (page) => findTextEvidence(page, /(?:AI[- ](?:generated|assisted|created)|generated with AI|synthetic image|AI visual)/i));
  const syntheticDisclosure = firstEvidence(pages, (page) => findTextEvidence(page, /(?:synthetic (?:audio|image|video|media)|deepfake|AI[- ]generated (?:audio|video|image|content))/i));
  const c2pa = firstEvidence(pages, (page) => findHtmlEvidence(page, /(?:c2pa|content credentials|contentcredentials)/i));
  const captureSignal = firstEvidence(pages, (page) => findHtmlEvidence(page, /(?:getUserMedia|webcam|camera|microphone|audioinput|videoinput)/i));
  const biometricSignal = firstEvidence(pages, (page) => findTextEvidence(page, /(?:emotion recognition|biometric categorisation|biometric categorization|facial recognition|voice analysis)/i));
  const privacyNotice = firstEvidence(pages, (page) => {
    const link = page.links.find((item) => /(?:privacy|cookie|terms|policy)/i.test(`${item.text} ${item.href}`));
    return link ? evidence(page.url, `${link.text || "Policy route"} · ${link.href}`) : null;
  });
  const organisationSchema = firstEvidence(pages, (page) => /(?:Organization|LocalBusiness|ProfessionalService|Corporation)/i.test(page.jsonLd) ? evidence(page.url, "Organisation schema was present in JSON-LD.") : null);
  const websiteSchema = firstEvidence(pages, (page) => /(?:WebSite|WebPage)/i.test(page.jsonLd) ? evidence(page.url, "Website or WebPage schema was present in JSON-LD.") : null);
  const accessibilityEvidence = firstEvidence(pages, (page) => page.hasLang && page.hasLabelledControls ? evidence(page.url, page.hasFormControls ? "The document language and labels for public form controls were present." : "The document language was declared; no public form controls were found on this page.") : null);

  return [
    check("A50-1.1", "Public AI interaction entry point", aiEntry ? "found" : "confirm", aiEntry ? "A possible AI interaction entry point was visible in the scanned HTML." : "No AI interaction entry point was detected in the scanned HTML. A person should confirm whether one is loaded later or sits behind another journey.", aiEntry, "Confirm the full visitor journey, including any client-rendered widget."),
    check("A50-1.2", "AI disclosure at first interaction", aiDisclosure ? "found" : aiEntry ? "not_found" : "confirm", aiDisclosure ? "AI disclosure language was visible on the public surface." : aiEntry ? "An interaction-like element was found, but no clear AI disclosure was found in the scanned HTML." : "This cannot be assessed without a visible AI interaction point.", aiDisclosure, "Make any relevant AI disclosure clear before meaningful interaction."),
    check("A50-1.3", "Human handover route", humanRoute ? "found" : "not_found", humanRoute ? "A public contact or human route was found." : "No clear public contact, phone, email or human-support route was found in the scanned pages.", humanRoute, "Add a clear route to a person beside relevant automated journeys."),
    check("A50-2.1", "AI-assisted visual disclosure", visualLabel ? "found" : "confirm", visualLabel ? "A public AI-assisted or generated-visual label was found." : "A crawl cannot identify which images were AI-assisted. Confirm whether public visuals need a contextual disclosure.", visualLabel, "Keep any disclosure close to the relevant visual where appropriate."),
    check("A50-2.2", "Synthetic media disclosure", syntheticDisclosure ? "found" : "confirm", syntheticDisclosure ? "Synthetic-media or AI-generated-content language was found." : "No synthetic-media disclosure was found; this is not proof that no relevant media exists.", syntheticDisclosure, "Review any public synthetic audio, image or video against the applicable role and context."),
    check("A50-2.3", "Machine-readable content credentials", c2pa ? "found" : "not_found", c2pa ? "A C2PA or Content Credentials reference was visible in public markup." : "No C2PA or Content Credentials reference was found in the scanned public HTML.", c2pa, "Ask the relevant provider or production workflow for provenance and marking evidence."),
    check("A50-2.4", "Public AI-content marking signal", visualLabel || syntheticDisclosure ? "found" : "confirm", visualLabel || syntheticDisclosure ? "A visible public marking or disclosure signal was found." : "A crawl cannot establish whether every relevant output carries technical marking.", visualLabel || syntheticDisclosure, "Confirm technical marking separately from the public wording."),
    check("A50-3.1", "Camera or microphone capture signal", captureSignal ? "found" : "confirm", captureSignal ? "A public camera, microphone or media-capture signal was found." : "No public media-capture signal was found in the scanned HTML. Dynamic or authenticated flows remain outside this check.", captureSignal, "If capture is used, review the disclosure at the point of exposure."),
    check("A50-3.2", "Emotion or biometric disclosure", biometricSignal ? "found" : "confirm", biometricSignal ? "Public biometric or emotion-recognition language was found." : "This cannot be decided from the scanned public surface alone.", biometricSignal, "Confirm with the system owner whether these capabilities are used."),
    check("A50-4.1", "Deepfake disclosure signal", syntheticDisclosure ? "found" : "confirm", syntheticDisclosure ? "Synthetic-media language that may be relevant to deepfake disclosure was found." : "No conclusion can be drawn about the provenance or context of every public media item.", syntheticDisclosure, "Review any realistic synthetic or manipulated media with a person."),
    check("A50-4.2", "Editorial responsibility for public-interest text", "confirm", "Meaningful human review and editorial responsibility cannot be proven by crawling a public website.", null, "Record the responsible person and the nature of their review where this applies."),
    check("WEB-1", "robots.txt available", robotsFound ? "found" : "not_found", robotsFound ? "A readable robots.txt file was found." : "No readable robots.txt file was found at the scanned site root.", robotsFound ? evidence(robotsFound, "robots.txt was readable at the site root.") : null, "Publish a clear robots.txt file if you want to state crawler guidance."),
    check("WEB-2", "llms.txt available", llmsFound ? "found" : "not_found", llmsFound ? "A readable llms.txt file was found." : "No readable llms.txt file was found at the scanned site root.", llmsFound ? evidence(llmsFound, "llms.txt was readable at the site root.") : null, "Consider publishing an accurate llms.txt as a machine-readable guide."),
    check("WEB-3", "Organisation schema", organisationSchema ? "found" : "not_found", organisationSchema ? "Organisation schema was visible in public JSON-LD." : "No organisation schema was found in the scanned public HTML.", organisationSchema, "Add accurate organisation schema and keep it aligned with public contact information."),
    check("WEB-4", "Website or page schema", websiteSchema ? "found" : "not_found", websiteSchema ? "Website or page schema was visible in public JSON-LD." : "No Website or WebPage schema was found in the scanned public HTML.", websiteSchema, "Add useful page-level structured data where it reflects the public content."),
    check("WEB-5", "Basic public accessibility signals", accessibilityEvidence ? "found" : "not_found", accessibilityEvidence ? "A declared document language and basic public form-label signal were found." : "The scan could not find both a declared document language and labelled public form controls.", accessibilityEvidence, "Check language declaration and labels as part of a real accessibility review."),
  ];
}

function sameSiteFamily(candidate, submitted) {
  const hostname = candidate.toLowerCase();
  const root = submitted.toLowerCase();
  return hostname === root || hostname === `www.${root}` || root === `www.${hostname}`;
}

export async function runArticle50Scan(rawUrl, { resolver = dns.lookup } = {}) {
  const target = await validatePublicTarget(rawUrl, { resolver });
  const pages = [];
  const warnings = [];
  const auxiliary = { robots: null, llms: null };
  const config = new Configuration({ persistStorage: false, purgeOnStart: true, logLevel: "ERROR" });

  const crawler = new CheerioCrawler({
    maxConcurrency: 1,
    maxRequestsPerCrawl: MAX_REQUESTS,
    maxRequestRetries: 0,
    requestHandlerTimeoutSecs: 10,
    respectRobotsTxtFile: { userAgent: USER_AGENT },
    additionalMimeTypes: ["text/plain"],
    preNavigationHooks: [async ({ request }, gotOptions) => {
      const candidate = new URL(request.url);
      if (!sameSiteFamily(candidate.hostname, target.hostname)) {
        throw new ScanInputError("The scanner stays on the website that was submitted.");
      }
      await resolvePublicAddresses(candidate.hostname, resolver);
      gotOptions.dnsLookup = safeDnsLookup(resolver);
      gotOptions.headers = { ...gotOptions.headers, "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,text/plain;q=0.7" };
      gotOptions.timeout = { request: REQUEST_TIMEOUT_MS };
      gotOptions.maxRedirects = 4;
    }],
    requestHandler: async ({ request, response, $, body, enqueueLinks }) => {
      const loadedUrl = new URL(request.loadedUrl || request.url);
      if (!sameSiteFamily(loadedUrl.hostname, target.hostname)) {
        warnings.push("A redirect left the submitted website, so it was not inspected.");
        return;
      }

      const kind = request.userData?.kind;
      if (kind === "robots" || kind === "llms") {
        const text = compactText(body, 400);
        if (response?.statusCode >= 200 && response.statusCode < 300 && text) auxiliary[kind] = request.loadedUrl || request.url;
        return;
      }

      if (pages.length >= MAX_PUBLIC_HTML_PAGES) return;
      pages.push(makeObservation({ $, request, body }));
      const remaining = MAX_PUBLIC_HTML_PAGES - pages.length;
      if (remaining > 0) {
        await enqueueLinks({ strategy: "same-hostname", limit: remaining, respectRobotsTxtFile: { userAgent: USER_AGENT } });
      }
    },
    failedRequestHandler: async ({ request }) => {
      warnings.push(`Could not read ${new URL(request.url).pathname || "the submitted page"}.`);
    },
  }, config);

  try {
    await crawler.run([
      { url: target.href, userData: { kind: "page" } },
      { url: new URL("/robots.txt", target).href, userData: { kind: "robots" } },
      { url: new URL("/llms.txt", target).href, userData: { kind: "llms" } },
    ]);
  } catch (error) {
    if (error instanceof ScanInputError) throw error;
    throw new ScanUnavailableError("The scanner could not read that public website right now.");
  }

  if (!pages.length) throw new ScanUnavailableError("The scanner could not read a public HTML page from that address.");

  const checks = buildArticle50Checks({ pages, robotsFound: auxiliary.robots, llmsFound: auxiliary.llms });
  const summary = checks.reduce((totals, item) => ({ ...totals, [item.status]: totals[item.status] + 1 }), { found: 0, not_found: 0, confirm: 0 });
  return {
    scanner: "AiGENCY Article 50 public-surface review",
    version: "0.1-local-build",
    scanned_at: new Date().toISOString(),
    target: { submitted_url: target.href, hostname: target.hostname },
    scope: {
      pages_scanned: pages.length,
      maximum_public_html_pages: MAX_PUBLIC_HTML_PAGES,
      boundary: "Public HTML only. No logins, forms, dashboards, private files, purchases or site changes.",
    },
    summary,
    checks,
    warnings: [...new Set(warnings)].slice(0, 6),
    limitation: "This is an evidence-led public-surface review, not legal advice, certification or a compliance determination."
  };
}
