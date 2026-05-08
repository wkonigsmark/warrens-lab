const boardEl = document.querySelector("#board");
const gridSizeEl = document.querySelector("#gridSize");
const difficultyEl = document.querySelector("#difficulty");
const newPuzzleButton = document.querySelector("#newPuzzle");
const checkPuzzleButton = document.querySelector("#checkPuzzle");
const resetPuzzleButton = document.querySelector("#resetPuzzle");
const printWorksheetButton = document.querySelector("#printWorksheet");
const statusStrip = document.querySelector("#statusStrip");
const statusText = document.querySelector("#statusText");
const timerText = document.querySelector("#timerText");
const numberPad = document.querySelector("#numberPad");
const printSheet = document.querySelector("#printSheet");
const notesPopover = document.querySelector("#notesPopover");
const notesPopoverGrid = document.querySelector("#notesPopoverGrid");
const notesDone = document.querySelector("#notesDone");

const gridConfigs = {
  4: { size: 4, boxRows: 2, boxCols: 2, clues: { beginner: 11, easy: 9, medium: 7, hard: 5 } },
  6: { size: 6, boxRows: 2, boxCols: 3, clues: { beginner: 26, easy: 22, medium: 18, hard: 14 } },
  9: { size: 9, boxRows: 3, boxCols: 3, clues: { beginner: 46, easy: 40, medium: 34, hard: 30 } },
};

let config = gridConfigs[4];
let values = getValues(config.size);
let puzzle = [];
let solution = [];
let playerGrid = [];
let notesGrid = [];
let selectedIndex = null;
let notesIndex = null;
let timerStarted = false;
let timerStopped = false;
let timerStartTime = 0;
let elapsedMs = 0;
let timerId = null;

function startGame() {
  config = gridConfigs[Number(gridSizeEl.value)];
  values = getValues(config.size);
  resetTimer();

  const generated = generatePuzzle(difficultyEl.value);
  puzzle = generated.puzzle;
  solution = generated.solution;
  playerGrid = puzzle.slice();
  notesGrid = createEmptyNotesGrid();
  selectedIndex = null;
  closeNotesPopover();
  renderNumberPad();
  renderBoard();
  setStatus(`Fill each row, column, and ${config.boxRows}x${config.boxCols} box with 1-${config.size}.`);
}

function generatePuzzle(difficulty) {
  const solved = generateSolvedBoard();
  const targetClues = config.clues[difficulty] || config.clues.beginner;
  const puzzleCandidate = solved.slice();
  const order = shuffle([...Array(config.size * config.size).keys()]);

  for (const index of order) {
    const filledCount = puzzleCandidate.filter(Boolean).length;
    if (filledCount <= targetClues) break;

    const previous = puzzleCandidate[index];
    puzzleCandidate[index] = 0;

    if (countSolutions(puzzleCandidate) !== 1) {
      puzzleCandidate[index] = previous;
    }
  }

  return {
    puzzle: puzzleCandidate,
    solution: solved,
  };
}

function generateSolvedBoard() {
  const grid = Array(config.size * config.size).fill(0);
  fillGrid(grid);
  return grid;
}

function fillGrid(grid) {
  const index = findEmptyWithFewestCandidates(grid);
  if (index === -1) return true;

  for (const value of shuffle(getCandidates(grid, index))) {
    grid[index] = value;
    if (fillGrid(grid)) return true;
    grid[index] = 0;
  }

  return false;
}

function countSolutions(grid) {
  const working = grid.slice();
  let count = 0;

  function solve() {
    if (count > 1) return;
    const index = findEmptyWithFewestCandidates(working);
    if (index === -1) {
      count += 1;
      return;
    }

    for (const value of getCandidates(working, index)) {
      working[index] = value;
      solve();
      working[index] = 0;
    }
  }

  solve();
  return count;
}

function findEmptyWithFewestCandidates(grid) {
  let bestIndex = -1;
  let bestCandidates = null;

  for (let index = 0; index < grid.length; index += 1) {
    if (grid[index] !== 0) continue;

    const candidates = getCandidates(grid, index);
    if (candidates.length === 0) return index;
    if (!bestCandidates || candidates.length < bestCandidates.length) {
      bestIndex = index;
      bestCandidates = candidates;
    }
  }

  return bestIndex;
}

function getCandidates(grid, index) {
  return values.filter((value) => canPlace(grid, index, value));
}

