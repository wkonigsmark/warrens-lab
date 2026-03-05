/**
 * Lexicon Vocabulary Engine - Custom Curriculum: Version 1 (Strategic & Historical)
 */

const wordBank = [
    {
        word: "Magnanimous",
        pronunciation: "/mag-NAN-i-muhs/",
        origin: "Latin",
        definition: "Showing a noble spirit and being generous toward rivals.",
        helper: "Think of a Chess Champion who is kind to the person they just beat. It’s about being 'Big-Minded'.",
        distractors: ["Feeling extremely angry and yelling at an opponent.", "Having a very small amount of money or resources.", "Moving in a repetitive circular motion for hours."]
    },
    {
        word: "Tactician",
        pronunciation: "/tak-TISH-uhn/",
        origin: "Greek",
        definition: "A person who is highly skilled at planning a strategy.",
        helper: "This is you when you're calling an audible on the football field or planning three moves ahead in Chess.",
        distractors: ["A professional who builds houses out of wood.", "Someone who is always late to their appointments.", "A specific tool used for measuring loud noises."]
    },
    {
        word: "Hegemony",
        pronunciation: "/hi-JEM-uh-nee/",
        origin: "Greek",
        definition: "Leadership or dominance of one group over all others.",
        helper: "Think of how Sparta had 'Hegemony' over the other Greek cities because of their superior army.",
        distractors: ["A type of garden hedge used for privacy fences.", "A mathematical equation with several variables.", "A feeling of deep confusion about a hard subject."]
    },
    {
        word: "Stoic",
        pronunciation: "/STOH-ik/",
        origin: "Greek",
        definition: "Enduring hardship without showing feelings or complaint.",
        helper: "A great athlete stays Stoic. They don't let the other team see them get frustrated when they lose a play.",
        distractors: ["A person who talks too much in social settings.", "Something that is very sharp or painful to touch.", "Moving very quickly through a crowded area."]
    },
    {
        word: "Analytical",
        pronunciation: "/an-uh-LIT-i-kuhl/",
        origin: "Greek",
        definition: "Using logical reasoning to break down complex problems.",
        helper: "This is the 'Math Brain.' You use this to solve equations or deconstruct a chess opponent's defense.",
        distractors: ["Feeling very sleepy after a long day of school.", "Related to ancient sea creatures from the abyss.", "Something that is very colorful and hard to miss."]
    },
    {
        word: "Resilience",
        pronunciation: "/ri-ZIL-yuhns/",
        origin: "Latin",
        definition: "The ability to recover quickly from difficult setbacks.",
        helper: "In football, if you drop a pass but catch the next touchdown, that’s resilience. You bounce back.",
        distractors: ["A type of very soft metal found in the earth.", "The act of hiding the truth from your parents.", "A state of permanent rest and total relaxation."]
    },
    {
        word: "Antiquity",
        pronunciation: "/an-TIK-wi-tee/",
        origin: "Latin",
        definition: "The ancient past, especially before the Middle Ages.",
        helper: "This covers the Greek and Roman timelines you're studying—the 'Old World' of great empires.",
        distractors: ["A modern city with skyscrapers and fast cars.", "A feeling of being very nervous about a big test.", "A type of fast-growing plant found in jungles."]
    },
    {
        word: "Strategic",
        pronunciation: "/struh-TEE-jik/",
        origin: "Greek",
        definition: "Relating to long-term aims and the means to hit them.",
        helper: "The 'Long Game.' It’s the difference between winning one play and winning the whole championship.",
        distractors: ["Happening by total accident without any warning.", "Something that is very loud and hurts the ears.", "A type of cooking style used in fancy kitchens."]
    },
    {
        word: "Calculated",
        pronunciation: "/KAL-kyuh-lay-ted/",
        origin: "Latin",
        definition: "Done with full awareness of the likely consequences.",
        helper: "Like a 'Calculated Risk' in Math or Chess. You knew exactly what might happen before you did it.",
        distractors: ["Feeling very cold during a snowy winter night.", "A mistake made in a hurry while doing homework.", "The sound of a heavy bell ringing in a tower."]
    },
    {
        word: "Audible",
        pronunciation: "/AW-di-buhl/",
        origin: "Latin",
        definition: "Able to be heard or a last-minute change in plans.",
        helper: "Just like the QB changing the play at the line of scrimmage because he saw something in the defense.",
        distractors: ["Completely invisible to the naked human eye.", "Something that tastes very bitter like a lemon.", "A type of heavy rock found near active volcanoes."]
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
