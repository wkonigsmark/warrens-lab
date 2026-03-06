/**
 * Chronos Timeline Engine
 * Vertical Descent Version
 */

const timelineData = [
    {
        id: "big-bang",
        startYear: -13800000000,
        date: "13.8 Billion Years Ago",
        title: "The Big Bang",
        significance: 10,
        snippet: "The emergence of space, time, and matter from a cosmic singularity.",
        description: "Nearly 14 billion years ago, the universe began as a hot, dense point and has been expanding ever since. This cataclysmic inflation gave rise to the first atoms, stars, and eventually galaxies. It is the absolute zero of our history.",
        gap: 0,
        approx: false,
        sources: [
            {
                title: "The First Three Minutes",
                author: "Steven Weinberg",
                description: "A comprehensive look at the modern view of the early universe and the physical evidence for the Big Bang.",
                url: "https://www.google.com/search?q=The+First+Three+Minutes+Steven+Weinberg"
            }
        ]
    },
    {
        id: "earth-forms",
        startYear: -4500000000,
        date: "4.5 Billion Years Ago",
        title: "Formation of Earth",
        significance: 9,
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
        significance: 10,
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
        significance: 8,
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
        significance: 10,
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
        significance: 10,
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
        significance: 8,
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
        significance: 10,
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
        significance: 10,
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
        significance: 10,
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
        significance: 10,
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
        significance: 10,
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
        significance: 9,
        snippet: "The establishment of the supreme law of the United States.",
        description: "The framers created a system of checks and balances that became a blueprint for modern representative democracy.",
        gap: 300,
        approx: false
    }
];

// Feature: Quiz Generation Worksheet
function generateQuiz() {
    const quizEvents = [...timelineData]
        .filter(e => e.significance >= 9) // Focus on high significance
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
            CHRONOS HISTORICAL ENGINE &bull; LEVEL 10 CORE MILESTONES &bull; VERIFIED DATABASE
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

function initChronos() {
    const container = document.getElementById('events-container');
    const progressBar = document.getElementById('progress-bar');
    const overlay = document.getElementById('event-detail-overlay');
    const closeBtn = document.getElementById('close-overlay');
    const printBtn = document.getElementById('print-quiz-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const exitQuizBtn = document.getElementById('exit-quiz-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const closeResultsBtn = document.getElementById('close-results');

    if (printBtn) printBtn.onclick = generateQuiz;
    if (startQuizBtn) startQuizBtn.onclick = startInteractiveQuiz;
    if (exitQuizBtn) exitQuizBtn.onclick = exitQuiz;
    if (submitQuizBtn) submitQuizBtn.onclick = submitQuiz;
    if (closeResultsBtn) closeResultsBtn.onclick = closeResults;

    // Sort by start year
    const sortedData = [...timelineData].sort((a, b) => a.startYear - b.startYear);

    let blockCount = 0;
    // Build the timeline
    sortedData.forEach((event) => {
        if (event.gap > 0) {
            const spacer = document.createElement('div');
            spacer.style.height = `${event.gap}px`;
            container.appendChild(spacer);
        }

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

        block.innerHTML = `
            <div class="event-card" onclick="showDetail('${event.id}')">
                <div class="event-meta">${approxPrefix}${event.date}</div>
                <h3>${event.title}</h3>
                <div class="event-preview">${event.snippet}</div>
                <div class="event-dot"></div>
            </div>
            ${sourceHtml}
        `;

        container.appendChild(block);
        blockCount++;
    });

    // Add Terminal "Live Pulse" Node
    const liveSpacer = document.createElement('div');
    liveSpacer.style.height = '400px';
    container.appendChild(liveSpacer);

    const liveBlock = document.createElement('div');
    liveBlock.className = 'event-block live-pulse-block';
    liveBlock.innerHTML = `
        <div class="live-pulse-card">
            <div class="live-tag"><span class="pulse-dot"></span> LIVE PULSE: ${todayPulse.date}</div>
            <h2>Today's Chronicle</h2>
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

    // Scroll Logic
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";

        // Reveal animations
        const blocks = document.querySelectorAll('.event-block');
        blocks.forEach(block => {
            const rect = block.getBoundingClientRect();
            const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            if (rect.top <= viewHeight * 0.85) {
                block.classList.add('visible');
            }
        });
    });

    function hideOverlay() {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Close Overlay
    closeBtn.onclick = hideOverlay;

    window.onclick = (e) => {
        if (e.target === overlay) hideOverlay();
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            hideOverlay();
        }
    });
}

function showDetail(id) {
    const event = timelineData.find(e => e.id === id);
    if (!event) return;

    const overlay = document.getElementById('event-detail-overlay');
    const approxPrefix = event.approx ? 'Around ' : '';
    
    document.getElementById('detail-title').innerText = event.title;
    document.getElementById('detail-date').innerText = approxPrefix + event.date;
    document.getElementById('detail-description').innerText = event.description;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showSources(id) {
    const event = timelineData.find(e => e.id === id);
    if (!event || !event.sources) return;

    const overlay = document.getElementById('event-detail-overlay');
    document.getElementById('detail-title').innerText = `Sources: ${event.title}`;
    document.getElementById('detail-date').innerText = "Defensible Documentation";
    
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
let currentQuizLevel = 10;

function startInteractiveQuiz() {
    document.getElementById('hero').classList.add('hidden');
    document.getElementById('timeline-wrapper').classList.add('hidden');
    document.getElementById('quiz-view').classList.remove('hidden');
    document.querySelector('footer').classList.add('hidden');
    window.scrollTo(0, 0);

    // Filter by the current significance level
    activeQuizData = [...timelineData]
        .filter(e => e.significance === currentQuizLevel)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .sort((a, b) => a.startYear - b.startYear);

    const container = document.getElementById('quiz-questions-container');
    container.innerHTML = `<div class="quiz-level-banner">Current Challenge: Significance Level ${currentQuizLevel}</div>`;

    activeQuizData.forEach((event, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const distractors = timelineData
            .filter(e => e.id !== event.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(e => e.title);
        
        const options = [event.title, ...distractors].sort(() => Math.random() - 0.5);

        const row = document.createElement('div');
        row.className = `quiz-row ${side}`;
        row.innerHTML = `
            <div class="ping"></div>
            <div class="connector"></div>
            <div class="quiz-card">
                <span class="date-tag">${event.date}</span>
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

    if (isPerfect && currentQuizLevel === 10) {
        currentQuizLevel = 9;
        progressionMsg = `<div class="progression-unlocked">MASTERED! Level 9 Now Unlocked.</div>`;
    } else if (isPerfect && currentQuizLevel === 9) {
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
}

function closeResults() {
    document.getElementById('quiz-results-overlay').style.display = 'none';
    exitQuiz();
}

// Start
document.addEventListener('DOMContentLoaded', initChronos);

