const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const SAMPLE_TARGET = 'northline.example';

const evidenceRecords = {
  'seo-canonical': {
    title: 'Canonical coverage',
    type: 'Measured fixture',
    claim: 'Sixteen of eighteen sample pages include canonical coverage.',
    source: 'Sample crawl fixture · 18-page route map',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Static sample record. A live run will attach the parsed link element and response URL.',
    confidence: 'High',
    quote: 'canonical coverage: 16 / 18',
    foot: 'This preview does not make a network request. The backend audit will replace this record with page-level evidence.'
  },
  'aeo-company-definition': {
    title: 'What does A2A DESIGN do?',
    type: 'Heuristic sample',
    claim: 'The organisation needs a concise, independently extractable definition near the top of its Services content.',
    source: 'Sample question register · /services/ai-search',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Question-led review of the sample extract and page intent.',
    confidence: 'High',
    quote: 'Create a 40–70 word definition near the top of Services.',
    foot: 'Production version: store the question, page URL, extracted passage and evaluation rule together.'
  },
  'aeo-crm-answer': {
    title: 'Custom CRM answer',
    type: 'Heuristic sample',
    claim: 'The sample service page contains a concise answer that can stand on its own.',
    source: 'Sample question register · /services/automation',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Answerability review using a self-contained passage heuristic.',
    confidence: 'Medium',
    quote: 'Service page gives a concise, extractable answer.',
    foot: 'Production version: preserve the exact passage and its surrounding heading as evidence.'
  },
  'aeo-audit-definition': {
    title: 'AI search audit definition',
    type: 'Heuristic sample',
    claim: 'The sample site has an opportunity to define an AI search audit directly before describing its components.',
    source: 'Sample question register · /services/ai-search',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Question-led review of service-page answer coverage.',
    confidence: 'Medium',
    quote: 'Add a direct definition and supporting methodology.',
    foot: 'Production version: connect this recommendation to the exact page section that needs revision.'
  },
  'aeo-audience': {
    title: 'Audit audience',
    type: 'Heuristic sample',
    claim: 'The intended audience and outcome of the audit are not explicit enough in the sample introduction.',
    source: 'Sample question register · /services/ai-search',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Question-led review of audience clarity and stated outcomes.',
    confidence: 'Medium',
    quote: 'Make audience and outcomes explicit in the introduction.',
    foot: 'Production version: attach personas or source questions when available rather than inventing demand.'
  },
  'geo-entity-clarity': {
    title: 'Entity clarity',
    type: 'Observed fixture',
    claim: 'The sample organisation has a consistent core name and a recognisable service identity.',
    source: 'Sample entity register · organisation and service pages',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Cross-page entity comparison across the sample route map.',
    confidence: 'High',
    quote: 'A2A Design · AI systems studio · www.a2adesign.co.uk',
    foot: 'Production version: list every page and external record that contributed to this observation.'
  },
  'geo-service-definition': {
    title: 'Service definition',
    type: 'Heuristic sample',
    claim: 'The service category is understandable, but the audience, outcome and proof are not consistently defined.',
    source: 'Sample page extracts · service catalogue',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Cross-page comparison of service names, descriptions and answer passages.',
    confidence: 'Medium',
    quote: 'Service definition: mixed',
    foot: 'Production version: show the conflicting extracts side by side.'
  },
  'geo-external-references': {
    title: 'External references',
    type: 'External evidence fixture',
    claim: 'The sample entity needs stronger, clearly attributed third-party references.',
    source: 'Sample external evidence register',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Review of labelled public-source placeholders. No live source was queried in this preview.',
    confidence: 'Medium',
    quote: 'External references: needs work',
    foot: 'Production version: every external claim must include its URL, title, publisher and retrieval date.'
  },
  'geo-citation-readiness': {
    title: 'Citation readiness',
    type: 'Recommendation',
    claim: 'Important service and identity claims should be easier to quote with clear source context.',
    source: 'Sample evidence matrix',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Recommendation derived from entity and answerability signals.',
    confidence: 'Medium',
    quote: 'Citation readiness: needs work',
    foot: 'Production version: distinguish readiness from observed citations and never turn it into a guaranteed ranking score.'
  },
  'geo-bournemouth': {
    title: 'Location claim provenance',
    type: 'External evidence fixture',
    claim: 'The location claim is represented as supported by an on-site page and a company-record source.',
    source: 'Sample provenance register · Contact page + Companies House placeholder',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Two-source corroboration placeholder; live public records are not queried by this static demo.',
    confidence: 'Medium',
    quote: '“Based in Bournemouth.”',
    foot: 'Production version: replace the placeholder with the exact company record, URL, quote and retrieval timestamp.'
  },
  'page-ai-search': {
    title: 'Page evidence · /services/ai-search',
    type: 'Page extract fixture',
    claim: 'The sample service page names the service clearly but leaves audience and proof under-specified.',
    source: 'Sample page fixture · /services/ai-search',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Page-level extract and clarity review.',
    confidence: 'Medium',
    quote: 'A2A DESIGN provides AI search audits covering SEO, AEO and GEO…',
    foot: 'Production version: store the source HTML, selector or text range, and page response metadata.'
  },
  'rec-01': {
    title: 'Recommendation · company definition',
    type: 'Recommendation',
    claim: 'Clarify the organisation’s identity on the About page before adding more specialised content.',
    source: 'Sample action queue · About + Services',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Impact and effort prioritisation over entity and answerability signals.',
    confidence: 'High',
    quote: 'The shortest path to a more coherent, more answerable organisation.',
    foot: 'Production version: attach all supporting findings and affected URLs to the action item.'
  },
  'rec-02': {
    title: 'Recommendation · service Q&A',
    type: 'Recommendation',
    claim: 'Add direct question-and-answer blocks to the strongest commercial service pages.',
    source: 'Sample action queue · AEO question register',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Prioritised from underserved question opportunities.',
    confidence: 'Medium',
    quote: 'Add service Q&A blocks.',
    foot: 'Production version: link each question to the page section and validation result.'
  },
  'rec-03': {
    title: 'Recommendation · source provenance',
    type: 'Recommendation',
    claim: 'Add explicit provenance to the two claims that currently carry the most interpretive weight.',
    source: 'Sample action queue · evidence matrix',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Prioritised from external-evidence and citation-readiness signals.',
    confidence: 'Medium',
    quote: 'Add source provenance to two claims.',
    foot: 'Production version: cite the source record, publication date and relationship to the claim.'
  },
  'rec-04': {
    title: 'Recommendation · competitor topic coverage',
    type: 'Recommendation',
    claim: 'Expand evidence-led industry content around the topics where peer organisations are better represented.',
    source: 'Sample action queue · competitor comparison fixture',
    observed: '07 Aug 2026 · demo fixture',
    method: 'Sample evidence contrast across freshness, mentions and original statistics.',
    confidence: 'Medium',
    quote: 'Publish evidence-led industry content and strengthen external entity references.',
    foot: 'Production version: show the compared prompts, sources and competitor pages behind the gap.'
  }
};

