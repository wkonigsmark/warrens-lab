// Dynasty Soccer — position taxonomy, formations, and the lineup-matching engine.
//
// Positions are points in a two-axis space so they survive a formation change:
//   line  0 = keeper, 1 = defense, 2 = midfield, 3 = attack  (fractional = between lines)
//   side -1 = left ... 0 = center ... +1 = right
// A formation slot carries a position code plus x/y for drawing. Nothing about a player
// is stored per formation — the engine re-matches preferences to whatever slots exist.

export const LINES = [
  { key: 'gk',  name: 'Goalkeeper' },
  { key: 'def', name: 'Defense' },
  { key: 'mid', name: 'Midfield' },
  { key: 'fwd', name: 'Attack' },
];

export const POSITIONS = {
  GK:  { name: 'Goalkeeper',        line: 0,   side:  0,    group: 'gk'  },

  SW:  { name: 'Sweeper',           line: 0.7, side:  0,    group: 'def' },
  LB:  { name: 'Left Back',         line: 1,   side: -1,    group: 'def' },
  LCB: { name: 'Left Center Back',  line: 1,   side: -0.35, group: 'def' },
  CB:  { name: 'Center Back',       line: 1,   side:  0,    group: 'def' },
  RCB: { name: 'Right Center Back', line: 1,   side:  0.35, group: 'def' },
  RB:  { name: 'Right Back',        line: 1,   side:  1,    group: 'def' },

  STP: { name: 'Stopper',           line: 1.6, side:  0,    group: 'mid' },
  LM:  { name: 'Left Mid',          line: 2,   side: -1,    group: 'mid' },
  LCM: { name: 'Left Center Mid',   line: 2,   side: -0.35, group: 'mid' },
  CM:  { name: 'Center Mid',        line: 2,   side:  0,    group: 'mid' },
  RCM: { name: 'Right Center Mid',  line: 2,   side:  0.35, group: 'mid' },
  RM:  { name: 'Right Mid',         line: 2,   side:  1,    group: 'mid' },

  LW:  { name: 'Left Wing',         line: 3,   side: -1,    group: 'fwd' },
  LF:  { name: 'Left Forward',      line: 3,   side: -0.6,  group: 'fwd' },
  CF:  { name: 'Center Forward',    line: 3,   side:  0,    group: 'fwd' },
  CS:  { name: 'Center Striker',    line: 3.3, side:  0,    group: 'fwd' },
  RF:  { name: 'Right Forward',     line: 3,   side:  0.6,  group: 'fwd' },
  RW:  { name: 'Right Wing',        line: 3,   side:  1,    group: 'fwd' },
};

/** Position codes grouped for a <select>. */
export function positionOptions() {
  return LINES.map(l => ({
    label: l.name,
    options: Object.entries(POSITIONS).filter(([, p]) => p.group === l.key)
      .map(([code, p]) => ({ code, name: `${code} — ${p.name}` })),
  }));
}

// ---------------------------------------------------------------- formations
// x: 0 = left touchline, 1 = right touchline.  y: 0 = own goal line, 1 = opponent's.
const F = (code, name, size, note, slots) => ({ code, name, size, note, slots });

export const FORMATIONS = [
  F('3-3', '3-3', 7, '7v7 · three back, three forward', [
    { code: 'GK', x: 0.50, y: 0.07 },
    { code: 'LB', x: 0.22, y: 0.33 }, { code: 'CB', x: 0.50, y: 0.29 }, { code: 'RB', x: 0.78, y: 0.33 },
    { code: 'LF', x: 0.25, y: 0.70 }, { code: 'CF', x: 0.50, y: 0.76 }, { code: 'RF', x: 0.75, y: 0.70 },
  ]),
  F('4-2', '4-2', 7, '7v7 · four back, two forward', [
    { code: 'GK',  x: 0.50, y: 0.07 },
    { code: 'LB',  x: 0.16, y: 0.34 }, { code: 'LCB', x: 0.38, y: 0.28 },
    { code: 'RCB', x: 0.62, y: 0.28 }, { code: 'RB',  x: 0.84, y: 0.34 },
    { code: 'LF',  x: 0.35, y: 0.72 }, { code: 'RF',  x: 0.65, y: 0.72 },
  ]),
  F('2-3-1', '2-3-1', 7, '7v7 · two back, three mid, one striker', [
    { code: 'GK', x: 0.50, y: 0.07 },
    { code: 'LCB', x: 0.35, y: 0.26 }, { code: 'RCB', x: 0.65, y: 0.26 },
    { code: 'LM', x: 0.20, y: 0.53 }, { code: 'CM', x: 0.50, y: 0.50 }, { code: 'RM', x: 0.80, y: 0.53 },
    { code: 'CS', x: 0.50, y: 0.80 },
  ]),
  F('3-2-1', '3-2-1', 7, '7v7 · three back, two mid, one striker', [
    { code: 'GK', x: 0.50, y: 0.07 },
    { code: 'LB', x: 0.22, y: 0.30 }, { code: 'CB', x: 0.50, y: 0.25 }, { code: 'RB', x: 0.78, y: 0.30 },
    { code: 'LCM', x: 0.36, y: 0.55 }, { code: 'RCM', x: 0.64, y: 0.55 },
    { code: 'CS', x: 0.50, y: 0.82 },
  ]),
  F('3-3-2', '3-3-2', 9, '9v9 · three back, three mid, two forward', [
    { code: 'GK', x: 0.50, y: 0.06 },
    { code: 'LB', x: 0.20, y: 0.26 }, { code: 'CB', x: 0.50, y: 0.22 }, { code: 'RB', x: 0.80, y: 0.26 },
    { code: 'LM', x: 0.20, y: 0.52 }, { code: 'CM', x: 0.50, y: 0.50 }, { code: 'RM', x: 0.80, y: 0.52 },
    { code: 'LF', x: 0.36, y: 0.78 }, { code: 'RF', x: 0.64, y: 0.78 },
  ]),
  F('3-2-3', '3-2-3', 9, '9v9 · three back, two mid, three forward', [
    { code: 'GK', x: 0.50, y: 0.06 },
    { code: 'LB', x: 0.20, y: 0.26 }, { code: 'CB', x: 0.50, y: 0.22 }, { code: 'RB', x: 0.80, y: 0.26 },
    { code: 'LCM', x: 0.36, y: 0.50 }, { code: 'RCM', x: 0.64, y: 0.50 },
    { code: 'LF', x: 0.22, y: 0.76 }, { code: 'CF', x: 0.50, y: 0.80 }, { code: 'RF', x: 0.78, y: 0.76 },
  ]),
];

