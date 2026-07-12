// Viva CFP home — demo bento dashboard over the existing data/engines.
// Quick preview layer: each tile shows a compact slice + links into the full tab.
const CONF_ACRO = {
  'SEC': 'SEC', 'Big Ten': 'B10', 'Big 12': 'B12', 'ACC': 'ACC', 'Pac-12': 'P12',
  'American Athletic': 'AAC', 'Sun Belt': 'SBC', 'Mountain West': 'MW',
  'Conference USA': 'CUSA', 'Mid-American': 'MAC', 'FBS Independents': 'IND',
};
let CAL = { b: 1, h: 2.5 };

const logo = t => t?.logo ? `<img class="mini-logo" src="${t.logo}" alt="" loading="lazy">` : '';
const sign = v => (v > 0 ? '+' : '') + v.toFixed(1);

async function boot() {
  let pi, games = [], lines = [];
  try {
    const [a, b, c, d] = await Promise.all([
      fetch('data/power-index-2026.json').then(r => r.json()),
      fetch('data/games-2026.json').then(r => r.ok ? r.json() : { games: [] }),
      fetch('data/lines-2026.json').then(r => r.ok ? r.json() : { games: [] }),
      fetch('data/spread-cal.json').then(r => r.ok ? r.json() : null),
    ]);
    pi = a; games = b.games; lines = c.games;
    if (d) CAL = { b: d.b, h: d.h };
  } catch {
    document.getElementById('bento').innerHTML =
      '<div class="tile"><p class="mini-sub">Could not load season data. Build the index + schedule first.</p></div>';
    return;
  }
  const teams = pi.teams;
  const byName = new Map(teams.map(t => [t.school, t]));
  const marketById = new Map(lines.map(g => [g.id, g]));

  document.getElementById('bento').innerHTML = [
    w2Tile(teams),
    confTile(teams),
    bracketTile(teams),
    scheduleTile(games, byName, pi.fcsPoolRating),
    signalsTile(games, byName, marketById, pi.fcsPoolRating),
    newsTile(),
  ].join('');
}

function tile(title, icon, href, body, cls = '') {
  return `<div class="tile ${cls}">
    <div class="tile-head">
      <h2>${icon} ${title}</h2>
      ${href ? `<a class="tile-open" href="${href}">open →</a>` : ''}
    </div>${body}</div>`;
}

// 1) W²-Index (top 8)
function w2Tile(teams) {
  const body = teams.slice(0, 8).map(t => `
    <div class="mini-row">
      <span class="mini-rank">${t.rank}</span>${logo(t)}
      <span class="mini-name">${t.school}</span>
      <span class="mini-conf">${CONF_ACRO[t.conference] || t.conference}</span>
      <span class="mini-val">${sign(t.rating)}</span>
    </div>`).join('');
  return tile('W²-Index', '📊', 'index.html#index', body);
}

// 2) Conference-winner favorites (top team per major conf by rating)
function confTile(teams) {
  const order = ['SEC', 'Big Ten', 'Big 12', 'ACC', 'American Athletic', 'Mountain West'];
  const byConf = {};
  for (const t of teams) (byConf[t.conference] = byConf[t.conference] || []).push(t);
  const body = order.filter(c => byConf[c]).map(c => {
    const top2 = byConf[c].sort((a, b) => b.rating - a.rating).slice(0, 2);
    return `<div class="conf-block">
      <div class="conf-label">${CONF_ACRO[c] || c}</div>
      ${top2.map((t, i) => `<div class="mini-row">
        <span class="mini-rank">${i === 0 ? '★' : ''}</span>${logo(t)}
        <span class="mini-name">${t.school}</span>
        <span class="mini-val">${sign(t.rating)}</span></div>`).join('')}
    </div>`;
  }).join('');
  return tile('Conference Race', '🏆', 'index.html#simulate', body);
}

// 3) Playoff bracket field (deterministic from the index)
function bracketTile(teams) {
  const champs = {};
  for (const t of teams) if (t.confTier === 'power4' && !champs[t.conference]) champs[t.conference] = t;
  const byes = Object.values(champs).sort((a, b) => a.rank - b.rank);
  const g6 = teams.find(t => t.confTier === 'group6');
  const taken = new Set([...byes, g6].map(t => t.school));
  const atLarge = teams.filter(t => !taken.has(t.school)).slice(0, 7);
  const seeds = [...byes, ...[...atLarge, g6].sort((a, b) => a.rank - b.rank)]
    .map((t, i) => ({ seed: i + 1, ...t }));
  const chip = t => `<span class="seed-chip ${t.seed <= 4 ? 'bye' : ''}" style="--tc:${t.color || 'var(--gold-dim)'}">
    <span class="s">${t.seed}</span>${logo(t).replace('mini-logo', '')}<span>${t.school}</span></span>`;
  const body = `<p class="mini-sub" style="margin:-4px 0 8px">Projected field · seeds 1–4 bye (gold)</p>
    <div class="chip-strip">${seeds.map(chip).join('')}</div>`;
  return tile('Playoff Bracket', '🎰', 'index.html#bracket', body, 'span2');
}

