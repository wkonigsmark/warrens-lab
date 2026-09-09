// Dynasty Soccer — renders a team page.
// The team is chosen by <body data-team="<slug>">; see teams/_template/index.html.
import { sb, esc, setStatus, isConfigured, applyClub } from './db.js';
import { fetchEvents, renderEvents, isMissingTable, fmtDate, fmtTime, TYPE_LABEL, todayISO } from './schedule.js';
import { mountCoachToggle, isUnlocked, onChange, coachCall } from './coach.js';
import { positionOptions, POSITIONS } from './positions.js';
import { mountNav } from './nav.js';

const slug = document.body.dataset.team;
const $ = id => document.getElementById(id);
const statusEl = $('status'), titleEl = $('team-name'), metaEl = $('team-meta');
const rosterHead = $('roster-head'), rosterEl = $('roster'), countEl = $('count');
const eventsEl = $('events'), hidePastEl = $('hide-past');
const resultsEl = $('results'), recordEl = $('record');

let team = null, publicRoster = [], events = [], matches = {}, attendance = {};

function fail(err) {
  console.error(err);
  setStatus(statusEl, 'Connection failed', 'err');
  rosterEl.innerHTML = `<tr><td colspan="6" class="empty">${esc(err.message)}</td></tr>`;
}
const fullName = p => `${p.first_name} ${p.last_name}`;
const byName = (a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);

// ---------------------------------------------------------------- roster (public)
function renderPublicRoster() {
  rosterHead.innerHTML = '<tr><th>#</th><th>Player</th></tr>';
  if (!publicRoster.length) {
    rosterEl.innerHTML = '<tr><td colspan="2" class="empty">No players on this roster yet.</td></tr>';
    return;
  }
  rosterEl.innerHTML = publicRoster.map(r => `
    <tr><td class="num">${r.jersey_number ?? '—'}</td><td>${esc(fullName(r.players))}</td></tr>`).join('');
}

// ---------------------------------------------------------------- roster (coach)
/** Grouped position dropdown; keeps an unrecognised saved value as its own option. */
function posSelect(field, value) {
  const groups = positionOptions().map(g =>
    `<optgroup label="${esc(g.label)}">${g.options.map(o =>
      `<option value="${o.code}"${o.code === value ? ' selected' : ''}>${esc(o.name)}</option>`).join('')}</optgroup>`).join('');
  const stray = value && !POSITIONS[value]
    ? `<option value="${esc(value)}" selected>${esc(value)} (unknown)</option>` : '';
  return `<select class="pos" data-f="${field}" aria-label="Position ${field === 'p1' ? '1' : '2'}">
    <option value="">–</option>${stray}${groups}</select>`;
}

async function renderCoachRoster() {
  rosterHead.innerHTML = '<tr><th>#</th><th>Player</th><th>Skill</th><th>Pos 1</th><th>Pos 2</th><th>Latest note</th></tr>';
  rosterEl.innerHTML = '<tr><td colspan="6" class="empty">Loading coach view…</td></tr>';
  let rows;
  try { rows = await coachCall('coach_get_roster', { p_team_id: team.id }); }
  catch (err) { rosterEl.innerHTML = `<tr><td colspan="6" class="empty">${esc(err.message)}</td></tr>`; return; }
  if (!rows.length) { rosterEl.innerHTML = '<tr><td colspan="6" class="empty">No players on this roster yet.</td></tr>'; return; }

  rosterEl.innerHTML = rows.map(r => `
    <tr class="edit-row" data-player="${r.player_id}">
      <td class="num">${r.jersey_number ?? '—'}</td>
      <td class="pname">${esc(fullName(r))}<span class="saved"></span></td>
      <td><select class="skill" aria-label="Skill">
        <option value="">–</option>
        ${[1, 2, 3, 4].map(n => `<option value="${n}"${r.skill === n ? ' selected' : ''}>${n}</option>`).join('')}
      </select></td>
      <td>${posSelect('p1', r.position_1)}</td>
      <td>${posSelect('p2', r.position_2)}</td>
      <td class="note-cell">
        <span class="latest">${r.latest_note ? esc(r.latest_note) : '<span class="dim">—</span>'}</span>
        <button class="chip small notes-btn" type="button">Notes${r.note_count ? ` (${r.note_count})` : ''}</button>
      </td>
    </tr>
    <tr class="notes-row" hidden><td colspan="6"><div class="notes-panel">
      <form class="note-form">
        <textarea rows="2" placeholder="What to work on, coaching insights…"></textarea>
        <button class="chip on" type="submit">Add note</button>
      </form>
      <ul class="note-list"><li class="dim">Loading…</li></ul>
    </div></td></tr>`).join('');
}

