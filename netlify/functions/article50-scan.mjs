import { ScanInputError, ScanUnavailableError, runArticle50Scan } from "./lib/article50-scan.mjs";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "same-origin",
};
const RATE_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT = 3;
const recentScans = new Map();

function json(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function visitorKey(request) {
  const address = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  return address.trim().slice(0, 80) || "local";
}

function permitScan(key) {
  const now = Date.now();
  const prior = (recentScans.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (prior.length >= RATE_LIMIT) return false;
  prior.push(now);
  recentScans.set(key, prior);
  return true;
}

export default async (request) => {
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });
  if (!permitScan(visitorKey(request))) return json(429, { error: "Please wait a few minutes before starting another review." });

  let payload;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 2_400) return json(413, { error: "That website address is too long." });
    payload = JSON.parse(body);
  } catch {
    return json(400, { error: "The website address could not be read." });
  }

  try {
    const report = await runArticle50Scan(payload?.url);
    return json(200, report);
  } catch (error) {
    if (error instanceof ScanInputError) return json(422, { error: error.message });
    if (error instanceof ScanUnavailableError) return json(502, { error: error.message });
    console.error("Article 50 scan failed", { name: error?.name, message: error?.message });
    return json(500, { error: "The public-surface review could not be completed." });
  }
};
