/**
 * Scoreboard & Pool calculations engine
 */

export const SCORING_RULES = {
  groupPositions: [4, 3, 2, 1],
  thirdPlaceAdvancer: 2,
  maxGroupPoints: 120,
  maxThirdPlacePoints: 16,
  maxTotal: 136,
  entryFee: 50,
  organizerFeeRate: 0.05,
  netPoolRate: 0.95,
  payoutShares: {
    first: 0.70,
    second: 0.20,
    third: 0.10
  }
};

// Overall comparator, used as the fallback once head-to-head is exhausted.
function compareOverall(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return (b.wIndex || 0) - (a.wIndex || 0);
}

// Build a head-to-head mini-table among a set of tied teams, using only the
// matches played BETWEEN those teams.
function headToHeadTable(ids, matches) {
  const table = {};
  ids.forEach(id => { table[id] = { pts: 0, gf: 0, ga: 0 }; });
  (matches || []).forEach(m => {
    if (m.status !== "completed") return;
    if (!table[m.home] || !table[m.away]) return; // only matches among the tied set
    const hs = Number(m.homeScore || 0);
    const as = Number(m.awayScore || 0);
    table[m.home].gf += hs; table[m.home].ga += as;
    table[m.away].gf += as; table[m.away].ga += hs;
    if (hs > as) table[m.home].pts += 3;
    else if (as > hs) table[m.away].pts += 3;
    else { table[m.home].pts += 1; table[m.away].pts += 1; }
  });
  return table;
}

/**
 * Rank ONE group's teams using HEAD-TO-HEAD as the first tiebreaker:
 *   Points → H2H points → H2H goal diff → H2H goals
 *          → overall goal diff → overall goals → (finalCompare | W-Index).
 * Head-to-head is computed only among teams that are level on points.
 * `matches` are that group's matches (only completed ones are counted).
 */
export function rankGroup(teams, matches, finalCompare) {
  const ordered = [...teams].sort(compareOverall); // stable starting order by points
  const out = [];
  let i = 0;
  while (i < ordered.length) {
    let j = i;
    while (j + 1 < ordered.length && ordered[j + 1].pts === ordered[i].pts) j++;
    const cluster = ordered.slice(i, j + 1);

    if (cluster.length > 1) {
      const h2h = headToHeadTable(cluster.map(t => t.id), matches);
      cluster.sort((a, b) => {
        const ha = h2h[a.id], hb = h2h[b.id];
        const hgdA = ha.gf - ha.ga, hgdB = hb.gf - hb.ga;
        if (hb.pts !== ha.pts) return hb.pts - ha.pts;   // head-to-head points
        if (hgdB !== hgdA) return hgdB - hgdA;            // head-to-head goal diff
        if (hb.gf !== ha.gf) return hb.gf - ha.gf;        // head-to-head goals
        if (b.gd !== a.gd) return b.gd - a.gd;            // overall goal diff
        if (b.gf !== a.gf) return b.gf - a.gf;            // overall goals
        if (finalCompare) return finalCompare(a, b);
        return (b.wIndex || 0) - (a.wIndex || 0);
      });
    }
    out.push(...cluster);
    i = j + 1;
  }
  return out;
}

// Backwards-compatible export (overall-only). Prefer rankGroup() with matches.
export function sortGroupStandings(groupTeams) {
  return [...groupTeams].sort(compareOverall);
}

/**
 * Computes standings for all groups A-L
 */
