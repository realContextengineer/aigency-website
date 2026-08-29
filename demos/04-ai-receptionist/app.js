const scenarios = {
  new: {
    caller: 'Jamie Turner', initials: 'JT', phone: '01202 xxx xxx', intent: 'Residential property enquiry', outcome: 'Viewing consultation booked', appointment: 'Tuesday · 14:30', followup: 'Not required', context: ['Westbourne property', 'Residential', 'Prefers afternoon', 'First enquiry'],
    turns: [
      ['caller', 'Hi, I wondered if somebody could come and look at a property in Westbourne next week?'],
      ['ava', 'Of course. Is this about a residential property or commercial property?'],
      ['caller', 'Residential.'],
      ['ava', 'Thanks. I can help arrange that. Would morning or afternoon usually suit you better?'],
      ['caller', 'Afternoon would be best.'],
      ['ava', 'Tuesday at 14:30 is available. I can reserve that and prepare a confirmation for you.']
    ],
    actions: [['Service identified', 'Residential property enquiry'], ['Calendar checked', 'Tuesday 14:30 available'], ['Appointment reserved', 'Viewing consultation'], ['Confirmation prepared', 'Email and SMS simulated']],
    summaryActions: ['Calendar checked', 'Appointment booked', 'CRM record prepared', 'Confirmation generated']
  },
  booking: {
    caller: 'Ellis Ward', initials: 'EW', phone: '01202 xxx xxx', intent: 'Appointment request', outcome: 'Valuation consultation booked', appointment: 'Thursday · 11:00', followup: 'Not required', context: ['Valuation consultation', 'Bournemouth', 'Thursday morning', 'New enquiry'],
    turns: [
      ['caller', 'Hello, I’d like to book a valuation for a flat in Bournemouth.'],
      ['ava', 'I can help with that. Is the property already on the market, or are you considering your options?'],
      ['caller', 'We’re considering our options.'],
      ['ava', 'Understood. Thursday at 11:00 is available for a no-obligation consultation. Shall I hold that for you?'],
      ['caller', 'Yes, please.'],
      ['ava', 'That’s reserved. I’ll prepare the details for the Harbor House team and send a confirmation.']
    ],
    actions: [['Service identified', 'No-obligation valuation'], ['Calendar checked', 'Thursday 11:00 available'], ['Appointment reserved', 'Consultation held'], ['Confirmation prepared', 'Email simulated']],
    summaryActions: ['Calendar checked', 'Booking request prepared', 'CRM record prepared', 'Confirmation generated']
  },
  existing: {
    caller: 'Priya Shah', initials: 'PS', phone: '01202 xxx xxx', intent: 'Existing customer support', outcome: 'Callback created for client team', appointment: 'Today · 16:00', followup: 'Client team to call back', context: ['Existing client', 'Repair update', 'Prefers a call', 'Client team notified'],
    turns: [
      ['caller', 'Hi, I’m already working with Harbor House. I wondered if there was an update on the repair?'],
      ['ava', 'I’ll look up the right record. I can’t make a judgement about the repair, but I can prepare a callback for the client team.'],
      ['caller', 'That would be helpful. This afternoon is best.'],
      ['ava', 'I’ve captured that. I’ll ask the client team to call you today and give them the useful context.']
    ],
    actions: [['Customer record found', 'Existing client match'], ['Context captured', 'Repair update requested'], ['Callback created', 'Today · 16:00'], ['CRM note prepared', 'Client team notified']],
    summaryActions: ['Customer record found', 'Callback created', 'CRM note prepared', 'Client team notified']
  },
  urgent: {
    caller: 'Alex Morgan', initials: 'AM', phone: '01202 xxx xxx', intent: 'Urgent property problem', outcome: 'Transferred to Sarah Mitchell', appointment: 'Now · live handover', followup: 'Sarah Mitchell joined', context: ['Urgent property problem', 'Caller requested help', 'No emergency services claim', 'Human judgement required'], handover: true,
    turns: [
      ['caller', 'I’ve got an urgent problem at a property and I need to speak to someone now.'],
      ['ava', 'I’m sorry this is stressful. I’ll capture the basics and bring a person into the call. If anyone is in immediate danger, contact emergency services.'],
      ['caller', 'There’s water coming through the ceiling.'],
      ['ava', 'Thank you. I can bring Sarah into the call now. I’ll give her a short summary so you don’t have to repeat everything.']
    ],
    actions: [['Urgency recognised', 'Human judgement required'], ['Safety boundary stated', 'Emergency services if danger'], ['Context captured', 'Water ingress reported'], ['Human handover requested', 'Sarah Mitchell joining']],
    summaryActions: ['Urgency recognised', 'Safety boundary stated', 'Context captured', 'Sarah joined the call']
  },
  pricing: {
    caller: 'Sam Reed', initials: 'SR', phone: '01202 xxx xxx', intent: 'Pricing enquiry', outcome: 'Information prepared for follow-up', appointment: 'Callback · tomorrow', followup: 'Pricing follow-up prepared', context: ['Property services', 'Pricing examples requested', 'No quote made', 'Follow-up prepared'],
    turns: [
      ['caller', 'Could you give me an idea of what your property services cost?'],
      ['ava', 'I can explain the typical engagement shape, but I won’t invent a quote. Is this for a residential property or a commercial one?'],
      ['caller', 'Residential, please.'],
      ['ava', 'I’ve captured that. I’ll prepare the relevant information and arrange a no-obligation conversation with the team.']
    ],
    actions: [['Service looked up', 'Residential property services'], ['Pricing boundary checked', 'No quote invented'], ['Enquiry qualified', 'Residential'], ['Follow-up prepared', 'No-obligation conversation']],
    summaryActions: ['Service information looked up', 'Enquiry qualified', 'Follow-up prepared', 'CRM record prepared']
  },
  supplier: {
    caller: 'Jordan Bell', initials: 'JB', phone: '01202 xxx xxx', intent: 'Supplier enquiry', outcome: 'Operations callback created', appointment: 'Tomorrow · 10:30', followup: 'Operations team to respond', context: ['New supplier', 'Operations route', 'Company details requested', 'Callback created'],
    turns: [
      ['caller', 'Hello, I’m calling because we’d like to become a supplier for Harbor House.'],
      ['ava', 'I can route that to operations. What kind of service or material do you provide?'],
      ['caller', 'Maintenance supplies for property teams.'],
      ['ava', 'Thanks. I’ll capture that and ask the operations team to follow up. I won’t make a supplier decision on their behalf.']
    ],
    actions: [['Supplier route selected', 'Operations team'], ['Service captured', 'Maintenance supplies'], ['Contact details requested', 'Demo data only'], ['Callback created', 'Tomorrow · 10:30']],
    summaryActions: ['Supplier enquiry qualified', 'Operations route selected', 'Callback created', 'CRM record prepared']
  },
  human: {
    caller: 'Taylor Green', initials: 'TG', phone: '01202 xxx xxx', intent: 'Request to speak to a person', outcome: 'Transferred to Sarah Mitchell', appointment: 'Now · live handover', followup: 'Sarah Mitchell joined', context: ['Caller requested a person', 'No reason required', 'Context kept concise', 'Human team available'], handover: true,
    turns: [
      ['caller', 'Hi. I’d rather speak to a person, please.'],
      ['ava', 'Of course. I can bring Sarah into the call. I’ll give her a short summary first so you don’t have to repeat everything.']
    ],
    actions: [['Human request recognised', 'Explicit escalation'], ['Context prepared', 'Short summary only'], ['Human handover requested', 'Sarah Mitchell joining']],
    summaryActions: ['Human request recognised', 'Context prepared', 'Sarah joined the call']
  }
};

