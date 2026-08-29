const upstreamBase = "https://wewucfgrtxpolxlxmitq.supabase.co/functions/v1/public-insights";

function htmlError(message, status = 502) {
  return new Response(`<!doctype html><title>Insights unavailable</title><p>${message}</p>`, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function proxyInsights(request, route) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return htmlError("Method not allowed.", 405);
  }

  const upstream = new URL(`${upstreamBase}/${route}`);
  const requestUrl = new URL(request.url);
  if (route === "archive") upstream.search = requestUrl.search;

  let response;
  try {
    response = await fetch(upstream, {
      method: request.method,
      headers: { accept: request.headers.get("accept") || "text/html" },
    });
  } catch {
    return htmlError("The Insights page is temporarily unavailable.");
  }

  // Supabase's public Edge gateway currently labels every response from this
  // function as text/plain and adds a sandbox policy, even though article and
  // archive bodies are complete HTML and the sitemap is XML. This is the
  // browser-breaking boundary: set the known public type at our own origin.
  const contentType = route === "sitemap"
    ? "application/xml; charset=utf-8"
    : "text/html; charset=utf-8";
  const headers = new Headers({
    "content-type": contentType,
    "cache-control": response.headers.get("cache-control") || "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
  });

  return new Response(request.method === "HEAD" ? null : await response.arrayBuffer(), {
    status: response.status,
    headers,
  });
}
