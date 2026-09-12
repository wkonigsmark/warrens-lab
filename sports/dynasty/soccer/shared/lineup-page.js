// Dynasty Soccer — interactive lineup builder (?team=<slug>[&event=<uuid>][&lineup=<uuid>]).
import { sb, esc, setStatus, isConfigured, applyClub } from './db.js';
import { fmtDate } from './schedule.js';
import { mountCoachToggle, isUnlocked, onChange, coachCall } from './coach.js';
import { FORMATIONS, getFormation, autoAssign, remapFormation, initials, POSITIONS, formationsForSize, SQUAD_SIZES } from './positions.js';
import { pitchMarkings, PITCH_VIEWBOX } from './pitch.js';
import { mountNav } from './nav.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const teamSlug = params.get('team');

let team = null, roster = [], events = [], saved = [];
let unavailable = {};              // player_id -> 'out' | 'maybe', for the selected game
let formation = getFormation(FORMATIONS[0].code);
let assignments = {};              // slotCode -> player_id
let picked = null;                 // player_id currently selected from the bench
let currentLineupId = params.get('lineup') || null;

const player = id => roster.find(p => p.player_id === id);
const isOut = id => unavailable[id] === 'out';
const availableRoster = () => roster.filter(p => !isOut(p.player_id));
const nameOf = id => { const p = player(id); return p ? `${p.first_name} ${p.last_name}` : '?'; };

/** First name alone, unless the roster has more than one — then add the last initial. */
function shortName(p) {
  const dupes = roster.filter(o => o.first_name === p.first_name).length > 1;
  return dupes ? `${p.first_name} ${(p.last_name || '')[0] || ''}.` : p.first_name;
}

// ---------------------------------------------------------------- pitch
function pitchSvg() {
  const slots = formation.slots.map(slot => {
    const pid = assignments[slot.code];
    const p = pid ? player(pid) : null;
    const cx = slot.x * 100, cy = (1 - slot.y) * 100;   // y flips: attack upward
    const cls = ['slot', p ? 'filled' : 'open', picked ? 'targetable' : ''].join(' ');
    const nameY = slot.y < 0.15 ? 18.4 : -10.6;   // bottom row has no room above
    return `
      <g class="${cls}" data-slot="${slot.code}" transform="translate(${cx} ${cy})" role="button" tabindex="0"
         aria-label="${esc(slot.code)}${p ? `, ${esc(nameOf(pid))}` : ', empty'}">
        <circle class="bubble" r="7.4"></circle>
        <text class="ini" y="0.4">${p ? esc(initials(p)) : '+'}</text>
        <text class="pos" y="12.9">${esc(slot.code)}</text>
        ${p ? `<text class="who" y="${nameY}">${esc(shortName(p))}</text>` : ''}
      </g>`;
  }).join('');

  return `
  <svg viewBox="${PITCH_VIEWBOX}" class="pitch-svg" xmlns="http://www.w3.org/2000/svg">
    ${pitchMarkings()}
    <text x="50" y="-2.6" class="goal-label">attacking</text>
    ${slots}
  </svg>`;
}

function drawPitch() {
  $('pitch').innerHTML = pitchSvg();
  $('shape').textContent = formation.code;
  $('fnote').textContent = `${formation.name} · ${formation.note} · ${formation.slots.length} on the field`;
}

function drawBench() {
  const onField = new Set(Object.values(assignments));
  const bench = availableRoster().filter(p => !onField.has(p.player_id));
  const out = roster.filter(p => isOut(p.player_id));
  $('bench-count').textContent = bench.length ? `${bench.length}` : '';

  const outHtml = out.length ? `
    <div class="out-strip">
      <span class="out-label">Unavailable</span>
      ${out.map(p => `<span class="chip player-chip out">${esc(initials(p))} · ${esc(p.first_name)}</span>`).join('')}
      ${eventSel() ? `<a class="chip small" href="../attendance/index.html?event=${encodeURIComponent(eventSel())}">Edit check-in</a>` : ''}
    </div>` : '';

  if (!roster.length) { $('bench').innerHTML = '<p class="empty">No players on this roster.</p>'; return; }
  if (!bench.length) { $('bench').innerHTML = `<p class="empty">Everyone available is on the pitch.</p>${outHtml}`; return; }

  $('bench').innerHTML = bench.map(p => {
    const pos = [p.position_1, p.position_2].filter(Boolean).join(' / ');
    return `
      <button type="button" class="chip player-chip${picked === p.player_id ? ' picked' : ''}" data-player="${p.player_id}">
        <span class="ini-badge">${esc(initials(p))}</span>
        <span class="pc-name">${esc(p.first_name)} ${esc((p.last_name || '')[0] || '')}.</span>
        ${pos ? `<span class="pc-pos">${esc(pos)}</span>` : ''}
        ${unavailable[p.player_id] === 'maybe' ? '<span class="pc-maybe">maybe</span>' : ''}
        ${p.skill ? `<span class="pc-skill">${p.skill}</span>` : ''}
      </button>`;
  }).join('') + outHtml;
}

