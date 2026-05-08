/**
 * Lexicon Vocabulary Engine v2.0 - Semantic & Strategic
 */

let masterLexicon = [];
let currentWord = null;
let stats = { correct: 0, streak: 0 };
let currentMode = 'quiz';
let activeFilters = { grade: 'all', difficulty: 'all', pos: 'all', root: 'all' };
let learnPool = [];
let learnIndex = 0;
let currentSearchQuery = '';
let studyList = JSON.parse(localStorage.getItem('lexicon_study_list')) || {}; // { word: eventObj }

// Create Toast Container
const toastEl = document.createElement('div');
toastEl.className = 'toast';
toastEl.innerHTML = '<span>✨</span> Word added to study list!';
document.body.appendChild(toastEl);

// DOM Elements
const appContainer = document.getElementById('app-container');
const quizArea = document.getElementById('quiz-area');
const contentArea = document.getElementById('content-area');
const targetWordEl = document.getElementById('target-word');
const originEl = document.getElementById('word-origin');
const pronunciationEl = document.getElementById('word-pronunciation');
const optionsContainer = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const feedbackMsgEl = document.getElementById('feedback-message');
const helperTextEl = document.getElementById('helper-text');
const correctCountEl = document.getElementById('correct-count');
const streakCountEl = document.getElementById('streak-count');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');

/**
 * Initialize Engine
 */
async function initEngine() {
    try {
        const response = await fetch('./lexicon_seed_project/lexicon_seed.json');
        masterLexicon = await response.json();
        setupEventListeners();
        toggleLearnMode(); // LANDING DEFAULT: Learn Mode
    } catch (err) {
        contentArea.innerHTML = `<div class="card" style="text-align:center"><h2>⚠️ Could not load data</h2><p>Make sure the local server is running.<br><code>python3 -m http.server 8001</code></p></div>`;
        console.error("Lexicon Engine Load Failure:", err);
    }
}

function setupEventListeners() {
    nextBtn.addEventListener('click', loadNewQuizWord);
    resetBtn.addEventListener('click', () => {
        stats = { correct: 0, streak: 0 };
        updateStats();
        loadNewQuizWord();
    });

    const curationBtn = document.getElementById('curation-btn');
    if (curationBtn) curationBtn.addEventListener('click', renderCurationTable);

    const studyListBtn = document.getElementById('study-list-btn');
    if (studyListBtn) studyListBtn.addEventListener('click', toggleStudyMode);

    const modeToggle = document.getElementById('mode-toggle-btn');
    if (modeToggle) modeToggle.addEventListener('click', toggleLearnMode);

    // Filter pills — mode-aware
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const filterType = pill.dataset.filter;
            const filterVal = pill.dataset.value;

            // Deactivate siblings in same group
            document.querySelectorAll(`.filter-pill[data-filter="${filterType}"]`)
                .forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            activeFilters[filterType] = filterVal === 'all' ? 'all' : filterVal;

            if (currentMode === 'learn') {
                // Re-curate the learn pool from the new filter
                startLearnMode();
            } else if (currentMode === 'curation') {
                renderCurationTable();
            } else if (currentMode === 'explore') {
                performSearch(currentSearchQuery);
            } else {
                // Quiz mode: reset score and load new word
                stats = { correct: 0, streak: 0 };
                updateStats();
                loadNewQuizWord();
            }
        });
    });
}

/**
 * Returns the filtered word pool based on activeFilters.
 * Falls back to all words if filter yields nothing.
 */
function getFilteredPool() {
    let pool = masterLexicon.filter(w => {
        const gradeMatch = activeFilters.grade === 'all' || w.grade_level === activeFilters.grade;
        const diffMatch = activeFilters.difficulty === 'all' || String(w.difficulty) === String(activeFilters.difficulty);
        const posMatch = activeFilters.pos === 'all' || w.part_of_speech === activeFilters.pos;
        
        const isGermanic = activeFilters.root === 'Germanic' && w.history && 
                           ['Old English', 'Middle Dutch', 'Old Norse', 'German', 'Low German', 'Dutch', 'Middle English', 'Anglo-French'].includes(w.history.root_language);
        const rootMatch = activeFilters.root === 'all' || isGermanic || (w.history && w.history.root_language === activeFilters.root);
        
        return gradeMatch && diffMatch && posMatch && rootMatch;
    });

    // Fallback: if no matches, return all
    if (pool.length === 0) {
        pool = masterLexicon;
        showFilterWarning();
    } else {
        hideFilterWarning();
    }
    return pool;
}

