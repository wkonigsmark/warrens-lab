// Dynasty Soccer — roster check-in for one event (?event=<uuid>).
// Only exceptions are stored; a player with no row is available.
import { sb, esc, setStatus, isConfigured, applyClub } from './db.js';
import { fmtDate, fmtTime, TYPE_LABEL } from './schedule.js';
import { mountCoachToggle, isUnlocked, onChange, coachCall } from './coach.js';
import { mountNav } from './nav.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let eventId = params.get('event');
let event = null, team = null, roll = [];

const NEXT = { in: 'out', out: 'maybe', maybe: 'in' };
const LABEL = { in: 'In', out: 'Out', maybe: 'Maybe' };
const RANK = { in: 0, maybe: 1, out: 2 };      // available first, absent to the bottom-right

let order = [];                 // display order, re-sorted only when tapping settles
let resortTimer = null;

const initials = p => `${(p.first_name || '?')[0]}${(p.last_name || '')[0] || ''}`.toUpperCase();
const shortName = p => {
  const dupes = roll.filter(o => o.first_name === p.first_name).length > 1;
  return dupes ? `${p.first_name} ${(p.last_name || '')[0] || ''}.` : p.first_name;
};

function resort() {
  order = [...roll].sort((a, b) =>
    RANK[a.status] - RANK[b.status] ||
    `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
  ).map(r => r.player_id);
}

function render() {
  const n = { in: 0, out: 0, maybe: 0 };
  for (const r of roll) n[r.status]++;
  $('tally').textContent = roll.length
    ? `${n.in} in${n.out ? ` · ${n.out} out` : ''}${n.maybe ? ` · ${n.maybe} maybe` : ''}`
    : '';

  if (!roll.length) { $('roll').innerHTML = '<p class="empty">No players on this roster.</p>'; return; }
  if (order.length !== roll.length) resort();

  $('roll').innerHTML = order.map(id => {
    const r = roll.find(x => x.player_id === id);
    if (!r) return '';
    return `
      <button type="button" class="att-tile ${r.status}" data-player="${r.player_id}"
              aria-pressed="${r.status !== 'in'}"
              aria-label="${esc(r.first_name)} ${esc(r.last_name)}: ${LABEL[r.status]}. Tap to change.">
        <span class="att-ini">${esc(initials(r))}</span>
        <span class="att-nm">${esc(shortName(r))}</span>
        <span class="att-state">${LABEL[r.status]}</span>
      </button>`;
  }).join('');
}

/** Re-sort a moment after tapping stops, so a tile never slides out from under a finger. */
function scheduleResort() {
  clearTimeout(resortTimer);
  resortTimer = setTimeout(() => { resort(); render(); }, 1400);
}

async function setStatusFor(playerId, status) {
  const row = roll.find(r => r.player_id === playerId);
  const prev = { status: row.status };
  row.status = status;
  render();
  scheduleResort();
  $('save-msg').textContent = 'Saving…';
  try {
    await coachCall('coach_attendance_set', {
      p_event_id: eventId, p_player_id: playerId, p_status: row.status, p_note: null,
    });
    $('save-msg').textContent = 'Saved';
    setTimeout(() => { if ($('save-msg').textContent === 'Saved') $('save-msg').textContent = ''; }, 1500);
  } catch (err) {
    Object.assign(row, prev); render();          // put it back if the write failed
    $('save-msg').textContent = err.message;
  }
}

$('roll').addEventListener('click', e => {
  const tile = e.target.closest('.att-tile');
  if (!tile) return;
  const row = roll.find(r => r.player_id === tile.dataset.player);
  if (row) setStatusFor(row.player_id, NEXT[row.status]);
});
$('all-in').addEventListener('click', async () => {
  const changed = roll.filter(r => r.status !== 'in');
  if (!changed.length) return;
  if (!confirm(`Reset ${changed.length} player${changed.length === 1 ? '' : 's'} to available?`)) return;
  for (const r of changed) await setStatusFor(r.player_id, 'in');
});

$('event').addEventListener('change', () => {
  const id = $('event').value;
  if (id && id !== eventId) location.search = `?event=${encodeURIComponent(id)}`;
});

async function load() {
  try {
    roll = await coachCall('coach_attendance_get', { p_event_id: eventId });
    resort();
    render();
  } catch (err) { $('roll').innerHTML = `<p class="empty">${esc(err.message)}</p>`; }
}

function showGate() {
  const unlocked = isUnlocked();
  $('gate').hidden = unlocked;
  $('panel').hidden = !unlocked;
  if (unlocked && event) load();
}

async function init() {
  mountCoachToggle($('coach-slot'));
  if (!isConfigured) { setStatus($('status'), 'Not configured', 'err'); return; }
  if (!eventId) { setStatus($('status'), 'No session', 'err'); $('title').textContent = 'Missing ?event= in the URL'; return; }
  try {
    [event] = await sb(`events?id=eq.${eventId}&select=id,event_date,start_time,event_type,opponent,location,team_id,teams(*)`);
    if (!event) throw new Error('No such session.');
    team = event.teams;
    applyClub(team.slug);
    mountNav({ active: 'checkin', teamSlug: team.slug, eventId });
    setStatus($('status'), 'Connected', 'ok');
    const what = event.opponent ? `${TYPE_LABEL[event.event_type]} vs ${event.opponent}` : TYPE_LABEL[event.event_type];
    $('title').textContent = `${team.name} — ${what}`;
    document.title = `Check-in · ${team.name} — Dynasty Soccer`;
    $('meta').textContent = [fmtDate(event.event_date), fmtTime(event.start_time), event.location].filter(Boolean).join(' · ');
    $('team-link').textContent = team.name;
    $('team-link').href = $('back').href = `../teams/${encodeURIComponent(team.slug)}/index.html`;

    const events = await sb(`events?team_id=eq.${team.id}&event_type=neq.bye&select=id,event_date,event_type,opponent&order=event_date.asc`);
    $('event').innerHTML = events.map(e =>
      `<option value="${e.id}"${e.id === eventId ? ' selected' : ''}>${fmtDate(e.event_date)} — ${esc(TYPE_LABEL[e.event_type])}${e.opponent ? ` vs ${esc(e.opponent)}` : ''}</option>`).join('');

    onChange(showGate);
    showGate();
  } catch (err) {
    console.error(err);
    setStatus($('status'), 'Connection failed', 'err');
    $('title').textContent = err.message;
  }
}
init();
