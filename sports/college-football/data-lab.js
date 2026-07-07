// Data Lab: side-by-side review of normalized offseason sources.
// Display + sort only — no blending or weighting here (Phase 2 decides that).

const SOURCES = [
  { key: 'recruiting-247', label: '247 Composite', fmt: v => v.toFixed(1) },
  { key: 'transfer-portal', label: 'Portal Net', fmt: v => (v > 0 ? '+' : '') + v.toFixed(2) },
  { key: 'draft-capital', label: 'Draft Capital', sub: "'21–'25", fmt: v => String(Math.round(v)) },
  { key: 'returning-production', label: 'Returning Prod', fmt: v => Math.round(v * 100) + '%' },
  { key: 'sp-plus', label: 'SP+', fmt: v => (v > 0 ? '+' : '') + v.toFixed(1) },
];

let ROWS = [];
let sortCol = 'sp-plus';
let sortDir = -1;

function zClass(z) {
  if (z >= 0.75) return 'z-pos';
  if (z <= -0.75) return 'z-neg';
  return 'z-mid';
}

async function boot() {
  const [teamsDb, ...normalized] = await Promise.all([
    fetch('data/teams-db.json').then(r => r.json()),
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

  ROWS = fbs.map(t => {
    const row = { team: t.school, conf: t.conference, logo: (t.logos || [])[0] };
    for (const s of SOURCES) row[s.key] = bySource[s.key]?.get(t.school) || null;
    return row;
  });

  document.getElementById('lab-flags').innerHTML =
    '<strong>Season flags:</strong> ' + SOURCES
      .filter(s => meta[s.key])
      .map(s => `${s.label} = <strong>${meta[s.key].season}</strong>`)
      .join(' · ') +
    '<br>2026-cycle recruiting, SP+ projections, and returning production aren\'t published in CFBD yet — ' +
    '2025 figures are standing in (see data/README.md for manual-override paths). ' +
    'Draft capital "—" = zero picks in the window, a real signal. Portal net is computed from player-level data, not 247/On3\'s editorial board.';

  render();
}

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

  document.getElementById('lab-table').innerHTML = `
    <tr>
      ${th('team', 'Team')}
      ${th('conf', 'Conf')}
      ${SOURCES.map(s => th(s.key, s.label, (s.sub ? s.sub + ' · ' : '') + 'raw · z')).join('')}
    </tr>
    ${rows.map(r => `
      <tr>
        <td class="team-cell">${r.logo ? `<img src="${r.logo}" alt="" loading="lazy">` : ''}${r.team}</td>
        <td class="conf-cell">${r.conf}</td>
        ${SOURCES.map(s => {
          const cell = r[s.key];
          if (!cell) return '<td class="missing">—</td>';
          return `<td>${s.fmt(cell.value)}<span class="z ${zClass(cell.zscore)}">${cell.zscore > 0 ? '+' : ''}${cell.zscore.toFixed(1)}σ</span></td>`;
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
