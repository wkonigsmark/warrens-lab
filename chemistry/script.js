/**
 * Chemistry: The Chemistry Engine
 */

const elementBank = [
    { number: 1, symbol: "H", name: "Hydrogen", type: "Nonmetal", typeClass: "type-gas", helper: "Highly explosive! Combined with oxygen, it makes water.", distractors: ["Helium", "Lithium", "Hassium"] },
    { number: 2, symbol: "He", name: "Helium", type: "Noble Gas", typeClass: "type-noble", helper: "Makes balloons float and your voice sound funny.", distractors: ["Hydrogen", "Neon", "Argon"] },
    { number: 6, symbol: "C", name: "Carbon", type: "Nonmetal", typeClass: "type-gas", helper: "The basis of all known life. Compressed into a diamond, it's the hardest material.", distractors: ["Calcium", "Chlorine", "Chromium"] },
    { number: 7, symbol: "N", name: "Nitrogen", type: "Nonmetal", typeClass: "type-gas", helper: "Makes up 78% of Earth's atmosphere.", distractors: ["Neon", "Nickel", "Sodium"] },
    { number: 8, symbol: "O", name: "Oxygen", type: "Nonmetal", typeClass: "type-gas", helper: "Highly reactive. Animals need it to breathe.", distractors: ["Osmium", "Oganesson", "Argon"] },
    { number: 11, symbol: "Na", name: "Sodium", type: "Metal", typeClass: "type-metal", helper: "Highly reactive metal. Found in salt.", distractors: ["Neon", "Nitrogen", "Sulfur"] },
    { number: 17, symbol: "Cl", name: "Chlorine", type: "Nonmetal", typeClass: "type-gas", helper: "A yellow-green gas. Used to keep pools clean.", distractors: ["Carbon", "Calcium", "Chrome"] },
    { number: 26, symbol: "Fe", name: "Iron", type: "Transition Metal", typeClass: "type-metal", helper: "Used to make steel. It's what makes our blood red!", distractors: ["Copper", "Silver", "Gold"] },
    { number: 79, symbol: "Au", name: "Gold", type: "Transition Metal", typeClass: "type-metal", helper: "A precious yellow metal that never rusts.", distractors: ["Silver", "Copper", "Iron"] },
    { number: 20, symbol: "Ca", name: "Calcium", type: "Alkaline Earth Metal", typeClass: "type-metal", helper: "Essential for strong bones and teeth.", distractors: ["Carbon", "Copper", "Chlorine"] },
    { number: 12, symbol: "Mg", name: "Magnesium", type: "Alkaline Earth Metal", typeClass: "type-metal", helper: "Burns with a very bright white light.", distractors: ["Manganese", "Mercury", "Sodium"] },
    { number: 13, symbol: "Al", name: "Aluminum", type: "Post-transition Metal", typeClass: "type-metal", helper: "Lightweight and used for foil and soda cans.", distractors: ["Silver", "Gold", "Lead"] },
    { number: 14, symbol: "Si", name: "Silicon", type: "Metalloid", typeClass: "type-metal", helper: "Used to make computer chips and glass.", distractors: ["Silver", "Sulfur", "Sodium"] }
];

const synthesisFormulas = [
    { symbol: "H2O",  name: "Water",                recipe: ["H","H","O"],             desc: "The vital liquid for life. Two hydrogen bonds with one oxygen." },
    { symbol: "NaCl", name: "Table Salt",            recipe: ["Na","Cl"],               desc: "Common sodium chloride. Stable and delicious on fries." },
    { symbol: "CO2",  name: "Carbon Dioxide",        recipe: ["C","O","O"],             desc: "What plants breathe and humans breathe out." },
    { symbol: "O2",   name: "Oxygen Molecule",       recipe: ["O","O"],                 desc: "The air we breathe is actually two oxygen atoms bonded together." },
    { symbol: "FeO",  name: "Iron Oxide (Rust)",     recipe: ["Fe","O"],                desc: "Formed when iron reacts with oxygen in the air." },
    { symbol: "SiO2", name: "Silicon Dioxide (Sand)",recipe: ["Si","O","O"],            desc: "The main component of sand and glass." },
    { symbol: "CaCO3",name: "Calcium Carbonate",     recipe: ["Ca","C","O","O","O"],    desc: "Found in eggshells, seashells, and playground chalk." },
    { symbol: "NH3",  name: "Ammonia",               recipe: ["N","H","H","H"],         desc: "A strong-smelling gas used in cleaning supplies." },
    { symbol: "MgO",  name: "Magnesium Oxide",       recipe: ["Mg","O"],                desc: "Used in medicine and in making refractory bricks." }
];

