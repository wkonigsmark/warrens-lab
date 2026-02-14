// Canvas setup
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const newWordBtn = document.getElementById('newWordBtn');

// Offscreen canvas for hit testing
const hitCanvas = document.createElement('canvas');
const hitCtx = hitCanvas.getContext('2d', { willReadFrequently: true });

// Game State
const GAME_STATE = {
    word: '',
    letterIndex: 0,
    isDrawing: false,
    currentStroke: [],
    fadingStrokes: [],
    currentLetterStrokes: [],
    completedLetters: [],
    totalPathLength: 0 // Total length of the letter path
};

// Curve Tolerance Boost
const CURVED_LETTERS = ['B', 'C', 'D', 'G', 'J', 'O', 'P', 'Q', 'R', 'S', 'U'];
const TRICKY_LETTERS = ['J', 'U', 'E', 'G', 'I'];

// Helper to generate smooth arcs
function generateArc(centerX, centerY, radiusX, radiusY, startAngle, endAngle, steps = 12) {
    return Array.from({ length: steps + 1 }, (_, i) => {
        const t = startAngle + (i / steps) * (endAngle - startAngle);
        return [centerX + radiusX * Math.cos(t), centerY + radiusY * Math.sin(t)];
    });
}

// Simplified Vector Paths (0-1 coordinate space)
const LETTER_PATHS = {
    'A': [[[0.5, 0], [0.1, 1]], [[0.5, 0], [0.9, 1]], [[0.25, 0.6], [0.75, 0.6]]],
    'B': [
        [[0.15, 0], [0.15, 1]], // Spine
        generateArc(0.15, 0.25, 0.55, 0.25, -Math.PI / 2, Math.PI / 2), // Top Loop
        generateArc(0.15, 0.75, 0.60, 0.25, -Math.PI / 2, Math.PI / 2)  // Bottom Loop
    ],
    'C': [
        // Smooth C curve (counter-clockwise from top-right)
        [[0.85, 0.2], [0.7, 0.05], [0.5, 0], [0.3, 0.05], [0.15, 0.2], [0.1, 0.5], [0.15, 0.8], [0.3, 0.95], [0.5, 1], [0.7, 0.95], [0.85, 0.8]]
    ],
    'D': [
        [[0.15, 0], [0.15, 1]], // Spine
        generateArc(0.15, 0.5, 0.7, 0.5, -Math.PI / 2, Math.PI / 2) // Big Right Curve
    ],
    'E': [[[0.15, 0], [0.15, 1]], [[0.15, 0], [0.85, 0]], [[0.15, 0.5], [0.75, 0.5]], [[0.15, 1], [0.85, 1]]],
    'F': [[[0.15, 0], [0.15, 1]], [[0.15, 0], [0.85, 0]], [[0.15, 0.5], [0.75, 0.5]]],
    'G': [
        [[0.85, 0.2], [0.7, 0.05], [0.5, 0], [0.3, 0.05], [0.15, 0.2], [0.1, 0.5], [0.15, 0.8], [0.3, 0.95], [0.5, 1], [0.7, 0.95], [0.88, 0.8]],
        [[0.88, 0.8], [0.88, 0.6], [0.6, 0.6]]
    ],
    'H': [[[0.2, 0], [0.2, 1]], [[0.8, 0], [0.8, 1]], [[0.2, 0.5], [0.8, 0.5]]],
    'I': [[[0.5, 0], [0.5, 1]], [[0.2, 0], [0.8, 0]], [[0.2, 1], [0.8, 1]]],
    'J': [
        // Spine down to curve
        [[0.65, 0], [0.65, 0.75]],
        // Hook
        generateArc(0.4, 0.75, 0.25, 0.25, 0, Math.PI)
    ],
    'K': [[[0.2, 0], [0.2, 1]], [[0.8, 0], [0.2, 0.5]], [[0.2, 0.5], [0.8, 1]]],
    'L': [[[0.2, 0], [0.2, 1]], [[0.2, 1], [0.8, 1]]],
    'M': [[[0.1, 1], [0.1, 0]], [[0.1, 0], [0.5, 0.8]], [[0.5, 0.8], [0.9, 0]], [[0.9, 0], [0.9, 1]]],
    'N': [[[0.2, 1], [0.2, 0]], [[0.2, 0], [0.8, 1]], [[0.8, 1], [0.8, 0]]],
    'O': [generateArc(0.5, 0.5, 0.45, 0.5, -Math.PI / 2, 1.5 * Math.PI, 24)],
    'P': [
        [[0.15, 0], [0.15, 1]], // Spine
        generateArc(0.15, 0.25, 0.6, 0.25, -Math.PI / 2, Math.PI / 2) // Loop
    ],
    'Q': [
        generateArc(0.5, 0.5, 0.45, 0.5, -Math.PI / 2, 1.5 * Math.PI, 24),
        [[0.6, 0.7], [0.9, 1]]
    ],
    'R': [
        [[0.15, 0], [0.15, 1]], // Spine
        generateArc(0.15, 0.25, 0.6, 0.25, -Math.PI / 2, Math.PI / 2), // Top Loop
        [[0.25, 0.5], [0.85, 1]] // Leg
    ],
    'S': [
        // High-Res Smooth S (Manual Control Points interpolated)
        [
            [0.85, 0.15], [0.82, 0.10], [0.75, 0.05], [0.65, 0.02], [0.5, 0.02], [0.35, 0.04], [0.25, 0.10], [0.18, 0.18], // Top hook
            [0.15, 0.25], [0.16, 0.32], [0.22, 0.38], [0.30, 0.44], [0.40, 0.48], [0.5, 0.5], // Middle crossing
            [0.60, 0.52], [0.70, 0.56], [0.78, 0.62], [0.84, 0.68], [0.85, 0.75], // Bottom curve start
            [0.82, 0.85], [0.75, 0.92], [0.65, 0.96], [0.5, 0.98], [0.35, 0.96], [0.22, 0.90], [0.15, 0.82] // Bottom hook
        ]
    ],
    'T': [[[0.5, 0], [0.5, 1]], [[0.1, 0], [0.9, 0]]],
    'U': [
        // Left side down, curve, right side up
        [[0.2, 0], [0.2, 0.7]],
        generateArc(0.5, 0.7, 0.3, 0.3, Math.PI, 0), // Bottom bowl - Corrected angle for downward curve
        [[0.8, 0.7], [0.8, 0]] // Right side up
    ],
    'V': [[[0.1, 0], [0.5, 1]], [[0.5, 1], [0.9, 0]]],
    'W': [[[0.1, 0], [0.3, 1]], [[0.3, 1], [0.5, 0.5]], [[0.5, 0.5], [0.7, 1]], [[0.7, 1], [0.9, 0]]],
    'X': [[[0.15, 0], [0.85, 1]], [[0.85, 0], [0.15, 1]]],
    'Y': [[[0.15, 0], [0.5, 0.5]], [[0.85, 0], [0.5, 0.5]], [[0.5, 0.5], [0.5, 1]]],
    'Z': [[[0.15, 0], [0.85, 0]], [[0.85, 0], [0.15, 1]], [[0.15, 1], [0.85, 1]]]
};

