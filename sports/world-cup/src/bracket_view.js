import { getFlagCode } from './data.js';

export function renderBracketView(bracketData) {
    const container = document.getElementById('bracket-canvas');
    if (!container) return;
    container.innerHTML = '';

    const width = 1400;
    const height = 900;

    const svg = d3.select(container).append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('overflow', 'visible');

    // Define column positions
    const cols = {
        r32: { left: 50, right: 1150 },
        r16: { left: 250, right: 950 },
        qf: { left: 450, right: 750 },
        sf: { left: 600, right: 600 }, // Special case for center
        final: { center: width / 2 }
    };

    const matchHeight = 60;
    const matchWidth = 180;

    function drawMatch(m, x, y, isLeft) {
        const group = svg.append('g')
            .attr('transform', `translate(${x}, ${y})`)
            .attr('class', 'bracket-match');

        // Match Background
        group.append('rect')
            .attr('width', matchWidth)
            .attr('height', matchHeight)
            .attr('rx', 12)
            .attr('fill', 'rgba(30, 41, 59, 0.7)')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('stroke-width', 1)
            .style('backdrop-filter', 'blur(4px)');

        // Team 1
        drawTeam(group, m.t1, m.score1, 0, m.winner === m.t1);
        // Team 2
        drawTeam(group, m.t2, m.score2, matchHeight / 2, m.winner === m.t2);

        // Divider
        group.append('line')
            .attr('x1', 10)
            .attr('y1', matchHeight / 2)
            .attr('x2', matchWidth - 10)
            .attr('y2', matchHeight / 2)
            .attr('stroke', 'rgba(255,255,255,0.05)');

        return { x, y, width: matchWidth, height: matchHeight };
    }

    function drawTeam(parent, name, score, yOffset, isWinner) {
        const teamG = parent.append('g').attr('transform', `translate(0, ${yOffset})`);

        // Flag
        teamG.append('image')
            .attr('xlink:href', `https://flagcdn.com/w40/${getFlagCode(name)}.png`)
            .attr('x', 8)
            .attr('y', 6)
            .attr('width', 20)
            .attr('height', 16);

        // Name
        teamG.append('text')
            .attr('x', 36)
            .attr('y', 18)
            .attr('fill', isWinner ? '#fff' : '#94a3b8')
            .attr('font-size', '11px')
            .attr('font-weight', isWinner ? '800' : '500')
            .text(name);

        // Score
        teamG.append('text')
            .attr('x', matchWidth - 12)
            .attr('y', 18)
            .attr('text-anchor', 'end')
            .attr('fill', isWinner ? '#4fd1c5' : '#475569')
            .attr('font-size', '12px')
            .attr('font-weight', '800')
            .text(score !== undefined ? score : '-');
    }

    // --- Layout the rounds ---

    // Round of 32
    const r32Matches = bracketData.bracketSchedule;
    const r32Map = {};
    r32Matches.forEach((m, i) => {
        const isLeft = i < 8; // Adjust based on IDs if needed
        const x = isLeft ? cols.r32.left : cols.r32.right;
        const row = isLeft ? i : i - 8;
        const y = 50 + row * (matchHeight + 40);
        r32Map[m.id] = drawMatch(m, x, y, isLeft);
    });

    // Round of 16
    const r16Matches = bracketData.roundOf16Schedule;
    const r16Map = {};
    r16Matches.forEach((m, i) => {
        const isLeft = i < 4;
        const x = isLeft ? cols.r16.left : cols.r16.right;
        const row = isLeft ? i : i - 4;
        const y = 100 + row * ((matchHeight + 40) * 2);
        r16Map[m.id] = drawMatch(m, x, y, isLeft);
    });

    // Quarterfinals
    const qfMatches = bracketData.quarterfinalsSchedule;
    const qfMap = {};
    qfMatches.forEach((m, i) => {
        const isLeft = i < 2;
        const x = isLeft ? cols.qf.left : cols.qf.right;
        const row = isLeft ? i : i - 2;
        const y = 200 + row * ((matchHeight + 40) * 4);
        qfMap[m.id] = drawMatch(m, x, y, isLeft);
    });

    // Semifinals
    const sfMatches = bracketData.semifinalsSchedule;
    const sfMap = {};
    sfMatches.forEach((m, i) => {
        const isLeft = i === 0;
        const x = isLeft ? cols.sf.left : width - cols.sf.left - matchWidth;
        const y = 400; // Centered vertically roughly
        sfMap[m.id] = drawMatch(m, x, y, isLeft);
    });

    // Final
    const finalMatch = bracketData.finalMatch;
    drawMatch(finalMatch, width / 2 - matchWidth / 2, 200, true);

    // 3rd Place Match
    const thirdPlaceMatch = bracketData.thirdPlaceMatch;
    if (thirdPlaceMatch) {
        const thirdPlaceMatchGroup = drawMatch(thirdPlaceMatch, width / 2 - matchWidth / 2, 600, true);
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 590)
            .attr('text-anchor', 'middle')
            .attr('fill', '#94a3b8')
            .attr('font-size', '12px')
            .attr('font-weight', '800')
            .text('3RD PLACE MATCH');
    }

    // Add Labels for stages
    const labels = ["ROUND OF 32", "ROUND OF 16", "QUARTERFINALS", "SEMIFINALS", "FINAL", "SEMIFINALS", "QUARTERFINALS", "ROUND OF 16", "ROUND OF 32"];
    const xPos = [50, 250, 450, 600, 700, 800, 950, 1150, 1350]; // Approx
    // (Simpler: just add a text header)
}