async function saveEval(tr) {
  const skill = tr.querySelector('.skill').value;
  const p1 = tr.querySelector('[data-f="p1"]').value, p2 = tr.querySelector('[data-f="p2"]').value;
  const flash = tr.querySelector('.saved');
  flash.textContent = '…';
  try {
    await coachCall('coach_save_eval', { p_team_id: team.id, p_player_id: tr.dataset.player, p_skill: skill ? Number(skill) : null, p_pos1: p1, p_pos2: p2 });
    flash.textContent = 'saved'; setTimeout(() => { if (flash.textContent === 'saved') flash.textContent = ''; }, 1500);
  } catch (err) { flash.textContent = err.message; }
}

async function loadNotes(tr) {
  const panel = tr.nextElementSibling, list = panel.querySelector('.note-list');
  try {
    const notes = await coachCall('coach_get_notes', { p_team_id: team.id, p_player_id: tr.dataset.player });
    list.innerHTML = notes.length ? notes.map(n => `
      <li data-note="${n.id}"><span class="when">${fmtDate(n.created_at.slice(0, 10))}</span>
        <span class="text">${esc(n.note)}</span>
        <button class="del" type="button" title="Delete note" aria-label="Delete note">×</button></li>`).join('')
      : '<li class="dim">No notes yet.</li>';
    const latest = tr.querySelector('.latest'), btn = tr.querySelector('.notes-btn');
    latest.innerHTML = notes.length ? esc(notes[0].note) : '<span class="dim">—</span>';
    btn.textContent = `Notes${notes.length ? ` (${notes.length})` : ''}`;
  } catch (err) { list.innerHTML = `<li class="dim">${esc(err.message)}</li>`; }
}

rosterEl.addEventListener('change', e => {
  const tr = e.target.closest('tr.edit-row');
  if (tr && e.target.matches('.skill, .pos')) saveEval(tr);
});
rosterEl.addEventListener('click', async e => {
  const btn = e.target.closest('.notes-btn');
  if (btn) {
    const tr = btn.closest('tr'), panel = tr.nextElementSibling;
    panel.hidden = !panel.hidden;
    if (!panel.hidden) { loadNotes(tr); panel.querySelector('textarea').focus(); }
    return;
  }
  const del = e.target.closest('.del');
  if (del) {
    const li = del.closest('li'), tr = del.closest('tr.notes-row').previousElementSibling;
    if (!confirm('Delete this note?')) return;
    try { await coachCall('coach_delete_note', { p_note_id: li.dataset.note }); loadNotes(tr); }
    catch (err) { alert(err.message); }
  }
});
rosterEl.addEventListener('submit', async e => {
  if (!e.target.matches('.note-form')) return;
  e.preventDefault();
  const ta = e.target.querySelector('textarea'), tr = e.target.closest('tr.notes-row').previousElementSibling;
  if (!ta.value.trim()) return;
  try {
    await coachCall('coach_add_note', { p_team_id: team.id, p_player_id: tr.dataset.player, p_note: ta.value });
    ta.value = ''; loadNotes(tr);
  } catch (err) { alert(err.message); }
});

function drawRoster() { isUnlocked() ? renderCoachRoster() : renderPublicRoster(); }

// ---------------------------------------------------------------- schedule + results
function drawSchedule() {
  if (!eventsEl) return;
  renderEvents(eventsEl, events, {
    hidePast: hidePastEl?.checked, matches, matchUrl: '../../match/index.html?event=',
    canStart: isUnlocked() && team.live_scoring,
    checkinUrl: isUnlocked() ? '../../attendance/index.html?event=' : '',
    attendance,
  });
}

/** One-tap actions for today's session, or the next one. */
function drawGameday() {
  const box = $('next-up');
  if (!box) return;
  const today = todayISO();
  const playable = events.filter(e => e.event_type !== 'bye');
  let day = playable.filter(e => e.event_date === today);
  let label = 'Today';
  if (!day.length) {
    const next = playable.filter(e => e.event_date > today).map(e => e.event_date).sort()[0];
    if (!next) { box.hidden = true; return; }
    day = playable.filter(e => e.event_date === next);
    label = 'Next up';
  }
  $('next-label').textContent = label;
  $('next-when').textContent = fmtDate(day[0].event_date);
  $('next-list').innerHTML = day.map(e => {
    const scorable = e.event_type === 'game' && team.live_scoring !== false;
    return `
      <div class="gd-item">
        <div class="gd-when">${esc(fmtTime(e.start_time) || 'TBD')}</div>
        <div class="gd-what">
          <div class="gd-team">${esc(TYPE_LABEL[e.event_type])}${e.opponent ? ` vs ${esc(e.opponent)}` : ''}</div>
          <div class="gd-sub">${esc(e.location || '')}</div>
        </div>
        <div class="gd-actions">
          <a class="gd-btn primary" href="../../attendance/index.html?event=${e.id}">✓ Check-in</a>
          <a class="gd-btn" href="../../lineup/index.html?team=${encodeURIComponent(team.slug)}&event=${e.id}">Lineup</a>
          ${scorable ? `<a class="gd-btn" href="../../match/index.html?event=${e.id}">Score</a>` : ''}
        </div>
      </div>`;
  }).join('');
  box.hidden = false;
}

