import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const siteUrl = "https://aigency.ltd";
const defaultImage = `${siteUrl}/assets/video%20:%20logo%20etc/logo.png`;
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceRoleKey);

type InsightPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body_markdown: string;
  category_slug: string | null;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  author_url: string | null;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  sources: unknown;
  ai_disclosure: string | null;
  ai_image_disclosure: string | null;
  tile_colour: string | null;
};

type LegacyArticle = {
  href: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
};

// These predate the Supabase publishing collection. They remain standalone
// canonical articles and stay visible in the server-rendered archive.
const legacyArticles: LegacyArticle[] = [
  { href: "/blog-us-uk-ai-governance.html", title: "America's AI governance sneeze.", excerpt: "What US developments in agent security, AI standards and enforcement could mean for UK businesses.", publishedAt: "2026-08-04T00:00:00Z", category: "ai-governance" },
  { href: "/blog-chatgpt-business.html", title: "Why your small business needs less AI.", excerpt: "A practical starting point for choosing useful AI over noise.", publishedAt: "2026-07-25T00:00:00Z", category: "human-centred-ai" },
  { href: "/blog-ai-act-chatbots.html", title: "Are your chatbots legal?", excerpt: "What UK businesses should understand about AI disclosures and customer-facing assistants.", publishedAt: "2026-07-23T00:00:00Z", category: "ai-governance" },
  { href: "/blog-gdpr-ai-workflows.html", title: "Is your team leaking customer records?", excerpt: "GDPR-aware habits for using AI tools without exposing unnecessary customer information.", publishedAt: "2026-07-16T00:00:00Z", category: "ai-workflows" },
  { href: "/blog-ai-content-search.html", title: "Why commodity AI content fails.", excerpt: "Why useful experience and clear authorship matter more than generic output.", publishedAt: "2026-07-09T00:00:00Z", category: "ai-search" },
  { href: "/blog-ai-agent-web-readiness.html", title: "Bots, AI agents and your website.", excerpt: "What automated traffic means for structured content, accessible forms and a clear robots policy.", publishedAt: "2026-06-25T00:00:00Z", category: "ai-search" },
  { href: "/blog-human-oversight.html", title: "Human in the loop: why oversight keeps AI human.", excerpt: "The role of review, judgement and accountability in useful AI systems.", publishedAt: "2025-10-21T00:00:00Z", category: "human-centred-ai" },
  { href: "/blog-small-business-bournemouth.html", title: "How AI can help small businesses in Bournemouth.", excerpt: "Practical opportunities for local businesses without losing the human part.", publishedAt: "2025-10-20T00:00:00Z", category: "ai-workflows" },
  { href: "/blog-ethical-agents.html", title: "Ethical AI agents: workflows that respect people.", excerpt: "How to design agent workflows with practical human boundaries.", publishedAt: "2025-10-16T00:00:00Z", category: "human-centred-ai" }
];

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value: unknown) {
  try {
    const candidate = String(value ?? "").trim();
    if (!candidate) return null;
    const parsed = new URL(candidate, siteUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

function safeExternalUrl(value: unknown) {
  const url = safeUrl(value);
  return url && /^https?:\/\//.test(url) ? url : null;
}

function canonicalFor(post: InsightPost) {
  return safeExternalUrl(post.canonical_url) ?? `${siteUrl}/insights/${encodeURIComponent(post.slug)}/`;
}

function imageFor(post: InsightPost) {
  return safeUrl(post.cover_image_path) ?? defaultImage;
}

function coverImageHtml(post: InsightPost, className: string) {
  const image = safeUrl(post.cover_image_path);
  if (!image) return "";
  const alt = post.cover_image_alt || post.title || "";
  const disclosure = post.ai_image_disclosure || "AI-generated image";
  const mediaClass = className === "insight-detail-image"
    ? "insight-detail-media ai-image-frame"
    : "insight-card-media ai-image-frame";
  return `<div class="${mediaClass}"><img class="${className}" src="${escapeHtml(image)}" alt="${escapeHtml(alt)}"><span class="insight-image-disclosure">${escapeHtml(disclosure)}</span></div>`;
}

function toDate(value: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function dateLabel(value: string | null) {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date).toUpperCase()
    : "AI INSIGHT";
}

function categoryLabel(value: string | null) {
  return String(value || "AI insight").replace(/-/g, " ").toUpperCase();
}

function sourceRows(value: unknown) {
  if (!Array.isArray(value)) return [] as Array<Record<string, unknown>>;
  return value.filter((source): source is Record<string, unknown> => Boolean(source && typeof source === "object"));
}

function safeMarkdownLink(label: string, value: string) {
  const url = safeExternalUrl(value);
  if (!url) return escapeHtml(label);
  return `<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(label)}</a>`;
}

function inlineMarkdownToHtml(value: string, references: Map<string, string>) {
  const placeholders: string[] = [];
  const protect = (html: string) => {
    const token = `\u0000${placeholders.length}\u0000`;
    placeholders.push(html);
    return token;
  };

  let source = String(value || "");
  source = source.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, url) =>
    protect(safeMarkdownLink(label, url))
  );
  source = source.replace(/\[([^\]]+)\]/g, (match, label) => {
    const url = references.get(String(label).toLowerCase());
    return url ? protect(safeMarkdownLink(label, url)) : match;
  });
  source = source.replace(/`([^`]+)`/g, (_match, code) => protect(`<code>${escapeHtml(code)}</code>`));
  source = escapeHtml(source)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>");

  return source.replace(/\u0000(\d+)\u0000/g, (_match, index) => placeholders[Number(index)] || "");
}

function markdownToHtml(markdown: string) {
  const references = new Map<string, string>();
  const lines = String(markdown || "").replace(/\r/g, "").split("\n").filter((rawLine) => {
    const reference = rawLine.trim().match(/^\[([^\]]+)\]:\s*(https?:\/\/\S+)\s*$/);
    if (!reference) return true;
    references.set(reference[1].toLowerCase(), reference[2]);
    return false;
  });
  const output: string[] = [];
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${inlineMarkdownToHtml(paragraph.join(" "), references)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    output.push(`<${list.kind}>${list.items.map((item) => `<li>${inlineMarkdownToHtml(item, references)}</li>`).join("")}</${list.kind}>`);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length === 1 ? "h2" : heading[1].length === 2 ? "h3" : "h4";
      output.push(`<${level}>${inlineMarkdownToHtml(heading[2], references)}</${level}>`);
    } else if (bullet || numbered) {
      flushParagraph();
      const kind = numbered ? "ol" : "ul";
      if (!list || list.kind !== kind) {
        flushList();
        list = { kind, items: [] };
      }
      list.items.push(bullet?.[1] ?? numbered?.[1] ?? "");
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return output.join("\n");
}

function siteHeader() {
  return `<header class="header" role="banner"><a href="${siteUrl}/" class="logo" aria-label="AiGENCY Ltd home"><img src="${defaultImage}" alt="AiGENCY Ltd" class="logo-img"></a><nav aria-label="Main navigation"><ul class="nav-desktop"><li><a href="${siteUrl}/services.html">Services</a></li><li><a href="${siteUrl}/training.html">Training</a></li><li><a href="${siteUrl}/seo-ai-search-visibility.html">AI Search</a></li><li><a href="${siteUrl}/hermes-agents.html">AI Agents</a></li><li><a href="${siteUrl}/insights.html">Insights</a></li><li><a href="${siteUrl}/about.html">About</a></li><li><a href="${siteUrl}/ai-health-check.html" class="nav-cta">Start Here</a></li></ul></nav></header>`;
}

function siteFooter() {
  return `<footer class="footer"><p>AiGENCY Ltd publishes practical AI guidance for businesses across Bournemouth, Poole, Christchurch, Dorset and beyond.</p><nav class="footer-links" aria-label="Secondary navigation"><a href="${siteUrl}/insights.html">Insights</a><a href="${siteUrl}/insights/archive/">Article archive</a><a href="${siteUrl}/services.html">Services</a><a href="${siteUrl}/contact.html">Contact</a></nav></footer>`;
}

function documentShell(options: { title: string; description: string; canonical: string; image: string; type: "article" | "website"; schema: Record<string, unknown>; body: string }) {
  const schema = JSON.stringify(options.schema).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(options.title)}</title><meta name="description" content="${escapeHtml(options.description)}"><link rel="canonical" href="${escapeHtml(options.canonical)}"><meta property="og:type" content="${options.type}"><meta property="og:title" content="${escapeHtml(options.title)}"><meta property="og:description" content="${escapeHtml(options.description)}"><meta property="og:url" content="${escapeHtml(options.canonical)}"><meta property="og:image" content="${escapeHtml(options.image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(options.title)}"><meta name="twitter:description" content="${escapeHtml(options.description)}"><meta name="twitter:image" content="${escapeHtml(options.image)}"><link rel="stylesheet" href="${siteUrl}/css/style.css?v=agency-insights-v1"><script type="application/ld+json">${schema}</script></head><body class="resources-page">${options.body}</body></html>`;
}

