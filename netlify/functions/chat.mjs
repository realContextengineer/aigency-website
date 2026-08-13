import { relayFetch } from "./relay.mjs";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

function visitorIp(request) {
  const candidates = [
    request.headers.get("x-nf-client-connection-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0],
  ];
  return candidates.find((value) => /^[0-9a-f:.]{3,45}$/i.test((value || "").trim()))?.trim() || "";
}

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  const relayUrl = (process.env.ARTHUR_RELAY_URL || "").replace(/\/$/, "");
  const relayToken = process.env.ARTHUR_RELAY_TOKEN || "";
  if (!relayUrl || !relayToken) {
    return new Response(JSON.stringify({ error: "Arthur Light is not configured." }), {
      status: 503,
      headers: jsonHeaders,
    });
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 4_096) {
    return new Response(JSON.stringify({ error: "Please keep the chat request short." }), {
      status: 413,
      headers: jsonHeaders,
    });
  }
  let incoming;
  try {
    incoming = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: "That message could not be read." }), {
      status: 400,
      headers: jsonHeaders,
    });
  }
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return new Response(JSON.stringify({ error: "That message could not be read." }), {
      status: 400,
      headers: jsonHeaders,
    });
  }
  const message = typeof incoming.message === "string" ? incoming.message.trim() : "";
  if (!message) {
    return new Response(JSON.stringify({ error: "Please write a message first." }), {
      status: 422,
      headers: jsonHeaders,
    });
  }
  if (message.length > 600) {
    return new Response(JSON.stringify({ error: "Please keep public messages under 600 characters." }), {
      status: 422,
      headers: jsonHeaders,
    });
  }
  const bridgePayload = {
    message,
    ...(typeof incoming.session_id === "string" ? { session_id: incoming.session_id } : {}),
    ...(incoming.article_context && typeof incoming.article_context === "object" ? { article_context: incoming.article_context } : {}),
    ...(typeof incoming.insight_slug === "string" ? { insight_slug: incoming.insight_slug } : {}),
    ...(typeof incoming.insights_context === "boolean" ? { insights_context: incoming.insights_context } : {}),
  };

  try {
    const upstream = await relayFetch(new URL("/api/chat", `${relayUrl}/`), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${relayToken}`,
        "x-aigency-client-ip": visitorIp(request),
      },
      body: JSON.stringify(bridgePayload),
    });
    const text = await upstream.text();
    let body = text;
    try {
      const payload = JSON.parse(text);
      if (payload.audio_url && payload.audio_url.startsWith("/.local-voice/")) {
        const filename = payload.audio_url.slice("/.local-voice/".length);
        if (/^[A-Za-z0-9_-]+\.wav$/.test(filename)) {
          payload.audio_url = `/api/voice/${filename}`;
        }
      }
      body = JSON.stringify(payload);
    } catch {
      // Preserve an upstream non-JSON error as a JSON error for the browser.
      body = JSON.stringify({ error: "Arthur Light returned an invalid response." });
    }
    return new Response(body, { status: upstream.status, headers: jsonHeaders });
  } catch {
    let relayHost = "unknown";
    try {
      relayHost = new URL(relayUrl).hostname;
    } catch {
      // Keep the public error generic even if configuration is malformed.
    }
    console.error("Arthur relay fetch failed", { relayHost });
    return new Response(JSON.stringify({ error: "Arthur Light could not be reached." }), {
      status: 502,
      headers: jsonHeaders,
    });
  }
};