// Educational "Sight Words" (Dolch List + Common Nouns)
// Grouped roughly by Length/Difficulty for potential leveling
const WORD_BANKS = {
    level1: ["A", "I", "GO", "UP", "ME", "MY", "NO", "IS", "IT", "IN", "ON", "HE", "WE", "SO", "DO", "AT", "AM", "BE", "AS", "BY", "OR", "OF", "AN", "IF"],
    level2: ["THE", "AND", "YOU", "SEE", "CAN", "BIG", "RED", "RUN", "ONE", "TWO", "BLUE", "HAS", "NOT", "FOR", "GET", "YES", "DID", "EAT", "NEW", "SAW", "SAY", "SHE", "HIM", "HER", "HIS", "HAD", "LET", "MAY", "WAY", "WHO", "BUT", "ALL", "ANY", "ARE", "BOY", "BUY", "CAT", "COW", "DOG", "EGG", "FUN", "JOY", "KEY", "MAN", "MOM", "DAD"],
    level3: ["LOOK", "PLAY", "JUMP", "HELP", "WITH", "THAT", "THIS", "THEY", "WILL", "LIKE", "VOTE", "MAKE", "GOOD", "INTO", "WANT", "HAVE", "WENT", "RIDE", "SOON", "CAME", "FOUR", "FIVE", "NINE", "MUST", "WELL", "ATE", "SAY", "RAN", "NOW", "OUR", "OUT", "TOO", "USE", "WARM", "WASH", "WALK"],
    level4: ["WHERE", "LITTLE", "THREE", "SEVEN", "YELLOW", "FUNNY", "PLEASE", "PRETTY", "WHITE", "BLACK", "BROWN", "THERE", "UNDER", "ROUND", "AGAIN", "THANK", "SMILE", "THINK", "BRING", "CARRY", "SMALL", "FOUND", "LIGHT", "NEVER", "TODAY", "START", "LAUGH", "EIGHT", "ABOUT"]
};

// Flatten for default usage, but keep structure available for complexity logic
const VALID_WORDS = [
    ...WORD_BANKS.level1,
    ...WORD_BANKS.level2,
    ...WORD_BANKS.level3,
    ...WORD_BANKS.level4
].filter(w => w.split('').every(c => LETTER_PATHS[c])); // Safety filter

