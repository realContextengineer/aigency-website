import { renderInsight } from "./lib/insights-render.mjs";

export default async (request) => {
  const url = new URL(request.url);
  // Netlify keeps the original public pathname when an internal redirect
  // invokes this function. Its captured redirect query is not guaranteed to
  // be forwarded, so derive the slug from that pathname first.
  const slug = url.pathname.match(/^\/insights\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)?.[1]
    || url.searchParams.get("slug")
    || "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return new Response("Not found", { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return renderInsight(request, slug);
};
