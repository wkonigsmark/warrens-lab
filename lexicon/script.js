/**
 * Lexicon Vocabulary Engine
 */

const wordBank = [
    {
        word: "Ephemeral",
        pronunciation: "/i-FEM-er-uhl/",
        origin: "Greek",
        definition: "Lasting for a very short time.",
        helper: "Think of an insect that only lives for a day, or a beautiful sunset.",
        distractors: ["Extremely large and heavy.", "Impossible to understand.", "Moving with sudden speed."]
    },
    {
        word: "Loquacious",
        pronunciation: "/loh-KWAY-shuhs/",
        origin: "Latin",
        definition: "Tending to talk a great deal; talkative.",
        helper: "Related to 'eloquent'—it's someone who has a lot of words to share.",
        distractors: ["Silent and reserved.", "Easily broken or fragile.", "Bright and shining."]
    },
    {
        word: "Pernicious",
        pronunciation: "/per-NISH-uhs/",
        origin: "Latin",
        definition: "Having a harmful effect in a subtle way.",
        helper: "Sounds like 'vicious'. It's a danger that creeps up on you slowly.",
        distractors: ["A type of persistent cough.", "Extremely helpful and kind.", "Related to ancient history."]
    },
    {
        word: "Mellifluous",
        pronunciation: "/muh-LIF-loo-uhs/",
        origin: "Latin",
        definition: "Sweet or musical; pleasant to hear.",
        helper: "The 'Melli' comes from the Latin word for honey. Sweet as honey to the ears.",
        distractors: ["Smelling very strongly of rain.", "Harsh and grating noise.", "Old and falling apart."]
    },
    {
        word: "Sagacious",
        pronunciation: "/suh-GAY-shuhs/",
        origin: "Latin",
        definition: "Having keen mental discernment; wise.",
        helper: "Related to 'Sage'. Think of a wise old owl or a grandfather.",
        distractors: ["Quick to anger.", "Small and insignificant.", "Rough in texture."]
    },
    {
        word: "Ineffable",
        pronunciation: "/in-EF-uh-buhl/",
        origin: "Latin",
        definition: "Too great to be expressed in words.",
        helper: "The 'fable' part relates to speaking. Ineffable means 'cannot be fabled' or told.",
        distractors: ["Easily explained in a list.", "Lacking any real flavor.", "Stubborn and unmoving."]
    },
    {
        word: "Luminous",
        pronunciation: "/LOO-muh-nuhs/",
        origin: "Latin",
        definition: "Full of or shedding light; bright.",
        helper: "Think of 'Illumination' or a glowing firefly in the dark.",
        distractors: ["Cold and damp.", "Heavy and hard to carry.", "Very noisy and loud."]
    },
    {
        word: "Petrichor",
        pronunciation: "/PET-ri-kawr/",
        origin: "Greek",
        definition: "The smell of rain on dry ground.",
        helper: "The combination of 'petra' (stone) and 'ichor' (the blood of gods).",
        distractors: ["The sound of distant thunder.", "A fear of heavy storms.", "A very rare type of stone."]
    },
    {
        word: "Alacrity",
        pronunciation: "/uh-LAK-ri-tee/",
        origin: "Latin",
        definition: "Brisk and cheerful readiness.",
        helper: "Think of someone jumping to their feet to help with a smile.",
        distractors: ["A feeling of deep sadness.", "A state of total confusion.", "Slow and lazy movement."]
    },
    {
        word: "Sycophant",
        pronunciation: "/SI-kuh-funt/",
        origin: "Greek",
        definition: "A person who acts obsequiously to gain advantage.",
        helper: "A 'suck-up' who uses flattery to get what they want from powerful people.",
        distractors: ["A type of musical instrument.", "A professional athlete.", "A deep-sea diving bell."]
    }
];

let currentWord = null;
let correctCount = 0;
let streakCount = 0;

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

function initQuiz() {
    loadNewWord();
    
    nextBtn.addEventListener('click', loadNewWord);
    resetBtn.addEventListener('click', () => {
        correctCount = 0;
        streakCount = 0;
        updateStats();
        loadNewWord();
    });
}

function loadNewWord() {
    // Hide feedback
    feedbackEl.classList.add('hidden');
    
    // Select random word different from last one
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * wordBank.length);
    } while (wordBank[randomIndex] === currentWord);
    
    currentWord = wordBank[randomIndex];
    
    // Update UI
    targetWordEl.innerText = currentWord.word;
    originEl.innerText = currentWord.origin;
    pronunciationEl.innerText = currentWord.pronunciation;
    
    // Prepare options
    const options = [
        { text: currentWord.definition, correct: true },
        ...currentWord.distractors.map(d => ({ text: d, correct: false }))
    ];
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    // Render options
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
    // Disable all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        feedbackMsgEl.innerText = "✨ Correct!";
        feedbackMsgEl.style.color = "var(--accent-primary)";
        correctCount++;
        streakCount++;
    } else {
        selectedBtn.classList.add('wrong');
        feedbackMsgEl.innerText = "❌ Not quite.";
        feedbackMsgEl.style.color = "var(--accent-wrong)";
        streakCount = 0;
        
        // Highlight the correct answer
        buttons.forEach(btn => {
            if (btn.innerText === currentWord.definition) {
                btn.classList.add('correct');
            }
        });
    }
    
    // Show helper and feedback
    helperTextEl.innerText = currentWord.helper;
    feedbackEl.classList.remove('hidden');
    
    updateStats();
}

function updateStats() {
    correctCountEl.innerText = correctCount;
    streakCountEl.innerText = streakCount;
}

// Start the engine
document.addEventListener('DOMContentLoaded', initQuiz);
