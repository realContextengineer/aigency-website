const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const templates = {
  overview: 'overviewTemplate', interactions: 'interactionsTemplate', content: 'contentTemplate', media: 'mediaTemplate',
  'public-interest': 'publicInterestTemplate', disclosures: 'disclosuresTemplate', signals: 'signalsTemplate',
  'article-50': 'article50Template', code: 'codeTemplate', recommendations: 'recommendationsTemplate', report: 'reportTemplate',
  methodology: 'methodologyTemplate', agent: 'agentTemplate', demo: 'demoTemplate'
};

const viewCopy = {
  overview: ['ACT 50 review', 'Review workspace', 'A clear account of what the public surface reveals, what it suggests and what it cannot know.'],
  interactions: ['AI interactions', 'Observed surface', 'AI interaction transparency starts at the first moment a visitor meets the system.'],
  content: ['Generated content', 'Signal review', 'Patterns can prompt a question; they cannot establish authorship or responsibility.'],
  media: ['Media review', 'Visual evidence', 'Possible synthetic media is a human assessment prompt, never an automatic verdict.'],
  'public-interest': ['Public-interest text', 'Owner assessment', 'Editorial control and responsibility cannot be established by a crawl alone.'],
  disclosures: ['Disclosure quality', 'Clarity matrix', 'Presence, clarity, timing, accessibility and human route are separate questions.'],
  signals: ['Machine signals', 'Technical inspection', 'Inspect metadata and provenance without treating absence as legal failure.'],
  'article-50': ['Article 50', 'Plain-language view', 'A review map for transparency obligations applying since 2 August 2026.'],
  code: ['Code readiness', 'Voluntary mechanism', 'Review marking, labelling, accessibility and evidence without certifying compliance.'],
  recommendations: ['Recommendations', 'Priority queue', 'Start with the clearest public-facing improvements and the questions only owners can answer.'],
  report: ['Review report', 'Exportable record', 'A structured record of evidence, uncertainty, recommendations and human decisions required.'],
  methodology: ['Methodology', 'Transparency about transparency', 'Every finding carries a posture so uncertainty does not become a false verdict.'],
  agent: ['Agent access', 'A2A ready', 'An honest Agent Card for future orchestration, with human judgement kept explicit.'],
  demo: ['Demo information', 'About ACT 50', 'A fictional A2A DESIGN product concept demonstrating an evidence-led review instrument.']
};

const labels = {
  role: { provider: 'Provider', deployer: 'Deployer', publisher: 'Publisher / editor', unsure: 'Not sure' },
  surface: { interaction: 'interaction', content: 'content', biometric: 'emotion / biometric', deepfake: 'deepfake / public-interest' }
};

const state = {
  domain: 'example.co.uk',
  view: 'overview',
  scanned: false,
  profile: { role: 'deployer', region: 'EU-facing', surfaces: ['interaction', 'content'] }
};

function toast(message) {
  const note = document.createElement('div');
  note.className = 'toast';
  note.textContent = message;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3200);
}

function profileSummary() {
  const role = labels.role[state.profile.role] || labels.role.unsure;
  const surfaces = state.profile.surfaces.length
    ? state.profile.surfaces.map(value => labels.surface[value] || value).join(' + ')
    : 'no AI surface selected';
  return `${role} · ${state.profile.region} · ${surfaces}`;
}

function syncScopeControls() {
  $$('.scope-btn').forEach(button => {
    const group = button.dataset.scopeGroup;
    const value = button.dataset.scopeValue;
    const active = group === 'surface'
      ? state.profile.surfaces.includes(value)
      : state.profile[group] === value;
    button.setAttribute('aria-pressed', String(active));
  });
  const summary = profileSummary();
  const status = $('#scopeStatus');
  const scanProfile = $('#scanProfile');
  if (status) status.textContent = summary;
  if (scanProfile) scanProfile.textContent = summary;
}

