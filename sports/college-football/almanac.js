// Biff's Almanac — PIN-gated skunkworks: how W² spreads perform vs actual spreads.
// Client-side gate only (this is a static site — obscurity, not real security).
// >>> Change the access code here: <<<
const ALMANAC_PIN = '2015';   // BTTF: the year Gray's Sports Almanac is from

const CONF_ACRO = {
  'SEC': 'SEC', 'Big Ten': 'B10', 'Big 12': 'B12', 'ACC': 'ACC', 'Pac-12': 'P12',
  'American Athletic': 'AAC', 'Sun Belt': 'SBC', 'Mountain West': 'MW',
  'Conference USA': 'CUSA', 'Mid-American': 'MAC', 'FBS Independents': 'IND',
};

function initGate() {
  const veil = document.getElementById('lock-veil');
  const root = document.getElementById('almanac-root');
  const input = document.getElementById('pin-input');
  const err = document.getElementById('pin-err');

  function unlock() {
    veil.classList.add('biff-hidden');
    root.classList.remove('biff-hidden');
    sessionStorage.setItem('biff-unlocked', '1');
    loadAlmanac();
  }
  function tryPin() {
    if (input.value === ALMANAC_PIN) unlock();
    else { err.textContent = 'Wrong code. Try again, McFly.'; input.value = ''; }
  }
  document.getElementById('pin-go').addEventListener('click', tryPin);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryPin(); });

  if (sessionStorage.getItem('biff-unlocked')) unlock();
}

const pct = v => (v == null ? '—' : `${v}%`);
const signed = v => (v > 0 ? '+' : '') + v;

async function loadAlmanac() {
  let data;
  try {
    const res = await fetch('data/almanac-2025.json');
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    document.getElementById('almanac-body').innerHTML =
      '<div class="stub-card"><h3>No almanac yet</h3><p>Run <code>python3 api/build_almanac.py</code>.</p></div>';
    return;
  }
  render(data);
}

function verdictCards(s) {
  const c = (big, lbl, cls = '') => `
    <div class="verdict-card"><div class="big ${cls}">${big}</div><div class="lbl">${lbl}</div></div>`;
  const w2Sharper = s.w2Mae <= s.mktMae;
  const e3 = s.ats.e3;
  return `
    <div class="verdict-grid">
      ${c(s.games, 'games graded')}
      ${c(s.w2Mae, 'W² avg miss (pts)', w2Sharper ? 'good' : 'bad')}
      ${c(s.mktMae, 'market avg miss (pts)')}
      ${c(pct(s.w2CloserPct), 'games W² was closer', s.w2CloserPct >= 50 ? 'good' : 'bad')}
      ${c(`${e3.w}–${e3.l}`, 'ATS on 3+ pt edges')}
      ${c(pct(e3.roi == null ? null : signed(e3.roi)), 'ROI at -110', (e3.roi || 0) > 0 ? 'good' : 'bad')}
    </div>`;
}

function atsTable(ats) {
  const rows = [
    ['Every disagreement', ats.all], ['Edge ≥ 1 pt', ats.e1],
    ['Edge ≥ 3 pts', ats.e3], ['Edge ≥ 6 pts', ats.e6],
  ];
  return `
    <div class="matrix-wrap" style="margin-top:6px">
      <table class="conf-matrix">
        <tr><th style="text-align:left">Bet W² when…</th><th>Record</th><th>Win %</th><th>ROI (-110)</th></tr>
        ${rows.map(([label, a]) => `
          <tr>
            <td style="text-align:left">${label}</td>
            <td>${a.w}–${a.l}${a.p ? `–${a.p}` : ''}</td>
            <td class="${(a.winPct || 0) >= 52.4 ? 'mx-win' : 'mx-loss'}">${pct(a.winPct)}</td>
            <td class="${(a.roi || 0) > 0 ? 'mx-win' : 'mx-loss'}">${a.roi == null ? '—' : signed(a.roi) + '%'}</td>
          </tr>`).join('')}
      </table>
    </div>
    <p class="index-footnote">Break-even at -110 is 52.4%. A positive ROI means the W² line
      would have beaten the closing number for real money.</p>`;
}

function biasBars(rows) {
  const max = Math.max(3, ...rows.map(r => Math.abs(r.avgErr)));
  return rows.map(r => {
    const w = (Math.abs(r.avgErr) / max) * 50;
    const over = r.avgErr > 0;
    const style = over
      ? `left:50%; width:${w}%;` : `right:50%; width:${w}%;`;
    return `
      <div class="bias-row">
        <span class="bias-name">${r.conf} <span style="color:rgba(255,255,255,0.3);font-size:0.7rem">${r.n}</span></span>
        <span class="bias-track"><span class="mid"></span>
          <span class="bias-fill ${over ? 'bias-over' : 'bias-under'}" style="${style}"></span></span>
        <span class="bias-val" style="color:${over ? '#e0707e' : '#7ddf8f'}">${signed(r.avgErr)}</span>
      </div>`;
  }).join('');
}

function spreadTierTable(tiers) {
  return `
    <div class="matrix-wrap" style="margin-top:6px">
      <table class="conf-matrix">
        <tr><th style="text-align:left">Market line</th><th>Games</th><th>W² miss</th><th>Market miss</th><th>W² vs market on favorite</th></tr>
        ${tiers.map(t => `
          <tr>
            <td style="text-align:left">${t.tier}</td>
            <td>${t.n}</td>
            <td>${t.w2Mae}</td>
            <td>${t.mktMae}</td>
            <td class="${t.favVsMarket <= -3 ? 'mx-loss' : ''}">${signed(t.favVsMarket)} pts</td>
          </tr>`).join('')}
      </table>
    </div>
    <p class="index-footnote">"W² vs market on favorite" = how many points W² gives the favorite
      relative to the market. Big negatives on long lines expose the margin cap softening blowouts.</p>`;
}

function render(data) {
  const s = data.scorecard;
  document.getElementById('almanac-body').innerHTML = `
    <div class="biff-caveat">⚠️ ${data.caveat} <em>Basis: ${data.ratingBasis}. Season ${data.season},
      generated ${data.generatedAt}.</em></div>

    <div class="index-section-title">The Verdict <span>W² line vs the closing number vs reality</span></div>
    ${verdictCards(s)}

    <div class="index-section-title">Takeaways <span>what the numbers are shouting</span></div>
    <ul class="biff-list">${data.insights.map(i => `<li>${i}</li>`).join('')}</ul>

    <div class="index-section-title">The Value Ledger <span>betting W²'s disagreement with the close</span></div>
    ${atsTable(s.ats)}

    <div class="index-section-title">Vulnerabilities · Conference <span>+ = W² overrated · − = underrated (pts / team-game)</span></div>
    ${biasBars(data.confBias)}
    <p class="index-footnote">Home teams: W² ran ${signed(data.homeBias.home)} vs actual
      (away ${signed(data.homeBias.away)}) — its home-field number looks
      ${data.homeBias.home > 0 ? 'too generous' : 'too stingy'}.</p>

    <div class="index-section-title">Vulnerabilities · By Line Size <span>where the pricing breaks down</span></div>
    ${spreadTierTable(data.spreadTiers)}

    <div class="index-section-title">Tuning Levers <span>how to sharpen the model next</span></div>
    <ul class="biff-list tune">${data.tuning.map(t => `<li>${t}</li>`).join('')}</ul>
  `;
}

initGate();
