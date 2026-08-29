const SUPABASE_URL = "https://wewucfgrtxpolxlxmitq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fNprfjd08FhOtHorM-IAjw_fJqDYSyr";
const ARTICLE_DISCLOSURE = "This article was generated and researched by Arthur, AiGENCY’s persistent-memory AI. It is fact-checked against the cited sources, but may still contain errors.";
const PUBLIC_SELECT = [
  "slug", "title", "published_at", "updated_at", "category_slug", "display_zone", "display_order",
  "excerpt", "body_markdown", "sources", "author_name", "author_url", "seo_title", "meta_description",
  "canonical_url", "cover_image_path", "cover_image_alt", "ai_disclosure", "ai_assisted"
].join(",");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" })
    .format(date)
    .toUpperCase();
}

function categoryLabel(value) {
  return String(value || "AI INSIGHT").replace(/-/g, " ").toUpperCase();
}

function insightMeta(post) {
  return [formatDate(post.published_at), categoryLabel(post.category_slug)].filter(Boolean).join(" · ");
}

function themeFor(post) {
  const colours = ["training-theme", "warm-theme", "hero-theme", "bronze-theme"];
  const source = String(post?.slug || post?.title || "insight");
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return colours[Math.abs(hash) % colours.length];
}

function inlineMarkdown(value, references) {
  const source = String(value || "");
  const token = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_)/g;
  let html = "";
  let cursor = 0;
  let match;
  while ((match = token.exec(source))) {
    html += escapeHtml(source.slice(cursor, match.index));
    if (match[2] && match[3]) {
      const url = safeUrl(match[3]);
      html += url ? `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[2])}</a>` : escapeHtml(match[0]);
    } else if (match[4]) {
      const url = references.get(match[4].toLowerCase());
      html += url ? `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[4])}</a>` : escapeHtml(match[0]);
    } else if (match[5]) {
      html += `<code>${escapeHtml(match[5])}</code>`;
    } else if (match[6] || match[7]) {
      html += `<strong>${escapeHtml(match[6] || match[7])}</strong>`;
    } else {
      html += `<em>${escapeHtml(match[8] || match[9])}</em>`;
    }
    cursor = token.lastIndex;
  }
  return html + escapeHtml(source.slice(cursor));
}

function markdownHtml(markdown) {
  const references = new Map();
  const lines = String(markdown || "").replace(/\r/g, "").split("\n").filter((rawLine) => {
    const reference = rawLine.trim().match(/^\[([^\]]+)\]:\s*(https?:\/\/\S+)\s*$/);
    if (!reference) return true;
    const url = safeUrl(reference[2]);
    if (url) references.set(reference[1].toLowerCase(), url);
    return false;
  });
  const output = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${inlineMarkdown(paragraph.join(" "), references)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    output.push(`<${list.tag}>${list.items.map((item) => `<li>${inlineMarkdown(item, references)}</li>`).join("")}</${list.tag}>`);
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
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      output.push(`<${heading[1].length === 1 ? "h2" : "h3"}>${inlineMarkdown(heading[2], references)}</${heading[1].length === 1 ? "h2" : "h3"}>`);
    } else if (bullet || numbered) {
      flushParagraph();
      const tag = numbered ? "ol" : "ul";
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return output.join("\n");
}

