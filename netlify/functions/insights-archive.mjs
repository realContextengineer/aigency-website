import { proxyInsights } from "./lib/insights-proxy.mjs";

export default async (request) => proxyInsights(request, "archive");
