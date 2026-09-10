// Dynasty Soccer — live match page (?event=<uuid>).
// Read-only scoreboard for anyone; clock, goals and finalize need coach mode.
import { sb, esc, setStatus, isConfigured, applyClub } from './db.js';
import { fmtDate, fmtTime } from './schedule.js';
import { mountCoachToggle, isUnlocked, onChange, coachCall } from './coach.js';
import { mountNav } from './nav.js';

const $ = id => document.getElementById(id);
const eventId = new URLSearchParams(location.search).get('event');
let event = null, team = null, match = null, roster = [], sheetSide = null, tick = null, poll = null;

const HALF = { 1: '1st half', 2: '2nd half', 3: 'Full time' };
const pad = n => String(n).padStart(2, '0');
const mmss = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const fullName = p => `${p.first_name} ${p.last_name}`;
const initials = p => `${(p.first_name || '?')[0]}${(p.last_name || '')[0] || ''}`.toUpperCase();
const shortName = p => {
  const dupes = roster.filter(o => o.players.first_name === p.first_name).length > 1;
  return dupes ? `${p.first_name} ${(p.last_name || '')[0] || ''}.` : p.first_name;
};
const nameOf = id => { const p = roster.find(r => r.players.id === id); return p ? fullName(p.players) : '?'; };

/** Seconds elapsed inside the current half. */
function elapsedNow() {
  if (!match) return 0;
  let s = match.period_elapsed_before;
  if (match.period_started_at) s += Math.max(0, Math.floor((Date.now() - new Date(match.period_started_at)) / 1000));
  return s;
}

/**
 * Seconds since kickoff, the way a real match clock reads: the second half
 * continues from the end of the first (20:00 → 40:00 on 20-minute halves)
 * rather than restarting at zero. Goals are still STORED as elapsed-within-half,
 * which stays correct even if the half length is ever changed.
 */
function halfOffset(period) {
  return Math.min(Math.max(period - 1, 0), 2) * (match?.half_length_sec ?? 1200);
}
const matchClockNow = () => halfOffset(match?.period ?? 1) + elapsedNow();
const goalMinute = g => halfOffset(g.period) + g.elapsed_sec;

// ---------------------------------------------------------------- render
function drawClock() {
  const running = !!match?.period_started_at;
  const s = elapsedNow();
  $('clock').textContent = mmss(matchClockNow());
  $('clock').classList.toggle('over', !!match && match.period < 3 && s >= match.half_length_sec);
  $('clock').classList.toggle('running', running);
}

/** "23:12 (+3:12)" — actual length of a half, and how far over or under the scheduled one. */
function halfLine(label, sec) {
  if (sec == null) return '';
  const diff = sec - (match?.half_length_sec ?? 1200);
  const sign = diff === 0 ? '' : diff > 0 ? '+' : '−';
  const drift = diff === 0 ? 'on time' : `${sign}${mmss(Math.abs(diff))}`;
  const cls = Math.abs(diff) <= 60 ? 'ok' : 'off';
  return `<span class="half-stat"><b>${label}</b> ${mmss(sec)} <em class="${cls}">${drift}</em></span>`;
}

function drawTiming() {
  const el = $('timing');
  if (!el) return;
  const parts = [halfLine('1st half', match?.period1_sec), halfLine('2nd half', match?.period2_sec)]
    .filter(Boolean);
  if (match?.period1_sec != null && match?.period2_sec != null) {
    parts.push(`<span class="half-stat"><b>Played</b> ${mmss(match.period1_sec + match.period2_sec)}</span>`);
  }
  el.innerHTML = parts.join('');
  el.hidden = !parts.length;
}

function draw() {
  $('us-name').textContent = team.name;
  $('them-name').textContent = event.opponent || 'Opponent';
  $('us-score').textContent = match?.our_score ?? 0;
  $('them-score').textContent = match?.their_score ?? 0;
  const status = !match ? 'Not started' : match.status === 'final' ? 'Final' : HALF[match.period];
  $('period').textContent = status;
  $('state').textContent = !match ? '' : match.status === 'final' ? '' : match.period_started_at ? 'clock running' : match.period < 3 ? 'paused' : '';
  drawClock();
  drawTiming();
  drawGoals();
  drawControls();
  clearInterval(tick);
  if (match?.period_started_at) tick = setInterval(drawClock, 500);
}

