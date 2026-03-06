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
    { symbol: "H2O", name: "Water", recipe: ["H", "H", "O"], desc: "The vital liquid for life. Two hydrogen bonds with one oxygen." },
    { symbol: "NaCl", name: "Table Salt", recipe: ["Na", "Cl"], desc: "Common sodium chloride. Stable and delicious on fries." },
    { symbol: "CO2", name: "Carbon Dioxide", recipe: ["C", "O", "O"], desc: "What plants breathe and humans breathe out." },
    { symbol: "O2", name: "Oxygen Molecule", recipe: ["O", "O"], desc: "The air we breathe is actually two oxygen atoms bonded together." },
    { symbol: "FeO", name: "Iron Oxide (Rust)", recipe: ["Fe", "O"], desc: "Formed when iron reacts with oxygen in the air." },
    { symbol: "SiO2", name: "Silicon Dioxide (Sand)", recipe: ["Si", "O", "O"], desc: "The main component of sand and glass." },
    { symbol: "CaCO3", name: "Calcium Carbonate (Chalk)", recipe: ["Ca", "C", "O", "O", "O"], desc: "Found in eggshells, seashells, and playground chalk." },
    { symbol: "NH3", name: "Ammonia", recipe: ["N", "H", "H", "H"], desc: "A strong-smelling gas used in cleaning supplies." },
    { symbol: "MgO", name: "Magnesium Oxide", recipe: ["Mg", "O"], desc: "Used in medicine and in making refractory bricks." }
];

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

async function initGame() {
    try {
        const response = await fetch('compounds.json');
        allCompounds = await response.json();
    } catch (e) {
        console.error("Failed to load compound database:", e);
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
    
    document.getElementById('clear-beaker').addEventListener('click', clearBeaker);
    document.getElementById('synthesize-btn').addEventListener('click', synthesize);
    document.getElementById('import-blueprint').addEventListener('click', importFromClipboard);
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
function addToBeaker(symbol) {
    if (beakerContents.length >= 10) return; 
    beakerContents.push(symbol);
    updateBeakerUI();
}

function clearBeaker() {
    beakerContents = [];
    labFeedback.classList.add('hidden');
    updateBeakerUI();
}

function updateBeakerUI() {
    beakerDiv.innerHTML = '';
    beakerContents.forEach(sym => {
        const el = document.createElement('div');
        el.className = 'beaker-atom';
        el.innerText = sym;
        beakerDiv.appendChild(el);
    });
    
    const fillPercent = (beakerContents.length / 10) * 100;
    beakerLiquid.style.height = `${Math.max(30, fillPercent)}%`;
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
