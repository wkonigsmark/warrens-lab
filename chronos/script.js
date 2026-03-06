/**
 * Chronos Timeline Engine
 * Vertical Descent Version
 */

const timelineData = [
    {
        id: "earth-forms",
        startYear: -4500000000,
        date: "4.5 Billion Years Ago",
        title: "Formation of Earth",
        significance: 1,
        snippet: "A rocky planet coalesces in the goldilocks zone of a young star.",
        description: "Gravity pulls swirling gas and dust into the third planet from the sun. Earth begins as a molten inferno, eventually cooling to form the solid crust, atmosphere, and vast oceans that would eventually cradle life.",
        gap: 800,
        approx: false
    },
    {
        id: "life-begins",
        startYear: -3500000000,
        date: "3.5 Billion Years Ago",
        title: "The Spark of Life",
        significance: 1,
        snippet: "The first single-celled organisms emerge in Earth's primeval oceans.",
        description: "Deep in fossilized hydrothermal vents, simple prokaryotes begin a multibillion-year journey. This transition from chemistry to biology marks the most profound shift in the history of the planet.",
        gap: 600,
        approx: false
    },
    {
        id: "dinosaurs",
        startYear: -230000000,
        date: "230 – 66 Million BCE",
        title: "The Age of Dinosaurs",
        significance: 1,
        snippet: "Giant reptiles dominate the terrestrial landscape for over 160 million years.",
        description: "From the Triassic to the Cretaceous, dinosaurs were the undisputed masters of Earth. Their vast reign ended in fire and dust with the Chicxulub asteroid impact, clearing the path for the rise of mammals.",
        gap: 700,
        approx: true
    },
    {
        id: "homo-sapiens",
        startYear: -300000,
        date: "300,000 BCE",
        title: "Rise of Homo Sapiens",
        significance: 1,
        snippet: "Anatomically modern humans emerge in Africa.",
        description: "Equipped with cognitive capacity for language, art, and complex tools, Homo sapiens begin migrating across the planet, eventually outlasting all other hominid species through innovation and social structure.",
        gap: 600,
        approx: true
    },
    {
        id: "agriculture",
        startYear: -10000,
        date: "10,000 BCE",
        title: "Agricultural Revolution",
        significance: 1,
        snippet: "The shift from foraging to farming fundamentally transforms human society.",
        description: "In the Fertile Crescent, humans begin domesticating plants and animals. This Neolithic shift leads to permanent settlements, surplus food, and the eventual rise of specialized labor and social hierarchies.",
        gap: 500,
        approx: true
    },
    {
        id: "egyptians",
        startYear: -3100,
        date: "3100 BCE",
        title: "Empire of the Nile",
        significance: 1,
        snippet: "The unification of Upper and Lower Egypt.",
        description: "Pharaoh Narmer unites the Nile Valley, initiating a civilization that would build pyramids, develop hieroglyphics, and endure for three millennia.",
        gap: 300,
        approx: true
    },
    {
        id: "christ-birth",
        startYear: -4,
        date: "c. 4 BCE",
        title: "The Life of Jesus of Nazareth",
        significance: 1,
        snippet: "The life of the central figure of Christianity.",
        description: "Regardless of belief, the life and teachings of Jesus of Nazareth fundamentally reshaped the Western world's calendar, ethics, and political history for over two thousand years.",
        gap: 400,
        approx: true
    },
    {
        id: "gunpowder",
        startYear: 850,
        date: "c. 850 AD",
        title: "Discovery of Gunpowder",
        significance: 1,
        snippet: "The accidental discovery that changed warfare forever.",
        description: "Taoist alchemists in China mixed saltpeter, sulfur, and charcoal while seeking an elixir of life. The resulting explosive changed the nature of global conflict and the power of empires.",
        gap: 300,
        approx: true
    },
    {
        id: "world-wars",
        startYear: 1914,
        date: "1914 – 1945 AD",
        title: "The World Wars",
        significance: 1,
        snippet: "The global total wars that defined the modern era.",
        description: "Two global conflicts that reshaped borders, technology, and international law. WWI saw the end of old empires, while WWII ended in the nuclear age and the formation of the United Nations.",
        gap: 400,
        approx: false
    },
    {
        id: "moon-landing",
        startYear: 1969,
        date: "July 20, 1969",
        title: "The Moon Landing",
        significance: 1,
        snippet: "The first humans set foot on another celestial body.",
        description: "NASA's Apollo 11 mission landed Neil Armstrong and Buzz Aldrin on the lunar surface. It remains the absolute pinnacle of human engineering and exploration beyond our home planet.",
        gap: 200,
        approx: false
    },
    {
        id: "independence",
        startYear: 1776,
        date: "July 4, 1776",
        title: "Declaration of Independence",
        significance: 1,
        snippet: "The thirteen colonies formally break from the British Empire.",
        description: "Drafted primarily by Thomas Jefferson, the declaration stated the philosophical and practical reasons for the American Revolution, asserting that 'all men are created equal' with unalienable rights.",
        gap: 300,
        approx: false
    },
    {
        id: "constitition",
        startYear: 1787,
        date: "September 17, 1787",
        title: "U.S. Constitution Signed",
        significance: 1,
        snippet: "The establishment of the supreme law of the United States.",
        description: "The framers created a system of checks and balances that became a blueprint for modern representative democracy.",
        gap: 300,
        approx: false
    }
];

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

        // Get distractors
        const distractors = timelineData
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
    return `${absYear.toLocaleString()} AD`;
}