const state = { currentKey: 'new', running: false, transcript: [], actionLog: [], timerIds: [], interval: null, seconds: 0, callNumber: 1 };
const consoleEl = $('.call-console');
const deskToast = message => { const el = $('#deskToast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.__deskToast); window.__deskToast = setTimeout(() => el.classList.remove('show'), 2800); };

function buildAudioBars() {
  const bars = $('#audioBars');
  for (let i = 0; i < 34; i += 1) { const bar = document.createElement('i'); bar.className = 'audio-bar'; bar.style.height = `${7 + ((i * 17) % 34)}px`; bars.append(bar); }
}

function clearTimers() { state.timerIds.forEach(id => clearTimeout(id)); state.timerIds = []; if (state.interval) clearInterval(state.interval); state.interval = null; $('#handoverCard')?.classList.remove('handover-active'); }
function later(fn, delay) { const id = setTimeout(fn, delay); state.timerIds.push(id); return id; }
function formatDuration(seconds) { return `00:${String(Math.min(seconds, 59)).padStart(2, '0')}`; }
function setStatus(status, caption = status) { $('#consoleState').textContent = status; $('#audioCaption').textContent = caption; consoleEl.classList.toggle('is-active', ['INCOMING CALL', 'LISTENING', 'THINKING', 'SPEAKING', 'TRANSFERRING'].includes(status)); }
function setCallFields(data) { $('#callerName').textContent = data.caller; $('#callerAvatar').textContent = data.initials; $('#callerNumber').innerHTML = `${data.phone} <span>·</span> Bournemouth`; $('#callId').textContent = `HH-2408-${String(state.callNumber).padStart(3, '0')}`; }

function addMessage(speaker, text) {
  const conversation = $('#conversation');
  $('.conversation-empty', conversation)?.remove();
  const row = document.createElement('div'); row.className = `message ${speaker === 'caller' ? 'caller' : 'ava'}`;
  row.innerHTML = `<span class="message-avatar">${speaker === 'caller' ? state.currentKey === 'new' ? 'JT' : scenarios[state.currentKey].initials : 'A'}</span><div class="message-bubble"><span class="message-meta">${speaker === 'caller' ? scenarios[state.currentKey].caller : 'AVA'}</span>${text}</div>`;
  conversation.append(row); conversation.scrollTop = conversation.scrollHeight;
  state.transcript.push({ speaker, text });
}

function addAction(label, detail, urgent = false) {
  state.actionLog.push({ label, detail });
  const log = $('#actionLog'); $('.action-empty', log)?.remove();
  const entry = document.createElement('div'); entry.className = `action-entry${urgent ? ' urgent' : ''}`;
  entry.innerHTML = `<span class="action-entry-mark">✓</span><div><strong>${label}</strong><small>${detail}</small></div>`; log.append(entry);
  $('#actionCount').textContent = state.actionLog.length; $('#actionSummary').classList.remove('hidden');
}

function resetConversation(data) {
  $('#conversation').innerHTML = '<div class="conversation-empty"><span class="empty-mark">✦</span><p>Choose a route to let Ava handle a realistic enquiry.</p><small>Nothing is sent — this is a simulated design demonstration.</small></div>';
  $('#actionLog').innerHTML = '<div class="action-empty">Actions will appear here as Ava works.</div>'; $('#actionSummary').classList.add('hidden');
  $('#duration').textContent = '00:00'; $('#summarySection').classList.add('hidden'); $('#endCall').disabled = true; $('#textEntry').classList.add('hidden'); $('#replyInput').value = '';
  state.transcript = []; state.actionLog = []; state.seconds = 0; setCallFields(data); setStatus('READY', 'READY FOR A CALL'); consoleEl.classList.remove('is-active');
}

function tick() { state.seconds += 1; $('#duration').textContent = formatDuration(state.seconds); }

function scheduleActions(data) { data.actions.forEach((action, index) => later(() => addAction(action[0], action[1], data.handover && index === data.actions.length - 1), 1150 + index * 1250)); }

function playTurn(data, index) {
  if (!state.running || data !== scenarios[state.currentKey]) return;
  if (index >= data.turns.length) { if (data.handover) startHandover(false); else completeCall(); return; }
  const [speaker, text] = data.turns[index];
  if (speaker === 'caller') { setStatus('LISTENING', 'LISTENING'); addMessage(speaker, text); later(() => playTurn(data, index + 1), 850); return; }
  setStatus('THINKING', 'THINKING'); later(() => { if (!state.running) return; setStatus('SPEAKING', 'SPEAKING'); addMessage(speaker, text); later(() => playTurn(data, index + 1), 980); }, 540);
}

function startCall(key = state.currentKey) {
  clearTimers(); state.currentKey = key; state.callNumber += 1; state.running = true;
  const data = scenarios[key]; resetConversation(data); setCallFields(data); setStatus('INCOMING CALL', 'INCOMING CALL'); $('#endCall').disabled = false; state.interval = setInterval(tick, 1000); scheduleActions(data);
  later(() => playTurn(data, 0), 650); deskToast(`${data.caller} is calling Harbor House. Simulation started.`);
}

function startHandover(explicit = true) {
  if (explicit && !state.running) { startCall('human'); return; }
  if (!state.running) return;
  setStatus('TRANSFERRING', 'HUMAN HANDOVER'); addAction('Human handover requested', 'Sarah Mitchell joining', true); $('#handoverCard').classList.add('handover-active'); later(() => $('#handoverCard').classList.remove('handover-active'), 1400); later(() => completeCall(), 1050); deskToast('Sarah is joining with the conversation context attached.');
}

function completeCall() {
  if (!state.running) return; clearTimers(); state.running = false; setStatus('COMPLETE', 'CALL COMPLETE'); $('#endCall').disabled = true; consoleEl.classList.remove('is-active');
  const data = scenarios[state.currentKey]; fillSummary(data); $('#summarySection').classList.remove('hidden'); deskToast(data.handover ? 'Human handover complete. Summary prepared.' : 'Call complete. Structured summary prepared.');
}

function fillSummary(data) {
  $('#summaryCaller').textContent = data.caller; $('#summaryCallId').innerHTML = `${$('#callId').textContent} · <strong>${formatDuration(Math.max(state.seconds, 1))}</strong>`; $('#summaryIntent').textContent = data.intent; $('#summaryOutcome').textContent = data.outcome; $('#summaryAppointment').textContent = data.appointment; $('#summaryFollowup').textContent = data.followup;
  $('#summaryContext').innerHTML = data.context.map(item => `<li>${item}</li>`).join(''); $('#summaryActionsList').innerHTML = data.summaryActions.map(item => `<li>${item}</li>`).join('');
}

function selectScenario(key) { $$('.scenario').forEach(button => button.classList.toggle('active', button.dataset.scenario === key)); state.currentKey = key; }
function showHandover() { $('#handover').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#handoverCard').classList.add('handover-active'); later(() => $('#handoverCard').classList.remove('handover-active'), 1500); }
function setView(view) { const caller = view === 'caller'; $('#callerView').classList.toggle('hidden', !caller); $('#businessView').classList.toggle('hidden', caller); $('#callerTab').classList.toggle('active', caller); $('#businessTab').classList.toggle('active', !caller); $('#callerTab').setAttribute('aria-selected', caller); $('#businessTab').setAttribute('aria-selected', !caller); }
function dismissDemoNudge() { $('#demoNudge')?.classList.add('dismissed'); }

function openTranscript(mode) {
  const dialog = $('#transcriptDialog'); const title = $('#dialogTitle'); const body = $('#transcriptBody');
  if (mode === 'actions') { title.textContent = 'Action log'; body.innerHTML = state.actionLog.length ? state.actionLog.map(item => `<div class="dialog-message"><strong>✓ ${item.label}</strong>${item.detail}</div>`).join('') : '<p class="muted">No actions recorded yet.</p>'; }
  else { title.textContent = 'Transcript'; body.innerHTML = state.transcript.length ? state.transcript.map(item => `<div class="dialog-message"><strong>${item.speaker === 'caller' ? scenarios[state.currentKey].caller : 'Ava'}</strong>${item.text}</div>`).join('') : '<p class="muted">Start a call to create a transcript.</p>'; }
  dialog.showModal();
}

function openAgentCard() {
  const dialog = $('#agentDialog'); const body = $('#agentBody');
  body.textContent = JSON.stringify({
    status: 'static_demo',
    publicAgentCard: null,
    publicTaskEndpoint: null,
    simulatedSkills: ['check_availability', 'prepare_booking_request', 'prepare_handover_summary'],
    boundary: 'No external action is taken. Human approval is required.'
  }, null, 2);
  dialog.showModal();
}

function sendTypedReply() {
  const input = $('#replyInput'); const value = input.value.trim(); if (!value) return;
  if (!state.running) startCall(state.currentKey); later(() => { if (!state.running) return; addMessage('caller', value); setStatus('THINKING', 'THINKING'); later(() => { addMessage('ava', 'I’ve captured that. I can prepare the next step, or bring a person into the call if you would prefer.'); setStatus('SPEAKING', 'SPEAKING'); }, 500); }, 300); input.value = '';
}

buildAudioBars(); resetConversation(scenarios.new);
$$('.scenario').forEach(button => button.addEventListener('click', () => { dismissDemoNudge(); selectScenario(button.dataset.scenario); startCall(button.dataset.scenario); }));
$('#tryCall').addEventListener('click', () => { dismissDemoNudge(); $('#demo').scrollIntoView({ behavior: 'smooth', block: 'start' }); later(() => startCall('new'), 350); });
$('#seeHandover').addEventListener('click', showHandover); $('#handoverDemo').addEventListener('click', showHandover); $('#humanButton').addEventListener('click', () => startHandover(true));
$('#voiceDemo').addEventListener('click', () => { dismissDemoNudge(); if (!state.running) startCall(state.currentKey); else deskToast('Simulated voice is active. No microphone permission is required.'); });
$('#typeInstead').addEventListener('click', () => { $('#textEntry').classList.toggle('hidden'); if (!$('#textEntry').classList.contains('hidden')) $('#replyInput').focus(); });
$('#sendReply').addEventListener('click', sendTypedReply); $('#replyInput').addEventListener('keydown', event => { if (event.key === 'Enter') sendTypedReply(); });
$('#endCall').addEventListener('click', () => { if (!state.running) return; clearTimers(); state.running = false; setStatus('ENDED', 'CALL ENDED'); $('#endCall').disabled = true; consoleEl.classList.remove('is-active'); deskToast('The simulated call ended.'); });
$('#callerTab').addEventListener('click', () => setView('caller')); $('#businessTab').addEventListener('click', () => setView('business'));
$('#expandActions').addEventListener('click', () => $('#actionLog').scrollIntoView({ behavior: 'smooth', block: 'center' })); $('#viewTranscript').addEventListener('click', () => openTranscript('transcript')); $('#viewActionLog').addEventListener('click', () => openTranscript('actions')); $('#runAgain').addEventListener('click', () => { $('#demo').scrollIntoView({ behavior: 'smooth', block: 'start' }); later(() => startCall(state.currentKey), 350); }); $('#agentButton').addEventListener('click', openAgentCard);

let parallaxFrame = false;
function updateParallax() { const scroll = Math.min(window.scrollY, 1600); document.body.style.setProperty('--parallax-back', `${scroll * -.055}px`); document.body.style.setProperty('--parallax-front', `${scroll * -.13}px`); parallaxFrame = false; }
window.addEventListener('scroll', () => { if (parallaxFrame) return; parallaxFrame = true; window.requestAnimationFrame(updateParallax); }, { passive: true });
updateParallax();
