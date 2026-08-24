(function() {
  'use strict';

  const body = document.body;
  if (!body || document.querySelector('[data-arthur-lite-root]')) return;

  const declaredMode = (body.dataset.arthurMode || '').trim().toLowerCase();
  const hasInlineArthur = Boolean(
    document.querySelector('[data-insight-chat], [data-insights-index-chat], [data-arthur-inline]')
  );
  const mode = declaredMode || (hasInlineArthur ? 'inline' : 'dock');

  if (mode === 'inline') {
    body.dataset.arthurStatus = 'inline';
    return;
  }

  const pageSlug = window.location.pathname
    .split('/')
    .pop()
    .replace(/\.html$/i, '') || 'home';
  const contextualIntroductions = {
    'ai-health-check': 'I can help explain this health check while you work through it. I cannot alter your answers or change the website.',
    'ai-transparency': 'I can explain the transparency service and help you find the right next step. I cannot run or alter a scan.',
    'contact': 'I can help you choose the right route before you contact AiGENCY. I cannot submit or change the form.',
    'hermes-agents': 'I can help you understand Hermes, its agent patterns, skills and human boundaries. I cannot configure or activate anything.',
    'services': 'I can help you understand the services and find the most relevant starting point.',
    'training': 'I can help you understand the training routes and find the level that fits your work.',
    'creative-design': 'I can help you explore AiGENCY’s design work and the route from an idea into delivery.',
    'insights': 'I can help you explore the published Field Notes and explain what is available.'
  };
  const introduction = contextualIntroductions[pageSlug]
    || 'I’m Arthur Light, AiGENCY’s public site guide. I can explain what is here and help you find the right next step.';

  const root = document.createElement('div');
  root.className = 'arthur-lite arthur-lite--' + (mode === 'quiet' ? 'quiet' : 'dock');
  root.dataset.arthurLiteRoot = '';
  root.dataset.arthurContext = pageSlug;
  root.innerHTML = [
    '<button class="arthur-lite__trigger" type="button" aria-label="Talk to Arthur Light" aria-controls="arthur-lite-panel" aria-expanded="false">',
    '  <span class="arthur-lite__mark" aria-hidden="true">Ai</span>',
    '  <span class="arthur-lite__trigger-label">Ask Arthur Light <small>AI</small></span>',
    '</button>',
    '<section class="arthur-lite__panel" id="arthur-lite-panel" role="dialog" aria-modal="false" aria-labelledby="arthur-lite-title" aria-describedby="arthur-lite-boundary" aria-hidden="true" hidden>',
    '  <header class="arthur-lite__header">',
    '    <div class="arthur-lite__portrait" data-arthur-lite-avatar aria-label="Arthur Light animated avatar">',
    '      <img src="/assets/arthur-ai-intern.png" alt="Arthur Light">',
    '      <span class="arthur-lite__avatar-loading">Preparing Arthur…</span>',
    '    </div>',
    '    <div class="arthur-lite__identity">',
    '      <p>PUBLIC SITE GUIDE · READ-ONLY</p>',
    '      <h2 id="arthur-lite-title">Arthur Light</h2>',
    '    </div>',
    '    <button class="arthur-lite__close" type="button" aria-label="Close Arthur Light">×</button>',
    '  </header>',
    '  <p class="arthur-lite__boundary" id="arthur-lite-boundary">Arthur can explain and guide. He cannot edit the website or take actions.</p>',
    '  <div class="arthur-lite__messages" aria-live="polite" aria-relevant="additions"></div>',
    '  <form class="arthur-lite__composer">',
    '    <label class="arthur-lite__sr-only" for="arthur-lite-input">Ask Arthur Light</label>',
    '    <input id="arthur-lite-input" type="text" placeholder="Ask Arthur Light…" maxlength="600" autocomplete="off">',
    '    <button type="submit" aria-label="Send message">↗</button>',
    '  </form>',
    '  <a class="arthur-lite__human" href="/contact.html?service=AiGENCY%20AI%20conversation">Talk to a person <span aria-hidden="true">↗</span></a>',
    '</section>'
  ].join('');

  body.appendChild(root);
  body.dataset.arthurStatus = mode === 'quiet' ? 'quiet' : 'docked';

  const trigger = root.querySelector('.arthur-lite__trigger');
  const panel = root.querySelector('.arthur-lite__panel');
  const closeButton = root.querySelector('.arthur-lite__close');
  const messages = root.querySelector('.arthur-lite__messages');
  const composer = root.querySelector('.arthur-lite__composer');
  const input = root.querySelector('.arthur-lite__composer input');
  const sendButton = root.querySelector('.arthur-lite__composer button');
  const avatarHost = root.querySelector('[data-arthur-lite-avatar]');
  const sessionStorageKey = 'aigency-arthur-lite-session';

  let sending = false;
  let closeTimer = null;
  let avatarStarted = false;
  let talkingHead = null;

  function appendMessage(text, kind) {
    const item = document.createElement('div');
    item.className = 'arthur-lite__message arthur-lite__message--' + kind;
    const copy = document.createElement('p');
    copy.textContent = text;
    item.appendChild(copy);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  appendMessage(introduction, 'agent');

  async function loadAvatar() {
    if (avatarStarted || !avatarHost) return;
    avatarStarted = true;

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
        url: '/vendor/talkinghead/avatars/avatarsdk.glb',
        body: 'M',
        avatarMood: 'neutral',
        baseline: { headRotateX: -0.04, eyeBlinkLeft: 0.05, eyeBlinkRight: 0.05 },
        retarget: {
          Neck: { z: -0.01, rx: -0.15 },
          Neck1: { z: -0.01, rx: -0.15 },
          Neck2: { z: -0.01, rx: -0.15 },
          LeftShoulder: { rz: -0.3 },
          RightShoulder: { rz: 0.3 },
          scaleToEyesLevel: 1.0,
          origin: { y: -0.1 }
        }
      });
      if (head.controls) head.controls.minDistance = 2;
      head.setView('head', { cameraDistance: 0, cameraY: 0 });
      talkingHead = head;
      avatarHost.classList.add('is-avatar-ready');
    } catch (error) {
      avatarHost.classList.add('is-avatar-unavailable');
      console.warn('Arthur avatar could not load.', error);
    }
  }

  async function speakReply(payload) {
    if (!talkingHead || !payload.audio_url || !Array.isArray(payload.words) || !payload.words.length) return;

    try {
      if (talkingHead.audioCtx && ['suspended', 'interrupted'].includes(talkingHead.audioCtx.state)) {
        await talkingHead.audioCtx.resume();
      }
      const audioResponse = await fetch(payload.audio_url, { cache: 'no-store' });
      if (!audioResponse.ok) throw new Error('Arthur audio could not be loaded.');
      const audio = await talkingHead.audioCtx.decodeAudioData(await audioResponse.arrayBuffer());
      talkingHead.speakAudio(
        { audio, words: payload.words, wtimes: payload.wtimes, wdurations: payload.wdurations },
        { lipsyncLang: 'en' }
      );
    } catch (error) {
      console.warn('Arthur local speech could not play.', error);
    }
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
          message,
          session_id: window.localStorage.getItem(sessionStorageKey) || undefined
        })
      });
      const payload = await response.json();
      waiting.remove();
      if (!response.ok) throw new Error(payload.error || 'Arthur Light is unavailable.');
      if (payload.session_id) window.localStorage.setItem(sessionStorageKey, payload.session_id);
      appendMessage(payload.reply, 'agent');
      speakReply(payload);
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

  function finishClose() {
    window.clearTimeout(closeTimer);
    panel.hidden = true;
    panel.classList.remove('is-closing');
    trigger.focus();
  }

  function setPanelOpen(open) {
    window.clearTimeout(closeTimer);

    if (open) {
      panel.hidden = false;
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.remove('is-closing');
      panel.classList.add('is-opening');
      trigger.setAttribute('aria-expanded', 'true');
      trigger.classList.add('is-open');
      loadAvatar();
      input.focus();
      return;
    }

    panel.classList.remove('is-opening');
    panel.classList.add('is-closing');
    panel.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('is-open');
    panel.addEventListener('animationend', finishClose, { once: true });
    closeTimer = window.setTimeout(finishClose, 260);
  }

  trigger.addEventListener('click', function() {
    setPanelOpen(panel.hidden);
  });
  closeButton.addEventListener('click', function() {
    setPanelOpen(false);
  });
  composer.addEventListener('submit', function(event) {
    event.preventDefault();
    sendMessage();
  });
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !panel.hidden) setPanelOpen(false);
  });
}());