function updateOverviewContext() {
  const target = $('.target-card');
  if (!target) return;
  const targetCopy = $('.target-card > div');
  if (targetCopy && !$('.target-profile', targetCopy)) {
    const strip = document.createElement('div');
    strip.className = 'context-strip target-profile';
    strip.innerHTML = '<span class="context-chip"><b>Role</b><span data-context-role></span></span><span class="context-chip"><b>Market</b><span data-context-region></span></span>';
    targetCopy.appendChild(strip);
  }
  const role = $('[data-context-role]', target);
  const region = $('[data-context-region]', target);
  if (role) role.textContent = labels.role[state.profile.role] || labels.role.unsure;
  if (region) region.textContent = state.profile.region;
  const side = $('.overview-side');
  if (side && !$('.scope-review-card', side)) {
    side.insertAdjacentHTML('beforeend', '<div class="side-card scope-review-card"><span class="card-label">REVIEW PROFILE</span><div class="posture-word">Role and<br><em>surface mapped.</em></div><p>The profile routes provider, deployer and editorial questions before anyone interprets a finding.</p><div class="legend-row"><span><i class="dot-observed"></i><span data-context-role></span></span><span><i class="dot-inferred"></i><span data-context-region></span></span></div></div>');
  }
  $$('[data-context-role]').forEach(node => { node.textContent = labels.role[state.profile.role] || labels.role.unsure; });
  $$('[data-context-region]').forEach(node => { node.textContent = state.profile.region; });
}

function updateViewContext(view) {
  const status = $('#reviewState');
  if (status) {
    status.textContent = view === 'recommendations' ? 'Action queue ready'
      : state.profile.role === 'provider' ? 'Provider evidence + human review'
        : 'Human review required';
  }
  const domain = $('#reviewDomain');
  const reportDomain = $('#reportDomain');
  if (domain) domain.textContent = state.domain;
  if (reportDomain) reportDomain.textContent = state.domain;
  syncScopeControls();
}

function evidenceMarkup(kind = 'Observed') {
  return `<div class="evidence-record"><span class="card-label">EVIDENCE RECORD / ${kind.toUpperCase()}</span><div class="evidence-grid"><div><span>Source</span><strong>${state.domain} · public surface</strong></div><div><span>Checked</span><strong>07 Aug 2026 · illustrative</strong></div><div><span>Posture</span><strong>${kind}</strong></div><div><span>Decision</span><strong>Owner or human review remains open</strong></div></div></div>`;
}

