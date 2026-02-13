import { RANKINGS_URL, SCHEDULE_URL, FALLBACK_RANKINGS, FALLBACK_SCHEDULE, parseCSV, getFlagCode, fetchCSV } from './data.js';
import { simulateMatches, calculateStandings, downloadResults, runMonteCarlo } from './simulation.js';
import { generateBracket } from './bracket.js';
import { renderBracketView } from './bracket_view.js';


let allTeams = [];
let allSchedule = [];
let nodes = [];
let teamIndices = {};
let simulatedResults = [];
let groupStandings = {};
let thirdPlaceStandings = [];
let bracketData = {};

let visualStep = 0;
const visualStages = [
    'QUALIFICATION',
    'ROUND OF 32',
    'ROUND OF 16',
    'QUARTERFINALS',
    'SEMIFINALS',
    'THE SHOWDOWN',
    'GRAND FINALE'
];

let width, height;
let simulation;
let nodeSelection;
let currentFilter = 'all';
let searchQuery = '';
let currentView = 'bubble';
let championshipWinner = '';
let finalLoser = '';
let thirdPlaceWinner = '';
let thirdPlaceLoser = '';
let currentStochasticity = 0.5;


const statusEl = document.getElementById('sync-status');

function getRadius(w) {
    const val = parseFloat(w) || 0;
    return 14 + (val / 100) * 38;
}