// Curated everyday compounds for the 🎲 Random button
// Chosen for recognizability — nothing exotic!
const everydayCompounds = [
    { formula: "H2O",    common_name: "Water",              emoji: "💧", fact: "The molecule of life — covers 71% of Earth's surface." },
    { formula: "NaCl",   common_name: "Table Salt",         emoji: "🧂", fact: "The only rock humans eat. Essential for nerve function." },
    { formula: "CO2",    common_name: "Carbon Dioxide",     emoji: "💨", fact: "The gas you exhale and plants convert to oxygen." },
    { formula: "O2",     common_name: "Oxygen",             emoji: "🌬️", fact: "Two oxygen atoms bonded — the air we breathe." },
    { formula: "NH3",    common_name: "Ammonia",            emoji: "🧹", fact: "A pungent gas found in cleaning products and fertilizers." },
    { formula: "H2O2",   common_name: "Hydrogen Peroxide",  emoji: "🫧", fact: "A pale blue liquid used as a disinfectant and bleach." },
    { formula: "CH4",    common_name: "Methane",            emoji: "🔥", fact: "Natural gas — the simplest hydrocarbon and a greenhouse gas." },
    { formula: "C2H5OH", common_name: "Ethanol (Alcohol)",  emoji: "🍷", fact: "The intoxicating compound in all alcoholic beverages." },
    { formula: "C6H12O6",common_name: "Glucose",            emoji: "🍬", fact: "The primary energy source for every cell in your body." },
    { formula: "C12H22O11",common_name:"Sucrose (Sugar)",   emoji: "🍭", fact: "Table sugar — a disaccharide of glucose and fructose." },
    { formula: "C8H10N4O2",common_name:"Caffeine",          emoji: "☕", fact: "The world's most widely consumed psychoactive substance." },
    { formula: "CaCO3",  common_name: "Calcium Carbonate",  emoji: "🪨", fact: "Limestone, chalk, and marble — also in your bones!" },
    { formula: "Fe2O3",  common_name: "Rust (Iron Oxide)",  emoji: "🦀", fact: "What happens when iron meets oxygen and moisture." },
    { formula: "SiO2",   common_name: "Sand / Quartz",      emoji: "🏖️", fact: "Silicon dioxide — the basis of glass and beach sand." },
    { formula: "HCl",    common_name: "Hydrochloric Acid",  emoji: "⚗️", fact: "The acid in your stomach that helps digest food." },
    { formula: "NaHCO3", common_name: "Baking Soda",        emoji: "🧁", fact: "Sodium bicarbonate — releases CO2 to make cakes rise." },
    { formula: "C3H8O3", common_name: "Glycerol",           emoji: "🧴", fact: "A thick liquid used in soaps, lotions, and food." },
    { formula: "N2",     common_name: "Nitrogen Gas",       emoji: "🌫️", fact: "Makes up 78% of Earth's atmosphere." },
    { formula: "SO2",    common_name: "Sulfur Dioxide",     emoji: "🌋", fact: "Released by volcanoes and coal — causes acid rain." },
    { formula: "MgO",    common_name: "Magnesium Oxide",    emoji: "💊", fact: "Used as an antacid and laxative in medicine." },
];

let lastRandomIndex = -1; // prevent repeating the same compound twice in a row

function randomCompound() {
    // Pick a random compound, avoiding the last one
    let idx;
    do { idx = Math.floor(Math.random() * everydayCompounds.length); }
    while (idx === lastRandomIndex);
    lastRandomIndex = idx;

    const compound = everydayCompounds[idx];

    // Animate the button
    const btn = document.getElementById('random-compound-btn');
    btn.innerText = '🎲 Loading...';
    btn.disabled = true;

    // Short delay for drama
    setTimeout(() => {
        loadCompoundToShelf(compound, document.getElementById('search-results'));

        // Show a fun reveal toast
        showRandomToast(compound);

        btn.innerHTML = `🎲 ${compound.emoji} ${compound.common_name}`;
        setTimeout(() => {
            btn.innerHTML = '🎲 Random';
            btn.disabled = false;
        }, 2500);
    }, 350);
}

