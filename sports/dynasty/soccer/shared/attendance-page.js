// Dynasty Soccer — roster check-in for one event (?event=<uuid>).
// Only exceptions are stored; a player with no row is available.
import { sb, esc, setStatus, isConfigured, applyClub } from './db.js';
import { fmtDate, fmtTime, TYPE_LABEL } from './schedule.js';
import { mountCoachToggle, isUnlocked, onChange, coachCall } from './coach.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let eventId = params.get('event');
let event = null, team = null, roll = [];

const NEXT = { in: 'out', out: 'maybe', maybe: 'in' };
const LABEL = { in: 'In', out: 'Out', maybe: 'Maybe' };

function render() {
  const n = { in: 0, out: 0, maybe: 0 };
  for (const r of roll) n[r.status]++;
  $('tally').textContent = roll.length
    ? `${n.in} in${n.out ? ` · ${n.out} out` : ''}${n.maybe ? ` · ${n.maybe} maybe` : ''}`
    : '';

  $('roll').innerHTML = roll.length ? roll.map(r => `
    <li class="roll-item ${r.status}" data-player="${r.player_id}">
      <button type="button" class="roll-btn" aria-label="${esc(r.first_name)} ${esc(r.last_name)}: ${LABEL[r.status]}, tap to change">
        <span class="dot-${r.status}"></span>
        <span class="rn">${esc(r.first_name)} ${esc(r.last_name)}</span>
        <span class="rs">${LABEL[r.status]}</span>
      </button>
      <input class="rnote" data-note value="${esc(r.note || '')}" placeholder="reason (optional)" aria-label="Note">
    </li>`).join('') : '<li class="empty">No players on this roster.</li>';
}

async function setStatusFor(playerId, status, note) {
  const row = roll.find(r => r.player_id === playerId);
  const prev = { status: row.status, note: row.note };
  row.status = status; row.note = note ?? row.note;
  render();
  $('save-msg').textContent = 'Saving…';
  try {
    await coachCall('coach_attendance_set', {
      p_event_id: eventId, p_player_id: playerId, p_status: row.status, p_note: row.note || null,
    });
    $('save-msg').textContent = 'Saved';
    setTimeout(() => { if ($('save-msg').textContent === 'Saved') $('save-msg').textContent = ''; }, 1500);
  } catch (err) {
    Object.assign(row, prev); render();          // put it back if the write failed
    $('save-msg').textContent = err.message;
  }
}

$('roll').addEventListener('click', e => {
  const li = e.target.closest('[data-player]');
  if (!li || !e.target.closest('.roll-btn')) return;
  const row = roll.find(r => r.player_id === li.dataset.player);
  setStatusFor(row.player_id, NEXT[row.status]);
});
$('roll').addEventListener('change', e => {
  if (!e.target.matches('[data-note]')) return;
  const li = e.target.closest('[data-player]');
  const row = roll.find(r => r.player_id === li.dataset.player);
  setStatusFor(row.player_id, row.status, e.target.value);
});
$('all-in').addEventListener('click', async () => {
  const changed = roll.filter(r => r.status !== 'in' || r.note);
  if (!changed.length) return;
  if (!confirm(`Reset ${changed.length} player${changed.length === 1 ? '' : 's'} to available?`)) return;
  for (const r of changed) await setStatusFor(r.player_id, 'in', '');
});

$('event').addEventListener('change', () => {
  const id = $('event').value;
  if (id && id !== eventId) location.search = `?event=${encodeURIComponent(id)}`;
});

async function load() {
  try {
    roll = await coachCall('coach_attendance_get', { p_event_id: eventId });
    render();
  } catch (err) { $('roll').innerHTML = `<li class="empty">${esc(err.message)}</li>`; }
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