function startCountdown() {
    const targetDate = new Date('June 11, 2026 15:00:00').getTime();
    function update() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

function openModal(d) {
    const modal = document.getElementById('team-modal');
    const code = getFlagCode(d.name);
    document.getElementById('modal-flag').style.backgroundImage = `url('https://flagcdn.com/w160/${code}.png')`;
    document.getElementById('modal-name').textContent = d.name;
    document.getElementById('modal-group').textContent = `GROUP ${d.group}`;
    document.getElementById('modal-score').textContent = `${d.wIndex.toFixed(1)}%`;
    document.getElementById('modal-rank').textContent = `#${d.rank || '--'}`;

    const statusAlert = document.getElementById('modal-status-alert');
    statusAlert.style.display = (d.status === 'Not Qualified') ? 'block' : 'none';

    const teamIdx = allSchedule[0] ? allSchedule[0].findIndex(h => h.toLowerCase().includes('team 1')) : 6;
    const cityIdx = allSchedule[0] ? allSchedule[0].findIndex(h => h.toLowerCase().includes('city')) : 5;
    const dateIdx = allSchedule[0] ? allSchedule[0].findIndex(h => h.toLowerCase().includes('date')) : 0;
    const matches = allSchedule.slice(1).filter(m => m[teamIdx] === d.name || m[teamIdx + 1] === d.name);
    const container = document.getElementById('modal-schedule');

    if (matches.length) {
        container.innerHTML = matches.map(m => {
            const opp = m[teamIdx] === d.name ? m[teamIdx + 1] : m[teamIdx];
            return `<div class="match-row"><span class="match-date">${m[dateIdx].slice(0, 6)}</span><span class="match-opponent">vs ${opp}</span><span class="match-city">${m[cityIdx]}</span></div>`;
        }).join('');
    } else {
        container.innerHTML = '<p style="color:#475569; font-size:0.9rem;">No group stage matches recorded.</p>';
    }
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('team-modal').classList.remove('active');
}

function renderSchedule() {
    const list = document.getElementById('schedule-list');
    const search = document.getElementById('schedule-search').value.toLowerCase();
    const sort = document.getElementById('schedule-sort').value;

    if (!allSchedule || allSchedule.length < 2) return;

    const headers = allSchedule[0];
    const dataRows = allSchedule.slice(1);

    const findIdx = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
    const t1Idx = findIdx('Team 1');
    const t2Idx = findIdx('Team 2');
    const cityIdx = findIdx('City');
    const dateIdx = findIdx('Date');
    const timeIdx = findIdx('Time');
    const rankIdx = findIdx('Matchup Rank');

    let filtered = dataRows.filter(m => {
        const t1 = (m[t1Idx] || '').toLowerCase();
        const t2 = (m[t2Idx] || '').toLowerCase();
        const city = (m[cityIdx] || '').toLowerCase();
        return t1.includes(search) || t2.includes(search) || city.includes(search);
    });

    if (sort === 'rank' && rankIdx !== -1) {
        filtered.sort((a, b) => (parseInt(a[rankIdx]) || 999) - (parseInt(b[rankIdx]) || 999));
    }

    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding: 40px; color: #64748b;">No matching fixtures found.</div>';
        return;
    }

    list.innerHTML = filtered.map(m => {
        const rank = rankIdx !== -1 ? parseInt(m[rankIdx]) : null;
        const rankClass = rank && rank <= 10 ? 'rank-top10' : (rank && rank <= 25 ? 'rank-top25' : 'rank-normal');
        return `
        <div class="match-card">
            <div class="match-rank-badge ${rankClass}">
                <span class="rank-label">RANK</span>
                <span class="rank-val">${rank || '--'}</span>
            </div>
            <div class="match-info-main">
                <div class="match-teams-row">
                    <div class="match-flag-sm" style="background-image: url('https://flagcdn.com/w80/${getFlagCode(m[t1Idx])}.png')"></div>
                    <span>${m[t1Idx]}</span>
                    <span style="color: #475569; font-weight: 400; font-size: 0.9rem;">vs</span>
                    <div class="match-flag-sm" style="background-image: url('https://flagcdn.com/w80/${getFlagCode(m[t2Idx])}.png')"></div>
                    <span>${m[t2Idx]}</span>
                </div>
                <div class="match-meta-row">
                    <span>${m[dateIdx]} • ${m[timeIdx]}</span>
                    <span>📍 ${m[cityIdx]}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

function updateFilters() {
    nodes.forEach(d => {
        const matchesGroup = (currentFilter === 'all' || d.group === currentFilter);
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
        d.isFiltered = !(matchesGroup && matchesSearch);
    });
    nodeSelection.classed('filtered', d => d.isFiltered);
    simulation.force('collide', d3.forceCollide(d => d.isFiltered ? 0 : d.radius + 3).strength(0.8));
    simulation.force('charge', d3.forceManyBody().strength(d => d.isFiltered ? 0 : -15));
    simulation.alpha(0.3).restart();
}

function updateGroupRankings(teamsData) {
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const nonQualRatings = teamsData.filter(d => d[3] === 'Not Qualified').map(d => parseFloat(d[2])).sort((a, b) => b - a);
    const topFiller = nonQualRatings[0] || 0.45;

    const strengths = groups.map(g => {
        const groupTeams = teamsData.filter(t => t[1] === g);
        let sum = groupTeams.reduce((acc, t) => acc + (parseFloat(t[2]) || 0), 0);
        return { group: g, score: sum / 100 };
    });

    strengths.sort((a, b) => b.score - a.score);
    const rankMap = {};
    strengths.forEach((s, i) => { rankMap[s.group] = { rank: i + 1, isDeath: i === 0 }; });
    return rankMap;
}

function initApp(teams, schedule) {
    allTeams = teams;
    allSchedule = schedule;
    const rankMap = updateGroupRankings(teams);

    const container = document.getElementById('bubble-chart');
    container.innerHTML = '';
    width = container.clientWidth;
    height = container.clientHeight;

    nodes = teams.map((d, i) => ({
        name: d[0], group: d[1], wIndex: parseFloat(d[2]), status: d[3],
        rank: parseInt(d[4]) || (i + 1),
        radius: getRadius(parseFloat(d[2])), isFiltered: false,
        x: width / 2 + (Math.random() - 0.5) * 400,
        y: 100 + (Math.random() - 0.5) * 400
    }));

    nodes.forEach(n => teamIndices[n.name] = n.wIndex / 100);

    const filterContainer = document.getElementById('group-grid');
    if (!filterContainer) {
        console.warn("Initializing without #group-grid sidebar");
        return;
    }
    const existingGroups = [...new Set(teams.map(d => d[1]))].sort();

    // Add event listener to the ALL button
    const allBtn = filterContainer.querySelector('[data-group="all"]');
    allBtn.onclick = () => {
        document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        currentFilter = 'all';
        updateFilters();
    };

    existingGroups.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'group-btn';
        btn.dataset.group = g;
        btn.textContent = g;
        btn.onclick = () => {
            // Toggle functionality: if clicking the active button, go back to ALL
            if (btn.classList.contains('active')) {
                document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
                allBtn.classList.add('active');
                currentFilter = 'all';
            } else {
                document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = g;
            }
            updateFilters();
        };
        filterContainer.appendChild(btn);
    });

    simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX(width / 2).strength(0.15))
        .force('y', d3.forceY(height / 2).strength(0.25))
        .force('collide', d3.forceCollide(d => d.isEliminated ? 0 : d.radius + 2).strength(0.8))
        .force('charge', d3.forceManyBody().strength(d => (d.isFiltered || d.isEliminated) ? 0 : -15))
        .on('tick', () => {
            nodeSelection.style('left', d => `${d.x - d.radius}px`).style('top', d => `${d.y - d.radius}px`);
        });

    nodeSelection = d3.select(container).selectAll('.bubble').data(nodes).join('div')
        .attr('class', d => `bubble ${d.status === 'Not Qualified' ? 'not-qualified' : ''}`)
        .style('width', d => `${d.radius * 2}px`).style('height', d => `${d.radius * 2}px`)
        .style('background-image', d => `url('https://flagcdn.com/w160/${getFlagCode(d.name)}.png')`)
        .on('click', (e, d) => openModal(d))
        .call(d3.drag()
            .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));
}

function startVisualSimulation() {
    simulatedResults = simulateMatches(allSchedule, teamIndices, currentStochasticity);
    const standings = calculateStandings(simulatedResults, nodes);
    groupStandings = standings.groupStandings;
    thirdPlaceStandings = standings.thirdPlaceStandings;
    bracketData = generateBracket(groupStandings, thirdPlaceStandings, teamIndices, currentStochasticity);

    document.getElementById('simulate-btn').style.display = 'none';

    // Switch to bubble view if it was on bracket
    if (currentView === 'bracket') switchView('bubble');

    visualStep = 0;
    updateVisualNodes();
    syncVisuals();
}

function switchView(view) {
    currentView = view;
    const bubbleChart = document.getElementById('bubble-chart');
    const bracketView = document.getElementById('bracket-view');

    if (view === 'bubble') {
        bubbleChart.style.display = 'block';
        bracketView.style.display = 'none';
        if (simulation) simulation.alpha(0.3).restart();
    } else {
        bubbleChart.style.display = 'none';
        bracketView.style.display = 'block';
        if (bracketData.finalMatch) {
            renderBracketView(bracketData);
        } else {
            document.getElementById('bracket-canvas').innerHTML = '<div style="text-align:center; padding: 100px; color: #64748b;">Please run a simulation first to see the bracket.</div>';
        }
    }
}



function saveSimulation() {
    const data = {
        simulatedResults,
        groupStandings,
        thirdPlaceStandings,
        bracketData,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('wc2026_sim', JSON.stringify(data));
}

function loadSimulation() {
    const saved = localStorage.getItem('wc2026_sim');
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
        simulatedResults = data.simulatedResults;
        groupStandings = data.groupStandings;
        thirdPlaceStandings = data.thirdPlaceStandings;
        bracketData = data.bracketData;

        // CRITICAL: Update visual nodes to set champion/finalist variables
        // This ensures the final 4 teams are visible even when loading from cache
        if (bracketData.finalMatch) {
            updateVisualNodes();
        }

        if (document.getElementById('download-btn')) {
            document.getElementById('download-btn').style.opacity = '1';
            document.getElementById('download-btn').style.pointerEvents = 'auto';
        }
        return true;
    } catch (e) {
        console.error("Failed to load simulation:", e);
        return false;
    }
}

function resetVisualSimulation() {
    document.getElementById('visual-start-btn').textContent = 'SIMULATE';
    document.getElementById('simulate-btn').style.display = 'inline-block';

    visualStep = 0;
    // Clear simulation data to force re-run
    bracketData = {};
    simulatedResults = [];
    groupStandings = {};
    thirdPlaceStandings = [];
    championshipWinner = '';
    finalLoser = '';
    thirdPlaceWinner = '';
    thirdPlaceLoser = '';

    nodes.forEach(n => {
        n.eliminatedIn = 99;
        n.isChampion = n.isSilver = n.isBronze = n.isSideStage = false;
        n.fx = n.fy = null;
    });
    syncVisuals();
}

function nextVisualStep() {
    if (visualStep < visualStages.length - 1) {
        visualStep++;
        const btn = document.getElementById('visual-start-btn');
        if (visualStep === visualStages.length - 1) {
            btn.textContent = 'RESET';
        } else {
            // Keep button text consistent as "SIMULATE" or "NEXT ROUND"
            // The user wants "SIMULATE" to trigger subsequent rounds
            btn.textContent = 'SIMULATE';
        }
        syncVisuals();
    } else {
        resetVisualSimulation();
    }
}

function updateVisualNodes() {
    const advancingToR32 = new Set();
    Object.values(groupStandings).forEach(g => {
        g.forEach(t => { if (t.status === 'Advance') advancingToR32.add(t.name); });
    });

    const winnersR32 = new Set(bracketData.bracketSchedule.map(m => m.winner));
    const winnersR16 = new Set(bracketData.roundOf16Schedule.map(m => m.winner));
    const winnersQF = new Set(bracketData.quarterfinalsSchedule.map(m => m.winner));
    const winnersSF = new Set(bracketData.semifinalsSchedule.map(m => m.winner));

    championshipWinner = bracketData.finalMatch.winner;
    finalLoser = (championshipWinner === bracketData.finalMatch.t1) ? bracketData.finalMatch.t2 : bracketData.finalMatch.t1;
    thirdPlaceWinner = bracketData.thirdPlaceMatch.winner;
    thirdPlaceLoser = (thirdPlaceWinner === bracketData.thirdPlaceMatch.t1) ? bracketData.thirdPlaceMatch.t2 : bracketData.thirdPlaceMatch.t1;

    console.log(`Visual simulation sync - champion: ${championshipWinner}, silver: ${finalLoser}, bronze: ${thirdPlaceWinner}`);

    nodes.forEach(n => {
        n.eliminatedIn = 99;
        if (!advancingToR32.has(n.name)) n.eliminatedIn = 1;
        else if (!winnersR32.has(n.name)) n.eliminatedIn = 2;
        else if (!winnersR16.has(n.name)) n.eliminatedIn = 3;
        else if (!winnersQF.has(n.name)) n.eliminatedIn = 4;
        else if (!winnersSF.has(n.name)) {
            // SF Losers eliminated in step 5 (THE SHOWDOWN) if we want them gone, 
            // but user wants them visible for 3rd place.
            n.eliminatedIn = 99; // Keep them for 3rd place match
        }

        n.isChampion = (n.name === championshipWinner);
        n.isSilver = (n.name === finalLoser);
        n.isBronze = (n.name === thirdPlaceWinner);
    });
}

function syncVisuals() {
    const w = document.getElementById('bubble-chart').clientWidth || window.innerWidth;
    const h = document.getElementById('bubble-chart').clientHeight || (window.innerHeight - 200);

    console.log(`Syncing visual step ${visualStep} (${visualStages[visualStep]}) Width: ${w}`);

    // --- Dynamic Force Scaling ---
    const xStrength = 0.1 + (visualStep * 0.05);
    const yStrength = 0.15 + (visualStep * 0.08);
    const chargeStrength = Math.max(-10, -15 + (visualStep * 3));

    simulation.force('x').strength(xStrength);
    simulation.force('y').strength(yStrength);
    simulation.force('charge').strength(d => (d.isFiltered || d.isEliminated) ? 0 : chargeStrength);

    nodes.forEach(n => {
        n.isEliminated = n.eliminatedIn <= visualStep;

        // Ensure final 4 are NEVER eliminated in showdown or finale
        if (visualStep >= 5) {
            if (n.name === championshipWinner || n.name === finalLoser ||
                n.name === thirdPlaceWinner || n.name === thirdPlaceLoser) {
                n.isEliminated = false;
            }
        }

        n.targetFx = n.targetFy = null;

        if (visualStep === 1) { // R32
            const findInBracket = (name) => {
                const m = bracketData.bracketSchedule.find(m => m.t1 === name || m.t2 === name);
                return m ? { id: m.id, side: m.t1 === name ? 0 : 1 } : null;
            };
            const b = findInBracket(n.name);
            if (b) {
                n.isEliminated = false;
                // Updated Mapping for Sequential Bracket Logic
                // Left Side: 73, 74, 75, 76, 77, 78, 79, 80
                // Right Side: 81, 82, 83, 84, 85, 86, 87, 88
                const leftMatches = [73, 74, 75, 76, 77, 78, 79, 80];
                const rightMatches = [81, 82, 83, 84, 85, 86, 87, 88];
                let col = leftMatches.includes(b.id) ? 0 : 1;
                let row = (col === 0 ? leftMatches : rightMatches).indexOf(b.id);

                const spacingX = w * 0.55;
                const spacingY = 90;
                const marginX = (w - spacingX) / 2;
                const teamOffset = (b.side === 0 ? -45 : 45);

                n.targetFx = marginX + (col * spacingX) + teamOffset;
                n.targetFy = 120 + (row * spacingY);
            } else {
                n.isEliminated = true;
            }
        } else if (visualStep >= 2 && visualStep <= 4) { // R16, QF, SF
            const roundSchedule = visualStep === 2 ? bracketData.roundOf16Schedule :
                visualStep === 3 ? bracketData.quarterfinalsSchedule :
                    bracketData.semifinalsSchedule;

            const currentMatch = roundSchedule.find(m => m.t1 === n.name || m.t2 === n.name);

            if (currentMatch) {
                n.isEliminated = false;
                const stageMatches = {
                    // R16: Left (89-92), Right (93-96)
                    2: { left: [89, 90, 91, 92], right: [93, 94, 95, 96] },
                    // QF: Left (97, 98), Right (99, 100)
                    3: { left: [97, 98], right: [99, 100] },
                    // SF: Left (101), Right (102)
                    4: { left: [101], right: [102] }
                };
                const currentStage = stageMatches[visualStep];
                let col = -1, row = -1;

                if (currentStage.left.includes(currentMatch.id)) {
                    col = 0; row = currentStage.left.indexOf(currentMatch.id);
                } else if (currentStage.right.includes(currentMatch.id)) {
                    col = 1; row = currentStage.right.indexOf(currentMatch.id);
                }

                if (col !== -1) {
                    const spacingX = w * 0.5;
                    const marginX = (w - spacingX) / 2;
                    const spacingY = 120 + (visualStep * 20);
                    const teamOffset = (currentMatch.t1 === n.name) ? -40 : 40;

                    n.targetFx = marginX + (col * spacingX) + teamOffset;
                    n.targetFy = 150 + (row * spacingY);
                } else {
                    console.warn(`Match ${currentMatch.id} not found in step ${visualStep} layout`);
                    n.isEliminated = true;
                }
            } else {
                n.isEliminated = true;
            }
        }
        else if (visualStep === 5) { // SHOWDOWN - 3rd place match + final preview
            if (n.name === championshipWinner || n.name === finalLoser) {
                // Championship finalists - positioned prominently
                n.targetFx = (n.name === championshipWinner) ? (w / 2 - 100) : (w / 2 + 100);
                n.targetFy = 180;
                n.isEliminated = false;
                n.isSideStage = false;
            } else if (n.name === thirdPlaceWinner || n.name === thirdPlaceLoser) {
                // 3rd place match teams - positioned below but visible
                n.targetFx = (n.name === thirdPlaceWinner) ? (w / 2 - 100) : (w / 2 + 100);
                n.targetFy = 380;
                n.isEliminated = false;
                n.isSideStage = false;
            } else {
                n.isEliminated = true;
            }
        } else if (visualStep === 6) { // FINALE - champion celebration
            if (n.name === championshipWinner) {
                // Champion - top of podium, center
                n.targetFx = w / 2;
                n.targetFy = 180;
                n.isEliminated = false;
                n.isSideStage = false;
            } else if (n.name === finalLoser) {
                // Runner-up - below champion, center (silver medal)
                n.targetFx = w / 2;
                n.targetFy = 360;
                n.isEliminated = false;
                n.isSideStage = false; // Keep visible on podium
            } else if (n.name === thirdPlaceWinner) {
                // 3rd place - below runner-up, center (bronze medal)
                n.targetFx = w / 2;
                n.targetFy = 520;
                n.isEliminated = false;
                n.isSideStage = false; // Keep visible on podium
            } else if (n.name === thirdPlaceLoser) {
                // 4th place - eliminated (not shown)
                n.isEliminated = true;
            } else {
                n.isEliminated = true;
            }
        }
    });

    console.log(`Active nodes in step ${visualStep} (${visualStages[visualStep]}): ${nodes.filter(n => !n.isEliminated).length}`);
    if (visualStep > 0 && visualStep < 5) {
        console.log("Matches this round:", nodes.filter(n => !n.isEliminated).map(n => n.name));
    }

    nodeSelection.classed('eliminated', d => d.isEliminated)
        .classed('side-stage', d => d.isSideStage || false)
        .classed('champion', d => d.isChampion && visualStep === 6)
        .classed('silver', d => d.isSilver && visualStep === 6)
        .classed('bronze', d => d.isBronze && visualStep === 6);

    nodeSelection.transition().duration(800)
        .style('width', d => {
            if (d.isChampion && visualStep === 6) return `${d.radius * 4.5}px`;
            if ((d.name === championshipWinner || d.name === finalLoser) && visualStep === 5) return `${d.radius * 3}px`;
            if (d.isSideStage) {
                if (d.name === thirdPlaceWinner || d.name === thirdPlaceLoser) return `${d.radius * 2.5}px`;
                return `${d.radius * 1.2}px`;
            }
            if ((d.name === thirdPlaceWinner || d.name === thirdPlaceLoser) && visualStep === 5) return `${d.radius * 2.5}px`;
            return `${d.radius * 2}px`;
        })
        .style('height', d => {
            if (d.isChampion && visualStep === 6) return `${d.radius * 4.5}px`;
            if ((d.name === championshipWinner || d.name === finalLoser) && visualStep === 5) return `${d.radius * 3}px`;
            if (d.isSideStage) {
                if (d.name === thirdPlaceWinner || d.name === thirdPlaceLoser) return `${d.radius * 2.5}px`;
                return `${d.radius * 1.2}px`;
            }
            if ((d.name === thirdPlaceWinner || d.name === thirdPlaceLoser) && visualStep === 5) return `${d.radius * 2.5}px`;
            return `${d.radius * 2}px`;
        })
        .style('opacity', d => {
            if (d.name === championshipWinner) return 1;
            if (visualStep === 6) {
                // FINALE podium - clear visibility hierarchy
                if (d.name === finalLoser) return 0.9; // Runner-up
                if (d.name === thirdPlaceWinner) return 0.85; // 3rd place
            }
            if (d.name === finalLoser || d.name === thirdPlaceWinner || d.name === thirdPlaceLoser) {
                return (visualStep === 5) ? 1 : 0.75; // Full opacity in Showdown
            }
            if (d.isSideStage) return 0.7;
            return d.isEliminated ? 0 : 1;
        })
        .tween('float', function (d) {
            if (d.targetFx !== null && d.targetFx !== undefined && !isNaN(d.targetFx)) {
                const iX = d3.interpolate(d.fx || d.x, d.targetFx);
                const iY = d3.interpolate(d.fy || d.y, d.targetFy);
                return (t) => { d.fx = iX(t); d.fy = iY(t); };
            } else {
                return (t) => { d.fx = null; d.fy = null; };
            }
        });

    simulation.alpha(0.8).restart();
}

async function init() {
    startCountdown();

    try {
        const teamsCSV = await fetchCSV(RANKINGS_URL);
        const teams = parseCSV(teamsCSV).slice(1);
        const scheduleCSV = await fetchCSV(SCHEDULE_URL);
        const schedule = parseCSV(scheduleCSV);

        const statusText = statusEl.querySelector('.status-text');
        if (statusText) statusText.textContent = 'Live Data';
        statusEl.className = 'sync-status live';
        initApp(teams, schedule);
        // Hide status text after a brief delay to show success, but keep the dot
        setTimeout(() => statusEl.classList.add('text-hidden'), 3000);
    } catch (e) {
        console.warn("Using Fallback Data:", e);
        const teams = parseCSV(FALLBACK_RANKINGS).slice(1);
        const schedule = parseCSV(FALLBACK_SCHEDULE);
        const statusText = statusEl.querySelector('.status-text');
        if (statusText) statusText.textContent = 'Offline Mode';
        statusEl.className = 'sync-status offline';
        initApp(teams, schedule);
        setTimeout(() => statusEl.classList.add('text-hidden'), 3000);
    }

    // Monte Carlo Event Listeners
    const mcBtn = document.getElementById('monte-carlo-btn');
    const stochSlider = document.getElementById('stoch-slider');
    const stochLabel = document.getElementById('stoch-val-label');

    stochSlider.oninput = (e) => {
        stochLabel.textContent = `${e.target.value}%`;
    };

    mcBtn.onclick = () => {
        const count = 1000;
        const stoch = parseInt(stochSlider.value) / 100;

        mcBtn.textContent = '⌛ SIMULATING...';
        mcBtn.disabled = true;

        // Use setTimeout to allow UI to update (show "Simulating")
        setTimeout(() => {
            try {
                const mcResults = runMonteCarlo(count, allSchedule, teamIndices, nodes, generateBracket, stoch);
                renderMonteCarloResults(mcResults);
                document.getElementById('mc-modal').classList.add('active');
            } catch (err) {
                console.error("MC Simulation failed:", err);
                alert("Simulation failed. Check console.");
            } finally {
                mcBtn.textContent = '🎲 MONTE CARLO (1000x)';
                mcBtn.disabled = false;
            }
        }, 50);
    };

    // Re-run button inside the modal
    const rerunMcBtn = document.getElementById('rerun-mc-btn');
    rerunMcBtn.onclick = () => {
        const count = 1000;
        const stoch = parseInt(stochSlider.value) / 100;

        rerunMcBtn.textContent = '⌛ SIMULATING...';
        rerunMcBtn.disabled = true;

        setTimeout(() => {
            try {
                const mcResults = runMonteCarlo(count, allSchedule, teamIndices, nodes, generateBracket, stoch);
                renderMonteCarloResults(mcResults);
            } catch (err) {
                console.error("MC Simulation failed:", err);
                alert("Simulation failed. Check console.");
            } finally {
                rerunMcBtn.textContent = '🎲 RE-RUN SIMULATION';
                rerunMcBtn.disabled = false;
            }
        }, 50);
    };

    document.getElementById('search-input').oninput = (e) => {
        searchQuery = e.target.value;
        updateFilters();
    };

    document.getElementById('simulate-btn').onclick = async () => {
        simulatedResults = simulateMatches(allSchedule, teamIndices);
        const standings = calculateStandings(simulatedResults, nodes);
        groupStandings = standings.groupStandings;
        thirdPlaceStandings = standings.thirdPlaceStandings;
        bracketData = generateBracket(groupStandings, thirdPlaceStandings, teamIndices);

        document.getElementById('download-btn').style.opacity = '1';
        document.getElementById('download-btn').style.pointerEvents = 'auto';

        if (currentView === 'bracket') {
            renderBracketView(bracketData);
        }

        saveSimulation();
        alert("Full Tournament Simulated!");
    };



    document.getElementById('visual-start-btn').onclick = () => {
        const btn = document.getElementById('visual-start-btn');
        // Hide spacebar hint on first interaction
        const hint = document.getElementById('spacebar-hint');
        if (hint) hint.style.display = 'none';

        // Check if we need to start a new simulation (no bracket data or at step 0)
        if (visualStep === 0 && (!bracketData.finalMatch)) {
            startVisualSimulation();
            btn.textContent = 'SIMULATE';
        } else {
            nextVisualStep();
        }
    };

    // Dropdown menu toggle
    const dropdownToggle = document.getElementById('options-toggle');
    const dropdownMenu = document.getElementById('options-menu');
    dropdownToggle.onclick = () => {
        dropdownMenu.classList.toggle('open');
        dropdownToggle.classList.toggle('active');
    };

    document.getElementById('open-schedule-btn').onclick = () => {
        document.getElementById('schedule-modal').classList.add('active');
        renderSchedule();
    };

    document.getElementById('schedule-search').oninput = renderSchedule;
    document.getElementById('schedule-sort').onchange = renderSchedule;

    // Stochasticity Slider
    const homeStochSlider = document.getElementById('home-stoch-slider');
    const homeStochValue = document.getElementById('home-stoch-value');
    if (homeStochSlider && homeStochValue) {
        homeStochSlider.oninput = (e) => {
            currentStochasticity = parseFloat(e.target.value);
            homeStochValue.textContent = `${Math.round(currentStochasticity * 100)}%`;
        };
    }

    document.getElementById('download-btn').onclick = () => downloadResults(simulatedResults, bracketData);
    document.getElementById('bracket-view-btn').onclick = () => switchView('bracket');

    if (loadSimulation()) {
        console.log("Loaded previous simulation results");
    }


    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            document.getElementById('schedule-modal').classList.remove('active');
            document.getElementById('mc-modal').classList.remove('active');
        }
        // Spacebar triggers SIMULATE button
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault(); // Prevent page scroll
            const hint = document.getElementById('spacebar-hint');
            if (hint) hint.style.display = 'none';
            document.getElementById('visual-start-btn').click();
        }
    });
}

window.addEventListener('resize', () => {
    const container = document.getElementById('bubble-chart');
    width = container.clientWidth;
    height = container.clientHeight;
    if (simulation) {
        simulation.force('x', d3.forceX(width / 2)).force('y', d3.forceY(height / 2)).alpha(0.3).restart();
    }
});

function renderMonteCarloResults(results) {
    const list = document.getElementById('mc-results-list');

    let html = `
        <table class="mc-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Win %</th>
                    <th>Final %</th>
                    <th>Top 4 %</th>
                    <th>Avg Pts</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.slice(0, 32).forEach((r, i) => {
        html += `
            <tr class="mc-row">
                <td style="font-weight: 800; color: #475569;">#${i + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="match-flag-sm" style="background-image: url('https://flagcdn.com/w80/${getFlagCode(r.name)}.png')"></div>
                        <span style="font-weight: 700;">${r.name}</span>
                    </div>
                </td>
                <td>
                    <div style="color: #f687b3; font-weight: 800;">${r.winProb.toFixed(1)}%</div>
                    <div class="mc-prob-bar"><div class="mc-prob-fill" style="width: ${r.winProb}%"></div></div>
                </td>
                <td style="color: #e2e8f0;">${r.finalProb.toFixed(1)}%</td>
                <td style="color: #e2e8f0;">${r.semiProb.toFixed(1)}%</td>
                <td style="color: #94a3b8;">${r.avgPoints.toFixed(1)}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    list.innerHTML = html;
}

init();