function showRandomToast(compound) {
    // Remove existing toast
    document.getElementById('random-toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'random-toast';
    toast.innerHTML = `
        <span class="toast-emoji">${compound.emoji}</span>
        <div class="toast-body">
            <strong>${compound.common_name}</strong>
            <span>${compound.fact}</span>
        </div>
    `;
    document.getElementById('lab-view').appendChild(toast);

    // Auto-dismiss after 4s
    setTimeout(() => toast.classList.add('toast-out'), 3500);
    setTimeout(() => toast.remove(), 4200);
}


let correctCount = 0;
let currentQuestion = null;
let beakerContents = [];
let allCompounds = [];

// DOM Elements
// ... (previous DOM elements)
const quizView = document.getElementById('quiz-view');
const labView = document.getElementById('lab-view');
const modeQuizBtn = document.getElementById('mode-quiz');
const modeLabBtn = document.getElementById('mode-lab');

const symbolDisplay = document.getElementById('element-symbol');
const questionText = document.getElementById('question-text');
const atomicNumberEl = document.getElementById('atomic-number');
const elementTypeEl = document.getElementById('element-type');
const optionsContainer = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const feedbackMsgEl = document.getElementById('feedback-message');
const helperTextEl = document.getElementById('helper-text');
const correctCountEl = document.getElementById('correct-count');
const nextBtn = document.getElementById('next-btn');

const beakerDiv = document.getElementById('beaker-contents');
const beakerLiquid = document.querySelector('.beaker-liquid');
const labFeedback = document.getElementById('lab-feedback');
const resultSymbol = document.getElementById('result-molecule');
const resultName = document.getElementById('result-name');
const resultDesc = document.getElementById('result-desc');

const recipesModal = document.getElementById('recipes-modal');
const recipeList = document.getElementById('recipe-list');
const showRecipesBtn = document.getElementById('show-recipes-btn');
const closeRecipesBtn = document.getElementById('close-recipes');

let periodicTable = [];
let activeSlot = null;
let customSlots = { 1: null, 2: null, 3: null };

async function initGame() {
    try {
        const [compoundsRes, tableRes] = await Promise.all([
            fetch('compounds.json'),
            fetch('periodic-table.json')
        ]);
        allCompounds = await compoundsRes.json();
        const tableData = await tableRes.json();
        periodicTable = tableData.elements;
    } catch (e) {
        console.error("Failed to load databases:", e);
    }

    loadNewQuestion();
    populateRecipes();
    
    // Mode Switching
    modeQuizBtn.addEventListener('click', () => {
        quizView.classList.remove('hidden');
        labView.classList.add('hidden');
        modeQuizBtn.classList.add('active');
        modeLabBtn.classList.remove('active');
    });

    modeLabBtn.addEventListener('click', () => {
        labView.classList.remove('hidden');
        quizView.classList.add('hidden');
        modeLabBtn.classList.add('active');
        modeQuizBtn.classList.remove('active');
    });

    // Recipes Modal Logic
    showRecipesBtn.addEventListener('click', () => recipesModal.classList.remove('hidden'));
    closeRecipesBtn.addEventListener('click', () => recipesModal.classList.add('hidden'));
    recipesModal.addEventListener('click', (e) => {
        if (e.target === recipesModal) recipesModal.classList.add('hidden');
    });

    // Quiz Navigation
    nextBtn.addEventListener('click', loadNewQuestion);

    // Lab Navigation
    document.querySelectorAll('.shelf-btn').forEach(btn => {
        btn.addEventListener('click', () => addToBeaker(btn.dataset.el));
    });

    // Search & Slots Initialization
    const searchInput = document.getElementById('element-search-input');
    const searchResults = document.getElementById('search-results');
    const slotBtns = document.querySelectorAll('.slot-btn');

    searchInput.addEventListener('input', (e) => handleSearch(e.target.value, searchResults));
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.classList.add('hidden');
        }
    });

    slotBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const slotId = btn.dataset.slot;
            if (customSlots[slotId]) {
                // If occupied, add to beaker
                addToBeaker(customSlots[slotId].symbol);
            } else {
                // If empty, activate for assignment
                slotBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeSlot = slotId;
                searchInput.focus();
            }
        });
    });
    
    document.getElementById('clear-beaker').addEventListener('click', clearBeaker);
    document.getElementById('synthesize-btn').addEventListener('click', synthesize);
    document.getElementById('import-blueprint').addEventListener('click', importFromClipboard);
    document.getElementById('random-compound-btn').addEventListener('click', randomCompound);
}

