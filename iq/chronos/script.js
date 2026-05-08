/**
 * Chronos Timeline Engine
 * Vertical Descent Version
 */

const timelineData = []; // Legacy curation flushed. Seed database is now the primary source.

// Feature: Quiz Generation Worksheet
function generateQuiz() {
    const quizEvents = [...combinedTimeline]
        .filter(e => e.significance === 1) // High Significance
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .sort((a, b) => a.startYear - b.startYear);

    // Create a temporary print view
    const printWindow = window.open('', '_blank');

    let html = `
    <html>
    <head>
        <title>Chronos History Quiz</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Playfair+Display:wght@700;900&display=swap');
            @page { size: auto; margin: 15mm; }
            body { font-family: 'Inter', sans-serif; padding: 0; color: #1a1a1a; background: #fff; line-height: 1.2; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin: 0; letter-spacing: -1px; }
            .header .subtitle { text-transform: uppercase; letter-spacing: 3px; color: #666; font-size: 0.65rem; margin-top: 2px; }
            .header .student-info { margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; display: flex; justify-content: space-between; font-weight: 700; font-size: 0.8rem; }
            
            .instructions { text-align: center; margin: 15px auto 25px auto; font-style: italic; color: #1a1a1a; font-size: 0.85rem; max-width: 600px; line-height: 1.4; }

            .timeline-wrapper { 
                position: relative; 
                max-width: 750px; 
                margin: 0 auto; 
                padding-top: 20px;
                min-height: 600px;
            }
            
            .central-axis { 
                position: absolute; 
                left: 50%; 
                transform: translateX(-50%); 
                top: 0; 
                bottom: 0; 
                width: 2px; 
                background-color: #000 !important; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                z-index: 10;
            }
            .axis-label { 
                position: absolute; 
                left: 50%; 
                transform: translateX(-50%); 
                font-size: 0.6rem; 
                font-weight: 900; 
                color: #000; 
                z-index: 11;
                letter-spacing: 2px;
                background: #fff;
                padding: 0 4px;
            }
            .axis-label.start { top: -15px; }
            .axis-label.end { bottom: -15px; }

            .quiz-row { 
                position: relative; 
                width: 100%; 
                margin-bottom: 25px; 
                display: flex; 
                align-items: center; 
                page-break-inside: avoid; 
                break-inside: avoid;
            }
            .quiz-row.left { justify-content: flex-start; }
            .quiz-row.right { justify-content: flex-end; }

            .quiz-card { 
                position: relative; 
                width: 42%; 
                padding: 12px 18px; 
                border: 1.5px solid #000; 
                background: #fff; 
                z-index: 5;
            }

            .ping { 
                position: absolute; 
                width: 10px; 
                height: 10px; 
                background-color: #000 !important; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                border-radius: 50%; 
                left: 50%; 
                top: 50%;
                transform: translate(-50%, -50%); 
                z-index: 15;
            }
            
            .connector { 
                position: absolute; 
                height: 1.5px; 
                background-color: #000 !important; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                top: 50%; 
                width: 8%; 
                z-index: 4;
            }
            .left .connector { left: 42%; }
            .right .connector { right: 42%; }

            .date-tag { 
                display: inline-block; 
                border-bottom: 2px solid #000;
                color: #000; 
                padding: 1px 0; 
                font-weight: 900; 
                font-size: 0.85rem; 
                margin-bottom: 8px; 
            }
            .options { list-style: none; padding: 0; margin: 8px 0 0 0; }
            .options li { margin-bottom: 6px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
            .checkbox { width: 14px; height: 14px; border: 1.5px solid #000; flex-shrink: 0; }
            
            @media print { 
                body { padding: 0; }
                .central-axis { height: 100%; }
            }
        </style>
    </head>
    <body onload="window.print()">
        <div class="header">
            <h1>CHRONOS</h1>
            <div class="subtitle">THE GRAND DESCENT THROUGH TIME</div>
            <div class="student-info">
                <span>NAME: ____________________________</span>
                <span>DATE: ________________</span>
            </div>
        </div>

        <p class="instructions">Analyze the chronology of the central throughline. Match each historical milestone to its timestamp.</p>

        <div class="timeline-wrapper">
            <div class="central-axis">
                <span class="axis-label start">START</span>
                <span class="axis-label end">END</span>
            </div>
    `;

    quizEvents.forEach((event, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';

        // Get distractors from the verified timeline
        const distractors = combinedTimeline
            .filter(e => e.id !== event.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(e => e.title);

        const options = [event.title, ...distractors].sort(() => Math.random() - 0.5);

        html += `
            <div class="quiz-row ${side}">
                <div class="ping"></div>
                <div class="connector"></div>
                <div class="quiz-card">
                    <span class="date-tag">${event.date}</span>
                    <ul class="options">
                        ${options.map(opt => `<li><div class="checkbox"></div> <span>${opt}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div style="margin-top: 100px; text-align: center; font-size: 0.8rem; color: #888;">
            CHRONOS HISTORICAL ENGINE &bull; LEVEL 1 CORE MILESTONES &bull; VERIFIED DATABASE
        </div>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}

// Feature: Today's Chronicle (Live Pulse)
const todayPulse = {
    date: "March 4, 2026",
    news: [
        {
            category: "Archaeology",
            title: "Ireland's 'Prehistoric Metropolis' Revealed",
            snippet: "The Brusselstown Ring survey discovers up to 600 house platforms, redefining ancient urbanism.",
            description: "New evidence from County Wicklow suggests that Irish urban traditions are 3,000 years older than previously thought. The survey of the Brusselstown Ring hillfort (1200 - 400 BCE) reveals a massive prehistoric settlement, challenging the narrative that large-scale urban centers only arrived with the Vikings.",
            url: "https://www.archaeology.org/"
        },
        {
            category: "Scientific Discovery",
            title: "Massive 'City of Fish Nests' found in Antarctica",
            snippet: "An expedition discovers millions of icefish nests in the Weddell Sea.",
            description: "Researchers from the Alfred Wegener Institute have mapped a colonial breeding area of icefish covering 240 square kilometers. This 'underwater city' provides a rare glimpse into the resilience of marine life in extreme polar environments.",
            url: "https://www.sciencedaily.com/"
        }
    ]
};

// Smart Date Formatter for Deep Time vs. History
function formatChronosDate(year) {
    const absYear = Math.abs(year);
    if (absYear >= 1000000) {
        if (absYear >= 1000000000) {
            return `${(absYear / 1000000000).toFixed(1)} Billion Years Ago`;
        } else {
            return `${(absYear / 1000000).toFixed(1)} Million Years Ago`;
        }
    }
    if (year < 0) return `${absYear.toLocaleString()} BCE`;
    return `${absYear.toLocaleString()}`; // Removed as per user request
}

// Primary Timeline Source: Seed Database
let combinedTimeline = [];
if (typeof chronosSeedDatabase !== 'undefined') {
    combinedTimeline = [...chronosSeedDatabase];
}
// Note: Legacy timelineData and wikidataHistory are no longer merged.

// Deduplicate: remove Wikidata entries that are too close in time AND title to an internal entry
(function deduplicateTimeline() {
    const seen = new Map();
    combinedTimeline = combinedTimeline.filter(event => {
        // Strip leading "the", collapse to alphanum, take first 10 chars
        const titleKey = event.title
            .toLowerCase()
            .replace(/^the\s+/, '')          // strip leading "the "
            .replace(/[^a-z0-9]/g, '')       // alphanum only
            .slice(0, 10);
        // For modern history (within 10,000 years), use exact year. For deep time, use 10k resolution.
        const yearKey = Math.abs(event.startYear) < 10000 ? event.startYear : Math.round((event.startYear || 0) / 10000);
        const key = `${titleKey}::${yearKey}`;
        if (seen.has(key)) return false;
        seen.set(key, true);
        return true;
    });
})();

// Restore any saved curation edits from localStorage
(function restoreCurationEdits() {
    try {
        const saved = localStorage.getItem('chronos_curation');
        if (saved) {
            const edits = JSON.parse(saved); // { eventId: newSignificance }
            let applied = 0;
            Object.entries(edits).forEach(([id, sig]) => {
                const event = combinedTimeline.find(e => e.id === id);
                if (event) {
                    // Remap old 1-10 values if found
                    let val = parseInt(sig);
                    if (val > 3) {
                        if (val <= 7) val = 2;
                        else val = 3;
                    }
                    event.significance = val;
                    applied++;
                }
            });
            if (applied > 0) console.log(`Chronos: Restored ${applied} curation edits from localStorage`);
        }
    } catch (e) { /* ignore parse errors */ }
})();

// Global Filter State & Lockdown
let currentSignificanceFilter = 1;
const IS_LEVEL_2_LOCKED = false;

function renderTimeline(minSignificance) {
    const container = document.getElementById('events-container');
    const progressBar = document.getElementById('progress-bar');

    // Clear current view
    container.innerHTML = '';

    // Filter and Sort: Respect dedicated level viewing as requested
    let filteredData = combinedTimeline
        .filter(e => {
            // Simplified: Dedicated level only
            return e.significance === minSignificance;
        })
        .sort((a, b) => a.startYear - b.startYear);

    if (minSignificance === 1) {
        const synthesisBlock = document.createElement('div');
        synthesisBlock.className = 'event-block visible synthesis-block';
        synthesisBlock.style.marginTop = '180px'; 
        synthesisBlock.style.marginBottom = '80px';
        synthesisBlock.style.zIndex = '100'; 
        synthesisBlock.innerHTML = `
            <div class="synthesis-card">
                <div class="synthesis-tag">THEOLOGICAL & HISTORICAL SYNTHESIS</div>
                <h2>The Threshold of Civilization</h2>
                <p>As we descend into recorded history (10,000 BCE onwards), we enter a singular time horizon that synthesizes diverse viewpoints. We acknowledge that scientific theories, historical chronicles, and sacred belief systems may offer differing accounts of our origins.</p>
                <div class="synthesis-footer">
                    <strong>Chronos Note:</strong> Our intention is to present a full, non-discriminant picture of all perspectives, honoring both the evidence of science and the traditions of faith in a unified journey through time.
                </div>
            </div>
        `;
        container.appendChild(synthesisBlock);
    }

    let blockCount = 0;

    filteredData.forEach((event) => {
        // Dynamic Gap Calculation for cleaner descent
        const gapSize = event.gap || 150;
        const spacer = document.createElement('div');
        spacer.style.height = `${gapSize}px`;
        container.appendChild(spacer);

        const block = document.createElement('div');
        const isLeft = blockCount % 2 === 0;
        block.className = `event-block ${isLeft ? 'align-left' : 'align-right'}`;
        block.id = `block-${event.id}`;

        const approxPrefix = event.approx ? '<span class="approx-tag">Around </span>' : '';
        const hasSources = event.sources && event.sources.length > 0;

        const sourceHtml = hasSources ? `
            <div class="source-card ${isLeft ? 'to-right' : 'to-left'}">
                <div class="source-trigger" onclick="event.stopPropagation(); showSources('${event.id}')">
                    <span class="source-icon">📚</span>
                    <span class="source-text">Sources</span>
                </div>
            </div>
        ` : '';

        const displayDate = formatChronosDate(event.startYear);
        const seedTag = event.source === 'SEED' ? '<span class="seed-tag" style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; margin-left: 10px; vertical-align: middle; border: 1px solid rgba(46, 204, 113, 0.3);">SEED</span>' : '';
        block.innerHTML = `
            <div class="event-card" onclick="showDetail('${event.id}')">
                <div class="event-meta">${approxPrefix}${displayDate}${seedTag}</div>
                <h3>${event.title}</h3>
                <div class="event-preview">${event.snippet}</div>
                <div class="event-dot"></div>
            </div>
            ${sourceHtml}
        `;

        // Feature: Module-Specific Rendering (Civilization Arc)
        if (typeof chronosSeedMeta !== 'undefined' && event.title === chronosSeedMeta.start_anchor) {
            const arcDivider = document.createElement('div');
            arcDivider.className = 'module-divider';
            arcDivider.innerHTML = `
                <div class="module-header-card">
                    <div class="module-tag">${chronosSeedMeta.module_name.toUpperCase()}</div>
                    <h2>The Causal Arc of Civilization</h2>
                    <p>${chronosSeedMeta.theme}</p>
                    <div class="logic-flow">
                        ${chronosSeedMeta.historical_logic.map(step => `<span>${step}</span>`).join(' <span class="flow-arrow">→</span> ')}
                    </div>
                </div>
            `;
            container.appendChild(arcDivider);
        }

        container.appendChild(block);
        blockCount++;

        // Handle reveal trigger
        setTimeout(() => block.classList.add('visible'), 50 * blockCount);
    });

    // Terminal Node
    const liveSpacer = document.createElement('div');
    liveSpacer.style.height = '400px';
    container.appendChild(liveSpacer);

    const liveBlock = document.createElement('div');
    liveBlock.className = 'event-block live-pulse-block visible';
    liveBlock.innerHTML = `
        <div class="live-pulse-card">
            <div class="live-tag"><span class="pulse-dot"></span> LIVE PULSE: ${todayPulse.date}</div>
            <h2>The Present Moment</h2>
            <div class="live-news-container">
                ${todayPulse.news.map(item => `
                    <div class="live-item">
                        <span class="live-cat">${item.category}</span>
                        <h4>${item.title}</h4>
                        <p>${item.snippet}</p>
                        <a href="${item.url}" target="_blank" class="live-link">Read Full Report &rarr;</a>
                    </div>
                `).join('')}
            </div>
            <div class="event-dot live-dot"></div>
        </div>
    `;
    container.appendChild(liveBlock);
}

function initChronos() {
    const printBtn = document.getElementById('print-quiz-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const exitQuizBtn = document.getElementById('exit-quiz-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const closeResultsBtn = document.getElementById('close-results');
    const closeOverlayBtn = document.getElementById('close-overlay');
    const closeEduOverlayBtn = document.getElementById('close-edu-overlay');
    const eduModuleBtn = document.getElementById('edu-module-btn');
    const sigSlider = document.getElementById('sig-filter');

    // Hero Actions
    if (printBtn) printBtn.onclick = generateQuiz;
    if (startQuizBtn) startQuizBtn.onclick = startInteractiveQuiz;
    if (eduModuleBtn) eduModuleBtn.onclick = showEduModule;

    // Overlay Close Buttons
    if (closeOverlayBtn) closeOverlayBtn.onclick = hideOverlay;
    if (closeEduOverlayBtn) closeEduOverlayBtn.onclick = hideEduModule;

    // Quiz Navigation
    if (exitQuizBtn) exitQuizBtn.onclick = exitQuiz;
    if (submitQuizBtn) submitQuizBtn.onclick = submitQuiz;
    if (closeResultsBtn) closeResultsBtn.onclick = closeResults;

    // Curation wiring
    const curateBtn = document.getElementById('curate-btn');
    const exitCurationBtn = document.getElementById('exit-curation-btn');
    const exportCuratedBtn = document.getElementById('export-curated-data');
    const exportPdfModalBtn = document.getElementById('export-pdf-btn-modal');
    const exportCsvModalBtn = document.getElementById('export-csv-btn-modal');
    const curationFilter = document.getElementById('curation-level-filter');
    const syncWikidataBtn = document.getElementById('sync-wikidata-btn');

    if (curateBtn) curateBtn.onclick = openCuration;
    if (exitCurationBtn) exitCurationBtn.onclick = exitCuration;
    if (exportCuratedBtn) exportCuratedBtn.onclick = exportCuratedData;
    if (exportPdfModalBtn) exportPdfModalBtn.onclick = exportEventList;
    if (exportCsvModalBtn) exportCsvModalBtn.onclick = exportTimelineToCSV;
    if (syncWikidataBtn) syncWikidataBtn.onclick = syncWithWikidata;
    if (curationFilter) curationFilter.onchange = () => {
        renderCurationTable();
        if (!document.getElementById('diagnostic-view').classList.contains('hidden')) {
            renderDiagnostics();
        }
    };

    // Tab Logic
    const tabTable = document.getElementById('tab-table');
    const tabDiag = document.getElementById('tab-diagnostics');
    if (tabTable && tabDiag) {
        tabTable.onclick = () => {
            tabTable.classList.add('active');
            tabDiag.classList.remove('active');
            document.getElementById('curation-table-container').classList.remove('hidden');
            document.getElementById('diagnostic-view').classList.add('hidden');
        };
        tabDiag.onclick = () => {
            tabDiag.classList.add('active');
            tabTable.classList.remove('active');
            document.getElementById('curation-table-container').classList.add('hidden');
            document.getElementById('diagnostic-view').classList.remove('hidden');
            renderDiagnostics();
        };
    }

    const diagApply = document.getElementById('apply-diag-filter');
    if (diagApply) diagApply.onclick = renderDiagnostics;

    // Significance Filter Listener (Dropdown)
    if (sigSlider) {
        sigSlider.onchange = (e) => {
            const val = parseInt(e.target.value);
            currentSignificanceFilter = val;
            currentQuizLevel = val;
            renderTimeline(val);
        };
    }

    // Initial Render
    renderTimeline(currentSignificanceFilter);

    // Global Scroll Listener
    window.onscroll = () => {
        const progressBar = document.getElementById('progress-bar');
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";

        // Dynamic reveal on scroll
        const blocks = document.querySelectorAll('.event-block');
        blocks.forEach(block => {
            const rect = block.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.9) {
                block.classList.add('visible');
            }
        });
    };
}

function showDetail(id) {
    const event = combinedTimeline.find(e => e.id === id);
    if (!event) return;

    const overlay = document.getElementById('event-detail-overlay');
    const approxPrefix = event.approx ? 'Around ' : '';

    document.getElementById('detail-title').innerText = event.title;
    document.getElementById('detail-date').innerText = approxPrefix + formatChronosDate(event.startYear);
    
    let descriptionHtml = `<p>${event.description}</p>`;
    
    // Relationship traversal
    if (typeof chronosSeedRelationships !== 'undefined') {
        const numericId = parseInt(event.id.replace('seed-', ''));
        const precursors = chronosSeedRelationships.filter(r => r.target === numericId);
        const outcomes = chronosSeedRelationships.filter(r => r.source === numericId);
        
        if (precursors.length > 0 || outcomes.length > 0) {
            descriptionHtml += `<div class="relationship-layer">`;
            
            if (precursors.length > 0) {
                descriptionHtml += `<div class="rel-section"><h4>Unlocked By:</h4><ul>`;
                precursors.forEach(p => {
                    const sourceEvent = combinedTimeline.find(e => e.id === `seed-${p.source}`);
                    if (sourceEvent) {
                        descriptionHtml += `<li onclick="showDetail('${sourceEvent.id}')"><span>${p.type.toUpperCase()}</span> ${sourceEvent.title}</li>`;
                    }
                });
                descriptionHtml += `</ul></div>`;
            }
            
            if (outcomes.length > 0) {
                descriptionHtml += `<div class="rel-section"><h4>Leads To:</h4><ul>`;
                outcomes.forEach(o => {
                    const targetEvent = combinedTimeline.find(e => e.id === `seed-${o.target}`);
                    if (targetEvent) {
                        descriptionHtml += `<li onclick="showDetail('${targetEvent.id}')"><span>${o.type.toUpperCase()}</span> ${targetEvent.title}</li>`;
                    }
                });
                descriptionHtml += `</ul></div>`;
            }
            
            descriptionHtml += `</div>`;
        }
    }
    
    document.getElementById('detail-description').innerHTML = descriptionHtml;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Track event view
    if (typeof gtag === 'function') {
        gtag('event', 'view_event_detail', {
            'event_title': event.title,
            'event_id': event.id
        });
    }
}

function hideOverlay() {
    const overlay = document.getElementById('event-detail-overlay');
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showSources(id) {
    const event = combinedTimeline.find(e => e.id === id);
    if (!event || !event.sources) return;

    const overlay = document.getElementById('event-detail-overlay');
    document.getElementById('detail-title').innerText = `Sources: ${event.title}`;
    document.getElementById('detail-date').innerText = "Scholarly Documentation";

    let sourceListHtml = '<div class="source-list">';
    event.sources.forEach(src => {
        sourceListHtml += `
            <div class="source-item">
                <div class="source-item-header">
                    <span class="source-item-title">${src.title}</span>
                    <span class="source-item-author">${src.author}</span>
                </div>
                <p class="source-item-desc">${src.description}</p>
                <a href="${src.url}" target="_blank" class="source-link">Access Work &rarr;</a>
            </div>
        `;
    });
    sourceListHtml += '</div>';

    document.getElementById('detail-description').innerHTML = sourceListHtml;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

let activeQuizData = [];
let currentQuizLevel = 1;

function startInteractiveQuiz() {
    document.getElementById('hero').classList.add('hidden');
    document.getElementById('timeline-wrapper').classList.add('hidden');
    document.getElementById('quiz-view').classList.remove('hidden');
    document.querySelector('footer').classList.add('hidden');
    window.scrollTo(0, 0);

    // Track quiz start
    if (typeof gtag === 'function') {
        gtag('event', 'quiz_start', {
            'level': currentQuizLevel
        });
    }
    // Use combined data for quiz
    activeQuizData = [...combinedTimeline]
        .filter(e => e.significance === currentQuizLevel)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .sort((a, b) => a.startYear - b.startYear);

    const container = document.getElementById('quiz-questions-container');
    const levelTitle = currentQuizLevel === 1 ? "HIGH SIGNIFICANCE" :
        currentQuizLevel === 2 ? "MEDIUM SIGNIFICANCE" : "LOW SIGNIFICANCE";
    container.innerHTML = `<div class="quiz-level-banner">Current Challenge: ${levelTitle}</div>`;

    activeQuizData.forEach((event, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const distractors = combinedTimeline
            .filter(e => e.id !== event.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(e => e.title);

        const options = [event.title, ...distractors].sort(() => Math.random() - 0.5);

        const row = document.createElement('div');
        row.className = `quiz-row ${side}`;
        const displayDate = formatChronosDate(event.startYear);
        row.innerHTML = `
            <div class="ping"></div>
            <div class="connector"></div>
            <div class="quiz-card">
                <span class="date-tag">${displayDate}</span>
                <h4>Identify this event:</h4>
                <ul class="quiz-options">
                    ${options.map((opt, i) => `
                        <li>
                            <label class="quiz-option">
                                <input type="radio" name="event-${event.id}" value="${opt}">
                                <span>${opt}</span>
                            </label>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        container.appendChild(row);
    });
}

function exitQuiz() {
    document.getElementById('hero').classList.remove('hidden');
    document.getElementById('timeline-wrapper').classList.remove('hidden');
    document.getElementById('quiz-view').classList.add('hidden');
    document.querySelector('footer').classList.remove('hidden');
}

function submitQuiz() {
    let score = 0;
    const missed = [];

    activeQuizData.forEach(event => {
        const selected = document.querySelector(`input[name="event-${event.id}"]:checked`);
        if (selected && selected.value === event.title) {
            score++;
        } else {
            missed.push({
                date: event.date,
                correct: event.title,
                selected: selected ? selected.value : "No answer"
            });
        }
    });

    const isPerfect = score === activeQuizData.length;
    let progressionMsg = "";

    if (isPerfect && currentQuizLevel === 1) {
        currentQuizLevel = 2;
        progressionMsg = `<div class="progression-unlocked">MASTERED! Knowledge Tier I Complete.</div>`;
    } else if (isPerfect && currentQuizLevel === 2) {
        progressionMsg = `<div class="progression-unlocked">TIME ARCHITECT STATUS ACHIEVED!</div>`;
    }

    const scorePct = Math.round((score / activeQuizData.length) * 100);
    const scoreEl = document.getElementById('results-score');
    scoreEl.innerHTML = `${progressionMsg}${scorePct}% (${score}/${activeQuizData.length})`;

    const missedEl = document.getElementById('missed-questions');
    if (missed.length === 0) {
        missedEl.innerHTML = "<p style='text-align:center'>Your knowledge of this era is absolute.</p>";
    } else {
        missedEl.innerHTML = "<h3>Gaps in your timeline:</h3>" + missed.map(m => `
            <div class="missed-item">
                <h5>${m.date}</h5>
                <p>Selection: <span style="color:#ff4757">${m.selected}</span></p>
                <p>Reality: <span style="color:#2ecc71">${m.correct}</span></p>
            </div>
        `).join('');
    }

    document.getElementById('quiz-results-overlay').style.display = 'flex';

    // Track quiz completion
    if (typeof gtag === 'function') {
        gtag('event', 'quiz_complete', {
            'score': scorePct,
            'level': currentQuizLevel,
            'perfect_score': isPerfect
        });
    }
}

function closeResults() {
    document.getElementById('quiz-results-overlay').style.display = 'none';
    exitQuiz();
}

function generateQuiz() {
    const quizEvents = [...combinedTimeline]
        .filter(e => e.significance === currentQuizLevel)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .sort((a, b) => a.startYear - b.startYear);

    // Fallback if very few events at exact level
    if (quizEvents.length < 5) {
        quizEvents.length = 0;
        const fallback = [...combinedTimeline]
            .filter(e => e.significance <= currentQuizLevel)
            .sort(() => Math.random() - 0.5)
            .slice(0, 10)
            .sort((a, b) => a.startYear - b.startYear);
        quizEvents.push(...fallback);
    }

    const printWindow = window.open('', '_blank');
    let html = `
    <html>
    <head>
        <title>Chronos History Quiz</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Playfair+Display:wght@700;900&display=swap');
            @page { size: auto; margin: 15mm; }
            body { font-family: 'Inter', sans-serif; padding: 0; color: #1a1a1a; background: #fff; line-height: 1.2; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin: 0; letter-spacing: -1px; }
            .header .subtitle { text-transform: uppercase; letter-spacing: 3px; color: #666; font-size: 0.65rem; margin-top: 2px; }
            .header .student-info { margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; display: flex; justify-content: space-between; font-weight: 700; font-size: 0.8rem; }
            .instructions { text-align: center; margin: 15px auto 25px auto; font-style: italic; color: #1a1a1a; font-size: 0.85rem; max-width: 600px; line-height: 1.4; }
            .timeline-wrapper { position: relative; max-width: 750px; margin: 0 auto; padding-top: 20px; min-height: 600px; }
            .central-axis { position: absolute; left: 50%; transform: translateX(-50%); top: 0; bottom: 0; width: 2px; background-color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; z-index: 10; }
            .axis-label { position: absolute; left: 50%; transform: translateX(-50%); font-size: 0.6rem; font-weight: 900; color: #000; z-index: 11; letter-spacing: 2px; background: #fff; padding: 0 4px; }
            .axis-label.start { top: -15px; }
            .axis-label.end { bottom: -15px; }
            .quiz-row { position: relative; width: 100%; margin-bottom: 25px; display: flex; align-items: center; page-break-inside: avoid; break-inside: avoid; }
            .quiz-row.left { justify-content: flex-start; }
            .quiz-row.right { justify-content: flex-end; }
            .quiz-card { position: relative; width: 42%; padding: 12px 18px; border: 1.5px solid #000; background: #fff; z-index: 5; }
            .ping { position: absolute; width: 10px; height: 10px; background-color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 15; }
            .connector { position: absolute; height: 1.5px; background-color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; top: 50%; width: 8%; z-index: 4; }
            .left .connector { left: 42%; }
            .right .connector { right: 42%; }
            .date-tag { display: inline-block; border-bottom: 2px solid #000; color: #000; padding: 1px 0; font-weight: 900; font-size: 0.85rem; margin-bottom: 8px; }
            .options { list-style: none; padding: 0; margin: 8px 0 0 0; }
            .options li { margin-bottom: 6px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
            .checkbox { width: 14px; height: 14px; border: 1.5px solid #000; flex-shrink: 0; }
            @media print { body { padding: 0; } .central-axis { height: 100%; } }
        </style>
    </head>
    <body onload="window.print()">
        <div class="header">
            <h1>CHRONOS</h1>
            <div class="subtitle">THE GRAND DESCENT THROUGH TIME</div>
            <div class="student-info">
                <span>NAME: ____________________________</span>
                <span>DATE: ________________</span>
            </div>
        </div>
        <p class="instructions">Analyze the chronology of the central throughline. Match each historical milestone to its timestamp.</p>
        <div class="timeline-wrapper">
            <div class="central-axis">
                <span class="axis-label start">START</span>
                <span class="axis-label end">END</span>
            </div>
    `;

    quizEvents.forEach((event, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const displayDate = formatChronosDate(event.startYear);
        const distractors = combinedTimeline
            .filter(e => e.id !== event.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(e => e.title);
        const options = [event.title, ...distractors].sort(() => Math.random() - 0.5);
        html += `
            <div class="quiz-row ${side}">
                <div class="ping"></div>
                <div class="connector"></div>
                <div class="quiz-card">
                    <span class="date-tag">${displayDate}</span>
                    <ul class="options">
                        ${options.map(opt => `<li><div class="checkbox"></div> <span>${opt}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div style="margin-top: 100px; text-align: center; font-size: 0.8rem; color: #888;">
            CHRONOS HISTORICAL ENGINE &bull; LEVEL ${currentQuizLevel} RESOLUTION &bull; VERIFIED DATABASE
        </div>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}




// ════════════════════════════════════════════════
// Feature: Database Curation Mode
// ════════════════════════════════════════════════
let curationChanges = {}; // Track changes: { eventId: newSignificance }
let curationDeletions = new Set(); // Track deleted event IDs
let curationSortCol = 'date';  // 'date', 'title', 'sig'
let curationSortAsc = true;

function openCuration() {
    document.getElementById('hero').classList.add('hidden');
    document.getElementById('timeline-wrapper').classList.add('hidden');
    document.getElementById('curation-view').classList.remove('hidden');
    document.querySelector('footer').classList.add('hidden');
    window.scrollTo(0, 0);
    curationChanges = {}; // Fresh session changes
    curationDeletions = new Set();
    renderCurationTable();
}

function exitCuration() {
    // Apply any changes to the live combinedTimeline
    const changeCount = Object.keys(curationChanges).length;
    if (changeCount > 0) {
        Object.entries(curationChanges).forEach(([id, newSig]) => {
            const event = combinedTimeline.find(e => e.id === id);
            if (event) event.significance = newSig;
        });

        // Persist ALL current significance values to localStorage
        saveCurationToLocalStorage();

        // Re-render the timeline with updated data
        renderTimeline(currentSignificanceFilter);
    }

    document.getElementById('hero').classList.remove('hidden');
    document.getElementById('timeline-wrapper').classList.remove('hidden');
    document.getElementById('curation-view').classList.add('hidden');
    document.querySelector('footer').classList.remove('hidden');
}

function saveCurationToLocalStorage() {
    // Build a map of id -> current significance for any event that differs from its original file value
    // We store the full current state so it can be restored on reload
    const edits = {};
    combinedTimeline.forEach(e => {
        // Find original value from the source arrays
        const origInternal = timelineData.find(t => t.id === e.id);
        const origSeed = (typeof chronosSeedDatabase !== 'undefined') ? chronosSeedDatabase.find(t => t.id === e.id) : null;
        const originalSig = origInternal ? origInternal.significance : (origSeed ? origSeed.significance : null);
        // Note: originalSig from the source arrays may already have been overwritten in memory
        // So we just store ALL current values — simpler and more reliable
        edits[e.id] = e.significance;
    });
    localStorage.setItem('chronos_curation', JSON.stringify(edits));
    console.log(`Chronos: Saved ${Object.keys(edits).length} event states to localStorage`);
}

function renderCurationTable() {
    const filterVal = document.getElementById('curation-level-filter').value;
    const container = document.getElementById('curation-table-container');
    const gapsEl = document.getElementById('curation-gaps');
    const statsEl = document.getElementById('curation-stats');

    // Build working data with current significance (including pending changes)
    let data = combinedTimeline.map(e => ({
        ...e,
        currentSig: curationChanges[e.id] !== undefined ? curationChanges[e.id] : e.significance,
        isChanged: curationChanges[e.id] !== undefined,
        source: e.source || (timelineData.some(t => t.id === e.id) ? 'CURATED' : 'SEED')
    }));

    // Filter
    if (filterVal !== 'all') {
        const level = parseInt(filterVal);
        data = data.filter(e => e.currentSig === level);
    }

    // Sort
    data.sort((a, b) => {
        let cmp = 0;
        if (curationSortCol === 'date') cmp = a.startYear - b.startYear;
        else if (curationSortCol === 'title') cmp = a.title.localeCompare(b.title);
        else if (curationSortCol === 'sig') cmp = a.currentSig - b.currentSig;
        return curationSortAsc ? cmp : -cmp;
    });

    // Stats
    const totalChanges = Object.keys(curationChanges).length;
    const levelCounts = {};
    combinedTimeline.forEach(e => {
        const sig = curationChanges[e.id] !== undefined ? curationChanges[e.id] : e.significance;
        levelCounts[sig] = (levelCounts[sig] || 0) + 1;
    });
    let statsHtml = `<strong>${data.length}</strong> events shown`;
    if (filterVal === 'all') {
        statsHtml += ` &nbsp;|&nbsp; `;
        for (let i = 1; i <= 3; i++) {
            statsHtml += `L${i}: <strong>${levelCounts[i] || 0}</strong>&nbsp; `;
        }
    }
    if (totalChanges > 0) {
        statsHtml += ` &nbsp;|&nbsp; <strong>${totalChanges}</strong> pending change${totalChanges > 1 ? 's' : ''}`;
    }
    statsEl.innerHTML = statsHtml;

    // Gap Detection (only when filtering a specific level)
    gapsEl.innerHTML = '';
    if (filterVal !== 'all') {
        const level = parseInt(filterVal);
        const levelEvents = combinedTimeline
            .filter(e => {
                const sig = curationChanges[e.id] !== undefined ? curationChanges[e.id] : e.significance;
                return sig <= level;
            })
            .sort((a, b) => a.startYear - b.startYear);

        // Define gap thresholds based on era
        for (let i = 0; i < levelEvents.length - 1; i++) {
            const curr = levelEvents[i];
            const next = levelEvents[i + 1];
            const gapYears = next.startYear - curr.startYear;

            // Only flag gaps in the historical era (after 10000 BCE) that span > 500 years
            // For deep time, gaps of billions of years are expected
            let threshold = 500;
            if (curr.startYear < -10000) threshold = 1000000; // deep time: 1M year gaps are fine
            if (curr.startYear < -1000000) threshold = 100000000; // really deep time

            if (gapYears > threshold && curr.startYear > -100000) {
                const fromDate = formatChronosDate(curr.startYear);
                const toDate = formatChronosDate(next.startYear);
                const gapDisplay = gapYears >= 1000000
                    ? `${(gapYears / 1000000).toFixed(1)}M years`
                    : `${gapYears.toLocaleString()} years`;
                gapsEl.innerHTML += `
                    <div class="gap-alert">
                        <span class="gap-icon">⚠️</span>
                        <span class="gap-text">Gap between <strong>${curr.title}</strong> and <strong>${next.title}</strong></span>
                        <span class="gap-span">${fromDate} → ${toDate} (${gapDisplay})</span>
                    </div>
                `;
            }
        }
    }

    // Table
    if (data.length === 0) {
        container.innerHTML = '<div class="curation-empty">No events at this level.</div>';
        return;
    }

    const sortIcon = (col) => {
        if (curationSortCol === col) return curationSortAsc ? ' ▴' : ' ▾';
        return '';
    };

    let html = `
        <table class="curation-table">
            <thead>
                <tr>
                    <th data-col="date">Date${sortIcon('date')}</th>
                    <th data-col="title">Event${sortIcon('title')}</th>
                    <th>Description</th>
                    <th data-col="sig">Level${sortIcon('sig')}</th>
                    <th>Source</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(event => {
        if (curationDeletions.has(event.id)) return; // Skip deleted items

        const displayDate = formatChronosDate(event.startYear);
        const title = event.title || '';
        const desc = event.description || event.snippet || '';
        const changedClass = event.isChanged ? 'changed' : '';
        const changeMarker = event.isChanged ? '<span class="change-indicator"></span>' : '';
        const levelClass = event.currentSig <= 5 ? `level-${event.currentSig}` : '';

        let sigOptions = '';
        for (let i = 1; i <= 3; i++) {
            sigOptions += `<option value="${i}" ${i === event.currentSig ? 'selected' : ''}>${i}</option>`;
        }

        html += `
            <tr class="${changedClass}" data-id="${event.id}">
                <td class="col-date">${displayDate}</td>
                <td class="col-title" contenteditable="true" data-field="title">${title}</td>
                <td class="col-desc" contenteditable="true" data-field="description">${desc}</td>
                <td class="col-sig">
                    <select class="sig-select ${levelClass}" data-id="${event.id}" data-original="${event.significance}">
                        ${sigOptions}
                    </select>
                    ${changeMarker}
                </td>
                <td class="col-source">${event.source}</td>
                <td class="col-actions">
                    <button class="delete-btn" data-id="${event.id}" title="Remove from timeline">🗑️</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Wire up change listeners
    container.querySelectorAll('.sig-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            const original = parseInt(e.target.dataset.original);
            const newVal = parseInt(e.target.value);

            if (newVal !== original) {
                curationChanges[id] = newVal;
            } else {
                delete curationChanges[id];
            }
            renderCurationTable();
        });
    });

    // Wire up delete listeners
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm("Are you sure you want to remove this event from the timeline?")) {
                curationDeletions.add(id);
                renderCurationTable();
            }
        });
    });

    // Wire up text edit listeners
    container.querySelectorAll('[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('blur', (e) => {
            const id = e.target.closest('tr').dataset.id;
            const field = e.target.dataset.field;
            const newVal = e.target.innerText.trim();
            const event = combinedTimeline.find(ev => ev.id === id);

            if (event && event[field] !== newVal) {
                event[field] = newVal;
                // Add to curationChanges so it marks as changed
                curationChanges[id] = event.significance;
                renderCurationTable();
            }
        });
    });

    // Wire up column sort
    container.querySelectorAll('th[data-col]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            if (curationSortCol === col) {
                curationSortAsc = !curationSortAsc;
            } else {
                curationSortCol = col;
                curationSortAsc = true;
            }
            renderCurationTable();
        });
    });
}