function drawGoals() {
  const goals = [...(match?.goals || [])].sort((a, b) => a.period - b.period || a.elapsed_sec - b.elapsed_sec);
  if (!goals.length) { $('goals').innerHTML = '<li class="empty">No goals yet.</li>'; return; }
  $('goals').innerHTML = goals.map(g => {
    const who = g.side === 'us'
      ? (g.own_goal ? `Own goal (${esc(event.opponent || 'opp')})` : g.scorer_id ? esc(nameOf(g.scorer_id)) : 'Unknown scorer')
      : (g.own_goal ? `Own goal${g.scorer_id ? ` by ${esc(nameOf(g.scorer_id))}` : ''}` : esc(event.opponent || 'Opponent'));
    const assist = g.side === 'us' && g.assist_id ? `<span class="dim">assist ${esc(nameOf(g.assist_id))}</span>` : '';
    return `<li class="${g.side}" data-goal="${g.id}">
      <span class="gtime">${g.period === 2 ? '2H' : '1H'} ${mmss(goalMinute(g))}</span>
      <span class="gside">${g.side === 'us' ? esc(team.name) : esc(event.opponent || 'Opponent')}</span>
      <span class="gwho">${who}</span> ${assist}
      ${isUnlocked() && match.status !== 'final' ? `<button class="g-edit" type="button" data-edit="${g.id}" title="Edit scorer or assist" aria-label="Edit goal">✎</button>
         <button class="del" type="button" title="Delete goal" aria-label="Delete goal">×</button>` : ''}
    </li>`;
  }).join('');
}

/** 5 … 60 minutes in 5-minute steps. */
function halfPicker(currentSec, disabled) {
  const opts = [];
  for (let m = 5; m <= 60; m += 5) {
    opts.push(`<option value="${m * 60}"${m * 60 === currentSec ? ' selected' : ''}>${m} min</option>`);
  }
  return `<label class="half-pick${disabled ? ' dim' : ''}">Half length
    <select id="half-len" ${disabled ? 'disabled' : ''}>${opts.join('')}</select>
  </label>`;
}

function drawControls() {
  const c = $('controls');
  if (!isUnlocked()) { c.hidden = true; return; }
  c.hidden = false;
  if (!team.live_scoring) { c.innerHTML = '<p class="hint">Live scoring is turned off for this team.</p>'; return; }
  if (!match) {
    // One tap from a nav jump to a running clock — the whistle does not wait.
    c.innerHTML = `<div class="btn-row">${halfPicker(team.half_length_sec ?? 1200, false)}
      <button class="big-btn go" data-act="kickoff">▶ Start match</button>
      <button class="chip" data-act="open">Open without starting</button></div>`;
    return;
  }
  if (match.status === 'final') {
    c.innerHTML = `<button class="chip" data-act="reopen">Reopen match</button>`;
    return;
  }
  const running = !!match.period_started_at, ft = match.period >= 3;
  c.innerHTML = `
    <div class="btn-row">
      ${ft ? '' : `<button class="big-btn ${running ? '' : 'go'}" data-act="${running ? 'pause' : 'start'}">${running ? 'Pause' : match.period_elapsed_before ? 'Resume' : `Start ${HALF[match.period]}`}</button>`}
      ${ft ? '' : `<button class="chip" data-act="end_period">End ${HALF[match.period]}</button>`}
    </div>
    <div class="btn-row goals-row">
      <button class="big-btn goal us" data-act="goal-us">⚽ Goal · ${esc(team.name)}</button>
      <button class="big-btn goal them" data-act="goal-them">Goal · ${esc(event.opponent || 'Opponent')}</button>
    </div>
    <div class="btn-row">
      <button class="chip on" data-act="finalize">Finalize result</button>
      ${halfPicker(match.half_length_sec, false)}
      <span class="spacer"></span>
      <button class="chip danger" data-act="reset">Reset match</button>
    </div>`;
}

// ---------------------------------------------------------------- goal entry
// The goal row is written the instant the button is tapped, so the score is right
// immediately and nothing can be stranded half-entered. Picking a scorer amends
// that row; walking away leaves a valid, saved goal with an unknown scorer.
let pendingGoalId = null;      // the goal currently offered for naming
let editingGoalId = null;      // an older goal being amended

