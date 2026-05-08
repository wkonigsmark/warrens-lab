const abacus = document.querySelector("#abacus");
const valueStrip = document.querySelector("#valueStrip");
const totalLabel = document.querySelector("#totalLabel");
const totalValue = document.querySelector("#totalValue");
const columnCount = document.querySelector("#columnCount");
const resetButton = document.querySelector("#resetButton");
const quizButton = document.querySelector("#quizButton");
const mentorButton = document.querySelector("#mentorButton");
const mentorPanel = document.querySelector("#mentorPanel");
const lessonTitle = document.querySelector("#lessonTitle");
const lessonBody = document.querySelector("#lessonBody");
const lessonProgress = document.querySelector("#lessonProgress");
const prevLesson = document.querySelector("#prevLesson");
const nextLesson = document.querySelector("#nextLesson");
const submitQuiz = document.querySelector("#submitQuiz");

const placeCatalog = [
  { name: "ones", label: "Ones", shortLabel: "1s", value: 1 },
  { name: "tens", label: "Tens", shortLabel: "10s", value: 10 },
  { name: "hundreds", label: "Hundreds", shortLabel: "100s", value: 100 },
  { name: "thousands", label: "Thousands", shortLabel: "1K", value: 1000 },
  { name: "tenThousands", label: "10K", shortLabel: "10K", value: 10000 },
  { name: "hundredThousands", label: "100K", shortLabel: "100K", value: 100000 },
];

let places = placeCatalog.slice(0, Number(columnCount.value));

const layout = {
  upperHome: 15,
  upperActive: 25,
  lowerHomeTop: 55,
  lowerActiveTop: 43,
  lowerStep: 9,
};

const lessons = [
  {
    title: "Meet the Abacus",
    html: `
      <p>This is a simple Japanese-style abacus. Each rod is a place value: ones, tens, and hundreds.</p>
      <ul>
        <li>The bead above the middle bar is worth 5 of that place.</li>
        <li>Each bead below the middle bar is worth 1 of that place.</li>
        <li>Only beads touching the middle bar are counted.</li>
      </ul>
    `,
  },
  {
    title: "Start at Zero",
    html: `
      <p>Zero means every upper bead is pushed up, and every lower bead is pushed down.</p>
      <p>Press reset any time you want a clean board. That is your home position.</p>
    `,
  },
  {
    title: "Make Numbers 1 to 4",
    html: `
      <p>On the ones rod, move lower beads up toward the middle bar. One bead is 1, two beads are 2, and so on.</p>
      <p>Tip: drag the lowest bead in a pile and the beads above it move together.</p>
    `,
  },
  {
    title: "Make Five",
    html: `
      <p>To make 5, move the upper bead down to the middle bar.</p>
      <p>The upper bead is a shortcut. Instead of counting five separate beads, one motion means five.</p>
    `,
  },
  {
    title: "Make Six to Nine",
    html: `
      <p>Six is the upper bead plus one lower bead. Seven is the upper bead plus two lower beads.</p>
      <p>This is where quick math starts to feel physical: five plus a little more.</p>
    `,
  },
  {
    title: "Place Value",
    html: `
      <p>The tens rod works the same way, but every lower bead is worth 10 and the upper bead is worth 50.</p>
      <p>Every rod to the left works the same way again with a larger place value. The pattern repeats, which is why abacus math can become fast.</p>
    `,
  },
  {
    title: "How Addition Works",
    html: `
      <p>Addition is a story of adding beads to the value already on the abacus.</p>
      <p>Some additions are direct. To solve 2 + 1, make 2, then move one more lower bead toward the bar.</p>
      <p>Other additions need an exchange. For 3 + 2, make 3, then make 5 by bringing the upper bead down and clearing the three lower beads. The board shows 5.</p>
    `,
  },
  {
    title: "How Subtraction Works",
    html: `
      <p>Subtraction goes the other direction. You remove value by moving counted beads away from the middle bar.</p>
      <p>Some subtractions are direct. To solve 4 - 1, make 4, then move one lower bead away from the bar.</p>
      <p>When there are not enough lower beads to remove, the abacus uses an exchange. That is the next skill after Level 1 basics.</p>
    `,
  },
  {
    title: "Multiplication Idea",
    html: `
      <p>Multiplication starts as repeated addition. 3 x 2 means add 3 two times.</p>
      <p>At Level 1, think of it as rhythm: make 3, then add another 3. Later the abacus helps make those repeated steps faster.</p>
    `,
  },
  {
    title: "Division Idea",
    html: `
      <p>Division starts as fair sharing or repeated subtraction. 6 / 2 asks how many groups of 2 fit into 6.</p>
      <p>At Level 1, make 6, then take away 2, then take away 2, then take away 2. You made 3 groups.</p>
    `,
  },
];

