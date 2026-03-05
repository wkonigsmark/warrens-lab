/**
 * Stoicheia: The Chemistry Engine
 */

const elementBank = [
    {
        number: 1,
        symbol: "H",
        name: "Hydrogen",
        type: "Nonmetal",
        typeClass: "type-gas",
        helper: "The first element in the universe. Highly explosive! Combined with oxygen, it makes water.",
        distractors: ["Helium", "Lithium", "Hassium"]
    },
    {
        number: 2,
        symbol: "He",
        name: "Helium",
        type: "Noble Gas",
        typeClass: "type-noble",
        helper: "The second most abundant element. It makes balloons float and your voice sound funny.",
        distractors: ["Hydrogen", "Neon", "Argon"]
    },
    {
        number: 6,
        symbol: "C",
        name: "Carbon",
        type: "Nonmetal",
        typeClass: "type-gas",
        helper: "The basis of all known life on Earth. Compressed into a diamond, it's the hardest material.",
        distractors: ["Calcium", "Chlorine", "Chromium"]
    },
    {
        number: 7,
        symbol: "N",
        name: "Nitrogen",
        type: "Nonmetal",
        typeClass: "type-gas",
        helper: "Makes up 78% of Earth's atmosphere. Used in liquid form to freeze things instantly.",
        distractors: ["Neon", "Nickel", "Sodium"]
    },
    {
        number: 8,
        symbol: "O",
        name: "Oxygen",
        type: "Nonmetal",
        typeClass: "type-gas",
        helper: "Highly reactive. Animals need it to breathe, and fire needs it to burn.",
        distractors: ["Osmium", "Oganesson", "Argon"]
    },
    {
        number: 10,
        symbol: "Ne",
        name: "Neon",
        type: "Noble Gas",
        typeClass: "type-noble",
        helper: "Famous for its orange-red glow in advertising signs. It doesn't like to react with anything.",
        distractors: ["Nickel", "Sodium", "Helium"]
    },
    {
        number: 26,
        symbol: "Fe",
        name: "Iron",
        type: "Transition Metal",
        typeClass: "type-metal",
        helper: "The symbol Fe comes from the Latin 'ferrum'. It's the core of our planet and our blood.",
        distractors: ["Fluorine", "Fermium", "Iridium"]
    },
    {
        number: 79,
        symbol: "Au",
        name: "Gold",
        type: "Transition Metal",
        typeClass: "type-metal",
        helper: "From the Latin 'aurum'. It's highly prized because it never rusts or tarnishes.",
        distractors: ["Silver", "Aluminum", "Antimony"]
    },
    {
        number: 82,
        symbol: "Pb",
        name: "Lead",
        type: "Post-transition Metal",
        typeClass: "type-metal",
        helper: "From the Latin 'plumbum' (why plumbers are called that). Very heavy and used to stop radiation.",
        distractors: ["Palladium", "Plutonium", "Phosphorus"]
    }
];

const fusionBank = [
    {
        symbol: "H₂O",
        name: "Water",
        elements: ["Hydrogen", "Oxygen"],
        helper: "The most vital molecule for life. Formed when two Hydrogen atoms bond to one Oxygen atom.",
        distractors: ["Salt", "Carbon Dioxide", "Methane"]
    },
    {
        symbol: "NaCl",
        name: "Table Salt",
        elements: ["Sodium", "Chlorine"],
        helper: "A metal (Sodium) and a deadly gas (Chlorine) combine to make something we put on fries.",
        distractors: ["Sugar", "Water", "Baking Soda"]
    },
    {
        symbol: "CO₂",
        name: "Carbon Dioxide",
        elements: ["Carbon", "Oxygen"],
        helper: "The gas that plants breathe and humans breathe out. It's also what makes soda fizzy.",
        distractors: ["Oxygen", "Carbon Monoxide", "Nitrogen"]
    }
];

let currentLevel = 1;
let correctCount = 0;
let currentQuestion = null;

const symbolDisplay = document.getElementById('element-symbol');
const questionText = document.getElementById('question-text');
const atomicNumberEl = document.getElementById('atomic-number');
const elementTypeEl = document.getElementById('element-type');
const optionsContainer = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const feedbackMsgEl = document.getElementById('feedback-message');
const helperTextEl = document.getElementById('helper-text');
const correctCountEl = document.getElementById('correct-count');
const levelCountEl = document.getElementById('level-count');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');

function initGame() {
    loadNewQuestion();
    
    nextBtn.addEventListener('click', loadNewQuestion);
    resetBtn.addEventListener('click', () => {
        correctCount = 0;
        currentLevel = 1;
        updateStats();
        loadNewQuestion();
    });
}

function loadNewQuestion() {
    feedbackEl.classList.add('hidden');
    
    // Switch between Element ID and Fusion every few questions
    const isFusion = Math.random() > 0.7 && currentLevel > 1;
    
    if (isFusion) {
        setupFusionQuestion();
    } else {
        setupElementQuestion();
    }
}

function setupElementQuestion() {
    const element = elementBank[Math.floor(Math.random() * elementBank.length)];
    currentQuestion = { ...element, isFusion: false };
    
    symbolDisplay.innerText = element.symbol;
    questionText.innerText = "What is this element?";
    atomicNumberEl.innerText = `#${element.number}`;
    elementTypeEl.innerText = element.type;
    elementTypeEl.className = `tag ${element.typeClass}`;

    renderOptions(element.name, element.distractors);
}

function setupFusionQuestion() {
    const fusion = fusionBank[Math.floor(Math.random() * fusionBank.length)];
    currentQuestion = { ...fusion, isFusion: true };
    
    symbolDisplay.innerText = fusion.symbol;
    questionText.innerText = "What molecule does this represent?";
    atomicNumberEl.innerText = "Compound";
    elementTypeEl.innerText = "Molecule";
    elementTypeEl.className = "tag type-metal"; // Default fusion color

    renderOptions(fusion.name, fusion.distractors);
}

function renderOptions(correctAnswer, distractors) {
    const options = [
        { text: correctAnswer, correct: true },
        ...distractors.map(d => ({ text: d, correct: false }))
    ];
    
    options.sort(() => Math.random() - 0.5);
    
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
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        feedbackMsgEl.innerText = "⚡ Reaction Successful!";
        feedbackMsgEl.style.color = "var(--accent-primary)";
        correctCount++;
        if (correctCount % 5 === 0) currentLevel++;
    } else {
        selectedBtn.classList.add('wrong');
        feedbackMsgEl.innerText = "⚠️ Unstable Bond!";
        feedbackMsgEl.style.color = "var(--accent-wrong)";
        
        buttons.forEach(btn => {
            if (btn.innerText === (currentQuestion.isFusion ? currentQuestion.name : currentQuestion.name)) {
                btn.classList.add('correct');
            }
        });
    }
    
    helperTextEl.innerText = currentQuestion.helper;
    feedbackEl.classList.remove('hidden');
    updateStats();
}

function updateStats() {
    correctCountEl.innerText = correctCount;
    levelCountEl.innerText = currentLevel;
}

document.addEventListener('DOMContentLoaded', initGame);