function canPlace(grid, index, value) {
  const row = Math.floor(index / config.size);
  const col = index % config.size;
  const boxRow = Math.floor(row / config.boxRows) * config.boxRows;
  const boxCol = Math.floor(col / config.boxCols) * config.boxCols;

  for (let nextCol = 0; nextCol < config.size; nextCol += 1) {
    if (grid[row * config.size + nextCol] === value) return false;
  }

  for (let nextRow = 0; nextRow < config.size; nextRow += 1) {
    if (grid[nextRow * config.size + col] === value) return false;
  }

  for (let rowOffset = 0; rowOffset < config.boxRows; rowOffset += 1) {
    for (let colOffset = 0; colOffset < config.boxCols; colOffset += 1) {
      const boxIndex = (boxRow + rowOffset) * config.size + boxCol + colOffset;
      if (grid[boxIndex] === value) return false;
    }
  }

  return true;
}

function renderBoard() {
  boardEl.innerHTML = "";
  boardEl.style.setProperty("--grid-size", config.size);
  boardEl.dataset.size = config.size;
  boardEl.setAttribute("aria-label", `${config.size} by ${config.size} Sudoku board`);

  playerGrid.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = index;
    cell.setAttribute("aria-label", getCellLabel(index, value));
    renderCellContent(cell, value, index);
    applyBoxBorders(cell, index);

    if (puzzle[index] !== 0) {
      cell.classList.add("given");
    }

    if (index === selectedIndex) {
      cell.classList.add("selected");
    } else if (selectedIndex !== null && isPeer(index, selectedIndex)) {
      cell.classList.add("peer");
    }

    if (value && hasConflict(index, value)) {
      cell.classList.add("conflict");
    }

    cell.addEventListener("click", (event) => {
      selectCell(index);
      if (event.detail >= 2) {
        openNotesPopover(index, event.currentTarget);
      }
    });
    cell.addEventListener("dblclick", (event) => openNotesPopover(index, event.currentTarget));
    cell.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openNotesPopover(index, event.currentTarget);
    });
    boardEl.appendChild(cell);
  });
}

function applyBoxBorders(cell, index) {
  const row = Math.floor(index / config.size);
  const col = index % config.size;
  const boxRowIndex = Math.floor(row / config.boxRows);
  const boxColIndex = Math.floor(col / config.boxCols);

  if ((boxRowIndex + boxColIndex) % 2 === 1) {
    cell.classList.add("shaded-box");
  }

  if ((col + 1) % config.boxCols === 0 && col !== config.size - 1) {
    cell.classList.add("box-right");
  }

  if ((row + 1) % config.boxRows === 0 && row !== config.size - 1) {
    cell.classList.add("box-bottom");
  }
}

function renderCellContent(cell, value, index) {
  cell.innerHTML = "";

  if (value) {
    cell.textContent = value;
    return;
  }

  const notes = notesGrid[index] || [];
  if (!notes.length) return;

  const notesEl = document.createElement("span");
  notesEl.className = "cell-notes";
  notesEl.style.setProperty("--note-columns", getNoteColumns());

  values.forEach((candidate) => {
    const note = document.createElement("span");
    note.textContent = notes.includes(candidate) ? candidate : "";
    notesEl.appendChild(note);
  });

  cell.appendChild(notesEl);
}

function openNotesPopover(index, cell) {
  if (puzzle[index] !== 0 || playerGrid[index] !== 0) return;

  startTimer();
  selectedIndex = index;
  notesIndex = index;
  renderBoard();
  renderNotesPopover();

  const rect = cell.getBoundingClientRect();
  const popoverWidth = Math.min(260, window.innerWidth - 24);
  const left = Math.min(window.innerWidth - popoverWidth - 12, Math.max(12, rect.left + rect.width / 2 - popoverWidth / 2));
  const top = Math.min(window.innerHeight - 210, rect.bottom + 8);

  notesPopover.style.width = `${popoverWidth}px`;
  notesPopover.style.left = `${left}px`;
  notesPopover.style.top = `${Math.max(12, top)}px`;
  notesPopover.hidden = false;
}

function renderNotesPopover() {
  notesPopoverGrid.innerHTML = "";
  notesPopoverGrid.style.setProperty("--note-columns", getNoteColumns());
  const notes = notesGrid[notesIndex] || [];

  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.note = value;
    button.textContent = value;
    button.classList.toggle("active", notes.includes(value));
    notesPopoverGrid.appendChild(button);
  });
}

