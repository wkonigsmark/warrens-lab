// Time Machine — progressive SOS decay + weekly season replay (reads timeline-2025.json).
let DATA, selected = new Set(), curWeek = 0;
const CONF_ACRO = {
  'SEC': 'SEC', 'Big Ten': 'B10', 'Big 12': 'B12', 'ACC': 'ACC', 'Pac-12': 'P12',
  'American Athletic': 'AAC', 'Sun Belt': 'SBC', 'Mountain West': 'MW',
  'Conference USA': 'CUSA', 'Mid-American': 'MAC', 'FBS Independents': 'IND',
};
const sign = v => (v > 0 ? '+' : '') + v;

function whenLabel(w) {
  if (w === 0) return 'Preseason';
  if (w >= DATA.maxWeek) return 'Final / Bowls';
  // 2025 wk1 ≈ Aug 30, +7 days/week
  const d = new Date(2025, 7, 30 + (w - 1) * 7);
  return `Wk ${w} · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

async function boot() {
  try { DATA = await fetch('data/timeline-2025.json').then(r => r.json()); }
  catch {
    document.getElementById('tm-root').innerHTML =
      '<div class="tm-panel"><h3>No timeline yet</h3><p class="sub">Run <code>python3 api/build_timeline.py</code>.</p></div>';
    return;
  }
  curWeek = DATA.maxWeek;
  DATA.decliners.slice(0, 5).forEach(d => selected.add(d.team));
  DATA.risers.slice(0, 2).forEach(d => selected.add(d.team));
  renderShell();
  drawChart();
  updateWeek(curWeek);
}

function renderShell() {
  document.getElementById('tm-root').innerHTML = `
    <div class="tm-scrub">
      <span class="lbl">Time travel to</span>
      <input type="range" id="tm-week" min="0" max="${DATA.maxWeek}" step="1" value="${curWeek}">
      <span class="tm-when" id="tm-when">${whenLabel(curWeek)}</span>
    </div>
    <div class="tm-chartwrap"><div id="tm-chart"></div></div>
    <div class="tm-scrub" style="margin-top:12px">
      <span class="lbl">Add any team</span>
      <input list="tm-teamlist" id="tm-search" placeholder="type a team… e.g. Alabama, Penn State"
        style="flex:1;min-width:200px;background:rgba(0,0,0,.3);border:1px solid var(--glass-border);color:var(--cream);border-radius:8px;padding:8px 12px;">
      <datalist id="tm-teamlist">${Object.keys(DATA.teams).sort().map(t => `<option value="${t}">`).join('')}</datalist>
    </div>
    <p class="index-footnote">${DATA.note} Click a team below (or search above) to add or drop its line.</p>
    <div class="tm-cols">
      <div class="tm-panel">
        <h3>📉 Schedule Deflators</h3>
        <div class="sub">brutal on paper → soft in reality (preseason → final SOS)</div>
        <div id="tm-decliners"></div>
      </div>
      <div class="tm-panel">
        <h3>📈 Schedule Risers</h3>
        <div class="sub">tougher than anyone billed</div>
        <div id="tm-risers"></div>
      </div>
    </div>
    <div class="tm-panel" style="margin-top:12px">
      <h3>🕰️ The Field, as of <span id="tm-asof">${whenLabel(curWeek)}</span></h3>
      <div class="sub">in-season W² rating & record using only games through this point — no look-ahead</div>
      <div id="tm-rankings"></div>
    </div>`;

  document.getElementById('tm-week').addEventListener('input', e => updateWeek(Number(e.target.value)));
  const search = document.getElementById('tm-search');
  search.addEventListener('change', () => {
    const v = search.value.trim();
    if (DATA.teams[v]) { selected.add(v); search.value = ''; drawChart();
      drawBoard('tm-decliners', DATA.decliners); drawBoard('tm-risers', DATA.risers); }
  });
  drawBoard('tm-decliners', DATA.decliners);
  drawBoard('tm-risers', DATA.risers);
}

function drawBoard(id, rows) {
  document.getElementById(id).innerHTML = rows.map(r => {
    const t = DATA.teams[r.team];
    const on = selected.has(r.team);
    const cls = r.swing < 0 ? 'sw-down' : 'sw-up';
    return `<div class="lb-row ${on ? 'on' : ''}" data-team="${r.team}">
      <span class="lb-dot" style="background:${on ? (t.color || '#a97e2f') : 'transparent'};border:1px solid ${t.color || '#a97e2f'}"></span>
      ${t.logo ? `<img class="lb-logo" src="${t.logo}" alt="">` : '<span></span>'}
      <span class="lb-name">${r.team}</span>
      <span class="lb-vals">${r.preseasonIndex}→${r.finalIndex}</span>
      <span class="lb-swing ${cls}">${sign(r.swing)}</span>
    </div>`;
  }).join('');
  document.getElementById(id).querySelectorAll('.lb-row').forEach(el =>
    el.addEventListener('click', () => {
      const tm = el.dataset.team;
      selected.has(tm) ? selected.delete(tm) : selected.add(tm);
      drawBoard('tm-decliners', DATA.decliners);
      drawBoard('tm-risers', DATA.risers);
      drawChart();
    }));
}

function drawChart() {
  const W = 940, H = 420, L = 44, R = 54, T = 20, B = 34;
  const wks = DATA.maxWeek;
  const teams = [...selected].map(t => ({ name: t, ...DATA.teams[t] })).filter(t => t.series);
  const vals = teams.flatMap(t => t.series.map(s => s.sosIndex)).filter(v => v != null);
  const yMin = Math.floor((Math.min(...vals, 95) - 4) / 5) * 5;
  const yMax = Math.ceil((Math.max(...vals, 105) + 4) / 5) * 5;
  const X = w => L + (w / wks) * (W - L - R);
  const Y = v => H - B - ((v - yMin) / (yMax - yMin)) * (H - T - B);

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 10) yTicks.push(v);

  const lines = teams.map(t => {
    const pts = t.series.filter(s => s.sosIndex != null)
      .map(s => `${X(s.week).toFixed(1)},${Y(s.sosIndex).toFixed(1)}`).join(' ');
    const last = t.series[t.series.length - 1];
    const c = t.color || '#a97e2f';
    return `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2.5" opacity="0.9"/>
      ${t.logo ? `<image href="${t.logo}" x="${X(wks) + 3}" y="${Y(last.sosIndex) - 9}" width="18" height="18"/>`
        : `<text x="${X(wks) + 5}" y="${Y(last.sosIndex) + 4}" class="tmt" fill="${c}">${CONF_ACRO[t.conference] || ''}</text>`}`;
  }).join('');

  document.getElementById('tm-chart').innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="tm-svg" xmlns="http://www.w3.org/2000/svg">
      ${yTicks.map(v => `<line class="${v === 100 ? 'tm-100' : 'tmg'}" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/>
        <text class="tmt" x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
      ${Array.from({ length: wks + 1 }, (_, w) => w).filter(w => w % 2 === 0).map(w =>
        `<text class="tmt" x="${X(w)}" y="${H - B + 18}" text-anchor="middle">${w === 0 ? 'pre' : w}</text>`).join('')}
      <line class="tm-now" id="tm-nowline" x1="${X(curWeek)}" x2="${X(curWeek)}" y1="${T}" y2="${H - B}"/>
      ${lines}
      <text x="${(L + W - R) / 2}" y="${H - 4}" class="tm-axis" text-anchor="middle">WEEK →</text>
      <text x="13" y="${(T + H - B) / 2}" class="tm-axis" text-anchor="middle" transform="rotate(-90 13 ${(T + H - B) / 2})">SOS INDEX</text>
    </svg>`;
  window.__tmX = X; window.__tmGeo = { T, B, H };
}

function updateWeek(w) {
  curWeek = w;
  document.getElementById('tm-when').textContent = whenLabel(w);
  document.getElementById('tm-asof').textContent = whenLabel(w);
  const nl = document.getElementById('tm-nowline');
  if (nl && window.__tmX) {
    const x = window.__tmX(w), g = window.__tmGeo;
    nl.setAttribute('x1', x); nl.setAttribute('x2', x);
  }
  // "the field as of week w" — rank all teams by their rating at this week
  const rows = Object.entries(DATA.teams)
    .map(([name, t]) => ({ name, ...t, snap: t.series[w] }))
    .filter(t => t.snap)
    .sort((a, b) => b.snap.rating - a.snap.rating)
    .slice(0, 15);
  document.getElementById('tm-rankings').innerHTML = rows.map((t, i) => `
    <div class="rk-row">
      <span class="rk-rank">${i + 1}</span>
      ${t.logo ? `<img class="lb-logo" src="${t.logo}" alt="">` : '<span></span>'}
      <span class="lb-name">${t.name} <span style="color:rgba(255,255,255,.3);font-size:.66rem">${CONF_ACRO[t.conference] || ''}</span></span>
      <span class="rk-rec">${t.snap.record}</span>
      <span class="rk-rating">${t.snap.rating > 0 ? '+' : ''}${t.snap.rating}</span>
    </div>`).join('');
}

boot();