const pageRecords = {
  'ai-search': {
    path: '/services/ai-search', type: 'Commercial service page', priority: 'high',
    signals: [['Good', 'signal-good'], ['Needs stronger answers', 'signal-warn'], ['Good references', 'signal-good'], ['Weak', 'signal-low']],
    extract: '“A2A DESIGN provides AI search audits covering SEO, AEO and GEO…”',
    extractReason: 'Clear · self-contained · named',
    unclear: 'Who is the service for, and what evidence supports the outcome?',
    unclearReason: 'Recommendation · confidence medium', evidenceId: 'page-ai-search'
  },
  automation: {
    path: '/services/automation', type: 'Commercial service page', priority: 'good',
    signals: [['Good', 'signal-good'], ['Strong answer', 'signal-good'], ['Good references', 'signal-good'], ['Medium', 'signal-warn']],
    extract: '“A2A DESIGN builds custom automation systems around the way your team works…”',
    extractReason: 'Named · direct · service-led',
    unclear: 'Which outcomes are measured after implementation?',
    unclearReason: 'Recommendation · confidence medium', evidenceId: 'aeo-crm-answer'
  },
  about: {
    path: '/about', type: 'Organisation page', priority: 'medium',
    signals: [['Good', 'signal-good'], ['Unclear identity', 'signal-warn'], ['Mixed references', 'signal-warn'], ['Needs proof', 'signal-low']],
    extract: '“A2A DESIGN is an AI systems studio working across automation, agents and search…”',
    extractReason: 'Organisation named · definition needs tightening',
    unclear: 'The company definition changes across core pages.',
    unclearReason: 'Observed · confidence high', evidenceId: 'rec-01'
  },
  insights: {
    path: '/insights/ai-search', type: 'Editorial article', priority: 'medium',
    signals: [['Good', 'signal-good'], ['Opportunity', 'signal-warn'], ['Strong reference', 'signal-good'], ['Freshness mixed', 'signal-warn']],
    extract: '“AI search changes how organisations need to explain their expertise…”',
    extractReason: 'Topic clear · supporting evidence varies',
    unclear: 'Which original data or first-party experience supports the argument?',
    unclearReason: 'Recommendation · confidence medium', evidenceId: 'rec-04'
  },
  contact: {
    path: '/contact', type: 'Contact and location page', priority: 'good',
    signals: [['Good', 'signal-good'], ['Clear location', 'signal-good'], ['Corroborated fixture', 'signal-good'], ['Source record pending', 'signal-warn']],
    extract: '“A2A DESIGN is based in Bournemouth, Dorset.”',
    extractReason: 'Location named · provenance visible in sample',
    unclear: 'The external company record is not linked in this preview.',
    unclearReason: 'External evidence · confidence medium', evidenceId: 'geo-bournemouth'
  }
};

