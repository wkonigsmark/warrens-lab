const TEAMS = {
    'ATL': { city: 'Atlanta', initials: 'ATL', mascot: 'Hawks', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/atl.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'BKN': { city: 'Brooklyn', initials: 'BKN', mascot: 'Nets', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bkn.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'BOS': { city: 'Boston', initials: 'BOS', mascot: 'Celtics', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bos.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'CHA': { city: 'Charlotte', initials: 'CHA', mascot: 'Hornets', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/cha.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'CHI': { city: 'Chicago', initials: 'CHI', mascot: 'Bulls', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/chi.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'CLE': { city: 'Cleveland', initials: 'CLE', mascot: 'Cavaliers', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/cle.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'DAL': { city: 'Dallas', initials: 'DAL', mascot: 'Mavericks', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/dal.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'DEN': { city: 'Denver', initials: 'DEN', mascot: 'Nuggets', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/den.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'DET': { city: 'Detroit', initials: 'DET', mascot: 'Pistons', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/det.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'GS': { city: 'Golden State', initials: 'GS', mascot: 'Warriors', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/gs.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'HOU': { city: 'Houston', initials: 'HOU', mascot: 'Rockets', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/hou.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'IND': { city: 'Indiana', initials: 'IND', mascot: 'Pacers', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/ind.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'LAC': { city: 'LA', initials: 'LAC', mascot: 'Clippers', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/lac.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'LAL': { city: 'Los Angeles', initials: 'LAL', mascot: 'Lakers', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/lal.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'MEM': { city: 'Memphis', initials: 'MEM', mascot: 'Grizzlies', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mem.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'MIA': { city: 'Miami', initials: 'MIA', mascot: 'Heat', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mia.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'MIL': { city: 'Milwaukee', initials: 'MIL', mascot: 'Bucks', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mil.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'MIN': { city: 'Minnesota', initials: 'MIN', mascot: 'Timberwolves', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/min.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'NO': { city: 'New Orleans', initials: 'NO', mascot: 'Pelicans', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/no.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'NY': { city: 'New York', initials: 'NY', mascot: 'Knicks', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/ny.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'OKC': { city: 'Oklahoma City', initials: 'OKC', mascot: 'Thunder', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/okc.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'ORL': { city: 'Orlando', initials: 'ORL', mascot: 'Magic', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/orl.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'PHI': { city: 'Philadelphia', initials: 'PHI', mascot: '76ers', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/phi.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'PHX': { city: 'Phoenix', initials: 'PHX', mascot: 'Suns', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/phx.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'POR': { city: 'Portland', initials: 'POR', mascot: 'Trail Blazers', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/por.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'SA': { city: 'San Antonio', initials: 'SA', mascot: 'Spurs', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/sa.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'SAC': { city: 'Sacramento', initials: 'SAC', mascot: 'Kings', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/sac.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'TOR': { city: 'Toronto', initials: 'TOR', mascot: 'Raptors', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/tor.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'UTA': { city: 'Utah', initials: 'UTA', mascot: 'Jazz', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/utah.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'WSH': { city: 'Washington', initials: 'WSH', mascot: 'Wizards', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/wsh.png&w=80&h=80&cquality=40&scale=crop&location=origin&transparent=true' },
    'TBD': { city: 'TBD', initials: 'TBD', mascot: 'TBD', logo: 'https://icon-library.com/images/nba-icon/nba-icon-24.jpg' }
};

const BRACKET_DATA = {
    west: {
        r1: [
            { seed1: 1, team1: 'OKC', seed2: 8, team2: 'PHX' },
            { seed1: 4, team1: 'LAL', seed2: 5, team2: 'HOU' },
            { seed1: 3, team1: 'DEN', seed2: 6, team2: 'MIN' },
            { seed1: 2, team1: 'SA', seed2: 7, team2: 'POR' }
        ],
        r2: [null, null],
        r3: [null]
    },
    east: {
        r1: [
            { seed1: 1, team1: 'DET', seed2: 8, team2: 'ORL' },
            { seed1: 4, team1: 'CLE', seed2: 5, team2: 'TOR' },
            { seed1: 3, team1: 'NY', seed2: 6, team2: 'ATL' },
            { seed1: 2, team1: 'BOS', seed2: 7, team2: 'PHI' }
        ],
        r2: [null, null],
        r3: [null]
    },
    finals: null,
    champion: null
};

const winners = {
    west: { r1: [null, null, null, null], r2: [null, null], r3: [null] },
    east: { r1: [null, null, null, null], r2: [null, null], r3: [null] },
    finals: null
};

function getSeedForTeam(teamKey) {
    if (!teamKey) return '';
    const conferences = ['west', 'east'];
    for (const conf of conferences) {
        for (const match of BRACKET_DATA[conf].r1) {
            if (match.team1 === teamKey) return match.seed1;
            if (match.team2 === teamKey) return match.seed2;
        }
    }
    return '';
}

// Wizard State
let wizardActive = false;
let currentStep = 0; 

function toggleWizard() {
    wizardActive = !wizardActive;
    const overlay = document.getElementById('wizard-flow');
    if (wizardActive) {
        document.body.classList.remove('show-full-bracket');
        overlay.classList.remove('hidden');
        renderWizard();
    } else {
        overlay.classList.add('hidden');
        if (window.innerWidth < 768) {
            document.body.classList.add('show-full-bracket');
        }
    }
}

function getWizardMatchup(step) {
    if (step < 4) return { conf: 'west', round: 1, matchIdx: step };
    if (step < 8) return { conf: 'east', round: 1, matchIdx: step - 4 };
    if (step < 10) return { conf: 'west', round: 2, matchIdx: step - 8 };
    if (step < 12) return { conf: 'east', round: 2, matchIdx: step - 10 };
    if (step === 12) return { conf: 'west', round: 3, matchIdx: 0 };
    if (step === 13) return { conf: 'east', round: 3, matchIdx: 0 };
    if (step === 14) return { conf: 'finals', round: 4, matchIdx: 0 };
    if (step === 15) return { type: 'summary' };
    return null;
}

function renderWizard() {
    const content = document.getElementById('wizard-content');
    const match = getWizardMatchup(currentStep);
    
    if (!match) return;

    if (match.type === 'summary') {
        content.innerHTML = `
            <div class="wizard-card summary-card">
                <div class="trophy-icon">🏆</div>
                <div class="wizard-match-label">BRACKET COMPLETE</div>
                <div class="champ-team-display" style="margin-bottom:30px">
                    ${winners.finals ? TEAMS[winners.finals].mascot : 'TBD'}
                </div>
                <p style="color:var(--text-dim); margin-bottom:40px;">Your 2026 NBA Playoff predictions are locked in.</p>
                <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
                    <button class="btn btn-primary" onclick="exportToPDF()">EXPORT BRACKET PDF</button>
                    <button class="btn btn-secondary" onclick="currentStep=0; renderWizard()">RESTART PICKS</button>
                </div>
            </div>
        `;
        document.getElementById('progress-bar').style.width = `100%`;
        document.getElementById('next-btn').style.display = 'none';
        return;
    }

    document.getElementById('next-btn').style.display = 'block';

    let team1, team2, seed1, seed2;
    let winner = null;

    if (match.round === 1) {
        const data = BRACKET_DATA[match.conf].r1[match.matchIdx];
        team1 = data.team1; team2 = data.team2;
        seed1 = data.seed1; seed2 = data.seed2;
        winner = winners[match.conf].r1[match.matchIdx];
    } else if (match.round <= 3) {
        team1 = winners[match.conf][`r${match.round - 1}`][match.matchIdx * 2];
        team2 = winners[match.conf][`r${match.round - 1}`][match.matchIdx * 2 + 1];
        seed1 = getSeedForTeam(team1);
        seed2 = getSeedForTeam(team2);
        winner = winners[match.conf][`r${match.round}`][match.matchIdx];
    } else {
        team1 = winners.west.r3[0];
        team2 = winners.east.r3[0];
        seed1 = getSeedForTeam(team1);
        seed2 = getSeedForTeam(team2);
        winner = winners.finals;
    }

    const labels = ["Western R1", "Eastern R1", "West Semis", "East Semis", "West Finals", "East Finals", "NBA Finals"];
    let labelIndex = 0;
    if (currentStep < 4) labelIndex = 0;
    else if (currentStep < 8) labelIndex = 1;
    else if (currentStep < 10) labelIndex = 2;
    else if (currentStep < 12) labelIndex = 3;
    else if (currentStep === 12) labelIndex = 4;
    else if (currentStep === 13) labelIndex = 5;
    else labelIndex = 6;

    content.innerHTML = `
        <div class="wizard-card">
            <div class="wizard-match-label">${labels[labelIndex]} - Series ${match.matchIdx + 1}</div>
            <div class="wizard-teampair">
                ${createWizardChoice(match, 1, team1, seed1, winner === team1)}
                <div class="vs-divider">VS</div>
                ${createWizardChoice(match, 2, team2, seed2, winner === team2)}
            </div>
        </div>
    `;

    document.getElementById('progress-bar').style.width = `${((currentStep) / 15) * 100}%`;
    document.getElementById('wizard-step-label').innerText = `Series ${currentStep + 1} of 15`;
    document.getElementById('prev-btn').disabled = currentStep === 0;
    document.getElementById('next-btn').innerText = (currentStep === 14) ? "SUMMARY" : "NEXT";
}

function createWizardChoice(match, num, teamKey, seed, isSelected) {
    if (!teamKey) {
        return `<div class="wizard-team-choice disabled"><div class="team-name">TBD</div></div>`;
    }
    const team = TEAMS[teamKey];
    return `
        <div class="wizard-team-choice ${isSelected ? 'selected' : ''}" onclick="selectWizardWinner('${teamKey}')">
            <img src="${team.logo}" alt="${team.mascot}">
            <div class="team-name">${team.mascot}</div>
            <div class="seed">#${seed || ''}</div>
        </div>
    `;
}

function selectWizardWinner(teamKey) {
    const match = getWizardMatchup(currentStep);
    if (match.round === 4) {
        winners.finals = teamKey;
    } else {
        selectWinner(match.conf, match.round, match.matchIdx, teamKey);
    }
    renderWizard();
    setTimeout(() => {
        if (currentStep < 15) wizardNext();
    }, 400);
}

function wizardNext() {
    if (currentStep < 15) {
        currentStep++;
        renderWizard();
    }
}

function wizardPrev() {
    if (currentStep > 0) {
        currentStep--;
        renderWizard();
    }
}

function exportToPDF() {
    // Show custom modal (prompt() is blocked on file:// URLs)
    const modal = document.getElementById('export-modal');
    const input = document.getElementById('export-title-input');
    const confirmBtn = document.getElementById('export-confirm-btn');

    input.value = '';
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);

    // Allow Enter key to confirm
    input.onkeydown = (e) => { if (e.key === 'Enter') doExport(); };
    confirmBtn.onclick = doExport;
}

function doExport() {
    const modal = document.getElementById('export-modal');
    const userTitle = document.getElementById('export-title-input').value.trim() || 'My Picks';
    modal.style.display = 'none';

    try {
        const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (!jsPDFConstructor) {
            alert("PDF library failed to load. Please refresh the page and try again.");
            return;
        }

        const doc = new jsPDFConstructor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
        const W = doc.internal.pageSize.getWidth();   // 792pt
        const H = doc.internal.pageSize.getHeight();  // 612pt

        // White background (guaranteed visible in all viewers)
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, W, H, 'F');

        // Header bar - slightly taller to fit 2 lines
        doc.setFillColor(15, 20, 40);
        doc.rect(0, 0, W, 62, 'F');

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(200, 160, 40);
        doc.text('NBA PLAYOFFS 2026', W / 2, 24, { align: 'center' });

        // Bracket title (user's name for this set of picks)
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(userTitle.toUpperCase(), W / 2, 42, { align: 'center' });

        // Thin gold divider under title
        doc.setDrawColor(200, 160, 40);
        doc.setLineWidth(0.8);
        doc.line(W / 2 - 80, 50, W / 2 + 80, 50);

        // Draw a team slot box
        function drawSlot(x, y, w, teamKey, isWinner) {
            const h = 24;
            const team = teamKey ? TEAMS[teamKey] : null;
            const seed = teamKey ? getSeedForTeam(teamKey) : '';
            const label = team
                ? `${seed ? '#' + seed + '  ' : ''}${team.mascot}`
                : 'TBD';

            if (isWinner) {
                doc.setFillColor(255, 215, 50);       // Gold
                doc.setDrawColor(180, 130, 0);
            } else if (teamKey) {
                doc.setFillColor(235, 240, 255);      // Light blue-white
                doc.setDrawColor(180, 190, 220);
            } else {
                doc.setFillColor(245, 245, 245);      // Light gray
                doc.setDrawColor(210, 210, 210);
            }
            doc.roundedRect(x, y, w, h, 2, 2, 'FD');

            doc.setFontSize(isWinner ? 9 : 8);
            doc.setTextColor(isWinner ? 60 : (teamKey ? 30 : 160),
                             isWinner ? 40 : (teamKey ? 30 : 160),
                             isWinner ? 0  : (teamKey ? 60 : 160));
            doc.text(label, x + 5, y + 16, { maxWidth: w - 8 });
        }

        // Draw one full round column
        function drawRound(title, matches, x, colW) {
            // Column header
            doc.setFillColor(40, 55, 100);
            doc.rect(x + 2, 68, colW - 4, 14, 'F');
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(title, x + colW / 2, 78, { align: 'center' });

            const slotW = colW - 8;
            const usableH = H - 100;
            const matchH = usableH / matches.length;

            matches.forEach((m, i) => {
                const baseY = 90 + i * matchH + (matchH - 54) / 2;
                const isW1 = !!(m.winner && m.winner === m.team1);
                const isW2 = !!(m.winner && m.winner === m.team2);
                drawSlot(x + 4, baseY,      slotW, m.team1, isW1);
                drawSlot(x + 4, baseY + 27, slotW, m.team2, isW2);
                // Connector line between the two slots
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(x + 4 + slotW, baseY + 12, x + 4 + slotW, baseY + 39);
            });
        }

        // Build matchup data from state
        const W_R1 = BRACKET_DATA.west.r1.map((m, i) => ({ team1: m.team1, team2: m.team2, winner: winners.west.r1[i] }));
        const W_R2 = [
            { team1: winners.west.r1[0], team2: winners.west.r1[1], winner: winners.west.r2[0] },
            { team1: winners.west.r1[2], team2: winners.west.r1[3], winner: winners.west.r2[1] }
        ];
        const W_R3 = [{ team1: winners.west.r2[0], team2: winners.west.r2[1], winner: winners.west.r3[0] }];
        const E_R1 = BRACKET_DATA.east.r1.map((m, i) => ({ team1: m.team1, team2: m.team2, winner: winners.east.r1[i] }));
        const E_R2 = [
            { team1: winners.east.r1[0], team2: winners.east.r1[1], winner: winners.east.r2[0] },
            { team1: winners.east.r1[2], team2: winners.east.r1[3], winner: winners.east.r2[1] }
        ];
        const E_R3 = [{ team1: winners.east.r2[0], team2: winners.east.r2[1], winner: winners.east.r3[0] }];
        const FINALS = [{ team1: winners.west.r3[0], team2: winners.east.r3[0], winner: winners.finals }];

        // 7 equal columns
        const colW = W / 7;
        drawRound('WEST R1',     W_R1,   0,         colW);
        drawRound('WEST SEMIS',  W_R2,   colW,      colW);
        drawRound('WEST FINALS', W_R3,   colW * 2,  colW);
        drawRound('NBA FINALS',  FINALS, colW * 3,  colW);
        drawRound('EAST FINALS', E_R3,   colW * 4,  colW);
        drawRound('EAST SEMIS',  E_R2,   colW * 5,  colW);
        drawRound('EAST R1',     E_R1,   colW * 6,  colW);

        // Champion banner at bottom
        if (winners.finals) {
            const champ = TEAMS[winners.finals];
            doc.setFillColor(255, 215, 50);
            doc.roundedRect(W / 2 - 130, H - 48, 260, 32, 4, 4, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(30, 20, 0);
            doc.text(`CHAMPION: ${champ.city} ${champ.mascot}`, W / 2, H - 27, { align: 'center' });
        }

        // Footer
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Generated ${date}`, W - 15, H - 8, { align: 'right' });

        const safeTitle = userTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `NBA_2026_${safeTitle}.pdf`;

        // Force named download - octet-stream bypasses Chrome's inline PDF viewer
        // which ignores the download attribute filename
        const buf = doc.output('arraybuffer');
        const blob = new Blob([buf], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 2000);

    } catch (err) {
        console.error("PDF Export error:", err);
        alert("PDF error: " + err.message);
    }
}


function renderBracket() {
    renderRound('west', 1, BRACKET_DATA.west.r1);
    updateRoundData('west', 2);
    updateRoundData('west', 3);
    renderRound('east', 1, BRACKET_DATA.east.r1);
    updateRoundData('east', 2);
    updateRoundData('east', 3);
    renderFinals();
}

function updateRoundData(conf, roundNum) {
    if (roundNum === 1) return;
    const prevRoundWinners = winners[conf][`r${roundNum - 1}`];
    const matchData = [];
    for (let i = 0; i < prevRoundWinners.length; i += 2) {
        matchData.push({ team1: prevRoundWinners[i], team2: prevRoundWinners[i+1] });
    }
    renderRound(conf, roundNum, matchData);
}

function renderRound(conf, roundNum, matches) {
    const container = document.getElementById(`${conf}-r${roundNum}`);
    container.innerHTML = '';
    matches.forEach((match, index) => {
        const matchupDiv = document.createElement('div');
        matchupDiv.className = 'matchup';
        matchupDiv.appendChild(createTeamEl(conf, roundNum, index, 1, match.team1, match.seed1));
        matchupDiv.appendChild(createTeamEl(conf, roundNum, index, 2, match.team2, match.seed2));
        container.appendChild(matchupDiv);
    });
}

function createTeamEl(conf, round, matchIdx, teamNum, teamKey, seed) {
    const teamDiv = document.createElement('div');
    const isWinner = winners[conf][`r${round}`][matchIdx] === teamKey;
    const isLoser = winners[conf][`r${round}`][matchIdx] && winners[conf][`r${round}`][matchIdx] !== teamKey;
    teamDiv.className = `team ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`;
    
    if (!teamKey) {
        teamDiv.innerHTML = `<span class="seed">-</span><span class="team-name">TBD</span>`;
        teamDiv.style.opacity = '0.3';
        return teamDiv;
    }

    const team = TEAMS[teamKey];
    const finalSeed = seed || getSeedForTeam(teamKey);
    teamDiv.innerHTML = `
        <span class="seed">${finalSeed}</span>
        <img src="${team.logo}" alt="${team.initials}">
        <span class="team-name full-name">${team.mascot}</span>
        <span class="team-name mobile-only">${team.initials}</span>
    `;
    teamDiv.onclick = () => selectWinner(conf, round, matchIdx, teamKey);
    return teamDiv;
}

function selectWinner(conf, round, matchIdx, teamKey) {
    winners[conf][`r${round}`][matchIdx] = teamKey;
    if (round < 3) {
        const nextRound = round + 1;
        const nextMatchIdx = Math.floor(matchIdx / 2);
        winners[conf][`r${nextRound}`][nextMatchIdx] = null;
        if (nextRound < 3) winners[conf][`r3`][0] = null;
    }
    if (round === 3) winners.finals = null;
    renderBracket();
}

function renderFinals() {
    const container = document.getElementById('nba-finals');
    container.innerHTML = '';
    const westChamp = winners.west.r3[0];
    const eastChamp = winners.east.r3[0];
    const matchupDiv = document.createElement('div');
    matchupDiv.className = 'matchup finals-match-card';
    matchupDiv.style.width = '100%';
    matchupDiv.appendChild(createFinalsTeamEl(1, westChamp));
    matchupDiv.appendChild(createFinalsTeamEl(2, eastChamp));
    container.appendChild(matchupDiv);

    const champKey = winners.finals;
    const champDisplay = document.getElementById('champ-team');
    if (champKey) {
        const team = TEAMS[champKey];
        champDisplay.innerHTML = `<span style="color:var(--gold)">${team.city.toUpperCase()} ${team.mascot.toUpperCase()}</span>`;
        document.getElementById('champion').style.transform = 'scale(1.1)';
    } else {
        champDisplay.innerText = 'SELECT WINNER';
        document.getElementById('champion').style.transform = 'scale(1)';
    }
}

function createFinalsTeamEl(teamNum, teamKey) {
    const teamDiv = document.createElement('div');
    const isWinner = winners.finals === teamKey;
    const isLoser = winners.finals && winners.finals !== teamKey;
    teamDiv.className = `team ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`;
    
    if (!teamKey) {
        teamDiv.innerHTML = `<span class="team-name">TBD</span>`;
        teamDiv.style.opacity = '0.3';
        return teamDiv;
    }

    const team = TEAMS[teamKey];
    const seed = getSeedForTeam(teamKey);
    teamDiv.innerHTML = `
        <span class="seed" style="margin-right:10px">${seed}</span>
        <img src="${team.logo}" style="width:50px; height:50px;">
        <span class="team-name" style="font-size:1.5rem;">${team.mascot}</span>
    `;
    teamDiv.onclick = () => {
        winners.finals = teamKey;
        renderFinals();
    };
    return teamDiv;
}

// Audio Logic
const audio = document.getElementById('bg-audio');
const muteBtn = document.getElementById('mute-btn');
let lastActivity = Date.now();
let isAudioPlaying = false;

function toggleAudio() {
    const muteBtns = [document.getElementById('mute-btn'), document.getElementById('wizard-mute-btn')];
    if (isAudioPlaying) {
        audio.pause();
        muteBtns.forEach(btn => { if (btn) btn.innerText = '🔇'; });
    } else {
        audio.play().catch(e => console.log("Interaction required"));
        muteBtns.forEach(btn => { if (btn) btn.innerText = '🔊'; });
    }
    isAudioPlaying = !isAudioPlaying;
}

['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(type => {
    window.addEventListener(type, () => {
        lastActivity = Date.now();
        if (isAudioPlaying && audio.paused) audio.play();
    });
});

setInterval(() => {
    if (isAudioPlaying && (Date.now() - lastActivity > 20000)) audio.pause();
}, 1000);

// Initial play attempt on load
function initAudio() {
    const muteBtns = [document.getElementById('mute-btn'), document.getElementById('wizard-mute-btn')];
    audio.play().then(() => {
        isAudioPlaying = true;
        muteBtns.forEach(btn => { if (btn) btn.innerText = '🔊'; });
    }).catch(e => {
        console.log("Autoplay blocked. Waiting for user interaction.");
    });
}
initAudio();

// Auto-play attempt on first interaction fallback
window.addEventListener('click', () => {
    if (!isAudioPlaying) {
        toggleAudio();
    }
}, { once: true });

renderBracket();

if (window.innerWidth < 768) {
    setTimeout(toggleWizard, 500);
}