/**
 * Feature: Timeline Diagnostics (Gap Analysis)
 */
function getGapThreshold(year) {
    if (year > 1900) return 5;
    if (year > 1700) return 20;
    if (year > 500) return 50;
    if (year >= -1000) return 100;
    if (year >= -10000) return 500;
    return 50000; // Deep time
}

function renderDiagnostics() {
    const chartContainer = document.getElementById('gap-analysis-chart');
    const gapsEl = document.getElementById('curation-gaps');
    const startYearFilter = parseInt(document.getElementById('diag-start-year').value) || -Infinity;
    const endYearFilter = parseInt(document.getElementById('diag-end-year').value) || Infinity;
    const sigLevel = document.getElementById('curation-level-filter').value;

    let data = [...combinedTimeline];
    if (sigLevel !== 'all') {
        const level = parseInt(sigLevel);
        data = data.filter(e => e.significance <= level);
    }
    
    // Filter by year range and sort
    data = data.filter(e => e.startYear >= startYearFilter && e.startYear <= endYearFilter)
               .sort((a, b) => a.startYear - b.startYear);

    if (data.length < 2) {
        chartContainer.innerHTML = '<div class="diag-empty">Add more events to scan for gaps.</div>';
        gapsEl.innerHTML = '';
        return;
    }

    let chartHtml = '';
    let gapAlertsHtml = '<h3>Critical Gaps Identified:</h3>';
    let alertCount = 0;

    // Calculate Spreads
    const gaps = [];
    for (let i = 0; i < data.length - 1; i++) {
        const curr = data[i];
        const next = data[i + 1];
        const spread = next.startYear - curr.startYear;
        const threshold = getGapThreshold(curr.startYear);
        
        const severity = spread > threshold * 2 ? 'crit' : (spread > threshold ? 'warn' : 'ok');
        
        gaps.push({
            from: curr,
            to: next,
            spread,
            threshold,
            severity
        });

        if (severity !== 'ok') {
            alertCount++;
            gapAlertsHtml += `
                <div class="gap-alert-card ${severity}">
                    <div class="gap-meta">
                        <span class="gap-spread">${spread.toLocaleString()} Year Spread</span>
                        <span class="gap-years">${formatChronosDate(curr.startYear)} → ${formatChronosDate(next.startYear)}</span>
                    </div>
                    <div class="gap-events">
                        Between <strong>${curr.title}</strong> and <strong>${next.title}</strong>
                    </div>
                </div>
            `;
        }
    }

    // Render Simple Bar Chart
    const maxSpread = Math.max(...gaps.map(g => g.spread));
    
    chartHtml = `
        <div class="spread-chart">
            ${gaps.map(g => {
                const heightPct = Math.max(5, (g.spread / maxSpread) * 100);
                return `
                    <div class="spread-bar-container" title="${g.from.title} to ${g.to.title}\nSpread: ${g.spread.toLocaleString()} years">
                        <div class="spread-bar ${g.severity}" style="height: ${heightPct}%"></div>
                        <div class="spread-label">${formatChronosDate(g.from.startYear).replace(' BCE', 'B').replace(' CE', 'C')}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    chartContainer.innerHTML = chartHtml;
    gapsEl.innerHTML = alertCount > 0 ? gapAlertsHtml : '<div class="diag-healthy">Timeline scan complete. No critical gaps found in this range.</div>';
}