let state = places.map(() => ({ upper: false, lower: 0 }));
let selectedBeads = new Set();
let lessonIndex = 0;
let drag = null;
let suppressNextClick = false;
let mentorMode = "lesson";
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let quizFeedback = "";
let quizComplete = false;
let quizTimerStarted = false;
let quizStartTime = 0;
let quizElapsedMs = 0;
let quizTimerId = null;
let quizTipVisible = false;
let quizTipTimeoutId = null;

function buildAbacus() {
  abacus.innerHTML = '<div class="divider" aria-hidden="true"></div>';
  abacus.dataset.columns = places.length;

  places.forEach((place, placeIndex) => {
    const x = getRodPosition(placeIndex);
    const rod = document.createElement("div");
    rod.className = "rod";
    rod.style.left = `${x}%`;
    abacus.appendChild(rod);

    const label = document.createElement("div");
    label.className = "place-label";
    label.style.left = `${x}%`;
    label.textContent = place.label;
    label.dataset.shortLabel = place.shortLabel;
    label.setAttribute("aria-label", place.label);
    abacus.appendChild(label);

    const upper = createBead(placeIndex, "upper", 0);
    upper.style.left = `${x}%`;
    abacus.appendChild(upper);

    for (let beadIndex = 0; beadIndex < 4; beadIndex += 1) {
      const bead = createBead(placeIndex, "lower", beadIndex);
      bead.style.left = `${x}%`;
      abacus.appendChild(bead);
    }
  });

  render();
}

function getRodPosition(placeIndex) {
  const leftPad = getRodPad();
  const rightPad = getRodPad();
  const span = 100 - leftPad - rightPad;
  return places.length === 1
    ? 50
    : leftPad + (span / (places.length - 1)) * placeIndex;
}

function getRodPad() {
  if (places.length >= 6) return 9;
  if (places.length === 5) return 11;
  if (places.length === 4) return 13;
  if (places.length === 2) return 32;
  return 22;
}

function createBead(placeIndex, section, beadIndex) {
  const bead = document.createElement("button");
  bead.type = "button";
  bead.className = `bead ${section}`;
  bead.dataset.place = placeIndex;
  bead.dataset.section = section;
  bead.dataset.index = beadIndex;
  bead.setAttribute("aria-label", `${places[placeIndex].label} ${section} bead`);
  bead.addEventListener("pointerdown", startDrag);
  bead.addEventListener("click", toggleSelection);
  return bead;
}

function render() {
  places.forEach((place, placeIndex) => {
    const placeState = state[placeIndex];
    const upper = getBead(placeIndex, "upper", 0);
    upper.style.top = `${placeState.upper ? layout.upperActive : layout.upperHome}%`;

    for (let beadIndex = 0; beadIndex < 4; beadIndex += 1) {
      const bead = getBead(placeIndex, "lower", beadIndex);
      const active = beadIndex < placeState.lower;
      bead.style.top = `${getLowerTop(beadIndex, active)}%`;
    }
  });

  renderTotal();
  updateSelectionStyles();
}

