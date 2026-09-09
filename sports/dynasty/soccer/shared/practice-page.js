// Dynasty Soccer — practice plan builder (?team=<slug>[&event=<uuid>][&plan=<uuid>]).
// A plan is an ordered array of blocks: drill references and free text, held in `items`.
import { sb, esc, setStatus, isConfigured, applyClub } from './db.js';
import { fmtDate } from './schedule.js';
import { mountCoachToggle, isUnlocked, onChange, coachCall } from './coach.js';
import { loadDrills, filterDrills, label, QUICK_SPECIALTIES, findDrill } from './drills.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const teamSlug = params.get('team');

let team = null, drills = [], events = [], items = [], quick = '';
let currentPlanId = params.get('plan') || null;

const totalMinutes = () => items.reduce((n, b) => n + (Number(b.minutes) || 0), 0);

// ---------------------------------------------------------------- plan list
function renderPlan() {
  $('block-count').textContent = items.length ? `${items.length} block${items.length === 1 ? '' : 's'}` : '';
  $('total').textContent = totalMinutes() ? `${totalMinutes()} min total` : '';

  if (!items.length) {
    $('plan').innerHTML = '<li class="empty">Nothing added yet. Browse drills and press + to build the session.</li>';
    return;
  }

  $('plan').innerHTML = items.map((b, i) => {
    const d = b.type === 'drill' ? findDrill(drills, b.drill_id) : null;
    const head = b.type === 'drill'
      ? `<span class="bt">${esc(b.title || d?.title || 'Drill')}</span>
         ${d ? `<span class="mini">${esc(d.difficulty)}</span><span class="mini">${esc(d.ageRange)}</span>` : '<span class="mini warn">not in library</span>'}`
      : `<input class="bt-input" data-f="title" value="${esc(b.title || '')}" placeholder="Block title" aria-label="Block title">`;

    const body = b.type === 'drill'
      ? `${d ? `<p class="bsum">${esc(d.summary)}</p>` : ''}
         <textarea data-f="note" rows="1" placeholder="Your coaching note for this drill…">${esc(b.note || '')}</textarea>
         ${d ? `<p class="bmeta"><strong>Cues:</strong> ${esc((d.coachingCues || []).join(' · '))} &nbsp;·&nbsp;
                <strong>Gear:</strong> ${esc((d.equipment || []).join(', '))}
                ${d.sourceUrl ? ` &nbsp;·&nbsp; <a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener">source</a>` : ''}</p>` : ''}`
      : `<textarea data-f="body" rows="2" placeholder="What happens in this block…">${esc(b.body || '')}</textarea>`;

    return `
      <li class="plan-item ${b.type}" data-i="${i}">
        <div class="bnum">${i + 1}</div>
        <div class="bmain">
          <div class="bhead">${head}
            <span class="spacer"></span>
            <label class="mins">
              <input type="number" min="0" max="180" step="1" data-f="minutes" value="${b.minutes ?? ''}" aria-label="Minutes"> min
            </label>
          </div>
          ${body}
        </div>
        <div class="bctl">
          <button type="button" data-act="up"   title="Move up"   aria-label="Move up"   ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" data-act="down" title="Move down" aria-label="Move down" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" data-act="del"  title="Remove"    aria-label="Remove">×</button>
        </div>
      </li>`;
  }).join('');
  if (drills.length) renderBrowse();
}

$('plan').addEventListener('click', e => {
  const li = e.target.closest('.plan-item');
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (!li || !act) return;
  const i = Number(li.dataset.i);
  if (act === 'up' && i > 0) [items[i - 1], items[i]] = [items[i], items[i - 1]];
  if (act === 'down' && i < items.length - 1) [items[i + 1], items[i]] = [items[i], items[i + 1]];
  if (act === 'del') items.splice(i, 1);
  renderPlan();
});

// Edits are kept in the model as you type; only Save writes to the database.
$('plan').addEventListener('input', e => {
  const li = e.target.closest('.plan-item');
  const f = e.target.dataset.f;
  if (!li || !f) return;
  const b = items[Number(li.dataset.i)];
  b[f] = f === 'minutes' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value;
  if (f === 'minutes') $('total').textContent = totalMinutes() ? `${totalMinutes()} min total` : '';
  if (e.target.tagName === 'TEXTAREA') { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }
});

