/* ========================================
   AIGENCY.LTD - MAIN JAVASCRIPT
   Mobile Navigation, Quiz Logic & Interactions
   ======================================== */

(function() {
  'use strict';

  // Public Supabase configuration. The publishable key is safe to expose in
  // the static site; Row Level Security controls anonymous access.
  const SUPABASE_URL = 'https://wewucfgrtxpolxlxmitq.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fNprfjd08FhOtHorM-IAjw_fJqDYSyr';
  const AI_ARTICLE_DISCLOSURE = 'This article was generated and researched by Arthur, AiGENCY’s persistent-memory AI. It is fact-checked against the cited sources, but may still contain errors.';

  async function supabaseInsert(table, payload) {
    const response = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const detail = await response.text().catch(function() { return ''; });
      throw new Error(detail || 'The submission could not be saved.');
    }
  }

  // ========== INSIGHTS PUBLISHING ==========
  // The published table is the complete public catalogue. The newest published
  // article leads the page; the archive below retains every published note.
  async function supabaseSelect(table, query) {
    const response = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, {
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('The public Insights feed could not be loaded.');
    }
    return response.json();
  }

  const PUBLIC_INSIGHTS_SELECT = [
    'slug', 'title', 'published_at', 'updated_at', 'category_slug',
    'display_zone', 'display_order', 'excerpt', 'body_markdown', 'sources',
    'author_name', 'author_url', 'seo_title', 'meta_description',
    'canonical_url', 'cover_image_path', 'cover_image_alt', 'ai_disclosure'
  ].join(',');

  function publishedInsightsQuery(order) {
    return 'select=' + PUBLIC_INSIGHTS_SELECT
      + '&status=eq.published&order=' + (order || 'published_at.desc,display_order.asc');
  }

  const insightColourThemes = {
    emerald: 'training-theme',
    green: 'training-theme',
    orange: 'warm-theme',
    'burnt-orange': 'warm-theme',
    blue: 'hero-theme',
    cobalt: 'hero-theme',
    plum: 'bronze-theme',
    ruby: 'bronze-theme'
  };

  // Covers generated retrospectively for the existing public archive. A
  // Supabase cover_image_* value still wins when an editor has supplied one.
  const insightLocalImages = {
    // One-off correction: the original generated cover accidentally included
    // misspelt lettering. This local replacement is intentionally text-free.
    'what-changed-in-ai-this-weekend-capability-containment': 'assets/generated/insight-capability-containment-text-free-v1.png',
    'ai-agents-identities-wallets-small-businesses': 'assets/generated/insight-ai-agents-identities-wallets-v1.png',
    'legacy-governance': 'assets/generated/insight-ai-governance-sneeze-v1.png',
    'legacy-ai-act': 'assets/generated/insight-ai-act-chatbots-v1.png',
    'legacy-gdpr': 'assets/generated/insight-gdpr-ai-workflows-v1.png',
    'legacy-content': 'assets/generated/insight-ai-content-search-v1.png',
    'legacy-web-readiness': 'assets/generated/insight-ai-agent-web-readiness-v1.png',
    'legacy-less-ai': 'assets/generated/insight-less-ai-v1.png',
    'legacy-bournemouth': 'assets/generated/insight-small-business-bournemouth-v1.png',
    'legacy-oversight': 'assets/generated/insight-human-oversight-v1.png',
    'legacy-ethical-agents': 'assets/generated/insight-ethical-agents-v1.png'
  };

  const insightColourKeys = ['emerald', 'orange', 'blue', 'plum'];

  function insightStoredColour(post) {
    const raw = String(post && (post.tile_colour || post.tile_color || post.colour || '')).trim().toLowerCase();
    return insightColourThemes[raw] ? raw : '';
  }

  function insightFallbackColour(post) {
    // A slug hash gives each new post a random-looking colour once, without
    // reshuffling the archive on every reload. Telegram/Supabase can override
    // it later by persisting tile_colour on the post record.
    const source = String(post && (post.slug || post.title || 'insight'));
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
    }
    return insightColourKeys[Math.abs(hash) % insightColourKeys.length];
  }

  function insightThemeFor(post, variant) {
    const stored = insightStoredColour(post);
    if (stored) return insightColourThemes[stored];
    // Every card, including the pinned/latest cards, gets the same
    // random-looking palette assignment. A saved tile_colour remains the
    // authoritative choice; the slug hash only supplies a stable fallback
    // for older posts so colours do not reshuffle on every reload.
    return insightColourThemes[insightFallbackColour(post)];
  }

  // The original, still-public AiGENCY articles remain in the library while
  // Arthur's Supabase collection grows. New database articles lead the page;
  // these links preserve the existing archive rather than making it disappear.
  const legacyInsights = [
    { slug: 'legacy-governance', href: '/blog-us-uk-ai-governance.html', title: "America's AI governance sneeze.", excerpt: 'What US developments in agent security, AI standards and enforcement could mean for UK businesses.', category_slug: 'ai-governance', published_at: '2026-08-04T00:00:00Z' },
    { slug: 'legacy-ai-act', href: '/blog-ai-act-chatbots.html', title: 'Are your chatbots legal?', excerpt: 'What UK businesses should understand about AI disclosures and customer-facing assistants.', category_slug: 'ai-governance', published_at: '2026-07-23T00:00:00Z' },
    { slug: 'legacy-gdpr', href: '/blog-gdpr-ai-workflows.html', title: 'Is your team leaking customer records?', excerpt: 'GDPR-aware habits for using AI tools without exposing unnecessary customer information.', category_slug: 'ai-workflows', published_at: '2026-07-16T00:00:00Z' },
    { slug: 'legacy-content', href: '/blog-ai-content-search.html', title: 'Why commodity AI content fails.', excerpt: 'Why useful experience and clear authorship matter more than generic output.', category_slug: 'ai-search', published_at: '2026-07-09T00:00:00Z' },
    { slug: 'legacy-web-readiness', href: '/blog-ai-agent-web-readiness.html', title: 'Bots, AI agents and your website.', excerpt: 'What automated traffic means for structured content, accessible forms and a clear robots policy.', category_slug: 'ai-search', published_at: '2026-06-25T00:00:00Z' },
    { slug: 'legacy-less-ai', href: '/blog-chatgpt-business.html', title: 'Why your small business needs less AI.', excerpt: 'A practical starting point for choosing useful AI over noise.', category_slug: 'human-centred-ai', published_at: '2026-05-28T00:00:00Z' },
    { slug: 'legacy-bournemouth', href: '/blog-small-business-bournemouth.html', title: 'How AI can help small businesses in Bournemouth.', excerpt: 'Practical opportunities for local businesses without losing the human part.', category_slug: 'ai-workflows', published_at: '2026-05-14T00:00:00Z' },
    { slug: 'legacy-oversight', href: '/blog-human-oversight.html', title: 'Human in the loop: why oversight keeps AI human.', excerpt: 'The role of review, judgement and accountability in useful AI systems.', category_slug: 'human-centred-ai', published_at: '2026-04-30T00:00:00Z' },
    { slug: 'legacy-ethical-agents', href: '/blog-ethical-agents.html', title: 'Ethical AI agents: workflows that respect people.', excerpt: 'How to design agent workflows with practical human boundaries.', category_slug: 'human-centred-ai', published_at: '2026-04-16T00:00:00Z' }
  ];

  function insightCategoryLabel(slug) {
    return String(slug || 'AI INSIGHT').replace(/-/g, ' ').toUpperCase();
  }

  function insightDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date).toUpperCase();
  }

  function insightMeta(post) {
    const parts = [insightDate(post.published_at), insightCategoryLabel(post.category_slug)].filter(Boolean);
    return parts.join(' · ');
  }

  function insightLink(slug) {
    // Local preview has no Netlify rewrite layer, so it opens the reusable
    // AiGENCY article view directly. Production keeps the clean article URL.
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
      return '/insight.html?slug=' + encodeURIComponent(slug);
    }
    return '/insights/' + encodeURIComponent(slug) + '/';
  }

  function homepageInsightLink(post) {
    return post && post.href ? post.href : insightLink(post && post.slug);
  }

  function createInsightElement(tag, text, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function insightImage(post) {
    const candidate = (post && insightLocalImages[post.slug])
      || (post && (post.cover_image_path || post.featured_image_path || post.cover_image_url));
    if (!candidate) return null;
    try {
      const url = new URL(candidate, window.location.origin);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
    } catch (error) {
      return null;
    }
  }

  function insightImageDisclosure(post) {
    const supplied = String(post && post.ai_image_disclosure || '').trim();
    return supplied || 'AI-generated image';
  }

  function renderInsightCard(card, post, variant) {
    const isLatest = variant === 'latest';
    const isFeatured = variant === 'featured';
    const theme = insightThemeFor(post, variant);
    const isLibrary = variant === 'library';
    card.className = 'bento-card ' + (isLibrary ? 'span-3 ' : 'span-6 ') + theme + ' insight-card' + (isLatest || isFeatured ? ' insight-card--lead' : '') + (isLibrary ? ' insight-card--library' : '') + (isLatest ? ' insight-card--latest' : '') + (isFeatured ? ' insight-card--featured' : '');
    card.hidden = false;
    const body = document.createElement('div');
    body.className = 'insight-card-body';
    body.appendChild(createInsightElement('p', (isLatest ? 'LATEST INSIGHT · ' : isFeatured ? 'PINNED RESEARCH · ' : '') + insightMeta(post), 'eyebrow'));
    body.appendChild(createInsightElement(isLatest || isFeatured ? 'h2' : 'h3', post.title || 'New AI insight'));
    body.appendChild(createInsightElement('p', post.excerpt || ''));
    const link = createInsightElement('a', 'Read the Insight', 'btn-primary' + (theme === 'bronze-theme' ? ' btn-bronze' : ''));
    link.href = post.href || insightLink(post.slug);
    body.appendChild(link);
    const imageUrl = insightImage(post);
    if (imageUrl) {
      const media = document.createElement('div');
      media.className = 'insight-card-media';
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = post.cover_image_alt || post.title || '';
      image.loading = isLatest ? 'eager' : 'lazy';
      media.appendChild(image);
      media.appendChild(createInsightElement('span', insightImageDisclosure(post), 'insight-image-disclosure'));
      card.replaceChildren(media, body);
    } else {
      card.replaceChildren(body);
    }
  }

  function renderEmptyLeadCard(card, role) {
    const isFeatured = role === 'featured';
    card.className = 'bento-card span-6 ' + (isFeatured ? 'hero-theme' : 'warm-theme') + ' insight-card insight-card--lead insight-card--empty';
    card.hidden = false;
    const body = document.createElement('div');
    body.className = 'insight-card-body';
    body.appendChild(createInsightElement('p', isFeatured ? 'PINNED RESEARCH' : 'LATEST INSIGHT', 'eyebrow'));
    body.appendChild(createInsightElement('h2', isFeatured ? 'Important research will appear here.' : 'The next published Insight will appear here.'));
    body.appendChild(createInsightElement('p', isFeatured
      ? 'Arthur can place an enduring piece of work here by marking it Featured in the Insights desk.'
      : 'Published Insights are drawn directly from Arthur’s Supabase collection.'));
    card.replaceChildren(body);
  }

  function appendInlineMarkdown(container, value, references) {
    const source = String(value || '');
    const token = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_)/g;
    let cursor = 0;
    let match;

    while ((match = token.exec(source))) {
      if (match.index > cursor) container.appendChild(document.createTextNode(source.slice(cursor, match.index)));
      if (match[2] && match[3]) {
        const url = safeExternalUrl(match[3]);
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = match[2];
          container.appendChild(link);
        } else {
          container.appendChild(document.createTextNode(match[0]));
        }
      } else if (match[4]) {
        const referenceUrl = references.get(match[4].toLowerCase());
        if (referenceUrl) {
          const link = document.createElement('a');
          link.href = referenceUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = match[4];
          container.appendChild(link);
        } else {
          container.appendChild(document.createTextNode(match[0]));
        }
      } else if (match[5]) {
        const code = document.createElement('code');
        code.textContent = match[5];
        container.appendChild(code);
      } else if (match[6] || match[7]) {
        const strong = document.createElement('strong');
        strong.textContent = match[6] || match[7];
        container.appendChild(strong);
      } else {
        const emphasis = document.createElement('em');
        emphasis.textContent = match[8] || match[9];
        container.appendChild(emphasis);
      }
      cursor = token.lastIndex;
    }
    if (cursor < source.length) container.appendChild(document.createTextNode(source.slice(cursor)));
  }

  function appendSafeMarkdown(container, markdown) {
    const references = new Map();
    const lines = String(markdown || '').replace(/\r/g, '').split('\n').filter(function(rawLine) {
      const reference = rawLine.trim().match(/^\[([^\]]+)\]:\s*(https?:\/\/\S+)\s*$/);
      if (!reference) return true;
      const url = safeExternalUrl(reference[2]);
      if (url) references.set(reference[1].toLowerCase(), url);
      return false;
    });
    let paragraph = [];
    let list;

    function flushParagraph() {
      if (!paragraph.length) return;
      const copy = document.createElement('p');
      appendInlineMarkdown(copy, paragraph.join(' '), references);
      container.appendChild(copy);
      paragraph = [];
    }
    function flushList() {
      if (!list) return;
      container.appendChild(list);
      list = null;
    }

    lines.forEach(function(rawLine) {
      const line = rawLine.trim();
      if (!line) {
        flushParagraph();
        flushList();
        return;
      }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const bullet = line.match(/^[-*]\s+(.+)$/);
      const numbered = line.match(/^\d+\.\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        const title = document.createElement(heading[1].length === 1 ? 'h2' : 'h3');
        appendInlineMarkdown(title, heading[2], references);
        container.appendChild(title);
      } else if (bullet || numbered) {
        flushParagraph();
        const listTag = numbered ? 'ol' : 'ul';
        if (!list || list.tagName.toLowerCase() !== listTag) {
          flushList();
          list = document.createElement(listTag);
        }
        const item = document.createElement('li');
        appendInlineMarkdown(item, (bullet || numbered)[1], references);
        list.appendChild(item);
      } else {
        flushList();
        paragraph.push(line);
      }
    });
    flushParagraph();
    flushList();
  }

  function safeExternalUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
    } catch (error) {
      return null;
    }
  }

  function renderPreviousInsights(posts, currentPost) {
    const list = document.querySelector('[data-insight-previous-list]');
    const section = document.querySelector('[data-insight-previous-section]');
    if (!list || !section) return;
    list.replaceChildren();
    // Keep the live Supabase notes and the established AiGENCY archive together
    // here. The rail is a catalogue of the whole library, so an overflow post
    // is still reachable when a visitor opens any other Field Note.
    const seen = new Set();
    const previous = (Array.isArray(posts) ? posts : []).concat(legacyInsights)
      .filter(function(post) {
        if (!post || !post.slug || post.slug === currentPost.slug || seen.has(post.slug)) return false;
        seen.add(post.slug);
        return true;
      })
      .sort(function(a, b) { return new Date(b.published_at).getTime() - new Date(a.published_at).getTime(); });

    previous.forEach(function(post) {
      const tile = document.createElement('a');
      tile.className = 'bento-card hero-theme insight-previous-tile';
      tile.href = post.href || insightLink(post.slug);
      tile.setAttribute('aria-label', 'Read ' + (post.title || 'this Field Note'));
      tile.append(
        createInsightElement('span', insightDate(post.published_at), 'insight-previous-date'),
        createInsightElement('span', post.title || 'Untitled Field Note', 'insight-previous-title'),
        createInsightElement('span', post.excerpt || 'Open this Field Note for Arthur’s practical guidance.', 'insight-previous-excerpt')
      );
      list.appendChild(tile);
    });
    section.hidden = previous.length === 0;
  }

  function mountInsightReadingPages(post) {
    const body = document.querySelector('[data-insight-detail-body]');
    const pagination = document.querySelector('[data-insight-reading-pagination]');
    const download = document.querySelector('[data-insight-download]');
    if (!body || !pagination) return;

    const blocks = Array.from(body.children);
    const pages = [];
    let page = [];
    let size = 0;
    const targetSize = 2200;

    blocks.forEach(function(block) {
      const blockSize = Math.max(1, (block.textContent || '').trim().length);
      const isHeading = /^H[2-4]$/.test(block.tagName);
      if (page.length && size + blockSize > targetSize && !isHeading) {
        pages.push(page);
        page = [];
        size = 0;
      }
      page.push(block);
      size += blockSize;
    });
    if (page.length) pages.push(page);
    if (!pages.length) pages.push([]);

    let currentPage = 0;
    function renderPage() {
      body.replaceChildren.apply(body, pages[currentPage]);
      body.dataset.insightCurrentPage = String(currentPage + 1);
      pagination.replaceChildren();
      if (pages.length < 2) {
        pagination.hidden = true;
        return;
      }
      pagination.hidden = false;
      const previous = createInsightElement('button', '← Previous page', 'insight-page-button');
      previous.type = 'button';
      previous.disabled = currentPage === 0;
      previous.addEventListener('click', function() {
        if (currentPage === 0) return;
        currentPage -= 1;
        renderPage();
        body.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      const status = createInsightElement('p', 'Page ' + (currentPage + 1) + ' of ' + pages.length, 'insight-reading-page-status');
      const next = createInsightElement('button', 'Next page →', 'insight-page-button');
      next.type = 'button';
      next.disabled = currentPage === pages.length - 1;
      next.addEventListener('click', function() {
        if (currentPage === pages.length - 1) return;
        currentPage += 1;
        renderPage();
        body.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.append(previous, status, next);
    }

    if (download) {
      download.onclick = function() {
        const contents = [post.title || 'AiGENCY Field Note', '', post.excerpt || '', '', String(post.body_markdown || '')].join('\n');
        const blob = new Blob([contents], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = (post.slug || 'aigency-field-note') + '.md';
        link.click();
        window.setTimeout(function() { URL.revokeObjectURL(url); }, 0);
      };
    }
    renderPage();
  }

  function mountInsightAudio() {
    const control = document.querySelector('[data-insight-speak]');
    const status = document.querySelector('[data-insight-audio-status]');
    const body = document.querySelector('[data-insight-detail-body]');
    const title = document.querySelector('[data-insight-detail-title]');
    if (!control || !body || !title) return;
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      control.disabled = true;
      if (status) status.textContent = 'Speech playback is not available in this browser.';
      return;
    }

    let speaking = false;
    function stop() {
      window.speechSynthesis.cancel();
      speaking = false;
      control.setAttribute('aria-pressed', 'false');
      control.textContent = '🔊 Listen to this page';
      if (status) status.textContent = 'Uses your browser’s built-in speech playback.';
    }
    control.addEventListener('click', function() {
      if (speaking) {
        stop();
        return;
      }
      const pageLabel = body.dataset.insightCurrentPage ? 'Page ' + body.dataset.insightCurrentPage : 'This Field Note';
      const text = [pageLabel, title.textContent, body.textContent].filter(Boolean).join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.onend = stop;
      utterance.onerror = stop;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      speaking = true;
      control.setAttribute('aria-pressed', 'true');
      control.textContent = '■ Stop listening';
      if (status) status.textContent = 'Reading this page aloud.';
    });
  }

  const inlineArthurHeads = new WeakMap();
  const inlineArthurAvatarLoads = new WeakMap();

  function mountInlineArthurAvatar(avatarHost) {
    if (!avatarHost) return Promise.resolve(null);
    if (inlineArthurAvatarLoads.has(avatarHost)) return inlineArthurAvatarLoads.get(avatarHost);
    const load = (async function() {
      try {
        const module = await import('/vendor/talkinghead/modules/talkinghead.mjs');
        const head = new module.TalkingHead(avatarHost, {
          cameraView: 'head', cameraRotateEnable: false, cameraPanEnable: false,
          cameraZoomEnable: false, modelFPS: 24, modelPixelRatio: 1,
          lipsyncModules: ['en'], avatarIdleEyeContact: 0.7, avatarIdleHeadMove: 0.18,
          lightAmbientColor: 0xffead5, lightAmbientIntensity: 2.4,
          lightDirectColor: 0x8fcfc0, lightDirectIntensity: 16
        });
        await head.showAvatar({
          // Demo avatar approved for the current public website iteration.
          url: '/vendor/talkinghead/avatars/avatarsdk.glb', body: 'M', avatarMood: 'neutral',
          baseline: { headRotateX: -0.04, eyeBlinkLeft: 0.05, eyeBlinkRight: 0.05 },
          retarget: { Neck: { z: -0.01, rx: -0.15 }, Neck1: { z: -0.01, rx: -0.15 }, Neck2: { z: -0.01, rx: -0.15 }, LeftShoulder: { rz: -0.3 }, RightShoulder: { rz: 0.3 }, scaleToEyesLevel: 1.0, origin: { y: -0.1 } }
        });
        head.controls.minDistance = 2;
        head.setView('head', { cameraDistance: 0, cameraY: 0 });
        inlineArthurHeads.set(avatarHost, head);
        avatarHost.classList.add('is-avatar-ready');
        return head;
      } catch (error) {
        avatarHost.classList.add('is-avatar-unavailable');
        console.warn('Arthur avatar could not load.', error);
        return null;
      }
    })();
    inlineArthurAvatarLoads.set(avatarHost, load);
    return load;
  }

  async function speakInlineArthurReply(avatarHost, payload) {
    const talkingHead = inlineArthurHeads.get(avatarHost);
    if (!talkingHead || !payload.audio_url || !Array.isArray(payload.words) || !payload.words.length) return;
    try {
      if (talkingHead.audioCtx && (talkingHead.audioCtx.state === 'suspended' || talkingHead.audioCtx.state === 'interrupted')) {
        await talkingHead.audioCtx.resume();
      }
      const audioResponse = await fetch(payload.audio_url, { cache: 'no-store' });
      if (!audioResponse.ok) throw new Error('Arthur audio could not be loaded.');
      const audio = await talkingHead.audioCtx.decodeAudioData(await audioResponse.arrayBuffer());
      talkingHead.speakAudio(
        { audio: audio, words: payload.words, wtimes: payload.wtimes, wdurations: payload.wdurations },
        { lipsyncLang: 'en' }
      );
    } catch (error) {
      console.warn('Arthur local speech could not play.', error);
    }
  }

  function mountInsightChat(post) {
    const chat = document.querySelector('[data-insight-chat]');
    if (!chat || chat.dataset.mounted === 'true') return;
    chat.dataset.mounted = 'true';
    const messages = chat.querySelector('[data-insight-chat-messages]');
    const input = chat.querySelector('[data-insight-chat-input]');
    const send = chat.querySelector('[data-insight-chat-send]');
    const remaining = chat.querySelector('[data-insight-chat-remaining]');
    const avatarHost = chat.querySelector('[data-ai-talker-avatar]');
    if (!messages || !input || !send) return;
    mountInlineArthurAvatar(avatarHost);

    const keyBase = 'aigency-arthur-light-' + post.slug;
    const sessionKey = keyBase + '-session';
    const countKey = keyBase + '-count';
    let sessionId = window.sessionStorage.getItem(sessionKey) || '';
    let messageCount = Number(window.sessionStorage.getItem(countKey) || '0');
    let sending = false;

    function updateLimit() {
      const left = Math.max(0, 5 - messageCount);
      if (remaining) remaining.textContent = left + (left === 1 ? ' question left' : ' questions left');
      if (left === 0) {
        input.disabled = true;
        send.disabled = true;
        input.placeholder = 'Five questions used';
      }
    }
    function appendMessage(text, kind) {
      const item = document.createElement('div');
      const messageKind = kind === 'visitor' ? 'visitor' : kind === 'status' ? 'status' : 'agent';
      item.className = 'ai-talk-message ai-talk-message-' + messageKind;
      const copy = document.createElement('p');
      copy.textContent = text;
      item.appendChild(copy);
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
      return item;
    }
    updateLimit();

    async function sendMessage() {
      const message = input.value.trim();
      if (!message || sending || messageCount >= 5) return;
      sending = true;
      input.value = '';
      input.disabled = true;
      send.disabled = true;
      appendMessage(message, 'visitor');
      const waiting = appendMessage('Arthur Light is thinking…', 'status');
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            session_id: sessionId || undefined,
            article_context: {
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              body_markdown: String(post.body_markdown || '').slice(0, 9500),
              sources: Array.isArray(post.sources) ? post.sources.slice(0, 8) : []
            },
            insight_slug: post.slug
          })
        });
        const payload = await response.json();
        waiting.remove();
        if (!response.ok) throw new Error(payload.error || 'Arthur Light is unavailable.');
        if (payload.session_id) {
          sessionId = payload.session_id;
          window.sessionStorage.setItem(sessionKey, sessionId);
        }
        messageCount += 1;
        window.sessionStorage.setItem(countKey, String(messageCount));
        appendMessage(payload.reply, 'agent');
        speakInlineArthurReply(avatarHost, payload);
        if (payload.limit_reached) messageCount = 5;
      } catch (error) {
        waiting.remove();
        appendMessage(error.message || 'Arthur Light is unavailable. Please use the human route.', 'agent');
      } finally {
        sending = false;
        updateLimit();
        if (messageCount < 5) {
          input.disabled = false;
          send.disabled = false;
          input.focus();
        }
      }
    }
    send.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  function mountInsightsIndexChat() {
    const chat = document.querySelector('[data-insights-index-chat]');
    if (!chat || chat.dataset.mounted === 'true') return;
    chat.dataset.mounted = 'true';
    const messages = chat.querySelector('[data-insights-index-chat-messages]');
    const input = chat.querySelector('[data-insights-index-chat-input]');
    const send = chat.querySelector('[data-insights-index-chat-send]');
    const remaining = chat.querySelector('[data-insights-index-chat-remaining]');
    const history = chat.querySelector('[data-insights-chat-history]');
    const historyList = chat.querySelector('[data-insights-chat-history-list]');
    const avatarHost = chat.querySelector('[data-ai-talker-avatar]');
    if (!messages || !input || !send) return;
    mountInlineArthurAvatar(avatarHost);

    const sessionKey = 'aigency-arthur-light-insights-session';
    const countKey = 'aigency-arthur-light-insights-count';
    const historyKey = 'aigency-arthur-light-insights-history';
    const exampleSummaries = [
      {
        question: 'Which Field Note matters most for a small business?',
        answer: 'Start with the note on AI agents, identities and wallets. It turns a fast-moving change into practical safeguards: clear information, limited permissions and human approval.'
      },
      {
        question: 'Can I ask Arthur about an earlier Field Note?',
        answer: 'Yes. Arthur can discuss the published Notes together, explain the evidence behind them and connect a question back to the right article.'
      },
      {
        question: 'What should I do after reading a Note?',
        answer: 'Pick the one closest to your business, ask Arthur what it means in practice, then take the next decision to a person at AiGENCY.'
      }
    ];
    let sessionId = window.sessionStorage.getItem(sessionKey) || '';
    let messageCount = Number(window.sessionStorage.getItem(countKey) || '0');
    let sending = false;

    function readHistory() {
      try {
        const saved = JSON.parse(window.localStorage.getItem(historyKey) || '[]');
        return Array.isArray(saved) ? saved.filter(function(item) {
          return item && typeof item.question === 'string' && typeof item.answer === 'string';
        }).slice(0, 4) : [];
      } catch (error) {
        return [];
      }
    }
    function renderHistory() {
      if (!history || !historyList) return;
      const visitorSummaries = readHistory();
      // Visitor chats always lead. The examples initially fill the empty space,
      // then naturally move down and disappear as real chats are saved.
      const summaries = visitorSummaries.concat(exampleSummaries).slice(0, 4);
      historyList.replaceChildren();
      summaries.forEach(function(summary, index) {
        const item = document.createElement('article');
        const isExample = index >= visitorSummaries.length;
        item.className = 'insights-chat-history-item' + (isExample ? ' is-example' : '');
        if (isExample) item.setAttribute('data-example', 'true');
        const question = createInsightElement('p', summary.question, 'insights-chat-history-question');
        const answer = createInsightElement('p', summary.answer, 'insights-chat-history-answer');
        item.append(question, answer);
        historyList.appendChild(item);
      });
      history.hidden = false;
    }
    function saveHistory(question, answer) {
      try {
        const answerPreview = String(answer || '').replace(/\s+/g, ' ').trim().slice(0, 220);
        if (!answerPreview) return;
        const summaries = readHistory().filter(function(item) { return item.question !== question; });
        summaries.unshift({ question: question.slice(0, 150), answer: answerPreview });
        window.localStorage.setItem(historyKey, JSON.stringify(summaries.slice(0, 4)));
        renderHistory();
      } catch (error) {
        // The chat remains fully usable if the visitor blocks local storage.
      }
    }

    function updateLimit() {
      const left = Math.max(0, 5 - messageCount);
      if (remaining) remaining.textContent = left + (left === 1 ? ' question left' : ' questions left');
      if (left === 0) {
        input.disabled = true;
        send.disabled = true;
        input.placeholder = 'Five questions used';
      }
    }
    function appendMessage(text, kind) {
      const item = document.createElement('div');
      item.className = 'ai-talk-message ai-talk-message-' + (kind === 'visitor' ? 'visitor' : kind === 'status' ? 'status' : 'agent');
      const copy = document.createElement('p');
      copy.textContent = text;
      item.appendChild(copy);
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
      return item;
    }
    async function sendMessage() {
      const message = input.value.trim();
      if (!message || sending || messageCount >= 5) return;
      sending = true;
      input.value = '';
      input.disabled = true;
      send.disabled = true;
      appendMessage(message, 'visitor');
      const waiting = appendMessage('Arthur Light is thinking…', 'status');
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message, session_id: sessionId || undefined, insights_context: true })
        });
        const payload = await response.json();
        waiting.remove();
        if (!response.ok) throw new Error(payload.error || 'Arthur Light is unavailable.');
        if (payload.session_id) {
          sessionId = payload.session_id;
          window.sessionStorage.setItem(sessionKey, sessionId);
        }
        messageCount += 1;
        window.sessionStorage.setItem(countKey, String(messageCount));
        appendMessage(payload.reply, 'agent');
        speakInlineArthurReply(avatarHost, payload);
        saveHistory(message, payload.reply);
        if (payload.limit_reached) messageCount = 5;
      } catch (error) {
        waiting.remove();
        appendMessage(error.message || 'Arthur Light is unavailable. Please use the human route.', 'agent');
      } finally {
        sending = false;
        updateLimit();
        if (messageCount < 5) {
          input.disabled = false;
          send.disabled = false;
          input.focus();
        }
      }
    }
    renderHistory();
    updateLimit();
    send.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  function renderInsightDetail(post, previousPosts) {
    const detailSection = document.querySelector('[data-insight-detail-section]');
    const detail = document.querySelector('[data-insight-detail]');
    const meta = document.querySelector('[data-insight-detail-meta]');
    const title = document.querySelector('[data-insight-detail-title]');
    const excerpt = document.querySelector('[data-insight-detail-excerpt]');
    const body = document.querySelector('[data-insight-detail-body]');
    const image = document.querySelector('[data-insight-detail-image]');
    const imageDisclosure = document.querySelector('[data-insight-detail-image-disclosure]');
    const sourcesSection = document.querySelector('[data-insight-detail-sources]');
    const sourcesList = document.querySelector('[data-insight-detail-sources-list]');
    const author = document.querySelector('[data-insight-detail-author]');
    const disclosure = document.querySelector('[data-insight-detail-disclosure]');
    if (!detailSection || !detail || !meta || !title || !excerpt || !body || !sourcesSection || !sourcesList) return;

    document.querySelectorAll('[data-insights-page-intro], [data-insights-lead-section], [data-insights-library-section]').forEach(function(section) {
      section.hidden = true;
    });
    document.querySelectorAll('[data-insight-detail]').forEach(function(section) {
      section.hidden = false;
    });
    const loading = document.querySelector('[data-insight-detail-loading]');
    const error = document.querySelector('[data-insight-detail-error]');
    if (loading) loading.hidden = true;
    if (error) error.hidden = true;
    meta.textContent = insightMeta(post);
    title.textContent = post.title || 'AI insight';
    excerpt.textContent = post.excerpt || '';
    if (author) author.textContent = post.author_name || 'AiGENCY Ltd';
    // Keep every published note on the same compact, plain-language disclosure.
    // Older database records contain a legacy version of this copy.
    if (disclosure) disclosure.textContent = AI_ARTICLE_DISCLOSURE;
    const imageUrl = insightImage(post);
    if (image && imageUrl) {
      image.src = imageUrl;
      image.alt = post.cover_image_alt || post.title || '';
      image.hidden = false;
      if (imageDisclosure) {
        imageDisclosure.textContent = insightImageDisclosure(post);
        imageDisclosure.hidden = false;
      }
    } else if (image) {
      image.removeAttribute('src');
      image.alt = '';
      image.hidden = true;
      if (imageDisclosure) imageDisclosure.hidden = true;
    }
    body.replaceChildren();
    const structuredSources = Array.isArray(post.sources) ? post.sources : [];
    const articleMarkdown = structuredSources.length
      ? String(post.body_markdown || '').replace(/\n{0,2}#{1,3}\s+Sources\s*\n[\s\S]*$/i, '')
      : post.body_markdown;
    appendSafeMarkdown(body, articleMarkdown);
    sourcesList.replaceChildren();
    structuredSources.forEach(function(source) {
      const url = safeExternalUrl(source && source.url);
      if (!url) return;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.title || source.publisher || url;
      item.appendChild(link);
      if (source.publisher) item.appendChild(document.createTextNode(' · ' + source.publisher));
      sourcesList.appendChild(item);
    });
    sourcesSection.hidden = sourcesList.children.length === 0;
    renderPreviousInsights(previousPosts, post);
    mountInsightReadingPages(post);
    mountInsightAudio();
    mountInsightChat(post);
    detailSection.hidden = false;
    document.title = (post.seo_title || post.title || 'AI insight') + ' | AiGENCY Ltd';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', post.seo_description || post.excerpt || 'AiGENCY Insight');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && post.slug) canonical.setAttribute('href', 'https://aigency.ltd/insights/' + encodeURIComponent(post.slug) + '/');
  }

  function renderInsightDetailError() {
    const loading = document.querySelector('[data-insight-detail-loading]');
    const error = document.querySelector('[data-insight-detail-error]');
    document.querySelectorAll('[data-insight-detail]').forEach(function(section) {
      section.hidden = true;
    });
    if (loading) loading.hidden = true;
    if (error) error.hidden = false;
  }

  async function loadInsightDetail() {
    if (!document.querySelector('[data-insight-detail-section]')) return;
    // Local preview opens the reusable article page with ?slug=. Netlify keeps
    // the public clean URL in the address bar after its internal rewrite, so
    // recover the same slug from /insights/<slug>/ in production.
    const querySlug = new URLSearchParams(window.location.search).get('slug');
    const routeMatch = window.location.pathname.match(/^\/insights\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    const slug = querySlug || (routeMatch ? routeMatch[1] : null);
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      renderInsightDetailError();
      return;
    }
    try {
      const results = await Promise.all([
        supabaseSelect('insights_posts', publishedInsightsQuery()),
        supabaseSelect('insights_posts', 'select=' + PUBLIC_INSIGHTS_SELECT + '&status=eq.published&slug=eq.' + encodeURIComponent(slug) + '&limit=1')
      ]);
      const post = Array.isArray(results[1]) ? results[1][0] : null;
      if (!post) throw new Error('Insight not found');
      renderInsightDetail(post, results[0]);
    } catch (error) {
      renderInsightDetailError();
    }
  }

  function homepageInsightTimestamp(post) {
    const timestamp = new Date(post && (post.published_at || post.updated_at)).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function newestHomepageInsights(posts) {
    const seen = new Set();
    return (Array.isArray(posts) ? posts : []).concat(legacyInsights)
      .filter(function(post) {
        if (!post || !post.slug || seen.has(post.slug)) return false;
        seen.add(post.slug);
        return true;
      })
      .sort(function(a, b) {
        return homepageInsightTimestamp(b) - homepageInsightTimestamp(a);
      })
      .slice(0, 3);
  }

  function renderHomepageInsightCard(card, post) {
    const theme = insightThemeFor(post, 'homepage');
    const imageUrl = insightImage(post);
    const articleLink = document.createElement('a');
    articleLink.href = homepageInsightLink(post);
    articleLink.className = 'service-link';
    articleLink.append('Read the article ');
    articleLink.append(createInsightElement('span', '↗'));
    articleLink.lastElementChild.setAttribute('aria-hidden', 'true');

    card.className = 'bento-card span-4 ' + theme + ' homepage-blog-card';
    card.hidden = false;
    const body = document.createElement('div');
    body.className = 'homepage-insight-body';
    body.append(
      createInsightElement('p', insightMeta(post), 'eyebrow'),
      createInsightElement('h3', post.title || 'Untitled Insight'),
      createInsightElement('p', post.excerpt || 'Read the latest AiGENCY Insight.'),
      articleLink
    );
    if (imageUrl) {
      const media = document.createElement('div');
      media.className = 'homepage-insight-media';
      media.setAttribute('aria-hidden', 'true');
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      media.appendChild(image);
      card.replaceChildren(media, body);
    } else {
      card.replaceChildren(body);
    }
  }

  async function loadHomepageInsights() {
    const cards = Array.from(document.querySelectorAll('[data-homepage-insight-slot]'));
    if (!cards.length) return;

    try {
      const posts = await supabaseSelect('insights_posts', publishedInsightsQuery());
      const latestPosts = newestHomepageInsights(posts);
      latestPosts.forEach(function(post, index) {
        renderHomepageInsightCard(cards[index], post);
      });
      cards.slice(latestPosts.length).forEach(function(card) {
        card.hidden = true;
      });
    } catch (error) {
      // The three server-rendered cards remain as a readable fallback if the
      // public feed is temporarily unavailable. No archive content is lost.
    }
  }

  async function loadPublishedInsights() {
    const latestCard = document.querySelector('[data-insights-latest]');
    const featuredCard = document.querySelector('[data-insights-featured]');
    const librarySection = document.querySelector('[data-insights-library-section]');
    const libraryYears = document.querySelector('[data-insights-library-years]');
    const libraryGrid = document.querySelector('[data-insights-library-grid]');
    const libraryEmpty = document.querySelector('[data-insights-library-empty]');
    const libraryPagination = document.querySelector('[data-insights-library-pagination]');
    if (!latestCard && !featuredCard && !libraryGrid) return;

    try {
      const posts = await supabaseSelect('insights_posts', publishedInsightsQuery());
      const visiblePosts = Array.isArray(posts) ? posts.filter(function(post) { return post && post.slug; }) : [];
      const featured = visiblePosts.find(function(post) { return post.display_zone === 'featured'; });
      const latest = visiblePosts.find(function(post) { return !featured || post.slug !== featured.slug; });
      if (featured && featuredCard) renderInsightCard(featuredCard, featured, 'featured');
      else if (featuredCard) renderEmptyLeadCard(featuredCard, 'featured');
      if (latest && latestCard) renderInsightCard(latestCard, latest, 'latest');
      else if (latestCard) renderEmptyLeadCard(latestCard, 'latest');

      if (!librarySection || !libraryYears || !libraryGrid || !libraryEmpty || !libraryPagination) return;
      const libraryPosts = visiblePosts.concat(legacyInsights);
      const years = Array.from(new Set(libraryPosts.map(function(post) {
        const date = new Date(post.published_at);
        return Number.isNaN(date.getTime()) ? null : String(date.getFullYear());
      }).filter(Boolean)));
      const requestedYear = new URLSearchParams(window.location.search).get('year');
      let activeYear = requestedYear && years.indexOf(requestedYear) !== -1 ? requestedYear : 'all';
      const requestedPage = Number(new URLSearchParams(window.location.search).get('page') || '1');
      let currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
      const pageSize = 8;

      function updateLibraryUrl() {
        const next = new URL(window.location.href);
        if (activeYear === 'all') next.searchParams.delete('year');
        else next.searchParams.set('year', activeYear);
        if (currentPage === 1) next.searchParams.delete('page');
        else next.searchParams.set('page', String(currentPage));
        next.hash = 'library';
        window.history.replaceState({}, '', next);
      }

      function renderLibrary() {
        libraryYears.replaceChildren();
        [['all', 'All years']].concat(years.map(function(year) { return [year, year]; })).forEach(function(entry) {
          const year = entry[0];
          const link = document.createElement('a');
          link.className = 'insights-library-year' + (year === activeYear ? ' is-active' : '');
          link.href = year === 'all' ? '#library' : '?year=' + encodeURIComponent(year) + '#library';
          link.textContent = entry[1];
          link.setAttribute('aria-current', year === activeYear ? 'true' : 'false');
          link.addEventListener('click', function(event) {
            event.preventDefault();
            activeYear = year;
            currentPage = 1;
            updateLibraryUrl();
            renderLibrary();
          });
          libraryYears.appendChild(link);
        });
        const selectedPosts = activeYear === 'all' ? libraryPosts : libraryPosts.filter(function(post) {
          return String(new Date(post.published_at).getFullYear()) === activeYear;
        });
        const pageCount = Math.max(1, Math.ceil(selectedPosts.length / pageSize));
        currentPage = Math.min(currentPage, pageCount);
        const pagePosts = selectedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        libraryGrid.replaceChildren();
        pagePosts.forEach(function(post) {
          const card = document.createElement('article');
          renderInsightCard(card, post, 'library');
          libraryGrid.appendChild(card);
        });
        libraryEmpty.hidden = pagePosts.length > 0;
        libraryPagination.replaceChildren();
        if (pageCount > 1) {
          const previous = document.createElement('a');
          previous.href = '#library';
          previous.className = 'insights-page-link' + (currentPage === 1 ? ' is-disabled' : '');
          previous.textContent = '← Newer';
          previous.setAttribute('aria-disabled', currentPage === 1 ? 'true' : 'false');
          previous.addEventListener('click', function(event) {
            event.preventDefault();
            if (currentPage === 1) return;
            currentPage -= 1;
            updateLibraryUrl();
            renderLibrary();
          });
          const status = createInsightElement('p', 'Page ' + currentPage + ' of ' + pageCount, 'insights-page-status');
          const next = document.createElement('a');
          next.href = '#library';
          next.className = 'insights-page-link' + (currentPage === pageCount ? ' is-disabled' : '');
          next.textContent = 'Older →';
          next.setAttribute('aria-disabled', currentPage === pageCount ? 'true' : 'false');
          next.addEventListener('click', function(event) {
            event.preventDefault();
            if (currentPage === pageCount) return;
            currentPage += 1;
            updateLibraryUrl();
            renderLibrary();
          });
          libraryPagination.append(previous, status, next);
        }
      }
      renderLibrary();
    } catch (error) {
      // The lead cards explain the state without exposing database details.
      if (featuredCard) renderEmptyLeadCard(featuredCard, 'featured');
      if (latestCard) renderEmptyLeadCard(latestCard, 'latest');
    }
  }

  loadInsightDetail();
  loadPublishedInsights();
  loadHomepageInsights();
  mountInsightsIndexChat();

  // ========== ARTHUR LITE ENTRY POINT ==========
  // The browser talks only to the local site bridge. Hermes and its credentials
  // remain behind that boundary, and each visitor keeps only their session ID.
  function mountAiTalker() {
    // The Insights index needs the same mobile Arthur entry point as the rest
    // of the site. The individual reader has its own in-page Arthur panel.
    if (document.body.classList.contains('insight-detail-page')) return;
    if (document.querySelector('.ai-talker')) return;

    const talker = document.createElement('button');
    talker.type = 'button';
    talker.className = 'ai-talker';
    talker.setAttribute('aria-label', 'Talk to Arthur Light');
    talker.title = 'Talk to Arthur Light';
    talker.innerHTML = '<span class="ai-talker-seal" aria-hidden="true"><span class="ai-talker-mark">Ai</span></span><span class="ai-talker-label">Talk to Arthur Light · AI</span>';

    const panel = document.createElement('section');
    panel.className = 'ai-talk-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'ai-talk-title');
    panel.innerHTML = '<div class="ai-talk-arthur-stage"><div class="ai-talk-arthur-portrait ai-talk-arthur-avatar" data-ai-talker-avatar aria-label="Arthur Light animated avatar"><img src="/assets/arthur-ai-intern.png" alt="Arthur Light"><span class="ai-talk-avatar-loading">Preparing Arthur…</span></div><div class="ai-talk-arthur-name"><p class="ai-talk-kicker">PERSISTENT AI INTERN</p><h2 id="ai-talk-title">Arthur Light</h2></div><button type="button" class="ai-talk-close" aria-label="Close Arthur Light">×</button></div><div class="ai-talk-messages" aria-live="polite"><div class="ai-talk-message ai-talk-message-agent"><p>Hello — I’m Arthur Light, AiGENCY’s persistent AI intern, built on Hermes Agent. I keep the public site and Field Notes in view, so I can help you pick up the thread. What would you like to explore?</p></div></div><div class="ai-talk-composer"><input type="text" placeholder="Ask Arthur Light…" aria-label="Ask Arthur Light" maxlength="1600"><button type="button" class="ai-talk-send" aria-label="Send message">↗</button></div><a class="ai-talk-human" href="/contact.html?service=AiGENCY%20AI%20conversation">Talk to a person <span aria-hidden="true">↗</span></a>';

    const closeButton = panel.querySelector('.ai-talk-close');
    const messages = panel.querySelector('.ai-talk-messages');
    const input = panel.querySelector('.ai-talk-composer input');
    const sendButton = panel.querySelector('.ai-talk-send');
    const avatarHost = panel.querySelector('[data-ai-talker-avatar]');
    const sessionStorageKey = 'aigency-arthur-lite-session';
    let sending = false;
    let closeTimer = null;
    let demoAvatarStarted = false;
    let talkingHead = null;

    async function loadLocalDemoAvatar() {
      if (demoAvatarStarted || !avatarHost) return;
      demoAvatarStarted = true;
      try {
        const module = await import('/vendor/talkinghead/modules/talkinghead.mjs');
        const head = new module.TalkingHead(avatarHost, {
          cameraView: 'head', cameraRotateEnable: false, cameraPanEnable: false,
          cameraZoomEnable: false, modelFPS: 24, modelPixelRatio: 1,
          lipsyncModules: ['en'], avatarIdleEyeContact: 0.7, avatarIdleHeadMove: 0.18,
          lightAmbientColor: 0xffead5, lightAmbientIntensity: 2.4,
          lightDirectColor: 0x8fcfc0, lightDirectIntensity: 16
        });
        await head.showAvatar({
          // Demo avatar approved for the current public website iteration.
          url: '/vendor/talkinghead/avatars/avatarsdk.glb', body: 'M', avatarMood: 'neutral',
          baseline: { headRotateX: -0.04, eyeBlinkLeft: 0.05, eyeBlinkRight: 0.05 },
          retarget: { Neck: { z: -0.01, rx: -0.15 }, Neck1: { z: -0.01, rx: -0.15 }, Neck2: { z: -0.01, rx: -0.15 }, LeftShoulder: { rz: -0.3 }, RightShoulder: { rz: 0.3 }, scaleToEyesLevel: 1.0, origin: { y: -0.1 } }
        });
        // Use TalkingHead's stable head framing. The small visual enlargement
        // is handled by the clipped canvas below, so hair and mouth remain in
        // frame rather than relying on the model's camera limits.
        head.controls.minDistance = 2;
        head.setView('head', { cameraDistance: 0, cameraY: 0 });
        talkingHead = head;
        avatarHost.classList.add('is-avatar-ready');
      } catch (error) {
        avatarHost.classList.add('is-avatar-unavailable');
        console.warn('Arthur avatar could not load.', error);
      }
    }

    async function speakArthurReply(payload) {
      if (!talkingHead || !payload.audio_url || !Array.isArray(payload.words) || !payload.words.length) return;
      try {
        if (talkingHead.audioCtx && (talkingHead.audioCtx.state === 'suspended' || talkingHead.audioCtx.state === 'interrupted')) {
          await talkingHead.audioCtx.resume();
        }
        const audioResponse = await fetch(payload.audio_url, { cache: 'no-store' });
        if (!audioResponse.ok) throw new Error('Arthur audio could not be loaded.');
        const audio = await talkingHead.audioCtx.decodeAudioData(await audioResponse.arrayBuffer());
        talkingHead.speakAudio(
          { audio: audio, words: payload.words, wtimes: payload.wtimes, wdurations: payload.wdurations },
          { lipsyncLang: 'en' }
        );
      } catch (error) {
        // Keep the written Arthur reply available if local speech is unavailable.
        console.warn('Arthur local speech could not play.', error);
      }
    }

    function appendMessage(text, kind) {
      const message = document.createElement('div');
      message.className = 'ai-talk-message ai-talk-message-' + kind;
      const copy = document.createElement('p');
      copy.textContent = text;
      message.appendChild(copy);
      messages.appendChild(message);
      messages.scrollTop = messages.scrollHeight;
      return message;
    }

    async function sendMessage() {
      const message = input.value.trim();
      if (!message || sending) return;

      sending = true;
      input.value = '';
      input.disabled = true;
      sendButton.disabled = true;
      appendMessage(message, 'visitor');
      const waiting = appendMessage('Arthur Light is thinking…', 'status');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            session_id: window.localStorage.getItem(sessionStorageKey) || undefined
          })
        });
        const payload = await response.json();
        waiting.remove();
        if (!response.ok) throw new Error(payload.error || 'Arthur Light is unavailable.');
        if (payload.session_id) window.localStorage.setItem(sessionStorageKey, payload.session_id);
        appendMessage(payload.reply, 'agent');
        speakArthurReply(payload);
        if (payload.limit_reached) {
          input.disabled = true;
          sendButton.disabled = true;
          input.placeholder = 'Talk to a person to continue';
        }
      } catch (error) {
        waiting.remove();
        appendMessage(error.message || 'Arthur Light is unavailable. Please use the human route.', 'agent');
      } finally {
        sending = false;
        if (!input.placeholder.includes('Talk to a person')) {
          input.disabled = false;
          sendButton.disabled = false;
          input.focus();
        }
      }
    }

    function setPanelOpen(open) {
      window.clearTimeout(closeTimer);

      if (open) {
        panel.hidden = false;
        loadLocalDemoAvatar();
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.remove('is-closing');
        panel.classList.remove('is-opening');
        void panel.offsetWidth;
        panel.classList.add('is-opening');
        talker.setAttribute('aria-expanded', 'true');
        talker.classList.add('is-open');
        input.focus();
        return;
      }

      panel.classList.remove('is-opening');
      panel.classList.add('is-closing');
      panel.setAttribute('aria-hidden', 'true');
      talker.setAttribute('aria-expanded', 'false');
      talker.classList.remove('is-open');

      const finishClose = function() {
        panel.hidden = true;
        panel.classList.remove('is-closing');
        talker.focus();
      };

      panel.addEventListener('animationend', finishClose, { once: true });
      closeTimer = window.setTimeout(finishClose, 700);
    }

    panel.setAttribute('aria-hidden', 'true');
    talker.setAttribute('aria-expanded', 'false');
    talker.addEventListener('click', function() {
      setPanelOpen(panel.hidden);
    });

    closeButton.addEventListener('click', function() {
      setPanelOpen(false);
      talker.focus();
    });

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && !panel.hidden) {
        setPanelOpen(false);
        talker.focus();
      }
    });

    document.body.appendChild(talker);
    document.body.appendChild(panel);
  }

  // Arthur Light now has one isolated, site-wide implementation. Keep the
  // previous mount function above as an inactive visual baseline until the
  // replacement has been approved on desktop and mobile; do not run both.
  function loadArthurLite() {
    function appendArthurScript() {
      if (document.querySelector('script[data-arthur-lite-script]')) return;
      const script = document.createElement('script');
      script.src = 'js/arthur-lite.js?v=sitewide-readonly-v1-aug-2026';
      script.dataset.arthurLiteScript = '';
      document.head.appendChild(script);
    }

    const existingStylesheet = document.querySelector('link[data-arthur-lite-style]');
    if (existingStylesheet) {
      if (existingStylesheet.sheet) {
        appendArthurScript();
      } else {
        existingStylesheet.addEventListener('load', appendArthurScript, { once: true });
        existingStylesheet.addEventListener('error', appendArthurScript, { once: true });
      }
      return;
    }

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'css/arthur-lite.css?v=sitewide-readonly-v4-aug-2026';
    stylesheet.dataset.arthurLiteStyle = '';
    stylesheet.addEventListener('load', appendArthurScript, { once: true });
    stylesheet.addEventListener('error', appendArthurScript, { once: true });
    document.head.appendChild(stylesheet);
  }

  loadArthurLite();

  // ========== MOBILE NAVIGATION ==========
  const navToggle = document.querySelector('.nav-toggle');
  const navMobile = document.querySelector('.nav-mobile');

  // Keep the mobile route explicit: "Start Here" is the same destination,
  // but people looking for a phone number or email should be able to find it.
  const mobileContactLink = navMobile?.querySelector('a[href="contact.html"].nav-cta, a[href="/contact.html"].nav-cta');
  if (mobileContactLink) mobileContactLink.textContent = 'Contact';

  // ========== PRIMARY SITE NAVIGATION ==========
  // The canonical menu is authored directly in every page's HTML so crawlers,
  // no-JavaScript clients and normal browser loads all receive the same links.
  // JavaScript enhances the desktop presentation with a compact AI Services dropdown,
  // applies current-page state and controls the mobile drawer.

  function enhanceAiServicesDropdown() {
    const desktopNav = document.querySelector('.nav-desktop');
    if (!desktopNav || desktopNav.querySelector('.nav-dropdown')) return;

    const groupedKeys = ['services', 'transparency', 'search', 'agents', 'a2a'];
    const items = Array.from(desktopNav.children);
    const groupedItems = items.filter(function(item) {
      const link = item.querySelector(':scope > a[data-nav]');
      return link && groupedKeys.indexOf(link.getAttribute('data-nav')) !== -1;
    });
    const firstGroupedItem = groupedItems[0];
    if (!firstGroupedItem) return;

    const dropdownItem = document.createElement('li');
    dropdownItem.className = 'nav-dropdown';
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.appendChild(document.createTextNode('AI Services'));
    const chevron = document.createElement('span');
    chevron.className = 'nav-dropdown-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '⌄';
    summary.appendChild(chevron);

    const panel = document.createElement('div');
    panel.className = 'nav-dropdown-panel';
    panel.setAttribute('aria-label', 'AI Services menu');

    groupedItems.forEach(function(item) {
      const link = item.querySelector(':scope > a[data-nav]');
      if (!link) return;
      if (link.getAttribute('data-nav') === 'a2a') link.textContent = 'A2A Services';
      link.classList.add('nav-dropdown-link');
      panel.appendChild(link);
      item.remove();
    });

    if (!panel.querySelector('[data-nav="a2a"]')) {
      const a2aLink = document.createElement('a');
      a2aLink.href = '/a2a.html';
      a2aLink.setAttribute('data-nav', 'a2a');
      a2aLink.className = 'nav-dropdown-link';
      a2aLink.textContent = 'A2A Services';
      panel.appendChild(a2aLink);
    }

    details.appendChild(summary);
    details.appendChild(panel);
    dropdownItem.appendChild(details);
    const firstGroupedIndex = items.indexOf(firstGroupedItem);
    desktopNav.insertBefore(dropdownItem, desktopNav.children[firstGroupedIndex] || null);
  }

  enhanceAiServicesDropdown();

  function enhanceMobileServicesHierarchy() {
    if (!navMobile || navMobile.querySelector('.nav-mobile-section-label')) return;

    const serviceKeys = ['services', 'transparency', 'search', 'agents', 'a2a'];
    const firstServiceItem = navMobile.querySelector('a[data-nav="services"]')?.closest('li');
    if (!firstServiceItem) return;

    const a2aItem = navMobile.querySelector('a[data-nav="a2a"]')?.closest('li');
    if (!a2aItem) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = '/a2a.html';
      link.setAttribute('data-nav', 'a2a');
      link.textContent = 'A2A Services';
      item.appendChild(link);
      const agentsItem = navMobile.querySelector('a[data-nav="agents"]')?.closest('li');
      if (agentsItem) agentsItem.insertAdjacentElement('afterend', item);
      else firstServiceItem.insertAdjacentElement('afterend', item);
    }

    const label = document.createElement('li');
    label.className = 'nav-mobile-section-label';
    label.textContent = 'AI SERVICES';
    firstServiceItem.insertAdjacentElement('beforebegin', label);

    const serviceItems = serviceKeys.map(function(key) {
      return navMobile.querySelector('a[data-nav="' + key + '"]')?.closest('li') || null;
    });

    serviceItems.forEach(function(item, index) {
      const key = serviceKeys[index];
      const link = item?.querySelector('a[data-nav]');
      if (!link || !item) return;
      item.classList.add('nav-mobile-ai-service');
      if (key === 'services') {
        item.classList.add('nav-mobile-service-overview');
        link.textContent = 'AI Services overview';
      } else if (key === 'a2a') {
        link.textContent = 'A2A Services';
      }
    });

    serviceItems.slice().reverse().forEach(function(item) {
      if (item) label.insertAdjacentElement('afterend', item);
    });
  }

  enhanceMobileServicesHierarchy();

  // Editorial imagery is disclosed at the point it is seen. Insights supply
  // their own badge while the rest of the site receives the same treatment
  // from this shared page enhancement.
  function enhanceEditorialImageDisclosures() {
    const main = document.querySelector('main');
    if (!main) return;
    main.querySelectorAll('img').forEach(function(image) {
      if (image.closest('.insight-card-media, .homepage-insight-media, .insight-detail-media, .ai-image-frame, .ai-search-hero-visual')) return;
      if (image.classList.contains('logo-img') || image.closest('.logo, [data-no-ai-disclosure]')) return;

      let frame = image.parentElement;
      if (!frame) return;
      if (frame.tagName === 'PICTURE') frame = frame.parentElement;
      if (!frame || frame.closest('.insight-card-media, .homepage-insight-media, .insight-detail-media')) return;

      const canUseParent = frame.children.length === 1;
      if (!canUseParent) {
        const wrapper = document.createElement('span');
        image.parentNode.insertBefore(wrapper, image);
        wrapper.appendChild(image);
        frame = wrapper;
      }

      frame.classList.add('ai-image-frame');
      const disclosure = document.createElement('span');
      disclosure.className = 'insight-image-disclosure';
      disclosure.textContent = 'AI-generated image';
      frame.appendChild(disclosure);
    });
  }

  enhanceEditorialImageDisclosures();

  // ========== CURRENT NAVIGATION STATE ==========
  const navSegments = window.location.pathname.split('/').filter(Boolean);
  const navPath = navSegments[navSegments.length - 1] || 'index.html';
  const isCleanInsightRoute = navSegments[0] === 'insights' && navSegments.length > 1;
  const insightPages = [
    'insights.html',
    'faq.html',
    'chatgpt.html',
    'blog-chatgpt-business.html',
    'blog-small-business-bournemouth.html',
    'blog-human-oversight.html',
    'blog-ethical-agents.html',
    'blog-ai-act-chatbots.html',
    'blog-gdpr-ai-workflows.html',
    'blog-ai-content-search.html',
    'blog-ai-agent-web-readiness.html'
  ];
  const navKey = navPath === 'index.html'
      ? 'home'
      : navPath === 'services.html'
      || navPath === 'how-it-works.html'
      ? 'services'
      : navPath === 'creative-design.html'
      ? 'design'
      : navPath === 'training.html'
        ? 'training'
      : navPath === 'ai-transparency.html'
        ? 'transparency'
      : navPath === 'seo-ai-search-visibility.html'
        ? 'search'
      : navPath === 'hermes-agents.html'
        ? 'agents'
      : navPath === 'a2a.html'
        ? 'a2a'
      : navPath === 'aria.html'
        ? 'agents'
      : isCleanInsightRoute || insightPages.indexOf(navPath) !== -1
        ? 'insights'
      : navPath === 'about.html'
        ? 'about'
      : navPath === 'ai-health-check.html' || navPath === 'contact.html'
        ? 'start'
          : null;

  if (navKey) {
    document.querySelectorAll('[data-nav]').forEach(function(link) {
      if (link.getAttribute('data-nav') === navKey) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  document.querySelectorAll('.nav-dropdown details').forEach(function(details) {
    if (details.querySelector('[data-nav].is-active')) {
      details.open = true;
      details.querySelector('summary').classList.add('is-active');
    }
  });

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      navMobile.classList.toggle('active');
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    const mobileLinks = navMobile.querySelectorAll('a');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.setAttribute('aria-expanded', 'false');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Carry a scan request into the existing contact handoff without exposing
  // private crawler credentials or pretending the static site has run a scan.
  const contactParams = new URLSearchParams(window.location.search);
  const serviceField = document.getElementById('service');
  const messageField = document.getElementById('message');
  if (serviceField && contactParams.get('service')) serviceField.value = contactParams.get('service');
  if (messageField && contactParams.get('website')) {
    const requestedService = contactParams.get('service') || '';
    const isSearchRequest = requestedService.toLowerCase().indexOf('search') !== -1;
    messageField.value = isSearchRequest
      ? 'Website requested for AI Search review: ' + contactParams.get('website') + '\n\nPlease tell me what you would like to improve about how this site is found and understood in search.'
      : 'Website requested for transparency scan: ' + contactParams.get('website') + '\n\nPlease tell me what you would like to understand about the public-facing AI transparency of this site.';
  }

  // ========== ARTICLE 50 DASHBOARD PARALLAX ==========
  const scanParallaxScene = document.querySelector('.scan-parallax-scene');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (scanParallaxScene && !reducedMotion.matches) {
    let parallaxFrame = null;
    const updateScanParallax = function() {
      const offset = Math.max(-150, Math.round(window.scrollY * -0.045));
      scanParallaxScene.style.setProperty('--scan-parallax', offset + 'px');
      parallaxFrame = null;
    };
    updateScanParallax();
    window.addEventListener('scroll', function() {
      if (parallaxFrame !== null) return;
      parallaxFrame = window.requestAnimationFrame(updateScanParallax);
    }, { passive: true });
  }

  // Page wallpapers move at different restrained rates to create depth without
  // moving the copy or glass surfaces.
  const wallpaperPages = document.querySelectorAll('.services-page, .health-check-page, .design-page, .visibility-page, .transparency-page, .compliance-page, .about-page');
  if (wallpaperPages.length && !reducedMotion.matches) {
    let wallpaperParallaxFrame = null;
    const updateWallpaperParallax = function() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      wallpaperPages.forEach(function(page) {
        const distance = parseFloat(getComputedStyle(page).getPropertyValue('--page-parallax-distance')) || -140;
        page.style.setProperty('--page-wallpaper-y', Math.round(scrollProgress * distance) + 'px');
      });
      wallpaperParallaxFrame = null;
    };
    updateWallpaperParallax();
    window.addEventListener('scroll', function() {
      if (wallpaperParallaxFrame !== null) return;
      wallpaperParallaxFrame = window.requestAnimationFrame(updateWallpaperParallax);
    }, { passive: true });
  }

  // ========== SERVICE ARTWORK DEPTH ==========
  // Keep commissioned artwork atmospheric and subordinate to the copy. The
  // movement is intentionally small and disappears for reduced-motion users.
  const serviceArtwork = document.querySelectorAll('.service-page-feature-image');
  if (serviceArtwork.length && !reducedMotion.matches && window.innerWidth > 680) {
    let serviceParallaxFrame = null;
    const updateServiceParallax = function() {
      serviceArtwork.forEach(function(image) {
        const host = image.closest('.services-journey-card, .service-page-feature');
        if (!host) return;
        const rect = host.getBoundingClientRect();
        const distanceFromViewportCentre = (window.innerHeight / 2) - (rect.top + rect.height / 2);
        const offset = Math.max(-16, Math.min(16, Math.round(distanceFromViewportCentre * -0.022)));
        image.style.setProperty('--service-parallax', offset + 'px');
      });
      serviceParallaxFrame = null;
    };
    updateServiceParallax();
    window.addEventListener('scroll', function() {
      if (serviceParallaxFrame !== null) return;
      serviceParallaxFrame = window.requestAnimationFrame(updateServiceParallax);
    }, { passive: true });
  }

  // ========== ARTICLE 50 SIMPLE CHECK ==========
  // A plain-language selector helps visitors choose a starting point before
  // they submit a public website URL. It is a guide, not a compliance verdict.
  const article50Check = document.querySelector('.scan-article50-check');
  if (article50Check) {
    const choices = Array.from(article50Check.querySelectorAll('.scan-article50-choice'));
    const result = article50Check.querySelector('#article50-result');
    const resultTitle = article50Check.querySelector('#article50-result-title');
    const resultCopy = article50Check.querySelector('#article50-result-copy');
    const resultText = {
      interaction: ['Start with first-contact disclosure and human handover.', 'Make it clear when someone is meeting AI, what it can do and how they reach a person.'],
      content: ['Start with content labels and provenance.', 'Map where AI-generated or manipulated content is published and which marking or review signals are available.'],
      disclosure: ['Start with public-facing disclosure wording.', 'Check images, video and public-interest text for clear explanations where Article 50 applies.'],
      sensitive: ['Start with human confirmation.', 'Emotion recognition and biometric categorisation need information about the system and its use that a public crawl may not be able to prove.']
    };

    choices.forEach(function(choice) {
      choice.addEventListener('click', function() {
        const key = choice.getAttribute('data-article50-choice');
        const isSelected = choice.classList.toggle('is-selected');
        choice.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        const selected = choices.filter(function(item) { return item.classList.contains('is-selected'); });
        if (!selected.length) {
          result.hidden = true;
          return;
        }
        const firstKey = selected[0].getAttribute('data-article50-choice');
        const copy = resultText[firstKey];
        resultTitle.textContent = selected.length > 1 ? 'Start with a public-surface review, then confirm the details.' : copy[0];
        resultCopy.textContent = selected.length > 1 ? 'You have more than one Article 50 signal to check. Begin with what visitors can see, then confirm the internal systems and review responsibilities.' : copy[1];
        result.hidden = false;
      });
    });
  }

  // ========== AI SEARCH VISIBILITY CHECK ==========
  // The page only shows evidence returned by the safe, public-surface scanner.
  // It deliberately never converts a structural signal into a citation promise.
  const visibilityCheck = document.querySelector('.ai-visibility-check');
  if (visibilityCheck && visibilityCheck.getAttribute('data-scanner-status') !== 'coming-soon') {
    const visibilityForm = visibilityCheck.querySelector('.ai-visibility-form');
    const urlInput = visibilityCheck.querySelector('[name="url"]');
    const depthInput = visibilityCheck.querySelector('[name="depth"]');
    const localInput = visibilityCheck.querySelector('[name="local"]');
    const submitButton = visibilityForm.querySelector('button[type="submit"]');
    const progress = visibilityCheck.querySelector('.ai-scan-progress');
    const progressLabel = visibilityCheck.querySelector('.ai-scan-progress-label');
    const result = visibilityCheck.querySelector('.ai-scan-result');
    const error = visibilityCheck.querySelector('.ai-scan-error');
    const categoryGrid = visibilityCheck.querySelector('[data-scan-categories]');
    const domainTarget = visibilityCheck.querySelector('[data-scan-domain]');
    const scoreTarget = visibilityCheck.querySelector('[data-scan-score]');
    const limitTarget = visibilityCheck.querySelector('[data-scan-limit]');
    const reportLink = visibilityCheck.querySelector('[data-scan-report]');
    const emailLink = visibilityCheck.querySelector('[data-scan-email]');
    const auditLink = visibilityCheck.querySelector('[data-scan-audit]');
    const progressMessages = ['Checking public access…', 'Checking robots.txt and discovery files…', 'Reading structure and schema…', 'Mapping observable content signals…', 'Generating your evidence summary…'];

    const showError = function(message) {
      error.textContent = message;
      error.hidden = false;
    };

    const categoryState = function(category) {
      const ratio = category.total ? category.pass / category.total : 0;
      if (ratio >= 0.8) return 'is-pass';
      if (ratio >= 0.45) return 'is-warn';
      return 'is-gap';
    };

    visibilityForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      error.hidden = true;
      result.hidden = true;
      if (!urlInput.value.trim()) {
        showError('Enter a public website address to run the check.');
        urlInput.focus();
        return;
      }
      submitButton.disabled = true;
      submitButton.textContent = 'Checking…';
      progress.hidden = false;
      let progressIndex = 0;
      progressLabel.textContent = progressMessages[progressIndex];
      const progressTimer = window.setInterval(function() {
        progressIndex = Math.min(progressIndex + 1, progressMessages.length - 1);
        progressLabel.textContent = progressMessages[progressIndex];
      }, 750);
      try {
        const endpoint = visibilityCheck.getAttribute('data-scan-endpoint');
        const response = await window.fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlInput.value.trim(), depth: depthInput.checked ? 'five-page' : 'single', local: Boolean(localInput && localInput.checked) })
        });
        const payload = await response.json().catch(function() { return {}; });
        if (!response.ok) throw new Error(payload.error || 'The public visibility check could not be completed.');
        const parsedUrl = new URL(payload.url);
        domainTarget.textContent = parsedUrl.hostname;
        scoreTarget.textContent = String(payload.score);
        categoryGrid.innerHTML = (payload.categories || []).map(function(category) {
          return '<div class="ai-scan-category ' + categoryState(category) + '"><strong>' + category.name + '</strong><span>' + category.pass + ' / ' + category.total + ' signals found</span></div>';
        }).join('');
        limitTarget.textContent = (payload.limits || []).join(' ');
        const handoff = '&website=' + encodeURIComponent(payload.url);
        emailLink.href = '/contact.html?service=AI%20Search%20Visibility%20Report' + handoff;
        auditLink.href = '/contact.html?service=Full%20AI%20Search%20Audit' + handoff;
        reportLink.href = '#scan-checks';
        result.hidden = false;
        result.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
      } catch (requestError) {
        showError(requestError.message || 'The public visibility check could not be completed. Please try again.');
      } finally {
        window.clearInterval(progressTimer);
        progress.hidden = true;
        submitButton.disabled = false;
        submitButton.textContent = 'Run Check →';
      }
    });
  }

  // ========== SMOOTH SCROLL ==========
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = 64;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========== TEN-QUESTION AI HEALTH CHECK ==========
  const quizHost = document.querySelector('[data-quiz="health-check"]');
  if (quizHost) {
    const questions = [
      { title: 'Using AI day to day', prompt: 'Do you use tools such as ChatGPT to help with regular work?', options: [['Yes, we use AI regularly.', 10], ['Sometimes, but we are still finding our feet.', 5], ["No, not yet.", 0]] },
      { title: 'Time spent on admin', prompt: 'Do repeated tasks like emails, quotes, invoices or bookings take up too much of your day?', options: [['No, our admin is under control.', 10], ['Sometimes, depending on the day.', 5], ['Yes, it takes up too much time.', 0]] },
      { title: 'Being found in AI search', prompt: 'If someone asks ChatGPT or Google for a business like yours, are you confident it will find you?', options: [['Yes, we are easy to find.', 10], ['I am not sure.', 5], ['No, we are hard to find.', 0]] },
      { title: 'Keeping information safe', prompt: 'Do you know what private information should never be put into a public AI tool?', options: [['Yes, we have clear rules.', 10], ['We are not completely sure.', 5], ['No, we need clear rules.', 0]] },
      { title: 'Your tools working together', prompt: 'Do your email, calendar, booking and customer systems share information, or do you copy it between them?', options: [['They work together.', 10], ['Some work together, some do not.', 5], ['We copy information between them.', 0]] },
      { title: 'A website people can use', prompt: 'Is your website easy to read and use, even for people who find busy screens difficult?', options: [['Yes, it is clear and easy to use.', 10], ['Some parts could be clearer.', 5], ['No, it can be difficult to use.', 0]] },
      { title: 'Replying to new enquiries', prompt: 'Can you reply to new customer enquiries quickly, without putting other work aside?', options: [['Yes, we reply quickly.', 10], ['It depends on how busy we are.', 5], ['No, replies often get delayed.', 0]] },
      { title: 'Sounding like your business', prompt: 'Does your website sound like a real business, rather than feeling generic?', options: [['Yes, it sounds like us.', 10], ['It is partly there.', 5], ['No, it feels quite generic.', 0]] },
      { title: 'Your team using AI safely', prompt: 'Does everyone who uses AI know how to use it safely?', options: [['Yes, everyone has a clear approach.', 10], ['Some people are confident, some are not.', 5], ['No, we need practical guidance.', 0]] },
      { title: 'Being understood online', prompt: 'Can search engines and AI tools easily understand what your business does?', options: [['Yes, our information is clear.', 10], ['I am not sure.', 5], ['No, it is difficult to understand.', 0]] }
    ];
    const categories = [
      { key: 'foundations', label: 'People & safety', indices: [0, 3, 8], description: 'Confidence, simple rules and a shared way to use AI.' },
      { key: 'workflows', label: 'Time & workflows', indices: [1, 4, 6], description: 'Where repeated work can be made easier.' },
      { key: 'trust', label: 'Being found & understood', indices: [2, 5, 7, 9], description: 'How clearly people and search systems understand your business.' }
    ];
    const categoryForIndex = ['foundations', 'workflows', 'trust', 'foundations', 'workflows', 'trust', 'workflows', 'trust', 'foundations', 'trust'];
    const categoryLabels = { foundations: 'People & safety', workflows: 'Time & workflows', trust: 'Being found & understood' };
    const state = { index: -1, answers: Array(questions.length).fill(null) };
    const encouragements = ['That gives us a useful starting point.', 'Good — we are building a clearer picture.', 'Useful signal. Keep going.', 'That is exactly the kind of detail this check is for.'];

    const progressRail = questions.map(function(question, index) {
      return '<li class="quiz-rail-step" data-rail-step="' + index + '"><span>' + String(index + 1).padStart(2, '0') + '</span><strong>' + question.title + '</strong></li>';
    }).join('');
    const questionScreens = questions.map(function(question, index) {
      return '<section class="quiz-screen" data-screen="' + index + '" data-category="' + categoryForIndex[index] + '"><div class="quiz-progress"><div class="quiz-progress-head"><span class="quiz-progress-label">Question ' + (index + 1) + ' of ' + questions.length + '</span><span class="quiz-progress-percent">' + Math.round((index / questions.length) * 100) + '% complete</span></div><div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:' + ((index / questions.length) * 100) + '%"></div></div></div><div class="quiz-question-layout"><div class="quiz-question-panel"><div class="quiz-question-meta"><span class="quiz-category-chip">' + categoryLabels[categoryForIndex[index]] + '</span><span>Question ' + (index + 1) + ' of ' + questions.length + '</span></div><p class="eyebrow">AI HEALTH CHECK · ' + String(index + 1).padStart(2, '0') + '</p><h3 class="quiz-title">' + question.title + '</h3><p class="quiz-question">' + question.prompt + '</p><div class="quiz-options">' + question.options.map(function(option, optionIndex) { return '<label class="quiz-option"><input type="radio" name="q' + index + '" value="' + option[1] + '"><span class="quiz-option-index" aria-hidden="true">0' + (optionIndex + 1) + '</span><span class="quiz-option-copy">' + option[0] + '</span><span class="quiz-option-mark" aria-hidden="true">✓</span></label>'; }).join('') + '</div><p class="quiz-reward" aria-live="polite"></p><div class="quiz-nav"><button class="btn-primary quiz-prev" type="button">Back</button><button class="btn-primary btn-bronze quiz-next" type="button" disabled>' + (index === questions.length - 1 ? 'See My Results' : 'Next Question') + '</button></div></div><aside class="quiz-live-core" aria-hidden="true"><span class="quiz-core-label">YOUR PROGRESS</span><div class="quiz-core-orbit quiz-core-orbit-a"></div><div class="quiz-core-orbit quiz-core-orbit-b"></div><div class="quiz-core-gem"><span>' + String(index + 1).padStart(2, '0') + '</span></div><div class="quiz-core-readout"><span>PEOPLE</span><i></i><span>WORKFLOWS</span><i></i><span>VISIBILITY</span><i></i></div><div class="quiz-core-status">READY FOR YOUR ANSWER</div></aside></div></section>';
    }).join('');
    const categoryResults = categories.map(function(category) {
      return '<article class="results-item" data-result-category="' + category.key + '"><div class="results-item-head"><div class="results-item-value" id="score-' + category.key + '">0%</div><div class="results-item-label">' + category.label + '</div></div><div class="results-item-meter"><span id="meter-' + category.key + '"></span></div><p id="outcome-' + category.key + '" class="results-item-outcome">' + category.description + '</p></article>';
    }).join('');
    quizHost.innerHTML = `<div class="quiz-instrument is-intro"><aside class="quiz-rail" aria-label="AI Health Check progress"><p class="eyebrow">AI HEALTH CHECK</p><ol>` + progressRail + `</ol><p class="quiz-rail-note">Answer 10 simple questions. See where to start.</p></aside><div class="quiz-stage"><div class="quiz-intro-screen"><div class="quiz-intro-visual" aria-hidden="true"><div class="quiz-visual-frame"><img src="assets/services-audit.png" alt="" width="2528" height="1696" loading="lazy" decoding="async"><span class="quiz-visual-grid"></span><span class="quiz-visual-scan"></span><span class="quiz-visual-glow"></span><span class="quiz-visual-node quiz-visual-node-one"></span><span class="quiz-visual-node quiz-visual-node-two"></span><span class="quiz-visual-node quiz-visual-node-three"></span><div class="quiz-visual-console"><span>AI HEALTH CHECK</span><strong>READY TO BEGIN</strong><i></i><i></i><i></i></div></div><div class="quiz-visual-caption"><span>FREE AI HEALTH CHECK</span><strong>See your next step.</strong></div></div><div class="quiz-intro-copy"><p class="eyebrow">FREE AI HEALTH CHECK · ABOUT 3 MINUTES</p><h2 class="quiz-title">How could AI help you?</h2><p class="quiz-question">Answer 10 simple questions and we’ll show you where AI could save time, improve your website or make work easier. No technical knowledge needed.</p><p class="quiz-simple-benefits"><span>NO SIGN-UP</span><span>THIS IS FREE</span></p><p class="quiz-click-prompt"><span>CLICK BELOW TO BEGIN</span><span class="quiz-click-arrow" aria-hidden="true">↓</span></p><div class="quiz-intro-reassurance"><span>NO WRONG ANSWERS</span><span>ABOUT 3 MINUTES</span></div><div class="quiz-options"><label class="quiz-option quiz-path-option quiz-path-personal"><input type="radio" name="path" value="myself"><span class="quiz-option-index" aria-hidden="true">01</span><span class="quiz-path-icon" aria-hidden="true">✦</span><span class="quiz-option-copy"><span class="quiz-path-eyebrow">FOR YOURSELF</span><strong>Help with my own work</strong><small>Find simple ways AI could make your day easier.</small><span class="quiz-path-get"><em>YOU GET</em><span>A clear starting point for your everyday work.</span></span></span><span class="quiz-option-mark" aria-hidden="true">✓</span></label><label class="quiz-option quiz-path-option quiz-path-business"><input type="radio" name="path" value="business"><span class="quiz-option-index" aria-hidden="true">02</span><span class="quiz-path-icon" aria-hidden="true">◈</span><span class="quiz-option-copy"><span class="quiz-path-eyebrow">FOR YOUR BUSINESS</span><strong>Help with my business</strong><small>Find one useful place to save time or serve customers better.</small><span class="quiz-path-get"><em>YOU GET</em><span>A practical first step for your business.</span></span></span><span class="quiz-option-mark" aria-hidden="true">✓</span></label></div><div class="quiz-nav"><span class="quiz-path-prompt">Choose what you want help with.</span><button class="btn-primary btn-bronze quiz-start-btn" type="button" disabled>Start Free AI Health Check</button><a class="btn-primary btn-secondary quiz-agent-demo" href="hermes-agents.html">Skip to Agent Demo</a></div></div></div>` + questionScreens + `<section class="results-container" id="quiz-results"><div class="results-kicker"><span>CHECK COMPLETE</span><i></i><span>10 / 10 QUESTIONS</span></div><p class="eyebrow">YOUR AI HEALTH CHECK</p><h2 class="quiz-title">Here is your starting point.</h2><p class="quiz-question" id="quiz-result-message">This is a helpful guide, not a pass or fail. It shows what to look at first.</p><div class="results-overview"><div class="results-ring"><span class="results-orbit results-orbit-a"></span><span class="results-orbit results-orbit-b"></span><svg viewBox="0 0 200 200"><circle class="results-ring-bg" cx="100" cy="100" r="90"></circle><circle class="results-ring-fill" id="results-fill" cx="100" cy="100" r="90"></circle></svg><div class="results-score"><div class="results-score-value" id="results-total">0%</div><div class="results-score-label">your starting point</div></div></div><div class="results-summary-copy"><p class="eyebrow">THREE AREAS TO LOOK AT</p><p>Start with one small change. You do not need to fix everything at once.</p></div></div><div class="results-grid">` + categoryResults + `</div><div class="results-actions"><button type="button" class="btn-primary btn-bronze quiz-share">Share my results</button><button type="button" class="btn-primary quiz-download">Download my results</button></div><p class="quiz-share-status" aria-live="polite"></p><a href="contact.html" class="btn-primary btn-bronze">Talk through my results</a></section></div></div>`;

    const intro = quizHost.querySelector('.quiz-intro-screen');
    intro.classList.add('active');
    const screens = Array.from(quizHost.querySelectorAll('.quiz-screen'));
    const results = quizHost.querySelector('#quiz-results');
    const start = quizHost.querySelector('.quiz-start-btn');
    const railSteps = Array.from(quizHost.querySelectorAll('.quiz-rail-step'));
    const shareStatus = quizHost.querySelector('.quiz-share-status');
    let resultData = null;
    let healthCheckRecorded = false;
    let selectedPath = 'business';
    function updateRail(index) {
      railSteps.forEach(function(step, stepIndex) {
        const complete = stepIndex < index || state.answers[stepIndex] !== null;
        step.classList.toggle('is-complete', complete);
        step.classList.toggle('is-current', stepIndex === index);
        if (stepIndex === index) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
    }
    function updateProgress(index) {
      const screen = screens[index];
      if (!screen) return;
      const percent = Math.round(((index + 1) / questions.length) * 100);
      screen.querySelector('.quiz-progress-fill').style.width = percent + '%';
      screen.querySelector('.quiz-progress-percent').textContent = percent + '% mapped';
    }
    function showQuestion(index) {
      state.index = index;
      quizHost.querySelector('.quiz-instrument').classList.remove('is-intro', 'is-results');
      intro.classList.remove('active');
      results.classList.remove('active');
      screens.forEach(function(screen, screenIndex) { screen.classList.toggle('active', screenIndex === index); });
      updateProgress(index);
      updateRail(index);
      const selected = screens[index].querySelector('input:checked');
      const next = screens[index].querySelector('.quiz-next');
      next.disabled = !selected;
      if (selected) selected.closest('.quiz-option').classList.add('is-selected');
    }
    async function recordHealthCheck(result) {
      if (healthCheckRecorded) return;
      healthCheckRecorded = true;
      try {
        await supabaseInsert('health_check_results', {
          anonymous_session_id: crypto.randomUUID ? crypto.randomUUID() : undefined,
          path: result.path,
          overall_score: result.percent,
          foundations_score: result.scores.foundations,
          workflows_score: result.scores.workflows,
          trust_score: result.scores.trust,
          answers: {},
          email_opt_in: false,
          source_path: window.location.pathname
        });
      } catch (error) {
        // The quiz remains usable if anonymous recording is unavailable.
        healthCheckRecorded = false;
      }
    }

    function finish() {
      const total = state.answers.reduce(function(sum, value) { return sum + (value || 0); }, 0);
      const percent = Math.round((total / (questions.length * 10)) * 100);
      const scores = {};
      categories.forEach(function(category) {
        scores[category.key] = Math.round((category.indices.reduce(function(sum, index) { return sum + state.answers[index]; }, 0) / (category.indices.length * 10)) * 100);
      });
      function categoryOutcome(category, score) {
        if (category.key === 'foundations') return score < 40 ? 'Start with safe data boundaries and one shared AI habit.' : score < 75 ? 'Your base is forming; make the safe approach visible to everyone.' : 'A strong base. Document it so confidence survives change.';
        if (category.key === 'workflows') return score < 40 ? 'Choose one repeated admin task and make its next step obvious.' : score < 75 ? 'There are useful connections to make between the tools you already use.' : 'Your workflows are ready for careful optimisation and human checks.';
        return score < 40 ? 'Clarify how people find, read and trust your digital presence.' : score < 75 ? 'Improve the signals that help people and AI systems understand you.' : 'You have a strong platform for visible, human-supervised growth.';
      }
      quizHost.querySelector('#results-total').textContent = percent + '%';
      categories.forEach(function(category) {
        quizHost.querySelector('#score-' + category.key).textContent = scores[category.key] + '%';
        quizHost.querySelector('#outcome-' + category.key).textContent = categoryOutcome(category, scores[category.key]);
      });
      quizHost.querySelector('#quiz-result-message').textContent = percent < 40 ? 'You have clear opportunities to reduce admin and build safe foundations. Start with one workflow, not ten tools.' : percent < 75 ? 'You have useful foundations. The next gains are likely to come from connecting workflows and giving your team a shared approach.' : 'You have a strong base. The next step is making the systems more joined-up, visible and genuinely useful to the people using them.';
      resultData = { percent: percent, scores: scores, path: selectedPath };
      recordHealthCheck(resultData);
      screens.forEach(function(screen) { screen.classList.remove('active'); });
      quizHost.querySelector('.quiz-instrument').classList.add('is-results');
      results.classList.add('active');
      updateRail(questions.length);
      const fill = quizHost.querySelector('#results-fill');
      requestAnimationFrame(function() {
        fill.style.strokeDashoffset = 565 - (percent / 100) * 565;
        categories.forEach(function(category) {
          quizHost.querySelector('#meter-' + category.key).style.width = scores[category.key] + '%';
        });
      });
    }
    quizHost.addEventListener('change', function(event) {
      if (!event.target.matches('input[name="path"]')) return;
      selectedPath = event.target.value;
      intro.querySelectorAll('.quiz-option').forEach(function(option) { option.classList.remove('is-selected'); });
      event.target.closest('.quiz-option').classList.add('is-selected');
      start.disabled = false;
      intro.querySelector('.quiz-path-prompt').textContent = 'Instrument ready. Your answers stay in this browser.';
    });
    start.addEventListener('click', function() { if (!start.disabled) showQuestion(0); });
    quizHost.addEventListener('change', function(event) {
      if (!event.target.matches('input[type="radio"]') || !event.target.name.startsWith('q')) return;
      const index = Number(event.target.name.slice(1));
      state.answers[index] = Number(event.target.value);
      const screen = screens[index];
      screen.querySelectorAll('.quiz-option').forEach(function(option) { option.classList.remove('is-selected'); });
      event.target.closest('.quiz-option').classList.add('is-selected');
      const reward = screen.querySelector('.quiz-reward');
      reward.textContent = encouragements[index % encouragements.length];
      reward.classList.remove('reward-pop');
      void reward.offsetWidth;
      reward.classList.add('reward-pop');
      screen.querySelector('.quiz-next').disabled = false;
      const liveCore = screen.querySelector('.quiz-live-core');
      liveCore.style.setProperty('--signal-strength', Number(event.target.value) / 10);
      liveCore.classList.remove('is-locked');
      void liveCore.offsetWidth;
      liveCore.classList.add('is-locked');
      liveCore.querySelector('.quiz-core-status').textContent = Number(event.target.value) === 10 ? 'STRONG SIGNAL' : Number(event.target.value) === 5 ? 'EMERGING SIGNAL' : 'SUPPORT SIGNAL';
    });
    quizHost.addEventListener('click', function(event) {
      const next = event.target.closest('.quiz-next');
      const prev = event.target.closest('.quiz-prev');
      if (next && !next.disabled) state.index === questions.length - 1 ? finish() : showQuestion(state.index + 1);
      if (prev && state.index > 0) showQuestion(state.index - 1);
      if (prev && state.index === 0) {
        state.index = -1;
        screens[0].classList.remove('active');
        quizHost.querySelector('.quiz-instrument').classList.add('is-intro');
        intro.classList.add('active');
        updateRail(-1);
      }
    });
    function summaryText() {
      if (!resultData) return '';
      return 'AiGENCY AI Health Check\nOverall readiness: ' + resultData.percent + '%\n\n' + categories.map(function(category) {
        return category.label + ': ' + resultData.scores[category.key] + '%';
      }).join('\n') + '\n\nA practical starting point for human-supervised AI support.\nhttps://aigency.ltd/ai-health-check.html';
    }
    quizHost.querySelector('.quiz-share').addEventListener('click', function() {
      const text = summaryText();
      if (!text) return;
      const button = this;
      const done = function(message) { shareStatus.textContent = message; button.textContent = 'Copied to clipboard'; setTimeout(function() { button.textContent = 'Share my starting point'; }, 2200); };
      if (navigator.share) {
        navigator.share({ title: 'My AiGENCY AI Health Check', text: text }).then(function() { done('Share sheet opened.'); }).catch(function() {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { done('Your starting point is ready to paste.'); });
      }
    });
    quizHost.querySelector('.quiz-download').addEventListener('click', function() {
      const text = summaryText();
      if (!text) return;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'aigency-ai-health-check-starting-point.txt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      shareStatus.textContent = 'Your starting-point summary has downloaded.';
    });
  }

  // ========== CONTACT SUBMISSION ==========
  // Store the enquiry in Supabase. The database trigger places a protected
  // notification in the email outbox; the mail provider can be enabled later.
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const service = String(formData.get('service') || '').trim();
      const message = String(formData.get('message') || '').trim();
      const subject = service ? 'AiGENCY enquiry — ' + service : 'AiGENCY website enquiry';
      const body = [
        'Name: ' + name,
        'Email: ' + email,
        service ? 'Service: ' + service : '',
        '',
        message
      ].filter(Boolean).join('\n');
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const note = document.getElementById('contact-form-note');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }
      supabaseInsert('contact_submissions', {
        name: name,
        email: email,
        service: service || null,
        message: message,
        source_path: window.location.pathname + window.location.search,
        consent_to_reply: true
      }).then(function() {
        contactForm.reset();
        if (note) note.textContent = 'Your message has been saved. We will reply as soon as the email connection is active.';
        if (submitButton) submitButton.textContent = 'Message saved';
      }).catch(function() {
        if (note) note.textContent = 'The online inbox was unavailable, so an email draft will open instead.';
        window.location.href = 'mailto:sync@aigency.ltd?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Open email draft';
        }
      });
    });
  }

  // ========== COOKIE CONSENT ==========
  const cookieBar = document.getElementById('cookie-bar');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline = document.getElementById('cookie-decline');

  function showCookieBar() {
    if (cookieBar && !localStorage.getItem('cookieConsent')) {
      cookieBar.classList.add('visible');
    }
  }

  function hideCookieBar() {
    if (cookieBar) {
      cookieBar.classList.remove('visible');
    }
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', function() {
      localStorage.setItem('cookieConsent', 'accepted');
      hideCookieBar();
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', function() {
      localStorage.setItem('cookieConsent', 'declined');
      hideCookieBar();
    });
  }

  // Show cookie bar after short delay
  setTimeout(showCookieBar, 1000);

  // ========== SCROLL-LED BENTO CHOREOGRAPHY (Reduced Motion Aware) ==========
  // Reveal labels first, then bring cards in three-at-a-time waves. The classes
  // are added by JavaScript so a failed script never leaves content invisible.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12
    });

    function registerReveal(target, delay) {
      target.classList.add('motion-reveal');
      target.style.setProperty('--motion-delay', delay + 'ms');
      observer.observe(target);
    }

    document.querySelectorAll('.page-intro, .homepage-section-heading').forEach(function(label) {
      registerReveal(label, 0);
    });

    document.querySelectorAll('.bento-grid, .homepage-service-grid').forEach(function(grid) {
      Array.from(grid.children).filter(function(child) {
        return child.classList.contains('bento-card');
      }).forEach(function(card, index) {
        registerReveal(card, (index % 3) * 90);

        const label = card.querySelector(':scope > .eyebrow');
        if (label) label.classList.add('motion-label');

        card.querySelectorAll(':scope > svg.icon, :scope > svg.service-icon').forEach(function(icon) {
          icon.classList.add('motion-icon');
        });
      });
    });
  }

  // ========== PORTFOLIO PRAYER-WHEEL CAROUSEL ==========
  // Each portfolio tile opens its dedicated local demo once it reaches the front.
  // Swipe or drag to rotate the wheel and reveal the next capability.
  const portfolioCarousel = document.querySelector('.portfolio-carousel');
  if (portfolioCarousel) {
    const portfolioStage = portfolioCarousel.querySelector('.portfolio-stage');
    const portfolioTiles = Array.from(portfolioCarousel.querySelectorAll('[data-portfolio-tile]'));
    const portfolioStatus = portfolioCarousel.querySelector('[data-portfolio-status]');
    const portfolioBillboard = portfolioCarousel.querySelector('[data-portfolio-billboard]');
    const soundToggle = document.querySelector('.portfolio-sound-toggle');
    const reducedPortfolioMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activePortfolioTile = 0;
    let pointerStartX = null;
    let didPortfolioSwipe = false;
    let portfolioSoundEnabled = false;
    let portfolioAudioContext = null;
    let turnTimer = null;

    function portfolioPosition(index) {
      const distance = (index - activePortfolioTile + portfolioTiles.length) % portfolioTiles.length;
      if (distance === 0) return 'front';
      if (distance === 1) return 'next';
      if (distance === 2) return 'next-far';
      if (distance === portfolioTiles.length - 1) return 'previous';
      if (distance === portfolioTiles.length - 2) return 'previous-far';
      return 'hidden';
    }

    function renderPortfolioWheel() {
      portfolioTiles.forEach(function(tile, index) {
        const position = portfolioPosition(index);
        const isActive = position === 'front';
        tile.dataset.position = position;
        tile.classList.toggle('is-active', isActive);
        if (isActive) tile.setAttribute('aria-current', 'true');
        else tile.removeAttribute('aria-current');
      });
      if (portfolioStatus) portfolioStatus.textContent = 'Portfolio tile ' + (activePortfolioTile + 1) + ' of ' + portfolioTiles.length;
      if (portfolioBillboard) {
        const activeTitle = portfolioTiles[activePortfolioTile].querySelector('.portfolio-tile-title');
        portfolioBillboard.classList.remove('is-visible');
        portfolioBillboard.textContent = activeTitle ? activeTitle.textContent.trim() : '';
        void portfolioBillboard.offsetWidth;
        portfolioBillboard.classList.add('is-visible');
      }
    }

    function playPortfolioTurnSound() {
      if (!portfolioSoundEnabled || reducedPortfolioMotion || !window.AudioContext && !window.webkitAudioContext) return;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!portfolioAudioContext) portfolioAudioContext = new AudioContextClass();
      const now = portfolioAudioContext.currentTime;
      const gain = portfolioAudioContext.createGain();
      const oscillator = portfolioAudioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(168, now);
      oscillator.frequency.exponentialRampToValueAtTime(128, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.026, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      oscillator.connect(gain);
      gain.connect(portfolioAudioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    }

    function turnPortfolioWheel(direction) {
      activePortfolioTile = (activePortfolioTile + direction + portfolioTiles.length) % portfolioTiles.length;
      portfolioCarousel.classList.remove('is-turning');
      void portfolioCarousel.offsetWidth;
      portfolioCarousel.classList.add('is-turning');
      clearTimeout(turnTimer);
      turnTimer = setTimeout(function() { portfolioCarousel.classList.remove('is-turning'); }, reducedPortfolioMotion ? 0 : 720);
      renderPortfolioWheel();
      playPortfolioTurnSound();
    }

    portfolioStage.addEventListener('pointerdown', function(event) {
      pointerStartX = event.clientX;
      didPortfolioSwipe = false;
      portfolioStage.classList.add('is-dragging');
      portfolioStage.setPointerCapture(event.pointerId);
    });

    portfolioStage.addEventListener('pointerup', function(event) {
      if (pointerStartX === null) return;
      const distance = event.clientX - pointerStartX;
      if (Math.abs(distance) > 42) {
        didPortfolioSwipe = true;
        turnPortfolioWheel(distance < 0 ? 1 : -1);
      }
      pointerStartX = null;
      portfolioStage.classList.remove('is-dragging');
    });

    portfolioStage.addEventListener('pointercancel', function() {
      pointerStartX = null;
      portfolioStage.classList.remove('is-dragging');
    });

    portfolioTiles.forEach(function(tile, index) {
      tile.addEventListener('click', function(event) {
        if (didPortfolioSwipe) {
          didPortfolioSwipe = false;
          return;
        }
        const distance = (index - activePortfolioTile + portfolioTiles.length) % portfolioTiles.length;
        if (distance === 0) {
          event.preventDefault();
          const preview = window.open(
            tile.href,
            'aigencyDesignDemo',
            'popup=yes,width=1280,height=820,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
          );
          if (!preview) window.location.assign(tile.href);
          return;
        }
        event.preventDefault();
        turnPortfolioWheel(distance === portfolioTiles.length - 1 ? -1 : distance);
      });
    });

    portfolioCarousel.querySelectorAll('[data-portfolio-direction]').forEach(function(control) {
      control.addEventListener('click', function() {
        turnPortfolioWheel(control.dataset.portfolioDirection === 'next' ? 1 : -1);
      });
    });

    portfolioCarousel.addEventListener('keydown', function(event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        turnPortfolioWheel(1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        turnPortfolioWheel(-1);
      }
    });

    if (soundToggle) {
      soundToggle.addEventListener('click', function() {
        portfolioSoundEnabled = !portfolioSoundEnabled;
        soundToggle.setAttribute('aria-pressed', String(portfolioSoundEnabled));
        soundToggle.textContent = portfolioSoundEnabled ? 'Sound on' : 'Sound off';
        if (portfolioSoundEnabled && !reducedPortfolioMotion) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            if (!portfolioAudioContext) portfolioAudioContext = new AudioContextClass();
            portfolioAudioContext.resume().then(playPortfolioTurnSound).catch(function() {});
          }
        }
      });
    }

    renderPortfolioWheel();
  }

  // ========== KEYBOARD NAVIGATION ==========
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMobile && navMobile.classList.contains('active')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMobile.classList.remove('active');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });
})();
