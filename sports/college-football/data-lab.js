// Data Lab: side-by-side review of normalized offseason sources.
// Display + sort only — no blending or weighting here (Phase 2 decides that).

const SOURCES = [
  { key: 'recruiting-247', label: '247 Composite', fmt: v => v.toFixed(1) },
  { key: 'transfer-portal', label: 'Portal Net', fmt: v => (v > 0 ? '+' : '') + v.toFixed(2) },
  { key: 'draft-capital', label: 'Draft Capital', sub: "'21–'25", fmt: v => String(Math.round(v)) },
  { key: 'returning-production', label: 'Returning Prod', fmt: v => Math.round(v * 100) + '%' },
  { key: 'sp-plus', label: 'SP+', fmt: v => (v > 0 ? '+' : '') + v.toFixed(1) },
];

// computed columns from power-index-2026.json (v1 wiring)
const EXTRA_COLS = [
  { key: 'composite', label: 'Composite', sub: 'z × 9 pts', fmt: v => (v > 0 ? '+' : '') + v.toFixed(1) },
  { key: 'index-v1', label: 'W²-Index v1', sub: 'final rating', fmt: v => (v > 0 ? '+' : '') + v.toFixed(1) },
  { key: 'sandbox', label: 'Sandbox', sub: 'weight-lab mix', fmt: v => (v > 0 ? '+' : '') + v.toFixed(1) },
];

let ROWS = [];
let sortCol = 'index-v1';
let sortDir = -1;

// --- Weight Lab: client-side sandbox, mirrors build_power_index.py math ---
// Nothing here persists or feeds the real index — backtest before hardcoding.
const DEFAULT_WEIGHTS = {
  'sp-plus': 35, 'returning-production': 20, 'recruiting-247': 20,
  'transfer-portal': 15, 'draft-capital': 10,
};
const DEFAULT_BLEND = 50;   // % offseason composite vs results base
const CARRYOVER_W = 0.65;   // matches build_power_index.py
const Z_TO_POINTS = 9;
const WL_LABELS = {
  'sp-plus': 'SP+', 'returning-production': 'Returning prod',
  'recruiting-247': 'Recruiting', 'transfer-portal': 'Portal net',
  'draft-capital': 'Draft capital',
};
let BASES = new Map();      // team -> results base (pre-composite rating)
let V1_RANK = new Map();    // team -> official v1 rank

function computeSandbox(weights, blendPct) {
  const raw = new Map();
  for (const r of ROWS) {
    let ws = 0, wz = 0;
    for (const k of Object.keys(weights)) {
      const cell = r[k];
      if (cell && weights[k] > 0) { ws += weights[k]; wz += weights[k] * cell.zscore; }
    }
    raw.set(r.team, ws > 0 ? wz / ws : null);
  }
  const vals = [...raw.values()].filter(v => v != null);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / (vals.length - 1)) || 1;
  const b = blendPct / 100;

  const rated = ROWS.map(r => {
    const base = BASES.get(r.team);
    const cz = raw.get(r.team);
    const rating = cz == null ? base
      : (1 - b) * base + b * (((cz - mean) / std) * Z_TO_POINTS);
    return { team: r.team, rating };
  }).sort((a, b2) => b2.rating - a.rating);

  const out = new Map();
  rated.forEach((t, i) => out.set(t.team, { rating: t.rating, rank: i + 1 }));
  return out;
}

function readWeights() {
  const weights = {};
  for (const k of Object.keys(DEFAULT_WEIGHTS)) {
    weights[k] = Number(document.getElementById(`wl-${k}`).value);
  }
  return { weights, blend: Number(document.getElementById('wl-blend').value) };
}