function renderTotal() {
  valueStrip.classList.toggle("quiz-active", mentorMode === "quiz");
  totalLabel.textContent = mentorMode === "quiz" ? "Quiz total" : "Total";
  totalValue.textContent = mentorMode === "quiz" ? "Hidden" : calculateTotal().toLocaleString();
}

function calculateTotal() {
  return state.reduce((sum, placeState, index) => {
    const placeValue = places[index].value;
    return sum + placeState.lower * placeValue + (placeState.upper ? 5 * placeValue : 0);
  }, 0);
}

function getBead(placeIndex, section, beadIndex) {
  return abacus.querySelector(
    `.bead[data-place="${placeIndex}"][data-section="${section}"][data-index="${beadIndex}"]`
  );
}

function startDrag(event) {
  event.preventDefault();
  startQuizTimerOnFirstMove();
  const bead = event.currentTarget;
  const placeIndex = Number(bead.dataset.place);
  const section = bead.dataset.section;
  const beadIndex = Number(bead.dataset.index);
  const initialTops = getInitialTops(placeIndex);

  drag = {
    bead,
    placeIndex,
    section,
    beadIndex,
    startY: event.clientY,
    moved: false,
    frameHeight: abacus.getBoundingClientRect().height,
    direction: null,
    initialTops,
    movingBeads: [],
  };

  bead.setPointerCapture(event.pointerId);
  bead.classList.add("dragging");
  setMovingGroup(null);
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag, { once: true });
}

function moveDrag(event) {
  if (!drag) return;
  const deltaY = event.clientY - drag.startY;
  const deltaPercent = (deltaY / drag.frameHeight) * 100;

  if (Math.abs(deltaY) > 5) {
    drag.moved = true;
    const direction = deltaY < 0 ? "up" : "down";
    if (drag.direction !== direction) {
      setMovingGroup(direction);
    }
  }

  drag.movingBeads.forEach((item) => {
    const nextTop = clamp(item.startTop + deltaPercent, item.minTop, item.maxTop);
    item.bead.style.top = `${nextTop}%`;
  });
}

function endDrag(event) {
  if (!drag) return;

  const { placeIndex, section, beadIndex, bead } = drag;
  bead.classList.remove("dragging");
  drag.movingBeads.forEach((item) => item.bead.classList.remove("live-drag"));
  clearGroupMarks();

  if (drag.moved) {
    suppressNextClick = true;
    if (section === "upper") {
      const currentTop = parseFloat(bead.style.top);
      state[placeIndex].upper = currentTop >= (layout.upperHome + layout.upperActive) / 2;
    } else {
      const currentTop = parseFloat(bead.style.top);
      const beadMidpoint = (getLowerTop(beadIndex, true) + getLowerTop(beadIndex, false)) / 2;
      state[placeIndex].lower = currentTop <= beadMidpoint
        ? Math.max(state[placeIndex].lower, beadIndex + 1)
        : Math.min(state[placeIndex].lower, beadIndex);
    }
    selectedBeads.clear();
  }

  drag = null;
  window.removeEventListener("pointermove", moveDrag);
  render();
}

function setMovingGroup(direction) {
  if (!drag) return;

  clearGroupMarks();
  drag.movingBeads.forEach((item) => item.bead.classList.remove("live-drag"));
  drag.direction = direction;
  drag.movingBeads = getMovingBeads(drag.placeIndex, drag.section, drag.beadIndex, direction)
    .map((movingBead) => ({
      bead: movingBead,
      startTop: drag.initialTops.get(beadKey(movingBead)),
      minTop: getBeadLimit(movingBead, "min"),
      maxTop: getBeadLimit(movingBead, "max"),
    }));
  drag.movingBeads.forEach((item) => item.bead.classList.add("live-drag"));
  markGroup(drag.placeIndex, drag.section, drag.beadIndex, direction);
}