function toggleNote(value) {
  if (notesIndex === null || puzzle[notesIndex] !== 0 || playerGrid[notesIndex] !== 0) return;

  const notes = new Set(notesGrid[notesIndex]);
  if (notes.has(value)) {
    notes.delete(value);
  } else {
    notes.add(value);
  }

  notesGrid[notesIndex] = values.filter((candidate) => notes.has(candidate));
  renderNotesPopover();
}

function closeNotesPopover() {
  const shouldRender = notesIndex !== null;
  notesIndex = null;
  if (notesPopover) {
    notesPopover.hidden = true;
  }
  if (shouldRender && playerGrid.length) {
    renderBoard();
  }
}

function createEmptyNotesGrid() {
  return Array.from({ length: config.size * config.size }, () => []);
}

function getNoteColumns() {
  if (config.size === 4) return 2;
  if (config.size === 6) return 3;
  return 3;
}

function renderNumberPad() {
  numberPad.innerHTML = "";
  numberPad.dataset.size = config.size;
  numberPad.style.setProperty("--pad-columns", getPadColumns());

  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.number = value;
    button.textContent = value;
    numberPad.appendChild(button);
  });

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.dataset.number = "0";
  clearButton.textContent = "Clear";
  numberPad.appendChild(clearButton);
}

function printWorksheet() {
  const previousConfig = config;
  const previousValues = values;
  config = gridConfigs[Number(gridSizeEl.value)];
  values = getValues(config.size);

  const worksheetPuzzles = Array.from({ length: 4 }, () => generatePuzzle(difficultyEl.value).puzzle);
  renderPrintSheet(worksheetPuzzles);

  config = previousConfig;
  values = previousValues;
  setStatus("Worksheet ready. Use your browser print dialog to print one page.");
  window.requestAnimationFrame(() => window.print());
}

function renderPrintSheet(worksheetPuzzles) {
  printSheet.innerHTML = "";
  printSheet.dataset.size = config.size;

  const header = document.createElement("header");
  header.className = "print-header";
  header.innerHTML = `
    <div>
      <p>Mini Sudoku Worksheet</p>
      <h1>${config.size}x${config.size} ${getDifficultyLabel()}</h1>
    </div>
    <div class="print-meta">
      <span>Name</span>
      <span>Date</span>
    </div>
  `;
  printSheet.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "print-puzzles";

  worksheetPuzzles.forEach((worksheetPuzzle, puzzleIndex) => {
    const puzzleCard = document.createElement("article");
    puzzleCard.className = "print-puzzle";

    const title = document.createElement("h2");
    title.textContent = `Puzzle ${puzzleIndex + 1}`;
    puzzleCard.appendChild(title);

    const board = document.createElement("div");
    board.className = "print-board";
    board.style.setProperty("--grid-size", config.size);

    worksheetPuzzle.forEach((value, index) => {
      const cell = document.createElement("div");
      cell.className = "print-cell";
      cell.textContent = value || "";
      applyBoxBorders(cell, index);
      board.appendChild(cell);
    });

    puzzleCard.appendChild(board);
    grid.appendChild(puzzleCard);
  });

  printSheet.appendChild(grid);
}

function getDifficultyLabel() {
  const selected = difficultyEl.options[difficultyEl.selectedIndex];
  return selected ? selected.textContent : "Beginner";
}

function getCellLabel(index, value) {
  const row = Math.floor(index / config.size) + 1;
  const col = (index % config.size) + 1;
  return `Row ${row}, column ${col}${value ? `, ${value}` : ", empty"}`;
}

function selectCell(index) {
  if (puzzle[index] === 0) {
    startTimer();
  }
  selectedIndex = index;
  renderBoard();
}

function enterNumber(value) {
  if (selectedIndex === null || puzzle[selectedIndex] !== 0) return;

  startTimer();
  playerGrid[selectedIndex] = value;
  if (value) {
    notesGrid[selectedIndex] = [];
    closeNotesPopover();
  }
  renderBoard();
  setStatus(value ? "Nice. Keep going." : "Cell cleared.");

  if (isComplete() && isSolved()) {
    stopTimer();
    setStatus(`Solved in ${formatElapsedTime(elapsedMs)}. Beautiful work.`, "ok");
  }
}

