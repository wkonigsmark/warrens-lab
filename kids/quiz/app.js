(function () {
  const questionText = document.getElementById("questionText");
  const choicesBox = document.getElementById("choices");
  const catPill = document.getElementById("catPill");
  const revealBox = document.getElementById("revealBox");
  const revealAnswer = document.getElementById("revealAnswer");
  const nextBtn = document.getElementById("nextBtn");
  const streakEl = document.getElementById("streak");
  const celebrateEl = document.getElementById("celebrate");

  const CELEBRATIONS = ["🎉", "⭐️", "🙌", "🏆", "✨", "🥳"];

  let level = 1;      // 1..5, ramps up slowly as questions are answered
  let streak = 0;
  let used = new Set();
  let current = null;

  function pickQuestion() {
    const ceilLevel = Math.min(5, Math.ceil(level) + 1);
    let pool = QUESTIONS.filter((q) => q.diff <= ceilLevel && !used.has(q));
    if (pool.length === 0) {
      used.clear();
      pool = QUESTIONS.filter((q) => q.diff <= ceilLevel);
    }
    // weight toward questions near the current level
    const weighted = [];
    pool.forEach((q) => {
      const distance = Math.abs(q.diff - level);
      const weight = Math.max(1, 4 - Math.round(distance));
      for (let i = 0; i < weight; i++) weighted.push(q);
    });
    const choice = weighted[Math.floor(Math.random() * weighted.length)];
    used.add(choice);
    return choice;
  }

  function shuffledChoices(q) {
    const arr = [...q.choices];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function render() {
    current = pickQuestion();
    catPill.textContent = current.cat;
    questionText.textContent = current.q;
    choicesBox.innerHTML = "";
    revealBox.hidden = true;
    nextBtn.hidden = true;

    if (current.type === "mc") {
      shuffledChoices(current).forEach((choice) => {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = choice;
        btn.onclick = () => handleAnswer(btn, choice === current.answer);
        choicesBox.appendChild(btn);
      });
    } else if (current.type === "tf") {
      ["True", "False"].forEach((choice) => {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = choice;
        btn.onclick = () => handleAnswer(btn, choice === current.answer);
        choicesBox.appendChild(btn);
      });
    } else {
      const btn = document.createElement("button");
      btn.className = "btn reveal-btn";
      btn.textContent = "Show answer";
      btn.onclick = () => {
        btn.hidden = true;
        revealBox.hidden = false;
        revealAnswer.textContent = current.answer || "(open-ended — nice job!)";
        nextBtn.hidden = false;
        bumpLevel();
      };
      choicesBox.appendChild(btn);
    }
  }

  function handleAnswer(btn, isCorrect) {
    [...choicesBox.children].forEach((b) => (b.onclick = null));
    if (isCorrect) {
      btn.classList.add("correct");
      streak += 1;
      celebrate();
    } else {
      btn.classList.add("incorrect");
      streak = 0;
      [...choicesBox.children].forEach((b) => {
        if (b.textContent === current.answer) b.classList.add("correct");
      });
    }
    [...choicesBox.children].forEach((b) => {
      if (b !== btn && b.textContent !== current.answer) b.classList.add("dim");
    });
    streakEl.textContent = `🔥 ${streak}`;
    nextBtn.hidden = false;
    bumpLevel();
  }

  function bumpLevel() {
    level = Math.min(5, level + 0.2);
  }

  function celebrate() {
    const emoji = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
    celebrateEl.textContent = emoji;
    celebrateEl.hidden = false;
    celebrateEl.style.animation = "none";
    void celebrateEl.offsetWidth;
    celebrateEl.style.animation = "pop 0.6s ease forwards";
    setTimeout(() => (celebrateEl.hidden = true), 600);
  }

  nextBtn.onclick = render;

  render();
})();