function applySandbox() {
  const { weights, blend } = readWeights();
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  // update slider readouts (raw value + effective share)
  for (const k of Object.keys(weights)) {
    document.getElementById(`wl-val-${k}`).innerHTML =
      `${weights[k]}<span class="share"> · ${sum ? Math.round(100 * weights[k] / sum) : 0}%</span>`;
  }
  document.getElementById('wl-val-blend').textContent = `${blend}%`;

  const sandbox = computeSandbox(weights, blend);
  for (const r of ROWS) {
    const s = sandbox.get(r.team);
    r['sandbox'] = s ? { value: Math.round(s.rating * 10) / 10, zscore: null } : null;
  }

  const top = [...sandbox.entries()].sort((a, b) => a[1].rank - b[1].rank).slice(0, 15);
  document.getElementById('wl-top').innerHTML = top.map(([team, s]) => {
    const shift = (V1_RANK.get(team) || 0) - s.rank;
    const cls = shift > 0 ? 'wl-up' : shift < 0 ? 'wl-down' : 'wl-same';
    const arrow = shift > 0 ? `▲${shift}` : shift < 0 ? `▼${-shift}` : '·';
    return `<div class="wl-team"><span class="r">${s.rank}</span><span class="n">${team}</span>
      <span class="v">${s.rating >= 0 ? '+' : ''}${s.rating.toFixed(1)}</span>
      <span class="d ${cls}">${arrow}</span></div>`;
  }).join('');

  render();
}

function initWeightLab() {
  const sliderRow = (k, val, max, isBlend = false) => `
    <div class="wl-row ${isBlend ? 'wl-blend-row' : ''}">
      <label for="wl-${k}">${isBlend ? 'Offseason blend' : WL_LABELS[k]}</label>
      <input type="range" id="wl-${k}" min="0" max="${max}" step="5" value="${val}">
      <span class="wl-val" id="wl-val-${k}">${val}</span>
    </div>`;
  document.getElementById('weight-lab-root').innerHTML = `
    <div class="index-section-title">⚖️ Weight Lab
      <span>sandbox only — the live index, bracket & schedule never change ·
      backtest before hardcoding anything</span></div>
    <div class="weight-lab">
      <div class="wl-sliders">
        ${Object.entries(DEFAULT_WEIGHTS).map(([k, v]) => sliderRow(k, v, 60)).join('')}
        ${sliderRow('blend', DEFAULT_BLEND, 100, true)}
        <button class="wl-reset" id="wl-reset">↺ Reset to boring weights</button>
      </div>
      <div class="wl-preview">
        <h4>Sandbox Top 15 <span style="text-transform:none">· vs official v1</span></h4>
        <div id="wl-top"></div>
      </div>
    </div>
  `;
  document.querySelectorAll('.weight-lab input[type=range]').forEach(el =>
    el.addEventListener('input', applySandbox));
  document.getElementById('wl-reset').addEventListener('click', () => {
    for (const [k, v] of Object.entries(DEFAULT_WEIGHTS)) {
      document.getElementById(`wl-${k}`).value = v;
    }
    document.getElementById('wl-blend').value = DEFAULT_BLEND;
    applySandbox();
  });
  applySandbox();
}

function zClass(z) {
  if (z >= 0.75) return 'z-pos';
  if (z <= -0.75) return 'z-neg';
  return 'z-mid';
}

async function boot() {
  const [teamsDb, powerIndex, ...normalized] = await Promise.all([
    fetch('data/teams-db.json').then(r => r.json()),
    fetch('data/power-index-2026.json').then(r => r.ok ? r.json() : null),
    ...SOURCES.map(s => fetch(`data/normalized/${s.key}.json`).then(r => r.ok ? r.json() : null)),
  ]);

  const fbs = teamsDb.teams.filter(t => t.classification === 'fbs');
  const meta = {};
  const bySource = {};
  SOURCES.forEach((s, i) => {
    const d = normalized[i];
    if (!d) return;
    meta[s.key] = d;
    bySource[s.key] = new Map(d.teams.map(t => [t.team, t]));
  });

  const indexByTeam = new Map((powerIndex?.teams || []).map(t => [t.school, t]));
  ROWS = fbs.map(t => {
    const row = { team: t.school, conf: t.conference, logo: (t.logos || [])[0] };
    for (const s of SOURCES) row[s.key] = bySource[s.key]?.get(t.school) || null;
    const idx = indexByTeam.get(t.school);
    row['composite'] = idx?.compositePts != null
      ? { value: idx.compositePts, zscore: idx.compositeZ } : null;
    row['index-v1'] = idx ? { value: idx.rating, zscore: null } : null;
    if (idx) {
      BASES.set(t.school, idx.srs2025 == null
        ? idx.confStrength2026
        : CARRYOVER_W * idx.srs2025 + (1 - CARRYOVER_W) * idx.confStrength2026);
      V1_RANK.set(t.school, idx.rank);
    }
    return row;
  });

  document.getElementById('lab-flags').innerHTML =
    '<strong>Season flags:</strong> ' + SOURCES
      .filter(s => meta[s.key])
      .map(s => `${s.label} = <strong>${meta[s.key].season}</strong>`)
      .join(' · ') +
    '<br>2026-cycle recruiting, SP+ projections, and returning production aren\'t published in CFBD yet — ' +
    '2025 figures are standing in (see data/README.md for manual-override paths). ' +
    'Draft capital zero-pick schools now enter at 0 (Phase-2 policy). Portal net is computed from player-level data, not 247/On3\'s editorial board.' +
    (powerIndex ? `<br><strong>v1 wired up:</strong> Composite = weighted z (SP+ 35 / RetProd 20 / Recruiting 20 / Portal 15 / Draft 10), standardized, × ${powerIndex.zToPoints} pts. W²-Index v1 = ${Math.round((1 - powerIndex.offseasonBlend) * 100)}% results base + ${Math.round(powerIndex.offseasonBlend * 100)}% Composite. Knobs live in api/build_power_index.py.` : '');

  if (powerIndex) initWeightLab();
  render();
  focusWeightLab();
}