export function calculateGroupTables(matches, teams) {
  const standings = {};
  
  // Initialize
  teams.forEach(t => {
    if (!standings[t.group]) standings[t.group] = [];
    standings[t.group].push({
      id: t.id,
      name: t.name,
      wIndex: t.wIndex || 50.0,
      pld: 0, w: 0, d: 0, l: 0,
      gf: 0, ga: 0, gd: 0, pts: 0,
      status: ''
    });
  });

  // Process group matches (matches 1-72)
  matches.forEach(m => {
    if (m.matchNumber > 72 || m.status !== 'completed') return;

    // Find teams in standings
    let group = null;
    let homeTeam = null;
    let awayTeam = null;

    for (const gLetter of Object.keys(standings)) {
      const h = standings[gLetter].find(t => t.id === m.home);
      const a = standings[gLetter].find(t => t.id === m.away);
      if (h && a) {
        group = gLetter;
        homeTeam = h;
        awayTeam = a;
        break;
      }
    }

    if (!homeTeam || !awayTeam) return;

    homeTeam.pld++;
    awayTeam.pld++;
    homeTeam.gf += m.homeScore;
    homeTeam.ga += m.awayScore;
    awayTeam.gf += m.awayScore;
    awayTeam.ga += m.homeScore;

    if (m.homeScore > m.awayScore) {
      homeTeam.w++;
      homeTeam.pts += 3;
      awayTeam.l++;
    } else if (m.awayScore > m.homeScore) {
      awayTeam.w++;
      awayTeam.pts += 3;
      homeTeam.l++;
    } else {
      homeTeam.d++;
      homeTeam.pts += 1;
      awayTeam.d++;
      awayTeam.pts += 1;
    }
  });

  // Calculate GD and rank each group (head-to-head first)
  Object.keys(standings).forEach(gLetter => {
    standings[gLetter].forEach(t => {
      t.gd = t.gf - t.ga;
    });
    const groupTeamIds = new Set(standings[gLetter].map(t => t.id));
    const groupMatches = matches.filter(m =>
      m.matchNumber <= 72 && m.status === "completed" &&
      groupTeamIds.has(m.home) && groupTeamIds.has(m.away)
    );
    standings[gLetter] = rankGroup(standings[gLetter], groupMatches);

    // Top 2 advance
    if (standings[gLetter].length >= 1) standings[gLetter][0].status = 'Q';
    if (standings[gLetter].length >= 2) standings[gLetter][1].status = 'Q';
  });

  return standings;
}

/**
 * Computes third-place comparisons to find top 8 advancing
 */
export function calculateThirdPlaceStandings(groupTables) {
  const thirds = [];

  Object.keys(groupTables).forEach(gLetter => {
    const group = groupTables[gLetter];
    if (group && group.length >= 3) {
      const thirdTeam = { ...group[2] }; // clone
      thirdTeam.group = gLetter;
      thirdTeam.status = '';
      thirds.push(thirdTeam);
    }
  });

  // Sort: Pts -> GD -> GF -> wIndex
  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.wIndex - a.wIndex;
  });

  // Top 8 qualify
  thirds.forEach((t, i) => {
    if (i < 8) t.status = 'Q';
    else t.status = 'Elim';
  });

  return thirds;
}

/**
 * Computes pool scoring for a single entry against current or final group tables.
 */
