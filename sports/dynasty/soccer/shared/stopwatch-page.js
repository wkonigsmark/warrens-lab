// Dynasty Soccer — per-player stopwatch (?team=<slug>[&event=<uuid>]).
// Times live in localStorage so a refresh, a locked phone or a dropped signal
// never loses a session. Nothing here is written to the database.
import { sb, esc, setStatus, isConfigured, applyClub } from './db.js';
import { fmtDate, TYPE_LABEL } from './schedule.js';
import { mountCoachToggle, isUnlocked, onChange, coachCall } from './coach.js';
import { mountNav } from './nav.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const teamSlug = params.get('team');

let team = null, roster = [], events = [], squad = [], store = { testName: '', results: {} };
const timers = {};                       // player_id -> {running, startedAt, elapsed}
let ticker = null;

const KEY = () => `dynasty-soccer:stopwatch:${teamSlug}`;
const pad = (n, w = 2) => String(n).padStart(w, '0');
function fmt(ms) {
  if (ms == null) return '--:--.-';
  const t = Math.max(0, Math.round(ms / 100) * 100);
  return `${pad(Math.floor(t / 60000))}:${pad(Math.floor(t % 60000 / 1000))}.${Math.floor(t % 1000 / 100)}`;
}

// ---------------------------------------------------------------- persistence
function load() {
  try {
    const raw = localStorage.getItem(KEY());
    if (raw) store = { testName: '', results: {}, ...JSON.parse(raw) };
  } catch { /* first run, or storage blocked */ }
}
function save() {
  try { localStorage.setItem(KEY(), JSON.stringify(store)); } catch { /* private mode */ }
}
const attemptsFor = id => store.results[id]?.attempts || [];
const bestFor = id => { const a = attemptsFor(id); return a.length ? Math.min(...a) : null; };

// ---------------------------------------------------------------- timing
function elapsedOf(id) {
  const t = timers[id];
  if (!t) return 0;
  return t.elapsed + (t.running ? Date.now() - t.startedAt : 0);
}

function toggle(id) {
  const t = timers[id] || (timers[id] = { running: false, startedAt: 0, elapsed: 0 });
  if (t.running) {
    t.elapsed += Date.now() - t.startedAt;
    t.running = false;
    const ms = t.elapsed;
    if (ms > 250) {                                  // ignore an accidental double-tap
      store.results[id] = store.results[id] || { attempts: [] };
      store.results[id].attempts.push(ms);
      save();
    }
    t.elapsed = 0;
  } else {
    t.startedAt = Date.now();
    t.running = true;
  }
  render();
  syncTicker();
}

function clearPlayer(id) {
  delete store.results[id];
  timers[id] = { running: false, startedAt: 0, elapsed: 0 };
  save(); render(); syncTicker();
}

function syncTicker() {
  const anyRunning = Object.values(timers).some(t => t.running);
  clearInterval(ticker);
  if (anyRunning) ticker = setInterval(paintRunning, 100);
}
function paintRunning() {
  for (const [id, t] of Object.entries(timers)) {
    if (!t.running) continue;
    const el = document.querySelector(`.sw-card[data-player="${id}"] .sw-time`);
    if (el) el.textContent = fmt(elapsedOf(id));
  }
}