function showFilterWarning() {
    let warn = document.getElementById('filter-warning');
    if (!warn) {
        warn = document.createElement('p');
        warn.id = 'filter-warning';
        warn.className = 'filter-warning';
        warn.textContent = 'No words match that filter — showing all words.';
        document.getElementById('filter-bar').appendChild(warn);
    }
}

function hideFilterWarning() {
    const warn = document.getElementById('filter-warning');
    if (warn) warn.remove();
}

/**
 * --- QUIZ LOGIC ---
 */

function restoreQuizCard() {
    // Re-inject the quiz card if contentArea was replaced by another mode
    if (!document.getElementById('word-card')) {
        contentArea.innerHTML = `
            <div id="word-card" class="card">
                <div class="meta-row">
                    <span id="word-origin" class="tag">Language</span>
                    <span id="word-pronunciation" class="pronunciation"></span>
                    <button id="quiz-study-add" class="study-add-btn" style="padding: 4px 10px; font-size: 0.65rem;">+ Add to Study</button>
                </div>
                <h1 id="target-word">Loading...</h1>
                <p id="word-pos" class="quiz-pos"></p>
                <p class="instruction">Select the correct definition:</p>
                <div id="options-container"></div>
                <div id="feedback" class="hidden">
                    <p id="feedback-message"></p>
                    <div id="helper-box" class="helper">
                        <strong>Why it makes sense:</strong>
                        <span id="helper-text"></span>
                    </div>
                    <button id="next-btn">Next Word &rarr;</button>
                </div>
            </div>`;
        // Re-bind next button since DOM was replaced
        document.getElementById('next-btn').addEventListener('click', loadNewQuizWord);
    }
}

function loadNewQuizWord() {
    currentMode = 'quiz';
    restoreQuizCard();

    const feedbackEl2 = document.getElementById('feedback');
    if (feedbackEl2) feedbackEl2.classList.add('hidden');

    const pool = getFilteredPool();

    // Pick a random word different from the last one
    let candidate;
    let attempts = 0;
    do {
        candidate = pool[Math.floor(Math.random() * pool.length)];
        attempts++;
    } while (candidate === currentWord && pool.length > 1 && attempts < 20);
    currentWord = candidate;

    // Update UI for Quiz
    const targetWordElNow = document.getElementById('target-word');
    targetWordElNow.innerText = currentWord.word;
    scaleWordText(targetWordElNow);
    document.getElementById('word-pos').innerText = currentWord.part_of_speech;
    document.getElementById('word-origin').innerText = currentWord.history.root_language;
    document.getElementById('word-pronunciation').innerText = `/${currentWord.word.toLowerCase()}/`;

    // Study Link
    const studyAddBtn = document.getElementById('quiz-study-add');
    if (studyAddBtn) {
        const inStudy = studyList[currentWord.word];
        studyAddBtn.className = `study-add-btn ${inStudy ? 'in-list' : ''}`;
        studyAddBtn.innerText = inStudy ? 'In Study List' : '+ Add to Study';
        studyAddBtn.onclick = () => {
            setWordStatus(currentWord.word, 'unknown');
            studyAddBtn.classList.add('in-list');
            studyAddBtn.innerText = 'In Study List';
        };
    }

    // Prepare options
    const primarySense = currentWord.senses[0];
    const options = [
        { text: primarySense.definition, correct: true },
        ...getDistractors(primarySense.definition)
    ];
    options.sort(() => Math.random() - 0.5);

    const optCont = document.getElementById('options-container');
    optCont.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.addEventListener('click', () => handleChoice(btn, opt.correct, primarySense));
        optCont.appendChild(btn);
    });
}

function getDistractors(correctDef) {
    // Pick 3 random definitions from other words
    const others = masterLexicon
        .filter(w => w.senses[0].definition !== correctDef)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    return others.map(w => ({ text: w.senses[0].definition, correct: false }));
}