// Configuration
const CONFIG = {
    visualStrokeWidth: 4,      // Thin lines for the letter skeleton
    hitToleranceWidth: 60,     // Widened 40->60: Very forgiving on "wobble"

    // COMPLETION LOGIC:
    // Reduced significantly to 0.40 (40% area coverage).
    // Since the halo is very wide (60px), filling 40% of that huge area with a thin pen is actually quite a lot of work.
    completionThreshold: 0.40,

    accuracyThreshold: 0.1, // Not used directly in new logic, implicit in hitToleranceWidth

    fadeSpeed: 0.08,
    guideColor: 'rgba(139, 119, 101, 0.15)',

    // Layout
    letterSize: 0,
    baseline: 0,
    startX: 0,
    letterPadding: 30
};

const GUIDES = {
    sky: 0.15,
    plane: 0.35,
    grass: 0.55,
    worm: 0.75
};

const DIFFICULTY_CONFIGS = {
    'level1': { tolerance: 60, threshold: 0.35, label: "Pre-Beginner" },
    'level2': { tolerance: 40, threshold: 0.50, label: "Beginner" },
    'level3': { tolerance: 30, threshold: 0.60, label: "Hard" },
    'level4': { tolerance: 20, threshold: 0.75, label: "Expert" },
    'all': { tolerance: 40, threshold: 0.50, label: "Mixed" }
};

const SETTING_OPTIONS = {
    level: {
        title: "Difficulty Level",
        options: [
            { label: 'Pre-Beginner', value: 'level1', short: 'PB' },
            { label: 'Beginner', value: 'level2', short: 'BEG' },
            { label: 'Hard', value: 'level3', short: 'HRD' },
            { label: 'Expert', value: 'level4', short: 'EXP' },
            { label: 'All Mixed', value: 'all', short: 'MIX' }
        ]
    },
    words: {
        title: "Words Per Round",
        options: [1, 2, 3, 4, 5, 10, 15, 20].map(v => ({ label: v.toString(), value: v, short: v.toString() }))
    },
    rounds: {
        title: "Rounds To Win",
        options: [1, 2, 3, 4, 5, 10].map(v => ({ label: v.toString(), value: v, short: v.toString() }))
    }
};

const SETTINGS = {
    level: 'level2',
    words: 3,
    rounds: 3
};

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', drawStroke);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseout', endDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', drawStroke, { passive: false });
    canvas.addEventListener('touchend', endDrawing, { passive: false });
    canvas.addEventListener('touchcancel', endDrawing, { passive: false });

    document.getElementById('clearBtn').addEventListener('click', resetWord);
    document.getElementById('newWordBtn').addEventListener('click', forceNextWord);

    // Setting Button Listeners
    document.getElementById('levelBtn').addEventListener('click', () => showSettingsOverlay('level'));
    document.getElementById('wordsBtn').addEventListener('click', () => showSettingsOverlay('words'));
    document.getElementById('roundsBtn').addEventListener('click', () => showSettingsOverlay('rounds'));
    document.getElementById('closeOverlay').addEventListener('click', hideSettingsOverlay);

    applyDifficulty(); // Initial apply

    // Victory Modal
    // Note: Modal HTML might not be injected yet if full file rewrite didn't happen perfectly, but assuming it exists from Step 1.
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) playAgainBtn.addEventListener('click', () => {
        document.getElementById('victoryModal').classList.add('hidden');
        resetGame();
    });

    // Initial Sync of SETTINGS to UI
    syncSettingsToUI();

    resetGame();
    requestAnimationFrame(gameLoop);
}

function syncSettingsToUI() {
    const levelBtn = document.getElementById('levelBtn');
    const wordsBtn = document.getElementById('wordsBtn');
    const roundsBtn = document.getElementById('roundsBtn');

    if (levelBtn) {
        const levelOpt = SETTING_OPTIONS.level.options.find(o => o.value === SETTINGS.level);
        levelBtn.textContent = levelOpt ? levelOpt.short : 'BEG';
    }
    if (wordsBtn) wordsBtn.textContent = SETTINGS.words;
    if (roundsBtn) roundsBtn.textContent = SETTINGS.rounds;

    applyDifficulty();
}

function applyDifficulty() {
    const level = SETTINGS.level;
    const config = DIFFICULTY_CONFIGS[level] || DIFFICULTY_CONFIGS['level2'];

    CONFIG.hitToleranceWidth = config.tolerance;
    CONFIG.completionThreshold = config.threshold;

    const indicator = document.querySelector('.level-indicator');
    if (indicator) indicator.textContent = `Level: ${config.label}`;
}