function getMovingBeads(placeIndex, section, beadIndex, direction) {
  if (section === "upper") {
    return [getBead(placeIndex, section, beadIndex)];
  }

  if (direction === "down" && beadIndex < state[placeIndex].lower) {
    return getLowerBeadRange(placeIndex, beadIndex, state[placeIndex].lower - 1);
  }

  if (direction === "up" && beadIndex >= state[placeIndex].lower) {
    return getLowerBeadRange(placeIndex, state[placeIndex].lower, beadIndex);
  }

  return [getBead(placeIndex, "lower", beadIndex)];
}

function getLowerBeadRange(placeIndex, startIndex, endIndex) {
  const beads = [];
  for (let index = startIndex; index <= endIndex; index += 1) {
    beads.push(getBead(placeIndex, "lower", index));
  }
  return beads;
}

function getInitialTops(placeIndex) {
  const tops = new Map();
  const upper = getBead(placeIndex, "upper", 0);
  tops.set(beadKey(upper), parseFloat(upper.style.top));

  for (let beadIndex = 0; beadIndex < 4; beadIndex += 1) {
    const bead = getBead(placeIndex, "lower", beadIndex);
    tops.set(beadKey(bead), parseFloat(bead.style.top));
  }
  return tops;
}

function getBeadLimit(bead, limit) {
  const section = bead.dataset.section;
  const beadIndex = Number(bead.dataset.index);

  if (section === "upper") {
    return limit === "min" ? layout.upperHome : layout.upperActive;
  }

  return limit === "min" ? getLowerTop(beadIndex, true) : getLowerTop(beadIndex, false);
}

function getLowerTop(beadIndex, active) {
  return active
    ? layout.lowerActiveTop + beadIndex * layout.lowerStep
    : layout.lowerHomeTop + beadIndex * layout.lowerStep;
}

function markGroup(placeIndex, section, beadIndex, direction) {
  if (section === "upper") return;

  getMovingBeads(placeIndex, section, beadIndex, direction)
    .forEach((bead) => bead.classList.add("group-moving"));
}