// Combined Timeline Strategy: Internal Curation + Scholarly Wikidata Consensus
let combinedTimeline = [...timelineData];
if (typeof wikidataHistory !== 'undefined') {
    combinedTimeline = [...combinedTimeline, ...wikidataHistory];
}

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
        const yearKey = Math.round((event.startYear || 0) / 10000);
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

// Global Filter State
let currentSignificanceFilter = 1;

function renderTimeline(minSignificance) {
    const container = document.getElementById('events-container');
    const progressBar = document.getElementById('progress-bar');

    // Clear current view
    container.innerHTML = '';

    // Filter and Sort
    const filteredData = combinedTimeline
        .filter(e => e.significance <= minSignificance)
        .sort((a, b) => a.startYear - b.startYear);

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
        block.innerHTML = `
            <div class="event-card" onclick="showDetail('${event.id}')">
                <div class="event-meta">${approxPrefix}${displayDate}</div>
                <h3>${event.title}</h3>
                <div class="event-preview">${event.snippet}</div>
                <div class="event-dot"></div>
            </div>
            ${sourceHtml}
        `;

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
    const exportBtn = document.getElementById('export-pdf-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const exitQuizBtn = document.getElementById('exit-quiz-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const closeResultsBtn = document.getElementById('close-results');
    const closeOverlayBtn = document.getElementById('close-overlay');
    const sigSlider = document.getElementById('sig-filter');
    const sigValText = document.getElementById('sig-val');

    if (printBtn) printBtn.onclick = generateQuiz;
    if (exportBtn) exportBtn.onclick = exportEventList;
    if (startQuizBtn) startQuizBtn.onclick = startInteractiveQuiz;
    if (exitQuizBtn) exitQuizBtn.onclick = exitQuiz;
    if (submitQuizBtn) submitQuizBtn.onclick = submitQuiz;
    if (closeResultsBtn) closeResultsBtn.onclick = closeResults;
    if (closeOverlayBtn) closeOverlayBtn.onclick = hideOverlay;

    // Curation wiring
    const curateBtn = document.getElementById('curate-btn');
    const exitCurationBtn = document.getElementById('exit-curation-btn');
    const exportCuratedBtn = document.getElementById('export-curated-data');
    const curationFilter = document.getElementById('curation-level-filter');

    const syncWikidataBtn = document.getElementById('sync-wikidata-btn');

    if (curateBtn) curateBtn.onclick = openCuration;
    if (exitCurationBtn) exitCurationBtn.onclick = exitCuration;
    if (exportCuratedBtn) exportCuratedBtn.onclick = exportCuratedData;
    if (syncWikidataBtn) syncWikidataBtn.onclick = syncWithWikidata;
    if (curationFilter) curationFilter.onchange = () => renderCurationTable();

    // Significance Filter Listener
    if (sigSlider) {
        sigSlider.oninput = (e) => {
            const val = parseInt(e.target.value);
            const label = val === 1 ? '1 (High)' : val === 2 ? '2 (Med)' : '3 (Low)';
            sigValText.innerText = label;
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
    document.getElementById('detail-date').innerText = approxPrefix + event.date;
    document.getElementById('detail-description').innerText = event.description;

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
        progressionMsg = `<div class="progression-unlocked">MASTERED! Level 2 Now Unlocked.</div>`;
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
        const origWiki = (typeof wikidataHistory !== 'undefined') ? wikidataHistory.find(t => t.id === e.id) : null;
        const originalSig = origInternal ? origInternal.significance : (origWiki ? origWiki.significance : null);
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
        source: timelineData.some(t => t.id === e.id) ? 'curated' : 'wikidata'
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
        const desc = event.snippet || event.description || '';
        const truncDesc = desc.length > 120 ? desc.slice(0, 120) + '…' : desc;
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
                <td class="col-title">${event.title}</td>
                <td class="col-desc">${truncDesc}</td>
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

async function syncWithWikidata() {
    const btn = document.getElementById('sync-wikidata-btn');
    const originalText = btn.innerText;
    btn.innerText = "🛰️ Syncing...";
    btn.disabled = true;

    // Balanced Sweep SPARQL Query
    // Targets a middle ground of significance (70+ sitelinks) to ensure a robust list without timeout issues.
    const sparql = `
    SELECT DISTINCT ?item ?itemLabel ?date ?description ?sitelinks WHERE {
      {
        # --- Major Historical Categories ---
        VALUES ?type { 
          wd:Q1190554 wd:Q198 wd:Q178561 wd:Q1322139 wd:Q12519 
          wd:Q4692 wd:Q124901 wd:Q131569 wd:Q30248 wd:Q134808 
          wd:Q839954 wd:Q25674 wd:Q23498 wd:Q16567
        }
        ?item wdt:P31 ?type .
        ?item wikibase:sitelinks ?sitelinks .
        FILTER(?sitelinks > 70) 
      } UNION {
        # --- Global Icons (Humans: World Leaders, Thinkers) ---
        ?item wdt:P31 wd:Q5 . 
        ?item wikibase:sitelinks ?sitelinks .
        FILTER(?sitelinks > 200)
      } UNION {
        # --- Core Historical Markers ---
        VALUES ?item {
          wd:Q4692 wd:Q8432 wd:Q35333 wd:Q12978 wd:Q7650 wd:Q8027 wd:Q39739 
          wd:Q5582 wd:Q9353 wd:Q307 wd:Q193484 wd:Q8942 wd:Q9129 wd:Q12519
          wd:Q106660 wd:Q144334 wd:Q12562 wd:Q192761 wd:Q517 wd:Q17422
          wd:Q13131 wd:Q9392 wd:Q5264 wd:Q362 wd:Q12032 wd:Q1776
        }
        ?item wikibase:sitelinks ?sitelinks .
      }
      { ?item wdt:P585 ?date . } UNION { ?item wdt:P580 ?date . } UNION { ?item wdt:P569 ?date . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "en") }
    } ORDER BY DESC(?sitelinks) LIMIT 400`;

    const url = "https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql);

    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const data = await response.json();

        const results = data.results.bindings;
        let newCount = 0;

        results.forEach(b => {
            const id = b.item.value.split('/').pop();
            if (combinedTimeline.some(e => e.id === id)) return; // Skip existing

            const title = b.itemLabel.value;
            const rawDate = b.date.value;
            const sitelinks = parseInt(b.sitelinks.value);
            const desc = b.description ? b.description.value : "";

            // Basic date parsing
            let year = 0;
            let dateStr = "";
            if (rawDate.startsWith('-')) {
                year = -parseInt(rawDate.substring(1).split('-')[0]);
                dateStr = `${Math.abs(year)} BCE`;
            } else {
                year = parseInt(rawDate.split('-')[0]);
                dateStr = year < 1000 ? `${year} AD` : `${year}`;
            }

            // Significance
            let sig = (sitelinks > 180) ? 1 : (sitelinks > 80 ? 2 : 3);

            const newEvent = {
                id, title, date: dateStr, startYear: year,
                description: desc, snippet: desc.substring(0, 100),
                significance: sig, gap: 150,
                source: 'WIKIDATA'
            };

            wikidataHistory.push(newEvent);
            combinedTimeline.push(newEvent);
            newCount++;
        });

        alert(`Sync Complete! Added ${newCount} new significant events from Wikidata.\n\nNote: These are now in the table. Use 'Export' to save them permanently.`);
        renderCurationTable();

        // Track Wikidata sync
        if (typeof gtag === 'function') {
            gtag('event', 'wikidata_sync', {
                'new_events': newCount
            });
        }
    } catch (e) {
        console.error(e);
        alert("Failed to sync with Wikidata. This can happen if the query takes too long or there is a network issue.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'application/javascript' });
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

// Start
document.addEventListener('DOMContentLoaded', initChronos);