function checkPuzzle() {
  if (isSolved()) {
    stopTimer();
    setStatus(`Solved in ${formatElapsedTime(elapsedMs)}. Every row, column, and box works.`, "ok");
    return;
  }

  if (playerGrid.some((value) => value === 0)) {
    setStatus("Not finished yet. Fill every empty cell.", "warn");
    return;
  }

  setStatus("Something is off. Look for highlighted conflicts.", "warn");
}

function resetPuzzle() {
  resetTimer();
  playerGrid = puzzle.slice();
  notesGrid = createEmptyNotesGrid();
  selectedIndex = null;
  closeNotesPopover();
  renderBoard();
  setStatus("Puzzle reset.");
}

function isComplete() {
  return playerGrid.every(Boolean);
}

function isSolved() {
  return playerGrid.every((value, index) => value === solution[index]);
}

function hasConflict(index, value) {
  if (!value) return false;
  return playerGrid.some((otherValue, otherIndex) => (
    otherIndex !== index &&
    otherValue === value &&
    isPeer(index, otherIndex)
  ));
}

function isPeer(firstIndex, secondIndex) {
  const firstRow = Math.floor(firstIndex / config.size);
  const firstCol = firstIndex % config.size;
  const secondRow = Math.floor(secondIndex / config.size);
  const secondCol = secondIndex % config.size;
  const sameRow = firstRow === secondRow;
  const sameCol = firstCol === secondCol;
  const sameBox = Math.floor(firstRow / config.boxRows) === Math.floor(secondRow / config.boxRows) &&
    Math.floor(firstCol / config.boxCols) === Math.floor(secondCol / config.boxCols);
  return sameRow || sameCol || sameBox;
}

function setStatus(message, tone = "") {
  statusText.textContent = message;
  statusStrip.classList.toggle("ok", tone === "ok");
  statusStrip.classList.toggle("warn", tone === "warn");
}

function startTimer() {
  if (timerStarted || timerStopped) return;

  timerStarted = true;
  timerStartTime = Date.now();
  timerId = window.setInterval(updateTimer, 250);
  updateTimer();
}

function stopTimer() {
  if (timerStopped) return;

  if (timerStarted) {
    elapsedMs = Date.now() - timerStartTime;
  }
  timerStopped = true;

  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
  renderTimer();
}

function resetTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }

  timerStarted = false;
  timerStopped = false;
  timerStartTime = 0;
  elapsedMs = 0;
  renderTimer();
}

function updateTimer() {
  if (!timerStarted || timerStopped) return;

  elapsedMs = Date.now() - timerStartTime;
  renderTimer();
}

function renderTimer() {
  timerText.textContent = formatElapsedTime(elapsedMs);
}

function formatElapsedTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function getPadColumns() {
  if (config.size === 4) return 5;
  if (config.size === 6) return 7;
  return 5;
}

function getValues(size) {
  return Array.from({ length: size }, (_, index) => index + 1);
}

function handleKeyboardEntry(event) {
  if (event.key === "Escape") {
    closeNotesPopover();
    return;
  }

  if (shouldIgnoreKeyboardEntry(event.target)) return;

  const number = Number(event.key);
  if (values.includes(number)) {
    event.preventDefault();
    enterNumber(number);
  }

  if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
    event.preventDefault();
    enterNumber(0);
  }
}

function shouldIgnoreKeyboardEntry(target) {
  return target.closest("select");
}

document.addEventListener("keydown", handleKeyboardEntry);

notesPopover.addEventListener("click", (event) => {
  event.stopPropagation();
});

notesPopoverGrid.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest("button[data-note]");
  if (!button) return;
  toggleNote(Number(button.dataset.note));
});

notesDone.addEventListener("click", (event) => {
  event.stopPropagation();
  closeNotesPopover();
});

document.addEventListener("click", (event) => {
  if (notesPopover.hidden) return;
  if (notesPopover.contains(event.target)) return;
  if (event.target.closest(".cell")) return;
  closeNotesPopover();
});

numberPad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-number]");
  if (!button) return;
  enterNumber(Number(button.dataset.number));
});

newPuzzleButton.addEventListener("click", startGame);
resetPuzzleButton.addEventListener("click", resetPuzzle);
checkPuzzleButton.addEventListener("click", checkPuzzle);
printWorksheetButton.addEventListener("click", printWorksheet);
difficultyEl.addEventListener("change", startGame);
gridSizeEl.addEventListener("change", startGame);

startGame();
