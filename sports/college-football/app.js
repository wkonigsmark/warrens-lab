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

renderPoll();
initTabs();
loadSchedule();