const eventSel = () => $('event').value || null;

/** Pull availability for the selected game and drop anyone marked out. */
async function loadAvailability() {
  unavailable = {};
  const id = eventSel();
  if (id) {
    try { unavailable = await coachCall('coach_attendance_out', { p_event_id: id }); }
    catch (err) { console.warn('attendance unavailable:', err.message); }
  }
  for (const [slot, pid] of Object.entries(assignments)) if (isOut(pid)) delete assignments[slot];
  draw();
}

function draw() { drawPitch(); drawBench(); }

// ---------------------------------------------------------------- interaction
$('pitch').addEventListener('click', e => {
  const g = e.target.closest('[data-slot]');
  if (!g) return;
  const slot = g.dataset.slot;
  if (picked) {
    for (const [s, pid] of Object.entries(assignments)) if (pid === picked) delete assignments[s];
    assignments[slot] = picked;
    picked = null;
  } else if (assignments[slot]) {
    delete assignments[slot];                    // tap a filled spot -> back to the bench
  }
  draw();
});
$('pitch').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.closest('[data-slot]')?.dispatchEvent(new Event('click', { bubbles: true })); }
});
$('bench').addEventListener('click', e => {
  const b = e.target.closest('[data-player]');
  if (!b) return;
  picked = picked === b.dataset.player ? null : b.dataset.player;
  draw();
});

/** Squad size decides which formations are even offered. */
function drawSizes() {
  const size = team.squad_size || 7;
  $('squad-size').innerHTML = SQUAD_SIZES.map(n =>
    `<option value="${n}"${n === size ? ' selected' : ''}>${n} a side</option>`).join('');
  drawFormationOptions(size);
}

function drawFormationOptions(size) {
  const list = formationsForSize(size);
  $('formation').innerHTML = list.map(f =>
    `<option value="${f.code}">${esc(f.name)} — ${esc(f.note)}</option>`).join('');
  if (!list.some(f => f.code === formation.code)) {
    const next = list[0];
    const res = remapFormation(availableRoster(), assignments, next);
    formation = next;
    assignments = res.assignments;
  }
  $('formation').value = formation.code;
}

$('squad-size').addEventListener('change', async () => {
  const size = Number($('squad-size').value);
  drawFormationOptions(size);
  picked = null;
  draw();
  syncPrintLink();
  try { await coachCall('coach_set_squad_size', { p_team_id: team.id, p_size: size }); team.squad_size = size; }
  catch (err) { console.warn('squad size not saved:', err.message); }
});

function syncPrintLink() {
  const l = $('print-link');
  if (!l || !team) return;
  const u = new URL(l.href, location.href);
  u.searchParams.set('formation', formation.code);
  l.href = u.pathname + u.search;
}

$('event').addEventListener('change', () => { loadAvailability(); syncCheckinLink(); });

function syncCheckinLink() {
  const a = $('checkin-link');
  if (!a) return;
  const id = eventSel();
  a.hidden = !id;
  if (id) a.href = `../attendance/index.html?event=${encodeURIComponent(id)}`;
}

$('formation').addEventListener('change', () => {
  const next = getFormation($('formation').value);
  const res = remapFormation(availableRoster(), assignments, next);   // carry players across the shape change
  formation = next;
  assignments = res.assignments;
  picked = null;
  draw();
  syncPrintLink();
});
$('autofill').addEventListener('click', () => {
  assignments = autoAssign(availableRoster(), formation).assignments;
  picked = null;
  draw();
});
$('clear').addEventListener('click', () => { assignments = {}; picked = null; draw(); });

// ---------------------------------------------------------------- saving
$('save').addEventListener('click', async () => {
  const msg = $('save-msg');
  const name = $('lname').value.trim() || defaultName();
  $('lname').value = name;
  msg.textContent = 'Saving…';
  try {
    currentLineupId = await coachCall('coach_lineup_save', {
      p_lineup_id: currentLineupId, p_team_id: team.id,
      p_event_id: $('event').value || null, p_name: name,
      p_formation_code: formation.code, p_slots: assignments,
    });
    msg.textContent = 'Saved';
    setTimeout(() => { if (msg.textContent === 'Saved') msg.textContent = ''; }, 2000);
    await loadSaved();
  } catch (err) { msg.textContent = err.message; }
});