export function scoreEntry(entry, actualMatches, groupStandings, thirdPlaceStandings, bracketMatches) {
  let score = 0;
  const breakDown = {
    groupPositionPoints: 0,
    groupPositionHits: 0,
    positionHits: [0, 0, 0, 0],
    perfectGroups: 0,
    thirdPlaceAdvancerPoints: 0,
    thirdPlaceAdvancerHits: 0,
    maxTotal: SCORING_RULES.maxTotal,
    tiebreakers: {
      perfectGroups: 0,
      thirdPlaceAdvancers: 0,
      actualGoals: 0,
      goalGuess: null,
      goalDelta: null
    },
    total: 0
  };

  const groupPredictions = entry.groupPredictions || {};
  const groupMatches = (actualMatches || []).filter(match => match.matchNumber <= 72);
  const completedGroups = new Set();
  const startedGroups = new Set();

  Object.keys(groupPredictions).forEach(gLetter => {
    const matchesForGroup = groupMatches.filter(match => match.group === gLetter);
    if (matchesForGroup.some(match => match.status === "completed")) {
      startedGroups.add(gLetter);
    }
    if (matchesForGroup.length === 6 && matchesForGroup.every(match => match.status === "completed")) {
      completedGroups.add(gLetter);
    }
  });

  Object.keys(groupPredictions).forEach(gLetter => {
    if (!startedGroups.has(gLetter)) return;

    const predicted = groupPredictions[gLetter] || [];
    const actual = groupStandings[gLetter] || [];
    const isGroupComplete = completedGroups.has(gLetter);
    let perfect = isGroupComplete && predicted.length >= 4 && actual.length >= 4;

    SCORING_RULES.groupPositions.forEach((points, index) => {
      const predictedTeamId = predicted[index];
      const actualTeamId = actual[index]?.id;
      const isCorrect = predictedTeamId && actualTeamId && predictedTeamId === actualTeamId;

      if (isCorrect) {
        score += points;
        breakDown.groupPositionPoints += points;
        breakDown.groupPositionHits++;
        breakDown.positionHits[index]++;
      } else {
        perfect = false;
      }
    });

    if (perfect) breakDown.perfectGroups++;
  });

  const actualThirdAdvancers = new Set(
    (thirdPlaceStandings || [])
      .filter(team => team.status === "Q")
      .map(team => team.id)
  );
  const predictedThirdAdvancers = entry.thirdPicks || entry.thirdPlacePredictions || [];
  const allGroupMatchesComplete = groupMatches.length === 72
    && groupMatches.every(match => match.status === "completed");

  // Project third-place advancer points live — consistent with the group-position
  // projection above and the page's stated contract ("as the tables stand right now").
  // actualThirdAdvancers is the current provisional top-8 of the twelve third-place
  // teams; once all groups finish it becomes the locked, official set. We only count a
  // pick whose group has actually started, so we never award off an empty seeded table.
  predictedThirdAdvancers.forEach(teamId => {
    const teamGroup = thirdPlaceStandings?.find(t => t.id === teamId)?.group;
    const groupStarted = teamGroup ? startedGroups.has(teamGroup) : false;
    if (groupStarted && actualThirdAdvancers.has(teamId)) {
      score += SCORING_RULES.thirdPlaceAdvancer;
      breakDown.thirdPlaceAdvancerPoints += SCORING_RULES.thirdPlaceAdvancer;
      breakDown.thirdPlaceAdvancerHits++;
    }
  });

  const actualGoals = groupMatches.reduce((sum, match) => {
    if (match.matchNumber > 72 || match.status !== "completed") return sum;
    return sum + Number(match.homeScore || 0) + Number(match.awayScore || 0);
  }, 0);
  const goalsPick = Number(entry.tiebreakers?.totalGroupGoals ?? entry.totalGroupGoalsTiebreaker);
  breakDown.tiebreakers.actualGoals = actualGoals;
  breakDown.tiebreakers.goalGuess = Number.isFinite(goalsPick) ? goalsPick : null;

  if (allGroupMatchesComplete && Number.isFinite(goalsPick)) {
    breakDown.tiebreakers.goalDelta = Math.abs(goalsPick - actualGoals);
  }

  breakDown.tiebreakers.perfectGroups = breakDown.perfectGroups;
  breakDown.tiebreakers.thirdPlaceAdvancers = breakDown.thirdPlaceAdvancerHits;
  breakDown.total = score;
  return breakDown;
}

/**
 * Seeds and retrieves pool entries stochastically or deterministically
 */
