(() => {
  const WW = window.WordWeaver;
  const els = {
    sheet: document.getElementById("sheet"),
    sheetError: document.getElementById("sheetError"),
    sheetTitle: document.getElementById("sheetTitle"),
    metaGrade: document.getElementById("metaGrade"),
    metaCount: document.getElementById("metaCount"),
    metaId: document.getElementById("metaId"),
    wordList: document.getElementById("wordList"),
    backLink: document.getElementById("backLink"),
    printBtn: document.getElementById("printBtn"),
    generatedOn: document.getElementById("generatedOn"),
  };

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

  function partOfSpeechLabel(pos) {
    switch ((pos || "").toLowerCase()) {
      case "noun":
        return "noun";
      case "verb":
        return "verb";
      case "adj":
        return "adjective";
      case "adv":
        return "adverb";
      default:
        return pos || "";
    }
  }

  function renderSheet(parsed, puzzle) {
    els.metaGrade.textContent = WW.GRADE_LABELS[parsed.grade] || parsed.grade;
    els.metaCount.textContent = `${puzzle.words.length} words`;
    els.metaId.textContent = parsed.id;
    els.sheetTitle.textContent = `Study Sheet · ${WW.GRADE_LABELS[parsed.grade] || parsed.grade}`;
    els.backLink.href = `index.html?id=${encodeURIComponent(parsed.id)}`;

    const today = new Date();
    els.generatedOn.textContent = `Generated ${today.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`;

    // Sort alphabetically so the kid can study without spoiling number placement.
    const words = [...puzzle.words].sort((a, b) =>
      a.word.localeCompare(b.word),
    );

    els.wordList.innerHTML = words
      .map((w) => {
        const raw = w.raw || {};
        const pos = partOfSpeechLabel(raw.part_of_speech);
        const def = w.clue || "";
        const syns = raw.associations?.synonyms || [];
        const synLine = syns.length
          ? `<p class="syn"><span class="syn-label">Like:</span> ${escapeHtml(syns.slice(0, 4).join(", "))}</p>`
          : "";
        return `
          <article class="word-card">
            <header class="word-head">
              <h2 class="word-text">${escapeHtml(w.word)}</h2>
              ${pos ? `<span class="word-pos">${escapeHtml(pos)}</span>` : ""}
            </header>
            <p class="word-def">${escapeHtml(def)}</p>
            ${synLine}
          </article>
        `;
      })
      .join("");

    els.sheet.hidden = false;
  }

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (!idParam) {
      showError(
        "No puzzle code in the URL. Open this page from the puzzle's Study Sheet button.",
      );
      return;
    }
    const parsed = WW.parseId(idParam);
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
    const puzzle = WW.generatePuzzle(
      lexicon,
      parsed.grade,
      parsed.size,
      parsed.seed,
    );
    if (!puzzle) {
      showError("Couldn't rebuild this puzzle from its code.");
      return;
    }
    renderSheet(parsed, puzzle);
    els.printBtn.addEventListener("click", () => window.print());
  }

  init();
})();