function defaultName() {
  const ev = events.find(e => e.id === $('event').value);
  return ev ? `${formation.code} vs ${ev.opponent || fmtDate(ev.event_date)}` : `${formation.code} lineup`;
}

async function loadSaved() {
  try {
    saved = await coachCall('coach_lineup_list', { p_team_id: team.id });
    $('saved').innerHTML = saved.length ? saved.map(l => `
      <li data-lineup="${l.id}">
        <a href="#" data-act="load">
          <span class="score final ${l.id === currentLineupId ? 'W' : 'T'}">${esc(l.formation_code)}</span>
          <span class="opp">${esc(l.name)}</span>
          <span class="dim">${l.event_date ? `${fmtDate(l.event_date)} vs ${esc(l.opponent || '')}` : 'no game'} · ${l.filled} placed</span>
        </a>
        <button class="del" type="button" data-act="del" aria-label="Delete lineup">×</button>
      </li>`).join('') : '<li class="empty">No saved lineups yet.</li>';
  } catch (err) { $('saved').innerHTML = `<li class="empty">${esc(err.message)}</li>`; }
}

$('saved').addEventListener('click', async e => {
  e.preventDefault();
  const li = e.target.closest('[data-lineup]');
  if (!li) return;
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'del') {
    if (!confirm('Delete this lineup?')) return;
    try {
      await coachCall('coach_lineup_delete', { p_lineup_id: li.dataset.lineup });
      if (currentLineupId === li.dataset.lineup) currentLineupId = null;
      await loadSaved();
    } catch (err) { alert(err.message); }
    return;
  }
  await loadLineup(li.dataset.lineup);
});

async function loadLineup(id) {
  try {
    const l = await coachCall('coach_lineup_get', { p_lineup_id: id });
    formation = getFormation(l.formation_code);
    assignments = { ...l.slots };
    currentLineupId = l.id;
    $('formation').value = formation.code;
    $('event').value = l.event_id || '';
    $('lname').value = l.name;
    picked = null;
    syncCheckinLink();
    await loadAvailability();
    draw(); loadSaved();
    $('pitch').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) { alert(err.message); }
}

// ---------------------------------------------------------------- init
function showGate() {
  const unlocked = isUnlocked();
  $('gate').hidden = unlocked;
  $('builder').hidden = !unlocked;
  if (unlocked && team) refreshCoachData();
}

async function refreshCoachData() {
  try {
    roster = await coachCall('coach_get_roster', { p_team_id: team.id });
    await loadAvailability();
    syncCheckinLink();
    if (!Object.keys(assignments).length) assignments = autoAssign(availableRoster(), formation).assignments;
    draw();
    await loadSaved();
    if (currentLineupId) await loadLineup(currentLineupId);
  } catch (err) {
    $('bench').innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

async function init() {
  mountCoachToggle($('coach-slot'));
  if (!isConfigured) { setStatus($('status'), 'Not configured', 'err'); return; }
  if (!teamSlug) { setStatus($('status'), 'No team', 'err'); $('title').textContent = 'Missing ?team= in the URL'; return; }


  try {
    [team] = await sb(`teams?slug=eq.${encodeURIComponent(teamSlug)}&select=*`);
    if (!team) throw new Error(`No team with slug "${teamSlug}".`);
    applyClub(team.slug);
    drawSizes();
    mountNav({ active: 'lineup', teamSlug: team.slug, eventId: params.get('event') || '' });
    setStatus($('status'), 'Connected', 'ok');
    $('title').textContent = `${team.name} Lineup`;
    document.title = `${team.name} Lineup — Dynasty Soccer`;
    $('meta').textContent = [team.season, team.age_group].filter(Boolean).join(' · ');
    $('team-link').textContent = team.name;
    $('team-link').href = $('back').href = `../teams/${encodeURIComponent(team.slug)}/index.html`;
    $('print-link').href = `print.html?team=${encodeURIComponent(team.slug)}&heading=${encodeURIComponent([team.name, team.age_group].filter(Boolean).join(' · '))}`;

    events = await sb(`events?team_id=eq.${team.id}&event_type=in.(game,training_game)&select=id,event_date,opponent&order=event_date.asc`);
    $('event').innerHTML = '<option value="">— no game (general lineup) —</option>' + events.map(e =>
      `<option value="${e.id}">${fmtDate(e.event_date)} vs ${esc(e.opponent || 'TBD')}</option>`).join('');
    if (params.get('event')) $('event').value = params.get('event');

    draw();
    onChange(showGate);
    showGate();
  } catch (err) {
    console.error(err);
    setStatus($('status'), 'Connection failed', 'err');
    $('title').textContent = err.message;
  }
}
init();