function handleSearch(query, resultsContainer) {
    if (!query || query.length < 1) {
        resultsContainer.classList.add('hidden');
        return;
    }

    const lq = query.toLowerCase();

    // Search elements
    const filteredElements = periodicTable.filter(el =>
        el.name.toLowerCase().includes(lq) ||
        el.symbol.toLowerCase().includes(lq)
    ).slice(0, 5);

    // Search compounds
    const filteredCompounds = allCompounds.filter(c =>
        (c.common_name && c.common_name.toLowerCase().includes(lq)) ||
        (c.iupac_name && c.iupac_name.toLowerCase().includes(lq)) ||
        (c.formula && c.formula.toLowerCase().includes(lq))
    ).slice(0, 5);

    if (filteredElements.length === 0 && filteredCompounds.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-dim); font-size: 0.9rem;">No results found...</div>';
        resultsContainer.classList.remove('hidden');
        return;
    }

    resultsContainer.innerHTML = '';

    // --- Element Results ---
    if (filteredElements.length > 0) {
        const elHeader = document.createElement('div');
        elHeader.className = 'search-section-header';
        elHeader.innerText = '⚛️ Elements';
        resultsContainer.appendChild(elHeader);

        filteredElements.forEach(el => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <span class="symbol">${el.symbol}</span>
                <span class="name">${el.name}</span>
                <span class="result-type-tag element-tag">Element</span>
            `;
            item.addEventListener('click', () => assignToSlot(el, resultsContainer));
            resultsContainer.appendChild(item);
        });
    }

    // --- Compound Results ---
    if (filteredCompounds.length > 0) {
        const compHeader = document.createElement('div');
        compHeader.className = 'search-section-header';
        compHeader.innerText = '🧪 Compounds — click to load shelf';
        resultsContainer.appendChild(compHeader);

        filteredCompounds.forEach(compound => {
            const atoms = parseFormula(compound.formula);
            const uniqueEls = [...new Set(atoms)];
            const item = document.createElement('div');
            item.className = 'search-result-item compound-result-item';
            item.innerHTML = `
                <span class="symbol compound-formula">${compound.formula}</span>
                <span class="name">${compound.common_name}</span>
                <span class="result-type-tag compound-tag">${uniqueEls.join(' · ')}</span>
            `;
            item.addEventListener('click', () => loadCompoundToShelf(compound, resultsContainer));
            resultsContainer.appendChild(item);
        });
    }

    resultsContainer.classList.remove('hidden');
}

function loadCompoundToShelf(compound, resultsContainer) {
    const atoms = parseFormula(compound.formula);
    const uniqueSymbols = [...new Set(atoms)]; // e.g. ['H', 'O'] for water

    // Look up each element in our periodic table data
    const elementsToLoad = uniqueSymbols.map(sym =>
        periodicTable.find(el => el.symbol === sym) || { symbol: sym, name: sym }
    );

    // Reset all 3 custom slots
    customSlots = { 1: null, 2: null, 3: null };
    document.querySelectorAll('.slot-btn').forEach(btn => {
        const slotId = btn.dataset.slot;
        btn.innerHTML = `<span>Slot ${slotId}</span>`;
        btn.classList.remove('occupied', 'active');
    });

    // Fill slots (up to 3) with the compound's unique elements
    elementsToLoad.slice(0, 3).forEach((el, i) => {
        const slotId = i + 1;
        customSlots[slotId] = el;
        const slotBtn = document.querySelector(`.slot-btn[data-slot="${slotId}"]`);
        slotBtn.innerHTML = `
            <div class="slot-symbol">${el.symbol}</div>
            <span>${el.name}</span>
        `;
        slotBtn.classList.add('occupied');
    });

    // Clear beaker and auto-load the full formula into beaker
    clearBeaker();
    atoms.forEach(sym => addToBeaker(sym));

    // Visual feedback
    resultsContainer.classList.add('hidden');
    document.getElementById('element-search-input').value = '';
    activeSlot = null;

    // Flash the beaker
    const beaker = document.getElementById('beaker');
    beaker.style.borderColor = 'var(--accent-primary)';
    setTimeout(() => beaker.style.borderColor = '', 1200);
}


function assignToSlot(element, resultsContainer) {
    if (!activeSlot) {
        // Find first empty slot if none active
        activeSlot = [1, 2, 3].find(s => !customSlots[s]) || 1;
    }

    customSlots[activeSlot] = element;
    
    // Update UI
    const slotBtn = document.querySelector(`.slot-btn[data-slot="${activeSlot}"]`);
    slotBtn.innerHTML = `
        <div class="slot-symbol">${element.symbol}</div>
        <span>${element.name}</span>
    `;
    slotBtn.classList.add('occupied');
    slotBtn.classList.remove('active');
    
    resultsContainer.classList.add('hidden');
    document.getElementById('element-search-input').value = '';
    activeSlot = null;
}

async function importFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const formula = text.trim();
        if (!formula) return;

        const atoms = parseFormula(formula);
        if (atoms.length === 0) {
            alert("No valid ingredients found in the copied blueprint!");
            return;
        }

        // Check if all elements are on our shelf
        const shelfElements = Array.from(document.querySelectorAll('.shelf-btn')).map(b => b.dataset.el);
        const missing = atoms.filter(a => !shelfElements.includes(a));
        
        if (missing.length > 0) {
            alert(`Our lab shelf is currently missing: ${[...new Set(missing)].join(', ')}. We can only synthesize common available atoms!`);
            return;
        }

        if (atoms.length > 10) {
            alert("This compound is too complex for our 10-atom beaker!");
            return;
        }

        // Clear and Load
        clearBeaker();
        atoms.forEach(a => addToBeaker(a));
        
        // Visual Feedback on Button
        const btn = document.getElementById('import-blueprint');
        const oldText = btn.innerText;
        btn.innerText = "⚡ Loaded!";
        btn.style.background = "#e8f5e9";
        setTimeout(() => {
            btn.innerText = oldText;
            btn.style.background = "";
        }, 1500);

    } catch (err) {
        alert("Please allow clipboard access to use the Blueprint Import feature!");
    }
}

function parseFormula(formula) {
    if (!formula) return [];
    // Regex to match Element + optional number
    const regex = /([A-Z][a-z]*)(\d*)/g;
    let match;
    const atoms = [];
    while ((match = regex.exec(formula)) !== null) {
        const element = match[1];
        const count = parseInt(match[2]) || 1;
        for (let i = 0; i < count; i++) {
            atoms.push(element);
        }
    }
    return atoms;
}

function populateRecipes() {
    recipeList.innerHTML = '';
    // Show top 20 common recipes in the modal for now
    const displayList = allCompounds.slice(0, 25);
    
    displayList.forEach(f => {
        const atoms = parseFormula(f.formula);
        const item = document.createElement('div');
        item.className = 'recipe-item';
        item.innerHTML = `
            <div class="recipe-info">
                <h4>${f.common_name}</h4>
                <p>Needs: ${formatRecipe(atoms)}</p>
            </div>
            <div class="recipe-formula">${f.formula}</div>
        `;
        recipeList.appendChild(item);
    });
}

function formatRecipe(atoms) {
    const counts = {};
    atoms.forEach(el => counts[el] = (counts[el] || 0) + 1);
    return Object.entries(counts).map(([el, count]) => `${count}x ${el}`).join(', ');
}

// --- QUIZ LOGIC ---
function loadNewQuestion() {
    feedbackEl.classList.add('hidden');
    const element = elementBank[Math.floor(Math.random() * elementBank.length)];
    currentQuestion = element;
    
    symbolDisplay.innerText = element.symbol;
    atomicNumberEl.innerText = `#${element.number}`;
    elementTypeEl.innerText = element.type;
    elementTypeEl.className = `tag ${element.typeClass}`;

    renderOptions(element.name, element.distractors);
}

function renderOptions(correctAnswer, distractors) {
    const options = [
        { text: correctAnswer, correct: true },
        ...distractors.map(d => ({ text: d, correct: false }))
    ].sort(() => Math.random() - 0.5);
    
    optionsContainer.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.addEventListener('click', () => handleChoice(btn, opt.correct));
        optionsContainer.appendChild(btn);
    });
}

