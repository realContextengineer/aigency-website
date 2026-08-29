import { proxyInsights } from "./lib/insights-proxy.mjs";

export default async (request) => {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return new Response("Not found", { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return proxyInsights(request, slug);
};
