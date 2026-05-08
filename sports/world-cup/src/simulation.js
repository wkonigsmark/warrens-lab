export function getWeightedScore(team1, team2, teamIndices, stochasticity = 0.5) {
    const i1 = teamIndices[team1] || 0.5;
    const i2 = teamIndices[team2] || 0.5;

    // Base score (0-3 goals)
    // At stoch=0 (favorites), base is fixed at 1.5
    // At stoch=1 (chaos), base is full random
    const stochBase = Math.random() * 3.5;
    const fixedBase = 1.5;

    const base1 = Math.floor(fixedBase * (1 - stochasticity) + stochBase * stochasticity);
    const base2 = Math.floor(fixedBase * (1 - stochasticity) + stochBase * stochasticity);

    // Weighted addition based on relative strength (W-Index)
    const strengthDiff = i1 - i2;
    // favorites advantage: at stoch=0, advantage is deterministic; at stoch=1, it's irrelevant
    const advantageRange = 2.8;
    const extra1 = (strengthDiff > 0) ? Math.floor(advantageRange * strengthDiff * (1 - stochasticity) + Math.random() * (advantageRange * strengthDiff) * stochasticity) : 0;
    const extra2 = (strengthDiff < 0) ? Math.floor(advantageRange * Math.abs(strengthDiff) * (1 - stochasticity) + Math.random() * (advantageRange * Math.abs(strengthDiff)) * stochasticity) : 0;

    return {
        score1: base1 + extra1,
        score2: base2 + extra2
    };
}

export function simulateMatches(allSchedule, teamIndices, stochasticity = 0.5) {
    const simulatedResults = [];

    // headers are at index 0 of allSchedule
    if (!allSchedule || allSchedule.length < 2) return [];

    const headers = allSchedule[0];
    // Find indices
    const findIdx = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
    const t1Idx = findIdx('Team 1');
    const t2Idx = findIdx('Team 2');
    const dateIdx = findIdx('Date');
    const matchIdx = findIdx('Match');
    const cityIdx = findIdx('City');
    const groupKey1Idx = findIdx('Team 1 Group Key');
    const groupKey2Idx = findIdx('Team 2 Group Key');

    // Iterate over all matches (skipping header)
    for (let i = 1; i < allSchedule.length; i++) {
        const row = allSchedule[i];
        const t1 = row[t1Idx];
        const t2 = row[t2Idx];

        if (t1 && t2) {
            const { score1, score2 } = getWeightedScore(t1, t2, teamIndices, stochasticity);

            let points1 = 0;
            let points2 = 0;

            if (score1 > score2) { points1 = 3; }
            else if (score2 > score1) { points2 = 3; }
            else { points1 = 1; points2 = 1; }

            simulatedResults.push({
                date: row[dateIdx],
                match: row[matchIdx],
                city: row[cityIdx],
                team1: t1,
                team2: t2,
                groupKey1: row[groupKey1Idx],
                groupKey2: row[groupKey2Idx],
                score1: score1,
                score2: score2,
                points1: points1,
                points2: points2
            });
        }
    }
    return simulatedResults;
}

export function calculateStandings(simulatedResults, nodes) {
    const teamsMap = {};

    // Initialize teams dictionary
    nodes.forEach(n => {
        const g = n.group || '';
        const sanitizedGroup = g.length > 1 ? g.slice(-1) : g;
        teamsMap[n.name] = {
            name: n.name,
            group: sanitizedGroup,
            pld: 0, w: 0, d: 0, l: 0,
            gf: 0, ga: 0, gd: 0, pts: 0,
            status: ''
        };
    });

    // Process matches
    simulatedResults.forEach(m => {
        if (!teamsMap[m.team1]) teamsMap[m.team1] = { name: m.team1, group: '?', pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, status: '' };
        if (!teamsMap[m.team2]) teamsMap[m.team2] = { name: m.team2, group: '?', pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, status: '' };

        const t1 = teamsMap[m.team1];
        const t2 = teamsMap[m.team2];

        t1.pld++; t2.pld++;
        t1.gf += m.score1; t1.ga += m.score2;
        t2.gf += m.score2; t2.ga += m.score1;
        t1.pts += m.points1; t2.pts += m.points2;

        if (m.score1 > m.score2) { t1.w++; t2.l++; }
        else if (m.score2 > m.score1) { t2.w++; t1.l++; }
        else { t1.d++; t2.d++; }
    });

    // Calculate GD
    Object.values(teamsMap).forEach(t => t.gd = t.gf - t.ga);

    // Group by Group
    const byGroup = {};
    Object.values(teamsMap).forEach(t => {
        if (!byGroup[t.group]) byGroup[t.group] = [];
        byGroup[t.group].push(t);
    });

    // Sort each group
    Object.keys(byGroup).forEach(g => {
        byGroup[g].sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            if (b.gf !== a.gf) return b.gf - a.gf;
            return Math.random() - 0.5;
        });

        if (byGroup[g].length >= 1) byGroup[g][0].status = 'Advance';
        if (byGroup[g].length >= 2) byGroup[g][1].status = 'Advance';
    });

    // Collect 3rd place teams
    let thirds = [];
    Object.keys(byGroup).forEach(g => {
        if (byGroup[g].length >= 3) {
            thirds.push(byGroup[g][2]);
        }
    });

    thirds.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return Math.random() - 0.5;
    });

    // Top 8 advance
    thirds.forEach((t, i) => {
        if (i < 8) t.status = 'Advance';
        else t.status = 'Eliminated';
    });

    // Mark 4th place as Eliminated
    Object.keys(byGroup).forEach(g => {
        for (let i = 3; i < byGroup[g].length; i++) {
            byGroup[g][i].status = 'Eliminated';
        }
    });

    return { groupStandings: byGroup, thirdPlaceStandings: thirds };
}

