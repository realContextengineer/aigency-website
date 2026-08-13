import https from "node:https";
import { isIP } from "node:net";

const FUNNEL_SUFFIX = ".ts.net";
const LOOKUP_TIMEOUT_MS = 5_000;
const RELAY_TIMEOUT_MS = 25_000;

async function funnelIpv4Addresses(hostname) {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
    {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    },
  );
  if (!response.ok) throw new Error(`Public DNS lookup failed (${response.status}).`);
  const dns = await response.json();
  const addresses = [...new Set(
    (dns.Answer || [])
      .filter((answer) => answer.type === 1 && isIP(answer.data) === 4)
      .map((answer) => answer.data),
  )];
  if (!addresses.length) throw new Error("Public DNS did not return an IPv4 address for the relay.");
  return addresses;
}

function fetchThroughAddress(url, options, address) {
  return new Promise((resolve, reject) => {
    const upstream = https.request(
      url,
      {
        method: options.method || "GET",
        headers: options.headers,
        timeout: RELAY_TIMEOUT_MS,
        lookup: (_hostname, lookupOptions, callback) => {
          if (lookupOptions.all) return callback(null, [{ address, family: 4 }]);
          return callback(null, address, 4);
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve(new Response(Buffer.concat(chunks), {
            status: response.statusCode || 502,
            headers: response.headers,
          }));
        });
      },
    );
    upstream.on("timeout", () => upstream.destroy(new Error("Arthur relay timed out.")));
    upstream.on("error", reject);
    if (options.body) upstream.write(options.body);
    upstream.end();
  });
}

/**
 * Use ordinary HTTPS first. Netlify's DNS layer currently cannot resolve this
 * Tailscale Funnel hostname; in that one case resolve it through public DoH,
 * then retain the original HTTPS hostname for certificate validation and SNI.
 */
export async function relayFetch(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (error?.cause?.code !== "ENOTFOUND" || !url.hostname.endsWith(FUNNEL_SUFFIX)) throw error;
    const addresses = await funnelIpv4Addresses(url.hostname);
    let lastError = error;
    for (const address of addresses) {
      try {
        return await fetchThroughAddress(url, options, address);
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }
    throw lastError;
  }
}