function enhanceView(view) {
  if (view === 'overview') {
    const timeline = $('.timeline-card');
    if (timeline) {
      const date = $('strong', timeline);
      const copy = $('p', timeline);
      if (date) date.textContent = 'APPLIES SINCE 02 AUG 2026';
      if (copy) copy.textContent = 'Article 50 transparency rules now apply. A limited transition only concerns marking and detection for certain pre-existing systems.';
    }
    const main = $('.overview-main');
    if (main && !$('.overview-evidence', main)) main.insertAdjacentHTML('beforeend', evidenceMarkup('Review profile applied').replace('class="evidence-record"', 'class="evidence-record overview-evidence"'));
    updateOverviewContext();
  }

  if (view === 'interactions') {
    const feature = $('.interaction-feature');
    if (feature) {
      const lede = $('.feature-lede', feature);
      if (lede) lede.textContent = 'An AI interaction appears available from the public surface. ACT 50 checks whether the role is clear before a visitor meaningfully engages.';
      $$('.evidence-list small', feature).forEach(date => { date.textContent = date.textContent.replace('08 Aug 2026', '07 Aug 2026'); });
      const checks = $('.check-grid', feature);
      if (checks && !$('.first-exposure', feature)) checks.insertAdjacentHTML('afterend', '<div class="first-exposure"><span class="card-label">FIRST INTERACTION CHECK</span><h4>Make the first moment unmistakable.</h4><p>The disclosure should be clear and distinguishable at the latest when a visitor first interacts with the system.</p><div class="exposure-list"><div><span>Entry point labels the system as AI</span><b>NEEDS REVIEW</b></div><div><span>Notice appears before meaningful interaction</span><b>TEST REQUIRED</b></div><div><span>Limitations are understandable</span><b>PARTIAL</b></div><div><span>Human route is visible without asking</span><b>OBSERVED</b></div></div></div>');
      if (!$('.evidence-record', feature)) feature.insertAdjacentHTML('beforeend', evidenceMarkup('Observed + test required'));
    }
  }

  if (view === 'content') {
    const feature = $('.feature-main');
    if (feature && !$('.evidence-record', feature)) feature.insertAdjacentHTML('beforeend', evidenceMarkup('Inferred signal'));
  }

  if (view === 'public-interest') {
    const form = $('.owner-form');
    if (form) {
      const labelsInForm = $$('label', form);
      if (labelsInForm[1]) labelsInForm[1].textContent = 'Was the substance meaningfully reviewed and subject to editorial control?';
      if (!$('.editorial-note', form)) form.insertAdjacentHTML('beforeend', '<p class="editorial-note">A spelling or grammar-only check is not the same as substantive human review. Record the person or organisation with final editorial responsibility.</p>');
      if (!$('.evidence-record', form)) form.insertAdjacentHTML('beforeend', evidenceMarkup('Owner information required'));
    }
  }

  if (view === 'disclosures') {
    const timely = $('.matrix-head span:nth-child(4)');
    const intro = $('.matrix-intro p');
    if (timely) timely.textContent = 'At first exposure';
    if (intro) intro.textContent = 'Timely means the notice is clear and distinguishable at the latest at the first interaction or exposure. Accessibility is a separate check.';
  }

  if (view === 'signals') {
    const summary = $('.signal-summary p');
    if (summary) summary.textContent = 'ACT 50 checks inspectable metadata, content credentials, structured information, AI-related labels and embedded machine-readable information. Provider responsibility still needs evidence from the value chain.';
    const system = $$('.signal-items > div').find(item => $('strong', item)?.textContent === 'System marking');
    if (system) {
      const note = $('small', system);
      if (note) note.textContent = 'Provider evidence required; absence is not a legal verdict';
    }
  }

  if (view === 'article-50') {
    const intro = $('.article50-intro');
    if (intro) {
      const copy = $('p', intro);
      const link = $('a', intro);
      if (copy) copy.innerHTML = 'Article 50 applies <strong>since 2 August 2026</strong>. ACT 50 maps review questions to the right role and evidence; it does not provide binding legal interpretation.';
      if (link) {
        link.href = 'https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations';
        link.textContent = 'Read Commission guidance ↗';
      }
      if (!$('.status-chip', intro)) intro.insertAdjacentHTML('beforeend', '<span class="status-chip">Guidance current · 06 Aug 2026</span>');
    }
    const tiles = $$('.article50-tiles > div');
    const tileCopy = [
      'Providers of directly interactive AI systems must inform people they are interacting with AI unless that is obvious in context.',
      'Providers of systems generating synthetic audio, image, video or text must use machine-readable marking that is detectable, within the technical scope.',
      'Deployers must inform people exposed to emotion-recognition or biometric-categorisation systems, subject to the stated exceptions.',
      'Deployers must disclose deepfakes and certain public-interest AI text, unless the relevant human-review and editorial-responsibility exception applies.',
      'Information must be clear and distinguishable no later than the first interaction or exposure, and meet applicable accessibility requirements.'
    ];
    tiles.forEach((tile, index) => { const p = $('p', tile); if (p && tileCopy[index]) p.textContent = tileCopy[index]; });
    if (tiles[3] && !$('.article50-fifth')) $('.article50-tiles').insertAdjacentHTML('beforeend', '<div class="article50-fifth"><b>50(5)</b><strong>Timing + accessibility</strong><p>Every relevant notice must arrive by the first interaction or exposure, be clear and distinguishable, and meet applicable accessibility requirements.</p></div>');
    const grid = $('.article50-grid');
    if (grid && !$('.article50-source')) grid.insertAdjacentHTML('afterend', '<div class="article50-source"><strong>Source trail</strong><span>Regulation (EU) 2024/1689 · Article 50</span><span>Commission guidance updated 06 Aug 2026</span><a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32024R1689" target="_blank" rel="noreferrer">Open EUR-Lex text ↗</a></div><div class="exception-grid"><div><b>Context</b><p>AI interaction may be obvious to a reasonably well-informed visitor in context.</p></div><div><b>Standard editing</b><p>Assistive editing that does not substantially alter input or semantics may sit outside the marking obligation.</p></div><div><b>Creative work</b><p>Artistic, fictional or satirical work may use an appropriate, non-disruptive disclosure.</p></div><div><b>Transition</b><p>Pre-2 Aug 2026 content need not be labelled retroactively; limited marking transition runs to 2 Dec 2026 for certain existing systems.</p></div></div>');
  }

  if (view === 'code') {
    const hero = $('.code-hero p');
    if (hero) hero.textContent = 'The EU Code of Practice is a voluntary way for providers and deployers to demonstrate marking and labelling compliance. Organisations using other measures should retain evidence that those measures are equivalently adequate.';
    const list = $('.code-list');
    if (list && !$('.alternative-means', list)) list.insertAdjacentHTML('beforeend', '<div class="alternative-means"><span>06</span><strong>Alternative adequate means</strong><b class="pill pill-owner">Documented</b></div>');
  }

  if (view === 'recommendations') {
    const banner = $('.priority-banner');
    const list = $('.recommendation-list');
    if (banner) {
      const label = $('.card-label', banner);
      const copy = $('p', banner);
      if (label) label.textContent = 'PRIORITY QUEUE / 05 ACTIONS';
      if (copy) copy.textContent = 'Recommendations are ordered by evidence, impact and effort—not by a compliance score.';
    }
    if (list) list.innerHTML = '<button class="recommendation" data-drawer="rec1"><span class="rec-num">01</span><span><strong>Define provider, deployer and editorial role</strong><small>Scope gate · High impact · Low effort</small></span><b>START HERE →</b></button><button class="recommendation" data-drawer="rec2"><span class="rec-num">02</span><span><strong>Test every first interaction and exposure</strong><small>Observed surface · High impact</small></span><b>TEST NOW →</b></button><button class="recommendation" data-drawer="rec3"><span class="rec-num">03</span><span><strong>Retain evidence for machine-readable marking</strong><small>Provider evidence · High impact</small></span><b>ASK PROVIDER →</b></button><button class="recommendation" data-drawer="rec4"><span class="rec-num">04</span><span><strong>Confirm meaningful editorial control</strong><small>Owner input · High impact</small></span><b>ASK OWNER →</b></button><button class="recommendation" data-drawer="rec5"><span class="rec-num">05</span><span><strong>Make the human route visible</strong><small>Human review · Medium impact</small></span><b>IMPROVE →</b></button>';
  }

  if (view === 'report') {
    const cover = $('.report-cover');
    const sections = $('.report-sections');
    const prepared = $('.report-meta span:first-child', cover);
    if (prepared) prepared.textContent = 'Prepared 07 Aug 2026';
    if (cover && !$('#downloadReview', cover)) cover.insertAdjacentHTML('beforeend', '<div class="report-action"><button class="primary-btn small" id="downloadReview" type="button">Download JSON review ↗</button></div><p class="report-source-note">Source boundary: public surface observations, owner answers and human-review decisions. This demonstration does not crawl a live site.</p>');
    if (sections && !$('.evidence-report-row', sections)) sections.insertAdjacentHTML('beforeend', '<div class="evidence-report-row"><b>08</b>Evidence trail + source timestamps</div><div class="evidence-report-row"><b>09</b>Scope, exceptions + residual uncertainty</div><div class="evidence-report-row"><b>10</b>Reviewer sign-off + retest date</div>');
  }

  if (view === 'demo') {
    const list = $('.demo-list');
    if (list) {
      const current = $$('div', list).find(item => $('strong', item)?.textContent === 'Current lens');
      if (current) { const p = $('p', current); if (p) p.textContent = 'EU AI Act Article 50 transparency questions, applying since 2 August 2026, with guidance version shown in the review.'; }
    }
  }
}