function handleChoice(selectedBtn, isCorrect) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.add('disabled'));

    const primarySense = currentWord.senses[0];
    const feedbackEl2 = document.getElementById('feedback');
    const feedbackMsgEl2 = document.getElementById('feedback-message');
    const helperTextEl2 = document.getElementById('helper-text');

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        feedbackMsgEl2.innerText = "✨ Correct!";
        feedbackMsgEl2.style.color = "var(--accent-primary)";
        stats.correct++;
        stats.streak++;
    } else {
        selectedBtn.classList.add('wrong');
        feedbackMsgEl2.innerText = "❌ Not quite.";
        feedbackMsgEl2.style.color = "var(--accent-wrong)";
        stats.streak = 0;

        buttons.forEach(btn => {
            if (btn.innerText === primarySense.definition) btn.classList.add('correct');
        });
    }

    helperTextEl2.innerText = currentWord.history.etymology_note;
    feedbackEl2.classList.remove('hidden');
    updateStats();
}

/**
 * --- EXPLORER LOGIC ---
 */

function performSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        if (currentMode === 'explore') window.location.reload();
        return;
    }
    currentSearchQuery = q;

    // 1. Filter results based on word, history, or tag (partial match)
    let results = masterLexicon.filter(word => {
        const wordMatch = word.word.toLowerCase().includes(q);
        const historyMatch = word.history.root_language.toLowerCase().includes(q);
        const tagMatch = word.senses.some(s => s.tags.some(t => t.toLowerCase().includes(q)));
        
        if (!(wordMatch || historyMatch || tagMatch)) return false;

        // Apply active filters to the search results
        const gradeMatch = activeFilters.grade === 'all' || word.grade_level === activeFilters.grade;
        const posMatch = activeFilters.pos === 'all' || word.part_of_speech === activeFilters.pos;
        
        const isGermanic = activeFilters.root === 'Germanic' && word.history && 
                           ['Old English', 'Middle Dutch', 'Old Norse', 'German', 'Low German', 'Dutch', 'Middle English', 'Anglo-French'].includes(word.history.root_language);
        const rootMatch = activeFilters.root === 'all' || isGermanic || (word.history && word.history.root_language === activeFilters.root);

        return gradeMatch && posMatch && rootMatch;
    });

    // 2. Map results with a calculated "Best Relevance" score for this specific query
    const resultsWithScores = results.map(word => {
        let maxRel = 0;

        // Exact word match gets highest possible boost
        if (word.word.toLowerCase() === q) maxRel = 100;
        // Prefix match on word gets high boost
        else if (word.word.toLowerCase().startsWith(q)) maxRel = 50;

        // Scan tags for the best weighted relevance
        word.senses.forEach(sense => {
            sense.tags.forEach(tag => {
                if (tag.toLowerCase().includes(q)) {
                    const weight = sense.relevance[tag] || 5;
                    if (weight > maxRel) maxRel = weight;
                }
            });
        });

        return { ...word, _searchScore: maxRel };
    });

    // 3. Sort by Score (Desc) then Alphabetical
    resultsWithScores.sort((a, b) => {
        if (b._searchScore !== a._searchScore) return b._searchScore - a._searchScore;
        return a.word.localeCompare(b.word);
    });

    renderSearchResults(resultsWithScores, q);
}

function renderSearchResults(results, query) {
    currentMode = 'explore';
    contentArea.innerHTML = `
        <div class="explorer-header">
            <h3>Displaying ${results.length} Results</h3>
            <button onclick="window.location.reload()" class="tag" style="cursor:pointer; background: var(--accent-neutral); color: white; border:none;">&larr; Return to Quiz</button>
        </div>
        <div class="explorer-grid">
            ${results.map(word => {
                const inStudy = studyList[word.word];
                return `
                <div class="card result-card">
                    <div class="meta-row">
                        <span class="tag">${word.history.root_language}</span>
                        <button onclick="setWordStatus('${word.word}', 'unknown'); triggerSearch();" 
                                class="study-add-btn ${inStudy ? 'in-list' : ''}">
                            ${inStudy ? 'In Study List' : '+ Add to Study'}
                        </button>
                    </div>
                    <h2>${word.word}</h2>
                    <p class="definition-main">${word.senses[0].definition}</p>
                    <div class="history-note">
                        <strong>History:</strong> ${word.history.etymology_note}
                    </div>
                    <div class="tag-cloud">
                        ${word.senses[0].tags.map(t => `<span class="mini-tag">#${t}</span>`).join('')}
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
}

/**
 * --- CURATION TABLE LOGIC ---
 */