function htmlResponse(html: string, cacheControl: string, status = 200) {
  return new Response(new Blob([html], { type: "text/html; charset=utf-8" }), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  });
}

function articlePage(post: InsightPost) {
  const canonical = canonicalFor(post);
  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || post.title;
  const image = imageFor(post);
  const sources = sourceRows(post.sources);
  const sourceList = sources.map((source) => {
    const url = safeExternalUrl(source.url);
    if (!url) return "";
    const label = source.title || source.publisher || url;
    const publisher = source.publisher ? ` · ${escapeHtml(source.publisher)}` : "";
    return `<li><a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(label)}</a>${publisher}</li>`;
  }).join("");
  const author: Record<string, unknown> = { "@type": "Person", name: post.author_name || "AiGENCY Ltd" };
  const authorUrl = safeExternalUrl(post.author_url);
  if (authorUrl) author.sameAs = authorUrl;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    mainEntityOfPage: canonical,
    url: canonical,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author,
    publisher: { "@type": "Organization", name: "AiGENCY Ltd", url: siteUrl },
    image,
    citation: sources.map((source) => safeExternalUrl(source.url)).filter(Boolean)
  };
  const disclosure = post.ai_disclosure || "This is AI-generated text. It has been fact-checked against the cited sources, but may still contain errors.";
  const body = `${siteHeader()}<main class="main" role="main"><div class="page-intro"><p class="eyebrow">${escapeHtml(`${dateLabel(post.published_at)} · ${categoryLabel(post.category_slug)}`)}</p><h1>${escapeHtml(post.title)}</h1><p class="subtitle">${escapeHtml(post.excerpt || "")}</p></div><div class="bento-grid"><article class="bento-card span-8 hero-theme article-body">${coverImageHtml(post, "insight-detail-image")}${markdownToHtml(post.body_markdown)}${sourceList ? `<section><h2>Sources</h2><ul>${sourceList}</ul></section>` : ""}</article><aside class="bento-card span-4 bronze-theme"><p class="eyebrow">AI TRANSPARENCY</p><p>${escapeHtml(disclosure)}</p><hr><p class="eyebrow">PUBLISHED BY</p><h2>${escapeHtml(post.author_name || "AiGENCY Ltd")}</h2><a href="${siteUrl}/insights/archive/" class="btn-primary btn-bronze">Browse all Insights</a></aside></div></main>${siteFooter()}`;
  return documentShell({ title, description, canonical, image, type: "article", schema, body });
}