function showSettingsOverlay(type) {
    const data = SETTING_OPTIONS[type];
    const overlay = document.getElementById('settingsOverlay');
    const title = document.getElementById('overlayTitle');
    const grid = document.getElementById('overlayGrid');

    title.textContent = data.title;
    grid.innerHTML = '';

    data.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (SETTINGS[type] === opt.value) btn.classList.add('active');
        btn.textContent = opt.label;
        btn.onclick = () => {
            selectSetting(type, opt);
        };
        grid.appendChild(btn);
    });

    overlay.classList.remove('hidden');
}

function hideSettingsOverlay() {
    document.getElementById('settingsOverlay').classList.add('hidden');
}

function selectSetting(type, opt) {
    SETTINGS[type] = opt.value;

    // Update labels on main UI
    const btn = document.getElementById(`${type}Btn`);
    if (btn) btn.textContent = opt.short;

    hideSettingsOverlay();

    if (type === 'level') {
        applyDifficulty();
        if (!GAME_STATE.hasStarted) startNewWord();
    } else {
        resetGame();
    }
}

function resetGame() {
    GAME_STATE.currentRound = 1;
    GAME_STATE.completedWordsInRound = 0;
    GAME_STATE.hasStarted = false;
    GAME_STATE.startTime = null;

    GAME_STATE.wordsPerRound = SETTINGS.words;
    GAME_STATE.roundsToWin = SETTINGS.rounds;

    updateProgressDisplay();
    startNewWord();
}

function startNewWord() {
    // 1. Determine eligible words
    const selectedLevel = SETTINGS.level;

    let eligibleWords = [];
    if (selectedLevel === 'all' || !WORD_BANKS[selectedLevel]) {
        eligibleWords = VALID_WORDS;
    } else {
        eligibleWords = WORD_BANKS[selectedLevel];
    }

    // Safety check
    if (eligibleWords.length === 0) eligibleWords = VALID_WORDS;

    // 2. Pick a new word (different from current if possible)
    let newWord = GAME_STATE.word;
    // Allow repeat if only 1 word available (unlikely)
    if (eligibleWords.length > 1) {
        let attempts = 0;
        while (newWord === GAME_STATE.word && attempts < 10) {
            newWord = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
            attempts++;
        }
    } else {
        newWord = eligibleWords[0];
    }

    GAME_STATE.word = newWord;
    GAME_STATE.letterIndex = 0;

    resetForNewLetter();
    calculateLayout();
}

function forceNextWord() {
    startNewWord();
}



function resetForNewLetter() {
    GAME_STATE.fadingStrokes = [];
    GAME_STATE.currentStroke = [];
    GAME_STATE.currentLetterStrokes = [];

    if (GAME_STATE.letterIndex === 0) {
        GAME_STATE.completedLetters = new Array(GAME_STATE.word.length).fill(false);
    }

    calculateTargetArea();
}

function resetWord() {
    startNewWord(); // Just pick a new one or restart
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    hitCanvas.width = canvas.width;
    hitCanvas.height = canvas.height;

    calculateLayout();
}

function calculateLayout() {
    const rect = canvas.getBoundingClientRect();
    const canvasHeight = rect.height;
    const canvasWidth = rect.width;

    // Logic coordinates
    const skyY = GUIDES.sky * canvasHeight;
    const grassY = GUIDES.grass * canvasHeight;
    const h = grassY - skyY;

    // Initial Standard Size
    let size = h;
    let padding = 15;

    // Check width constraint - Reduced from 0.9 to 0.8 for safe margins with thick halos
    const maxW = canvasWidth * 0.80;
    const aspect = 0.7;
    const count = GAME_STATE.word.length;

    if (count > 0) {
        let totalW = (size * aspect + padding) * count - padding;
        if (totalW > maxW) {
            const scale = maxW / totalW;
            size *= scale;
            padding *= scale;
        }
    }

    CONFIG.letterSize = size;
    CONFIG.letterPadding = padding;

    // CENTER VERTICALLY between sky and grass if word scaled down significantly
    // But usually we want uppercase to hit the sky line.
    const actualBase = grassY - size;
    CONFIG.baseline = grassY - size;

    // Calculate final width and center
    const w = CONFIG.letterSize * aspect;
    const finalTotalW = (w + CONFIG.letterPadding) * count - CONFIG.letterPadding;
    CONFIG.startX = (canvasWidth - finalTotalW) / 2;

    // Update Icon positions in the column
    updateIconPositions(canvasHeight);

    calculateTargetArea();
}

function updateIconPositions(canvasHeight) {
    const icons = document.querySelectorAll('.guide-icon');
    if (icons.length < 4) return;

    icons[0].style.top = (GUIDES.sky * canvasHeight) + 'px';
    icons[1].style.top = (GUIDES.plane * canvasHeight) + 'px';
    icons[2].style.top = (GUIDES.grass * canvasHeight) + 'px';
    icons[3].style.top = (GUIDES.worm * canvasHeight) + 'px';
}