function exportCuratedData() {
    // Apply pending changes first
    Object.entries(curationChanges).forEach(([id, newSig]) => {
        const event = combinedTimeline.find(e => e.id === id);
        if (event) event.significance = newSig;
    });

    // Handle Deletions: Filter out deleted items from the live combinedTimeline
    if (curationDeletions.size > 0) {
        // We modify the live combinedTimeline
        combinedTimeline = combinedTimeline.filter(e => !curationDeletions.has(e.id));
    }

    // Persist to localStorage
    saveCurationToLocalStorage();

    // Separate back into timelineData events and wikidataHistory events
    const internalIds = new Set(timelineData.map(e => e.id));
    const updatedInternal = combinedTimeline.filter(e => internalIds.has(e.id));
    const updatedWikidata = combinedTimeline.filter(e => !internalIds.has(e.id));

    // Generate wikidata_consensus.js content
    const wikidataContent = `// Vetted Wikidata Historical Consensus\nconst wikidataHistory = ${JSON.stringify(updatedWikidata, null, 4)};\n`;

    // Generate the timelineData block for script.js
    // We wrap it so the user knows where to paste it
    const timelineDataContent = `/**\n * Chronos Timeline Engine\n * Vertical Descent Version\n */\n\nconst timelineData = ${JSON.stringify(updatedInternal, null, 4)};\n`;

    // Auto-download both files
    downloadFile('wikidata_consensus.js', wikidataContent);
    setTimeout(() => downloadFile('timelineData_export.js', timelineDataContent), 500);

    // Show confirmation
    const changeCount = Object.keys(curationChanges).length;
    curationChanges = {};
    renderCurationTable();
    alert(`✅ ${changeCount > 0 ? changeCount + ' changes applied. ' : ''}2 files downloaded:\n\n` +
        `1. wikidata_consensus.js\n   → Replace the file in your chronos/ folder\n\n` +
        `2. timelineData_export.js\n   → Replace the timelineData array at the top of script.js with this file's contents\n\n` +
        `Your edits are also saved in the browser so they persist across page refreshes.`);

    // Track data export
    if (typeof gtag === 'function') {
        gtag('event', 'data_export', {
            'changes': changeCount
        });
    }
}