function drawResults() {
  if (!resultsEl) return;
  const finals = Object.values(matches).filter(m => m.status === 'final')
    .sort((a, b) => (a.events?.event_date || '').localeCompare(b.events?.event_date || ''));
  let w = 0, l = 0, t = 0;
  for (const m of finals) { if (m.our_score > m.their_score) w++; else if (m.our_score < m.their_score) l++; else t++; }
  recordEl.textContent = finals.length ? `${w}-${l}-${t}` : '';
  if (!finals.length) { resultsEl.innerHTML = '<li class="empty">No results yet.</li>'; return; }
  const names = Object.fromEntries(publicRoster.map(r => [r.players.id, r.players.first_name]));
  resultsEl.innerHTML = finals.map(m => {
    const r = m.our_score > m.their_score ? 'W' : m.our_score < m.their_score ? 'L' : 'T';
    const tally = {};
    for (const g of m.goals || []) if (g.side === 'us' && g.scorer_id) tally[g.scorer_id] = (tally[g.scorer_id] || 0) + 1;
    const scorers = Object.entries(tally).map(([id, n]) => `${esc(names[id] || '?')}${n > 1 ? ` ×${n}` : ''}`).join(', ');
    return `<li><a href="../../match/index.html?event=${m.event_id}">
      <span class="score final ${r}">${r} ${m.our_score}–${m.their_score}</span>
      <span class="opp">vs ${esc(m.events?.opponent || '')}</span>
      <span class="dim">${m.events ? fmtDate(m.events.event_date) : ''}</span>
      ${scorers ? `<span class="scorers">${scorers}</span>` : ''}</a></li>`;
  }).join('');
}

async function loadSchedule() {
  try {
    const [evs, ms] = await Promise.all([
      fetchEvents(team.id),
      sb(`matches?team_id=eq.${team.id}&select=id,event_id,status,our_score,their_score,events(event_date,opponent),goals(side,scorer_id)`).catch(() => []),
    ]);
    events = evs; matches = Object.fromEntries(ms.map(m => [m.event_id, m]));
    if (isUnlocked()) {
      try { attendance = await coachCall('coach_attendance_summary', { p_team_id: team.id }); }
      catch (err) { console.warn('attendance summary:', err.message); }
    }
    drawSchedule(); drawResults(); drawGameday();
    hidePastEl?.addEventListener('change', drawSchedule);
  } catch (err) {
    console.error(err);
    if (eventsEl) eventsEl.innerHTML = `<tr><td colspan="5" class="empty">${isMissingTable(err)
      ? 'Events table not set up yet — see <code>supabase/migrate-2026-09-08-events.sql</code>.' : esc(err.message)}</td></tr>`;
  }
}

// ---------------------------------------------------------------- init
async function init() {
  mountCoachToggle($('coach-slot'));
  applyClub(slug);
  mountNav({ active: 'team', teamSlug: slug });
  if (!slug) return fail(new Error('This page is missing data-team on <body>.'));
  if (!isConfigured) { setStatus(statusEl, 'Not configured', 'err'); return; }
  try {
    [team] = await sb(`teams?slug=eq.${encodeURIComponent(slug)}&select=*`);
    if (team) team.live_scoring = team.live_scoring ?? true;
    if (!team) throw new Error(`No team with slug "${slug}" in the database.`);
    setStatus(statusEl, 'Connected', 'ok');
    titleEl.textContent = team.name;
    document.title = `${team.name} — Dynasty Soccer`;
    metaEl.textContent = [team.season, team.age_group, team.active ? '' : 'Archived'].filter(Boolean).join(' · ');

    publicRoster = await sb(`team_players?team_id=eq.${team.id}&select=jersey_number,players(id,first_name,last_name)`);
    publicRoster.sort((a, b) => byName(a.players, b.players));
    countEl.textContent = publicRoster.length ? `${publicRoster.length} player${publicRoster.length === 1 ? '' : 's'}` : '';
    drawRoster();
    onChange(() => { drawRoster(); loadSchedule(); });
    loadSchedule();
  } catch (err) { fail(err); }
}
init();
