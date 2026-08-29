(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const sources = {
    'agreement-v2': { name: 'Service Agreement v2', type: 'PDF', meta: 'Selected source · 18 pages', pages: 18, section: 'Clause 11.2', group: 'Project documents' },
    'agreement-v1': { name: 'Service Agreement v1', type: 'PDF', meta: 'Archived source · 16 pages', pages: 16, section: 'Clause 4.2', group: 'Project documents' },
    proposal: { name: 'Project Proposal', type: 'DOCX', meta: 'Indexed source · 8 pages', pages: 8, section: 'Section 3', group: 'Project documents' },
    'meeting-notes': { name: 'Meeting Notes', type: 'DOCX', meta: 'Indexed source · 4 pages', pages: 4, section: 'Page 2', group: 'Project documents' },
    'delivery-plan': { name: 'Delivery Plan', type: 'PDF', meta: 'Indexed source · 6 pages', pages: 6, section: 'Milestone 1', group: 'Project documents' },
    pricing: { name: 'Pricing & Milestones', type: 'XLSX', meta: 'Indexed source · 1 sheet', pages: 1, section: 'Milestone table', group: 'Project documents' },
    'data-policy': { name: 'Data Protection Policy', type: 'PDF', meta: 'Indexed source · 12 pages', pages: 12, section: 'Section 7', group: 'Policies' },
    'accessibility-policy': { name: 'Accessibility Policy', type: 'PDF', meta: 'Indexed source · 7 pages', pages: 7, section: 'Section 4', group: 'Policies' },
    'client-email': { name: 'Client Brief', type: 'EML', meta: 'Indexed source · 4 Aug', pages: 1, section: 'Email body', group: 'Email / communications' }
  };

  const state = {
    selectedSource: 'agreement-v2',
    canvasMode: 'document',
    panelTab: 'ask',
    specialView: 'library',
    question: '',
    zoom: 100,
    actionState: {},
    agentRun: false,
    rawAgent: false,
    compareTab: 'changes',
    citationSource: null
  };

  const defaultQuestion = 'What has the client agreed to provide before the project starts?';

  function toast(message) {
    const node = $('.toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'), 2600);
  }

  function fileClass(type) {
    return type.toLowerCase();
  }

  function citation(sourceId, number, section, detail) {
    const source = sources[sourceId];
    return `<button class="citation" data-citation-source="${sourceId}"><span class="citation-number">${number}</span><span><strong>${source.name}</strong><small>${section} · ${detail}</small></span></button>`;
  }

  function renderPaper() {
    const source = sources[state.selectedSource];
    const id = state.selectedSource;
    const title = id === 'agreement-v1' ? 'Service Agreement' : id === 'agreement-v2' ? 'Service Agreement' : source.name;
    const version = id === 'agreement-v1' ? 'Version 1.0 · 03 August 2026' : id === 'agreement-v2' ? 'Version 2.0 · 06 August 2026' : 'Harbour House Review · indexed 06 August 2026';
    let body;

    if (id === 'agreement-v2') {
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>AGREEMENT / 04</span></div>
        <span class="document-section-label">Service agreement</span><h2>${title}<br><em>Digital experience delivery</em></h2>
        <div class="document-meta"><span>Document <strong>AGR-2026-02</strong></span><span>Status <strong>Needs review</strong></span><span>Effective <strong>06 Aug 2026</strong></span></div>
        <p>This agreement records the delivery relationship between AIGENCY Ltd and Harbour House. DOSSIER has indexed the signed draft and linked its obligations to the project proposal and meeting record.</p>
        <div class="document-rule"></div><h2>4. Fees and payment</h2>
        <p><strong>4.2</strong> Invoices are payable within <span class="highlight violet">14 days of receipt</span>. Late payment may pause work after written notice. <button class="citation-anchor" data-citation-source="agreement-v2">A</button></p>
        <h2>6. Client responsibilities</h2><p><strong>6.2</strong> The client will provide brand assets, website access and a named approval contact before the discovery session.</p>
        <h2>11. Termination</h2><p><strong>11.2</strong> Either party may terminate this agreement with <span class="highlight">30 days’ written notice</span>. <button class="citation-anchor" data-citation-source="agreement-v2">B</button></p>
        <p><strong>11.4</strong> A material failure to supply agreed project inputs may trigger a review of the delivery schedule.</p>
        <h2>14. Liability</h2><p><strong>14.1</strong> The aggregate liability cap is <span class="highlight mint">£100,000</span>, subject to the exclusions in this clause.</p>
        <aside class="margin-note note-one"><strong>Linked insight</strong>New approval contact obligation is also referenced in the proposal.</aside><aside class="margin-note note-two"><strong>Review flag</strong>Clause 11.4 was added in this version.</aside>
        <div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>04</span></div>`;
    } else if (id === 'agreement-v1') {
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>AGREEMENT / 04</span></div>
        <span class="document-section-label">Service agreement · archived</span><h2>${title}<br><em>Digital experience delivery</em></h2>
        <div class="document-meta"><span>Document <strong>AGR-2026-01</strong></span><span>Status <strong>Archived</strong></span><span>Effective <strong>03 Aug 2026</strong></span></div>
        <p>This earlier draft is retained to make the change history inspectable. It is not the current source of truth for delivery obligations.</p>
        <div class="document-rule"></div><h2>4. Fees and payment</h2><p><strong>4.2</strong> Invoices are payable within <span class="highlight">30 days of receipt</span>.</p>
        <h2>6. Client responsibilities</h2><p><strong>6.2</strong> The client will provide reasonable access and feedback during delivery.</p>
        <h2>11. Termination</h2><p><strong>11.2</strong> Either party may terminate this agreement with 30 days’ written notice.</p>
        <h2>14. Liability</h2><p><strong>14.1</strong> The aggregate liability cap is <span class="highlight">£50,000</span>.</p>
        <div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>04</span></div>`;
    } else if (id === 'proposal') {
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>PROPOSAL / 03</span></div><span class="document-section-label">Project proposal</span><h2>Harbour House<br><em>Digital experience</em></h2><div class="document-meta"><span>Prepared by <strong>AIGENCY Ltd</strong></span><span>Issued <strong>01 Aug 2026</strong></span><span>Review <strong>In progress</strong></span></div><p>Our proposal sets out a focused discovery and delivery programme for Harbour House, with a clear route from source material to approved public experience.</p><div class="document-rule"></div><h2>3. Client inputs</h2><p>Before work starts, Harbour House will provide <span class="highlight mint">brand assets, existing website access and a named approval contact</span>. <button class="citation-anchor" data-citation-source="proposal">A</button></p><h2>5. Timings</h2><p>Content and brand assets are listed as due by <span class="highlight violet">18 August 2026</span>, ahead of the discovery session.</p><h2>7. Commercials</h2><p>The fixed discovery fee is £4,800, followed by milestone billing agreed in the pricing sheet.</p><aside class="margin-note note-one"><strong>Conflict</strong>Meeting notes record 22 August for the same content handover.</aside><div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>03</span></div>`;
    } else if (id === 'meeting-notes') {
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>MEETING NOTES / 02</span></div><span class="document-section-label">Discovery meeting · 04 August</span><h2>Harbour House<br><em>Working notes</em></h2><div class="document-meta"><span>Attendees <strong>4 people</strong></span><span>Owner <strong>Karl H.</strong></span><span>Pages <strong>4</strong></span></div><p>Notes captured during the initial review. These are a useful working record and remain subject to confirmation where they differ from signed documents.</p><div class="document-rule"></div><h2>Agreed next steps</h2><p>Harbour House will share website access, brand assets and the approval contact after the internal content review.</p><h2>Dates raised</h2><p>Content handover was discussed as <span class="highlight">22 August 2026</span>. <button class="citation-anchor" data-citation-source="meeting-notes">A</button> Discovery is pencilled for 28 August.</p><h2>Open question</h2><p>Confirm whether the 18 August proposal date or the 22 August meeting date is the operative deadline.</p><aside class="margin-note note-two"><strong>Needs review</strong>Potential conflict with Project Proposal, Section 5.</aside><div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>02</span></div>`;
    } else if (id === 'delivery-plan') {
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>DELIVERY PLAN / 01</span></div><span class="document-section-label">Delivery plan</span><h2>Milestones<br><em>and review gates</em></h2><div class="document-meta"><span>Owner <strong>AIGENCY Ltd</strong></span><span>Updated <strong>06 Aug 2026</strong></span><span>Status <strong>Draft</strong></span></div><p>The delivery plan turns approved inputs into visible review gates. Dates remain dependent on the client handover being confirmed.</p><div class="document-rule"></div><h2>Milestone 1 · Discovery</h2><p>Initial design direction due for review on <span class="highlight violet">28 August 2026</span>.</p><h2>Milestone 2 · Prototype</h2><p>Prototype review follows seven working days after discovery sign-off.</p><h2>Dependency</h2><p>Client access, assets and approval contact must be available before the first review gate.</p><div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>01</span></div>`;
    } else if (id === 'pricing') {
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>PRICING / SHEET 01</span></div><span class="document-section-label">Pricing &amp; milestones</span><h2>Commercial<br><em>overview</em></h2><div class="document-meta"><span>Currency <strong>GBP</strong></span><span>Updated <strong>02 Aug 2026</strong></span><span>Rows <strong>4</strong></span></div><p>Commercial schedule associated with the proposal. Amounts are shown for demonstration and require approval before export.</p><div class="document-rule"></div><h2>Milestone schedule</h2><p>Discovery <strong>£4,800</strong> · Prototype <strong>£7,500</strong> · Build <strong>£14,200</strong>.</p><h2>Payment trigger</h2><p>Invoices follow the payment terms in the current Service Agreement v2.</p><div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>01</span></div>`;
    } else if (id === 'data-policy' || id === 'accessibility-policy') {
      const isData = id === 'data-policy';
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>POLICY / 07</span></div><span class="document-section-label">${isData ? 'Data protection policy' : 'Accessibility policy'}</span><h2>${isData ? 'Data protection' : 'Accessibility'}<br><em>operating policy</em></h2><div class="document-meta"><span>Policy owner <strong>Operations</strong></span><span>Review <strong>19 Jul 2026</strong></span><span>Status <strong>Current</strong></span></div><p>This policy is indexed as context for delivery decisions. It informs review but does not replace the project agreement.</p><div class="document-rule"></div><h2>${isData ? '7. Data handling' : '4. Inclusive review'}</h2><p>${isData ? 'Project materials are limited to authorised workspace members and retained only for the agreed delivery period.' : 'Review outputs should be tested against the agreed accessibility criteria before public release.'}</p><h2>Review owner</h2><p>Operations owns policy interpretation and should be included where a project decision creates a new risk.</p><div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>07</span></div>`;
    } else {
      body = `<div class="paper-running-head"><span>Harbour House Review</span><span>COMMUNICATION / 01</span></div><span class="document-section-label">Client communication</span><h2>Client<br><em>brief</em></h2><div class="document-meta"><span>From <strong>Harbour House</strong></span><span>Received <strong>04 Aug 2026</strong></span><span>Attachments <strong>3</strong></span></div><p>We are ready to share the materials for discovery and will confirm the final approval route internally.</p><div class="document-rule"></div><h2>Requested follow-up</h2><p>Please confirm the operative content handover date and the person who will give final sign-off.</p><div class="paper-footer"><span>DOSSIER · SOURCE VIEW</span><span>01</span></div>`;
    }
    return `<article class="document-page">${body}</article>`;
  }

  function mobileCompareContent(tab = state.compareTab) {
    if (tab === 'old') return `<article class="mobile-change-card"><span class="change-number">Service Agreement v1 · archived</span><h3>Previous version</h3><p>The earlier draft is retained as the comparison baseline.</p><div class="mobile-change-actions"><button data-source="agreement-v1">View old</button><button data-compare-tab="changes">View changes</button></div></article>`;
    if (tab === 'new') return `<article class="mobile-change-card"><span class="change-number">Service Agreement v2 · current</span><h3>Current version</h3><p>The current draft adds explicit client inputs and changes the commercial terms.</p><div class="mobile-change-actions"><button data-source="agreement-v2">View new</button><button data-compare-tab="changes">View changes</button></div></article>`;
    return `<article class="mobile-change-card"><span class="change-number">Change 01 · Clause 4.2</span><h3>Payment terms</h3><div class="mobile-change-values"><div><span>Old</span><strong>30 days</strong></div><div><span>New</span><strong>14 days</strong></div></div><p>Payment becomes due 16 days sooner. The current wording is directly stated in Service Agreement v2.</p><div class="mobile-change-actions"><button data-source="agreement-v1">View old</button><button data-source="agreement-v2">View new</button></div></article><article class="mobile-change-card"><span class="change-number">Change 02 · Clause 14.1</span><h3>Liability cap</h3><div class="mobile-change-values"><div><span>Old</span><strong>£50,000</strong></div><div><span>New</span><strong>£100,000</strong></div></div><p>The aggregate cap increases in the current version and needs review before approval.</p><div class="mobile-change-actions"><button data-source="agreement-v1">View old</button><button data-source="agreement-v2">View new</button></div></article><article class="mobile-change-card"><span class="change-number">Change 03 · Clause 6.2</span><h3>Client inputs added</h3><div class="mobile-change-values"><div><span>Old</span><strong>Reasonable access</strong></div><div><span>New</span><strong>Named inputs</strong></div></div><p>Brand assets, website access and a named approval contact are now explicit before discovery.</p></article>`;
  }

  function renderCompare() {
    return `<div class="compare-stage"><article class="compare-sheet old"><span class="document-section-label">Previous version</span><h3>Service Agreement v1</h3><div class="version-label">Archived · 03 August 2026</div><p>The earlier draft is shown as a stable baseline. Every highlighted change is linked to a passage in the current version.</p><div class="diff-line removed"><strong>Removed · Clause 4.2</strong>Invoices payable within 30 days of receipt.</div><div class="diff-line modified"><strong>Modified · Clause 14.1</strong>Aggregate liability cap: £50,000.</div><p>Client responsibilities were described as reasonable access and feedback during delivery.</p></article><article class="compare-sheet new"><span class="document-section-label">Current version</span><h3>Service Agreement v2</h3><div class="version-label">Needs review · 06 August 2026</div><p>The current draft adds more explicit project inputs and changes the commercial terms.</p><div class="diff-line added"><strong>Added · Clause 6.2</strong>Brand assets, website access and a named approval contact are required before discovery.</div><div class="diff-line modified"><strong>Modified · Clause 14.1</strong>Aggregate liability cap: £100,000.</div><div class="diff-line modified"><strong>Modified · Clause 4.2</strong>Invoices payable within 14 days of receipt.</div><p>Clause 11.4 introduces a review trigger where agreed project inputs are not supplied.</p></article><section class="compare-mobile-summary"><span class="document-section-label">Document comparison</span><h2>Service Agreement v1 <em>vs</em> v2</h2><p>Three material changes found · current version needs review</p><div class="compare-mobile-tabs"><button data-compare-tab="changes" class="active">Changes</button><button data-compare-tab="old">Old</button><button data-compare-tab="new">New</button></div><div class="compare-mobile-content" id="compareMobileContent">${mobileCompareContent()}</div></section></div>`;
  }

  function renderSourceMap() {
    return `<div class="source-map"><span class="document-section-label">Trace the answer</span><h2>Client inputs before discovery</h2><p>DOSSIER follows each answer back to the passages that support it. The conflict stays visible instead of being silently resolved.</p><div class="source-map-answer"><div class="answer-label">Answer with provenance</div><strong>Harbour House agreed to provide brand assets, website access and a named approval contact.</strong><div class="map-flow"><div class="map-source"><strong>Project Proposal</strong><small>Section 3 · client inputs</small></div><div class="map-arrow">→</div><div class="map-source"><strong>Service Agreement v2</strong><small>Clause 6.2 · responsibility</small></div><div class="map-source"><strong>Meeting Notes</strong><small>Page 2 · handover date</small></div><div class="map-arrow">→</div><div class="map-source"><strong>Human review</strong><small>18 Aug vs 22 Aug · unresolved</small></div></div></div></div>`;
  }

  function renderDocument() {
    const source = sources[state.selectedSource];
    $('#canvasSourceName').textContent = source.name;
    $('#canvasSourceMeta').textContent = source.meta;
    $('#pageTotal').textContent = source.pages;
    const page = state.canvasMode === 'document' ? (state.selectedSource === 'agreement-v2' || state.selectedSource === 'agreement-v1' ? '4' : '1') : '—';
    $('#pageNumber').textContent = page;
    $('#mobilePageNumber').textContent = page;
    $('#mobilePageTotal').textContent = source.pages;
    document.body.classList.toggle('focus-mode', state.canvasMode === 'focus');
    $$('.canvas-mode').forEach(button => button.classList.toggle('active', button.dataset.mode === state.canvasMode));
    const stage = $('#documentStage');
    stage.classList.toggle('focus-canvas', state.canvasMode === 'focus');
    if (state.canvasMode === 'compare') stage.innerHTML = renderCompare();
    else if (state.canvasMode === 'source-map') stage.innerHTML = renderSourceMap();
    else stage.innerHTML = renderPaper();
    stage.style.setProperty('--doc-zoom', `${state.zoom / 100}`);
    if (state.canvasMode === 'focus') toast('Focus mode keeps the document in view and reduces visual noise.');
  }

  function answerFor(question) {
    const q = question.toLowerCase();
    if (q.includes('terminat') || q.includes('notice')) return {
      title: 'How can either party terminate the agreement?',
      label: 'Directly stated',
      body: 'Either party may terminate the current agreement with 30 days’ written notice. Clause 11.4 also creates a review trigger if agreed project inputs are not supplied; it does not replace the notice requirement.',
      status: 'High confidence', citations: [citation('agreement-v2', '1', 'Clause 11.2', '30 days’ written notice')], conflict: false
    };
    if (q.includes('compare') || q.includes('changed') || q.includes('contract')) return {
      title: 'What changed between the agreement versions?', label: 'Directly stated', body: 'The current draft shortens payment terms from 30 to 14 days, raises the liability cap from £50,000 to £100,000, and adds explicit client-input and review language.', status: 'High confidence', citations: [citation('agreement-v1', '1', 'Clause 4.2 / 14.1', 'Previous terms'), citation('agreement-v2', '2', 'Clauses 4.2, 6.2 & 14.1', 'Current terms')], conflict: false
    };
    if (q.includes('date') || q.includes('deadline') || q.includes('when')) return {
      title: 'Which dates need attention?', label: 'Conflicting sources', body: 'The proposal lists client content and brand assets as due on 18 August 2026. Meeting notes record the handover as 22 August 2026. DOSSIER cannot determine which date is operative without human confirmation.', status: 'Review required', citations: [citation('proposal', '1', 'Section 5', '18 August 2026'), citation('meeting-notes', '2', 'Page 2', '22 August 2026')], conflict: true
    };
    return {
      title: 'Client inputs before the project starts', label: 'Directly stated', body: 'Harbour House agreed to provide brand assets, existing website access and a named approval contact before the discovery session.', status: 'High confidence', citations: [citation('agreement-v2', '1', 'Clause 6.2', 'Client responsibilities'), citation('proposal', '2', 'Section 3', 'Client inputs'), citation('meeting-notes', '3', 'Page 2', 'Agreed next steps')], conflict: true
    };
  }

  function renderAsk() {
    const question = state.question || defaultQuestion;
    const answer = answerFor(question);
    return `<form class="ask-form" id="askForm"><label for="askInput">Ask across authorised sources</label><div class="ask-input-wrap"><textarea class="ask-input" id="askInput" rows="2" placeholder="Ask a question with a source…">${question}</textarea><button class="ask-submit" id="askSubmit" type="submit">Ask</button></div><div class="question-chips"><button type="button" class="question-chip" data-question="What changed between the agreement versions?">What changed?</button><button type="button" class="question-chip" data-question="Which dates need attention?">Find conflicts</button><button type="button" class="question-chip" data-question="How can either party terminate the agreement?">Termination terms</button></div></form><article class="answer-card"><div class="answer-label">${answer.label}</div><h3>${answer.title}</h3><p>${answer.body}</p><div class="answer-status"><span class="status-tag high">${answer.status}</span><span class="status-tag direct">Source linked</span><span class="status-tag">No unsupported claims</span></div><div class="citation-list"><div class="citation-label">Sources · click to open passage</div>${answer.citations.join('')}</div>${answer.conflict ? '<div class="conflict-card"><strong>Conflict found · human review</strong><p>Project Proposal says content is due 18 August; Meeting Notes say 22 August. <button class="small-action" data-review-conflict>Open review</button></p></div>' : ''}</article>`;
  }

  function renderInsights() {
    return `<div class="panel-section-title"><span>Document at a glance</span><span>8 fields</span></div><div class="insight-grid"><div class="insight-row"><span class="insight-icon">⌁</span><span><strong>Purpose</strong><small>Define the digital experience delivery relationship and its review gates.</small></span></div><div class="insight-row"><span class="insight-icon">◎</span><span><strong>Key parties</strong><small>Harbour House and AIGENCY Ltd. Approval contact still needs naming.</small></span></div><div class="insight-row"><span class="insight-icon">◷</span><span><strong>Important dates</strong><small>18 Aug and 22 Aug content handover conflict; 28 Aug discovery review.</small></span></div><div class="insight-row"><span class="insight-icon">£</span><span><strong>Money</strong><small>£4,800 discovery fee; current liability cap £100,000; payment in 14 days.</small></span></div><div class="insight-row"><span class="insight-icon">→</span><span><strong>Obligations</strong><small>Client to provide assets, website access and a named approval contact.</small></span></div><div class="insight-row"><span class="insight-icon">!</span><span><strong>Open questions</strong><small>Confirm the operative handover date and the approval contact.</small></span></div></div><div class="human-review-panel"><span>◌</span><span><strong>Human review recommended</strong><p>One date conflict and one unnamed owner block a clean action export.</p></span></div>`;
  }

  function renderActions() {
    const actions = [
      ['01', 'Provide brand assets and existing website access', 'Harbour House', '18 or 22 Aug · confirm date', 'proposal'],
      ['02', 'Name the client approval contact', 'Harbour House', 'Before discovery · open', 'agreement-v2'],
      ['03', 'Confirm the operative content handover date', 'Karl H.', 'Human review · conflict', 'meeting-notes']
    ];
    const desktopRegister = `<div class="panel-section-title"><span>Action register</span><span>3 needs confirmation</span></div>${actions.map(([index, title, owner, due, sourceId]) => { const status = state.actionState[index]; return `<div class="action-item"><span class="action-index">${index}</span><span><strong>${title}</strong><small>${owner} · ${sources[sourceId].name}</small><span class="action-meta"><span>${status || due}</span></span>${status ? `<div class="action-buttons"><span class="status-tag direct">${status}</span></div>` : '<div class="action-buttons"><button class="small-action" data-action="confirm" data-action-id="'+index+'">Confirm</button><button class="small-action" data-action="edit" data-action-id="'+index+'">Edit</button><button class="small-action" data-action="ignore" data-action-id="'+index+'">Ignore</button></div>'}</span></div>`; }).join('')}<div class="human-review-panel"><span>✓</span><span><strong>Export is approval-gated</strong><p>Actions stay in DOSSIER until a person confirms owner, due date and source.</p></span></div>`;
    const mobileQueue = `<div class="mobile-review-queue"><div class="mobile-review-header"><span>Review queue</span><span>3 items need review</span></div><article class="mobile-review-card"><span class="review-number">01 · DEADLINE CONFLICT</span><h3>Content handover date</h3><p>Two authorised sources disagree about the operative deadline.</p><div class="review-values"><span>Proposal · 18 Aug</span><span>Notes · 22 Aug</span></div><button data-review-conflict>Review conflict</button></article><article class="mobile-review-card"><span class="review-number">02 · PAYMENT TERM CHANGE</span><h3>30 days → 14 days</h3><p>Clause 4.2 changes the payment window in the current agreement.</p><div class="review-values"><span>Old · 30 days</span><span>New · 14 days</span></div><button data-mode="compare">Review change</button></article><article class="mobile-review-card"><span class="review-number">03 · LIABILITY CAP</span><h3>£50,000 → £100,000</h3><p>Clause 14.1 increases the aggregate liability cap.</p><div class="review-values"><span>Old · £50k</span><span>New · £100k</span></div><button data-mode="compare">Review change</button></article><div class="human-review-panel"><span>✓</span><span><strong>Export is approval-gated</strong><p>Actions stay in DOSSIER until a person confirms owner, due date and source.</p></span></div></div>`;
    return `<div class="desktop-action-register">${desktopRegister}</div>${mobileQueue}`;
  }

  function renderSources() {
    const rows = [['agreement-v2', 'Clause 6.2', 'Client responsibilities · direct'], ['proposal', 'Section 3', 'Client inputs · direct'], ['meeting-notes', 'Page 2', 'Handover date · working note'], ['agreement-v2', 'Clause 11.2', 'Termination · direct']];
    return `<div class="panel-section-title"><span>Source provenance</span><span>4 linked passages</span></div><div class="sources-panel-list">${rows.map(([id, section, detail], index) => `<button class="source-panel-row" data-citation-source="${id}"><span class="citation-number">${index + 1}</span><span><strong>${sources[id].name}</strong><small>${section} · ${detail}</small></span></button>`).join('')}</div><div class="human-review-panel"><span>⌁</span><span><strong>Traceability is preserved</strong><p>Every answer, extraction and action retains its source document and passage reference.</p></span></div>`;
  }

  function setCompareMobileTab(tab) {
    state.compareTab = tab;
    $$('.compare-mobile-tabs button').forEach(button => button.classList.toggle('active', button.dataset.compareTab === tab));
    const content = $('#compareMobileContent');
    if (content) content.innerHTML = mobileCompareContent(tab);
  }

  function openCitationSheet(sourceId) {
    state.citationSource = sourceId;
    const source = sources[sourceId];
    const detail = sourceId === 'agreement-v2' ? ['A', 'Clause 4.2', '“Invoices are payable within 14 days of receipt.”', 'Payment terms analysis'] : sourceId === 'proposal' ? ['A', 'Section 3', '“Harbour House will provide brand assets, existing website access and a named approval contact.”', 'Client input analysis'] : sourceId === 'meeting-notes' ? ['A', 'Page 2', '“Content handover was discussed as 22 August 2026.”', 'Deadline conflict review'] : ['A', source.section, '“The source passage is linked to this answer.”', 'Source provenance'];
    $('#citationSheetLetter').textContent = detail[0];
    $('#citationSheetTitle').textContent = source.name;
    $('#citationSheetSection').textContent = detail[1];
    $('#citationSheetQuote').textContent = detail[2];
    $('#citationSheetUse').textContent = detail[3];
    $('#citationSheet').classList.remove('hidden');
    $('#citationSheet').setAttribute('aria-hidden', 'false');
  }

  function closeCitationSheet() {
    $('#citationSheet').classList.add('hidden');
    $('#citationSheet').setAttribute('aria-hidden', 'true');
  }

  function renderPanel() {
    const titles = { ask: 'Ask the workspace', insights: 'Document at a glance', actions: 'Action register', sources: 'Source provenance' };
    $('#panelTitle').textContent = titles[state.panelTab];
    $$('.intelligence-tab').forEach(button => button.classList.toggle('active', button.dataset.panelTab === state.panelTab));
    $('#intelligenceContent').innerHTML = state.panelTab === 'ask' ? renderAsk() : state.panelTab === 'insights' ? renderInsights() : state.panelTab === 'actions' ? renderActions() : renderSources();
  }

  function renderConnections() {
    const cards = [['google', 'Google Drive', 'Connected', 'connected', 'Read files', 'Metadata', 'Write files'], ['microsoft', 'OneDrive', 'Demo ready', 'demo', 'Read files', 'Metadata', 'Write files'], ['dropbox', 'Dropbox', 'Available', 'available', 'Read files', 'Metadata', 'Write files'], ['notion', 'Notion', 'Connected', 'connected', 'Read pages', 'Search', 'Write pages'], ['slack', 'Slack', 'Available', 'available', 'Read messages', 'Search', 'Post messages'], ['adobe', 'Adobe Acrobat', 'Coming later', 'later', 'Read PDFs', 'Annotations', 'Write files']];
    return `<div class="special-header"><div><span class="special-eyebrow">Connections</span><h2>Bring the sources<br>you already trust.</h2><p>Connectors are permissioned per workspace. DOSSIER shows what it can read or write before anything leaves this demo.</p></div><span class="grounded-badge"><i></i>Local demo environment</span></div><div class="connections-grid">${cards.map(([klass, name, status, statusClass, ...permissions]) => `<article class="connection-card"><div class="connection-top"><span class="integration-mark ${klass}">${name.slice(0, 1)}</span><span class="connection-status ${statusClass}">${status}</span></div><h3>${name}</h3><p>${status === 'Connected' ? 'Indexed for this workspace with a least-privilege read scope.' : status === 'Demo ready' ? 'Preview the permission contract before connecting a real account.' : status === 'Available' ? 'Ready to connect when this workspace is authorised.' : 'Connector surface is planned for a later release.'}</p><div class="permission-row">${permissions.map((permission, index) => `<span class="${status === 'Coming later' || index === 2 ? 'off' : ''}">${permission}</span>`).join('')}</div><button class="small-action" data-connect="${name}">${status === 'Connected' ? 'Manage access' : 'Review permissions'}</button></article>`).join('')}</div>`;
  }

  function bindAgentButtons() {
    const run = $('#runAgent');
    if (run) run.onclick = () => { state.agentRun = true; $('#agentView').innerHTML = renderAgent(); bindAgentButtons(); };
    const raw = $('#viewRawAgent');
    if (raw) raw.onclick = () => { state.rawAgent = !state.rawAgent; $('#agentView').innerHTML = renderAgent(); bindAgentButtons(); };
  }

  function renderAgent() {
    const result = state.agentRun ? `<div class="agent-result-card"><span class="document-section-label">Run complete · source-grounded</span><h3>Review summary created</h3><div class="artifact-row"><span>01</span><span><strong>2 obligations</strong><small>Client inputs before discovery</small></span><span class="status-tag direct">linked</span></div><div class="artifact-row"><span>02</span><span><strong>1 conflict</strong><small>18 Aug vs 22 Aug content handover</small></span><span class="status-tag review">review</span></div><div class="artifact-row"><span>03</span><span><strong>3 actions</strong><small>Approval-gated action register</small></span><span class="status-tag high">ready</span></div><div class="agent-result-actions"><button class="primary-action" data-special-view="library" data-panel-tab="actions">Open action register</button><button class="small-action" id="viewRawAgent">View raw result</button></div>${state.rawAgent ? '<pre class="raw-agent">{\n  "status": "human_review_required",\n  "sources": 4,\n  "conflicts": 1,\n  "actions_created": 3\n}</pre>' : ''}</div>` : '';
    return `<div class="special-header"><div><span class="special-eyebrow">A2A demo view</span><h2>Ask the document agent<br>to make a review pack.</h2><p>One agent card, one source boundary, one human approval gate. This is the hand-off surface for agent-to-agent work.</p></div><span class="connection-status demo">A2A · static preview</span></div><div class="agent-shell"><section class="agent-request"><div class="agent-request-head"><span class="agent-mark">D</span><div><h2>DOSSIER DOCUMENT AGENT</h2><p>Source-grounded document analysis for authorised workspaces.</p></div></div><div class="agent-task-grid"><div><small>Request</small><strong>Create a review summary</strong></div><div><small>Workspace</small><strong>Harbour House Review</strong></div><div><small>Sources</small><strong>9 indexed documents</strong></div><div><small>Approval</small><strong>Required before export</strong></div></div><div class="agent-progress"><span><i>1</i>Retrieve authorised sources</span><span><i>2</i>Analyse and compare</span><span><i>3</i>Request human review</span></div>${result || '<div class="agent-result-card"><span class="document-section-label">Ready to run</span><h3>Review the current workspace</h3><p>Generate a compact summary of obligations, open questions and conflicts. The result will retain source references and will not create external tasks automatically.</p><div class="agent-result-actions"><button class="primary-action" id="runAgent" data-agent-action="run">Run agent demo</button><button class="small-action" data-special-view="trust">View permissions</button></div></div>'}</section><aside class="agent-side-card"><span class="document-section-label">Static Agent Card</span><h3>Static capability description</h3><p>This static card documents proposed capabilities and boundaries. It is not a live task service.</p><div class="protocol-box"><strong>/.well-known/agent-card.json</strong><small>Identity · DOSSIER DOCUMENT AGENT</small></div><div class="agent-card-facts"><div class="agent-card-fact"><small>Protocol</small><strong>A2A 1.0 · HTTP+JSON</strong></div><div class="agent-card-fact"><small>Inputs</small><strong>Text · JSON</strong></div><div class="agent-card-fact"><small>Outputs</small><strong>Text · JSON</strong></div><div class="agent-card-fact"><small>Endpoint</small><strong>Static preview · no live tasks</strong></div></div><div class="human-review-panel"><span>!</span><span><strong>Human review required</strong><p>Conflicts, exports and external actions stay gated.</p></span></div></aside></div>`;
  }

  function renderTrust() {
    return `<div class="special-header"><div><span class="special-eyebrow">Trust and permissions</span><h2>Quiet AI.<br>Visible boundaries.</h2><p>DOSSIER makes the source boundary, confidence and review state legible at the point of use.</p></div><span class="grounded-badge"><i></i>Human review enabled</span></div><div class="trust-grid"><article class="trust-card"><span class="trust-icon">⌁</span><h3>No answer without a source.</h3><p>Answers carry a document, passage and interpretation state. If the library conflicts or is silent, the response says so.</p></article><article class="trust-card"><span class="trust-icon">◌</span><h3>Local demo data.</h3><p>This preview uses seeded Harbour House material. No real connector is authenticated and no content is sent anywhere.</p></article><article class="trust-card"><span class="trust-icon">✓</span><h3>Actions need a person.</h3><p>Extracted obligations can become a register, but owners, dates and external writes remain approval-gated.</p></article></div>`;
  }

  function showView(view) {
    state.specialView = view;
    const library = view === 'library';
    document.body.classList.remove('mobile-sheet-open', 'mobile-drawer-open');
    $('#intelligencePanel').classList.remove('mobile-open', 'sheet-expanded');
    $('#researchWorkspace').classList.toggle('hidden', !library);
    $('#connectionsView').classList.toggle('hidden', view !== 'connections');
    $('#agentView').classList.toggle('hidden', view !== 'agent');
    $('#trustView').classList.toggle('hidden', view !== 'trust');
    $$('.library-nav-item, .trust-link, .dossier-brand').forEach(button => button.classList.toggle('active', button.dataset.specialView === view));
    if (view === 'connections') $('#connectionsView').innerHTML = renderConnections();
    if (view === 'agent') { $('#agentView').innerHTML = renderAgent(); bindAgentButtons(); }
    if (view === 'trust') $('#trustView').innerHTML = renderTrust();
    if (library) { renderDocument(); renderPanel(); }
    $('#sourceLibrary').classList.remove('mobile-open');
    document.body.classList.toggle('focus-mode', library && state.canvasMode === 'focus');
  }

  function selectSource(sourceId) {
    if (!sources[sourceId]) return;
    state.selectedSource = sourceId;
    $$('.source-item').forEach(button => button.classList.toggle('selected', button.dataset.source === sourceId));
    showView('library');
    state.canvasMode = 'document';
    renderDocument();
    toast(`${sources[sourceId].name} opened in the document canvas.`);
  }

  function setPanel(tab) {
    state.panelTab = tab;
    showView('library');
    renderPanel();
    if (window.matchMedia('(max-width: 980px)').matches) {
      $('#intelligencePanel').classList.add('mobile-open');
      document.body.classList.add('mobile-sheet-open');
    }
  }

  function setMode(mode) {
    state.canvasMode = mode;
    showView('library');
    renderDocument();
    if (mode === 'compare') { state.panelTab = 'insights'; renderPanel(); toast('Comparison complete. Three material changes need review.'); }
  }

  document.addEventListener('click', event => {
    const sourceButton = event.target.closest('[data-source]');
    if (sourceButton) return selectSource(sourceButton.dataset.source);
    const modeButton = event.target.closest('[data-mode]');
    if (modeButton) return setMode(modeButton.dataset.mode);
    const panelButton = event.target.closest('[data-panel-tab]');
    if (panelButton) { state.panelTab = panelButton.dataset.panelTab; if (panelButton.dataset.specialView === 'library' || !panelButton.dataset.specialView) setPanel(state.panelTab); return; }
    const specialButton = event.target.closest('[data-special-view]');
    if (specialButton) { if (specialButton.dataset.panelTab) state.panelTab = specialButton.dataset.panelTab; showView(specialButton.dataset.specialView); return; }
    const questionButton = event.target.closest('[data-question]');
    if (questionButton) { state.question = questionButton.dataset.question; state.panelTab = 'ask'; renderPanel(); return; }
    const compareTabButton = event.target.closest('[data-compare-tab]');
    if (compareTabButton) { setCompareMobileTab(compareTabButton.dataset.compareTab); return; }
    const citationButton = event.target.closest('[data-citation-source]');
    if (citationButton) { if (window.matchMedia('(max-width: 720px)').matches) openCitationSheet(citationButton.dataset.citationSource); else { selectSource(citationButton.dataset.citationSource); toast('Source passage opened.'); } return; }
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) { const id = actionButton.dataset.actionId; state.actionState[id] = actionButton.dataset.action === 'ignore' ? 'Ignored' : actionButton.dataset.action === 'edit' ? 'Needs edit' : 'Confirmed'; renderPanel(); toast(`Action ${id} marked ${state.actionState[id].toLowerCase()}.`); return; }
    if (event.target.closest('[data-review-conflict]')) { state.panelTab = 'actions'; renderPanel(); toast('Conflict moved to the action register for review.'); return; }
    const connectButton = event.target.closest('[data-connect]');
    if (connectButton) { toast(`${connectButton.dataset.connect}: permission review is simulated in this demo.`); return; }
    if (event.target.closest('#addSource')) return toast('Add source is simulated — this demo keeps its source set local.');
    if (event.target.closest('#sourceSearch')) { state.panelTab = 'sources'; setPanel('sources'); return; }
    if (event.target.closest('#canvasSearch')) { state.panelTab = 'ask'; setPanel('ask'); $('#askInput')?.focus(); return; }
    if (event.target.closest('#canvasMore')) return toast('Document actions are approval-gated in this demo.');
    if (event.target.closest('#focusExit')) { setMode('document'); return; }
    if (event.target.closest('[data-close-citation]')) { closeCitationSheet(); return; }
    if (event.target.closest('#viewCitationContext')) { const sourceId = state.citationSource; closeCitationSheet(); if (sourceId) selectSource(sourceId); return; }
    if (event.target.closest('#themeToggle')) { document.body.classList.toggle('dark-mode'); const dark = document.body.classList.contains('dark-mode'); $('.theme-label').textContent = dark ? 'Light' : 'Dark'; localStorage.setItem('dossier-theme', dark ? 'dark' : 'light'); return; }
    if (event.target.closest('#sheetGrabber')) { $('#intelligencePanel').classList.toggle('sheet-expanded'); return; }
    if (event.target.closest('#closeSources')) { $('#sourceLibrary').classList.remove('mobile-open'); document.body.classList.remove('mobile-drawer-open'); return; }
    if (event.target.closest('#mobileMenu')) { const open = $('#sourceLibrary').classList.toggle('mobile-open'); document.body.classList.toggle('mobile-drawer-open', open); return; }
    const mobileButton = event.target.closest('[data-mobile-view]');
    if (mobileButton) { $$('.mobile-bottom-nav button').forEach(button => button.classList.toggle('active', button === mobileButton)); const view = mobileButton.dataset.mobileView; if (view === 'sources') { showView('library'); $('#sourceLibrary').classList.add('mobile-open'); document.body.classList.add('mobile-drawer-open'); } else if (view === 'document') { showView('library'); state.canvasMode = 'document'; renderDocument(); } else if (view === 'ask') setPanel('ask'); else setPanel('actions'); return; }
    if (event.target.closest('#runAgent')) { state.agentRun = true; $('#agentView').innerHTML = renderAgent(); bindAgentButtons(); return; }
    if (event.target.closest('#zoomIn')) { state.zoom = Math.min(120, state.zoom + 10); renderDocument(); return; }
    if (event.target.closest('#zoomOut')) { state.zoom = Math.max(80, state.zoom - 10); renderDocument(); return; }
  });

  document.addEventListener('submit', event => {
    if (event.target.id !== 'askForm') return;
    event.preventDefault();
    state.question = $('#askInput').value.trim() || defaultQuestion;
    renderPanel();
    toast('Answer grounded against the indexed workspace.');
  });

  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#sourceSearch').click(); }
  });

  const savedTheme = localStorage.getItem('dossier-theme');
  if (savedTheme === 'dark') { document.body.classList.add('dark-mode'); $('.theme-label').textContent = 'Light'; }
  renderDocument();
  renderPanel();
})();