function exportTimelineToCSV() {
    // Filter by current significance if not in curation mode
    const isCuration = !document.getElementById('curation-view').classList.contains('hidden');
    let dataList = [...combinedTimeline];
    
    if (!isCuration) {
        dataList = dataList.filter(e => e.significance <= currentSignificanceFilter);
    }
    
    const masterList = dataList.sort((a, b) => a.startYear - b.startYear);

    // CSV Header: ID, Date, Era, Significance, Category, Subcategory, Region, Location, Est Start, Est End, Confidence, Event, Description
    let csv = 'ID,Date,Era,Significance,Category,Subcategory,Region,Location,Estimated Start Date,Estimated End Date,Circa Confidence,Event,Description\n';

    masterList.forEach(item => {
        const id = item.id || '';
        const startYear = item.startYear || 0;
        const endYear = item.endYear !== undefined ? item.endYear : startYear;
        const significance = item.significance || 1;
        
        const era = startYear < 0 ? 'BCE' : 'CE';
        const absYear = Math.abs(startYear);
        const absEndYear = Math.abs(endYear);
        
        const confidence = item.confidence || (item.approx ? 'Moderate' : 'High');
        
        // Escape all text fields
        const cat = `"${(item.category || '').replace(/"/g, '""')}"`;
        const subcat = `"${(item.subcategory || '').replace(/"/g, '""')}"`;
        const region = `"${(item.region || '').replace(/"/g, '""')}"`;
        const loc = `"${(item.location || '').replace(/"/g, '""')}"`;
        const title = `"${(item.title || '').replace(/"/g, '""')}"`;
        const desc = `"${(item.description || item.snippet || '').replace(/"/g, '""')}"`;

        csv += `${id},${absYear},${era},${significance},${cat},${subcat},${region},${loc},${absYear},${absEndYear},${confidence},${title},${desc}\n`;
    });

    const fileName = isCuration ? 'chronos_master_db_export.csv' : `chronos_level_${currentSignificanceFilter}_export.csv`;
    downloadFile(fileName, csv, 'text/csv');

    if (typeof gtag === 'function') {
        gtag('event', 'csv_export', { 'item_count': masterList.length });
    }
}