function archivePage(posts: InsightPost[], page: number, count: number) {
  const pageSize = 18;
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const cards = posts.map((post) => `<article class="bento-card span-6 ${post.category_slug === "ai-search" ? "warm-theme" : "hero-theme"} insight-card">${coverImageHtml(post, "insight-card-image")}<div class="insight-card-body"><p class="eyebrow">${escapeHtml(`${dateLabel(post.published_at)} · ${categoryLabel(post.category_slug)}`)}</p><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.excerpt || "")}</p><a href="${siteUrl}/insights/${encodeURIComponent(post.slug)}/" class="btn-primary">Read the Insight</a></div></article>`).join("");
  const previous = page > 1 ? `<a class="btn-primary" href="${siteUrl}/insights/archive/?page=${page - 1}">Newer posts</a>` : "";
  const next = page < pages ? `<a class="btn-primary btn-bronze" href="${siteUrl}/insights/archive/?page=${page + 1}">Older posts</a>` : "";
  const canonical = `${siteUrl}/insights/archive/${page > 1 ? `?page=${page}` : ""}`;
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "AiGENCY Insights archive", url: canonical, isPartOf: { "@type": "WebSite", name: "AiGENCY Ltd", url: siteUrl } };
  const legacyCards = legacyArticles.map((article) => `<article class="bento-card span-6 warm-theme insight-card"><div class="insight-card-body"><p class="eyebrow">${escapeHtml(`${dateLabel(article.publishedAt)} · ${categoryLabel(article.category)}`)}</p><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.excerpt)}</p><a href="${escapeHtml(article.href)}" class="btn-primary btn-bronze">Read the article</a></div></article>`).join("");
  const legacySection = page === 1 ? `<section class="insights-legacy-section" aria-labelledby="legacy-articles-title"><div class="page-intro"><p class="eyebrow">EARLIER PUBLISHED ARTICLES</p><h2 id="legacy-articles-title">The original AiGENCY library.</h2><p class="subtitle">These remain separate, canonical articles while the newer collection is published through the Insights system.</p></div><div class="bento-grid resources-grid">${legacyCards}</div></section>` : "";
  const body = `${siteHeader()}<main class="main" role="main"><div class="page-intro"><p class="eyebrow">AI INSIGHTS ARCHIVE</p><h1>Research and practical guidance.</h1><p class="subtitle">Every published AiGENCY Insight, with evidence sources and clear routes into the full article.</p></div><section class="bento-grid resources-grid" aria-label="Insights archive">${cards || '<article class="bento-card span-12 bronze-theme"><h2>No published Insights yet.</h2><p>The archive will appear here as soon as the first article is published.</p></article>'}</section>${previous || next ? `<nav class="archive-pagination" aria-label="Archive pages">${previous}${next}</nav>` : ""}${legacySection}</main>${siteFooter()}`;
  return documentShell({ title: "AI Insights Archive | AiGENCY Ltd", description: "Browse practical AI, SEO, AEO and GEO research from AiGENCY Ltd.", canonical, image: defaultImage, type: "website", schema, body });
}