function addBlock(b) { items.push(b); renderPlan(); $('plan').lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
$('add-text').addEventListener('click', () => addBlock({ type: 'text', title: '', body: '', minutes: null }));
$('add-break').addEventListener('click', () => addBlock({ type: 'text', title: 'Water break', body: '', minutes: 3 }));

// ---------------------------------------------------------------- drill browser
function renderBrowse() {
  const list = filterDrills(drills, {
    q: $('search').value, difficulty: $('difficulty').value, specialty: quick,
  });
  // how many times each drill is already in the session
  const used = {};
  for (const b of items) if (b.type === 'drill') used[b.drill_id] = (used[b.drill_id] || 0) + 1;
  $('browse-count').textContent = `${list.length} of ${drills.length}`;
  $('browse').innerHTML = list.length ? list.map(d => `
    <article class="browse-item${used[d.id] ? ' in-plan' : ''}">
      <button class="add-btn" type="button" data-add="${esc(d.id)}" title="Add to plan" aria-label="Add ${esc(d.title)} to plan">+</button>
      <div>
        <h3>${esc(d.title)}${used[d.id] ? `<span class="in-badge">in plan${used[d.id] > 1 ? ` ×${used[d.id]}` : ''}</span>` : ''}</h3>
        <p>${esc(d.summary)}</p>
        <div class="drill-meta">
          <span class="mini level-${esc(d.difficulty)}">${esc(d.difficulty)}</span>
          <span class="mini">${esc(d.durationMinutes)} min</span>
          <span class="mini">${esc(d.players)}</span>
          ${(d.specialties || []).slice(0, 3).map(t => `<span class="mini">${esc(label(t))}</span>`).join('')}
        </div>
      </div>
    </article>`).join('') : '<p class="empty">No drills match those filters.</p>';
  for (const b of $('quick').querySelectorAll('button')) b.classList.toggle('on', b.dataset.q === quick);
}

$('browse').addEventListener('click', e => {
  const id = e.target.closest('[data-add]')?.dataset.add;
  if (!id) return;
  const d = findDrill(drills, id);
  if (!d) return;
  addBlock({ type: 'drill', drill_id: d.id, title: d.title, minutes: d.durationMinutes ?? null, note: '' });
});
$('quick').addEventListener('click', e => {
  const b = e.target.closest('button[data-q]');
  if (!b) return;
  quick = b.dataset.q;
  renderBrowse();
});
for (const el of ['search', 'difficulty']) $(el).addEventListener('input', renderBrowse);

// ---------------------------------------------------------------- printing
function printDoc() {
  const when = $('pdate').value ? fmtDate($('pdate').value) : '';
  const rows = items.map((b, i) => {
    const d = b.type === 'drill' ? findDrill(drills, b.drill_id) : null;
    const detail = b.type === 'drill'
      ? `${d ? `<p>${esc(d.summary)}</p>` : ''}
         ${b.note ? `<p class="pnote"><strong>Note:</strong> ${esc(b.note)}</p>` : ''}
         ${d ? `<p class="pmeta"><strong>Cues:</strong> ${esc((d.coachingCues || []).join(' · '))}<br>
                <strong>Gear:</strong> ${esc((d.equipment || []).join(', '))} &nbsp;·&nbsp; ${esc(d.players)} &nbsp;·&nbsp; ${esc(d.fieldSize || '')}</p>` : ''}`
      : (b.body ? `<p>${esc(b.body).replace(/\n/g, '<br>')}</p>` : '');
    return `<tr>
      <td class="pn">${i + 1}</td>
      <td class="pm">${b.minutes ? `${b.minutes}′` : ''}</td>
      <td class="pd"><div class="pt">${esc(b.title || (d ? d.title : 'Block'))}</div>${detail}</td>
      <td class="pk"></td>
    </tr>`;
  }).join('');

  $('print-doc').innerHTML = `
    <div class="paper">
      <div class="doc-head">
        <div><div class="doc-title">${esc($('pname').value || 'Practice Plan')}</div>
             <div class="doc-sub">${esc(team?.name || '')}${when ? ` · ${esc(when)}` : ''}${totalMinutes() ? ` · ${totalMinutes()} min` : ''}</div></div>
      </div>
      ${$('pnotes').value.trim() ? `<p class="doc-notes">${esc($('pnotes').value)}</p>` : ''}
      <table class="doc-table">
        <thead><tr><th class="pn">#</th><th class="pm">Time</th><th class="pd">Block</th><th class="pk">✓</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">Empty plan.</td></tr>'}</tbody>
      </table>
    </div>`;
}
$('print').addEventListener('click', () => { printDoc(); window.print(); });

// ---------------------------------------------------------------- saving
$('save').addEventListener('click', async () => {
  const msg = $('save-msg');
  const name = $('pname').value.trim() || defaultName();
  $('pname').value = name;
  msg.textContent = 'Saving…';
  try {
    currentPlanId = await coachCall('coach_practice_save', {
      p_plan_id: currentPlanId, p_team_id: team.id, p_event_id: $('event').value || null,
      p_name: name, p_plan_date: $('pdate').value || null, p_notes: $('pnotes').value || null,
      p_items: items,
    });
    msg.textContent = 'Saved';
    setTimeout(() => { if (msg.textContent === 'Saved') msg.textContent = ''; }, 2000);
    await loadSaved();
  } catch (err) { msg.textContent = err.message; }
});

function defaultName() {
  return $('pdate').value ? `Practice — ${fmtDate($('pdate').value)}` : 'Practice plan';
}

async function loadSaved() {
  try {
    const plans = await coachCall('coach_practice_list', { p_team_id: team.id });
    $('saved').innerHTML = plans.length ? plans.map(p => `
      <li data-plan="${p.id}">
        <a href="#" data-act="load">
          <span class="score final ${p.id === currentPlanId ? 'W' : 'T'}">${p.minutes || 0}′</span>
          <span class="opp">${esc(p.name)}</span>
          <span class="dim">${p.plan_date ? fmtDate(p.plan_date) : 'no date'} · ${p.block_count} block${p.block_count === 1 ? '' : 's'}</span>
        </a>
        <button class="del" type="button" data-act="del" aria-label="Delete plan">×</button>
      </li>`).join('') : '<li class="empty">No saved plans yet.</li>';
  } catch (err) { $('saved').innerHTML = `<li class="empty">${esc(err.message)}</li>`; }
}

$('saved').addEventListener('click', async e => {
  e.preventDefault();
  const li = e.target.closest('[data-plan]');
  if (!li) return;
  if (e.target.closest('[data-act]')?.dataset.act === 'del') {
    if (!confirm('Delete this practice plan?')) return;
    try {
      await coachCall('coach_practice_delete', { p_plan_id: li.dataset.plan });
      if (currentPlanId === li.dataset.plan) currentPlanId = null;
      await loadSaved();
    } catch (err) { alert(err.message); }
    return;
  }
  await loadPlan(li.dataset.plan);
});

async function loadPlan(id) {
  try {
    const p = await coachCall('coach_practice_get', { p_plan_id: id });
    currentPlanId = p.id;
    items = Array.isArray(p.items) ? p.items : [];
    $('pname').value = p.name || '';
    $('pdate').value = p.plan_date || '';
    $('pnotes').value = p.notes || '';
    $('event').value = p.event_id || '';
    renderPlan(); loadSaved();
    $('plan').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) { alert(err.message); }
}

// ---------------------------------------------------------------- init
function showGate() {
  const unlocked = isUnlocked();
  $('gate').hidden = unlocked;
  $('builder').hidden = !unlocked;
  if (unlocked && team) { loadSaved(); if (currentPlanId) loadPlan(currentPlanId); }
}

async function init() {
  mountCoachToggle($('coach-slot'));
  if (!isConfigured) { setStatus($('status'), 'Not configured', 'err'); return; }
  if (!teamSlug) { setStatus($('status'), 'No team', 'err'); $('title').textContent = 'Missing ?team= in the URL'; return; }

  $('quick').innerHTML = [`<button class="chip on" type="button" data-q="">All</button>`,
    ...QUICK_SPECIALTIES.map(s => `<button class="chip" type="button" data-q="${s}">${esc(label(s))}</button>`)].join('');

  try {
    [team] = await sb(`teams?slug=eq.${encodeURIComponent(teamSlug)}&select=*`);
    if (!team) throw new Error(`No team with slug "${teamSlug}".`);
    applyClub(team.slug);
    setStatus($('status'), 'Connected', 'ok');
    $('title').textContent = `${team.name} Practice`;
    document.title = `${team.name} Practice Plan — Dynasty Soccer`;
    $('meta').textContent = [team.season, team.age_group].filter(Boolean).join(' · ');
    $('team-link').textContent = team.name;
    $('team-link').href = $('back').href = `../teams/${encodeURIComponent(team.slug)}/index.html`;

    const db = await loadDrills('..');
    drills = db.drills || [];
    renderBrowse();

    events = await sb(`events?team_id=eq.${team.id}&event_type=in.(practice,training_game)&select=id,event_date,location&order=event_date.asc`);
    $('event').innerHTML = '<option value="">— not tied to a session —</option>' + events.map(e =>
      `<option value="${e.id}">${fmtDate(e.event_date)}${e.location ? ` · ${esc(e.location)}` : ''}</option>`).join('');
    $('event').addEventListener('change', () => {
      const ev = events.find(x => x.id === $('event').value);
      if (ev && !$('pdate').value) $('pdate').value = ev.event_date;
    });
    if (params.get('event')) {
      $('event').value = params.get('event');
      $('event').dispatchEvent(new Event('change'));
    }

    renderPlan();
    onChange(showGate);
    showGate();
  } catch (err) {
    console.error(err);
    setStatus($('status'), 'Connection failed', 'err');
    $('title').textContent = err.message;
  }
}
init();