const recommendationRecords = {
  '01': { title: 'Create a clear company definition', detail: 'The organisation is described differently across core pages. A concise definition gives every downstream answer a cleaner source.', impact: 'High', effort: 'Low', confidence: 'High', owner: 'Content', source: 'About + Services', evidenceId: 'rec-01' },
  '02': { title: 'Add service Q&A blocks', detail: 'Answer the recurring questions that sit closest to commercial intent, using short passages that can stand alone.', impact: 'High', effort: 'Medium', confidence: 'Medium', owner: 'Content', source: 'AEO question register', evidenceId: 'rec-02' },
  '03': { title: 'Add source provenance to two claims', detail: 'Make the strongest identity and outcome claims inspectable with direct source context.', impact: 'Medium', effort: 'Low', confidence: 'Medium', owner: 'Research', source: 'Evidence matrix', evidenceId: 'rec-03' },
  '04': { title: 'Expand competitor topic coverage', detail: 'Publish evidence-led industry content where the sample competitor has stronger supporting references.', impact: 'Medium', effort: 'High', confidence: 'Medium', owner: 'Strategy', source: 'Competitor comparison', evidenceId: 'rec-04' }
};

const loadActionPlan = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('aeo-expert-action-plan') || '[]');
    return Array.isArray(saved) ? saved.filter(key => recommendationRecords[key]) : [];
  } catch (error) {
    return [];
  }
};

const state = {
  target: SAMPLE_TARGET,
  previousTarget: SAMPLE_TARGET,
  selectedPage: 'ai-search',
  selectedRecommendation: '01',
  researchScope: 'on-site',
  agentMode: 'human',
  artifactMode: 'structured',
  actionPlan: loadActionPlan(),
  crawlTimer: null
};

