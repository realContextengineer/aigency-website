export default async (request) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed.", { status: 405 });
  }

  const relayUrl = (process.env.ARTHUR_RELAY_URL || "").replace(/\/$/, "");
  const relayToken = process.env.ARTHUR_RELAY_TOKEN || "";
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/api\/voice\/([A-Za-z0-9_-]+\.wav)$/);
  if (!relayUrl || !relayToken || !match) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    const upstream = await fetch(`${relayUrl}/.local-voice/${match[1]}`, {
      headers: { authorization: `Bearer ${relayToken}` },
    });
    if (!upstream.ok) return new Response("Not found.", { status: upstream.status });
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": "audio/wav",
        "cache-control": "private, max-age=900",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Arthur Light voice is unavailable.", { status: 502 });
  }
};
