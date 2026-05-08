import { getWeightedScore } from './simulation.js';

export function generateBracket(groupStandings, thirdPlaceStandings, teamIndices, stochasticity = 0.5) {
    // Identify advancing 3rd place groups (e.g., "ABDEFHIJ")
    // Sanitize group names (extract only the letter if it's "Group A")
    const advancingThirds = thirdPlaceStandings
        .filter(t => t.status === 'Advance')
        .map(t => {
            const g = t.group || '';
            return g.length > 1 ? g.slice(-1) : g;
        })
        .sort();
    const key = advancingThirds.join('');
    // console.log("Advancing thirds key:", key);

    // Get mapping from global BRACKET_LOOKUP
    const lookup = window.BRACKET_LOOKUP;
    const mapping = lookup ? lookup[key] : null;

    if (!mapping && advancingThirds.length === 8) {
        console.error("Bracket mapping not found for key:", key);
    }

    const bracketSchedule = [];

    const getTeam = (rank, group) => {
        const g = groupStandings[group];
        return g ? g[rank - 1].name : '???';
    };

    const addMatch = (id, t1Desc, t2Desc, t1, t2) => {
        bracketSchedule.push({ id, t1Desc, t2Desc, t1, t2 });
    };

    // 1. FIXED MATCHES & MAPPED MATCHES - REORDERED FOR SEQUENTIAL FLOW
    // We want the visual grid to show pairs that play each other next to each other.
    // Flow: 73v74 -> 89, 75v76 -> 90, etc.

    const finalMapping = mapping || {
        "A": "3E", "B": "3G", "D": "3I", "E": "3D", "G": "3H", "I": "3F", "K": "3L", "L": "3K"
    };

    const get3rd = (grp) => {
        const t = thirdPlaceStandings.find(x => x.group === grp);
        return t ? t.name : '???';
    };

    // BLOCK 1 (Top Left) -> R16 Match 89 & 90 -> QF 97
    // Pair 1A: 1E vs 3rd
    addMatch(73, 'Winner E', `3rd Group ${finalMapping['E'][1]}`, getTeam(1, 'E'), get3rd(finalMapping['E'][1]));
    // Pair 1B: 1I vs 3rd
    addMatch(74, 'Winner I', `3rd Group ${finalMapping['I'][1]}`, getTeam(1, 'I'), get3rd(finalMapping['I'][1]));

    // Pair 2A: 2A vs 2B
    addMatch(75, 'Runner-up A', 'Runner-up B', getTeam(2, 'A'), getTeam(2, 'B'));
    // Pair 2B: 1F vs 2C
    addMatch(76, 'Winner F', 'Runner-up C', getTeam(1, 'F'), getTeam(2, 'C'));

    // BLOCK 2 (Bottom Left) -> R16 Match 91 & 92 -> QF 98
    // Pair 3A: 1C vs 2F
    addMatch(77, 'Winner C', 'Runner-up F', getTeam(1, 'C'), getTeam(2, 'F'));
    // Pair 3B: 2E vs 2I
    addMatch(78, 'Runner-up E', 'Runner-up I', getTeam(2, 'E'), getTeam(2, 'I'));

    // Pair 4A: 1A vs 3rd
    addMatch(79, 'Winner A', `3rd Group ${finalMapping['A'][1]}`, getTeam(1, 'A'), get3rd(finalMapping['A'][1]));
    // Pair 4B: 1L vs 3rd
    addMatch(80, 'Winner L', `3rd Group ${finalMapping['L'][1]}`, getTeam(1, 'L'), get3rd(finalMapping['L'][1]));

    // BLOCK 3 (Top Right) -> R16 Match 93 & 94 -> QF 99
    // Pair 5A: 2K vs 2L
    addMatch(81, 'Runner-up K', 'Runner-up L', getTeam(2, 'K'), getTeam(2, 'L'));
    // Pair 5B: 1H vs 2J
    addMatch(82, 'Winner H', 'Runner-up J', getTeam(1, 'H'), getTeam(2, 'J'));

    // Pair 6A: 1D vs 3rd
    addMatch(83, 'Winner D', `3rd Group ${finalMapping['D'][1]}`, getTeam(1, 'D'), get3rd(finalMapping['D'][1]));
    // Pair 6B: 1G vs 3rd
    addMatch(84, 'Winner G', `3rd Group ${finalMapping['G'][1]}`, getTeam(1, 'G'), get3rd(finalMapping['G'][1]));

    // BLOCK 4 (Bottom Right) -> R16 Match 95 & 96 -> QF 100
    // Pair 7A: 1B vs 3rd
    addMatch(85, 'Winner B', `3rd Group ${finalMapping['B'][1]}`, getTeam(1, 'B'), get3rd(finalMapping['B'][1]));
    // Pair 7B: 1K vs 3rd
    addMatch(86, 'Winner K', `3rd Group ${finalMapping['K'][1]}`, getTeam(1, 'K'), get3rd(finalMapping['K'][1]));

    // Pair 8A: 1J vs 2H
    addMatch(87, 'Winner J', 'Runner-up H', getTeam(1, 'J'), getTeam(2, 'H'));
    // Pair 8B: 2D vs 2G
    addMatch(88, 'Runner-up D', 'Runner-up G', getTeam(2, 'D'), getTeam(2, 'G'));


    bracketSchedule.sort((a, b) => a.id - b.id);
    // console.log("R32 results generated:", bracketSchedule.length);

    // Simulate R32 results
    bracketSchedule.forEach(m => {
        const { score1, score2 } = getWeightedScore(m.t1, m.t2, teamIndices, stochasticity);
        m.score1 = score1;
        m.score2 = score2;

        if (m.score1 === m.score2) {
            const i1 = teamIndices[m.t1] || 0.5;
            const i2 = teamIndices[m.t2] || 0.5;

            // Penalty shootout probability also affected by stochasticity
            const p1Fav = (i1 > i2) ? 0.9 : 0.1;
            const p1Rand = 0.5;
            const p1 = p1Fav * (1 - stochasticity) + p1Rand * stochasticity;

            m.winner = Math.random() < p1 ? m.t1 : m.t2;
            m.resultNote = '(p)';
        } else {
            m.winner = m.score1 > m.score2 ? m.t1 : m.t2;
            m.resultNote = '';
        }
    });

    // Map R32 winners to R16
    const roundOf16Schedule = [];
    const winnersR32 = {};
    bracketSchedule.forEach(m => { winnersR32[m.id] = m.winner; });
    // console.log("R32 Winners count:", Object.keys(winnersR32).length);

    const addR16 = (id, m1Id, m2Id) => {
        roundOf16Schedule.push({
            id,
            t1Desc: `Winner Match ${m1Id}`,
            t2Desc: `Winner Match ${m2Id}`,
            t1: winnersR32[m1Id] || '???',
            t2: winnersR32[m2Id] || '???'
        });
    };

    // SEQUENTIAL R16 PAIRING
    addR16(89, 73, 74);
    addR16(90, 75, 76);
    addR16(91, 77, 78);
    addR16(92, 79, 80);
    addR16(93, 81, 82);
    addR16(94, 83, 84);
    addR16(95, 85, 86);
    addR16(96, 87, 88);

    roundOf16Schedule.forEach(m => {
        const { score1, score2 } = getWeightedScore(m.t1, m.t2, teamIndices, stochasticity);
        m.score1 = score1; m.score2 = score2;
        if (m.score1 === m.score2) {
            const i1 = teamIndices[m.t1] || 0.5;
            const i2 = teamIndices[m.t2] || 0.5;
            const p1Fav = (i1 > i2) ? 0.9 : 0.1;
            const p1Rand = 0.5;
            const p1 = p1Fav * (1 - stochasticity) + p1Rand * stochasticity;
            m.winner = Math.random() < p1 ? m.t1 : m.t2;
            m.resultNote = '(p)';
        } else {
            m.winner = m.score1 > m.score2 ? m.t1 : m.t2;
            m.resultNote = '';
        }
    });

    // QF
    const quarterfinalsSchedule = [];
    const winnersR16 = {};
    roundOf16Schedule.forEach(m => { winnersR16[m.id] = m.winner; });

    const addQF = (id, m1Id, m2Id) => {
        quarterfinalsSchedule.push({
            id,
            t1Desc: `Winner Match ${m1Id}`,
            t2Desc: `Winner Match ${m2Id}`,
            t1: winnersR16[m1Id] || '???',
            t2: winnersR16[m2Id] || '???'
        });
    };

    // SEQUENTIAL QF PAIRING
    addQF(97, 89, 90);
    addQF(98, 91, 92);
    addQF(99, 93, 94);
    addQF(100, 95, 96);

    quarterfinalsSchedule.forEach(m => {
        const { score1, score2 } = getWeightedScore(m.t1, m.t2, teamIndices, stochasticity);
        m.score1 = score1; m.score2 = score2;
        if (m.score1 === m.score2) {
            const i1 = teamIndices[m.t1] || 0.5;
            const i2 = teamIndices[m.t2] || 0.5;
            const p1Fav = (i1 > i2) ? 0.9 : 0.1;
            const p1Rand = 0.5;
            const p1 = p1Fav * (1 - stochasticity) + p1Rand * stochasticity;
            m.winner = Math.random() < p1 ? m.t1 : m.t2;
            m.loser = m.winner === m.t1 ? m.t2 : m.t1;
            m.resultNote = '(p)';
        } else {
            m.winner = m.score1 > m.score2 ? m.t1 : m.t2;
            m.loser = m.score1 > m.score2 ? m.t2 : m.t1;
            m.resultNote = '';
        }
    });

    // SF
    const semifinalsSchedule = [];
    const winnersQF = {};
    const losersQF = {};
    quarterfinalsSchedule.forEach(m => { winnersQF[m.id] = m.winner; losersQF[m.id] = m.loser; });

    const addSF = (id, m1Id, m2Id) => {
        semifinalsSchedule.push({
            id,
            t1Desc: `Winner Match ${m1Id}`,
            t2Desc: `Winner Match ${m2Id}`,
            t1: winnersQF[m1Id] || '???',
            t2: winnersQF[m2Id] || '???'
        });
    };

    // SEQUENTIAL SF PAIRING
    addSF(101, 97, 98);
    addSF(102, 99, 100);

    semifinalsSchedule.forEach(m => {
        const { score1, score2 } = getWeightedScore(m.t1, m.t2, teamIndices, stochasticity);
        m.score1 = score1; m.score2 = score2;
        if (m.score1 === m.score2) {
            const i1 = teamIndices[m.t1] || 0.5;
            const i2 = teamIndices[m.t2] || 0.5;
            const p1Fav = (i1 > i2) ? 0.9 : 0.1;
            const p1Rand = 0.5;
            const p1 = p1Fav * (1 - stochasticity) + p1Rand * stochasticity;
            m.winner = Math.random() < p1 ? m.t1 : m.t2;
            m.loser = m.winner === m.t1 ? m.t2 : m.t1;
            m.resultNote = '(p)';
        } else {
            m.winner = m.score1 > m.score2 ? m.t1 : m.t2;
            m.loser = m.score1 > m.score2 ? m.t2 : m.t1;
            m.resultNote = '';
        }
    });

    // 3rd Place & Final
    const winnersSF = {};
    const losersSF = {};
    semifinalsSchedule.forEach(m => { winnersSF[m.id] = m.winner; losersSF[m.id] = m.loser; });

    const thirdPlaceMatch = {
        id: 103,
        t1Desc: 'Loser Match 101',
        t2Desc: 'Loser Match 102',
        t1: losersSF[101] || '???',
        t2: losersSF[102] || '???'
    };

    const finalMatch = {
        id: 104,
        t1Desc: 'Winner Match 101',
        t2Desc: 'Winner Match 102',
        t1: winnersSF[101] || '???',
        t2: winnersSF[102] || '???'
    };

    [thirdPlaceMatch, finalMatch].forEach(m => {
        const { score1, score2 } = getWeightedScore(m.t1, m.t2, teamIndices, stochasticity);
        m.score1 = score1; m.score2 = score2;
        if (m.score1 === m.score2) {
            const i1 = teamIndices[m.t1] || 0.5;
            const i2 = teamIndices[m.t2] || 0.5;
            const p1Fav = (i1 > i2) ? 0.9 : 0.1;
            const p1Rand = 0.5;
            const p1 = p1Fav * (1 - stochasticity) + p1Rand * stochasticity;
            m.winner = Math.random() < p1 ? m.t1 : m.t2;
            m.resultNote = '(p)';
        } else {
            m.winner = m.score1 > m.score2 ? m.t1 : m.t2;
            m.resultNote = '';
        }
    });

    return {
        bracketSchedule,
        roundOf16Schedule,
        quarterfinalsSchedule,
        semifinalsSchedule,
        thirdPlaceMatch,
        finalMatch
    };
}