const artifact = {
  schemaVersion: '0.2.0',
  artifactType: 'aeo_expert.audit',
  status: 'sample_fixture',
  domain: SAMPLE_TARGET,
  auditRun: { mode: 'sample', depth: 'standard', target: SAMPLE_TARGET, generatedAt: new Date().toISOString() },
  crawlSummary: { pagesQueued: 18, pagesAnalysed: 18, entitiesExtracted: 9, schemaChecked: 12 },
  seoFindings: { measuredChecksPassed: 14, technicalIssues: 3, highPriority: 2 },
  aeoFindings: { strongAnswerPages: 8, underservedQuestions: 12, contentOpportunities: 4 },
  geoFindings: { entityClarity: 'strong', evidenceDensity: 'medium', citationReadiness: 'needs_work' },
  aiSearchFindings: { machineAccessiblePages: '16/18', structuredAnswerOpportunities: 9, priorityContentGaps: 6 },
  externalResearch: { publicSourcesReviewed: 21, competitorsCompared: 5, entityInconsistencies: 3 },
  entities: { organisation: 'A2A Design', website: 'www.a2adesign.co.uk', location: 'Bournemouth, Dorset' },
  competitors: ['brightfield.example'],
  priorityActions: Object.values(recommendationRecords),
  actionPlan: [],
  evidence: Object.values(evidenceRecords),
  methodology: { measured: true, heuristic: true, externalEvidence: true, requiresHumanReview: true, liveCrawlerConnected: false },
  confidence: 'medium',
  requiresHumanReview: true
};

const syncArtifact = () => {
  artifact.domain = state.target;
  artifact.auditRun.target = state.target;
  artifact.actionPlan = state.actionPlan.map(key => recommendationRecords[key]);
};

const toast = (message) => {
  const el = $('.toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
};

const navigate = (view, updateHash = true) => {
  const target = $(`#view-${view}`);
  if (!target) return;
  $$('.view').forEach(section => section.classList.toggle('active', section === target));
  $$('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  if (updateHash && window.location.hash !== `#${view}`) history.pushState(null, '', `#${view}`);
  $('#mobileMore')?.classList.add('hidden');
  $('[data-action="more"]')?.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: updateHash ? 'smooth' : 'auto' });
};

const navigateFromLocation = () => {
  const view = window.location.hash.replace('#', '') || 'overview';
  navigate($(`#view-${view}`) ? view : 'overview', false);
};

const updateArtifact = () => {
  const code = $('#artifactCode');
  if (!code) return;
  syncArtifact();
  const output = state.artifactMode === 'raw' ? {
    protocol: 'A2A 1.0',
    messageType: 'task_result',
    request: { task: 'audit_website', target: state.target, depth: 'standard', modules: ['SEO', 'AEO', 'GEO', 'AI_SEARCH', 'RESEARCH'] },
    response: { status: 'sample_fixture', artifact }
  } : artifact;
  code.textContent = JSON.stringify(output, null, 2);
  const title = $('#artifactTitle');
  if (title) title.textContent = state.artifactMode === 'raw' ? 'Raw A2A envelope' : 'Structured audit artifact';
};

const setTheme = (theme) => {
  document.body.classList.toggle('theme-light', theme === 'light');
  document.body.classList.toggle('theme-dark', theme !== 'light');
  localStorage.setItem('aeo-expert-theme', theme);
  $('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eee9dd' : '#091006');
};

const normaliseTarget = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return SAMPLE_TARGET;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return parsed.hostname || SAMPLE_TARGET;
  } catch (error) {
    return raw.replace(/^https?:\/\//i, '').split('/')[0].trim() || SAMPLE_TARGET;
  }
};

const updateTargetText = () => {
  const oldTarget = state.previousTarget;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  textNodes.forEach(textNode => {
    if (textNode.parentElement?.closest('script, style')) return;
    if (oldTarget && textNode.nodeValue.includes(oldTarget)) textNode.nodeValue = textNode.nodeValue.split(oldTarget).join(state.target);
  });
  $$('[data-target-output]').forEach(el => {
    if (el.id === 'crawlSession') el.textContent = `${state.target.toUpperCase()} / CRAWL SESSION`;
    else el.textContent = state.target;
  });
  $$('[data-target-input]').forEach(input => {
    if (input !== document.activeElement || input.value === oldTarget) input.value = state.target;
  });
  state.previousTarget = state.target;
  syncArtifact();
  updateArtifact();
};