function playerTiles(extra = []) {
  return roster.map(r => `<button type="button" class="pick-tile" data-pick="${r.players.id}">
      <span class="pick-ini">${esc(initials(r.players))}</span>
      <span class="pick-nm">${esc(shortName(r.players))}</span>
    </button>`).join('') +
    extra.map(x => `<button type="button" class="pick-tile alt" data-pick="${x.v}">
      <span class="pick-ini">${x.icon}</span><span class="pick-nm">${esc(x.label)}</span></button>`).join('');
}

function openScorerSheet(goalId, { editing = false } = {}) {
  pendingGoalId = editing ? null : goalId;
  editingGoalId = editing ? goalId : null;
  const g = (match.goals || []).find(x => x.id === goalId);
  $('sheet-title').textContent = editing ? 'Change scorer' : `Goal · ${team.name} — who scored?`;
  $('sheet-body').innerHTML = `
    <div class="pick-grid">${playerTiles([
      { v: '', icon: '?', label: 'Unknown' },
      { v: 'og', icon: '⚽', label: 'Own goal' },
    ])}</div>
    ${editing ? `<div class="pick-assist">
      <label>Assist
        <select id="assist-sel">
          <option value="">— none —</option>
          ${roster.map(r => `<option value="${r.players.id}"${g?.assist_id === r.players.id ? ' selected' : ''}>${esc(fullName(r.players))}</option>`).join('')}
        </select>
      </label>
      <button class="chip on" type="button" id="save-assist">Save assist</button>
    </div>` : `<p class="hint">Tap a name to log it. The goal is already counted — you can add an assist later.</p>`}`;
  $('goal-sheet').hidden = false;
  $('goal-sheet').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeSheet() {
  $('goal-sheet').hidden = true;
  pendingGoalId = null;
  editingGoalId = null;
}
$('sheet-cancel').addEventListener('click', closeSheet);

$('goal-sheet').addEventListener('click', async e => {
  const pick = e.target.closest('[data-pick]');
  if (pick) {
    const v = pick.dataset.pick;
    const id = pendingGoalId || editingGoalId;
    if (!id) return closeSheet();
    const g = (match.goals || []).find(x => x.id === id);
    try {
      await coachCall('coach_goal_update', {
        p_goal_id: id,
        p_scorer_id: v && v !== 'og' ? v : null,
        p_assist_id: g?.assist_id || null,
        p_own_goal: v === 'og',
      });
      closeSheet();
      await refresh();
    } catch (err) { alert(err.message); }
    return;
  }
  if (e.target.id === 'save-assist') {
    const g = (match.goals || []).find(x => x.id === editingGoalId);
    try {
      await coachCall('coach_goal_update', {
        p_goal_id: editingGoalId,
        p_scorer_id: g?.scorer_id || null,
        p_assist_id: $('assist-sel').value || null,
        p_own_goal: !!g?.own_goal,
      });
      closeSheet();
      await refresh();
    } catch (err) { alert(err.message); }
  }
});

/** Record a goal straight away, then offer the scorer picker for our own goals. */
async function addGoal(side) {
  closeSheet();                       // moving on: never leave a stale picker open
  try {
    const g = await coachCall('coach_goal_add', {
      p_match_id: match.id, p_side: side,
      p_scorer_id: null, p_assist_id: null, p_own_goal: false,
    });
    await refresh();
    if (side === 'us') openScorerSheet(g.id);
  } catch (err) { alert(err.message); }
}

// ---------------------------------------------------------------- actions
$('controls').addEventListener('change', async e => {
  if (e.target.id !== 'half-len') return;
  const seconds = Number(e.target.value);
  try {
    await coachCall('coach_set_half_length', {
      p_match_id: match ? match.id : null,
      p_team_id: match ? null : team.id,
      p_seconds: seconds,
    });
    if (match) match.half_length_sec = seconds; else team.half_length_sec = seconds;
    draw();
  } catch (err) { alert(err.message); e.target.value = (match ? match.half_length_sec : team.half_length_sec); }
});

$('controls').addEventListener('click', async e => {
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (!act) return;
  try {
    if (act === 'open') { await coachCall('coach_match_open', { p_event_id: eventId }); }
    else if (act === 'kickoff') {
      const id = await coachCall('coach_match_open', { p_event_id: eventId });
      await coachCall('coach_match_clock', { p_match_id: id, p_action: 'start' });
    }
    else if (act === 'start' || act === 'pause') { await coachCall('coach_match_clock', { p_match_id: match.id, p_action: act }); }
    else if (act === 'end_period') {
      if (!confirm(`End the ${HALF[match.period]}?`)) return;
      await coachCall('coach_match_clock', { p_match_id: match.id, p_action: 'end_period' });
    }
    else if (act === 'goal-us') { await addGoal('us'); return; }
    else if (act === 'goal-them') { await addGoal('them'); return; }
    else if (act === 'finalize') {
      if (!confirm(`Finalize ${team.name} ${match.our_score}–${match.their_score} ${event.opponent || ''}? This records the result.`)) return;
      await coachCall('coach_match_finalize', { p_match_id: match.id });
    }
    else if (act === 'reopen') { await coachCall('coach_match_reopen', { p_match_id: match.id }); }
    else if (act === 'reset') {
      if (!confirm('Delete this match and all its goals?')) return;
      if (!confirm('Really reset? This cannot be undone.')) return;
      await coachCall('coach_match_reset', { p_match_id: match.id });
    }
    await refresh();
  } catch (err) { alert(err.message); }
});
$('goals').addEventListener('click', async e => {
  const ed = e.target.closest('[data-edit]');
  if (ed) { openScorerSheet(ed.dataset.edit, { editing: true }); return; }
  const del = e.target.closest('.del');
  if (!del) return;
  if (!confirm('Delete this goal?')) return;
  try { await coachCall('coach_goal_delete', { p_goal_id: del.closest('li').dataset.goal }); await refresh(); }
  catch (err) { alert(err.message); }
});

// ---------------------------------------------------------------- data
async function refresh() {
  try {
    [match] = await sb(`matches?event_id=eq.${eventId}&select=*,goals(*)`);
  } catch (err) {
    console.error(err);
    match = null;
    $('state').textContent = /PGRST205|404/.test(err.message) ? 'matches table not set up yet — run the coach-mode migration' : err.message;
    drawScore(); drawControls(); return;
  }
  match = match || null;
  draw();
  window.dispatchEvent(new CustomEvent('dynasty:match-changed'));   // keep the live banner in step
}
function drawScore() {
  $('us-name').textContent = team.name;
  $('them-name').textContent = event.opponent || 'Opponent';
}

async function init() {
  mountCoachToggle($('coach-slot'));
  if (!isConfigured) { setStatus($('status'), 'Not configured', 'err'); return; }
  if (!eventId) { setStatus($('status'), 'No event', 'err'); $('title').textContent = 'Missing ?event= in the URL'; return; }
  try {
    [event] = await sb(`events?id=eq.${eventId}&select=id,event_date,start_time,event_type,opponent,location,teams(*)`);
    if (!event) throw new Error('No such event.');
    team = event.teams; team.live_scoring = team.live_scoring ?? true;
    applyClub(team.slug);
    mountNav({ active: 'score', teamSlug: team.slug, eventId });
    setStatus($('status'), 'Connected', 'ok');
    $('title').textContent = `${team.name} vs ${event.opponent || 'TBD'}`;
    document.title = `${team.name} vs ${event.opponent || 'TBD'} — Dynasty Soccer`;
    $('meta').textContent = [fmtDate(event.event_date), fmtTime(event.start_time), event.location].filter(Boolean).join(' · ');
    $('team-link').textContent = team.name;
    $('team-link').href = $('back').href = `../teams/${encodeURIComponent(team.slug)}/index.html`;
    roster = await sb(`team_players?team_id=eq.${team.id}&select=players(id,first_name,last_name)`);
    roster.sort((a, b) => `${a.players.last_name} ${a.players.first_name}`.localeCompare(`${b.players.last_name} ${b.players.first_name}`));
    await refresh();
    onChange(() => { closeSheet(); draw(); });
    // Spectators: poll so the scoreboard follows the coach's phone.
    poll = setInterval(() => { if (!isUnlocked() && document.visibilityState === 'visible') refresh().catch(() => {}); }, 10000);
  } catch (err) {
    console.error(err);
    setStatus($('status'), 'Connection failed', 'err');
    $('title').textContent = err.message;
  }
}
init();
