(() => {
  const LEXICON_URL =
    "../../iq/lexicon/lexicon_seed_project/lexicon_seed.json";
  const MAX_GRID = 15;
  const MIN_WORD_LEN = 3;
  const MAX_WORD_LEN = 9;

  const els = {
    board: document.getElementById("board"),
    boardEmpty: document.getElementById("boardEmpty"),
    grade: document.getElementById("gradeLevel"),
    size: document.getElementById("puzzleSize"),
    newBtn: document.getElementById("newPuzzle"),
    checkBtn: document.getElementById("checkPuzzle"),
    revealBtn: document.getElementById("revealPuzzle"),
    status: document.getElementById("statusText"),
    statusStrip: document.getElementById("statusStrip"),
    progress: document.getElementById("progressText"),
    acrossClues: document.getElementById("acrossClues"),
    downClues: document.getElementById("downClues"),
  };

  /** @type {Array<any>} */
  let lexicon = [];
  /** @type {{grid: string[][], words: PlacedWord[], cells: Cell[][], rows: number, cols: number}|null} */
  let puzzle = null;
  let focused = null; // {row, col, dir}

  /**
   * @typedef {{word: string, clue: string, row: number, col: number, dir: 'across'|'down', number: number}} PlacedWord
   * @typedef {{letter: string, number: number|null, across: number|null, down: number|null, input: string}} Cell
   */

  // ---------- Lexicon ----------

  async function loadLexicon() {
    const res = await fetch(LEXICON_URL);
    if (!res.ok) throw new Error(`Lexicon fetch failed: ${res.status}`);
    lexicon = await res.json();
  }

  function pickCandidates(gradeValue, count) {
    const grades = gradeValue.split(",");
    const filtered = lexicon.filter((w) => {
      if (!grades.includes(w.grade_level)) return false;
      const word = (w.word || "").toUpperCase();
      if (!/^[A-Z]+$/.test(word)) return false;
      if (word.length < MIN_WORD_LEN || word.length > MAX_WORD_LEN) return false;
      if (!w.senses || !w.senses[0] || !w.senses[0].definition) return false;
      return true;
    });
    // Shuffle, then sort by length desc so we try longer words first.
    shuffle(filtered);
    filtered.sort((a, b) => b.word.length - a.word.length);
    // Return a generous pool — algorithm uses what fits.
    return filtered.slice(0, Math.max(count * 6, 40));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // ---------- Grid placement ----------

  function emptyGrid(n) {
    return Array.from({ length: n }, () => Array(n).fill(""));
  }

  function fitsAt(grid, word, row, col, dir) {
    const n = grid.length;
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    const endR = row + dr * (word.length - 1);
    const endC = col + dc * (word.length - 1);
    if (row < 0 || col < 0 || endR >= n || endC >= n) return -1;

    // Cell immediately before start and after end must be empty (separation).
    const beforeR = row - dr,
      beforeC = col - dc;
    const afterR = endR + dr,
      afterC = endC + dc;
    if (
      beforeR >= 0 &&
      beforeC >= 0 &&
      beforeR < n &&
      beforeC < n &&
      grid[beforeR][beforeC] !== ""
    )
      return -1;
    if (
      afterR >= 0 &&
      afterC >= 0 &&
      afterR < n &&
      afterC < n &&
      grid[afterR][afterC] !== ""
    )
      return -1;

    let crossings = 0;
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = grid[r][c];
      if (existing) {
        if (existing !== word[i]) return -1;
        crossings++;
      } else {
        // perpendicular neighbours must be empty unless this cell is a crossing
        const pr1 = r + dc, // perpendicular = swap deltas
          pc1 = c + dr;
        const pr2 = r - dc,
          pc2 = c - dr;
        if (
          pr1 >= 0 &&
          pr1 < n &&
          pc1 >= 0 &&
          pc1 < n &&
          grid[pr1][pc1] !== ""
        )
          return -1;
        if (
          pr2 >= 0 &&
          pr2 < n &&
          pc2 >= 0 &&
          pc2 < n &&
          grid[pr2][pc2] !== ""
        )
          return -1;
      }
    }
    return crossings;
  }

  function place(grid, word, row, col, dir) {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < word.length; i++) {
      grid[row + dr * i][col + dc * i] = word[i];
    }
  }

  function generate(candidates, targetCount) {
    const n = MAX_GRID;
    const grid = emptyGrid(n);
    const placed = [];
    if (candidates.length === 0) return { grid, placed };

    // Seed: place the first (longest) word in the middle, across.
    const first = candidates[0];
    const firstWord = first.word.toUpperCase();
    const startRow = Math.floor(n / 2);
    const startCol = Math.floor((n - firstWord.length) / 2);
    place(grid, firstWord, startRow, startCol, "across");
    placed.push({
      word: firstWord,
      clue: clueFor(first),
      row: startRow,
      col: startCol,
      dir: "across",
      raw: first,
    });

    // Try the rest. For each, find any intersection with already-placed letters.
    const pool = candidates.slice(1);
    for (const entry of pool) {
      if (placed.length >= targetCount) break;
      const w = entry.word.toUpperCase();
      if (placed.some((p) => p.word === w)) continue;

      const tries = [];
      // For each letter of candidate, scan grid for matching letter.
      for (let i = 0; i < w.length; i++) {
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (grid[r][c] !== w[i]) continue;
            // Try perpendicular to whatever the matching letter is part of:
            // we don't know dir from letter alone, so try both orientations.
            for (const dir of ["across", "down"]) {
              const dr = dir === "down" ? 1 : 0;
              const dc = dir === "across" ? 1 : 0;
              const row = r - dr * i;
              const col = c - dc * i;
              const crossings = fitsAt(grid, w, row, col, dir);
              if (crossings > 0) {
                tries.push({ row, col, dir, crossings });
              }
            }
          }
        }
      }
      if (tries.length === 0) continue;
      // Prefer placements with more crossings (denser puzzle).
      tries.sort((a, b) => b.crossings - a.crossings);
      const pick = tries[0];
      place(grid, w, pick.row, pick.col, pick.dir);
      placed.push({
        word: w,
        clue: clueFor(entry),
        row: pick.row,
        col: pick.col,
        dir: pick.dir,
        raw: entry,
      });
    }

    return crop(grid, placed);
  }

  function crop(grid, placed) {
    const n = grid.length;
    let minR = n,
      minC = n,
      maxR = -1,
      maxC = -1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c]) {
          if (r < minR) minR = r;
          if (c < minC) minC = c;
          if (r > maxR) maxR = r;
          if (c > maxC) maxC = c;
        }
      }
    }
    if (maxR === -1) return { grid: [[]], placed: [] };
    const rows = maxR - minR + 1;
    const cols = maxC - minC + 1;
    const cropped = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => grid[r + minR][c + minC]),
    );
    const shifted = placed.map((p) => ({
      ...p,
      row: p.row - minR,
      col: p.col - minC,
    }));
    return { grid: cropped, placed: shifted, rows, cols };
  }

  function numberPuzzle({ grid, placed, rows, cols }) {
    const cells = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        letter: grid[r][c] || "",
        number: null,
        across: null,
        down: null,
        input: "",
      })),
    );

    // Determine starting cells per crossword conventions.
    let counter = 0;
    const wordsByStart = new Map(); // "r,c,dir" -> placed index
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      wordsByStart.set(`${p.row},${p.col},${p.dir}`, i);
    }
    const wordsOrdered = []; // assigned numbers in order
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!cells[r][c].letter) continue;
        const startsAcross =
          (c === 0 || !cells[r][c - 1].letter) &&
          c + 1 < cols &&
          cells[r][c + 1].letter;
        const startsDown =
          (r === 0 || !cells[r - 1][c].letter) &&
          r + 1 < rows &&
          cells[r + 1][c].letter;
        if (startsAcross || startsDown) {
          counter++;
          cells[r][c].number = counter;
          if (startsAcross && wordsByStart.has(`${r},${c},across`)) {
            const idx = wordsByStart.get(`${r},${c},across`);
            placed[idx].number = counter;
            wordsOrdered.push(idx);
          }
          if (startsDown && wordsByStart.has(`${r},${c},down`)) {
            const idx = wordsByStart.get(`${r},${c},down`);
            placed[idx].number = counter;
            wordsOrdered.push(idx);
          }
        }
      }
    }

    // Record which word indices each cell belongs to.
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      const dr = p.dir === "down" ? 1 : 0;
      const dc = p.dir === "across" ? 1 : 0;
      for (let k = 0; k < p.word.length; k++) {
        const r = p.row + dr * k;
        const c = p.col + dc * k;
        if (p.dir === "across") cells[r][c].across = i;
        else cells[r][c].down = i;
      }
    }

    return { grid, words: placed, cells, rows, cols };
  }

  function clueFor(entry) {
    const def = entry.senses?.[0]?.definition || "";
    // Strip leading article echoes of the word itself if any (cheap dedupe).
    return def;
  }

  // ---------- Rendering ----------

  function render() {
    const { rows, cols, cells, words } = puzzle;
    els.board.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    els.board.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    const size = Math.min(560, Math.max(280, cols * 38));
    els.board.style.width = `${size}px`;

    els.board.innerHTML = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cells[r][c];
        const div = document.createElement("div");
        if (!cell.letter) {
          div.className = "cw-cell block";
          els.board.appendChild(div);
          continue;
        }
        div.className = "cw-cell";
        div.dataset.row = r;
        div.dataset.col = c;
        div.tabIndex = 0;
        if (cell.number !== null) {
          const n = document.createElement("span");
          n.className = "cw-number";
          n.textContent = String(cell.number);
          div.appendChild(n);
        }
        const letter = document.createElement("span");
        letter.className = "cw-letter";
        letter.textContent = cell.input || "";
        div.appendChild(letter);
        div.addEventListener("mousedown", (e) => {
          e.preventDefault();
          onCellClick(r, c);
        });
        div.addEventListener("keydown", (e) => onKey(e, r, c));
        els.board.appendChild(div);
      }
    }

    renderClues();
    updateProgress();
    focusFirst();
  }

  function renderClues() {
    els.acrossClues.innerHTML = "";
    els.downClues.innerHTML = "";
    const across = puzzle.words
      .filter((w) => w.dir === "across")
      .sort((a, b) => a.number - b.number);
    const down = puzzle.words
      .filter((w) => w.dir === "down")
      .sort((a, b) => a.number - b.number);
    for (const w of across) els.acrossClues.appendChild(clueItem(w));
    for (const w of down) els.downClues.appendChild(clueItem(w));
  }

  function clueItem(w) {
    const li = document.createElement("li");
    li.dataset.dir = w.dir;
    li.dataset.number = w.number;
    li.innerHTML = `<span class="clue-num">${w.number}.</span><span>${escapeHtml(w.clue)}</span>`;
    li.addEventListener("click", () => {
      focused = { row: w.row, col: w.col, dir: w.dir };
      paintFocus();
    });
    return li;
  }

  function escapeHtml(s) {
    return s.replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  }

  function focusFirst() {
    const first = puzzle.words[0];
    if (!first) return;
    focused = { row: first.row, col: first.col, dir: first.dir };
    paintFocus();
  }

  function paintFocus() {
    const { rows, cols, cells } = puzzle;
    const cellEls = els.board.querySelectorAll(".cw-cell");
    cellEls.forEach((el) => el.classList.remove("focused", "highlighted"));
    if (!focused) return;
    const { row, col, dir } = focused;
    const wordIdx =
      dir === "across" ? cells[row][col].across : cells[row][col].down;
    if (wordIdx == null) {
      // try the other direction
      const alt = dir === "across" ? "down" : "across";
      const altIdx = cells[row][col][alt];
      if (altIdx != null) focused.dir = alt;
    }
    const useDir = focused.dir;
    const w =
      useDir === "across"
        ? puzzle.words[cells[row][col].across]
        : puzzle.words[cells[row][col].down];
    if (w) {
      const dr = w.dir === "down" ? 1 : 0;
      const dc = w.dir === "across" ? 1 : 0;
      for (let k = 0; k < w.word.length; k++) {
        const r = w.row + dr * k;
        const c = w.col + dc * k;
        const el = cellAt(r, c);
        if (el) el.classList.add("highlighted");
      }
    }
    const focusedEl = cellAt(row, col);
    if (focusedEl) {
      focusedEl.classList.add("focused");
      focusedEl.focus({ preventScroll: true });
    }
    // Active clue highlight
    document
      .querySelectorAll(".clue-list li")
      .forEach((li) => li.classList.remove("active"));
    if (w) {
      const sel = `.clue-list li[data-dir="${w.dir}"][data-number="${w.number}"]`;
      document.querySelector(sel)?.classList.add("active");
    }
  }

  function cellAt(r, c) {
    return els.board.querySelector(`.cw-cell[data-row="${r}"][data-col="${c}"]`);
  }

  function onCellClick(r, c) {
    if (
      focused &&
      focused.row === r &&
      focused.col === c &&
      puzzle.cells[r][c].across != null &&
      puzzle.cells[r][c].down != null
    ) {
      // Toggle direction on second click of same cell.
      focused.dir = focused.dir === "across" ? "down" : "across";
    } else {
      const prevDir = focused?.dir || "across";
      const can = puzzle.cells[r][c];
      const dir =
        can[prevDir] != null
          ? prevDir
          : can.across != null
            ? "across"
            : "down";
      focused = { row: r, col: c, dir };
    }
    paintFocus();
  }

  function onKey(e, r, c) {
    const key = e.key;
    if (/^[a-zA-Z]$/.test(key)) {
      puzzle.cells[r][c].input = key.toUpperCase();
      refreshCell(r, c);
      moveNext(r, c, false);
      e.preventDefault();
      updateProgress();
    } else if (key === "Backspace") {
      if (puzzle.cells[r][c].input) {
        puzzle.cells[r][c].input = "";
        refreshCell(r, c);
      } else {
        moveNext(r, c, true); // back up
        const cur = focused;
        if (cur) {
          puzzle.cells[cur.row][cur.col].input = "";
          refreshCell(cur.row, cur.col);
        }
      }
      e.preventDefault();
      updateProgress();
    } else if (key === "ArrowRight") {
      focused = { row: r, col: Math.min(c + 1, puzzle.cols - 1), dir: "across" };
      paintFocus();
      e.preventDefault();
    } else if (key === "ArrowLeft") {
      focused = { row: r, col: Math.max(c - 1, 0), dir: "across" };
      paintFocus();
      e.preventDefault();
    } else if (key === "ArrowDown") {
      focused = { row: Math.min(r + 1, puzzle.rows - 1), col: c, dir: "down" };
      paintFocus();
      e.preventDefault();
    } else if (key === "ArrowUp") {
      focused = { row: Math.max(r - 1, 0), col: c, dir: "down" };
      paintFocus();
      e.preventDefault();
    } else if (key === " " || key === "Tab") {
      // Swap direction
      const can = puzzle.cells[r][c];
      if (can.across != null && can.down != null) {
        focused.dir = focused.dir === "across" ? "down" : "across";
        paintFocus();
      }
      e.preventDefault();
    }
  }

  function moveNext(r, c, backward) {
    const dir = focused?.dir || "across";
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    const step = backward ? -1 : 1;
    let nr = r + dr * step;
    let nc = c + dc * step;
    if (
      nr < 0 ||
      nc < 0 ||
      nr >= puzzle.rows ||
      nc >= puzzle.cols ||
      !puzzle.cells[nr][nc].letter
    )
      return;
    focused = { row: nr, col: nc, dir };
    paintFocus();
  }

  function refreshCell(r, c) {
    const el = cellAt(r, c);
    if (!el) return;
    const letter = el.querySelector(".cw-letter");
    if (letter) letter.textContent = puzzle.cells[r][c].input || "";
    el.classList.remove("correct", "wrong");
  }

  function updateProgress() {
    let filled = 0,
      total = 0;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (puzzle.cells[r][c].letter) {
          total++;
          if (puzzle.cells[r][c].input) filled++;
        }
      }
    }
    els.progress.textContent = `${filled} / ${total}`;
  }

  // ---------- Actions ----------

  function checkPuzzle() {
    let allRight = true,
      anyFilled = false;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const cell = puzzle.cells[r][c];
        const el = cellAt(r, c);
        if (!cell.letter || !el) continue;
        if (!cell.input) {
          allRight = false;
          continue;
        }
        anyFilled = true;
        if (cell.input === cell.letter) {
          el.classList.add("correct");
          el.classList.remove("wrong");
        } else {
          el.classList.add("wrong");
          el.classList.remove("correct");
          allRight = false;
        }
      }
    }
    if (allRight) {
      setStatus("Solved! Beautiful work.", "success");
    } else if (anyFilled) {
      setStatus("Some letters need another look.", "error");
    } else {
      setStatus("Try filling in a few letters first.", "");
    }
  }

  function revealPuzzle() {
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const cell = puzzle.cells[r][c];
        if (cell.letter) {
          cell.input = cell.letter;
          refreshCell(r, c);
        }
      }
    }
    setStatus("Answers revealed.", "");
    updateProgress();
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.statusStrip.classList.remove("success", "error");
    if (kind) els.statusStrip.classList.add(kind);
  }

  function newPuzzle() {
    if (!lexicon.length) return;
    const target = parseInt(els.size.value, 10);
    const candidates = pickCandidates(els.grade.value, target);
    if (candidates.length < 2) {
      setStatus("Not enough words at this level — try another.", "error");
      return;
    }
    // Some seeds may not chain; retry a few times for a denser puzzle.
    let best = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      shuffle(candidates);
      candidates.sort((a, b) => b.word.length - a.word.length);
      const result = generate(candidates, target);
      if (!result.placed || result.placed.length === 0) continue;
      if (!best || result.placed.length > best.placed.length) best = result;
      if (best.placed.length >= target) break;
    }
    if (!best) {
      setStatus("Couldn't build a puzzle — try a different grade.", "error");
      return;
    }
    puzzle = numberPuzzle(best);
    render();
    setStatus(
      `${puzzle.words.length} words placed. Click a clue or a cell to start.`,
      "",
    );
  }

  // ---------- Boot ----------

  async function init() {
    els.boardEmpty.hidden = false;
    try {
      await loadLexicon();
    } catch (e) {
      els.boardEmpty.textContent = `Couldn't load lexicon: ${e.message}`;
      return;
    }
    els.boardEmpty.hidden = true;
    els.newBtn.addEventListener("click", newPuzzle);
    els.checkBtn.addEventListener("click", checkPuzzle);
    els.revealBtn.addEventListener("click", revealPuzzle);
    els.grade.addEventListener("change", newPuzzle);
    els.size.addEventListener("change", newPuzzle);
    newPuzzle();
  }

  init();
})();