const setTarget = (value, notify = false) => {
  const nextTarget = normaliseTarget(value);
  state.target = nextTarget;
  updateTargetText();
  if (notify) toast(`Target set to ${state.target}. The sample fixture is ready.`);
};

const logLine = (message, type = 'ok') => {
  const log = $('#crawlLog');
  if (!log) return;
  const row = document.createElement('div');
  const time = document.createElement('span');
  const status = document.createElement('span');
  const copy = document.createElement('span');
  const now = new Date();
  time.className = 'log-time';
  time.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  status.className = 'log-ok';
  status.textContent = type === 'ready' ? 'READY' : 'OK';
  copy.textContent = message;
  row.append(time, status, copy);
  log.append(row);
  log.scrollTop = log.scrollHeight;
};

const runCrawl = () => {
  const input = $('#siteUrl');
  setTarget(input?.value || state.target);
  navigate('crawl');
  clearInterval(state.crawlTimer);
  const stages = $$('.crawl-stage');
  const bar = $('#crawlProgressBar');
  const percent = $('#crawlPercent');
  const count = $('#stageCount');
  const log = $('#crawlLog');
  stages.forEach(stage => {
    stage.classList.remove('complete', 'running');
    const icon = $('i', stage);
    if (icon) icon.textContent = '○';
  });
  if (bar) bar.style.width = '0%';
  if (percent) percent.textContent = '0%';
  if (count) count.textContent = `0 / ${stages.length}`;
  if (log) log.innerHTML = '';
  logLine(`Sample audit initialised for ${state.target}.`, 'ready');
  let current = 0;
  const messages = [
    'Target label resolved.',
    'Robots fixture loaded — live access not called.',
    'Sitemap fixture loaded — 18 sample routes queued.',
    'Page signals mapped.',
    'Entity fixture represented.',
    'Structured-data fixture checked.',
    'Sample research register loaded.',
    'Priorities ranked — artifact ready.'
  ];
  const finish = () => {
    if (percent) percent.textContent = 'SAMPLE READY';
    if (bar) bar.style.width = '100%';
    if (count) count.textContent = `${stages.length} / ${stages.length}`;
    artifact.status = 'sample_complete';
    artifact.auditRun.completedAt = new Date().toISOString();
    updateArtifact();
    toast(`Sample audit ready for ${state.target}. Live crawling remains a backend task.`);
  };
  state.crawlTimer = setInterval(() => {
    if (current > 0) stages[current - 1].classList.remove('running');
    if (current >= stages.length) {
      clearInterval(state.crawlTimer);
      finish();
      return;
    }
    const stage = stages[current];
    stage.classList.add('running');
    const icon = $('i', stage);
    if (icon) icon.textContent = '◌';
    const progress = Math.round((current / stages.length) * 100);
    if (percent) percent.textContent = `${progress}%`;
    if (bar) bar.style.width = `${progress}%`;
    logLine(messages[current]);
    setTimeout(() => {
      stage.classList.remove('running');
      stage.classList.add('complete');
      if (icon) icon.textContent = '✓';
    }, 230);
    current += 1;
    if (count) count.textContent = `${Math.min(current, stages.length)} / ${stages.length}`;
  }, 420);
};

const showEvidence = (evidenceId) => {
  const record = evidenceRecords[evidenceId];
  if (!record) return;
  $('#evidenceDrawerTitle').textContent = record.title;
  $('#evidenceDrawerType').textContent = record.type;
  $('#evidenceDrawerClaim').textContent = record.claim;
  $('#evidenceDrawerSource').textContent = record.source;
  $('#evidenceDrawerObserved').textContent = record.observed;
  $('#evidenceDrawerMethod').textContent = record.method;
  $('#evidenceDrawerConfidence').textContent = record.confidence;
  $('#evidenceDrawerQuote').textContent = record.quote;
  $('#evidenceDrawerFoot').textContent = record.foot;
  const drawer = $('#evidenceDrawer');
  drawer.classList.remove('hidden');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  $('#evidenceClose')?.focus();
};

const closeEvidence = () => {
  const drawer = $('#evidenceDrawer');
  if (!drawer) return;
  drawer.classList.add('hidden');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
};

