const SEASON = 2026;
let GAMES_2026 = null;

// ESPN Top 25 tiles mirror the W²-Index rows: team colors, logos, and the
// W² rank as the cross-reference (the inverse of the ★ badge on the index)
function renderPoll() {
  const list = document.getElementById('poll-list');
  const byName = INDEX_DATA ? new Map(INDEX_DATA.teams.map(t => [t.school, t])) : null;
  list.innerHTML = TOP_25.map(t => {
    const idx = byName?.get(t.team);
    const conf = CONF_ACRO[t.conf] || t.conf;
    return `
      <div class="poll-tile" style="--team-color:${idx?.color || 'var(--gold-dim)'}">
        <span class="poll-tile-rank">${t.rank}</span>
        ${idx?.logo ? `<img class="poll-tile-logo" src="${idx.logo}" alt="" loading="lazy">` : ''}
        <span class="poll-tile-team">${t.team}</span>
        <span class="poll-tile-conf">${conf}</span>
        ${idx ? `<span class="poll-tile-w2">W² #${idx.rank}</span>` : ''}
      </div>
    `;
  }).join('');
}

// Tabs are hash-routed (#index, #top25, …) and driven by the shared header (nav.js)
const TAB_ROUTES = {
  index: 'tab-index',
  top25: 'tab-rankings',
  teams: 'tab-teams',
  schedule: 'tab-schedule',
  bracket: 'tab-bracket',
  learn: 'tab-learn',
};

function routeTab() {
  const key = location.hash.replace('#', '') || 'index';
  const id = TAB_ROUTES[key] || 'tab-index';
  document.querySelectorAll('.tab-content').forEach(c =>
    c.classList.toggle('active', c.id === id));
}

function initTabs() {
  window.addEventListener('hashchange', routeTab);
  routeTab();
}

// --- Schedule: matchups rated by quality + closeness + playoff impact ---
// Marquee score (0–100) = avg W² rating of both teams, minus half the spread
// (mismatches are boring), plus a contender bonus for top-12/top-25 teams.

let W2_BY_NAME = null;

function gameMetrics(g) {
  const home = W2_BY_NAME.get(g.homeTeam);
  const away = W2_BY_NAME.get(g.awayTeam);
  const rHome = home ? home.rating : INDEX_DATA.fcsPoolRating;
  const rAway = away ? away.rating : INDEX_DATA.fcsPoolRating;
  const edgeHome = rHome - rAway + (g.neutralSite ? 0 : HOME_EDGE);
  const spread = Math.abs(edgeHome);
  const favName = edgeHome >= 0 ? g.homeTeam : g.awayTeam;
  const favProb = 1 / (1 + Math.pow(10, -spread / 15));
  const bonus = t => !t ? 0 : t.rank <= 12 ? 3 : t.rank <= 25 ? 1.5 : 0;
  const marquee = (rHome + rAway) / 2 - spread / 2 + bonus(home) + bonus(away);
  const score = Math.max(0, Math.min(100, Math.round((marquee + 25) * 2)));
  return { home, away, spread, favName, favProb, score };
}

function mprClass(score) {
  if (score >= 80) return 'mpr-hot';
  if (score >= 65) return 'mpr-good';
  if (score >= 50) return 'mpr-mid';
  return 'mpr-low';
}

function schedTeam(name, idx) {
  const logo = idx?.logo ? `<img src="${idx.logo}" alt="" loading="lazy">` : '';
  const rank = idx ? `<span class="game-rank">#${idx.rank}</span>` : '<span class="game-rank dim">FCS</span>';
  return `<span class="game-team">${logo}${rank} ${name}</span>`;
}

function gameCard(g) {
  const m = gameMetrics(g);
  const date = g.date
    ? new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBD';
  const at = g.neutralSite ? 'vs' : 'at';
  return `
    <div class="game-card">
      <div class="mpr-chip ${mprClass(m.score)}" title="Marquee score: matchup quality 0–100">${m.score}</div>
      <div class="game-info">
        <div class="game-line">
          ${schedTeam(g.awayTeam, m.away)}
          <span class="game-at">${at}</span>
          ${schedTeam(g.homeTeam, m.home)}
        </div>
        <div class="game-sub">Wk ${g.week} · ${date}${g.neutralSite ? ' · neutral site' : ''}
          · ${m.favName} by ${m.spread.toFixed(1)} · ${Math.round(m.favProb * 100)}%</div>
      </div>
    </div>
  `;
}

const ALL_SEASON_CAP = 75;

// week radar: per-week concentration of quality games + that week's peak game
function weekRadar(games, weeks) {
  const stats = weeks.map(w => {
    const ms = games.filter(g => g.week === w).map(gameMetrics);
    const quality = ms.filter(m => m.score >= 65).length;
    const flips = ms.filter(m => m.spread < 3 &&
      (m.home?.rank || 999) <= 40 && (m.away?.rank || 999) <= 40).length;
    const max = Math.max(0, ...ms.map(m => m.score));
    return { week: w, quality, flips, max };
  });
  const peak = Math.max(...stats.map(s => s.quality), 1);
  const best = stats.reduce((a, b) => (b.quality > a.quality ? b : a));
  return `
    <div class="week-radar" id="week-radar">
      ${stats.map(s => `
        <button class="wr-col" data-week="${s.week}"
          title="Week ${s.week}: ${s.quality} marquee game${s.quality === 1 ? '' : 's'} (65+) · ${s.flips} ranked coin-flip${s.flips === 1 ? '' : 's'} (<3 pts) · best game ${s.max}">
          ${s === best ? '<span class="wr-crown">★</span>' : ''}
          <span class="wr-max ${mprClass(s.max)}">${s.max}</span>
          <span class="wr-track"><span class="wr-bar" style="height:${Math.max(6, (s.quality / peak) * 100)}%"></span></span>
          <span class="wr-week">${s.week}</span>
        </button>
      `).join('')}
    </div>
    <p class="wr-legend">bar = marquee games that week (65+) · number = the week's best game
      · ★ = most loaded week · click a week to jump</p>
  `;
}

function renderSchedule(games) {
  const container = document.getElementById('tab-schedule');
  const weeks = [...new Set(games.map(g => g.week))].sort((a, b) => a - b);
  const confs = [...new Set(INDEX_DATA.teams.map(t => t.conference))]
    .filter(c => c !== 'FBS Independents').sort();

  container.innerHTML = `
    ${weekRadar(games, weeks)}
    <div class="schedule-controls">
      <select id="week-select" class="week-select">
        <option value="all">All season</option>
        ${weeks.map(w => `<option value="${w}">Week ${w}</option>`).join('')}
      </select>
      <select id="conf-filter" class="week-select">
        <option value="">All conferences</option>
        ${confs.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <select id="rank-filter" class="week-select">
        <option value="">Any teams</option>
        <option value="one25">One team top 25</option>
        <option value="both25">Both top 25</option>
        <option value="both12">Both top 12</option>
      </select>
      <select id="spread-filter" class="week-select">
        <option value="">Any spread</option>
        <option value="1">Under 1 · pick'em</option>
        <option value="3">Under 3</option>
        <option value="7">Under 7 · one score</option>
      </select>
      <select id="sort-select" class="week-select">
        <option value="marquee">Best matchups first</option>
        <option value="tight">Tightest spread first</option>
        <option value="time">Kickoff order</option>
      </select>
    </div>
    <div class="teams-count" id="sched-count"></div>
    <div id="schedule-list" class="sched-cards"></div>
    <p class="index-footnote">Marquee score = how good both teams are, minus the mismatch,
      plus a bump when playoff contenders collide · spread & win% from W²-Index ratings</p>
  `;

  function draw() {
    const week = document.getElementById('week-select').value;
    const conf = document.getElementById('conf-filter').value;
    const rankF = document.getElementById('rank-filter').value;
    const spreadF = document.getElementById('spread-filter').value;
    const sort = document.getElementById('sort-select').value;
    const allSeason = week === 'all';

    let pool = allSeason ? games : games.filter(g => g.week === Number(week));
    let shown = pool.map(g => ({ g, m: gameMetrics(g) }));

    if (conf) {
      shown = shown.filter(({ m }) =>
        m.home?.conference === conf || m.away?.conference === conf);
    }
    if (rankF) {
      shown = shown.filter(({ m }) => {
        const hr = m.home?.rank || 999, ar = m.away?.rank || 999;
        if (rankF === 'one25') return hr <= 25 || ar <= 25;
        if (rankF === 'both25') return hr <= 25 && ar <= 25;
        return hr <= 12 && ar <= 12;
      });
    }
    if (spreadF) {
      shown = shown.filter(({ m }) => m.spread < Number(spreadF));
    }

    if (sort === 'tight') {
      shown.sort((a, b) => a.m.spread - b.m.spread);
    } else if (sort === 'marquee' || allSeason && sort !== 'time') {
      shown.sort((a, b) => b.m.score - a.m.score);
    } else {
      shown.sort((a, b) => String(a.g.date).localeCompare(String(b.g.date)));
    }

    const total = shown.length;
    let note = `${total} game${total === 1 ? '' : 's'}`;
    if (allSeason && total > ALL_SEASON_CAP) {
      shown = shown.slice(0, ALL_SEASON_CAP);
      note = `top ${ALL_SEASON_CAP} of ${total} matching games, season-wide`;
    }
    document.getElementById('sched-count').textContent = note;
    document.getElementById('schedule-list').innerHTML =
      shown.map(({ g }) => gameCard(g)).join('') ||
      '<div class="stub-card"><p>No games match this filter.</p></div>';

    document.querySelectorAll('.wr-col').forEach(col =>
      col.classList.toggle('wr-active', col.dataset.week === week));
  }

  ['week-select', 'conf-filter', 'rank-filter', 'spread-filter', 'sort-select']
    .forEach(id => document.getElementById(id).addEventListener('change', draw));
  document.getElementById('week-radar').addEventListener('click', e => {
    const col = e.target.closest('.wr-col');
    if (!col) return;
    const sel = document.getElementById('week-select');
    sel.value = sel.value === col.dataset.week ? 'all' : col.dataset.week;
    draw();
  });
  draw();
}

function maybeRenderSchedule() {
  if (GAMES_2026 && INDEX_DATA) {
    W2_BY_NAME = new Map(INDEX_DATA.teams.map(t => [t.school, t]));
    renderSchedule(GAMES_2026);
  }
}

async function loadSchedule() {
  try {
    const res = await fetch(`data/games-${SEASON}.json`);
    if (!res.ok) throw new Error(res.status);
    const { games } = await res.json();
    GAMES_2026 = games;
    maybeRenderSchedule();
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

// --- Teams directory (reads data/teams-db.json from api/build_teams_db.py) ---

const CLASS_LABELS = { fbs: 'FBS', fcs: 'FCS', ii: 'D2', iii: 'D3' };
let TEAMS_DB = null;

async function loadTeamsDb() {
  try {
    const res = await fetch('data/teams-db.json');
    if (!res.ok) throw new Error(res.status);
    TEAMS_DB = (await res.json()).teams;
    renderTeamsUI();
  } catch {
    document.getElementById('tab-teams').innerHTML = `
      <div class="stub-card">
        <h3>No team database yet</h3>
        <p>Run <code>python3 api/build_teams_db.py</code> to build it.</p>
      </div>
    `;
  }
}

const TIER_HEADERS = {
  power4: { label: 'Power 4', rule: 'conference champs get auto bids' },
  group6: { label: 'Group of 6', rule: 'highest-ranked team gets the auto bid' },
  independent: { label: 'Independents', rule: 'Notre Dame: top 12 = auto bid' },
};

function teamCard(t) {
  const logo = t.logos[0]
    ? `<img class="team-logo" src="${t.logos[0]}" alt="" loading="lazy">`
    : '<div class="team-logo team-logo-empty">🏈</div>';
  const venue = [t.venue.city, t.venue.state].filter(Boolean).join(', ');
  const ndBadge = t.school === 'Notre Dame'
    ? '<span class="nd-badge">★ top-12 auto bid</span>' : '';
  return `
    <div class="team-card" style="--team-color: ${t.colors.primary || 'var(--gold-dim)'}">
      ${logo}
      <div class="team-card-info">
        <div class="team-card-name">${t.school} <span class="team-mascot">${t.mascot || ''}</span></div>
        <div class="team-card-meta">${[t.conference, venue].filter(Boolean).join(' · ')} ${ndBadge}</div>
      </div>
      <div class="team-card-badges">
        ${t.acronym ? `<span class="team-acronym">${t.acronym}</span>` : ''}
        <span class="team-class">${CLASS_LABELS[t.classification]}</span>
      </div>
    </div>
  `;
}

function tieredGrid(teams) {
  return ['power4', 'group6', 'independent'].map(tier => {
    const group = teams.filter(t => t.confTier === tier);
    if (!group.length) return '';
    const { label, rule } = TIER_HEADERS[tier];
    return `
      <div class="tier-header">
        <h4>${label}</h4><span class="tier-rule">${rule}</span>
      </div>
      ${group.map(teamCard).join('')}
    `;
  }).join('');
}

function renderTeamsUI() {
  const container = document.getElementById('tab-teams');
  container.innerHTML = `
    <div class="teams-controls">
      <input type="search" id="team-search" class="team-search" placeholder="Search school, mascot, acronym…">
      <div class="class-pills" id="class-pills">
        ${Object.entries(CLASS_LABELS).map(([k, label], i) =>
          `<button class="class-pill ${i === 0 ? 'active' : ''}" data-class="${k}">${label}</button>`).join('')}
      </div>
      <select id="conf-select" class="week-select"></select>
    </div>
    <div class="teams-count" id="teams-count"></div>
    <div class="teams-grid" id="teams-grid"></div>
  `;

  const searchEl = document.getElementById('team-search');
  const confEl = document.getElementById('conf-select');
  const pillsEl = document.getElementById('class-pills');
  let activeClass = 'fbs';

  function fillConferences() {
    const confs = [...new Set(TEAMS_DB
      .filter(t => t.classification === activeClass)
      .map(t => t.conference).filter(Boolean))].sort();
    confEl.innerHTML = '<option value="">All conferences</option>' +
      confs.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function draw() {
    const q = searchEl.value.trim().toLowerCase();
    let teams;
    if (q) {
      // search spans all divisions; class pills apply when browsing
      teams = TEAMS_DB.filter(t =>
        t.school.toLowerCase().includes(q) ||
        (t.mascot || '').toLowerCase().includes(q) ||
        (t.acronym || '').toLowerCase().includes(q) ||
        t.aliases.some(a => a.toLowerCase().includes(q)));
    } else {
      teams = TEAMS_DB.filter(t => t.classification === activeClass);
      if (confEl.value) teams = teams.filter(t => t.conference === confEl.value);
    }
    document.getElementById('teams-count').textContent =
      `${teams.length} team${teams.length === 1 ? '' : 's'}`;
    const useTiers = !q && activeClass === 'fbs';
    document.getElementById('teams-grid').innerHTML =
      (useTiers ? tieredGrid(teams) : teams.map(teamCard).join('')) ||
      '<div class="stub-card"><p>No teams match.</p></div>';
  }

  pillsEl.addEventListener('click', e => {
    const btn = e.target.closest('.class-pill');
    if (!btn) return;
    activeClass = btn.dataset.class;
    pillsEl.querySelectorAll('.class-pill').forEach(p => p.classList.toggle('active', p === btn));
    searchEl.value = '';
    fillConferences();
    draw();
  });
  confEl.addEventListener('change', draw);
  searchEl.addEventListener('input', draw);

  fillConferences();
  draw();
}

// --- The Index (reads data/power-index-2026.json from api/build_power_index.py) ---

const CONF_ACRO = {
  'SEC': 'SEC', 'Big Ten': 'B10', 'Big 12': 'B12', 'ACC': 'ACC',
  'Pac-12': 'P12', 'American Athletic': 'AAC', 'Sun Belt': 'SBC',
  'Mountain West': 'MW', 'Conference USA': 'CUSA', 'Mid-American': 'MAC',
  'FBS Independents': 'IND', 'Ind': 'IND', 'Independent': 'IND',
};

let INDEX_DATA = null;

async function loadPowerIndex() {
  try {
    const res = await fetch('data/power-index-2026.json');
    if (!res.ok) throw new Error(res.status);
    INDEX_DATA = await res.json();
    renderIndexUI(INDEX_DATA);
    renderPoll();            // add W² cross-references to the ESPN tiles
    maybeRenderSchedule();   // schedule ratings need W² ratings
  } catch {
    document.getElementById('tab-index').innerHTML = `
      <div class="stub-card">
        <h3>No index yet</h3>
        <p>Run <code>python3 api/build_power_index.py</code> to build it from 2025 results.</p>
      </div>
    `;
  }
}

function confStrengthTable(data) {
  const confs = data.confStrength.filter(c => c.conference !== 'FBS Independents');
  const max = Math.max(...confs.map(c => c.srsAvg2026));
  const min = Math.min(...confs.map(c => c.srsAvg2026));
  return `
    <div class="index-section-title">Conference Strength <span>avg team rating · 2025 results, 2026 rosters</span></div>
    <div class="conf-strength-list">
      ${confs.map((c, i) => {
        const pct = ((c.srsAvg2026 - min) / (max - min)) * 100;
        const rec = c.crossRecord2025;
        return `
          <div class="conf-strength-row">
            <span class="conf-rank">${i + 1}</span>
            <span class="conf-name">${c.conference}</span>
            <div class="conf-bar-track"><div class="conf-bar" style="width:${Math.max(4, pct)}%"></div></div>
            <span class="conf-srs">${c.srsAvg2026 > 0 ? '+' : ''}${c.srsAvg2026.toFixed(1)}</span>
            <span class="conf-cross">${rec.w}–${rec.l} cross-conf</span>
          </div>
        `;
      }).join('')}
    </div>
    <p class="index-footnote">FBS went ${data.fbsVsFcs2025.w}–${data.fbsVsFcs2025.l} against FCS in 2025 · FCS pool rating: ${data.fcsPoolRating}</p>
  `;
}

function confMatrix(data) {
  const order = data.confStrength
    .map(c => c.conference)
    .filter(c => data.confMatrix2025[c]);
  const cell = (row, col) => {
    if (row === col) return '<td class="mx-diag">—</td>';
    const r = (data.confMatrix2025[row] || {})[col];
    if (!r || (!r.w && !r.l)) return '<td class="mx-empty">·</td>';
    const cls = r.w > r.l ? 'mx-win' : r.w < r.l ? 'mx-loss' : '';
    return `<td class="${cls}">${r.w}–${r.l}</td>`;
  };
  return `
    <div class="index-section-title">Head-to-Head by Conference <span>2025 W–L, read across</span></div>
    <div class="matrix-wrap">
      <table class="conf-matrix">
        <tr><th></th>${order.map(c => `<th>${CONF_ACRO[c] || c}</th>`).join('')}</tr>
        ${order.map(row => `
          <tr><th>${CONF_ACRO[row] || row}</th>${order.map(col => cell(row, col)).join('')}</tr>
        `).join('')}
      </table>
    </div>
  `;
}

function indexTeamRow(t) {
  const logo = t.logo ? `<img class="index-logo" src="${t.logo}" alt="" loading="lazy">` : '';
  const poll = t.pollRank ? `<span class="index-poll">★ #${t.pollRank}</span>` : '';
  const srs = t.srs2025 === null ? 'new' : (t.srs2025 > 0 ? '+' : '') + t.srs2025.toFixed(1);
  const sos = t.sos2026 === null ? '—' : (t.sos2026 > 0 ? '+' : '') + t.sos2026.toFixed(1);
  return `
    <div class="index-row" data-school="${t.school}" style="--team-color:${t.color || 'var(--gold-dim)'}">
      <span class="index-rank">${t.rank}</span>
      ${logo}
      <span class="index-school">${t.school} ${poll}</span>
      <span class="index-conf">${CONF_ACRO[t.conference] || t.conference}</span>
      <span class="index-stat" title="projected rating">${(t.rating > 0 ? '+' : '') + t.rating.toFixed(1)}</span>
      <span class="index-stat dim" title="2025 SRS">${srs}</span>
      <span class="index-stat dim" title="2026 strength of schedule">${sos}</span>
    </div>
  `;
}

const INDEX_EXPLAINER = `
  <div class="explainer-section">
    <h4>Rating — projected 2026 strength</h4>
    <p>Points better (+) or worse (−) than the average FBS team on a neutral field.
    The gap between two ratings reads like a point spread: a +20 team should beat a
    +13 team by about a touchdown. Built in three steps:</p>
    <ol>
      <li><strong>Start with last season</strong> — the team's '25 SRS (below).</li>
      <li><strong>Regress toward the conference</strong> — 65% the team's own number,
      35% its 2026 conference average. Rosters churn every winter, but the league you
      play in says a lot about where you'll land.</li>
      <li><strong>Blend in the offseason composite (v1)</strong> — the final rating is
      50% that results base, 50% an offseason composite built from five normalized
      signals: SP+ 35%, returning production 20%, recruiting 20%, portal net 15%,
      draft capital 10% (each a z-score, standardized, × 9 points per σ — see the
      Data Lab for the raw ingredients). This replaces the old ESPN-poll blend,
      which folds in roster knowledge the 2025 math can't see.</li>
    </ol>
  </div>
  <div class="explainer-section">
    <h4>'25 SRS — what actually happened last year</h4>
    <p>Average scoring margin adjusted for opponent strength, iterated across every
    2025 game including bowls and the playoff. Margins are capped at ±28 so blowouts
    don't inflate anyone, and all FCS opponents are pooled into one team rated about
    −23. A team that went 8–4 against a brutal slate can out-rate a 10–2 team that
    played nobody. <em>"new"</em> = no 2025 FBS results to work from.</p>
  </div>
  <div class="explainer-section">
    <h4>'26 SoS — the road ahead</h4>
    <p>The average projected rating of every opponent on the 2026 schedule. +6 means
    the average Saturday is a top-25-caliber fight; a negative number is a soft slate.
    This is why a good record won't mean the same thing everywhere.</p>
  </div>
  <div class="explainer-section">
    <h4>★ #n — the poll cross-reference</h4>
    <p>The team's rank in ESPN's way-too-early Top 25 — display-only in v1, kept so
    you can spot where this index and the pollsters disagree. Every rating is now
    pure formula.</p>
  </div>
`;

function renderIndexUI(data) {
  document.getElementById('tab-index').innerHTML = `
    <div class="index-section-title">The W²-Index · 1–${data.teams.length}
      <span>projected 2026 · click a team for its schedule</span>
      <button class="info-toggle" id="index-info-btn" aria-expanded="false"
        title="How the W²-Index works">?</button>
    </div>
    <div class="index-explainer" id="index-explainer" hidden>${INDEX_EXPLAINER}</div>
    <div class="w2-controls">
      <input type="search" id="w2-search" class="team-search"
        placeholder="Search team or conference…">
      <span class="teams-count" id="w2-count"></span>
    </div>
    <div class="index-list-head">
      <span>#</span><span></span><span>Team</span><span>Conf</span>
      <span title="Projected 2026 strength vs an average FBS team — rating gaps read like point spreads">Rating</span>
      <span title="2025 results: avg margin adjusted for opponent strength, capped at ±28">'25 SRS</span>
      <span title="Average projected rating of 2026 opponents — higher = harder schedule">'26 SoS</span>
    </div>
    <div class="index-list"></div>
    ${confStrengthTable(data)}
    ${confMatrix(data)}
    <p class="index-footnote">${data.note}</p>
  `;

  const searchEl = document.getElementById('w2-search');
  function drawW2List() {
    const q = searchEl.value.trim().toLowerCase();
    const teams = !q ? data.teams : data.teams.filter(t =>
      t.school.toLowerCase().includes(q) ||
      t.conference.toLowerCase().includes(q) ||
      (CONF_ACRO[t.conference] || '').toLowerCase() === q);
    document.querySelector('#tab-index .index-list').innerHTML =
      teams.map(indexTeamRow).join('') ||
      '<div class="stub-card"><p>No teams match.</p></div>';
    document.getElementById('w2-count').textContent =
      q ? `${teams.length} team${teams.length === 1 ? '' : 's'}` : '';
  }
  searchEl.addEventListener('input', drawW2List);
  drawW2List();

  document.querySelector('#tab-index .index-list').addEventListener('click', e => {
    const row = e.target.closest('.index-row');
    if (row) openTeamModal(row.dataset.school);
  });
  const infoBtn = document.getElementById('index-info-btn');
  const explainer = document.getElementById('index-explainer');
  infoBtn.addEventListener('click', () => {
    explainer.hidden = !explainer.hidden;
    infoBtn.setAttribute('aria-expanded', String(!explainer.hidden));
    infoBtn.classList.toggle('open', !explainer.hidden);
  });
}

// --- Team schedule modal: matchup edges from index ratings ---

const HOME_EDGE = 2.5;

function probClass(p) {
  if (p >= 0.75) return 'prob-strong';
  if (p >= 0.55) return 'prob-lean';
  if (p >= 0.45) return 'prob-toss';
  return 'prob-dog';
}

function openTeamModal(school) {
  if (!INDEX_DATA || !GAMES_2026) return;
  const team = INDEX_DATA.teams.find(t => t.school === school);
  if (!team) return;
  const byName = new Map(INDEX_DATA.teams.map(t => [t.school, t]));

  const games = GAMES_2026
    .filter(g => g.homeTeam === school || g.awayTeam === school)
    .sort((a, b) => (a.week - b.week) || String(a.date).localeCompare(String(b.date)));

  let probSum = 0;
  const rows = games.map(g => {
    const isHome = g.homeTeam === school;
    const oppName = isHome ? g.awayTeam : g.homeTeam;
    const opp = byName.get(oppName);
    const oppRating = opp ? opp.rating : INDEX_DATA.fcsPoolRating;
    const hfa = g.neutralSite ? 0 : (isHome ? HOME_EDGE : -HOME_EDGE);
    const edge = team.rating - oppRating + hfa;
    const p = 1 / (1 + Math.pow(10, -edge / 15));
    probSum += p;
    const date = g.date
      ? new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'TBD';
    const at = g.neutralSite ? 'vs' : (isHome ? 'vs' : 'at');
    return `
      <div class="sched-row">
        <span class="sched-date">Wk ${g.week}<br>${date}</span>
        <span class="sched-opp">
          <span class="sched-at">${at}</span>
          ${opp && opp.logo ? `<img src="${opp.logo}" alt="" loading="lazy">` : ''}
          <span>${oppName}</span>
          ${opp ? `<span class="sched-opp-rank">#${opp.rank}</span>` : '<span class="sched-opp-rank">FCS</span>'}
        </span>
        <span class="sched-edge" title="projected edge incl. home field">${edge > 0 ? '+' : ''}${edge.toFixed(1)}</span>
        <span class="prob-chip ${probClass(p)}">${Math.round(p * 100)}%</span>
      </div>
    `;
  });

  const wins = probSum;
  const losses = games.length - probSum;
  document.getElementById('team-modal-body').innerHTML = `
    <div class="team-modal-head">
      ${team.logo ? `<img src="${team.logo}" alt="">` : ''}
      <div>
        <h2>${team.school}</h2>
        <div class="team-modal-sub">
          W² #${team.rank} · ${CONF_ACRO[team.conference] || team.conference}
          · ${(team.rating > 0 ? '+' : '') + team.rating.toFixed(1)}
          ${team.pollRank ? ` · ★ ESPN #${team.pollRank}` : ''}
        </div>
      </div>
    </div>
    <div class="team-proj-record">Projected: <strong>${wins.toFixed(1)}–${losses.toFixed(1)}</strong></div>
    <div class="sched-list">
      ${rows.join('') || '<div class="stub-card"><p>No 2026 games on the books yet.</p></div>'}
    </div>
    <p class="index-footnote">Edge = rating gap ±${HOME_EDGE} home field (≈ point spread) · % = win probability</p>
  `;
  document.getElementById('team-modal').hidden = false;
}

// --- Playoff bracket (computed live from the power index) ---

function buildPlayoffField(teams) {
  // Byes: presumptive P4 champs = highest-rated team in each power conference
  const champs = {};
  for (const t of teams) {
    if (t.confTier === 'power4' && !champs[t.conference]) champs[t.conference] = t;
  }
  const byes = Object.values(champs).sort((a, b) => a.rank - b.rank);
  // G6 auto bid: highest-rated Group of 6 team
  const g6 = teams.find(t => t.confTier === 'group6');
  // At-large: next 7 best by rating (Notre Dame eligible here)
  const taken = new Set([...byes, g6].map(t => t.school));
  const atLarge = teams.filter(t => !taken.has(t.school)).slice(0, 7);
  // Seeds 5-12: at-larges + G6 slotted by rating (G6 falls to 12 if lowest)
  const five12 = [...atLarge, g6].sort((a, b) => a.rank - b.rank);
  const seeds = [...byes, ...five12].map((t, i) => ({ seed: i + 1, ...t }));
  return { seeds, byes, g6, atLarge };
}

function winProb(a, b) {
  // rating diff ≈ point spread; logistic conversion to win probability
  return 1 / (1 + Math.pow(10, -(a.rating - b.rating) / 15));
}

function teamChip(t, { winner = false, prob = null, upset = false, loser = false } = {}) {
  if (!t) return '<div class="chip chip-tbd">TBD</div>';
  return `
    <div class="chip ${winner ? 'chip-win' : ''} ${loser ? 'chip-loser' : ''}"
      title="${t.seed} ${t.school}"
      style="--team-color:${t.color || 'var(--gold-dim)'}">
      <span class="chip-seed">${t.seed}</span>
      ${t.logo ? `<img class="chip-logo" src="${t.logo}" alt="" loading="lazy">` : ''}
      <span class="chip-name">${t.school}</span>
      ${upset ? '<span class="chip-upset">UPSET</span>' : ''}
      ${prob !== null ? `<span class="chip-prob">${Math.round(prob * 100)}%</span>` : ''}
    </div>
  `;
}

function matchupCard(a, b, winner) {
  const pWinner = winner === a ? winProb(a, b) : winProb(b, a);
  const upset = pWinner < 0.5;
  const chips = [a, b].map(t =>
    teamChip(t, {
      winner: t === winner,
      loser: t !== winner,
      prob: t === winner ? pWinner : null,
      upset: t === winner && upset,
    }));
  return `<div class="matchup">${chips.join('')}</div>`;
}

let BRACKET_FIELD = null;
let SIM_COUNT = 0;

function runBracketSim() {
  const { seeds, g6 } = BRACKET_FIELD;
  const s = n => seeds[n - 1];
  // stochastic: weighted coin flip on the rating-gap win probability
  const play = (a, b) => (Math.random() < winProb(a, b) ? a : b);
  SIM_COUNT++;

  // Real CFP pairings: QFs are 1v(8/9), 4v(5/12), 2v(7/10), 3v(6/11)
  const r1 = [[s(8), s(9)], [s(5), s(12)], [s(7), s(10)], [s(6), s(11)]];
  const r1w = r1.map(([a, b]) => play(a, b));
  const qf = [[s(1), r1w[0]], [s(4), r1w[1]], [s(2), r1w[2]], [s(3), r1w[3]]];
  const qfw = qf.map(([a, b]) => play(a, b));
  const sf = [[qfw[0], qfw[1]], [qfw[2], qfw[3]]];
  const sfw = sf.map(([a, b]) => play(a, b));
  const champ = play(sfw[0], sfw[1]);

  document.getElementById('bracket-live').innerHTML = `
    <div class="bracket-wrap">
      <div class="bracket">
        <div class="bracket-col">
          <div class="round-title">First Round<span>on campus</span></div>
          ${r1.map(([a, b], i) => matchupCard(a, b, r1w[i])).join('')}
        </div>
        <div class="bracket-col">
          <div class="round-title">Quarterfinals<span>bowl sites</span></div>
          ${qf.map(([a, b], i) => matchupCard(a, b, qfw[i])).join('')}
        </div>
        <div class="bracket-col">
          <div class="round-title">Semifinals<span>bowl sites</span></div>
          ${sf.map(([a, b], i) => matchupCard(a, b, sfw[i])).join('')}
        </div>
        <div class="bracket-col bracket-col-final">
          <div class="round-title">Natty<span>Las Vegas · Jan 25 '27</span></div>
          ${matchupCard(sfw[0], sfw[1], champ)}
          <div class="champ-card">
            <div class="champ-label">🎰 Sim #${SIM_COUNT} Champion</div>
            <div class="champ-team" style="--team-color:${champ.color || 'var(--gold)'}">
              ${champ.logo ? `<img src="${champ.logo}" alt="">` : ''}
              <span>${champ.school}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBracket(data) {
  BRACKET_FIELD = buildPlayoffField(data.teams);
  const { seeds, g6 } = BRACKET_FIELD;
  document.getElementById('tab-bracket').innerHTML = `
    <div class="sim-controls">
      <button class="format-btn" id="sim-btn">🎲 Run It Back</button>
      <button class="format-btn" id="format-btn">🏆 Playoff Format</button>
      <span class="sim-note">field locked from the W²-Index · results re-rolled every sim</span>
    </div>
    <div id="bracket-live"></div>
    <div class="bid-summary">
      <div class="bid-group">
        <h4>P4 Champs · byes</h4>
        <p>${seeds.slice(0, 4).map(t => `${t.seed} ${t.school}`).join(' · ')}</p>
      </div>
      <div class="bid-group">
        <h4>G6 auto bid</h4>
        <p>${g6.seed ?? ''} ${g6.school} (${CONF_ACRO[g6.conference] || g6.conference}, W² #${g6.rank})</p>
      </div>
      <div class="bid-group">
        <h4>At-large</h4>
        <p>${seeds.slice(4).filter(t => t.school !== g6.school).map(t => `${t.seed} ${t.school}`).join(' · ')}</p>
      </div>
    </div>
    <p class="index-footnote">Field & seeds are deterministic from the W²-Index: highest-rated team per P4 conference = presumptive champ (bye), top Group of 6 team gets the auto bid, next 7 by rating at-large. Game results are simulated — each game is a weighted coin flip on the rating-gap win probability, so underdogs really do win sometimes. % shown is the winner's pre-game chance.</p>
  `;
  document.getElementById('sim-btn').addEventListener('click', runBracketSim);
  runBracketSim();
}

async function loadBracket() {
  try {
    const res = await fetch('data/power-index-2026.json');
    if (!res.ok) throw new Error(res.status);
    renderBracket(await res.json());
  } catch {
    document.getElementById('tab-bracket').innerHTML = `
      <div class="stub-card">
        <h3>No index yet</h3>
        <p>The bracket seeds itself from the power index — run <code>python3 api/build_power_index.py</code> first.</p>
      </div>
    `;
  }
}

// --- Governance & Rules (renders data/governance.js; append to items to extend) ---

function govDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d; // year-only entries pass through
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US',
    { year: 'numeric', month: 'short', day: 'numeric' });
}

function govItemCard(item) {
  return `
    <div class="gov-item">
      <div class="gov-item-head">
        <h4>${item.title}</h4>
        <span class="gov-date">${govDate(item.date)}</span>
      </div>
      <p class="gov-summary">${item.summary}</p>
      <div class="gov-sources">
        ${item.sources.map(s =>
          `<a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a>`).join('')}
      </div>
    </div>
  `;
}

function governanceHTML() {
  const tiers = GOVERNANCE_TIMELINE.tiers.map(tier => {
    const items = [...tier.items].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return `
      <div class="gov-tier gov-${tier.tone}">
        <div class="gov-tier-head">
          <span class="gov-badge">${tier.badge}</span>
          <h3>${tier.label}</h3>
        </div>
        <p class="gov-tier-desc">${tier.description}</p>
        ${items.map(govItemCard).join('')}
      </div>
    `;
  });
  return `
    ${tiers.join('')}
    <p class="index-footnote">${GOVERNANCE_TIMELINE.disclaimer}
      Sources last reviewed ${GOVERNANCE_TIMELINE.lastReviewed}.</p>
  `;
}

// --- Learn hub: Field Guide modules + Policy & Governance ---
// Adding a 6th field-guide module = one JSON in data/field-guide/ + one line here.

const FIELD_GUIDE_MODULES = [
  { key: 'basics', icon: '🏈' },
  { key: 'positions', icon: '🧩' },
  { key: 'penalties', icon: '🚩' },
  { key: 'ncaa-vs-nfl', icon: '🔀' },
  { key: 'glossary', icon: '📖' },
];

const FIELD_GUIDE = {};   // key -> module JSON, loaded once

async function loadLearn() {
  try {
    const loaded = await Promise.all(FIELD_GUIDE_MODULES.map(m =>
      fetch(`data/field-guide/${m.key}.json`).then(r => r.json())));
    FIELD_GUIDE_MODULES.forEach((m, i) => { FIELD_GUIDE[m.key] = loaded[i]; });
    showLearn('hub');
  } catch {
    document.getElementById('tab-learn').innerHTML =
      '<div class="stub-card"><p>Could not load the Learn section.</p></div>';
  }
}

function fieldGuideEntry(entry) {
  return `
    <div class="fg-entry">
      <h4>${entry.term}</h4>
      <p>${entry.explanation}</p>
      ${entry.signal ? `<p class="fg-signal"><strong>Ref signal:</strong> ${entry.signal}</p>` : ''}
      ${entry.whenCalled ? `<p class="fg-signal"><strong>When it's called:</strong> ${entry.whenCalled}</p>` : ''}
      ${entry.example ? `<p class="fg-example">${entry.example}</p>` : ''}
    </div>
  `;
}

function learnHubHTML() {
  return `
    <div class="index-section-title">Learn <span>rules for new fans · policy for wonks</span></div>
    <div class="learn-group">Field Guide — how football works</div>
    <div class="learn-grid">
      ${FIELD_GUIDE_MODULES.map(m => {
        const mod = FIELD_GUIDE[m.key];
        return `
          <button class="learn-card" data-learn="${m.key}">
            <span class="learn-card-icon">${m.icon}</span>
            <span class="learn-card-body">
              <strong>${mod.title}</strong>
              <span>${mod.description}</span>
            </span>
          </button>
        `;
      }).join('')}
    </div>
    <div class="learn-group">Policy & Governance — the business of the sport</div>
    <div class="learn-grid">
      <button class="learn-card" data-learn="governance">
        <span class="learn-card-icon">⚖️</span>
        <span class="learn-card-body">
          <strong>Governance & Rules</strong>
          <span>NIL, revenue sharing, and transfer regulation — what's binding vs. proposed.</span>
        </span>
      </button>
    </div>
  `;
}

function showLearn(view) {
  const container = document.getElementById('tab-learn');
  if (view === 'hub') {
    container.innerHTML = learnHubHTML();
  } else {
    const back = '<button class="learn-back" data-learn="hub">← Learn</button>';
    if (view === 'governance') {
      container.innerHTML = `${back}${governanceHTML()}`;
    } else {
      const mod = FIELD_GUIDE[view];
      container.innerHTML = `
        ${back}
        <div class="index-section-title">${mod.title} <span>${mod.description}</span></div>
        <div class="fg-list ${view === 'glossary' ? 'fg-compact' : ''}">
          ${mod.entries.map(fieldGuideEntry).join('')}
        </div>
      `;
    }
  }
  container.querySelectorAll('[data-learn]').forEach(el =>
    el.addEventListener('click', () => showLearn(el.dataset.learn)));
  container.scrollIntoView({ block: 'nearest' });
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
  const teamOverlay = document.getElementById('team-modal');
  renderFormatModal(cfpFormat2026);
  // the trigger lives inside the bracket tab, which renders async — delegate
  document.addEventListener('click', e => {
    if (e.target.closest('#format-btn')) overlay.hidden = false;
  });
  document.getElementById('format-close').addEventListener('click', () => { overlay.hidden = true; });
  document.getElementById('team-close').addEventListener('click', () => { teamOverlay.hidden = true; });
  [overlay, teamOverlay].forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.hidden = true; });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { overlay.hidden = true; teamOverlay.hidden = true; }
  });
}

renderPoll();
initTabs();
loadSchedule();
loadTeamsDb();
loadPowerIndex();
loadBracket();
loadLearn();
buildMarqueeBulbs();
initFormatModal();
