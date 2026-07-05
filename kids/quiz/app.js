(function () {
  const questionText = document.getElementById("questionText");
  const choicesBox = document.getElementById("choices");
  const catPill = document.getElementById("catPill");
  const revealBox = document.getElementById("revealBox");
  const revealAnswer = document.getElementById("revealAnswer");
  const nextBtn = document.getElementById("nextBtn");
  const streakEl = document.getElementById("streak");
  const celebrateEl = document.getElementById("celebrate");
  const subjectsEl = document.getElementById("subjects");
  const diffDotsEl = document.getElementById("diffDots");
  const easierBtn = document.getElementById("easierBtn");
  const harderBtn = document.getElementById("harderBtn");

  const CELEBRATIONS = ["🎉", "⭐️", "🙌", "🏆", "✨", "🥳"];

  let level = 1.5;    // 1..5, self-tunes based on right/wrong answers; nudge with Easier/Harder
  let streak = 0;
  let used = new Set();
  let current = null;
  let activeSubject = "All";

  function renderSubjects() {
    const subjects = ["All", ...new Set(QUESTIONS.map((q) => q.cat))];
    subjectsEl.innerHTML = "";
    subjects.forEach((subject) => {
      const btn = document.createElement("button");
      btn.className = "subject-btn" + (subject === activeSubject ? " active" : "");
      btn.textContent = subject;
      btn.onclick = () => {
        if (activeSubject === subject) return;
        activeSubject = subject;
        used.clear();
        renderSubjects();
        render();
      };
      subjectsEl.appendChild(btn);
    });
  }

  function renderDifficulty() {
    diffDotsEl.innerHTML = "";
    const filled = Math.round(level);
    for (let i = 1; i <= 5; i++) {
      const dot = document.createElement("span");
      dot.className = "diff-dot" + (i <= filled ? " filled" : "");
      diffDotsEl.appendChild(dot);
    }
  }

  function setLevel(newLevel) {
    level = Math.max(1, Math.min(5, newLevel));
    renderDifficulty();
  }

  function pickQuestion() {
    const ceilLevel = Math.min(5, Math.ceil(level) + 1);
    const floorLevel = Math.max(1, Math.floor(level) - 1);
    const bySubject = activeSubject === "All"
      ? QUESTIONS
      : QUESTIONS.filter((q) => q.cat === activeSubject);
    let pool = bySubject.filter((q) => q.diff <= ceilLevel && q.diff >= floorLevel && !used.has(q));
    if (pool.length === 0) {
      used.clear();
      pool = bySubject.filter((q) => q.diff <= ceilLevel && q.diff >= floorLevel);
    }
    if (pool.length === 0) {
      pool = bySubject.filter((q) => !used.has(q));
    }
    if (pool.length === 0) {
      used.clear();
      pool = bySubject;
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
      setLevel(level + 0.3);
    } else {
      btn.classList.add("incorrect");
      streak = 0;
      [...choicesBox.children].forEach((b) => {
        if (b.textContent === current.answer) b.classList.add("correct");
      });
      setLevel(level - 0.5);
    }
    [...choicesBox.children].forEach((b) => {
      if (b !== btn && b.textContent !== current.answer) b.classList.add("dim");
    });
    streakEl.textContent = `🔥 ${streak}`;
    nextBtn.hidden = false;
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
  easierBtn.onclick = () => setLevel(level - 1);
  harderBtn.onclick = () => setLevel(level + 1);

  renderSubjects();
  renderDifficulty();
  render();
})();