const renderPage = (pageKey) => {
  const page = pageRecords[pageKey];
  if (!page) return;
  state.selectedPage = pageKey;
  $$('.page-item').forEach(item => item.classList.toggle('active', item.dataset.pageKey === pageKey));
  $('#pageDetailPath').textContent = page.path;
  $('#pageDetailType').textContent = page.type;
  const priority = $('#pageDetailPriority');
  priority.className = `page-tag ${page.priority}`;
  priority.textContent = `Priority ${page.priority}`;
  $$('.page-signals b').forEach((signal, index) => {
    signal.textContent = page.signals[index][0];
    signal.className = page.signals[index][1];
  });
  $('#pageExtract').textContent = page.extract;
  $('#pageExtractReason').textContent = page.extractReason;
  $('#pageUnclear').textContent = page.unclear;
  $('#pageUnclearReason').textContent = page.unclearReason;
  const evidenceButton = $('[data-action="page-evidence"]');
  if (evidenceButton) evidenceButton.dataset.evidenceId = page.evidenceId;
};

const persistActionPlan = () => {
  localStorage.setItem('aeo-expert-action-plan', JSON.stringify(state.actionPlan));
  syncArtifact();
  updateArtifact();
};

const renderRecommendation = (key) => {
  const recommendation = recommendationRecords[key];
  if (!recommendation) return;
  state.selectedRecommendation = key;
  $$('.recommendation-item').forEach(item => item.classList.toggle('active', item.dataset.recommendationKey === key));
  $$('.matrix-dot').forEach(dot => dot.classList.toggle('active', dot.dataset.recommendationKey === key));
  $('#fixFirstTitle').textContent = `${recommendation.title}.`;
  $('#fixFirstDescription').textContent = recommendation.detail;
  $('#fixConfidence').textContent = recommendation.confidence;
  $('#fixOwner').textContent = recommendation.owner;
  $('#fixSource').textContent = recommendation.source;
  const confirm = $('#confirmAction');
  if (confirm) confirm.textContent = state.actionPlan.includes(key) ? 'Added to action plan ✓' : 'Add to action plan ↗';
};

const addSelectedAction = () => {
  const key = state.selectedRecommendation;
  if (!state.actionPlan.includes(key)) state.actionPlan.push(key);
  persistActionPlan();
  renderRecommendation(key);
  toast(`${recommendationRecords[key].title} added to the action plan.`);
};

const exportFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const exportArtifact = () => {
  syncArtifact();
  exportFile(`aeo-expert-${state.target.replace(/[^a-z0-9]+/gi, '-')}.json`, JSON.stringify(artifact, null, 2), 'application/json');
  toast('Structured audit artifact downloaded as JSON.');
};

const exportReport = () => {
  syncArtifact();
  const recommendations = artifact.priorityActions.map((item, index) => `${index + 1}. **${item.title}** — ${item.impact} impact, ${item.effort} effort, ${item.confidence} confidence.`).join('\n');
  const evidence = artifact.evidence.slice(0, 8).map(item => `- **${item.title}** · ${item.type} · ${item.source}`).join('\n');
  const report = `# AEO Expert sample audit\n\n**Target:** ${state.target}\n**Status:** Sample fixture — no live crawler or external integration connected\n**Generated:** ${new Date().toISOString()}\n\n## Executive summary\n\nThis sample audit separates measured fixture signals, heuristic interpretation, external-evidence placeholders and recommendations. It does not guarantee search visibility or AI citation.\n\n## Priority actions\n\n${recommendations}\n\n## Evidence register\n\n${evidence}\n`;
  exportFile(`aeo-expert-${state.target.replace(/[^a-z0-9]+/gi, '-')}-report.md`, report, 'text/markdown');
  toast('Readable sample report downloaded as Markdown.');
};

const setResearchScope = (scope) => {
  state.researchScope = scope;
  $$('[data-research-scope]').forEach(button => button.classList.toggle('active', button.dataset.researchScope === scope));
  const note = $('.research-note');
  if (note) note.textContent = scope === 'on-site' ? 'Sample register · page sources labelled' : 'Sample register · public sources labelled';
};