function articleMarkdown(post) {
  const hasStructuredSources = Array.isArray(post.sources) && post.sources.length > 0;
  return hasStructuredSources
    ? String(post.body_markdown || "").replace(/\n{0,2}#{1,3}\s+Sources\s*\n[\s\S]*$/i, "")
    : String(post.body_markdown || "");
}

function sourceList(post) {
  const sources = Array.isArray(post.sources) ? post.sources : [];
  const items = sources.map((source) => {
    const url = safeUrl(source?.url);
    if (!url) return "";
    const label = source.title || source.publisher || url;
    const publisher = source.publisher ? ` · ${escapeHtml(source.publisher)}` : "";
    return `<li><a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>${publisher}</li>`;
  }).filter(Boolean);
  return items.length ? `<section data-insight-detail-sources><h2>Sources</h2><ul data-insight-detail-sources-list>${items.join("")}</ul></section>` : `<section data-insight-detail-sources hidden><h2>Sources</h2><ul data-insight-detail-sources-list></ul></section>`;
}

function previousInsights(posts, currentPost) {
  const previous = posts.filter((post) => post?.slug && post.slug !== currentPost.slug).slice(0, 6);
  if (!previous.length) return `<section class="insight-previous-stack" data-insight-previous-section hidden><p class="eyebrow">FIELD NOTES CATALOG</p><div data-insight-previous-list></div></section>`;
  const cards = previous.map((post) => {
    const href = `/insights/${encodeURIComponent(post.slug)}/`;
    return `<a class="bento-card ${themeFor(post)} insight-previous-tile" href="${href}" aria-label="Read ${escapeAttribute(post.title || "this Field Note")}"><span class="insight-previous-date">${escapeHtml(insightMeta(post))}</span><span class="insight-previous-title">${escapeHtml(post.title || "Untitled Field Note")}</span><span class="insight-previous-excerpt">${escapeHtml(post.excerpt || "Open this Field Note for Arthur’s practical guidance.")}</span></a>`;
  }).join("");
  return `<section class="insight-previous-stack" data-insight-previous-section aria-label="Field Notes catalog"><p class="eyebrow">FIELD NOTES CATALOG</p><div data-insight-previous-list>${cards}</div></section>`;
}

function articleSchema(post, canonicalUrl, imageUrl) {
  const sources = Array.isArray(post.sources) ? post.sources : [];
  const citations = sources.map((source) => safeUrl(source?.url)).filter(Boolean);
  const author = { "@type": "Organization", name: post.author_name || "AiGENCY Ltd", url: safeUrl(post.author_url) || "https://aigency.ltd/" };
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title || "AI insight",
    description: post.meta_description || post.excerpt || post.title || "AI insight",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
    author,
    publisher: { "@type": "Organization", name: "AiGENCY Ltd", url: "https://aigency.ltd/" },
    citation: citations,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at
  };
  if (imageUrl) schema.image = imageUrl;
  return JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function page(post, posts) {
  const canonicalUrl = safeUrl(post.canonical_url) || `https://aigency.ltd/insights/${encodeURIComponent(post.slug)}/`;
  const pageTitle = post.seo_title || post.title || "AI insight";
  const description = post.meta_description || post.excerpt || "AiGENCY Insight";
  const imageUrl = safeUrl(post.cover_image_path);
  const image = imageUrl
    ? `<div class="insight-detail-media"><img class="insight-detail-image" data-insight-detail-image src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(post.cover_image_alt || post.title || "")}"><span class="insight-image-disclosure" data-insight-detail-image-disclosure>AI-generated image</span></div>`
    : `<div class="insight-detail-media"><img class="insight-detail-image" data-insight-detail-image alt="" hidden><span class="insight-image-disclosure" data-insight-detail-image-disclosure hidden>AI-generated image</span></div>`;
  const theme = themeFor(post);
  return `<!doctype html>
<html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeAttribute(description)}"><meta name="theme-color" content="#0B0F19">
<link rel="icon" type="image/png" href="/assets/aigency-hermes-mark-2026-08.png">
<meta property="og:type" content="article"><meta property="og:title" content="${escapeAttribute(pageTitle)}"><meta property="og:description" content="${escapeAttribute(description)}"><meta property="og:url" content="${escapeAttribute(canonicalUrl)}">${imageUrl ? `<meta property="og:image" content="${escapeAttribute(imageUrl)}">` : ""}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeAttribute(pageTitle)}"><meta name="twitter:description" content="${escapeAttribute(description)}">${imageUrl ? `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}">` : ""}
<title>${escapeHtml(pageTitle)}</title><link rel="canonical" href="${escapeAttribute(canonicalUrl)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/css/style.css?v=talking-avatar-public-v1-aug-2026">
<script type="application/ld+json">${articleSchema(post, canonicalUrl, imageUrl)}</script>
</head><body class="resources-page insights-page insight-detail-page" data-arthur-mode="inline">
<header class="header" role="banner"><a href="/index.html" class="logo" aria-label="AIGENCY.LTD Home"><img src="/assets/video%20:%20logo%20etc/d5ccc9d2-23a8-48d6-8a06-eba3beb6a4c4.png?v=winged-mark-aug-2026" alt="AIGENCY.LTD" class="logo-img"></a><nav aria-label="Main navigation"><ul class="nav-desktop"><li><a href="/index.html">Home</a></li><li><a href="/services.html">Services</a></li><li><a href="/creative-design.html">Design</a></li><li><a href="/training.html">Training</a></li><li><a href="/seo-ai-search-visibility.html">AI Search</a></li><li><a href="/hermes-agents.html">Hermes AI Agents</a></li><li><a href="/insights.html">Insights</a></li><li><a href="/about.html">About</a></li><li><a href="/contact.html" class="nav-cta">Start Here</a></li></ul><button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false"><span></span><span></span><span></span></button></nav></header>
<ul class="nav-mobile" aria-label="Mobile navigation"><li><a href="/index.html">Home</a></li><li><a href="/services.html">Services</a></li><li><a href="/creative-design.html">Design</a></li><li><a href="/training.html">Training</a></li><li><a href="/seo-ai-search-visibility.html">AI Search</a></li><li><a href="/hermes-agents.html">Hermes AI Agents</a></li><li><a href="/insights.html">Insights</a></li><li><a href="/about.html">About</a></li><li><a href="/contact.html" class="nav-cta">Start Here</a></li></ul>
<main class="main" role="main"><section data-insight-detail-section aria-live="polite"><div class="page-intro insights-page-intro" data-insight-detail-loading hidden><p class="eyebrow">ARTHUR’S FIELD NOTES</p><h2 class="insight-detail-status-title">Loading Insight…</h2></div><div class="page-intro insights-page-intro" data-insight-detail><p class="eyebrow" data-insight-detail-meta>${escapeHtml(insightMeta(post))}</p><h1 data-insight-detail-title>${escapeHtml(post.title || "AI insight")}</h1><p class="subtitle" data-insight-detail-excerpt>${escapeHtml(post.excerpt || "")}</p></div>
<div class="bento-grid insights-editorial-grid" data-insight-detail><article class="bento-card span-8 ${theme} article-body" tabindex="-1">${image}<section class="insight-transparency-pill" aria-label="AI transparency notice"><span class="insight-transparency-pill-label">AI transparency</span><p data-insight-detail-disclosure>${escapeHtml(ARTICLE_DISCLOSURE)}</p></section><div class="insight-audio-bar" data-insight-audio><button type="button" class="insight-audio-button" data-insight-speak aria-pressed="false">🔊 Listen to this page</button><button type="button" class="insight-download-button" data-insight-download>↓ Download note</button><p data-insight-audio-status>Uses your browser’s built-in speech playback.</p></div><div class="insight-detail-copy" data-insight-detail-body>${markdownHtml(articleMarkdown(post))}</div><nav class="insight-reading-pagination" data-insight-reading-pagination aria-label="Pages in this Field Note" hidden></nav>${sourceList(post)}</article><aside class="span-4 insight-detail-rail"><section class="bento-card bronze-theme insight-messenger" data-insight-chat aria-labelledby="insight-chat-title"><div class="ai-talk-panel-head ai-talk-arthur-stage"><div class="ai-talk-arthur-portrait ai-talk-arthur-avatar" data-ai-talker-avatar aria-label="Arthur Light animated avatar"><img src="/assets/arthur-ai-intern.png" alt="Arthur Light"><span class="ai-talk-avatar-loading">Preparing Arthur…</span></div><div class="ai-talk-arthur-name"><p class="ai-talk-kicker">PERSISTENT AI INTERN</p><h2 id="insight-chat-title">Arthur Light</h2></div></div><div class="ai-talk-messages" data-insight-chat-messages aria-live="polite"><div class="ai-talk-message ai-talk-message-agent"><p>Hello — I’m Arthur Light. What would you like to explore?</p></div></div><div class="ai-talk-composer"><label class="sr-only" for="insight-chat-input">Ask Arthur Light</label><input id="insight-chat-input" data-insight-chat-input type="text" maxlength="1600" placeholder="Ask a question…"><button type="button" class="ai-talk-send" data-insight-chat-send aria-label="Send question">↗</button></div><p class="insight-chat-limit" data-insight-chat-remaining>5 questions left</p></section>${previousInsights(posts, post)}</aside></div><section class="insight-return-row" aria-label="Insights navigation"><a href="/insights.html" class="btn-primary btn-bronze">Back to Insights</a></section><section class="bento-card bronze-theme insight-detail-error" data-insight-detail-error hidden><p class="eyebrow">INSIGHT UNAVAILABLE</p><h2 class="insight-detail-status-title">That Field Note could not be found.</h2><a href="/insights.html" class="btn-primary btn-bronze">Back to Insights</a></section></section></main>
<footer class="footer"><p>AiGENCY Ltd publishes practical AI guidance for businesses across Bournemouth, Poole, Christchurch, Dorset and beyond.</p><p class="ai-visual-disclosure">Some illustrative visual artwork on this site was generated or assisted by AI; prominent AI-created images are labelled on-page.</p></footer>
<script src="/js/main.js?v=insight-ssr-fallback-v5-aug-2026" defer></script></body></html>`;
}

export function htmlError(message, status = 502) {
  return new Response(`<!doctype html><title>Insights unavailable</title><p>${escapeHtml(message)}</p>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}

async function fetchPublishedInsights(slug) {
  const params = new URLSearchParams({ select: PUBLIC_SELECT, status: "eq.published", order: "published_at.desc,display_order.asc" });
  if (slug) params.set("slug", `eq.${slug}`);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/insights_posts?${params}`, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, accept: "application/json" }
  });
  if (!response.ok) throw new Error("The public Insights feed could not be loaded.");
  return response.json();
}

export async function renderInsight(request, slug) {
  if (request.method !== "GET" && request.method !== "HEAD") return htmlError("Method not allowed.", 405);
  try {
    const [matches, posts] = await Promise.all([fetchPublishedInsights(slug), fetchPublishedInsights()]);
    const post = Array.isArray(matches) ? matches[0] : null;
    if (!post) return htmlError("That Field Note could not be found.", 404);
    return new Response(request.method === "HEAD" ? null : page(post, Array.isArray(posts) ? posts : []), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }
    });
  } catch {
    return htmlError("The Insights page is temporarily unavailable.");
  }
}