function calculateTargetArea() {
    if (GAME_STATE.letterIndex >= GAME_STATE.word.length) return;

    const letter = GAME_STATE.word[GAME_STATE.letterIndex];
    const path = LETTER_PATHS[letter];
    if (!path) return;

    const dpr = window.devicePixelRatio || 1;
    hitCtx.clearRect(0, 0, hitCanvas.width, hitCanvas.height);
    hitCtx.save();
    hitCtx.scale(dpr, dpr);

    const x = getLetterX(GAME_STATE.letterIndex);
    const y = CONFIG.baseline;
    const s = CONFIG.letterSize;
    const w = s * 0.7;

    // Draw the "Ideal" wide path (The Target Area)
    hitCtx.lineCap = 'round';
    hitCtx.lineJoin = 'round';
    hitCtx.lineWidth = CONFIG.hitToleranceWidth;
    hitCtx.strokeStyle = 'red';

    hitCtx.beginPath();
    path.forEach(stroke => {
        hitCtx.moveTo(x + stroke[0][0] * w, y + stroke[0][1] * s);
        for (let i = 1; i < stroke.length; i++) {
            hitCtx.lineTo(x + stroke[i][0] * w, y + stroke[i][1] * s);
        }
    });
    hitCtx.stroke();
    hitCtx.restore();

    // Count pixels
    const pixelData = hitCtx.getImageData(0, 0, hitCanvas.width, hitCanvas.height).data;
    let count = 0;
    for (let i = 3; i < pixelData.length; i += 4) {
        if (pixelData[i] > 20) count++;
    }
    GAME_STATE.totalLetterPixels = count;
}

function getLetterX(index) {
    const w = CONFIG.letterSize * 0.7;
    return CONFIG.startX + index * (w + CONFIG.letterPadding);
}

// Rendering
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

    drawFadingStrokes();
    drawGuideLines();
    drawWordPaths();
    drawCurrentLetterStrokes();
    drawCurrentStroke();

    // Directional Beacon (PB Stage Only)
    if (SETTINGS.level === 'level1') {
        drawStartBeacon();
    }

    requestAnimationFrame(gameLoop);
}

function drawGuideLines() {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.save();
    ctx.lineWidth = 1;

    // Sky Line (Blue)
    ctx.strokeStyle = 'rgba(74, 144, 226, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, height * GUIDES.sky);
    ctx.lineTo(width, height * GUIDES.sky);
    ctx.stroke();

    // Plane Line (Grey Dashed)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.moveTo(0, height * GUIDES.plane);
    ctx.lineTo(width, height * GUIDES.plane);
    ctx.stroke();
    ctx.setLineDash([]);

    // Grass Line (Thick Green)
    ctx.strokeStyle = 'rgba(126, 211, 33, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * GUIDES.grass);
    ctx.lineTo(width, height * GUIDES.grass);
    ctx.stroke();

    // Worm Line (Brown)
    ctx.strokeStyle = 'rgba(139, 119, 101, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height * GUIDES.worm);
    ctx.lineTo(width, height * GUIDES.worm);
    ctx.stroke();

    ctx.restore();
}

function drawWordPaths() {
    if (!GAME_STATE.word) return;

    const s = CONFIG.letterSize;
    const w = s * 0.7;

    for (let i = 0; i < GAME_STATE.word.length; i++) {
        if (GAME_STATE.completedLetters[i]) {
            ctx.strokeStyle = '#2c3e50'; // Completed
            ctx.lineWidth = CONFIG.visualStrokeWidth + 1; // Slightly bolder
        } else if (i === GAME_STATE.letterIndex) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Active Target (Grey)
            ctx.lineWidth = CONFIG.visualStrokeWidth;
        } else {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'; // Inactive (Faint)
            ctx.lineWidth = CONFIG.visualStrokeWidth;
        }

        const letter = GAME_STATE.word[i];
        const path = LETTER_PATHS[letter];
        if (!path) continue;

        const lx = getLetterX(i);
        const ly = CONFIG.baseline;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        path.forEach(stroke => {
            ctx.moveTo(lx + stroke[0][0] * w, ly + stroke[0][1] * s);
            for (let k = 1; k < stroke.length; k++) {
                ctx.lineTo(lx + stroke[k][0] * w, ly + stroke[k][1] * s);
            }
        });
        ctx.stroke();
    }
}

