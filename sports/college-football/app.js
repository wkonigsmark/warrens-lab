const SEASON = 2026;

function renderPoll() {
  const list = document.getElementById('poll-list');
  list.innerHTML = TOP_25.map(t => `
    <div class="poll-row">
      <div class="poll-rank">${t.rank}</div>
      <div class="poll-team">${t.team}</div>
      <div class="poll-conf">${t.conf}</div>
    </div>
  `).join('');
}

function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// --- Schedule (reads data/games-<year>.json produced by api/fetch_games.py) ---

const RANKED = new Map(TOP_25.map(t => [t.team, t.rank]));

function teamLabel(name) {
  const rank = RANKED.get(name);
  return rank ? `<span class="rank-badge">#${rank}</span> ${name}` : name;
}

function gameRow(g) {
  const date = g.date
    ? new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBD';
  const score = g.completed
    ? `<span class="game-score">${g.awayPoints}–${g.homePoints}</span>`
    : `<span class="game-date">${date}</span>`;
  const at = g.neutralSite ? 'vs' : 'at';
  return `
    <div class="game-row">
      <div class="game-teams">${teamLabel(g.awayTeam)} <span class="game-at">${at}</span> ${teamLabel(g.homeTeam)}</div>
      ${score}
    </div>
  `;
}

function renderSchedule(games) {
  const container = document.getElementById('tab-schedule');
  const weeks = [...new Set(games.map(g => g.week))].sort((a, b) => a - b);

  container.innerHTML = `
    <div class="schedule-controls">
      <select id="week-select" class="week-select">
        ${weeks.map(w => `<option value="${w}">Week ${w}</option>`).join('')}
      </select>
      <label class="ranked-toggle">
        <input type="checkbox" id="ranked-only" checked> Top 25 only
      </label>
    </div>
    <div id="schedule-list" class="poll-list"></div>
  `;

  function draw() {
    const week = Number(document.getElementById('week-select').value);
    const rankedOnly = document.getElementById('ranked-only').checked;
    let shown = games.filter(g => g.week === week);
    if (rankedOnly) {
      shown = shown.filter(g => RANKED.has(g.homeTeam) || RANKED.has(g.awayTeam));
    }
    document.getElementById('schedule-list').innerHTML =
      shown.map(gameRow).join('') ||
      '<div class="stub-card"><p>No games match this filter.</p></div>';
  }

  document.getElementById('week-select').addEventListener('change', draw);
  document.getElementById('ranked-only').addEventListener('change', draw);
  draw();
}

async function loadSchedule() {
  try {
    const res = await fetch(`data/games-${SEASON}.json`);
    if (!res.ok) throw new Error(res.status);
    const { games } = await res.json();
    renderSchedule(games);
  } catch {
    document.getElementById('tab-schedule').innerHTML = `
      <div class="stub-card">
        <h3>No schedule data yet</h3>
        <p>Grab a free key at collegefootballdata.com/key, drop it in
        <code>api/.env</code>, then run:</p>
        <p><code>python3 api/fetch_games.py ${SEASON}</code></p>
      </div>
    `;
  }
}

// --- Viva CFP marquee: chasing bulb border ---

function buildMarqueeBulbs() {
  const box = document.getElementById('marquee-bulbs');
  const w = box.clientWidth;
  const h = box.clientHeight;
  const mobile = w < 420;
  const spacing = mobile ? 26 : 34;
  const size = mobile ? 6 : 8;

  const cols = Math.max(4, Math.round(w / spacing));
  const rows = Math.max(3, Math.round(h / spacing));

  const points = [];
  for (let i = 0; i < cols; i++) points.push([(i / cols) * w, 0]);
  for (let i = 0; i < rows; i++) points.push([w, (i / rows) * h]);
  for (let i = cols; i > 0; i--) points.push([(i / cols) * w, h]);
  for (let i = rows; i > 0; i--) points.push([0, (i / rows) * h]);

  box.innerHTML = points.map(([x, y], i) => `
    <span class="bulb ${i % 2 ? 'phase-b' : ''}"
      style="left:${x.toFixed(1)}px; top:${y.toFixed(1)}px; width:${size}px; height:${size}px"></span>
  `).join('');
}

let bulbResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(bulbResizeTimer);
  bulbResizeTimer = setTimeout(buildMarqueeBulbs, 150);
});

// --- Playoff format modal (2026-27 rules as data, not markup) ---

const cfpFormat2026 = {
  fieldSize: 12,
  autoBids: {
    power4: { count: 4, conferences: ['ACC', 'Big 12', 'Big Ten', 'SEC'], rule: 'conference champion, any rank' },
    groupOf6: { count: 1, conferences: ['AAC', 'C-USA', 'MAC', 'Mountain West', 'Pac-12', 'Sun Belt'], rule: 'highest-ranked team, champion not required' },
  },
  independentRule: { team: 'Notre Dame', condition: 'top 12 in the final committee rankings' },
  atLargeBids: 7,
  seeding: 'All 12 teams are re-seeded 1–12 purely by final committee rank — a conference title does NOT guarantee a higher seed or a bye. The top 4 seeds overall get the first-round bye, champs or not.',
  byeSeeds: [1, 2, 3, 4],
  bracket: [
    'Seeds 1–4: bye through the first round',
    "Seeds 5–12: first-round games at the higher seed's campus",
    'Quarterfinals & semifinals hosted by rotating bowls (Orange, Rose, Sugar, Cotton, Fiesta, Peach)',
  ],
  championship: { date: 'January 25, 2027', location: 'Allegiant Stadium, Las Vegas' },
  selection: 'A 13-person committee (coaches, former players, administrators, journalists) releases weekly rankings during the season and finalizes the field and seeding after conference championship weekend.',
};

function renderFormatModal(f) {
  const section = (title, body) => `<div class="format-section"><h3>${title}</h3>${body}</div>`;
  document.getElementById('format-body').innerHTML = [
    section('Field Size', `<p><strong>${f.fieldSize} teams.</strong></p>`),
    section(`Automatic Bids (${f.autoBids.power4.count + f.autoBids.groupOf6.count})`, `<ul>
      <li><strong>${f.autoBids.power4.count}</strong> to the Power 4 champions — ${f.autoBids.power4.conferences.join(', ')} — ${f.autoBids.power4.rule}.</li>
      <li><strong>${f.autoBids.groupOf6.count}</strong> to the Group of 6 (${f.autoBids.groupOf6.conferences.join(', ')}) — ${f.autoBids.groupOf6.rule}.</li>
    </ul>`),
    section('Notre Dame Rule', `<p>As an independent, <strong>${f.independentRule.team}</strong> gets an automatic bid if it finishes ${f.independentRule.condition} — no conference title needed.</p>`),
    section(`At-Large Bids (${f.atLargeBids})`, '<p>The next-highest-ranked teams in the final rankings, regardless of conference, after the 5 automatic bids are locked in.</p>'),
    section('Seeding', `<p>${f.seeding}</p>`),
    section('Bracket Structure', `<ul>${f.bracket.map(b => `<li>${b}</li>`).join('')}</ul>
      <p><strong>National Championship:</strong> ${f.championship.date} · ${f.championship.location} 🎰</p>`),
    section('Selection Process', `<p>${f.selection}</p>`),
  ].join('');
}

function initFormatModal() {
  const overlay = document.getElementById('format-modal');
  renderFormatModal(cfpFormat2026);
  document.getElementById('format-btn').addEventListener('click', () => { overlay.hidden = false; });
  document.getElementById('format-close').addEventListener('click', () => { overlay.hidden = true; });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.hidden = true; });
}

renderPoll();
initTabs();
loadSchedule();
buildMarqueeBulbs();
initFormatModal();
