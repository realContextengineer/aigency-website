const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

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

  try {
    const upstream = await fetch(`${relayUrl}/api/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${relayToken}`,
      },
      body: await request.text(),
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