export function seedDefaultEntries(teams, wIndexMap) {
  const stored = localStorage.getItem("world_cup_pool_entries");
  if (stored) {
    return JSON.parse(stored);
  }

  // Pre-loaded names and characters
  const profiles = [
    { name: "Warren's W-Chalk", avatar: "🏆", type: "chalk" },
    { name: "Samantha's Surprises", avatar: "🦁", type: "smart_upsets" },
    { name: "Brenda from HR", avatar: "🐆", type: "balanced" },
    { name: "Chaos Theory Bot", avatar: "💥", type: "pure_chaos" },
    { name: "Stochastic Steve", avatar: "🐺", type: "stochastic" }
  ];

  const generated = profiles.map(profile => {
    const entry = {
      playerName: profile.name,
      avatar: profile.avatar,
      groupPredictions: {},
      thirdPicks: [],
      bracketPredictions: {}
    };

    // Sort teams in groups
    const groupLetters = "ABCDEFGHIJKL".split("");
    groupLetters.forEach(gLetter => {
      const gTeams = teams.filter(t => t.group === gLetter).map(t => {
        const rating = wIndexMap.has(t.id) ? wIndexMap.get(t.id) : 0.50;
        return { id: t.id, rating };
      });

      if (profile.type === "chalk") {
        gTeams.sort((a, b) => b.rating - a.rating);
      } else if (profile.type === "pure_chaos") {
        gTeams.sort((a, b) => a.rating - b.rating); // complete reverse W-Index
      } else if (profile.type === "smart_upsets") {
        gTeams.sort((a, b) => b.rating - a.rating);
        // Swap 1st and 2nd 40% of the time, or slide 3rd to 2nd
        if (Math.random() < 0.40) {
          const temp = gTeams[0];
          gTeams[0] = gTeams[1];
          gTeams[1] = temp;
        }
      } else {
        // Stochastic / balanced shuffle
        gTeams.sort((a, b) => {
          const rollA = a.rating * 1.5 + Math.random() * 0.4;
          const rollB = b.rating * 1.5 + Math.random() * 0.4;
          return rollB - rollA;
        });
      }

      entry.groupPredictions[gLetter] = gTeams.map(t => t.id);
    });

    // Helper to generate bracket progression for each user profile
    const predictBracketWinner = (mId, t1, t2) => {
      const w1 = wIndexMap.get(t1) || 0.50;
      const w2 = wIndexMap.get(t2) || 0.50;

      if (profile.type === "chalk") return w1 >= w2 ? t1 : t2;
      if (profile.type === "pure_chaos") return w1 < w2 ? t1 : t2;
      if (profile.type === "smart_upsets") {
        if (Math.abs(w1 - w2) < 0.10) return Math.random() < 0.50 ? t1 : t2;
        return w1 >= w2 ? (Math.random() < 0.85 ? t1 : t2) : (Math.random() < 0.15 ? t1 : t2);
      }
      // Balanced / Stochastic picks
      const prob = w1 / (w1 + w2);
      return Math.random() < prob ? t1 : t2;
    };

    // Construct full simulated bracket tree predictions
    // (We run a clean mock tournament model for their submissions)
    const simulatedStandings = {};
    Object.keys(entry.groupPredictions).forEach(g => {
      simulatedStandings[g] = entry.groupPredictions[g].map(id => ({ id }));
    });
    
    // Mock top thirds
    const mockThirds = Object.keys(simulatedStandings).map(g => ({
      id: simulatedStandings[g][2].id,
      group: g,
      pts: 3, gd: 0, gf: 2, status: 'Q' // mock qualify
    })).slice(0, 8);
    entry.thirdPicks = mockThirds.map(t => t.id);

    // Run deterministic mapping to mock their bracket
    const mockAdvancingThirds = mockThirds.map(t => t.group).sort();
    const mockKey = mockAdvancingThirds.join("");
    const mockLookup = window.BRACKET_LOOKUP || {};
    const mockMapping = mockLookup[mockKey] || {
      "A": "3E", "B": "3G", "D": "3I", "E": "3D", "G": "3H", "I": "3F", "K": "3L", "L": "3K"
    };

    const getT = (rank, g) => simulatedStandings[g] ? simulatedStandings[g][rank - 1].id : "???";
    const get3rd = (g) => {
      const t = mockThirds.find(x => x.group === g);
      return t ? t.id : "???";
    };

    const r32 = [];
    const addR32 = (id, t1, t2) => r32.push({ id, t1, t2 });

    addR32(73, getT(1, "E"), get3rd(mockMapping["E"][1]));
    addR32(74, getT(1, "I"), get3rd(mockMapping["I"][1]));
    addR32(75, getT(2, "A"), getT(2, "B"));
    addR32(76, getT(1, "F"), getT(2, "C"));
    addR32(77, getT(1, "C"), getT(2, "F"));
    addR32(78, getT(2, "E"), getT(2, "I"));
    addR32(79, getT(1, "A"), get3rd(mockMapping["A"][1]));
    addR32(80, getT(1, "L"), get3rd(mockMapping["L"][1]));
    addR32(81, getT(2, "K"), getT(2, "L"));
    addR32(82, getT(1, "H"), getT(2, "J"));
    addR32(83, getT(1, "D"), get3rd(mockMapping["D"][1]));
    addR32(84, getT(1, "G"), get3rd(mockMapping["G"][1]));
    addR32(85, getT(1, "B"), get3rd(mockMapping["B"][1]));
    addR32(86, getT(1, "K"), get3rd(mockMapping["K"][1]));
    addR32(87, getT(1, "J"), getT(2, "H"));
    addR32(88, getT(2, "D"), getT(2, "G"));

    // R32 predicted winners
    const winners = {};
    r32.forEach(m => {
      const winner = predictBracketWinner(m.id, m.t1, m.t2);
      entry.bracketPredictions[m.id] = winner;
      winners[m.id] = winner;
    });

    // R16
    const r16 = [];
    const addR16 = (id, m1, m2) => r16.push({ id, t1: winners[m1], t2: winners[m2] });
    addR16(89, 73, 74);
    addR16(90, 75, 76);
    addR16(91, 77, 78);
    addR16(92, 79, 80);
    addR16(93, 81, 82);
    addR16(94, 83, 84);
    addR16(95, 85, 86);
    addR16(96, 87, 88);

    r16.forEach(m => {
      const winner = predictBracketWinner(m.id, m.t1, m.t2);
      entry.bracketPredictions[m.id] = winner;
      winners[m.id] = winner;
    });

    // QF
    const qf = [];
    const addQF = (id, m1, m2) => qf.push({ id, t1: winners[m1], t2: winners[m2] });
    addQF(97, 89, 90);
    addQF(98, 91, 92);
    addQF(99, 93, 94);
    addQF(100, 95, 96);

    qf.forEach(m => {
      const winner = predictBracketWinner(m.id, m.t1, m.t2);
      entry.bracketPredictions[m.id] = winner;
      winners[m.id] = winner;
    });

    // SF
    const sf = [];
    const addSF = (id, m1, m2) => sf.push({ id, t1: winners[m1], t2: winners[m2] });
    addSF(101, 97, 98);
    addSF(102, 99, 100);

    sf.forEach(m => {
      const winner = predictBracketWinner(m.id, m.t1, m.t2);
      entry.bracketPredictions[m.id] = winner;
      winners[m.id] = winner;
    });

    // Third Place Match (losers of SF)
    const getLoser = (mId, winner) => {
      const m = sf.find(x => x.id === mId);
      return m.t1 === winner ? m.t2 : m.t1;
    };
    const sf1Loser = getLoser(101, winners[101]);
    const sf2Loser = getLoser(102, winners[102]);
    const thirdWinner = predictBracketWinner(103, sf1Loser, sf2Loser);
    entry.bracketPredictions[103] = thirdWinner;

    // Grand Champion Match
    const champWinner = predictBracketWinner(104, winners[101], winners[102]);
    entry.bracketPredictions[104] = champWinner;

    return entry;
  });

  localStorage.setItem("world_cup_pool_entries", JSON.stringify(generated));
  return generated;
}