function handleChoice(selectedBtn, isCorrect) {
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.add('disabled'));
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        feedbackMsgEl.innerText = "⚡ Reaction Successful!";
        feedbackMsgEl.style.color = "var(--accent-primary)";
        correctCount++;
    } else {
        selectedBtn.classList.add('wrong');
        feedbackMsgEl.innerText = "⚠️ Unstable Bond!";
        feedbackMsgEl.style.color = "var(--accent-wrong)";
    }
    
    helperTextEl.innerText = currentQuestion.helper;
    feedbackEl.classList.remove('hidden');
    correctCountEl.innerText = correctCount;
}

// --- LAB LOGIC ---
const bondedSymbols = new Set(); // tracks which elements the user has manually bonded

function addToBeaker(symbol) {
    // No hard cap — beaker scales dynamically to fit any compound
    beakerContents.push(symbol);
    updateBeakerUI();
}

function clearBeaker() {
    beakerContents = [];
    bondedSymbols.clear();
    labFeedback.classList.add('hidden');
    updateBeakerUI();
}

function bondElement(symbol) {
    const count = beakerContents.filter(s => s === symbol).length;
    if (count < 2) return; // nothing to bond
    bondedSymbols.add(symbol);
    updateBeakerUI();
}

function updateBeakerUI() {
    beakerDiv.innerHTML = '';

    // Build the display list: bonded symbols appear once as a grouped bubble
    const rendered = new Set();
    const displayItems = []; // { symbol, label, count, bonded }

    beakerContents.forEach(sym => {
        if (bondedSymbols.has(sym)) {
            if (!rendered.has(sym)) {
                const symCount = beakerContents.filter(s => s === sym).length;
                displayItems.push({ symbol: sym, count: symCount, bonded: true });
                rendered.add(sym);
            }
            // skip duplicates of bonded
        } else {
            displayItems.push({ symbol: sym, count: 1, bonded: false });
        }
    });

    const displayCount = displayItems.length;

    // Density tiers based on visual display count (not raw atom count)
    let atomSize, fontSize, gap;
    if (displayCount <= 4)      { atomSize = 44; fontSize = '1rem';  gap = 8; }
    else if (displayCount <= 8) { atomSize = 36; fontSize = '0.85rem'; gap = 6; }
    else if (displayCount <= 12){ atomSize = 28; fontSize = '0.72rem'; gap = 5; }
    else if (displayCount <= 18){ atomSize = 22; fontSize = '0.6rem';  gap = 4; }
    else if (displayCount <= 28){ atomSize = 17; fontSize = '0.5rem';  gap = 3; }
    else if (displayCount <= 40){ atomSize = 14; fontSize = '0.42rem'; gap = 2; }
    else                        { atomSize = 11; fontSize = '0.35rem'; gap = 2; }

    beakerDiv.style.gap = `${gap}px`;
    beakerDiv.style.padding = displayCount > 20 ? '12px' : '20px';

    displayItems.forEach(item => {
        const el = document.createElement('div');
        el.className = 'beaker-atom' + (item.bonded ? ' bonded-atom' : '');
        el.style.width  = item.bonded ? `${atomSize + 12}px` : `${atomSize}px`;
        el.style.height = item.bonded ? `${atomSize + 12}px` : `${atomSize}px`;
        el.style.fontSize = fontSize;
        el.title = item.bonded
            ? `${item.symbol}${item.count} — bonded (dbl-click to unbond)`
            : `Double-click to bond all ${item.symbol} atoms together`;

        if (item.bonded && item.count > 1) {
            // Show symbol + subscript count
            el.innerHTML = `${item.symbol}<sub style="font-size:0.7em">${item.count}</sub>`;
        } else {
            el.innerText = item.symbol;
        }

        // Double-click: bond if unbonded, unbond if already bonded
        el.addEventListener('dblclick', () => {
            if (bondedSymbols.has(item.symbol)) {
                bondedSymbols.delete(item.symbol);
            } else {
                bondElement(item.symbol);
                return; // bondElement calls updateBeakerUI
            }
            updateBeakerUI();
        });

        beakerDiv.appendChild(el);
    });

    // Fill level against raw atom count so it stays physically accurate
    const rawCount = beakerContents.length;
    const fillPercent = Math.min(95, (rawCount / 48) * 100);
    beakerLiquid.style.height = `${Math.max(15, fillPercent)}%`;
}

function synthesize() {
    const currentRecipe = [...beakerContents].sort().join('');
    
    const match = allCompounds.find(f => {
        const atoms = parseFormula(f.formula);
        const sortedRecipe = [...atoms].sort().join('');
        return sortedRecipe === currentRecipe;
    });

    if (match) {
        resultSymbol.innerText = match.formula;
        resultName.innerText = match.common_name;
        resultDesc.innerText = `IUPAC Name: ${match.iupac_name}. Molecular Weight: ${match.weight} u.`;
        labFeedback.classList.remove('hidden');
    } else {
        alert("The bond is unstable! This combination doesn't form a common molecule yet.");
    }
}

document.addEventListener('DOMContentLoaded', initGame);