function renderCurationTable() {
    currentMode = 'curation';
    appContainer.classList.add('wide-mode');

    contentArea.innerHTML = `
        <div class="explorer-header">
            <h3>Curation Dashboard (${masterLexicon.length} Total Nodes)</h3>
            <div>
                <button onclick="showEtymologyStats()" class="tag" style="cursor:pointer; background: var(--gold); color: white; border:none; margin-right: 10px;">📊 Compare Etymology Stats</button>
                <button onclick="window.location.reload()" class="tag" style="cursor:pointer; background: var(--accent-primary); color: white; border:none;">&larr; Exit Review</button>
            </div>
        </div>
        <div class="table-wrapper">
            <table class="curation-table">
                <thead>
                    <tr>
                        <th>Word</th>
                        <th>Definition</th>
                        <th>Tags</th>
                        <th>History/Root</th>
                        <th>Grade</th>
                        <th>Diff</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${masterLexicon.sort((a, b) => a.word.localeCompare(b.word)).map(word => {
                        const inStudy = studyList[word.word];
                        return `
                        <tr>
                            <td class="td-word">
                                <strong>${word.word}</strong><br>
                                <small style="color:var(--text-dim); text-transform: uppercase; font-size: 0.65rem; font-weight:700; letter-spacing:0.5px;">${word.part_of_speech}</small>
                            </td>
                            <td class="td-def">${word.senses[0].definition}</td>
                            <td class="td-tags">
                                ${word.senses[0].tags.map(t => `<span class="mini-tag">#${t}</span>`).join(' ')}
                            </td>
                            <td class="td-history">
                                <strong>${word.history.root_language}</strong><br>
                                <small>${word.history.root_word}</small>
                            </td>
                            <td>${word.grade_level}</td>
                            <td><span class="difficulty-dot diff-${word.difficulty}"></span></td>
                            <td>
                                <button onclick="setWordStatus('${word.word}', 'unknown'); renderCurationTable();" 
                                        class="study-add-btn ${inStudy ? 'in-list' : ''}" style="font-size: 0.6rem; padding: 4px 8px;">
                                    ${inStudy ? 'Study' : '+ Add'}
                                </button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

const etymologyBenchmarks = [
    { category: "Germanic", dict: 25.00, daily: 70.00 },
    { category: "Latin", dict: 28.20, daily: 11.28 },
    { category: "French", dict: 28.30, daily: 11.32 },
    { category: "Greek", dict: 5.30, daily: 2.12 },
    { category: "Proper Names", dict: 3.30, daily: 1.32 },
    { category: "Other", dict: 5.90, daily: 2.36 },
    { category: "Unknown", dict: 4.00, daily: 1.60 }
];

function showEtymologyStats() {
    const overlay = document.getElementById('etymology-overlay');
    const chart = document.getElementById('etymology-chart');
    
    let counts = { "Germanic": 0, "Latin": 0, "French": 0, "Greek": 0, "Proper Names": 0, "Other": 0, "Unknown": 0 };
    let total = masterLexicon.length;
    
    masterLexicon.forEach(w => {
        let root = w.history?.root_language;
        if (!root || root === "Unknown") { counts["Unknown"]++; return; }
        
        let found = false;
        if (['Old English', 'Middle English', 'Old Norse', 'Dutch', 'Middle Dutch', 'German', 'Low German', 'English'].includes(root)) { counts["Germanic"]++; found=true; }
        else if (['Latin', 'Late Latin', 'Medieval Latin'].includes(root)) { counts["Latin"]++; found=true; }
        else if (["French", "Old French", "Old North French", "Anglo-French"].includes(root)) { counts["French"]++; found=true; }
        else if (root === "Greek") { counts["Greek"]++; found=true; }
        
        if (!found) counts["Other"]++;
    });
    
    let html = `
        <div style="display:flex; gap:20px; margin-bottom:25px; font-size:0.9rem; justify-content:center; font-weight:600;">
            <div style="display:flex; align-items:center; gap:8px;"><span style="display:inline-block; width:14px; height:14px; background:#dfe4ea; border-radius:4px;"></span> Dictionary</div>
            <div style="display:flex; align-items:center; gap:8px;"><span style="display:inline-block; width:14px; height:14px; background:#a4b0be; border-radius:4px;"></span> Daily Use</div>
            <div style="display:flex; align-items:center; gap:8px;"><span style="display:inline-block; width:14px; height:14px; background:var(--accent-primary); border-radius:4px;"></span> Your Lexicon</div>
        </div>
    `;
    
    etymologyBenchmarks.forEach(b => {
        let dbPct = total > 0 ? (counts[b.category] / total) * 100 : 0;
        html += `
            <div class="ety-row">
                <div class="ety-label">${b.category}</div>
                <div class="ety-bars">
                    <div class="ety-bar-wrapper">
                        <div class="ety-bar-bg"><div class="ety-bar-fill" style="width:${b.dict}%; background:#dfe4ea;"></div></div>
                        <div class="ety-val">${b.dict.toFixed(1)}%</div>
                    </div>
                    <div class="ety-bar-wrapper">
                        <div class="ety-bar-bg"><div class="ety-bar-fill" style="width:${b.daily}%; background:#a4b0be;"></div></div>
                        <div class="ety-val">${b.daily.toFixed(1)}%</div>
                    </div>
                    <div class="ety-bar-wrapper">
                        <div class="ety-bar-bg"><div class="ety-bar-fill" style="width:${dbPct}%; background:var(--accent-primary);"></div></div>
                        <div class="ety-val">${dbPct.toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    chart.innerHTML = html;
    overlay.classList.remove('hidden');
}

window.hideEtymologyStats = function() {
    const overlay = document.getElementById('etymology-overlay');
    if (overlay) overlay.classList.add('hidden');
}

window.showEtymologyStats = showEtymologyStats;

function updateStats() {
    correctCountEl.innerText = stats.correct;
    streakCountEl.innerText = stats.streak;
}

/**
 * --- LEARNING MODE ---
 */

function toggleLearnMode() {
    const learnBtn = document.getElementById('mode-toggle-btn');
    const studyBtn = document.getElementById('study-list-btn');
    const filterBar = document.getElementById('filter-bar');

    if (currentMode !== 'learn') {
        currentMode = 'learn';
        learnBtn.textContent = '⚡ Quiz Mode'; // Shortcut to go back to quiz
        studyBtn.textContent = '📝 Study List'; // Shortcut to go to study
        learnBtn.classList.add('active-mode');
        studyBtn.classList.remove('active-mode');
        document.getElementById('learn-stats-wrapper').classList.remove('hidden');
        filterBar.style.display = 'flex';
        startLearnMode();
    } else {
        currentMode = 'quiz';
        learnBtn.textContent = '📖 Learn Mode';
        studyBtn.textContent = '📝 Study List';
        learnBtn.classList.remove('active-mode');
        studyBtn.classList.remove('active-mode');
        document.getElementById('learn-stats-wrapper').classList.add('hidden');
        loadNewQuizWord();
    }
}

function toggleStudyMode() {
    const learnBtn = document.getElementById('mode-toggle-btn');
    const studyBtn = document.getElementById('study-list-btn');

    if (currentMode !== 'study') {
        currentMode = 'study';
        studyBtn.textContent = '📖 Learn Mode'; // Shortcut to go back to learning
        learnBtn.textContent = '⚡ Quiz Mode'; // Shortcut to jump to quiz
        studyBtn.classList.add('active-mode');
        learnBtn.classList.remove('active-mode');
        document.getElementById('learn-stats-wrapper').classList.add('hidden');
        renderStudyMode();
    } else {
        toggleLearnMode(); // Default back to Learn
    }
}

function startLearnMode() {
    learnPool = getFilteredPool().slice().sort(() => Math.random() - 0.5);
    learnIndex = 0;
    renderLearnCard();
}

function navigateLearn(dir) {
    learnIndex = Math.max(0, Math.min(learnPool.length - 1, learnIndex + dir));
    renderLearnCard();
}

function getRelColor(score) {
    if (score >= 9) return '#10ac84';
    if (score >= 6) return '#feca57';
    return '#a29bfe';
}

function renderLearnCard() {
    if (learnPool.length === 0) {
        contentArea.innerHTML = `<div class="card" style="text-align:center"><p>No words match this filter.</p></div>`;
        return;
    }

    const word = learnPool[learnIndex];
    const sense = word.senses[0];
    const h = word.history;
    const a = word.associations;

    const tagHtml = sense.tags.map(t => {
        const rel = sense.relevance[t] || 5;
        const color = getRelColor(rel);
        return `<span class="learn-tag" style="background:${color}22; border:1px solid ${color}66; color:${color}">
            #${t} <span class="learn-tag-score">${rel}</span>
        </span>`;
    }).join('');

    const synHtml = a.synonyms.length
        ? a.synonyms.map(s => `<span class="mini-tag">${s}</span>`).join(' ')
        : '<em style="opacity:0.5">—</em>';

    const antHtml = a.antonyms.length
        ? a.antonyms.map(s => `<span class="mini-tag antonym-tag">${s}</span>`).join(' ')
        : '<em style="opacity:0.5">—</em>';

    const relConcepts = a.related_concepts.length
        ? a.related_concepts.map(s => `<span class="mini-tag">${s}</span>`).join(' ')
        : '<em style="opacity:0.5">—</em>';

    const families = a.families.length
        ? a.families.map(f => `<span class="family-tag">${f}</span>`).join(' ')
        : '';

    const progressEl = document.getElementById('learn-progress-count');
    if (progressEl) progressEl.textContent = `${learnIndex + 1} of ${learnPool.length}`;

    contentArea.innerHTML = `
        <div class="learn-nav-bar">
            <button class="learn-nav-btn" onclick="navigateLearn(-1)" ${learnIndex === 0 ? 'disabled' : ''}>← Prev Word</button>
            <div class="learn-status-controls">
                <button class="status-btn unknown" onclick="setWordStatus('${word.word}', 'unknown')">❌ Unknown</button>
                <button class="status-btn known" onclick="setWordStatus('${word.word}', 'known')">✅ Known / Next</button>
            </div>
        </div>
        <div class="learn-kb-hints">
            <span class="kb-hint"><kbd>←</kbd><kbd>P</kbd> Prev</span>
            <span class="kb-hint"><kbd>X</kbd><kbd>U</kbd> Unknown</span>
            <span class="kb-hint"><kbd>→</kbd><kbd>Enter</kbd><kbd>K</kbd><kbd>N</kbd> Known / Next</span>
        </div>

        <div class="learn-card">
            <div class="learn-card-header">
                <div class="learn-meta">
                    <span class="tag">${h.root_language}</span>
                    <span class="tag" style="background:#f0f0f0">Grade ${word.grade_level}</span>
                    <button onclick="openQuickQuiz()" class="study-add-btn" style="background:var(--accent-neutral); color:white; border:none; padding:4px 12px; font-size: 0.7rem;">Quiz Me!</button>
                    <span class="difficulty-dot diff-${word.difficulty}" style="margin-left:4px"></span>
                    ${families}
                </div>
                <h1 class="learn-word">${word.word}</h1>
                <p class="learn-pos">${word.part_of_speech}</p>
            </div>

            <div class="learn-section">
                <div class="learn-section-label">📖 Definition</div>
                <p class="learn-definition">${sense.definition}</p>
            </div>

            <div class="learn-section">
                <div class="learn-section-label">🌿 Etymology</div>
                <div class="learn-etymology-box">
                    <div class="etym-row">
                        <span class="etym-key">Origin</span>
                        <span class="etym-val">${h.root_language} — <em>${h.root_word}</em></span>
                    </div>
                    <div class="etym-row">
                        <span class="etym-key">Era</span>
                        <span class="etym-val">${h.emergence}</span>
                    </div>
                    <div class="etym-row full">
                        <span class="etym-key">Story</span>
                        <span class="etym-val">${h.etymology_note}</span>
                    </div>
                </div>
            </div>

            <div class="learn-section">
                <div class="learn-section-label">🏷 Semantic Tags <span style="font-size:0.7rem;opacity:0.5;font-weight:400">(relevance 1–10)</span></div>
                <div class="learn-tag-cloud">${tagHtml}</div>
            </div>

            <div class="learn-section-grid">
                <div class="learn-section">
                    <div class="learn-section-label">✅ Synonyms</div>
                    <div>${synHtml}</div>
                </div>
                <div class="learn-section">
                    <div class="learn-section-label">🚫 Antonyms</div>
                    <div>${antHtml}</div>
                </div>
                <div class="learn-section">
                    <div class="learn-section-label">🔗 Related</div>
                    <div>${relConcepts}</div>
                </div>
            </div>
        </div>
    `;

    // Scale the learn-word heading to prevent overflow
    const learnWordEl = contentArea.querySelector('.learn-word');
    if (learnWordEl) scaleWordText(learnWordEl);
}

/**
 * Status Tracking logic (Flashcard mode)
 */
window.setWordStatus = (wordName, status) => {
    const word = masterLexicon.find(w => w.word === wordName);
    if (!word) return;

    if (status === 'unknown') {
        studyList[wordName] = {
            word: word.word,
            pos: word.part_of_speech,
            definition: word.senses[0].definition,
            history: word.history.root_language,
            grade: word.grade_level,
            timestamp: new Date().toISOString()
        };
    } else {
        delete studyList[wordName];
    }

    localStorage.setItem('lexicon_study_list', JSON.stringify(studyList));
    
    // Visual Feedback
    if (status === 'unknown') {
        const studyBtn = document.getElementById('study-list-btn');
        studyBtn.classList.remove('pulse-gold');
        void studyBtn.offsetWidth; // Force reflow
        studyBtn.classList.add('pulse-gold');
        
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2000);
    }

    // Close Modal if open
    document.getElementById('quick-quiz-overlay').classList.add('hidden');

    // Auto-advance only if in Learn Mode
    if (currentMode === 'learn') {
        if (learnIndex < learnPool.length - 1) {
            navigateLearn(1);
        } else {
            alert("End of pool! Your study list has been updated.");
        }
    }
};

window.clearStudyList = () => {
    if (confirm("Are you sure you want to clear your entire study list? This cannot be undone.")) {
        studyList = {};
        localStorage.setItem('lexicon_study_list', JSON.stringify(studyList));
        renderStudyMode();
    }
};

window.triggerPrint = () => {
    const userName = prompt("Please enter the name for this study list (e.g. 'Warren'):");
    const title = userName ? `${userName}'s Lexicon` : "Emoji's Study List";
    
    // Temporarily change the DOM title for the print
    const studyTitleEl = document.querySelector('.study-title');
    const oldTitle = studyTitleEl.textContent;
    studyTitleEl.textContent = title;
    
    window.print();
    
    // Restore
    studyTitleEl.textContent = oldTitle;
};

/**
 * --- LEARN MODE KEYBOARD SHORTCUTS ---
 *
 * Known / Next  →  ArrowRight, Enter, K, N
 * Prev Word     →  ArrowLeft, P, Backspace/Delete
 * Unknown       →  X, U
 *
 * Shortcuts are suppressed when focus is inside any text input or textarea,
 * and are only active while currentMode === 'learn'.
 */
document.addEventListener('keydown', (e) => {
    // Only active in learn mode
    if (currentMode !== 'learn') return;

    // Suppress when the user is typing somewhere
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    // Identify the current word to act on
    const currentLearnWord = learnPool[learnIndex];
    if (!currentLearnWord) return;

    switch (e.key) {
        // ── Known / Next ──────────────────────────────
        case 'ArrowRight':
        case 'Enter':
        case 'k':
        case 'K':
        case 'n':
        case 'N':
            e.preventDefault();
            window.setWordStatus(currentLearnWord.word, 'known');
            break;

        // ── Prev Word ─────────────────────────────────
        case 'ArrowLeft':
        case 'p':
        case 'P':
        case 'Backspace':
        case 'Delete':
            e.preventDefault();
            if (learnIndex > 0) navigateLearn(-1);
            break;

        // ── Unknown ───────────────────────────────────
        case 'x':
        case 'X':
        case 'u':
        case 'U':
            e.preventDefault();
            window.setWordStatus(currentLearnWord.word, 'unknown');
            break;
    }
});

window.renderStudyMode = () => {
    const scrollPos = window.scrollY;
    const list = Object.values(studyList);

    if (list.length === 0) {
        contentArea.innerHTML = `
            <div class="card" style="text-align:center; padding: 60px;">
                <h2 style="margin-bottom:10px">Your Study List is clean! ✨</h2>
                <p style="color:var(--text-dim)">Mark words as "Unknown" in Learn Mode to see them here.</p>
                <button onclick="toggleLearnMode()" class="learn-nav-btn" style="margin-top:20px; background:var(--accent-primary)">Back to Learning</button>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="study-grid-header">
            <h2 class="study-title">📝 My Study List</h2>
            <div style="display:flex; gap:12px">
                <button class="clear-all-btn" onclick="clearStudyList()">🗑 Clear Entire List</button>
                <button class="print-btn" onclick="triggerPrint()">🖨 Print for Offline Study</button>
            </div>
        </div>
    <div class="study-grid">
        ${list.map(w => `
            <div class="study-tile">
                <div class="tile-header">
                    <h3 class="tile-word">${w.word}</h3>
                    <div class="tile-meta-right">${w.pos || 'noun'} | ${w.history}</div>
                </div>
                <p class="tile-definition">${w.definition}</p>
                <div class="tile-actions-screen">
                    <button onclick="setWordStatus('${w.word}', 'known'); renderStudyMode();" class="tile-action-btn">Done ✅</button>
                </div>
            </div>
        `).join('')}
    </div>
    `;
    
    // Restore scroll position to prevent jump
    window.scrollTo(0, scrollPos);
};

window.openQuickQuiz = () => {
    const word = learnPool[learnIndex];
    if (!word) return;

    const overlay = document.getElementById('quick-quiz-overlay');
    const wordTitle = overlay.querySelector('.quick-quiz-word');
    const optionsGrid = document.getElementById('quick-quiz-options');
    
    wordTitle.innerText = word.word.toUpperCase();
    overlay.classList.remove('hidden');

    // Generate distraction options
    const distractors = masterLexicon
        .filter(w => w.word !== word.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => ({ text: w.senses[0].definition, correct: false }));
    
    const allOptions = [...distractors, { text: word.senses[0].definition, correct: true }]
        .sort(() => 0.5 - Math.random());

    optionsGrid.innerHTML = allOptions.map(opt => `
        <button class="quick-option-btn" onclick="this.classList.add('${opt.correct ? 'correct' : 'wrong'}')">
            ${opt.text}
        </button>
    `).join('');

    // Wire up buttons
    document.getElementById('quick-unknown-btn').onclick = () => setWordStatus(word.word, 'unknown');
    document.getElementById('quick-known-btn').onclick = () => setWordStatus(word.word, 'known');
};

window.hideStudyList = () => {
    document.getElementById('study-list-overlay').classList.add('hidden');
};


// Global scope attachment for search
window.handleSearchInput = (input) => {
    if (event.key === 'Enter') performSearch(input.value);
};

window.triggerSearch = () => {
    const input = document.getElementById('lex-search');
    if (input) performSearch(input.value);
};

window.performSearch = performSearch;

/**
 * Dynamically scales the target word element down until it fits on one line.
 * Works with white-space:nowrap — measures scrollWidth vs clientWidth.
 */
function scaleWordText(el) {
    if (!el) return;
    const container = el.closest('.card') || el.closest('.learn-card-header') || el.parentElement;
    if (!container) return;

    // Reset to CSS base size before measuring
    el.style.fontSize = '';
    const minSize = 18; // never go below 18px
    const padding = 36; // conservative inner padding allowance
    const availableWidth = container.clientWidth - padding;
    let fontSize = parseFloat(window.getComputedStyle(el).fontSize);

    while (el.scrollWidth > availableWidth && fontSize > minSize) {
        fontSize -= 1;
        el.style.fontSize = fontSize + 'px';
    }
}

/**
 * Accordion filter system.
 * Each filter group becomes a toggle button + dropdown panel.
 * Clicking outside or picking a value closes the panel.
 */
(function setupAccordions() {
    const accordions = [
        { toggleId: 'toggle-grade', panelId: 'panel-grade', displayId: 'grade-display', filterKey: 'grade' },
        { toggleId: 'toggle-pos', panelId: 'panel-pos', displayId: 'pos-display', filterKey: 'pos' },
        { toggleId: 'toggle-root', panelId: 'panel-root', displayId: 'root-display', filterKey: 'root' },
    ];

    function closeAllAccordions() {
        document.querySelectorAll('.filter-accordion-panel.is-open').forEach(p => p.classList.remove('is-open'));
        document.querySelectorAll('.filter-accordion-toggle.is-open').forEach(t => {
            t.classList.remove('is-open');
            t.setAttribute('aria-expanded', 'false');
        });
    }
    window._closeAllAccordions = closeAllAccordions;

    accordions.forEach(({ toggleId, panelId, displayId }) => {
        const toggle = document.getElementById(toggleId);
        const panel = document.getElementById(panelId);
        const display = document.getElementById(displayId);
        if (!toggle || !panel) return;

        // Toggle open/close on button click
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = panel.classList.contains('is-open');
            closeAllAccordions();
            if (!isOpen) {
                panel.classList.add('is-open');
                toggle.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });

        // Update display label when a pill inside this panel is picked, then close
        panel.addEventListener('click', (e) => {
            const pill = e.target.closest('.filter-pill');
            if (!pill) return;
            if (display) display.textContent = pill.textContent.trim();
            setTimeout(() => closeAllAccordions(), 180);
        });
    });

    // Click outside → close all
    document.addEventListener('click', closeAllAccordions);
})();

initEngine();