export const getFormation = code => FORMATIONS.find(f => f.code === code) || FORMATIONS[0];

// ---------------------------------------------------------------- the engine
// How much a skill point is worth. Skill SCALES positional fit rather than adding to it,
// so the better player wins whenever two players fit a spot comparably well — a skill-4
// CS beats a skill-1 CF for the CF slot — while a big positional mismatch still loses
// (a skill-4 striker never displaces the keeper). Raise it to favour skill, lower it to
// favour strict position matching.
export const SKILL_WEIGHT = 0.18;

/** Positional fit alone, 0–100. Exact code wins; then same line by side distance; then a neighbouring line. */
export function positionFit(player, slotCode) {
  const S = POSITIONS[slotCode];
  if (!S) return 0;
  const prefs = [[player.position_1, 1], [player.position_2, 0.7]];  // backup position counts for less
  let best = 0;

  for (const [code, weight] of prefs) {
    const P = POSITIONS[code];
    if (!P) continue;
    let s;
    if (code === slotCode) s = 100;
    else {
      const dLine = Math.abs(P.line - S.line);
      const dSide = Math.abs(P.side - S.side);
      if (dLine < 0.75) s = 82 - 18 * dSide;          // same line
      else if (dLine < 1.75) s = 46 - 10 * dSide;     // next line over
      else s = Math.max(6, 26 - 8 * dLine);
    }
    // A keeper slot wants a keeper; a keeper is a poor default outfield pick.
    if (slotCode === 'GK' && code !== 'GK') s *= 0.25;
    if (code === 'GK' && slotCode !== 'GK') s *= 0.45;
    best = Math.max(best, s * weight);
  }
  return best || 12;                                  // no preference set: neutral
}

/** Fit scaled by skill — the number autoAssign ranks on. */
export function fitScore(player, slotCode) {
  return positionFit(player, slotCode) * (1 + (player.skill || 0) * SKILL_WEIGHT);
}

/**
 * Assign players to a formation's slots.
 * Greedy over the best remaining (player, slot) pair — stable and easy to reason about.
 * `locked` maps slotCode -> playerId and is preserved exactly.
 * Returns { assignments: {slotCode: playerId}, bench: [playerId] }.
 */
export function autoAssign(players, formation, locked = {}) {
  const assignments = {};
  const usedPlayers = new Set();

  for (const [slotCode, pid] of Object.entries(locked)) {
    if (!pid) continue;
    if (!formation.slots.some(s => s.code === slotCode)) continue;
    if (!players.some(p => p.player_id === pid)) continue;
    assignments[slotCode] = pid;
    usedPlayers.add(pid);
  }

  const pairs = [];
  for (const slot of formation.slots) {
    if (assignments[slot.code]) continue;
    for (const p of players) {
      if (usedPlayers.has(p.player_id)) continue;
      pairs.push({ slot: slot.code, pid: p.player_id, score: fitScore(p, slot.code) });
    }
  }
  const skillOf = id => players.find(p => p.player_id === id)?.skill || 0;
  const nameOf = id => { const p = players.find(x => x.player_id === id); return p ? `${p.last_name} ${p.first_name}` : ''; };
  pairs.sort((a, b) => b.score - a.score || skillOf(b.pid) - skillOf(a.pid) || nameOf(a.pid).localeCompare(nameOf(b.pid)));

  for (const { slot, pid } of pairs) {
    if (assignments[slot] || usedPlayers.has(pid)) continue;
    assignments[slot] = pid;
    usedPlayers.add(pid);
  }
  return { assignments, bench: players.filter(p => !usedPlayers.has(p.player_id)).map(p => p.player_id) };
}

/**
 * Carry a lineup across a formation change: keep anyone whose slot still exists,
 * then re-match the rest into the new shape.
 */
export function remapFormation(players, fromAssignments, toFormation) {
  const keep = {};
  for (const slot of toFormation.slots) {
    const pid = fromAssignments[slot.code];
    if (pid && players.some(p => p.player_id === pid)) keep[slot.code] = pid;
  }
  return autoAssign(players, toFormation, keep);
}

/** "Ballard Konigsmark" -> "BK" */
export function initials(p) {
  return `${(p.first_name || '?')[0]}${(p.last_name || '')[0] || ''}`.toUpperCase();
}