const compareEvidence = () => {
  const ours = normaliseTarget($('[aria-label="Our site"]')?.value || state.target);
  const competitor = normaliseTarget($('[aria-label="Competitor"]')?.value || 'brightfield.example');
  state.target = ours;
  updateTargetText();
  $('#competitorDisplay').textContent = competitor;
  artifact.competitors = [competitor];
  updateArtifact();
  toast(`Sample evidence contrast updated: ${ours} vs ${competitor}.`);
};

const setAgentMode = (mode) => {
  state.agentMode = mode;
  $$('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  const note = $('#agentModeNote');
  if (note) note.textContent = mode === 'agent' ? 'Agent mode: inspect the machine-readable request and artifact envelope.' : 'Human mode: inspect the evidence and approve the recommended action.';
  toast(`${mode === 'agent' ? 'Agent' : 'Human'} mode selected.`);
};

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('aeo-expert-theme');
  if (savedTheme) setTheme(savedTheme);
  updateTargetText();
  renderPage(state.selectedPage);
  renderRecommendation(state.selectedRecommendation);
  setResearchScope(state.researchScope);
  updateArtifact();

  $$('[data-view]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.view)));
  $('#runAudit')?.addEventListener('click', runCrawl);
  $('#startCrawl')?.addEventListener('click', runCrawl);
  $('[data-action="theme"]')?.addEventListener('click', () => setTheme(document.body.classList.contains('theme-light') ? 'dark' : 'light'));
  $('[data-action="demo"]')?.addEventListener('click', () => { setTarget('www.a2adesign.co.uk', true); });
  $('#compareButton')?.addEventListener('click', compareEvidence);
  $('[data-action="confirm"]')?.addEventListener('click', addSelectedAction);
  $$('[data-action="export"]').forEach(button => button.addEventListener('click', () => button.dataset.exportFormat === 'markdown' ? exportReport() : exportArtifact()));
  $('[data-action="artifact"]')?.addEventListener('click', () => { state.artifactMode = 'structured'; $('#artifactPanel').classList.remove('hidden'); updateArtifact(); });
  $('[data-action="raw"]')?.addEventListener('click', () => { state.artifactMode = 'raw'; $('#artifactPanel').classList.remove('hidden'); updateArtifact(); toast('Raw A2A envelope opened below.'); });
  $('[data-action="close-artifact"]')?.addEventListener('click', () => $('#artifactPanel').classList.add('hidden'));
  $('[data-action="more"]')?.addEventListener('click', () => {
    const menu = $('#mobileMore');
    const open = menu.classList.toggle('hidden');
    $('[data-action="more"]').setAttribute('aria-expanded', String(!open));
  });

  $$('[data-evidence-id]').forEach(element => {
    element.addEventListener('click', event => {
      if (event.target.closest('[data-view]')) return;
      showEvidence(element.dataset.evidenceId);
    });
    if (element.getAttribute('role') === 'button') element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showEvidence(element.dataset.evidenceId); }
    });
  });
  $$('[data-action="close-evidence"]').forEach(element => element.addEventListener('click', closeEvidence));
  $$('.page-item').forEach(item => item.addEventListener('click', () => { renderPage(item.dataset.pageKey); toast(`${item.querySelector('strong').textContent} selected.`); }));
  $$('.recommendation-item, .matrix-dot').forEach(item => item.addEventListener('click', () => renderRecommendation(item.dataset.recommendationKey)));
  $$('[data-research-scope]').forEach(button => button.addEventListener('click', () => setResearchScope(button.dataset.researchScope)));
  $$('[data-mode]').forEach(button => button.addEventListener('click', () => setAgentMode(button.dataset.mode)));

  window.addEventListener('popstate', navigateFromLocation);
  window.addEventListener('hashchange', navigateFromLocation);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeEvidence(); $('#mobileMore')?.classList.add('hidden'); }
  });
  navigateFromLocation();
});
