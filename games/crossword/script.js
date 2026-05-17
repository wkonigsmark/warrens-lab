(() => {
  const WW = window.WordWeaver;

  const els = {
    board: document.getElementById("board"),
    boardEmpty: document.getElementById("boardEmpty"),
    grade: document.getElementById("gradeLevel"),
    size: document.getElementById("puzzleSize"),
    newBtn: document.getElementById("newPuzzle"),
    checkBtn: document.getElementById("checkPuzzle"),
    revealBtn: document.getElementById("revealPuzzle"),
    studyBtn: document.getElementById("studyBtn"),
    printBtn: document.getElementById("printBtn"),
    openIdBtn: document.getElementById("openIdBtn"),
    puzzleIdLabel: document.getElementById("puzzleIdLabel"),
    status: document.getElementById("statusText"),
    statusStrip: document.getElementById("statusStrip"),
    progress: document.getElementById("progressText"),
    activeClue: document.getElementById("activeClue"),
    activeLabel: document.getElementById("activeLabel"),
    activeText: document.getElementById("activeText"),
    prevClue: document.getElementById("prevClue"),
    nextClue: document.getElementById("nextClue"),
    acrossClues: document.getElementById("acrossClues"),
    downClues: document.getElementById("downClues"),
    cluePanel: document.getElementById("cluePanel"),
    clueDrawerToggle: document.getElementById("clueDrawerToggle"),
    hiddenInput: document.getElementById("hiddenInput"),
  };

  let lexicon = [];
  let puzzle = null;
  let focused = null;
  let currentId = null;

  // ---------- Render ----------

  function render() {
    const { rows, cols, cells } = puzzle;
    els.board.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    els.board.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

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
        div.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          onCellTap(r, c);
        });
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
      focusHiddenInput();
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
    const { cells } = puzzle;
    const cellEls = els.board.querySelectorAll(".cw-cell");
    cellEls.forEach((el) => el.classList.remove("focused", "highlighted"));
    if (!focused) {
      updateActiveClue(null);
      return;
    }
    const { row, col, dir } = focused;
    const c = cells[row][col];
    const wordIdx = dir === "across" ? c.across : c.down;
    if (wordIdx == null) {
      const alt = dir === "across" ? "down" : "across";
      const altIdx = c[alt];
      if (altIdx != null) focused.dir = alt;
    }
    const w =
      focused.dir === "across"
        ? puzzle.words[cells[row][col].across]
        : puzzle.words[cells[row][col].down];
    if (w) {
      const dr = w.dir === "down" ? 1 : 0;
      const dc = w.dir === "across" ? 1 : 0;
      for (let k = 0; k < w.word.length; k++) {
        const r = w.row + dr * k;
        const cc = w.col + dc * k;
        const el = cellAt(r, cc);
        if (el) el.classList.add("highlighted");
      }
    }
    const focusedEl = cellAt(row, col);
    if (focusedEl) focusedEl.classList.add("focused");
    document
      .querySelectorAll(".clue-list li")
      .forEach((li) => li.classList.remove("active"));
    if (w) {
      const sel = `.clue-list li[data-dir="${w.dir}"][data-number="${w.number}"]`;
      document.querySelector(sel)?.classList.add("active");
    }
    updateActiveClue(w);
  }

  function updateActiveClue(w) {
    if (!w) {
      els.activeLabel.textContent = "";
      els.activeText.textContent = "Tap a cell to begin.";
      return;
    }
    els.activeLabel.textContent = `${w.number} ${w.dir === "across" ? "Across" : "Down"}`;
    els.activeText.textContent = w.clue;
  }

  function cellAt(r, c) {
    return els.board.querySelector(
      `.cw-cell[data-row="${r}"][data-col="${c}"]`,
    );
  }

  function onCellTap(r, c) {
    if (
      focused &&
      focused.row === r &&
      focused.col === c &&
      puzzle.cells[r][c].across != null &&
      puzzle.cells[r][c].down != null
    ) {
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
    focusHiddenInput();
  }

  function focusHiddenInput() {
    if (!els.hiddenInput) return;
    els.hiddenInput.value = "";
    try {
      els.hiddenInput.focus({ preventScroll: true });
    } catch (_) {
      els.hiddenInput.focus();
    }
  }

  // ---------- Input handling (single hidden input handles all key + IME events) ----------

  function consumeChar(ch) {
    if (!focused || !puzzle) return;
    if (!/^[a-z]$/i.test(ch)) return;
    puzzle.cells[focused.row][focused.col].input = ch.toUpperCase();
    refreshCell(focused.row, focused.col);
    moveNext(focused.row, focused.col, false);
    updateProgress();
  }

  function consumeBackspace() {
    if (!focused || !puzzle) return;
    const cell = puzzle.cells[focused.row][focused.col];
    if (cell.input) {
      cell.input = "";
      refreshCell(focused.row, focused.col);
    } else {
      moveNext(focused.row, focused.col, true);
      if (focused) {
        const cur = puzzle.cells[focused.row][focused.col];
        if (cur) {
          cur.input = "";
          refreshCell(focused.row, focused.col);
        }
      }
    }
    updateProgress();
  }

  function bindInput() {
    const input = els.hiddenInput;

    input.addEventListener("input", () => {
      const val = input.value;
      input.value = "";
      // Mobile soft keyboards can deliver multi-char chunks (autocomplete);
      // just consume each letter in order.
      for (const ch of val) consumeChar(ch);
    });

    input.addEventListener("beforeinput", (e) => {
      if (e.inputType === "deleteContentBackward") {
        e.preventDefault();
        input.value = "";
        consumeBackspace();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (!focused || !puzzle) return;
      const key = e.key;
      if (key === "Backspace") {
        e.preventDefault();
        consumeBackspace();
        return;
      }
      if (key === "ArrowRight") {
        e.preventDefault();
        focused = {
          row: focused.row,
          col: Math.min(focused.col + 1, puzzle.cols - 1),
          dir: "across",
        };
        skipToLetter(1, 0);
        paintFocus();
      } else if (key === "ArrowLeft") {
        e.preventDefault();
        focused = {
          row: focused.row,
          col: Math.max(focused.col - 1, 0),
          dir: "across",
        };
        skipToLetter(-1, 0);
        paintFocus();
      } else if (key === "ArrowDown") {
        e.preventDefault();
        focused = {
          row: Math.min(focused.row + 1, puzzle.rows - 1),
          col: focused.col,
          dir: "down",
        };
        skipToLetter(0, 1);
        paintFocus();
      } else if (key === "ArrowUp") {
        e.preventDefault();
        focused = {
          row: Math.max(focused.row - 1, 0),
          col: focused.col,
          dir: "down",
        };
        skipToLetter(0, -1);
        paintFocus();
      } else if (key === " " || key === "Tab") {
        e.preventDefault();
        const can = puzzle.cells[focused.row][focused.col];
        if (can && can.across != null && can.down != null) {
          focused.dir = focused.dir === "across" ? "down" : "across";
          paintFocus();
        }
      }
    });
  }

  function skipToLetter(dc, dr) {
    // Skip over block cells in the desired direction (no-op if landed on a letter).
    let { row, col } = focused;
    while (
      row >= 0 &&
      row < puzzle.rows &&
      col >= 0 &&
      col < puzzle.cols &&
      !puzzle.cells[row][col].letter
    ) {
      row += dr;
      col += dc;
    }
    if (
      row >= 0 &&
      row < puzzle.rows &&
      col >= 0 &&
      col < puzzle.cols &&
      puzzle.cells[row][col].letter
    ) {
      focused.row = row;
      focused.col = col;
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

  // ---------- Clue navigation ----------

  function wordsLinear() {
    const across = puzzle.words
      .filter((w) => w.dir === "across")
      .sort((a, b) => a.number - b.number);
    const down = puzzle.words
      .filter((w) => w.dir === "down")
      .sort((a, b) => a.number - b.number);
    return [...across, ...down];
  }

  function navClue(delta) {
    if (!puzzle) return;
    const list = wordsLinear();
    if (!list.length) return;
    let idx = -1;
    if (focused) {
      const c = puzzle.cells[focused.row][focused.col];
      const wIdx = focused.dir === "across" ? c.across : c.down;
      if (wIdx != null) {
        const w = puzzle.words[wIdx];
        idx = list.findIndex((x) => x === w);
      }
    }
    if (idx < 0) idx = 0;
    idx = (idx + delta + list.length) % list.length;
    const w = list[idx];
    focused = { row: w.row, col: w.col, dir: w.dir };
    paintFocus();
    focusHiddenInput();
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
    if (allRight) setStatus("Solved! Beautiful work.", "success");
    else if (anyFilled) setStatus("Some letters need another look.", "error");
    else setStatus("Try filling in a few letters first.", "");
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

  // ---------- Puzzle lifecycle ----------

  function buildPuzzle(grade, size, seed, { pushUrl = true } = {}) {
    const result = WW.generatePuzzle(lexicon, grade, size, seed);
    if (!result) {
      setStatus("Couldn't build a puzzle — try a different grade.", "error");
      return false;
    }
    puzzle = result;
    currentId = WW.encodeId(grade, size, seed);
    render();
    updateIdDisplay();
    if (pushUrl) {
      const url = new URL(window.location);
      url.searchParams.set("id", currentId);
      window.history.replaceState({}, "", url);
    }
    setStatus(
      `${puzzle.words.length} words placed. Tap a cell to start.`,
      "",
    );
    return true;
  }

  function updateIdDisplay() {
    if (!currentId) return;
    els.puzzleIdLabel.textContent = currentId;
    els.studyBtn.dataset.id = currentId;
    els.studyBtn.href = `study.html?id=${encodeURIComponent(currentId)}`;
    if (els.printBtn) {
      els.printBtn.href = `print.html?id=${encodeURIComponent(currentId)}`;
    }
  }

  function newPuzzle() {
    if (!lexicon.length) return;
    const grade = els.grade.value;
    const size = parseInt(els.size.value, 10);
    const seed = WW.pickRandomSeed();
    buildPuzzle(grade, size, seed);
  }

  function openById(rawId) {
    const parsed = WW.parseId(rawId);
    if (!parsed) {
      setStatus("That puzzle code doesn't look right. Try again.", "error");
      return;
    }
    if (parsed.version !== WW.VERSION) {
      setStatus(
        `Puzzle code is for a different version (v${parsed.version}).`,
        "error",
      );
      return;
    }
    els.grade.value = parsed.grade;
    els.size.value = String(parsed.size);
    buildPuzzle(parsed.grade, parsed.size, parsed.seed);
  }

  function copyId() {
    if (!currentId) return;
    navigator.clipboard?.writeText(currentId).then(
      () => setStatus(`Copied ${currentId} to clipboard.`, "success"),
      () => setStatus(`Puzzle code: ${currentId}`, ""),
    );
  }

  function toggleClueDrawer() {
    const expanded = els.cluePanel.classList.toggle("expanded");
    els.clueDrawerToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    const caret = els.clueDrawerToggle.querySelector(".caret");
    if (caret) caret.textContent = expanded ? "▴" : "▾";
  }

  // ---------- Boot ----------

  async function init() {
    els.boardEmpty.hidden = false;
    try {
      lexicon = await WW.loadLexicon(WW.LEXICON_URL);
    } catch (e) {
      els.boardEmpty.textContent = `Couldn't load lexicon: ${e.message}`;
      return;
    }
    els.boardEmpty.hidden = true;

    bindInput();

    els.newBtn.addEventListener("click", newPuzzle);
    els.checkBtn.addEventListener("click", checkPuzzle);
    els.revealBtn.addEventListener("click", revealPuzzle);
    els.grade.addEventListener("change", newPuzzle);
    els.size.addEventListener("change", newPuzzle);
    els.puzzleIdLabel.addEventListener("click", copyId);
    els.openIdBtn.addEventListener("click", () => {
      const code = prompt("Enter a puzzle code (e.g. WW2-ADM-K7F9P):");
      if (code) openById(code);
    });
    els.prevClue.addEventListener("click", () => navClue(-1));
    els.nextClue.addEventListener("click", () => navClue(1));
    els.clueDrawerToggle.addEventListener("click", toggleClueDrawer);

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam && WW.parseId(idParam)) openById(idParam);
    else newPuzzle();
  }

  init();
})();