function clearGroupMarks() {
  abacus.querySelectorAll(".group-moving").forEach((bead) => bead.classList.remove("group-moving"));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toggleSelection(event) {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  startQuizTimerOnFirstMove();
  const bead = event.currentTarget;
  const key = beadKey(bead);

  if (selectedBeads.has(key)) {
    selectedBeads.delete(key);
  } else {
    selectedBeads.add(key);
  }

  updateSelectionStyles();
}

function beadKey(bead) {
  return `${bead.dataset.place}:${bead.dataset.section}:${bead.dataset.index}`;
}

function updateSelectionStyles() {
  abacus.querySelectorAll(".bead").forEach((bead) => {
    bead.classList.toggle("selected", selectedBeads.has(beadKey(bead)));
  });
}

function renderLesson() {
  mentorMode = "lesson";
  stopQuizTimer();
  hideQuizTip();
  renderTotal();
  quizButton.classList.remove("active");
  quizButton.setAttribute("aria-pressed", "false");
  prevLesson.classList.remove("mentor-hidden");
  nextLesson.classList.remove("mentor-hidden");
  submitQuiz.classList.add("mentor-hidden");

  const lesson = lessons[lessonIndex];
  lessonTitle.textContent = lesson.title;
  lessonBody.innerHTML = lesson.html;
  lessonProgress.innerHTML = lessons
    .map((_, index) => `<span class="dot ${index === lessonIndex ? "active" : ""}"></span>`)
    .join("");
  prevLesson.disabled = lessonIndex === 0;
  nextLesson.textContent = lessonIndex === lessons.length - 1 ? "Done" : "Next";
}

function startQuiz() {
  mentorMode = "quiz";
  quizQuestions = buildQuizQuestions();
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  quizFeedback = "";
  quizComplete = false;
  quizTimerStarted = false;
  quizStartTime = 0;
  quizElapsedMs = 0;
  stopQuizTimer();
  showQuizTipBriefly();
  selectedBeads.clear();
  resetAbacus();
  mentorPanel.classList.remove("mentor-hidden");
  mentorButton.classList.add("active");
  mentorButton.setAttribute("aria-pressed", "true");
  quizButton.classList.add("active");
  quizButton.setAttribute("aria-pressed", "true");
  renderQuiz();
}

function toggleQuiz() {
  if (mentorMode === "quiz") {
    exitQuiz();
    return;
  }

  startQuiz();
}

function exitQuiz() {
  stopQuizTimer();
  hideQuizTip();
  quizComplete = false;
  quizTimerStarted = false;
  quizElapsedMs = 0;
  quizFeedback = "";
  selectedBeads.clear();
  resetAbacus();
  mentorPanel.classList.remove("mentor-hidden");
  mentorButton.classList.add("active");
  mentorButton.setAttribute("aria-pressed", "true");
  renderLesson();
}


function buildQuizQuestions() {
  const maxValue = getQuizMaxValue();
  const minValue = getQuizMinValue(maxValue);
  const targets = new Set();

  while (targets.size < 3) {
    targets.add(randomInteger(minValue, maxValue));
  }

  return [...targets]
    .map((target) => ({
      prompt: `Make the number ${target.toLocaleString()}.`,
      answer: target,
    }));
}

function getQuizMaxValue() {
  return 10 ** places.length - 1;
}

function getQuizMinValue(maxValue) {
  if (places.length === 1) return 1;
  return Math.max(1, Math.floor(maxValue * 0.1));
}

function randomInteger(minValue, maxValue) {
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function renderQuiz() {
  mentorMode = "quiz";
  renderTotal();
  prevLesson.classList.add("mentor-hidden");
  nextLesson.classList.add("mentor-hidden");
  submitQuiz.classList.toggle("mentor-hidden", quizComplete);
  lessonProgress.innerHTML = quizQuestions
    .map((_, index) => `<span class="dot ${index === quizIndex ? "active" : ""}"></span>`)
    .join("");

  const question = quizQuestions[quizIndex];
  lessonTitle.textContent = quizComplete ? "Quiz Complete" : `Quiz ${quizIndex + 1} of ${quizQuestions.length}`;

  if (quizComplete) {
    lessonBody.innerHTML = `
      <p class="quiz-score">Score: ${quizScore} of ${quizQuestions.length}</p>
      <div class="quiz-time">Final time: ${formatElapsedTime(quizElapsedMs)}</div>
      <p>You finished the speed round. Press Quiz to try a fresh set.</p>
      <p class="quiz-hint-small">Remember to press Enter to submit your answer.</p>
      ${quizFeedback}
    `;
    return;
  }

  lessonBody.innerHTML = `
    <p class="quiz-score">Score: ${quizScore} of ${quizQuestions.length}</p>
    <div class="quiz-timer">Time: ${formatElapsedTime(quizElapsedMs)}</div>
    ${quizTipVisible ? '<div class="quiz-tip">Timer starts when you move the first bead. Press Enter to submit.</div>' : ""}
    <p>${question.prompt}</p>
    <p>The total is hidden, so use the visible columns and trust the beads.</p>
    ${quizFeedback}
  `;
}

function submitQuizAnswer() {
  if (mentorMode !== "quiz" || quizComplete) return;

  const currentValue = calculateTotal();
  const question = quizQuestions[quizIndex];
  const correct = currentValue === question.answer;

  if (correct) {
    quizScore += 1;
    quizFeedback = "";
    advanceQuizAfterCorrect();
  } else {
    quizFeedback = `<div class="quiz-feedback try-again">Good try. This board shows ${currentValue.toLocaleString()}; the target was ${question.answer.toLocaleString()}.</div>`;
    renderQuiz();
  }
}

function advanceQuizAfterCorrect() {
  if (quizIndex === quizQuestions.length - 1) {
    completeQuiz();
    return;
  }
  quizIndex += 1;
  quizAnswered = false;
  quizFeedback = "";
  resetAbacus();
  renderQuiz();
}

function completeQuiz() {
  quizComplete = true;
  quizElapsedMs = quizTimerStarted ? Date.now() - quizStartTime : 0;
  stopQuizTimer();
  hideQuizTip();
  resetAbacus();
  renderQuiz();
}

function startQuizTimerOnFirstMove() {
  if (mentorMode !== "quiz" || quizTimerStarted || quizComplete) return;

  hideQuizTip();
  quizTimerStarted = true;
  quizStartTime = Date.now();
  quizElapsedMs = 0;
  quizTimerId = window.setInterval(() => {
    quizElapsedMs = Date.now() - quizStartTime;
    if (mentorMode === "quiz" && !quizComplete) {
      renderQuiz();
    }
  }, 250);
  renderQuiz();
}

function stopQuizTimer() {
  if (!quizTimerId) return;

  window.clearInterval(quizTimerId);
  quizTimerId = null;
}

function showQuizTipBriefly() {
  hideQuizTip();
  quizTipVisible = true;
  quizTipTimeoutId = window.setTimeout(() => {
    quizTipVisible = false;
    quizTipTimeoutId = null;
    if (mentorMode === "quiz" && !quizTimerStarted && !quizComplete) {
      renderQuiz();
    }
  }, 4500);
}

function hideQuizTip() {
  quizTipVisible = false;
  if (!quizTipTimeoutId) return;

  window.clearTimeout(quizTipTimeoutId);
  quizTipTimeoutId = null;
}

function formatElapsedTime(milliseconds) {
  const totalTenths = Math.floor(milliseconds / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`
    : `${seconds}.${tenths}s`;
}

function resetAbacus() {
  state = places.map(() => ({ upper: false, lower: 0 }));
  selectedBeads.clear();
  render();
}

function updateColumnCount() {
  places = placeCatalog.slice(0, Number(columnCount.value));
  state = places.map(() => ({ upper: false, lower: 0 }));
  selectedBeads.clear();
  drag = null;
  buildAbacus();
  if (mentorMode === "quiz") {
    startQuiz();
  }
}

resetButton.addEventListener("click", (event) => {
  event.currentTarget.blur();
  resetAbacus();
});

columnCount.addEventListener("change", updateColumnCount);

quizButton.addEventListener("click", (event) => {
  event.currentTarget.blur();
  toggleQuiz();
});

mentorButton.addEventListener("click", (event) => {
  event.currentTarget.blur();
  const hidden = mentorPanel.classList.toggle("mentor-hidden");
  mentorButton.classList.toggle("active", !hidden);
  mentorButton.setAttribute("aria-pressed", String(!hidden));
});

prevLesson.addEventListener("click", () => {
  lessonIndex = Math.max(0, lessonIndex - 1);
  renderLesson();
});

function advanceLesson() {
  if (lessonIndex === lessons.length - 1) {
    mentorPanel.classList.add("mentor-hidden");
    mentorButton.classList.remove("active");
    mentorButton.setAttribute("aria-pressed", "false");
    return;
  }
  lessonIndex += 1;
  renderLesson();
}

nextLesson.addEventListener("click", advanceLesson);

submitQuiz.addEventListener("click", submitQuizAnswer);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;

  if (document.activeElement === columnCount) return;

  if (mentorMode === "quiz" && !quizComplete) {
    event.preventDefault();
    submitQuizAnswer();
    return;
  }

  if (mentorMode === "lesson" && !mentorPanel.classList.contains("mentor-hidden")) {
    event.preventDefault();
    advanceLesson();
  }
});

buildAbacus();
renderLesson();
