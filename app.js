// C+ prototype engine: state, hash routes, actions, the scripted conversation and the Wardrobe capture.
// index.html defines window.Views (one function per screen + shell). Mock behaviour is labelled in the UI.
(() => {
  const D = window.DATA, clone = o => JSON.parse(JSON.stringify(o));
  const qs = new URLSearchParams(location.search), shot = qs.has('shot');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const wideQ = matchMedia('(min-width: 1024px)');
  const emptyProfile = () => ({ name: D.profile.name, role: '', industry: '', domain: 'sales', english_level: '', answers: {} });
  const prep = e => ({ practiced: [], used: [], repeats: [], tags: [], ...clone(e), selected: !!e.selected });

  const S = window.S = {
    lang: qs.get('lang') === 'de' ? 'de' : 'en', screen: 'home', mode: 'returning', step: 1,
    profile: clone(D.profile), draft: null, edit: null, errors: {},
    sessions: clone(D.sessions), entries: D.entries.map(prep), stash: null,
    wd: { view: 'active', group: 'newest', filter: 'all' }, open: new Set(), leaving: new Set(),
    tab: 'overview', pane: 'coaching', coach: 'jane', focus: null, focusOpen: false, practiceIds: [],
    liveId: 's10', live: { turn: 7, phase: 'listening', playing: false, mic: true, sound: true, text: false, sheet: false, tab: 'transcript' },
    end: null, still: false, notice: null, confirm: null, toast: '', proto: false, pdfFail: false, badge: 0,
  };

  // ---------- helpers ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = k => (window.STRINGS[S.lang] || window.STRINGS.en)[k] || k;
  const loc = () => (S.lang === 'de' ? 'de-DE' : 'en-GB');
  const fmt = (iso, style = 'short') => new Date(iso + 'T12:00:00').toLocaleDateString(loc(), {
    short: { day: 'numeric', month: 'short' }, long: { day: 'numeric', month: 'long', year: 'numeric' },
    weekday: { weekday: 'short', day: 'numeric', month: 'short' }, month: { month: 'long', year: 'numeric' }, day: { weekday: 'long', day: 'numeric', month: 'long' } }[style]);
  const coach = id => D.coaches.find(c => c.id === id);
  const domain = id => { const d = D.domains.find(x => x.id === id); return d ? d[S.lang] : ''; };
  const sessionById = id => S.sessions.find(s => s.id === id);
  const current = () => D.scripts[S.liveId];
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const typeLabel = { power_phrase: 'Strong phrase', upgrade: 'Upgrade', correction: 'Refinement' };
  const tagLabel = { verb: 'Verb', business_vocabulary: 'Business vocabulary' };
  const missing = p => ['role', 'industry'].filter(k => !String(p[k] || '').trim());

  const practiceLine = e => {
    const p = e.practiced.length, u = e.used.length;
    if (u) return `Used in ${u} of ${plural(Math.max(p, u), 'practice session', 'practice sessions')}`;
    return p ? `Practised in ${plural(p, 'session', 'sessions')}, not used yet` : '';
  };
  const repeatLine = e => {
    const r = e.repeats.length;
    if (!r) return '';
    return e.status === 'mastered' ? `Came up again after you mastered it (${plural(r, 'session', 'sessions')})` : `Came up again in ${plural(r, 'later session', 'later sessions')}`;
  };
  const matches = e => S.wd.filter === 'all' || e.type === S.wd.filter || e.tags.includes(S.wd.filter);
  const inView = e => (S.wd.view === 'library' ? e.status === 'mastered' && !S.leaving.has(e.id) : e.status !== 'mastered' || S.leaving.has(e.id));
  const byNewest = (a, b) => (sessionById(b.session)?.date || '').localeCompare(sessionById(a.session)?.date || '') || b.id.localeCompare(a.id, undefined, { numeric: true });
  const entriesView = () => S.entries.filter(inView).filter(matches).sort(byNewest);
  const groups = () => {
    const out = [];
    for (const e of entriesView()) { let g = out.find(x => x.session.id === e.session); if (!g) out.push(g = { session: sessionById(e.session), entries: [] }); g.entries.push(e); }
    return out;
  };
  const counts = () => ({
    active: S.entries.filter(e => e.status !== 'mastered').length, library: S.entries.filter(e => e.status === 'mastered').length,
    selected: S.entries.filter(e => e.selected).length, fresh: S.entries.filter(e => e.status === 'new').length,
    filter: k => S.entries.filter(inView).filter(e => k === 'all' || e.type === k || e.tags.includes(k)).length,
  });
  const phrasesIn = id => S.entries.filter(e => e.session === id).length;
  const weeks = () => {
    const today = new Date(D.today + 'T12:00:00'), mon = new Date(today); mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return [5, 4, 3, 2, 1, 0].map(i => {
      const a = new Date(mon); a.setDate(mon.getDate() - 7 * i); const b = new Date(a); b.setDate(a.getDate() + 7);
      const list = S.sessions.filter(s => { const d = new Date(s.date + 'T12:00:00'); return d >= a && d < b; });
      return { start: a.toISOString().slice(0, 10), minutes: list.reduce((n, s) => n + s.minutes, 0), sessions: list.length, now: i === 0 };
    });
  };
  const stats = () => ({
    ended: S.sessions.filter(s => s.status === 'ended').length, paused: S.sessions.filter(s => s.status === 'paused').length,
    minutes: S.sessions.reduce((n, s) => n + s.minutes, 0), phrases: S.entries.length, mastered: counts().library,
    practice: S.sessions.filter(s => s.practice).length, month: S.sessions.filter(s => s.date.startsWith(D.today.slice(0, 7))),
  });
  const bars = (data, { w = 560, h = 180, pad = 24 } = {}) => {
    const small = innerWidth < 600; if (small) { w = 340; h = 168; pad = 6; }
    const top = Math.ceil(Math.max(...data.map(d => d.minutes), 1) / 10) * 10, bw = (w - pad * 2) / data.length, inner = h - 46;
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Minutes spoken per week: ${data.map(d => d.minutes).join(', ')}"><line class="bar-base" x1="${pad}" x2="${w - pad}" y1="${20 + inner}" y2="${20 + inner}"/>${data.map((d, i) => {
      const bh = Math.round((d.minutes / top) * inner), x = pad + i * bw + bw * 0.2, y = 20 + inner - bh, bwid = bw * 0.6;
      return `<g class="bar${d.now ? ' is-now' : ''}"><rect x="${x.toFixed(1)}" y="${y}" width="${bwid.toFixed(1)}" height="${Math.max(bh, 1)}" rx="2"/><text class="bar-v" x="${(x + bwid / 2).toFixed(1)}" y="${y - 6}" text-anchor="middle">${d.minutes}</text><text class="bar-x" x="${(x + bwid / 2).toFixed(1)}" y="${h - 8}" text-anchor="middle">${d.now ? (S.lang === 'de' ? 'Jetzt' : 'Now') : fmt(d.start)}</text></g>`;
    }).join('')}</svg>`;
  };
  const markLine = turn => {
    const n = turn.note, text = esc(turn.text);
    if (!n) return text;
    const target = esc(n.kind === 'correction' ? n.original : n.better);
    return text.replace(target, `<mark class="${n.kind === 'correction' ? 'm-fix' : 'm-good'}">${target}</mark>`);
  };
  const visibleTurns = () => current().script.slice(0, S.live.turn);
  const elapsed = () => { const s = 95 + S.live.turn * 41; return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  const ICONS = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    hanger: 'M12 7.5a2 2 0 1 1 2-2M12 7.5V9l-8.4 6.2A1.6 1.6 0 0 0 4.6 18h14.8a1.6 1.6 0 0 0 1-2.8L12 9',
    progress: 'M5 20V11M11 20V5M17 20v-6M3 20h18', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v3',
    micOff: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v3M3 3l18 18',
    volume: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13', volumeOff: 'M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6',
    transcript: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM7 8h10M7 12h6', keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
    pause: 'M9 5v14M15 5v14', stop: 'M7 7h10v10H7z', play: 'M7 5l12 7-12 7z', download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    check: 'M5 12.5l4.5 4.5L19 7', x: 'M6 6l12 12M18 6 6 18', plus: 'M12 5v14M5 12h14',
    chevronRight: 'M9 6l6 6-6 6', chevronLeft: 'M15 6l-6 6 6 6', chevronDown: 'M6 9l6 6 6-6', arrowRight: 'M5 12h14M13 6l6 6-6 6',
    alert: 'M12 4 2.5 20h19zM12 10v4M12 17h.01', info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 11v5M12 8h.01',
    help: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01',
    external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5', dots: 'M5 12h.01M12 12h.01M19 12h.01',
    edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    card: 'M3 6h18v12H3zM3 10h18', globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM3 12h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9s1-6.3 3.5-9z',
    logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3', sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2',
  };
  const icon = (n, s = 20) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;

  // ---------- transitions ----------
  // Native View Transitions; skipped for reduced motion, screenshots and unsupported browsers.
  const transition = fn => (document.startViewTransition && !reduce.matches && !shot ? document.startViewTransition(fn) : fn());
  const setLayout = () => { document.documentElement.dataset.layout = wideQ.matches ? 'wide' : 'narrow'; };
  wideQ.addEventListener('change', () => transition(() => { setLayout(); render(); }));

  // ---------- routes ----------
  const restore = () => { if (S.stash) { Object.assign(S, S.stash); S.stash = null; } };
  const routes = {
    welcome: () => { S.draft = S.draft || emptyProfile(); return { screen: 'welcome' }; },
    ready: () => { S.draft = S.draft || clone(S.profile); return { screen: 'ready' }; },
    home: () => { restore(); return { screen: 'home', mode: S.mode === 'incomplete' ? 'incomplete' : 'returning' }; },
    first: () => { if (!S.stash) { S.stash = { sessions: S.sessions, entries: S.entries }; S.sessions = []; S.entries = []; } return { screen: 'home', mode: 'first' }; },
    incomplete: () => { restore(); S.draft = { ...S.profile, role: '', industry: '' }; return { screen: 'home', mode: 'incomplete' }; },
    after: () => { restore(); if (!sessionById('s10')) finishSession(false, true); return { screen: 'home', mode: 'returning' }; },
    start: () => { restore(); return { screen: 'start' }; },
    session: () => ({ screen: 'session', end: null, still: false }),
    notes: () => { S.live.sheet = true; S.live.tab = 'notes'; return { screen: 'session', end: null }; },
    end: () => ({ screen: 'session', end: 'confirm' }),
    'end-error': () => ({ screen: 'session', end: 'error' }),
    still: () => ({ screen: 'session', still: true }),
    wardrobe: () => { restore(); return { screen: 'wardrobe', wd: { ...S.wd, view: 'active', group: 'newest' } }; },
    'wardrobe-sessions': () => { restore(); return { screen: 'wardrobe', wd: { ...S.wd, view: 'active', group: 'session' } }; },
    library: () => { restore(); return { screen: 'wardrobe', wd: { ...S.wd, view: 'library', group: 'newest' } }; },
    progress: () => { restore(); return { screen: 'progress', tab: 'overview' }; },
    history: () => { restore(); return { screen: 'progress', tab: 'history' }; },
    profile: () => { restore(); return { screen: 'profile', pane: wideQ.matches ? S.pane || 'coaching' : null }; },
  };
  for (let i = 1; i <= 4; i++) routes[`setup-${i}`] = () => { S.draft = S.draft || emptyProfile(); return { screen: 'setup', step: i }; };
  for (const p of ['coaching', 'account', 'plan', 'help']) routes[`profile-${p}`] = () => { restore(); return { screen: 'profile', pane: p }; };

  const applyRoute = () => {
    const key = (location.hash || '#home').slice(1);
    const r = (routes[key] || routes.home)();
    S.confirm = null;
    if (r.screen !== 'session') { S.live.sheet = false; }
    if (r.screen === 'profile') S.edit = S.edit || clone(S.profile);
    Object.assign(S, r);
    if (S.screen === 'session' && !S.live.playing && S.live.turn === 0) S.live.turn = current().script.length;
    transition(() => { render(); window.scrollTo(0, 0); });
  };
  const go = (h, dir = 'fwd') => { document.documentElement.dataset.dir = dir; if (location.hash === h) applyRoute(); else location.hash = h; };

  // ---------- conversation player ----------
  let timer = null;
  const step = () => {
    const sc = current().script, L = S.live;
    if (!L.playing) return;
    if (L.turn >= sc.length) { L.playing = false; L.phase = 'listening'; patch(); return; }
    const next = sc[L.turn];
    if (next.who === 'coach' && L.phase !== 'thinking') { L.phase = 'thinking'; patch(); timer = setTimeout(step, 700); return; }
    if (next.who === 'me' && L.phase !== 'listening') { L.phase = 'listening'; patch(); timer = setTimeout(step, 1300); return; }
    L.turn++; L.phase = next.who === 'coach' ? 'speaking' : 'thinking'; patch();
    timer = setTimeout(() => { if (next.who === 'coach') L.phase = 'listening'; step(); }, next.who === 'coach' ? 1700 : 300);
  };
  const play = id => {
    clearTimeout(timer); restore();
    S.liveId = id;
    if (id === 's10') { D.scripts.s10.coach = S.coach; D.scripts.s10.domain = S.focus || S.profile.domain || 'sales'; }
    Object.assign(S.live, { turn: 0, phase: 'connecting', playing: true, sheet: false, tab: 'transcript' });
    go('#session');
    timer = setTimeout(() => { S.live.phase = 'thinking'; patch(); timer = setTimeout(step, 500); }, 1100);
  };

  function finishSession(withReport, instant) {
    clearTimeout(timer);
    const cur = current(); S.live.playing = false; S.end = null; S.still = false;
    const row = sessionById(cur.id), data = { date: D.today, title: cur.title, domain: cur.domain, coach: cur.coach, status: 'ended', exported: !!withReport };
    if (row) Object.assign(row, data, { minutes: row.minutes + cur.minutes, messages: row.messages + cur.messages });
    else S.sessions.push({ id: cur.id, ...data, minutes: cur.minutes, messages: cur.messages });
    const capture = () => {
      for (const e of cur.capture.add) if (!S.entries.some(x => x.id === e.id)) S.entries.push(prep(e));
      for (const id of cur.capture.repeat) { const e = S.entries.find(x => x.id === id); if (e && !e.repeats.includes(cur.id)) e.repeats.push(cur.id); }
      S.notice = { kind: 'saved', added: cur.capture.add.length, repeated: cur.capture.repeat.length };
      S.badge = cur.capture.add.length;
    };
    if (instant) return capture();
    S.notice = { kind: 'saving' };
    go('#home');
    setTimeout(() => { capture(); render(); }, 2400);
  }

  // ---------- actions ----------
  const toast = msg => { S.toast = msg; paintToast(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = ''; paintToast(); }, 3400); };
  const NO_RENDER = false;
  const A = {
    go: el => (go(el.dataset.v, el.dataset.dir || 'fwd'), NO_RENDER),
    lang: () => { S.lang = S.lang === 'en' ? 'de' : 'en'; document.documentElement.lang = S.lang; },
    // onboarding
    obNext: () => {
      if (S.step === 1) {
        S.errors = {}; for (const k of ['name', 'role', 'industry']) if (!String(S.draft[k] || '').trim()) S.errors[k] = true;
        if (Object.keys(S.errors).length) { render(); document.querySelector('[aria-invalid=true]')?.focus(); return NO_RENDER; }
      }
      go(S.step < 4 ? `#setup-${S.step + 1}` : '#ready'); return NO_RENDER;
    },
    obBack: () => (go(S.step > 1 ? `#setup-${S.step - 1}` : '#welcome', 'back'), NO_RENDER),
    obSkip: () => (go(S.step < 4 ? `#setup-${S.step + 1}` : '#ready'), NO_RENDER),
    obDomain: el => { S.draft.domain = el.dataset.id; },
    obFinish: el => { S.profile = { ...S.draft }; S.mode = 'returning'; S.edit = null; toast('Profile saved'); go(el.dataset.v || '#first'); return NO_RENDER; },
    obEdit: el => (go(el.dataset.v, 'back'), NO_RENDER),
    testLink: () => { toast('Simulated: the English test opens in a new tab in the app.'); return NO_RENDER; },
    // session setup
    coach: el => { S.coach = el.dataset.id; },
    focusOpen: () => { S.focusOpen = !S.focusOpen; },
    focus: el => { S.focus = el.dataset.id === S.profile.domain ? null : el.dataset.id; },
    removePick: el => { S.practiceIds = S.practiceIds.filter(id => id !== el.dataset.id); },
    begin: () => (play('s10'), NO_RENDER),
    resume: el => (play(el.dataset.id || 's4'), NO_RENDER),
    // live session (patched in place so indicator animations keep running)
    mic: () => { S.live.mic = !S.live.mic; patch(); return NO_RENDER; },
    sound: () => { S.live.sound = !S.live.sound; patch(); return NO_RENDER; },
    text: () => { S.live.text = !S.live.text; },
    sheet: () => { S.live.sheet = !S.live.sheet; document.body.classList.toggle('sheet-open', S.live.sheet); syncSheet(); return NO_RENDER; },
    tab: el => { S.live.tab = el.dataset.v; patch(); return NO_RENDER; },
    pause: () => {
      clearTimeout(timer); S.live.playing = false;
      const cur = current();
      if (!sessionById(cur.id)) S.sessions.push({ id: cur.id, date: D.today, title: cur.title, domain: cur.domain, coach: cur.coach, minutes: cur.minutes, messages: cur.messages, status: 'paused', exported: false });
      else sessionById(cur.id).status = 'paused';
      S.notice = { kind: 'paused' }; go('#home', 'back'); return NO_RENDER;
    },
    end: () => { S.end = 'confirm'; },
    keep: () => { S.end = null; S.still = false; },
    endDownload: () => {
      if (S.pdfFail) { S.pdfFail = false; S.end = 'error'; return; }
      S.end = 'working'; render();
      setTimeout(() => { toast('Simulated: the PDF report downloads here in the app.'); finishSession(true); }, 900);
      return NO_RENDER;
    },
    endPlain: () => (finishSession(false), NO_RENDER),
    stillHere: () => { S.still = false; },
    dismiss: () => { S.notice = null; S.badge = 0; },
    // wardrobe
    select: el => {
      const e = S.entries.find(x => x.id === el.dataset.id);
      if (!e.selected && counts().selected >= D.maxSelected) { toast(`You can pick up to ${D.maxSelected} phrases for one practice session.`); return NO_RENDER; }
      e.selected = !e.selected;
    },
    status: el => {
      const e = S.entries.find(x => x.id === el.dataset.id); e.status = el.dataset.v;
      if (e.status === 'mastered') { e.selected = false; S.leaving.add(e.id); setTimeout(() => transition(() => { S.leaving.delete(e.id); render(); }), 1100); }
    },
    details: el => {
      const id = el.dataset.id, row = document.getElementById('row-' + id);
      S.open.has(id) ? S.open.delete(id) : S.open.add(id);
      row?.classList.toggle('is-open', S.open.has(id)); el.setAttribute('aria-expanded', S.open.has(id));
      return NO_RENDER;
    },
    view: el => (transition(() => { S.wd.view = el.dataset.v; render(); }), NO_RENDER),
    group: el => (transition(() => { S.wd.group = el.dataset.v; render(); }), NO_RENDER),
    filter: el => (transition(() => { S.wd.filter = el.dataset.v; render(); }), NO_RENDER),
    practise: () => { S.practiceIds = S.entries.filter(e => e.selected).map(e => e.id); go('#start'); return NO_RENDER; },
    // progress & history
    tabTo: el => (go(el.dataset.v === 'history' ? '#history' : '#progress', el.dataset.v === 'history' ? 'fwd' : 'back'), NO_RENDER),
    report: el => { const s = sessionById(el.dataset.id); toast(s.exported ? `Simulated: “${s.title}” report downloads as a PDF.` : 'No report was saved for this session. Reports exist only when downloaded at the end of a session.'); return NO_RENDER; },
    rename: el => { const s = sessionById(el.dataset.id), v = prompt('Rename session', s.title); if (v && v.trim()) s.title = v.trim(); },
    askDelete: el => { S.confirm = { kind: 'delete', id: el.dataset.id }; },
    askCancel: () => { S.confirm = { kind: 'cancel' }; },
    confirmNo: () => { S.confirm = null; },
    confirmYes: () => {
      const c = S.confirm; S.confirm = null;
      if (c.kind === 'delete') transition(() => { S.sessions = S.sessions.filter(s => s.id !== c.id); render(); toast('Session deleted. Its phrases stay in your Wardrobe.'); });
      else { toast('Simulated: your cancellation request is sent to the team.'); render(); }
      return NO_RENDER;
    },
    // profile
    pane: el => (go(`#profile-${el.dataset.v}`), NO_RENDER),
    paneBack: () => (go('#profile', 'back'), NO_RENDER),
    editDomain: el => { S.edit.domain = el.dataset.id; },
    saveProfile: () => {
      if (missing(S.edit).length || !S.edit.name.trim()) { toast('Name, role and industry are required.'); return NO_RENDER; }
      S.profile = clone(S.edit); toast('Profile saved. Your next session uses it.'); return NO_RENDER;
    },
    mock: el => { toast(`Simulated: ${el.dataset.v}`); return NO_RENDER; },
    // prototype panel
    proto: () => { S.proto = !S.proto; paintProto(); return NO_RENDER; },
    pdfFail: () => { S.pdfFail = !S.pdfFail; paintProto(); return NO_RENDER; },
    simStill: () => { S.proto = false; paintProto(); go('#still'); return NO_RENDER; },
    reset: () => { location.hash = '#home'; location.reload(); return NO_RENDER; },
  };

  // ---------- rendering ----------
  let app, toastEl, protoEl;
  const html = () => window.Views.shell(S, window.Views[S.screen](S));
  function render() {
    app.innerHTML = html();
    document.body.dataset.screen = S.screen;
    document.body.classList.toggle('sheet-open', S.screen === 'session' && S.live.sheet);
    afterPaint();
  }
  // Update only the [data-live] regions, so running animations (listening ring, open sheet) are not restarted.
  function patch() {
    if (S.screen !== 'session') return;
    const tpl = document.createElement('div'); tpl.innerHTML = html();
    app.querySelectorAll('[data-live]').forEach(el => {
      const n = tpl.querySelector(`[data-live="${el.dataset.live}"]`);
      if (!n) return;
      if (n.innerHTML !== el.innerHTML) el.innerHTML = n.innerHTML;
      for (const a of ['class', 'aria-pressed', 'aria-label', 'data-phase']) { const v = n.getAttribute(a); if (v !== el.getAttribute(a)) v == null ? el.removeAttribute(a) : el.setAttribute(a, v); }
    });
    afterPaint();
  }
  const syncSheet = () => app.querySelector('[data-sheet]')?.setAttribute('aria-hidden', String(!S.live.sheet));
  function afterPaint() {
    app.querySelectorAll('[data-scroll-end]').forEach(el => { el.scrollTop = el.scrollHeight; });
    syncSheet();
  }
  const paintToast = () => { toastEl.textContent = S.toast; toastEl.classList.toggle('show', !!S.toast); };
  const SCREENS = [['#welcome', '1 Onboarding: welcome'], ['#setup-1', '1 Onboarding: about you'], ['#setup-2', '1 Onboarding: focus'], ['#setup-3', '1 Onboarding: level'],
    ['#setup-4', '1 Onboarding: optional'], ['#ready', '1 Onboarding: ready'], ['#first', '2 Dashboard: first visit'], ['#home', '2 Dashboard: returning'],
    ['#incomplete', '2 Dashboard: incomplete profile'], ['#start', '3 Start a session'], ['#session', '4 Conversation'], ['#notes', '5 Transcript & notes'],
    ['#still', '4 Still there?'], ['#end', '6 End session'], ['#end-error', '6 End: report failed'], ['#after', '6 Back on the dashboard'],
    ['#wardrobe', '7 Wardrobe'], ['#wardrobe-sessions', '7 Wardrobe by session'], ['#library', '7 Library'], ['#progress', '8 Progress'],
    ['#history', '8 Session history'], ['#profile', '9 Profile'], ['#profile-coaching', '9 Coaching profile'], ['#profile-account', '9 Account'], ['#profile-plan', '9 Plan'], ['#profile-help', '9 Help']];
  function paintProto() {
    protoEl.innerHTML = `<button class="pp-toggle" data-act="proto" aria-expanded="${S.proto}">Interactive design preview — Demo data.</button>`
      + (S.proto ? `<div class="pp-panel"><p class="pp-h">Mock data. No backend, nothing is saved.</p>${SCREENS.map(([h, l]) => `<button data-act="go" data-v="${h}">${l}</button>`).join('')}
        <p class="pp-h">Simulate</p><button data-act="pdfFail" aria-pressed="${S.pdfFail}">${S.pdfFail ? 'On: ' : ''}Fail the next report download</button>
        <button data-act="simStill">Inactivity: “Still there?”</button><button data-act="lang">Language: ${S.lang.toUpperCase()}</button><button data-act="reset">Reset sample data</button></div>` : '');
  }

  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const fn = A[el.dataset.act]; if (!fn) return;
    ev.preventDefault();
    if (fn(el) !== NO_RENDER) render();
    if (el.dataset.act === 'lang') paintProto();
  });
  document.addEventListener('input', ev => {
    const el = ev.target.closest('[data-field]'); if (!el) return;
    const target = el.dataset.scope === 'edit' ? S.edit : S.draft, [k, sub] = el.dataset.field.split('.');
    if (sub) target[k][sub] = el.value; else target[k] = el.value;
    if (S.errors[k] && el.value.trim()) { delete S.errors[k]; el.removeAttribute('aria-invalid'); el.closest('.field')?.classList.remove('has-error'); }
  });
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return;
    if (S.confirm) S.confirm = null; else if (S.end === 'confirm' || S.end === 'error') S.end = null; else if (S.live.sheet) { A.sheet(); return; } else return;
    render();
  });
  window.addEventListener('hashchange', applyRoute);

  window.P = { t, esc, fmt, icon, coach, domain, sessionById, current, markLine, visibleTurns, elapsed, typeLabel, tagLabel, plural, practiceLine, repeatLine, entriesView, groups, counts, phrasesIn, weeks, stats, bars, missing, D };

  document.addEventListener('DOMContentLoaded', () => {
    setLayout(); document.documentElement.lang = S.lang;
    app = document.getElementById('app');
    toastEl = Object.assign(document.createElement('div'), { className: 'toast' }); toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
    document.body.append(toastEl);
    if (!shot) { protoEl = Object.assign(document.createElement('div'), { id: 'proto' }); app.before(protoEl); paintProto(); }
    else protoEl = document.createElement('div');
    applyRoute();
  });
})();