function syncWithWikidata() {
    alert("System Note: Wikidata synchronization is currently disabled to maintain the integrity of the Verified Seed Database.");
}

function downloadFile(filename, content, mimeType = 'application/javascript') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearCurationStorage() {
    localStorage.removeItem('chronos_curation');
    console.log('Chronos: Cleared curation localStorage');
}

// Feature: Export Event List as PDF
function exportEventList() {
    const events = [...combinedTimeline]
        .filter(e => e.significance <= currentSignificanceFilter)
        .sort((a, b) => a.startYear - b.startYear);

    const levelLabel = currentSignificanceFilter === 1 ? 'Level 1 — High Significance'
        : currentSignificanceFilter === 2 ? `Level 2 — Medium Significance`
            : `Level 3 — Low Significance`;

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const printWindow = window.open('', '_blank');
    let html = `
    <html>
    <head>
        <title>Chronos Event List — Level ${currentSignificanceFilter}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
            @page { size: auto; margin: 18mm 15mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; line-height: 1.5; }

            .page-header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #1a1a1a;
                margin-bottom: 30px;
            }
            .page-header h1 {
                font-family: 'Playfair Display', serif;
                font-size: 2.4rem;
                letter-spacing: -1px;
                margin-bottom: 2px;
            }
            .page-header .level {
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 3px;
                color: #666;
            }
            .page-header .meta {
                margin-top: 12px;
                display: flex;
                justify-content: space-between;
                font-size: 0.75rem;
                color: #999;
            }

            .event-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
            }
            .event-table thead th {
                text-align: left;
                padding: 10px 12px;
                font-size: 0.65rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #666;
                border-bottom: 2px solid #1a1a1a;
            }
            .event-table thead th:first-child { width: 22%; }
            .event-table thead th:nth-child(2) { width: 25%; }
            .event-table thead th:nth-child(3) { width: 53%; }

            .event-table tbody tr {
                border-bottom: 1px solid #eee;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .event-table tbody tr:nth-child(even) {
                background: #fafafa;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .event-table tbody td {
                padding: 10px 12px;
                vertical-align: top;
            }
            .event-table .date-cell {
                font-weight: 700;
                white-space: nowrap;
                color: #333;
            }
            .event-table .title-cell {
                font-weight: 700;
                color: #1a1a1a;
            }
            .event-table .desc-cell {
                color: #555;
                font-size: 0.8rem;
                line-height: 1.5;
            }

            .page-footer {
                margin-top: 40px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 0.7rem;
                color: #bbb;
                letter-spacing: 1px;
            }

            @media print {
                body { padding: 0; }
                .event-table tbody tr:nth-child(even) {
                    background: #fafafa !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body onload="window.print()">
        <div class="page-header">
            <h1>CHRONOS</h1>
            <div class="level">${levelLabel}</div>
            <div class="meta">
                <span>${events.length} Events</span>
                <span>Generated ${today}</span>
            </div>
        </div>

        <table class="event-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
    `;

    events.forEach(event => {
        const displayDate = formatChronosDate(event.startYear);
        const desc = event.description || event.snippet || '';
        html += `
                <tr>
                    <td class="date-cell">${displayDate}</td>
                    <td class="title-cell">${event.title}</td>
                    <td class="desc-cell">${desc}</td>
                </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <div class="page-footer">
            CHRONOS HISTORICAL ENGINE &bull; ${levelLabel.toUpperCase()} &bull; VERIFIED DATABASE
        </div>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}

/**
 * Feature: Educational Module (How Do We Know?)
 */
function showEduModule() {
    const overlay = document.getElementById('edu-overlay');
    const container = overlay.querySelector('.edu-modal-content');
    const m = chronosEduModule.content;

    let html = `
        <div class="edu-header">
            <div class="synthesis-tag">${chronosEduModule.metadata.module_name.toUpperCase()}</div>
            <h2>Detective Work in the Past</h2>
        </div>
        <p class="edu-overview">${m.overview}</p>
        
        <div class="edu-method-grid">
            ${m.methods.map(method => `
                <div class="edu-method-card">
                    <h3>${method.title}</h3>
                    <p>${method.description}</p>
                    <div class="edu-example"><strong>Clue Example:</strong> ${method.example}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="edu-comparison-section">
            <div class="synthesis-tag">THE CHART OF CLUES</div>
            <h3>${m.comparison.title}</h3>
            <p>${m.comparison.text}</p>
        </div>
        
        <div class="edu-faq-section">
            <div class="synthesis-tag">QUESTIONS & ANSWERS</div>
            ${m.faq.map(item => `
                <div class="edu-faq-item">
                    <div class="faq-q">🤔 ${item.q}</div>
                    <div class="faq-a">${item.a}</div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 60px; text-align: center; opacity: 0.5; font-size: 0.8rem;">
            Learning Journey &bull; Chronos History Engine
        </div>
    `;

    container.innerHTML = html;
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function hideEduModule() {
    document.getElementById('edu-overlay').classList.remove('visible');
    document.body.style.overflow = 'auto';
}

// Start
document.addEventListener('DOMContentLoaded', initChronos);