// ---------------------------------------------------------------- render
function sortSquad(list) {
  const mode = $('sort').value;
  const arr = [...list];
  if (mode === 'name') return arr.sort((a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`));
  const key = p => bestFor(p.player_id);
  if (mode === 'fastest') return arr.sort((a, b) => (key(a) ?? Infinity) - (key(b) ?? Infinity));
  if (mode === 'slowest') return arr.sort((a, b) => (key(b) ?? -Infinity) - (key(a) ?? -Infinity));
  return arr.sort((a, b) => (key(a) == null ? 0 : 1) - (key(b) == null ? 0 : 1));   // untimed first
}

function render() {
  const list = sortSquad(squad);
  const timed = squad.filter(p => bestFor(p.player_id) != null).length;
  $('squad-count').textContent = squad.length ? `${squad.length}` : '';
  $('done-count').textContent = squad.length ? `${timed} of ${squad.length} timed` : '';

  if (!squad.length) { $('grid').innerHTML = '<p class="empty">Nobody available for this session.</p>'; return; }

  const ranks = squad.map(p => bestFor(p.player_id)).filter(v => v != null).sort((a, b) => a - b);
  $('grid').innerHTML = list.map(p => {
    const t = timers[p.player_id] || {};
    const best = bestFor(p.player_id);
    const tries = attemptsFor(p.player_id);
    const rank = best != null ? ranks.indexOf(best) + 1 : null;
    return `
      <article class="sw-card${t.running ? ' running' : ''}${best != null ? ' done' : ''}" data-player="${p.player_id}">
        <div class="sw-head">
          <span class="sw-name">${esc(p.first_name)} ${esc((p.last_name || '')[0] || '')}.</span>
          ${rank === 1 ? '<span class="sw-rank gold">fastest</span>' : rank ? `<span class="sw-rank">#${rank}</span>` : ''}
        </div>
        <div class="sw-time">${t.running ? fmt(elapsedOf(p.player_id)) : fmt(best)}</div>
        <button class="sw-btn ${t.running ? 'stop' : 'go'}" type="button" data-act="toggle">${t.running ? 'Stop' : (best != null ? 'Run again' : 'Start')}</button>
        ${tries.length ? `<div class="sw-tries">${tries.map(ms => `<span${ms === best ? ' class="b"' : ''}>${fmt(ms)}</span>`).join('')}
          <button class="sw-clear" type="button" data-act="clear" aria-label="Clear times">×</button></div>` : ''}
      </article>`;
  }).join('');
}

$('grid').addEventListener('click', e => {
  const card = e.target.closest('.sw-card');
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (!card || !act) return;
  if (act === 'toggle') toggle(card.dataset.player);
  if (act === 'clear' && confirm('Clear this player’s times?')) clearPlayer(card.dataset.player);
});
$('sort').addEventListener('change', render);
$('test-name').addEventListener('input', () => { store.testName = $('test-name').value; save(); });
$('reset-all').addEventListener('click', () => {
  if (!confirm('Clear every recorded time for this team?')) return;
  store.results = {};
  for (const k of Object.keys(timers)) timers[k] = { running: false, startedAt: 0, elapsed: 0 };
  save(); render(); syncTicker();
});

// ---------------------------------------------------------------- printing
$('print').addEventListener('click', () => {
  const ranked = squad.map(p => ({ p, best: bestFor(p.player_id), tries: attemptsFor(p.player_id) }))
    .sort((a, b) => (a.best ?? Infinity) - (b.best ?? Infinity));
  const ev = events.find(e => e.id === $('event').value);
  $('print-doc').innerHTML = `
    <div class="paper">
      <div class="doc-head">
        <div class="doc-title">${esc($('test-name').value || 'Stopwatch results')}</div>
        <div class="doc-sub">${esc(team.name)}${ev ? ` · ${fmtDate(ev.event_date)}` : ''} · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <table class="doc-table">
        <thead><tr><th class="pn">#</th><th class="pd">Player</th><th class="pm">Best</th><th>All attempts</th></tr></thead>
        <tbody>${ranked.map((r, i) => `
          <tr><td class="pn">${r.best != null ? i + 1 : '–'}</td>
              <td class="pd">${esc(r.p.first_name)} ${esc(r.p.last_name)}</td>
              <td class="pm">${r.best != null ? fmt(r.best) : '—'}</td>
              <td>${r.tries.map(m => fmt(m)).join('   ') || '—'}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  window.print();
});

// ---------------------------------------------------------------- data
async function buildSquad() {
  const id = $('event').value;
  if (!id) { squad = roster; render(); return; }
  try {
    const out = await coachCall('coach_attendance_out', { p_event_id: id });
    squad = roster.filter(p => out[p.player_id] !== 'out');
  } catch { squad = roster; }
  render();
}
$('event').addEventListener('change', buildSquad);

function showGate() {
  const unlocked = isUnlocked();
  $('gate').hidden = unlocked;
  $('panel').hidden = !unlocked;
  if (unlocked && team) loadRoster();
}

async function loadRoster() {
  try {
    roster = await coachCall('coach_get_roster', { p_team_id: team.id });
    await buildSquad();
  } catch (err) { $('grid').innerHTML = `<p class="empty">${esc(err.message)}</p>`; }
}

async function init() {
  mountCoachToggle($('coach-slot'));
  if (!isConfigured) { setStatus($('status'), 'Not configured', 'err'); return; }
  if (!teamSlug) { setStatus($('status'), 'No team', 'err'); $('title').textContent = 'Missing ?team= in the URL'; return; }
  load();
  $('test-name').value = store.testName || '';
  try {
    [team] = await sb(`teams?slug=eq.${encodeURIComponent(teamSlug)}&select=*`);
    if (!team) throw new Error(`No team with slug "${teamSlug}".`);
    applyClub(team.slug);
    mountNav({ active: 'stopwatch', teamSlug: team.slug, eventId: params.get('event') || '' });
    setStatus($('status'), 'Connected', 'ok');
    $('title').textContent = `${team.name} Stopwatch`;
    document.title = `${team.name} Stopwatch — Dynasty Soccer`;
    $('meta').textContent = [team.season, team.age_group].filter(Boolean).join(' · ');
    $('team-link').textContent = team.name;
    $('team-link').href = $('back').href = `../teams/${encodeURIComponent(team.slug)}/index.html`;

    events = await sb(`events?team_id=eq.${team.id}&event_type=neq.bye&select=id,event_date,event_type,opponent&order=event_date.asc`);
    $('event').innerHTML = '<option value="">— whole roster —</option>' + events.map(e =>
      `<option value="${e.id}">${fmtDate(e.event_date)} — ${esc(TYPE_LABEL[e.event_type])}${e.opponent ? ` vs ${esc(e.opponent)}` : ''}</option>`).join('');
    if (params.get('event')) $('event').value = params.get('event');

    onChange(showGate);
    showGate();
  } catch (err) {
    console.error(err);
    setStatus($('status'), 'Connection failed', 'err');
    $('title').textContent = err.message;
  }
}
init();