// spread head → margin from this team's perspective
function calMargin(gap, isHome) { return CAL.b * gap + CAL.h * isHome; }

// 4) Best upcoming matchups (marquee score)
function scheduleTile(games, byName, fcs) {
  const score = g => {
    const h = byName.get(g.homeTeam), a = byName.get(g.awayTeam);
    const rh = h ? h.rating : fcs, ra = a ? a.rating : fcs;
    const spread = Math.abs(calMargin(rh - ra, g.neutralSite ? 0 : 1));
    const bonus = t => !t ? 0 : t.rank <= 12 ? 3 : t.rank <= 25 ? 1.5 : 0;
    return (rh + ra) / 2 - spread / 2 + bonus(h) + bonus(a);
  };
  const top = [...games].sort((x, y) => score(y) - score(x)).slice(0, 5);
  const body = top.map(g => {
    const h = byName.get(g.homeTeam), a = byName.get(g.awayTeam);
    const wk = `Wk ${g.week}`;
    return `<div class="mini-row">
      ${logo(a)}<span class="mini-name">${g.awayTeam}</span>
      <span class="mini-sub">${g.neutralSite ? 'vs' : '@'}</span>
      ${logo(h)}<span class="mini-name" style="text-align:right">${g.homeTeam}</span>
      <span class="mini-conf">${wk}</span></div>`;
  }).join('');
  return tile('Best Matchups', '📅', 'index.html#schedule', body, 'span2');
}

// 5) Spread-model signal detector (biggest edges vs market on competitive games)
function signalsTile(games, byName, marketById, fcs) {
  const sigs = [];
  for (const g of games) {
    const mk = marketById.get(g.id);
    if (!mk || mk.marketSpread == null) continue;
    const h = byName.get(g.homeTeam), a = byName.get(g.awayTeam);
    const rh = h ? h.rating : fcs, ra = a ? a.rating : fcs;
    const modelHome = calMargin(rh - ra, g.neutralSite ? 0 : 1);
    const mktHome = -mk.marketSpread;
    if (Math.abs(mktHome) > 21) continue;                 // skip cupcake blowouts
    if (Math.sign(modelHome) !== Math.sign(mktHome) && Math.abs(modelHome) >= 10 && Math.abs(mktHome) >= 10) continue;
    const edge = modelHome - mktHome;
    const team = edge >= 0 ? g.homeTeam : g.awayTeam;
    sigs.push({ team, edge: Math.abs(edge), g, teamObj: byName.get(team) });
  }
  sigs.sort((x, y) => y.edge - x.edge);
  const body = sigs.length ? sigs.slice(0, 5).map(s => `
    <div class="mini-row">
      ${logo(s.teamObj)}<span class="mini-name">${s.team}</span>
      <span class="mini-sub">vs ${s.g.homeTeam === s.team ? s.g.awayTeam : s.g.homeTeam}</span>
      <span class="edge-pill ${s.edge >= 3 ? 'e-hi' : 'e-mid'}">+${s.edge.toFixed(1)}</span>
    </div>`).join('')
    : '<p class="mini-sub">No market lines posted yet — books post most closer to kickoff.</p>';
  return tile('Signal Detector', '🎯', 'index.html#schedule', body);
}

// 6) News / governance updates
function newsTile() {
  const g = typeof GOVERNANCE_TIMELINE !== 'undefined' ? GOVERNANCE_TIMELINE : null;
  if (!g) return tile('News & Rules', '📰', 'index.html#learn', '<p class="mini-sub">—</p>');
  const items = g.tiers.flatMap(t => t.items.map(it => ({ ...it, tone: t.tone })))
    .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 3);
  const body = items.map(it => `<div class="news-item">
    <div><span class="news-badge nb-${it.tone}">${it.tone}</span>
      <span class="news-date"> ${it.date}</span></div>
    <div class="news-title">${it.title}</div></div>`).join('');
  return tile('News & Rules', '📰', 'index.html#learn', body);
}

boot();