function drawCurrentLetterStrokes() {
    if (GAME_STATE.currentLetterStrokes.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = CONFIG.visualStrokeWidth + 2; // Ink slightly thicker than template
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let stroke of GAME_STATE.currentLetterStrokes) {
        if (stroke.length === 0) continue;
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
}

function drawCurrentStroke() {
    if (GAME_STATE.currentStroke.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = CONFIG.visualStrokeWidth + 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = GAME_STATE.currentStroke;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
}

function drawFadingStrokes() {
    for (let i = GAME_STATE.fadingStrokes.length - 1; i >= 0; i--) {
        const item = GAME_STATE.fadingStrokes[i];
        item.opacity -= CONFIG.fadeSpeed;

        if (item.opacity <= 0) {
            GAME_STATE.fadingStrokes.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.strokeStyle = `rgba(200, 80, 80, ${item.opacity})`;
        ctx.lineWidth = CONFIG.visualStrokeWidth + 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const points = item.points;
        if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let j = 1; j < points.length; j++) ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
        }
    }
}

// Interactions
function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDrawing(e) {
    e.preventDefault();
    if (GAME_STATE.letterIndex >= GAME_STATE.word.length) return;

    // START TIMER ON FIRST STROKE
    if (!GAME_STATE.hasStarted) {
        GAME_STATE.hasStarted = true;
        GAME_STATE.startTime = Date.now();
    }

    GAME_STATE.isDrawing = true;
    GAME_STATE.currentStroke = [];
    GAME_STATE.currentStroke.push(getCoords(e));
}

function drawStroke(e) {
    if (!GAME_STATE.isDrawing) return;
    e.preventDefault();
    GAME_STATE.currentStroke.push(getCoords(e));
}

function endDrawing(e) {
    if (!GAME_STATE.isDrawing) return;
    e.preventDefault();
    GAME_STATE.isDrawing = false;
    validateStroke();
}

function validateStroke() {
    const points = GAME_STATE.currentStroke;
    if (points.length < 5) return;

    const dpr = window.devicePixelRatio || 1;

    const letter = GAME_STATE.word[GAME_STATE.letterIndex];
    if (!letter || !LETTER_PATHS[letter]) return;

    const path = LETTER_PATHS[letter];
    const lx = getLetterX(GAME_STATE.letterIndex);
    const ly = CONFIG.baseline;
    const s = CONFIG.letterSize;
    const w = s * 0.7;

    // Dynamic Tolerance
    let currentTolerance = CONFIG.hitToleranceWidth;
    if (CURVED_LETTERS.includes(letter)) {
        currentTolerance *= 1.35; // 35% more forgiving for curves
    }
    if (TRICKY_LETTERS.includes(letter)) {
        currentTolerance *= 1.2; // Dialed back from 1.5x to 1.2x for better challenge
    }

    // 1. Is the stroke inside the Halo?
    // We check this by drawing the halo on hitCanvas and checking overlap
    // Re-draw halo just to be safe
    hitCtx.clearRect(0, 0, hitCanvas.width, hitCanvas.height);
    hitCtx.save();
    hitCtx.scale(dpr, dpr);
    hitCtx.lineCap = 'round';
    hitCtx.lineJoin = 'round';
    hitCtx.lineWidth = currentTolerance;
    hitCtx.strokeStyle = 'red';

    hitCtx.beginPath();
    path.forEach(stroke => {
        hitCtx.moveTo(lx + stroke[0][0] * w, ly + stroke[0][1] * s);
        for (let k = 1; k < stroke.length; k++) {
            hitCtx.lineTo(lx + stroke[k][0] * w, ly + stroke[k][1] * s);
        }
    });
    hitCtx.stroke();
    hitCtx.restore();

    // Check points
    let hits = 0;
    let total = 0;
    const sample = 3;
    for (let i = 0; i < points.length; i += sample) {
        const px = Math.floor(points[i].x * dpr);
        const py = Math.floor(points[i].y * dpr);
        if (px >= 0 && py >= 0 && px < hitCanvas.width && py < hitCanvas.height) {
            const alpha = hitCtx.getImageData(px, py, 1, 1).data[3];
            if (alpha > 50) hits++;
            total++;
        }
    }

    const accuracy = total > 0 ? hits / total : 0;

    if (accuracy < 0.6) { // Must keep 60% of stroke inside the halo
        GAME_STATE.fadingStrokes.push({ points: [...points], opacity: 1.0 });
        GAME_STATE.currentStroke = [];
        return;
    }

    // Stroke is valid! Keep it.
    GAME_STATE.currentLetterStrokes.push([...points]);
    GAME_STATE.currentStroke = [];

    checkCoverage();
}

function checkCoverage() {
    const dpr = window.devicePixelRatio || 1;
    const letter = GAME_STATE.word[GAME_STATE.letterIndex];
    if (!letter || !LETTER_PATHS[letter]) return;

    const path = LETTER_PATHS[letter];
    const lx = getLetterX(GAME_STATE.letterIndex);
    const ly = CONFIG.baseline;
    const s = CONFIG.letterSize;
    const w = s * 0.7;

    // Dynamic Tolerance Boost
    let currentTolerance = CONFIG.hitToleranceWidth;
    if (CURVED_LETTERS.includes(letter)) {
        currentTolerance *= 1.35;
    }
    if (TRICKY_LETTERS.includes(letter)) {
        currentTolerance *= 1.2; // Dialed back from 1.5x
    }

    // Use global threshold
    let letterThreshold = CONFIG.completionThreshold;
    if (TRICKY_LETTERS.includes(letter)) {
        letterThreshold = 0.40; // Restored to 40% challenge level
    }

    // We must pass EVERY stroke in the letter
    const STROKE_THRESHOLD = letterThreshold;
    let allStrokesPassed = true;

    for (let i = 0; i < path.length; i++) {
        const strokeSegment = path[i];

        // PASS 1: Count Target Pixels (Red Halo)
        hitCtx.globalCompositeOperation = 'source-over';
        hitCtx.clearRect(0, 0, hitCanvas.width, hitCanvas.height);
        hitCtx.save();
        hitCtx.scale(dpr, dpr);
        hitCtx.lineCap = 'round';
        hitCtx.lineJoin = 'round';

        // SPECIAL FIX FOR 'A' CROSSBAR:
        // If the segment is very short relative to tolerance (like A crossbar),
        // we use a narrower check halo to prevent intersections from "clogging" the check.
        let checkTolerance = currentTolerance;
        const segLen = Math.sqrt(Math.pow(strokeSegment[0][0] - strokeSegment[1][0], 2) + Math.pow(strokeSegment[0][1] - strokeSegment[1][1], 2));
        if (segLen < 0.65) {
            checkTolerance = Math.min(currentTolerance, 15); // Tighten for 'A' and 'H' crossbars
        }

        hitCtx.lineWidth = checkTolerance;
        hitCtx.strokeStyle = 'red';

        hitCtx.beginPath();
        hitCtx.moveTo(lx + strokeSegment[0][0] * w, ly + strokeSegment[0][1] * s);
        for (let k = 1; k < strokeSegment.length; k++) hitCtx.lineTo(lx + strokeSegment[k][0] * w, ly + strokeSegment[k][1] * s);
        hitCtx.stroke();
        hitCtx.restore();

        // Calc Bounds
        let minX = strokeSegment[0][0], maxX = strokeSegment[0][0];
        let minY = strokeSegment[0][1], maxY = strokeSegment[0][1];
        for (let k = 1; k < strokeSegment.length; k++) {
            minX = Math.min(minX, strokeSegment[k][0]);
            maxX = Math.max(maxX, strokeSegment[k][0]);
            minY = Math.min(minY, strokeSegment[k][1]);
            maxY = Math.max(maxY, strokeSegment[k][1]);
        }
        const bX = Math.floor((lx + minX * w - currentTolerance) * dpr);
        const bY = Math.floor((ly + minY * s - currentTolerance) * dpr);
        const bW = Math.ceil(((maxX - minX) * w + currentTolerance * 2) * dpr);
        const bH = Math.ceil(((maxY - minY) * s + currentTolerance * 2) * dpr);

        const safeBX = Math.max(0, bX);
        const safeBY = Math.max(0, bY);
        const safeBW = Math.min(hitCanvas.width - safeBX, bW);
        const safeBH = Math.min(hitCanvas.height - safeBY, bH);

        if (safeBW <= 0 || safeBH <= 0) continue;

        const pixels1 = hitCtx.getImageData(safeBX, safeBY, safeBW, safeBH).data;
        let targetCount = 0;
        for (let p = 3; p < pixels1.length; p += 4) { if (pixels1[p] > 20) targetCount++; }

        // PASS 2: Count Overlap (Blue User Paint)
        hitCtx.save();
        hitCtx.scale(dpr, dpr);
        hitCtx.globalCompositeOperation = 'source-in';
        hitCtx.strokeStyle = 'blue';
        // User paint check is relative to the check halo
        hitCtx.lineWidth = checkTolerance * 0.8;
        hitCtx.lineCap = 'round';
        hitCtx.lineJoin = 'round';

        hitCtx.beginPath();
        for (let uStroke of GAME_STATE.currentLetterStrokes) {
            if (uStroke.length === 0) continue;
            hitCtx.moveTo(uStroke[0].x, uStroke[0].y);
            for (let u = 1; u < uStroke.length; u++) hitCtx.lineTo(uStroke[u].x, uStroke[u].y);
        }
        hitCtx.stroke();
        hitCtx.restore();

        const pixels2 = hitCtx.getImageData(safeBX, safeBY, safeBW, safeBH).data;
        let coveredCount = 0;
        for (let p = 3; p < pixels2.length; p += 4) { if (pixels2[p] > 20) coveredCount++; }

        // CHECK
        if (targetCount > 0) {
            const ratio = coveredCount / targetCount;
            if (ratio < STROKE_THRESHOLD) {
                allStrokesPassed = false;
                break; // Fail early
            }
        }
    }

    if (allStrokesPassed) {
        completeLetter();
    }
}

function updateProgressDisplay() {
    const ratioEl = document.getElementById('progressRatio');
    const mercury = document.getElementById('thermometerMercury');

    // Calculate global progress
    const totalWords = GAME_STATE.roundsToWin * GAME_STATE.wordsPerRound;
    const completedWordsGlobal = ((GAME_STATE.currentRound - 1) * GAME_STATE.wordsPerRound) + GAME_STATE.completedWordsInRound;

    // Percentage for mercury (0 to 100)
    const percentage = totalWords > 0 ? (completedWordsGlobal / totalWords) * 100 : 0;

    if (mercury) {
        const currentWidth = mercury.style.width;
        const newWidth = `${percentage}%`;
        const bulb = document.getElementById('thermometerBulb');

        if (currentWidth !== newWidth) {
            mercury.style.width = newWidth;
            if (bulb) {
                // We add a slight offset to stay within the tube's visuals
                bulb.style.left = `calc(20px + ${percentage}%)`;
            }
            // Trigger splash
            mercury.classList.remove('splash');
            void mercury.offsetWidth; // Trigger reflow
            mercury.classList.add('splash');
        }
    }

    if (ratioEl) {
        ratioEl.textContent = `Word ${GAME_STATE.completedWordsInRound + 1}/${GAME_STATE.wordsPerRound} • Round ${GAME_STATE.currentRound}/${GAME_STATE.roundsToWin}`;
    }
}

function completeLetter() {
    playLockSound();
    GAME_STATE.completedLetters[GAME_STATE.letterIndex] = true;
    GAME_STATE.letterIndex++;

    resetForNewLetter();

    if (GAME_STATE.letterIndex >= GAME_STATE.word.length) {
        setTimeout(completeWord, 800);
    }
}

function completeWord() {
    GAME_STATE.completedWordsInRound++;

    if (GAME_STATE.completedWordsInRound >= GAME_STATE.wordsPerRound) {
        // Round Complete
        GAME_STATE.completedWordsInRound = 0;
        GAME_STATE.currentRound++;

        if (GAME_STATE.currentRound > GAME_STATE.roundsToWin) {
            finishGame();
            return;
        }
    }

    updateProgressDisplay();
    startNewWord();
}

function finishGame() {
    const durationMs = Date.now() - GAME_STATE.startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000).toString().padStart(2, '0');

    const msg = document.getElementById('victoryMessage');
    if (msg) msg.textContent = `You completed Level ${GAME_STATE.wordsPerRound}x${GAME_STATE.roundsToWin} in ${minutes}:${seconds}!`;

    // Explicitly force display to override any hidden classes or issues
    const modal = document.getElementById('victoryModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

window.addEventListener('load', init);
// Subtle "Deadbolt" Sound Synthesizer
function playLockSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // Two-part "clink-clack" sound
        const playClick = (delay, freq, vol) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square'; // Mechanical feel
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + delay + 0.05);

            gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.05);
        };

        // First click (bolt sliding)
        playClick(0, 800, 0.05);
        // Second click (bolt locking)
        playClick(0.06, 400, 0.08);

    } catch (e) {
        // Silently fail if audio blocked
    }
}
// Directional Beacon Synthesizer
function drawStartBeacon() {
    const letter = GAME_STATE.word[GAME_STATE.letterIndex];
    if (!letter || !LETTER_PATHS[letter]) return;

    const path = LETTER_PATHS[letter];
    const lx = getLetterX(GAME_STATE.letterIndex);
    const ly = CONFIG.baseline;
    const s = CONFIG.letterSize;
    const w = s * 0.7;

    // 1. Find the first incomplete stroke
    // We can't strictly know if a stroke is done without checking coverage,
    // so we'll look at GAME_STATE.currentLetterStrokes vs LETTER_PATHS length.
    const currentStrokeIdx = Math.min(GAME_STATE.currentLetterStrokes.length, path.length - 1);

    // Get the start point of that stroke
    const startPt = path[currentStrokeIdx][0];
    const px = lx + startPt[0] * w;
    const py = ly + startPt[1] * s;

    // 2. Pulsing Animation
    const time = Date.now() / 1000;
    const pulse = (Math.sin(time * 6) + 1) / 2; // 0 to 1
    const radius = 10 + pulse * 15;
    const opacity = 0.2 + pulse * 0.4;

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(118, 75, 162, ${opacity})`; // Match theme purple
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(118, 75, 162, 0.8)`;
    ctx.fill();
    ctx.restore();
}