export function downloadResults(simulatedResults, bracketData) {
    if (!simulatedResults || simulatedResults.length === 0) {
        alert("Please run simulation first!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Match,Team 1,Score 1,Score 2,Team 2,Note\n";

    // Group Stages
    simulatedResults.forEach(m => {
        csvContent += `Group stage,${m.match},"${m.team1}",${m.score1},${m.score2},"${m.team2}",\n`;
    });

    // Bracket stages
    const rounds = [
        { name: 'Round of 32', data: bracketData.bracketSchedule },
        { name: 'Round of 16', data: bracketData.roundOf16Schedule },
        { name: 'Quarterfinals', data: bracketData.quarterfinalsSchedule },
        { name: 'Semifinals', data: bracketData.semifinalsSchedule },
        { name: 'Third Place', data: [bracketData.thirdPlaceMatch].filter(Boolean) },
        { name: 'Final', data: [bracketData.finalMatch].filter(Boolean) }
    ];

    rounds.forEach(r => {
        if (r.data) {
            r.data.forEach(m => {
                csvContent += `Knockout (${r.name}),${m.id || ''},"${m.t1}",${m.score1},${m.score2},"${m.t2}","${m.resultNote || ''}"\n`;
            });
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `world_cup_2026_simulation_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Monte Carlo Simulation Engine
 * Runs the full tournament count times and aggregates results
 */
export function runMonteCarlo(count, allSchedule, teamIndices, nodes, generateBracket, stochasticity = 0.5) {
    const results = {};

    // Initialize results map for all teams
    nodes.forEach(n => {
        results[n.name] = {
            name: n.name,
            wins: 0,
            finals: 0,
            semis: 0,
            quarters: 0,
            r16: 0,
            r32: 0,
            avgPoints: 0,
            totalPoints: 0
        };
    });

    for (let i = 0; i < count; i++) {
        // 1. Group Stage
        const groupResults = simulateMatches(allSchedule, teamIndices, stochasticity);
        const { groupStandings, thirdPlaceStandings } = calculateStandings(groupResults, nodes);

        // Track group stage points
        Object.values(groupStandings).forEach(group => {
            group.forEach(t => {
                if (results[t.name]) {
                    results[t.name].totalPoints += t.pts;
                }
            });
        });

        // 2. Bracket Stage
        const bracketData = generateBracket(groupStandings, thirdPlaceStandings, teamIndices, stochasticity);

        // 3. Aggregate results
        // Winners/Finalists
        const winner = bracketData.finalMatch.winner;
        const finalist = (winner === bracketData.finalMatch.t1) ? bracketData.finalMatch.t2 : bracketData.finalMatch.t1;

        if (results[winner]) {
            results[winner].wins++;
            results[winner].finals++;
        }
        if (results[finalist]) {
            results[finalist].finals++;
        }

        // Semifinalists (top 4)
        [bracketData.semifinalsSchedule[0].t1, bracketData.semifinalsSchedule[0].t2,
        bracketData.semifinalsSchedule[1].t1, bracketData.semifinalsSchedule[1].t2].forEach(team => {
            if (results[team]) results[team].semis++;
        });

        // Quarterfinalists (top 8)
        bracketData.quarterfinalsSchedule.forEach(m => {
            if (results[m.t1]) results[m.t1].quarters++;
            if (results[m.t2]) results[m.t2].quarters++;
        });

        // R16 and R32 could be added here too if needed
    }

    // Finalize stats
    const aggregated = Object.values(results).map(r => ({
        ...r,
        winProb: (r.wins / count) * 100,
        finalProb: (r.finals / count) * 100,
        semiProb: (r.semis / count) * 100,
        quarterProb: (r.quarters / count) * 100,
        avgPoints: r.totalPoints / count
    }));

    // Sort by win probability, then semi, then points
    aggregated.sort((a, b) => {
        if (b.winProb !== a.winProb) return b.winProb - a.winProb;
        if (b.semiProb !== a.semiProb) return b.semiProb - a.semiProb;
        return b.avgPoints - a.avgPoints;
    });

    return aggregated;
}
