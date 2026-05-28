(() => {
  // Cycle: KEPT (unmarked default) -> CIRCLED (marked "keep") -> CROSSED (X, excluded from sum) -> KEPT.
  const STATE_KEPT = 0;
  const STATE_CIRCLED = 1;
  const STATE_CROSSED = 2;

  const boardEl = document.getElementById("board");
  const statusTextEl = document.getElementById("statusText");
  const timerTextEl = document.getElementById("timerText");
  const gridSizeEl = document.getElementById("gridSize");
  const difficultyEl = document.getElementById("difficulty");
  const newBtn = document.getElementById("newPuzzle");
  const resetBtn = document.getElementById("resetPuzzle");
  const revealBtn = document.getElementById("solveBtn");
  const printBtn = document.getElementById("printPuzzle");
  const printSheetEl = document.getElementById("printSheet");

  let puzzle = null;
  let playerStates = [];
  let startTime = null;
  let timerInterval = null;
  let solved = false;

  // ---------- Puzzle generation & solving ----------

  function subsetsSummingTo(values, target) {
    const N = values.length;
    const results = [];
    const mask = new Array(N);
    function recurse(idx, currentSum) {
      if (idx === N) {
        if (currentSum === target) results.push(mask.slice());
        return;
      }
      const v = values[idx];
      if (currentSum + v <= target) {
        mask[idx] = true;
        recurse(idx + 1, currentSum + v);
      }
      mask[idx] = false;
      recurse(idx + 1, currentSum);
    }
    recurse(0, 0);
    return results;
  }

  // Counts solutions up to a cap. Used both for uniqueness check (cap=2) and full solve.
  function countSolutions(grid, rowTargets, colTargets, cap = 2) {
    const N = grid.length;
    const rowOptions = [];
    for (let r = 0; r < N; r++) {
      const opts = subsetsSummingTo(grid[r], rowTargets[r]);
      if (opts.length === 0) return { count: 0, first: null };
      rowOptions.push(opts);
    }

    // maxBelow[r][c] = sum of grid[r..N-1][c] — used to prune when col can't reach its target
    const maxBelow = Array.from({ length: N + 1 }, () => new Array(N).fill(0));
    for (let c = 0; c < N; c++) {
      for (let r = N - 1; r >= 0; r--) {
        maxBelow[r][c] = maxBelow[r + 1][c] + grid[r][c];
      }
    }

    let count = 0;
    let first = null;
    const chosen = new Array(N);

    function backtrack(rowIdx, colSums) {
      if (count >= cap) return;
      if (rowIdx === N) {
        for (let c = 0; c < N; c++) {
          if (colSums[c] !== colTargets[c]) return;
        }
        count++;
        if (!first) first = chosen.map(opt => opt.slice());
        return;
      }
      outer: for (const option of rowOptions[rowIdx]) {
        const newSums = new Array(N);
        for (let c = 0; c < N; c++) {
          const add = option[c] ? grid[rowIdx][c] : 0;
          const s = colSums[c] + add;
          if (s > colTargets[c]) continue outer;
          if (s + maxBelow[rowIdx + 1][c] < colTargets[c]) continue outer;
          newSums[c] = s;
        }
        chosen[rowIdx] = option;
        backtrack(rowIdx + 1, newSums);
        if (count >= cap) return;
      }
    }
    backtrack(0, new Array(N).fill(0));
    return { count, first };
  }

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  // Difficulty controls value range AND how many cells get crossed out (density of kept cells).
  // Easy = small values + most cells kept (few crossings). Hard = full 1-9 + many crossings.
  function puzzleConfigFor(difficulty) {
    const configs = {
      easy:   { minVal: 1, maxVal: 3, densityMin: 0.65, densityMax: 0.80 },
      medium: { minVal: 1, maxVal: 6, densityMin: 0.50, densityMax: 0.70 },
      hard:   { minVal: 1, maxVal: 9, densityMin: 0.40, densityMax: 0.55 },
    };
    return configs[difficulty] || configs.medium;
  }

  // Generation strategy: randomize a kept-mask + values, derive targets, then verify
  // the puzzle has exactly one solution. Retry until unique or budget exhausted.
  function generatePuzzle(N, difficulty) {
    const startedAt = Date.now();
    const budgetMs = N <= 7 ? 1500 : N <= 9 ? 4000 : 8000;
    const { minVal, maxVal, densityMin, densityMax } = puzzleConfigFor(difficulty);
    let attempts = 0;
    while (Date.now() - startedAt < budgetMs) {
      attempts++;
      const density = densityMin + Math.random() * (densityMax - densityMin);
      const grid = [];
      const solution = [];
      for (let r = 0; r < N; r++) {
        const row = [];
        const solRow = [];
        for (let c = 0; c < N; c++) {
          row.push(randInt(minVal, maxVal));
          solRow.push(Math.random() < density);
        }
        grid.push(row);
        solution.push(solRow);
      }

      let viable = true;
      for (let r = 0; r < N && viable; r++) {
        if (!solution[r].some(Boolean)) viable = false;
      }
      for (let c = 0; c < N && viable; c++) {
        let any = false;
        for (let r = 0; r < N; r++) if (solution[r][c]) { any = true; break; }
        if (!any) viable = false;
      }
      if (!viable) continue;

      const rowTargets = solution.map((row, r) =>
        row.reduce((s, kept, c) => s + (kept ? grid[r][c] : 0), 0)
      );
      const colTargets = new Array(N).fill(0);
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (solution[r][c]) colTargets[c] += grid[r][c];
        }
      }

      const { count } = countSolutions(grid, rowTargets, colTargets, 2);
      if (count === 1) {
        return { grid, rowTargets, colTargets, solution, size: N, difficulty, attempts };
      }
    }
    // Last resort: relax to "any valid puzzle" even if not unique.
    return generateFallback(N, difficulty);
  }

  function generateFallback(N, difficulty) {
    const density = 0.6;
    const { minVal, maxVal } = puzzleConfigFor(difficulty);
    const grid = [];
    const solution = [];
    for (let r = 0; r < N; r++) {
      const row = [];
      const solRow = [];
      for (let c = 0; c < N; c++) {
        row.push(randInt(minVal, maxVal));
        solRow.push(Math.random() < density || (c === 0 && r === 0));
      }
      grid.push(row);
      solution.push(solRow);
    }
    const rowTargets = solution.map((row, r) =>
      row.reduce((s, kept, c) => s + (kept ? grid[r][c] : 0), 0)
    );
    const colTargets = new Array(N).fill(0);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (solution[r][c]) colTargets[c] += grid[r][c];
      }
    }
    return { grid, rowTargets, colTargets, solution, size: N, difficulty, attempts: 0, fallback: true };
  }

  // ---------- Game state ----------

  function startNewPuzzle() {
    const N = parseInt(gridSizeEl.value, 10);
    const difficulty = difficultyEl ? difficultyEl.value : "medium";
    statusTextEl.textContent = `Generating ${N}x${N} ${difficulty} puzzle…`;
    // Defer to next tick so the status update paints before the (potentially slow) generator runs.
    setTimeout(() => {
      puzzle = generatePuzzle(N, difficulty);
      playerStates = Array.from({ length: N }, () => new Array(N).fill(STATE_KEPT));
      solved = false;
      startTime = Date.now();
      stopTimer();
      startTimer();
      renderBoard();
      updateSums();
      statusTextEl.textContent = puzzle.fallback
        ? "Cross out numbers so each row and column sums to its target. (Note: this puzzle may have multiple solutions.)"
        : "Cross out numbers so each row and column sums to its target.";
    }, 30);
  }

  function resetPuzzle() {
    if (!puzzle) return;
    const N = puzzle.size;
    playerStates = Array.from({ length: N }, () => new Array(N).fill(STATE_KEPT));
    solved = false;
    startTime = Date.now();
    startTimer();
    renderBoard();
    updateSums();
    statusTextEl.textContent = "Cross out numbers so each row and column sums to its target.";
  }

  function revealSolution() {
    if (!puzzle) return;
    const N = puzzle.size;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        playerStates[r][c] = puzzle.solution[r][c] ? STATE_KEPT : STATE_CROSSED;
      }
    }
    stopTimer();
    renderBoard();
    updateSums();
    statusTextEl.textContent = "Revealed — start a new puzzle to play again.";
    solved = true;
  }

  function cycleCell(r, c) {
    if (solved) return;
    playerStates[r][c] = (playerStates[r][c] + 1) % 3;
    const cellEl = boardEl.querySelector(`[data-cell="${r}-${c}"]`);
    if (cellEl) applyCellClass(cellEl, playerStates[r][c]);
    updateSums();
  }

  // ---------- Rendering ----------

  function renderBoard() {
    if (!puzzle) return;
    const N = puzzle.size;
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--nc-cols", N + 1);

    // top-left corner spacer
    const corner = document.createElement("div");
    corner.className = "nc-corner";
    boardEl.appendChild(corner);

    // column targets
    for (let c = 0; c < N; c++) {
      const t = document.createElement("div");
      t.className = "nc-target nc-col-target";
      t.dataset.colTarget = String(c);
      t.innerHTML = `<span class="nc-current" data-col-current="${c}">0</span><span class="nc-slash">/</span><span class="nc-goal">${puzzle.colTargets[c]}</span>`;
      boardEl.appendChild(t);
    }

    // rows
    for (let r = 0; r < N; r++) {
      const t = document.createElement("div");
      t.className = "nc-target nc-row-target";
      t.dataset.rowTarget = String(r);
      t.innerHTML = `<span class="nc-current" data-row-current="${r}">0</span><span class="nc-slash">/</span><span class="nc-goal">${puzzle.rowTargets[r]}</span>`;
      boardEl.appendChild(t);

      for (let c = 0; c < N; c++) {
        const cell = document.createElement("button");
        cell.className = "nc-cell";
        cell.type = "button";
        cell.dataset.cell = `${r}-${c}`;
        cell.textContent = String(puzzle.grid[r][c]);
        applyCellClass(cell, playerStates[r][c]);
        cell.addEventListener("click", () => cycleCell(r, c));
        boardEl.appendChild(cell);
      }
    }
  }

  function applyCellClass(el, state) {
    el.classList.remove("is-kept", "is-crossed", "is-circled");
    if (state === STATE_KEPT) el.classList.add("is-kept");
    else if (state === STATE_CROSSED) el.classList.add("is-crossed");
    else if (state === STATE_CIRCLED) el.classList.add("is-circled");
  }

  function updateSums() {
    if (!puzzle) return;
    const N = puzzle.size;
    const rowSums = new Array(N).fill(0);
    const colSums = new Array(N).fill(0);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (playerStates[r][c] !== STATE_CROSSED) {
          rowSums[r] += puzzle.grid[r][c];
          colSums[c] += puzzle.grid[r][c];
        }
      }
    }
    let allMatch = true;
    for (let r = 0; r < N; r++) {
      const cur = boardEl.querySelector(`[data-row-current="${r}"]`);
      const wrap = boardEl.querySelector(`[data-row-target="${r}"]`);
      if (cur) cur.textContent = String(rowSums[r]);
      const match = rowSums[r] === puzzle.rowTargets[r];
      const over = rowSums[r] > puzzle.rowTargets[r];
      if (wrap) {
        wrap.classList.toggle("is-match", match);
        wrap.classList.toggle("is-over", over && !match);
      }
      if (!match) allMatch = false;
    }
    for (let c = 0; c < N; c++) {
      const cur = boardEl.querySelector(`[data-col-current="${c}"]`);
      const wrap = boardEl.querySelector(`[data-col-target="${c}"]`);
      if (cur) cur.textContent = String(colSums[c]);
      const match = colSums[c] === puzzle.colTargets[c];
      const over = colSums[c] > puzzle.colTargets[c];
      if (wrap) {
        wrap.classList.toggle("is-match", match);
        wrap.classList.toggle("is-over", over && !match);
      }
      if (!match) allMatch = false;
    }
    if (allMatch && !solved) {
      solved = true;
      stopTimer();
      statusTextEl.textContent = `Solved in ${formatTime(Date.now() - startTime)}! Hit New for another.`;
      boardEl.classList.add("is-solved");
    } else if (!allMatch) {
      boardEl.classList.remove("is-solved");
    }
  }

  // ---------- Print ----------

  function renderPrintSheet() {
    if (!puzzle || !printSheetEl) return;
    const N = puzzle.size;
    printSheetEl.innerHTML = "";
    printSheetEl.style.setProperty("--nc-print-cols", N + 1);

    const header = document.createElement("header");
    header.className = "print-header";
    const h1 = document.createElement("h1");
    h1.textContent = "Number Cross";
    const sub = document.createElement("p");
    const diff = (puzzle.difficulty || "medium");
    sub.className = "print-sub";
    sub.textContent = `${N} × ${N} • ${diff.charAt(0).toUpperCase() + diff.slice(1)}`;
    header.appendChild(h1);
    header.appendChild(sub);
    printSheetEl.appendChild(header);

    const instr = document.createElement("p");
    instr.className = "print-instr";
    instr.textContent =
      "Cross out numbers so the remaining numbers in each row and column add up to the target shown outside the grid.";
    printSheetEl.appendChild(instr);

    const grid = document.createElement("div");
    grid.className = "print-grid";
    grid.style.setProperty("--nc-print-cols", N + 1);

    grid.appendChild(document.createElement("div"));
    for (let c = 0; c < N; c++) {
      const t = document.createElement("div");
      t.className = "print-target";
      t.textContent = String(puzzle.colTargets[c]);
      grid.appendChild(t);
    }
    for (let r = 0; r < N; r++) {
      const t = document.createElement("div");
      t.className = "print-target";
      t.textContent = String(puzzle.rowTargets[r]);
      grid.appendChild(t);
      for (let c = 0; c < N; c++) {
        const cell = document.createElement("div");
        cell.className = "print-cell";
        cell.textContent = String(puzzle.grid[r][c]);
        grid.appendChild(cell);
      }
    }
    printSheetEl.appendChild(grid);
  }

  function printPuzzle() {
    if (!puzzle) return;
    renderPrintSheet();
    window.print();
  }

  // ---------- Timer ----------

  function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
      if (!startTime) return;
      timerTextEl.textContent = formatTime(Date.now() - startTime);
    }, 500);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ---------- Wire up ----------

  newBtn.addEventListener("click", startNewPuzzle);
  resetBtn.addEventListener("click", resetPuzzle);
  revealBtn.addEventListener("click", revealSolution);
  if (printBtn) printBtn.addEventListener("click", printPuzzle);
  gridSizeEl.addEventListener("change", startNewPuzzle);
  if (difficultyEl) difficultyEl.addEventListener("change", startNewPuzzle);

  startNewPuzzle();
})();
