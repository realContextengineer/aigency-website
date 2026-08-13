(function () {
  'use strict';

  const demos = {
    '02-charity-services': 'Charity services website',
    '03-send-neuro-friendly': 'Neuro-friendly SEND portal',
    '04-ai-receptionist': 'AI Receptionist',
    '05-intelligent-customer-portal': 'Intelligent CRM',
    '06-ai-quote-builder': 'AI Quote Agent',
    '07-grant-finding-assistant': 'Grant funding intelligence',
    '08-document-intelligence': 'Document intelligence workspace',
    '09-ai-search-geo-audit': 'SEO, AEO & GEO audits',
    '10-ai-transparency-scanner': 'AI transparency review',
    '11-automation-control-centre': 'Human-supervised automation',
    '12-hermes-agent-marketplace': 'Specialist AI agents',
    '13-wnwn-social-supermarket': 'Social supermarket member app'
  };

  const slug = new URLSearchParams(window.location.search).get('demo');
  const frame = document.getElementById('demo-preview-frame');
  const title = document.getElementById('demo-preview-title');
  const error = document.getElementById('demo-preview-error');
  const close = document.getElementById('demo-preview-close');

  function closePreview() {
    window.close();
    window.setTimeout(function () {
      if (!window.closed) window.location.assign('creative-design.html#portfolio-title');
    }, 120);
  }

  close.addEventListener('click', closePreview);

  if (!slug || !Object.prototype.hasOwnProperty.call(demos, slug)) {
    frame.hidden = true;
    error.hidden = false;
    title.textContent = 'Design demo';
    return;
  }

  const demoTitle = demos[slug];
  document.title = demoTitle + ' — AiGENCY design demo';
  title.textContent = demoTitle;
  frame.title = demoTitle;
  frame.src = 'demos/' + encodeURIComponent(slug) + '/';
}());