function sitemapResponse(posts: Array<Pick<InsightPost, "slug" | "updated_at" | "published_at">>) {
  const urls = [
    `<url><loc>${siteUrl}/insights/archive/</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    ...posts.map((post) => `<url><loc>${siteUrl}/insights/${encodeURIComponent(post.slug)}/</loc>${post.updated_at || post.published_at ? `<lastmod>${escapeHtml((post.updated_at || post.published_at || "").slice(0, 10))}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.6</priority></url>`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
  return new Response(new Blob([xml], { type: "application/xml; charset=utf-8" }), {
    headers: { "content-type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" }
  });
}

async function publishedArticle(slug: string) {
  const { data, error } = await admin.from("insights_posts").select("slug,title,excerpt,body_markdown,category_slug,published_at,updated_at,author_name,author_url,seo_title,meta_description,canonical_url,cover_image_path,cover_image_alt,sources,ai_disclosure,ai_image_disclosure,tile_colour").eq("status", "published").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as InsightPost | null;
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const segments = url.pathname.split("/").filter(Boolean);
  const functionIndex = segments.lastIndexOf("public-insights");
  const route = functionIndex === -1 ? "" : segments.slice(functionIndex + 1).join("/");

  try {
    if (route === "sitemap") {
      const { data, error } = await admin.from("insights_posts").select("slug,updated_at,published_at").eq("status", "published").order("published_at", { ascending: false });
      if (error) throw error;
      return sitemapResponse((data ?? []) as Array<Pick<InsightPost, "slug" | "updated_at" | "published_at">>);
    }
    if (route === "archive" || !route) {
      const pageSize = 18;
      const requestedPage = Number(url.searchParams.get("page") || "1");
      const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
      const start = (page - 1) * pageSize;
      const { data, count, error } = await admin.from("insights_posts").select("slug,title,excerpt,category_slug,published_at,updated_at,author_name,seo_title,meta_description,canonical_url,cover_image_path,cover_image_alt,sources,ai_disclosure,ai_image_disclosure,tile_colour", { count: "exact" }).eq("status", "published").order("published_at", { ascending: false }).range(start, start + pageSize - 1);
      if (error) throw error;
      return htmlResponse(archivePage((data ?? []) as InsightPost[], page, count ?? 0), "public, max-age=60, s-maxage=60, stale-while-revalidate=300");
    }
    const slug = route.split("/")[0];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return htmlResponse("Not found", "no-store", 404);
    const post = await publishedArticle(slug);
    if (!post) return htmlResponse("Not found", "no-store", 404);
    return htmlResponse(articlePage(post), "public, max-age=300, s-maxage=300, stale-while-revalidate=86400");
  } catch (error) {
    console.error("public-insights failed", error);
    return htmlResponse("The Insights page is temporarily unavailable.", "no-store", 503);
  }
});
