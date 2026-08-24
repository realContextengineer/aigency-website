import { createReadStream, promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import article50Scan from "../netlify/functions/article50-scan.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = Number(process.env.AIGENCY_PORT || 8796);
const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"],
  [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".webp", "image/webp"], [".webm", "video/webm"], [".mp4", "video/mp4"],
]);

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  response.end(JSON.stringify(payload));
}

async function handleApi(request, response) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 3_000) return sendJson(response, 413, { error: "That request is too large." });
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);
  const endpointRequest = new Request("http://127.0.0.1/api/article50-scan", {
    method: request.method,
    headers: { "content-type": request.headers["content-type"] || "application/json", "x-forwarded-for": request.socket.remoteAddress || "local" },
    body: request.method === "GET" || request.method === "HEAD" ? undefined : body,
  });
  const endpointResponse = await article50Scan(endpointRequest);
  response.writeHead(endpointResponse.status, Object.fromEntries(endpointResponse.headers));
  response.end(Buffer.from(await endpointResponse.arrayBuffer()));
}

async function serveFile(request, response, pathname) {
  const decoded = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const target = path.resolve(root, `.${decoded}`);
  if (!target.startsWith(`${root}${path.sep}`)) return sendJson(response, 403, { error: "Forbidden." });
  let stat;
  try { stat = await fs.stat(target); } catch { return sendJson(response, 404, { error: "Not found." }); }
  if (!stat.isFile()) return sendJson(response, 404, { error: "Not found." });
  response.writeHead(200, { "content-type": MIME_TYPES.get(path.extname(target).toLowerCase()) || "application/octet-stream", "x-content-type-options": "nosniff", "referrer-policy": "same-origin" });
  if (request.method === "HEAD") return response.end();
  createReadStream(target).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", `http://${host}`).pathname;
  try {
    if (pathname === "/api/article50-scan") return await handleApi(request, response);
    if (!["GET", "HEAD"].includes(request.method || "")) return sendJson(response, 405, { error: "Method not allowed." });
    return await serveFile(request, response, pathname);
  } catch (error) {
    console.error("Local Article 50 server error", error);
    return sendJson(response, 500, { error: "Local server error." });
  }
});

server.listen(port, host, () => console.log(`Article 50 local preview listening on http://${host}:${port}`));