function navigate(view, updateHash = true) {
  if (!templates[view]) view = 'overview';
  state.view = view;
  const start = $('#startView');
  const scan = $('#scanView');
  const content = $('#contentView');
  const isOverview = view === 'overview' && !state.scanned;
  start.classList.toggle('is-hidden', !isOverview);
  scan.classList.add('is-hidden');
  content.classList.toggle('is-hidden', isOverview);
  $$('.nav-link,.mobile-nav a').forEach(link => link.classList.toggle('active', link.dataset.view === view));
  if (!isOverview) {
    const copy = viewCopy[view] || viewCopy.overview;
    $('#viewTitle').innerHTML = copy[0].replace(' ', ' <em>') + '</em>';
    $('#viewKicker').textContent = copy[1];
    $('#viewIntro').textContent = copy[2];
    const clone = document.importNode($('#' + templates[view]).content, true);
    $('#viewBody').replaceChildren(clone);
    $('#crumbName').textContent = copy[0].toUpperCase();
    enhanceView(view);
    updateViewContext(view);
    bindViewActions();
  } else {
    $('#crumbName').textContent = 'NEW INSPECTION';
    syncScopeControls();
  }
  if (updateHash) history.replaceState(null, '', `#${view}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindViewActions() {
  $$('[data-view]').forEach(el => {
    if (el.dataset.view && !el.classList.contains('nav-link') && !el.classList.contains('mobile-nav')) {
      el.addEventListener('click', () => navigate(el.dataset.view));
    }
  });
  $$('[data-drawer]').forEach(el => el.addEventListener('click', () => openDrawer(el.dataset.drawer)));
  $$('.choice-row button').forEach(button => button.addEventListener('click', () => {
    button.parentElement.querySelectorAll('button').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
  }));
  const download = $('#downloadReview');
  if (download) download.addEventListener('click', downloadReview);
}

function openDrawer(kind) {
  const copy = {
    disclosure: ['Suggested disclosure copy', '“Ask our AI assistant for a quick first answer. This assistant uses AI and may make mistakes. Ask for a person at any time.”', 'Copy is a recommendation for owner review, not a legal conclusion.'],
    rec1: ['Start here / define the role', 'Record whether the organisation is acting as provider, deployer, publisher or another value-chain participant before interpreting a finding.', 'Type: Scope gate · Impact: High · Effort: Low'],
    rec2: ['Test first exposure', 'Check the exact moment a visitor first interacts with the AI or first sees the relevant generated content. Capture the notice, timing, viewport and accessibility state.', 'Type: Evidence test · Impact: High'],
    rec3: ['Ask provider / marking evidence', 'Request the marking approach, detectability evidence, provenance documentation and the chosen Code of Practice or equivalent measures.', 'Type: Provider evidence · Impact: High'],
    rec4: ['Ask owner / editorial control', 'Confirm meaningful human review and record the natural or legal person with final editorial responsibility for the publication.', 'Type: Owner input · Impact: High'],
    rec5: ['Improve / human handover', 'Make the route to a person visible after automation, including when the assistant may be wrong or incomplete.', 'Type: Human review · Impact: Medium']
  }[kind] || ['ACT 50 note', 'This finding remains open for contextual review.', 'Review-led instrument'];
  $('#drawerContent').innerHTML = `<span class="card-label">ACT 50 / REVIEW NOTE</span><h3>${copy[0]}</h3><p>${copy[1]}</p><small class="drawer-meta">${copy[2]}</small>`;
  $('#detailDrawer').classList.remove('is-hidden');
}

function resetScanStages() {
  $$('.scan-stage').forEach(stage => {
    stage.classList.remove('active');
    const stateNode = $('i', stage);
    if (stateNode) stateNode.textContent = 'queued';
  });
}

function runScan() {
  state.domain = ($('#scanUrl').value.trim() || 'https://example.co.uk').replace(/^https?:\/\//, '').replace(/\/$/, '');
  $('#scanTarget').textContent = state.domain;
  $('#scanProfile').textContent = profileSummary();
  $('#startView').classList.add('is-hidden');
  $('#contentView').classList.add('is-hidden');
  $('#scanView').classList.remove('is-hidden');
  $('#crumbName').textContent = 'LIVE INSPECTION';
  state.scanned = true;
  resetScanStages();
  let stage = 0;
  const stages = $$('.scan-stage');
  const messages = ['Applying review profile and mapping public routes...', 'Looking for AI entry points...', 'Reading media signals...', 'Finding public-interest candidates...', 'Comparing first disclosure moments...', 'Checking inspectable provenance...'];
  const tick = () => {
    if (stage > 0) stages[stage - 1].querySelector('i').textContent = 'observed';
    if (stage < stages.length) {
      stages[stage].classList.add('active');
      stages[stage].querySelector('i').textContent = 'reading';
      $('#scanMessage').textContent = messages[stage];
      $('#scanPercent').textContent = String(Math.round(((stage + 1) / stages.length) * 100)).padStart(2, '0');
      $('#scanState').textContent = `${stage + 1} / ${stages.length} stages`;
      stage += 1;
      setTimeout(tick, 420);
    } else {
      $('#scanMessage').textContent = 'Review boundary established. Evidence remains illustrative.';
      $('#scanState').textContent = '6 / 6 stages · ready for review';
      toast('Inspection complete. Human review remains explicit.');
      setTimeout(() => navigate('overview'), 650);
    }
  };
  tick();
}

function downloadReview() {
  const payload = {
    product: 'ACT 50',
    mode: 'illustrative demonstration',
    target: state.domain,
    checked: '2026-08-07',
    profile: { role: labels.role[state.profile.role] || labels.role.unsure, market: state.profile.region, surfaces: state.profile.surfaces.map(value => labels.surface[value] || value) },
    posture: 'Evidence-led review; not legal advice',
    source_boundary: 'Public surface observations, owner input and human review prompts',
    findings: [
      { area: 'AI interaction', posture: 'Observed + test required', next_step: 'Label the system before meaningful first interaction.' },
      { area: 'Generated content', posture: 'Inferred / owner input', next_step: 'Request provider marking and provenance evidence.' },
      { area: 'Public-interest text', posture: 'Owner information required', next_step: 'Record meaningful human review and editorial responsibility.' },
      { area: 'Disclosure quality', posture: 'Human review', next_step: 'Check first exposure, clarity, accessibility and human route.' }
    ],
    sources: [
      'Regulation (EU) 2024/1689, Article 50',
      'European Commission Guidelines on transparency obligations, updated 2026-08-06',
      'European Commission Code of Practice on Transparency of AI-generated Content'
    ]
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `act-50-${state.domain.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-review.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('JSON review downloaded with evidence posture and source trail.');
}

$('#inspectForm').addEventListener('submit', event => { event.preventDefault(); runScan(); });
$('#tryDemo').addEventListener('click', () => { $('#scanUrl').value = 'https://harbour-field.example'; runScan(); });
$('#closeDrawer').addEventListener('click', () => $('#detailDrawer').classList.add('is-hidden'));
$('#exportReport').addEventListener('click', () => { navigate('report'); toast('Review report prepared. Download it from the report page.'); });
$$('[data-view]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); navigate(link.dataset.view); }));
$$('.scope-btn').forEach(button => button.addEventListener('click', () => {
  const group = button.dataset.scopeGroup;
  const value = button.dataset.scopeValue;
  if (group === 'surface') {
    state.profile.surfaces = state.profile.surfaces.includes(value)
      ? state.profile.surfaces.filter(item => item !== value)
      : [...state.profile.surfaces, value];
  } else {
    state.profile[group] = value;
  }
  syncScopeControls();
}));
syncScopeControls();

const initialView = location.hash.slice(1);
if (templates[initialView]) { state.scanned = true; navigate(initialView, false); }
