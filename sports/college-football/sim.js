// Season Sim: Monte Carlo over the full 2026 schedule.
// 2,000 simulated seasons per run. Win probs come from W²-Index rating gaps
// (±2.5 home field, 0 neutral); the chaos slider blends every probability
// toward a coin flip: p' = (1-chaos)·p + chaos·50%.
// Committee proxy per simulated season (ranks the field for top-25/playoff):
//   score = wins − losses + rating/10 + SoS/20
// Playoff field per sim mirrors the 2026-27 format: 4 P4 champs + highest
// committee-ranked G6 team + next 7 by committee rank (Notre Dame needs no title).
(function () {
  const N_SIMS = 2000;
  const HFA = 2.5;
  const DIVISION_FIX = { 'Louisiana Tech': 'West' }; // 2026 SBC newcomer, unassigned in CFBD

  let TEAMS = [];          // [{school, rating, rank, conference, confTier, logo, color, division}]
  let IDX = new Map();     // school -> index into TEAMS
  let GAMES = [];          // [{h, a, week, conf, neutral}]  (h/a = team idx, -1 = FCS pool)
  let FCS_RATING = -23;
  let CONF_MEMBERS = {};   // conference -> [team idx]
  let ran = false;

  async function boot() {
    try {
      const [pi, gamesFile, db] = await Promise.all([
        fetch('data/power-index-2026.json').then(r => r.json()),
        fetch('data/games-2026.json').then(r => r.json()),
        fetch('data/teams-db.json').then(r => r.json()),
      ]);
      FCS_RATING = pi.fcsPoolRating;
      const divBySchool = new Map(db.teams.map(t => [t.school, t.division]));
      TEAMS = pi.teams.map(t => ({
        school: t.school, rating: t.rating, rank: t.rank,
        conference: t.conference, confTier: t.confTier,
        logo: t.logo, color: t.color,
        division: DIVISION_FIX[t.school] || divBySchool.get(t.school) || null,
      }));
      TEAMS.forEach((t, i) => IDX.set(t.school, i));
      for (const [i, t] of TEAMS.entries()) {
        if (t.conference === 'FBS Independents') continue;
        (CONF_MEMBERS[t.conference] = CONF_MEMBERS[t.conference] || []).push(i);
      }
      GAMES = gamesFile.games.map(g => {
        const h = IDX.has(g.homeTeam) ? IDX.get(g.homeTeam) : -1;
        const a = IDX.has(g.awayTeam) ? IDX.get(g.awayTeam) : -1;
        if (h < 0 && a < 0) return null;
        const conf = h >= 0 && a >= 0 &&
          TEAMS[h].conference === TEAMS[a].conference &&
          TEAMS[h].conference !== 'FBS Independents';
        return { h, a, week: g.week, conf, neutral: !!g.neutralSite };
      }).filter(Boolean);
      // expose a single-season simulator so the Playoff Bracket can populate
      // its field from a simulated season at any chaos level
      window.VivaSeasonSim = { simulateOneSeason };
      window.dispatchEvent(new Event('viva-sim-ready'));
      renderShell();
      // run lazily the first time the tab is opened
      const maybeRun = () => {
        if (!ran && location.hash === '#simulate') { ran = true; runAndRender(); }
      };
      window.addEventListener('hashchange', maybeRun);
      maybeRun();
    } catch {
      document.getElementById('tab-simulate').innerHTML =
        '<div class="stub-card"><h3>Season Sim unavailable</h3><p>Needs the index, schedule, and team DB built.</p></div>';
    }
  }

  function winProb(rDiff) {
    return 1 / (1 + Math.pow(10, -rDiff / 15));
  }

  function simulate(cutoffWeek, chaos) {
    const n = TEAMS.length;
    const games = GAMES.filter(g => g.week <= cutoffWeek);

    // static per-cutoff: games played + SoS term per team
    const played = new Int16Array(n);
    const sosSum = new Float64Array(n);
    for (const g of games) {
      if (g.h >= 0) { played[g.h]++; sosSum[g.h] += g.a >= 0 ? TEAMS[g.a].rating : FCS_RATING; }
      if (g.a >= 0) { played[g.a]++; sosSum[g.a] += g.h >= 0 ? TEAMS[g.h].rating : FCS_RATING; }
    }
    const staticScore = new Float64Array(n);   // rating/10 + SoS/20 (constant per sim)
    const sos = new Float64Array(n);           // avg opponent rating (projected SoS)
    for (let i = 0; i < n; i++) {
      sos[i] = played[i] ? sosSum[i] / played[i] : 0;
      staticScore[i] = TEAMS[i].rating / 10 + sos[i] / 20;
    }
    // pre-blend chaos into per-game home win probability
    const pHome = games.map(g => {
      const rh = g.h >= 0 ? TEAMS[g.h].rating : FCS_RATING;
      const ra = g.a >= 0 ? TEAMS[g.a].rating : FCS_RATING;
      const p = winProb(rh - ra + (g.neutral ? 0 : HFA));
      return (1 - chaos) * p + 0.5 * chaos;
    });
    const P4 = new Set(['SEC', 'Big Ten', 'Big 12', 'ACC']);

    // aggregates
    const agg = {
      wins: new Float64Array(n), confChamp: new Int32Array(n),
      titleGame: new Int32Array(n), playoff: new Int32Array(n),
      top12: new Int32Array(n), top25: new Int32Array(n),
      rankSum: new Float64Array(n), rankSq: new Float64Array(n),
      confWins: new Float64Array(n), confLoss: new Float64Array(n),
      played, sos,
    };
    const wins = new Int16Array(n), losses = new Int16Array(n);
    const cw = new Int16Array(n), cl = new Int16Array(n);
    const order = [...Array(n).keys()];

    for (let s = 0; s < N_SIMS; s++) {
      wins.fill(0); losses.fill(0); cw.fill(0); cl.fill(0);
      for (let gi = 0; gi < games.length; gi++) {
        const g = games[gi];
        const homeWins = Math.random() < pHome[gi];
        if (g.h >= 0) { homeWins ? wins[g.h]++ : losses[g.h]++; if (g.conf) homeWins ? cw[g.h]++ : cl[g.h]++; }
        if (g.a >= 0) { homeWins ? losses[g.a]++ : wins[g.a]++; if (g.conf) homeWins ? cl[g.a]++ : cw[g.a]++; }
      }
      for (let i = 0; i < n; i++) {
        agg.wins[i] += wins[i];
        agg.confWins[i] += cw[i];
        agg.confLoss[i] += cl[i];
      }

      // conference championships
      const champs = {};
      for (const [conf, members] of Object.entries(CONF_MEMBERS)) {
        const sorted = [...members].sort((x, y) => {
          const px = cw[x] + cl[x] ? cw[x] / (cw[x] + cl[x]) : 0;
          const py = cw[y] + cl[y] ? cw[y] / (cw[y] + cl[y]) : 0;
          if (py !== px) return py - px;
          const ox = wins[x] + losses[x] ? wins[x] / (wins[x] + losses[x]) : 0;
          const oy = wins[y] + losses[y] ? wins[y] / (wins[y] + losses[y]) : 0;
          if (oy !== ox) return oy - ox;
          return TEAMS[y].rating - TEAMS[x].rating;
        });
        let t1, t2;
        const divisions = [...new Set(sorted.map(i => TEAMS[i].division).filter(Boolean))];
        if (divisions.length >= 2) {
          t1 = sorted.find(i => TEAMS[i].division === divisions[0]);
          t2 = sorted.find(i => TEAMS[i].division === divisions[1]);
        } else {
          [t1, t2] = sorted;
        }
        if (t2 == null) { champs[conf] = t1; agg.confChamp[t1]++; agg.titleGame[t1]++; continue; }
        agg.titleGame[t1]++; agg.titleGame[t2]++;
        const p1 = (1 - chaos) * winProb(TEAMS[t1].rating - TEAMS[t2].rating) + 0.5 * chaos;
        const c = Math.random() < p1 ? t1 : t2;
        champs[conf] = c;
        agg.confChamp[c]++;
      }

      // committee proxy ranking
      order.sort((x, y) =>
        (wins[y] - losses[y] + staticScore[y]) - (wins[x] - losses[x] + staticScore[x]));
      const rank = new Int16Array(n);
      for (let r = 0; r < n; r++) {
        const i = order[r];
        rank[i] = r + 1;
        agg.rankSum[i] += r + 1;
        agg.rankSq[i] += (r + 1) ** 2;
        if (r < 12) agg.top12[i]++;
        if (r < 25) agg.top25[i]++;
      }

      // playoff field: P4 champs + best G6 + next 7 by committee rank
      const field = new Set();
      for (const [conf, c] of Object.entries(champs)) if (P4.has(conf)) field.add(c);
      const g6 = order.find(i => TEAMS[i].confTier === 'group6');
      if (g6 != null) field.add(g6);
      for (const i of order) {
        if (field.size >= 12) break;
        field.add(i);
      }
      for (const i of field) agg.playoff[i]++;
    }
    return agg;
  }

  // Single simulated season → the 12-team playoff field, seeded, for the bracket.
  // chaos 0 is deterministic (favorites always win) so the field == the expected
  // "chalk" field; higher chaos lets upset conference champions crash in.
  function simulateOneSeason(chaos, cutoff = 99) {
    const n = TEAMS.length;
    const games = GAMES.filter(g => g.week <= cutoff);
    const flip = p => (chaos <= 0 ? p >= 0.5 : Math.random() < p);

    const played = new Int16Array(n), sosSum = new Float64Array(n);
    for (const g of games) {
      if (g.h >= 0) { played[g.h]++; sosSum[g.h] += g.a >= 0 ? TEAMS[g.a].rating : FCS_RATING; }
      if (g.a >= 0) { played[g.a]++; sosSum[g.a] += g.h >= 0 ? TEAMS[g.h].rating : FCS_RATING; }
    }
    const staticScore = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const sos = played[i] ? sosSum[i] / played[i] : 0;
      staticScore[i] = TEAMS[i].rating / 10 + sos / 20;
    }

    const wins = new Int16Array(n), losses = new Int16Array(n);
    const cw = new Int16Array(n), cl = new Int16Array(n);
    for (const g of games) {
      const rh = g.h >= 0 ? TEAMS[g.h].rating : FCS_RATING;
      const ra = g.a >= 0 ? TEAMS[g.a].rating : FCS_RATING;
      const p = (1 - chaos) * winProb(rh - ra + (g.neutral ? 0 : HFA)) + 0.5 * chaos;
      const homeWins = flip(p);
      if (g.h >= 0) { homeWins ? wins[g.h]++ : losses[g.h]++; if (g.conf) homeWins ? cw[g.h]++ : cl[g.h]++; }
      if (g.a >= 0) { homeWins ? losses[g.a]++ : wins[g.a]++; if (g.conf) homeWins ? cl[g.a]++ : cw[g.a]++; }
    }

    const order = [...Array(n).keys()].sort((x, y) =>
      (wins[y] - losses[y] + staticScore[y]) - (wins[x] - losses[x] + staticScore[x]));
    const rankOf = new Int16Array(n);
    order.forEach((i, r) => rankOf[i] = r + 1);

    // conference champions (division winners meet where divisions exist, else top two)
    const champs = {};
    for (const [conf, members] of Object.entries(CONF_MEMBERS)) {
      const sorted = [...members].sort((x, y) => {
        const px = cw[x] + cl[x] ? cw[x] / (cw[x] + cl[x]) : 0;
        const py = cw[y] + cl[y] ? cw[y] / (cw[y] + cl[y]) : 0;
        if (py !== px) return py - px;
        return rankOf[x] - rankOf[y];
      });
      const divisions = [...new Set(sorted.map(i => TEAMS[i].division).filter(Boolean))];
      let t1, t2;
      if (divisions.length >= 2) {
        t1 = sorted.find(i => TEAMS[i].division === divisions[0]);
        t2 = sorted.find(i => TEAMS[i].division === divisions[1]);
      } else { [t1, t2] = sorted; }
      if (t2 == null) { champs[conf] = t1; continue; }
      const p1 = (1 - chaos) * winProb(TEAMS[t1].rating - TEAMS[t2].rating) + 0.5 * chaos;
      champs[conf] = flip(p1) ? t1 : t2;
    }

    const P4 = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    const byes = P4.map(c => champs[c]).filter(i => i != null).sort((a, b) => rankOf[a] - rankOf[b]);
    const g6idx = order.find(i => TEAMS[i].confTier === 'group6');
    const taken = new Set([...byes, g6idx]);
    const atLarge = [];
    for (const i of order) { if (atLarge.length >= 7) break; if (!taken.has(i)) atLarge.push(i); }
    const five12 = [...atLarge, g6idx].sort((a, b) => rankOf[a] - rankOf[b]);
    const seedIdx = [...byes, ...five12];
    const wrap = i => ({ ...TEAMS[i] });
    const seeds = seedIdx.map((i, k) => ({ seed: k + 1, ...TEAMS[i] }));
    return {
      seeds,
      byes: byes.map(wrap),
      g6: { seed: seedIdx.indexOf(g6idx) + 1, ...TEAMS[g6idx] },
      atLarge: atLarge.map(wrap),
    };
  }

  // --- UI ---

  const TERMINALS = {
    playoff: 'Make the playoff',
    champ: 'Win the conference',
    title: 'Reach the title game',
    top12: 'Finish top 12',
    top25: 'Finish top 25',
  };

  function renderShell() {
    const weeks = [...new Set(GAMES.map(g => g.week))].sort((a, b) => a - b);
    const confs = Object.keys(CONF_MEMBERS).sort();
    document.getElementById('tab-simulate').innerHTML = `
      <div class="index-section-title">Season Sim
        <span>${N_SIMS.toLocaleString()} simulated seasons · W²-Index vs the schedule · nothing here changes the real index</span></div>
      <div class="schedule-controls">
        <select id="sim-scope" class="week-select">
          <option value="">All FBS · playoff race</option>
          ${confs.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="sim-terminal" class="week-select"></select>
        <select id="sim-week" class="week-select">
          <option value="99">Full season</option>
          ${weeks.slice(0, -1).map(w => `<option value="${w}">Through week ${w}</option>`).join('')}
        </select>
        <button class="format-btn" id="sim-reroll">🎲 Re-roll</button>
      </div>
      <div class="chaos-row">
        <span class="chaos-end">🖍️ Chalk</span>
        <input type="range" id="sim-chaos" min="0" max="100" step="5" value="25" aria-label="Chaos level">
        <span class="chaos-end">Chaos 🌪️</span>
        <span class="chaos-val" id="sim-chaos-val">25%</span>
        <span class="sim-note" id="sim-chaos-note">favorites mostly hold</span>
      </div>
      <div class="sim-cards" id="sim-cards"></div>
      <div class="fate-wrap"><div id="fate-field"></div></div>
      <div id="sim-table"></div>
      <p class="index-footnote">Each game is decided by W²-Index rating gap ±${HFA} home field,
        blended toward a 50/50 coin flip by the chaos setting. Committee proxy per simulated
        season: wins − losses + rating/10 + SoS/20. Title games: division winners meet where
        divisions exist (Sun Belt), otherwise the top two in conference standings.</p>
    `;
    document.getElementById('sim-scope').addEventListener('change', () => { syncTerminals(); runAndRender(); });
    document.getElementById('sim-terminal').addEventListener('change', drawOnly);
    document.getElementById('sim-week').addEventListener('change', runAndRender);
    document.getElementById('sim-reroll').addEventListener('click', runAndRender);
    const chaos = document.getElementById('sim-chaos');
    chaos.addEventListener('input', () => {
      const v = Number(chaos.value);
      document.getElementById('sim-chaos-val').textContent = `${v}%`;
      document.getElementById('sim-chaos-note').textContent =
        v === 0 ? 'pure chalk — ratings decide' :
        v <= 30 ? 'favorites mostly hold' :
        v <= 60 ? 'upsets are live' :
        v < 100 ? 'madness brewing' : 'anything can happen';
    });
    chaos.addEventListener('change', runAndRender);
    document.getElementById('fate-field').addEventListener('click', e => {
      const m = e.target.closest('.ff-marker');
      if (m && m.dataset.team) openSimCard(m.dataset.team);
    });
    syncTerminals();
  }

  function ordinal(x) {
    const r = Math.round(x);
    const s = ['th', 'st', 'nd', 'rd'], v = r % 100;
    return r + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function openSimCard(school) {
    const r = LAST_ROWS.get(school);
    if (!r) return;
    let ov = document.getElementById('sim-card-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'sim-card-overlay';
      ov.className = 'modal-overlay';
      ov.addEventListener('click', e => { if (e.target === ov) ov.hidden = true; });
      document.body.appendChild(ov);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') ov.hidden = true; });
    }
    const t = r.t;
    const stat = (label, val) => `<div class="scard-stat"><span>${label}</span><strong>${val}</strong></div>`;
    const sign = v => (v > 0 ? '+' : '') + v.toFixed(1);
    ov.innerHTML = `
      <div class="modal-card scard" style="--team-color:${t.color || 'var(--gold-dim)'}">
        <button class="modal-close" aria-label="Close" onclick="this.closest('.modal-overlay').hidden=true">✕</button>
        <div class="scard-head">
          ${t.logo ? `<img src="${t.logo}" alt="">` : ''}
          <div>
            <h2>${t.school}</h2>
            <div class="scard-sub">${t.conference} · W²-Index #${t.rank} · rating ${sign(t.rating)}</div>
          </div>
          <div class="scard-rank"><span>proj. rank</span><strong>#${r.projSeed}</strong></div>
        </div>
        <div class="scard-grid">
          ${stat('Projected record', `${r.avgW.toFixed(1)}–${r.avgL.toFixed(1)}`)}
          ${stat('Conference record', `${r.confW.toFixed(1)}–${r.confL.toFixed(1)}`)}
          ${stat('Conference finish', `${ordinal(r.confStand)} in ${CONF_ACRO[t.conference] || t.conference}`)}
          ${stat('Strength of schedule', `${sign(r.sos)} avg opp`)}
          ${stat('Avg sim finish', `${ordinal(r.projRank)}`)}
          ${stat('Playoff', `${Math.round(r.playoff * 100)}%`)}
          ${stat('Conf title', `${Math.round(r.champ * 100)}%`)}
          ${stat('Top 25 finish', `${Math.round(r.top25 * 100)}%`)}
        </div>
        <p class="index-footnote" style="margin-top:12px">Projected over ${N_SIMS.toLocaleString()} simulated
          seasons at the current chaos setting.</p>
      </div>`;
    ov.hidden = false;
  }

  function syncTerminals() {
    const scope = document.getElementById('sim-scope').value;
    const sel = document.getElementById('sim-terminal');
    const opts = scope
      ? ['champ', 'title', 'playoff', 'top25']
      : ['playoff', 'top12', 'top25', 'champ'];
    sel.innerHTML = opts.map(k => `<option value="${k}">${TERMINALS[k]}</option>`).join('');
  }

  let LAST = null;        // last aggregates
  let LAST_ROWS = new Map();   // school -> projection row (for the click-through card)

  function runAndRender() {
    const status = document.getElementById('sim-cards');
    if (status) status.innerHTML = '<div class="sim-card sim-running">🎰 Simulating 2,000 seasons…</div>';
    setTimeout(() => {
      const cutoff = Number(document.getElementById('sim-week').value);
      const chaos = Number(document.getElementById('sim-chaos').value) / 100;
      LAST = simulate(cutoff, chaos);
      drawOnly();
    }, 30);
  }

  function drawOnly() {
    if (!LAST) return;
    const agg = LAST;
    const scope = document.getElementById('sim-scope').value;
    const terminal = document.getElementById('sim-terminal').value;
    const teams = TEAMS.map((t, i) => i)
      .filter(i => !scope || TEAMS[i].conference === scope);

    const pOf = i => {
      const c = { playoff: agg.playoff, champ: agg.confChamp, title: agg.titleGame,
                  top12: agg.top12, top25: agg.top25 }[terminal][i];
      return c / N_SIMS;
    };
    const rows = teams.map(i => {
      const t = TEAMS[i];
      const avgW = agg.wins[i] / N_SIMS;
      const g = agg.played[i];
      const mean = agg.rankSum[i] / N_SIMS;
      const sd = Math.sqrt(Math.max(0, agg.rankSq[i] / N_SIMS - mean * mean));
      return { i, t, p: pOf(i), avgW, avgL: g - avgW, games: g, rankSd: sd,
               projRank: mean, sos: agg.sos[i],
               confW: agg.confWins[i] / N_SIMS, confL: agg.confLoss[i] / N_SIMS,
               champ: agg.confChamp[i] / N_SIMS, title: agg.titleGame[i] / N_SIMS,
               playoff: agg.playoff[i] / N_SIMS, top12: agg.top12[i] / N_SIMS,
               top25: agg.top25[i] / N_SIMS };
    }).sort((a, b) => b.p - a.p);
    // peer-ordering projected rank across ALL FBS teams (stable, intuitive —
    // the mean sim finish is right-skewed by disaster runs, so we rank teams by it)
    const projOrder = TEAMS.map((t, i) => ({ school: t.school, mean: agg.rankSum[i] / N_SIMS }))
      .sort((a, b) => a.mean - b.mean);
    const projSeed = new Map(projOrder.map((o, k) => [o.school, k + 1]));
    // projected conference standings: order each conference by AVERAGE conf wins
    // (not the noisy mean of per-sim standings, which buried the clear favorites)
    const byConf = {};
    TEAMS.forEach((t, i) => {
      if (t.conference === 'FBS Independents') return;
      (byConf[t.conference] = byConf[t.conference] || []).push(
        { school: t.school, cw: agg.confWins[i] / N_SIMS, rating: t.rating });
    });
    const confRank = new Map();
    for (const arr of Object.values(byConf)) {
      arr.sort((a, b) => b.cw - a.cw || b.rating - a.rating);
      arr.forEach((o, k) => confRank.set(o.school, k + 1));
    }
    rows.forEach(r => {
      r.projSeed = projSeed.get(r.t.school);
      r.confStand = confRank.get(r.t.school);
    });
    LAST_ROWS = new Map(rows.map(r => [r.t.school, r]));

    // insight cards
    const best = rows[0];
    const byRating = [...rows].sort((a, b) => b.t.rating - a.t.rating);
    const idxRank = new Map(byRating.map((r, k) => [r.i, k + 1]));
    let riser = null, riserShift = 0;
    rows.forEach((r, k) => {
      const shift = idxRank.get(r.i) - (k + 1);
      if (shift > riserShift) { riserShift = shift; riser = r; }
    });
    const widest = [...rows].sort((a, b) => b.rankSd - a.rankSd)[0];
    const card = (label, r, detail) => r ? `
      <div class="sim-card">
        <h4>${label}</h4>
        <div class="sim-card-team">${r.t.logo ? `<img src="${r.t.logo}" alt="">` : ''}${r.t.school}</div>
        <div class="sim-card-val">${detail}</div>
      </div>` : '';
    document.getElementById('sim-cards').innerHTML =
      card(`Highest ${TERMINALS[terminal].toLowerCase()} chance`, best, `${(best.p * 100).toFixed(1)}%`) +
      card('Simulation riser', riser, riser ? `+${riserShift} positions vs W²-Index` : '') +
      card('Widest outcome range', widest, 'most distributed finish profile');

    drawFateField(rows, terminal);
    drawTable(rows, scope);
  }

  function drawFateField(rows, terminal) {
    const W = 940, H = 520, L = 64, R = 28, T = 24, B = 56;
    const xs = rows.map(r => r.t.rating);
    const xMin = Math.min(...xs) - 1.5, xMax = Math.max(...xs) + 1.5;
    const yMax = Math.max(0.05, Math.max(...rows.map(r => r.p)) * 1.15);
    const X = v => L + ((v - xMin) / (xMax - xMin)) * (W - L - R);
    const Y = p => H - B - (p / yMax) * (H - T - B);

    const size = rows.length > 40 ? 24 : 32;
    const pts = rows.map(r => ({ r, x: X(r.t.rating), y: Y(r.p) }));
    // relax collisions: push overlapping markers apart (mostly vertically)
    for (let iter = 0; iter < 60; iter++) {
      let moved = false;
      for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) {
        const dx = pts[b].x - pts[a].x, dy = pts[b].y - pts[a].y;
        const d = Math.hypot(dx, dy), min = size + 2;
        if (d < min && d > 0.01) {
          const push = (min - d) / 2, ux = (dx / d) * 0.25, uy = dy / d || 1;
          pts[a].x -= ux * push; pts[a].y -= uy * push;
          pts[b].x += ux * push; pts[b].y += uy * push;
          moved = true;
        }
      }
      if (!moved) break;
    }
    pts.forEach(p => {
      p.x = Math.max(L + size / 2, Math.min(W - R - size / 2, p.x));
      p.y = Math.max(T + size / 2, Math.min(H - B - size / 2, p.y));
    });

    const trail = [...pts].sort((a, b) => a.x - b.x)
      .map(p => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' ');
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * yMax);
    const xTicks = [0, 0.25, 0.5, 0.75, 1].map(f => xMin + f * (xMax - xMin));

    document.getElementById('fate-field').innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="fate-svg">
        <defs>
          <linearGradient id="ffPlot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#241c20"/><stop offset="1" stop-color="#181215"/>
          </linearGradient>
          <filter id="ffGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="#f7f2e8" flood-opacity="0.95"/>
          </filter>
        </defs>
        <rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" rx="10" fill="url(#ffPlot)"/>
        ${yTicks.map(p => `
          <line x1="${L}" x2="${W - R}" y1="${Y(p)}" y2="${Y(p)}" class="ff-grid"/>
          <text x="${L - 8}" y="${Y(p) + 4}" class="ff-tick" text-anchor="end">${Math.round(p * 100)}%</text>`).join('')}
        ${xTicks.map(v => `
          <text x="${X(v)}" y="${H - B + 22}" class="ff-tick" text-anchor="middle">${v > 0 ? '+' : ''}${v.toFixed(0)}</text>`).join('')}
        <polyline points="${trail}" class="ff-trail"/>
        ${pts.map(({ r, x, y }) => `
          <g class="ff-marker" data-team="${r.t.school.replace(/"/g, '&quot;')}" style="cursor:pointer">
            <title>${r.t.school} · click for the full projection</title>
            <rect x="${x - size / 2 - 4}" y="${y - size / 2 - 4}" width="${size + 8}" height="${size + 8}"
              fill="transparent"/>
            ${r.t.logo ? `<image href="${r.t.logo}" x="${x - size / 2}" y="${y - size / 2}"
              width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" filter="url(#ffGlow)"/>`
              : `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#f7f2e8" filter="url(#ffGlow)">${(CONF_ACRO[r.t.conference] || '?').slice(0, 3)}</text>`}
          </g>`).join('')}
        <text x="${(L + W - R) / 2}" y="${H - 8}" class="ff-axis" text-anchor="middle">W²-INDEX STRENGTH</text>
        <text x="16" y="${(T + H - B) / 2}" class="ff-axis" text-anchor="middle"
          transform="rotate(-90 16 ${(T + H - B) / 2})">${TERMINALS[terminal].toUpperCase()} — PROBABILITY</text>
      </svg>
    `;
  }

  function drawTable(rows, scope) {
    const pct = v => v >= 0.995 ? '>99%' : v < 0.005 ? '—' : Math.round(v * 100) + '%';
    const cols = scope
      ? ['Proj record', 'Title game', 'Conf champ', 'Playoff']
      : ['Proj record', 'Playoff', 'Top 12', 'Conf champ'];
    document.getElementById('sim-table').innerHTML = `
      <div class="matrix-wrap" style="margin-top:20px">
        <table class="conf-matrix sim-table">
          <tr><th style="text-align:left">Team</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
          ${rows.slice(0, scope ? rows.length : 30).map(r => `
            <tr>
              <td style="text-align:left; white-space:nowrap">
                ${r.t.logo ? `<img src="${r.t.logo}" style="width:16px;height:16px;object-fit:contain;vertical-align:-3px;margin-right:6px">` : ''}
                <strong>${r.t.school}</strong>
                <span style="color:rgba(255,255,255,0.35);font-size:0.68rem"> ${CONF_ACRO[r.t.conference] || r.t.conference}</span>
              </td>
              <td>${r.avgW.toFixed(1)}–${r.avgL.toFixed(1)}</td>
              ${scope
                ? `<td>${pct(r.title)}</td><td>${pct(r.champ)}</td><td>${pct(r.playoff)}</td>`
                : `<td>${pct(r.playoff)}</td><td>${pct(r.top12)}</td><td>${pct(r.champ)}</td>`}
            </tr>`).join('')}
        </table>
      </div>
      ${!scope && rows.length > 30 ? '<p class="index-footnote">showing the top 30 — pick a conference for the full field</p>' : ''}
    `;
  }

  boot();
})();
