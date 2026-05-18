(() => {
  const WW = window.WordWeaver;
  const els = {
    sheet: document.getElementById("sheet"),
    sheetError: document.getElementById("sheetError"),
    sheetTitle: document.getElementById("sheetTitle"),
    sheetMeta: document.getElementById("sheetMeta"),
    metaId: document.getElementById("metaId"),
    board: document.getElementById("board"),
    acrossClues: document.getElementById("acrossClues"),
    downClues: document.getElementById("downClues"),
    backLink: document.getElementById("backLink"),
    printBtn: document.getElementById("printBtn"),
    showAnswers: document.getElementById("showAnswers"),
    generatedOn: document.getElementById("generatedOn"),
  };

  let puzzle = null;
  let parsed = null;

  function showError(msg) {
    els.sheet.hidden = true;
    els.sheetError.hidden = false;
    els.sheetError.textContent = msg;
  }

  function escapeHtml(s) {
    return String(s).replace(
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

  function renderGrid(showAnswers) {
    const { rows, cols, cells } = puzzle;
    els.board.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    els.board.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    // Keep the grid sized to leave room for clues on the page.
    const maxIn = Math.min(5.4, cols * 0.42);
    els.board.style.width = `${maxIn}in`;

    els.board.innerHTML = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cells[r][c];
        const div = document.createElement("div");
        if (!cell.letter) {
          div.className = "pcell block";
          els.board.appendChild(div);
          continue;
        }
        div.className = "pcell";
        if (cell.number !== null) {
          const n = document.createElement("span");
          n.className = "pnum";
          n.textContent = String(cell.number);
          div.appendChild(n);
        }
        if (showAnswers) {
          const letter = document.createElement("span");
          letter.className = "pletter";
          letter.textContent = cell.letter;
          div.appendChild(letter);
        }
        els.board.appendChild(div);
      }
    }
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
    for (const w of across) els.acrossClues.appendChild(clueLi(w));
    for (const w of down) els.downClues.appendChild(clueLi(w));
  }

  function clueLi(w) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="num">${w.number}.</span><span>${escapeHtml(w.clue)}</span>`;
    return li;
  }

  function renderSheet() {
    els.metaId.textContent = parsed.id;
    els.sheetMeta.textContent = `${WW.GRADE_LABELS[parsed.grade] || parsed.grade} · ${WW.sizeLabel(parsed.size)}`;
    els.sheetTitle.textContent = `Crossword · ${WW.GRADE_LABELS[parsed.grade] || parsed.grade}`;
    els.backLink.href = `index.html?id=${encodeURIComponent(parsed.id)}`;
    const today = new Date();
    els.generatedOn.textContent = `Generated ${today.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`;
    renderGrid(els.showAnswers.checked);
    renderClues();
    els.sheet.hidden = false;
  }

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (!idParam) {
      showError(
        "No puzzle code in the URL. Open this page from the puzzle's Print button.",
      );
      return;
    }
    parsed = WW.parseId(idParam);
    if (!parsed) {
      showError(`That puzzle code doesn't look right: ${idParam}`);
      return;
    }
    if (parsed.version !== WW.VERSION) {
      showError(
        `Puzzle code is for a different version (v${parsed.version}). This page is v${WW.VERSION}.`,
      );
      return;
    }
    let lexicon;
    try {
      lexicon = await WW.loadLexicon(WW.LEXICON_URL);
    } catch (e) {
      showError(`Couldn't load lexicon: ${e.message}`);
      return;
    }
    puzzle = WW.generatePuzzle(lexicon, parsed.grade, parsed.size, parsed.seed);
    if (!puzzle) {
      showError("Couldn't rebuild this puzzle from its code.");
      return;
    }
    renderSheet();
    els.showAnswers.addEventListener("change", () =>
      renderGrid(els.showAnswers.checked),
    );
    els.printBtn.addEventListener("click", () => window.print());
  }

  init();
})();