// deep link: data-lab.html#weight-lab (hamburger menu) scrolls to the sandbox.
// Retried after a beat — the native anchor jump races the async render.
function focusWeightLab() {
  if (location.hash !== '#weight-lab') return;
  const go = () => document.getElementById('weight-lab-root')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  go();
  setTimeout(go, 350);
}
window.addEventListener('hashchange', focusWeightLab);

function render() {
  const q = document.getElementById('lab-search').value.trim().toLowerCase();
  let rows = ROWS.filter(r => !q || r.team.toLowerCase().includes(q) || r.conf.toLowerCase().includes(q));

  rows.sort((a, b) => {
    let av, bv;
    if (sortCol === 'team') { av = a.team; bv = b.team; return sortDir * av.localeCompare(bv); }
    if (sortCol === 'conf') { av = a.conf; bv = b.conf; return sortDir * av.localeCompare(bv); }
    av = a[sortCol]?.value; bv = b[sortCol]?.value;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;   // missing always sinks
    if (bv == null) return -1;
    return sortDir * (av - bv);
  });

  const arrow = c => (c === sortCol ? (sortDir === -1 ? ' ▾' : ' ▴') : '');
  const th = (col, label, sub = '') => `
    <th class="${col === sortCol ? 'sorted' : ''}" data-col="${col}">
      ${label}${arrow(col)}${sub ? `<span class="sub">${sub}</span>` : ''}
    </th>`;

  const dataCols = [...SOURCES.map(s => ({ ...s, sub: (s.sub ? s.sub + ' · ' : '') + 'raw · z' })), ...EXTRA_COLS];
  document.getElementById('lab-table').innerHTML = `
    <tr>
      ${th('team', 'Team')}
      ${th('conf', 'Conf')}
      ${dataCols.map(c => th(c.key, c.label, c.sub)).join('')}
    </tr>
    ${rows.map(r => `
      <tr>
        <td class="team-cell">${r.logo ? `<img src="${r.logo}" alt="" loading="lazy">` : ''}${r.team}</td>
        <td class="conf-cell">${r.conf}</td>
        ${dataCols.map(c => {
          const cell = r[c.key];
          if (!cell) return '<td class="missing">—</td>';
          const z = cell.zscore != null
            ? `<span class="z ${zClass(cell.zscore)}">${cell.zscore > 0 ? '+' : ''}${cell.zscore.toFixed(1)}σ</span>` : '';
          return `<td>${c.fmt(cell.value)}${z}</td>`;
        }).join('')}
      </tr>
    `).join('')}
  `;
  document.getElementById('lab-count').textContent = `${rows.length} teams`;

  document.querySelectorAll('.lab-table th').forEach(el => {
    el.addEventListener('click', () => {
      const col = el.dataset.col;
      if (col === sortCol) sortDir = -sortDir;
      else { sortCol = col; sortDir = col === 'team' || col === 'conf' ? 1 : -1; }
      render();
    });
  });
}

document.getElementById('lab-search').addEventListener('input', render);
boot();
