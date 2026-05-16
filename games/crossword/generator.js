// Shared crossword generation logic + puzzle ID encoding.
// Used by script.js (puzzle page) and study.js (study sheet).
// Exposes the global `WordWeaver`.

(() => {
  const VERSION = 2;
  const MAX_GRID = 15;
  const MIN_WORD_LEN = 3;
  const MAX_WORD_LEN = 9;

  // Difficulty ordering — selecting a grade includes all easier grades too,
  // so higher levels have more short bridging words alongside their tough ones.
  const GRADE_ORDER = ["preK", "K", "1", "2", "3", "4", "5+", "Adult"];

  // Grade selector values map to short codes that fit in a puzzle ID.
  const GRADE_CODES = {
    "preK,K": "PK",
    "1,2": "12",
    "3,4": "34",
    "5+": "5P",
    Adult: "AD",
  };
  const GRADE_FROM_CODE = Object.fromEntries(
    Object.entries(GRADE_CODES).map(([k, v]) => [v, k]),
  );
  const GRADE_LABELS = {
    "preK,K": "Pre-K & K",
    "1,2": "1st – 2nd",
    "3,4": "3rd – 4th",
    "5+": "5th & up",
    Adult: "Adult",
  };
  const SIZE_CODES = { 6: "S", 10: "M", 14: "L" };
  const SIZE_FROM_CODE = { S: 6, M: 10, L: 14 };
  const SIZE_LABELS = { 6: "Small (6 words)", 10: "Medium (10 words)", 14: "Large (14 words)" };

  // 32-char alphabet (no 0/1/I/L/O) — easier for kids to read off a printed sheet.
  const SEED_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

  // ---------- Seeded RNG (mulberry32) ----------

  function mulberry32(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickRandomSeed() {
    return Math.floor(Math.random() * Math.pow(SEED_ALPHABET.length, 5));
  }

  // ---------- ID encoding ----------

  function encodeSeed(seed) {
    const a = SEED_ALPHABET;
    let s = seed >>> 0;
    let out = "";
    for (let i = 0; i < 5; i++) {
      out = a[s % a.length] + out;
      s = Math.floor(s / a.length);
    }
    return out;
  }

  function decodeSeed(code) {
    const a = SEED_ALPHABET;
    let s = 0;
    for (const ch of code) {
      const idx = a.indexOf(ch);
      if (idx < 0) return null;
      s = s * a.length + idx;
    }
    return s >>> 0;
  }

  function encodeId(grade, size, seed) {
    const g = GRADE_CODES[grade];
    const sz = SIZE_CODES[size];
    if (!g || !sz) return null;
    return `WW${VERSION}-${g}${sz}-${encodeSeed(seed)}`;
  }

  function parseId(rawId) {
    if (!rawId) return null;
    const id = String(rawId).trim().toUpperCase();
    const m = /^WW(\d+)-([A-Z0-9]{2})([SML])-([A-Z0-9]{5})$/.exec(id);
    if (!m) return null;
    const version = parseInt(m[1], 10);
    const grade = GRADE_FROM_CODE[m[2]];
    const size = SIZE_FROM_CODE[m[3]];
    const seed = decodeSeed(m[4]);
    if (!grade || !size || seed === null) return null;
    return { version, grade, size, seed, id };
  }

  // ---------- Lexicon filter (deterministic baseline order) ----------

  function expandCumulativeGrades(gradeValue) {
    // gradeValue is like "1,2" or "5+" — find the highest selected grade in
    // GRADE_ORDER, then include everything at or below that ceiling.
    const selected = gradeValue.split(",");
    let maxIdx = -1;
    for (const g of selected) {
      const idx = GRADE_ORDER.indexOf(g);
      if (idx > maxIdx) maxIdx = idx;
    }
    if (maxIdx === -1) return new Set(selected);
    return new Set(GRADE_ORDER.slice(0, maxIdx + 1));
  }

  function pickCandidates(lexicon, gradeValue, count, rng) {
    const allowed = expandCumulativeGrades(gradeValue);
    const filtered = lexicon.filter((w) => {
      if (!allowed.has(w.grade_level)) return false;
      const word = (w.word || "").toUpperCase();
      if (!/^[A-Z]+$/.test(word)) return false;
      if (word.length < MIN_WORD_LEN || word.length > MAX_WORD_LEN) return false;
      if (!w.senses || !w.senses[0] || !w.senses[0].definition) return false;
      return true;
    });
    // Deterministic baseline before any seeded shuffling: alphabetical by word.
    filtered.sort((a, b) =>
      a.word.toUpperCase().localeCompare(b.word.toUpperCase()),
    );
    shuffle(filtered, rng);
    // No slice cap — keep all eligible words so short bridges (3–4 letters)
    // are reachable as fill, not just the longest 80 anchors.
    return filtered;
  }

  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
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
        const pr1 = r + dc,
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

    const pool = candidates.slice(1);
    for (const entry of pool) {
      if (placed.length >= targetCount) break;
      const w = entry.word.toUpperCase();
      if (placed.some((p) => p.word === w)) continue;

      const tries = [];
      for (let i = 0; i < w.length; i++) {
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (grid[r][c] !== w[i]) continue;
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
    if (maxR === -1) return { grid: [[]], placed: [], rows: 0, cols: 0 };
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

    let counter = 0;
    const wordsByStart = new Map();
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      wordsByStart.set(`${p.row},${p.col},${p.dir}`, i);
    }
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
            placed[wordsByStart.get(`${r},${c},across`)].number = counter;
          }
          if (startsDown && wordsByStart.has(`${r},${c},down`)) {
            placed[wordsByStart.get(`${r},${c},down`)].number = counter;
          }
        }
      }
    }

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
    return entry.senses?.[0]?.definition || "";
  }

  // ---------- Top-level generator ----------

  function generatePuzzle(lexicon, grade, size, seed) {
    const rng = mulberry32(seed);
    const candidates = pickCandidates(lexicon, grade, size, rng);
    if (candidates.length < 2) return null;

    let best = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      shuffle(candidates, rng);
      // Pick a long word as anchor (placed at grid center) for solid geometry…
      candidates.sort((a, b) => b.word.length - a.word.length);
      // …but randomize what follows, so short bridge words can be tried.
      if (candidates.length > 1) {
        const tail = candidates.slice(1);
        shuffle(tail, rng);
        for (let i = 0; i < tail.length; i++) candidates[i + 1] = tail[i];
      }
      const result = generate(candidates, size);
      if (!result.placed || result.placed.length === 0) continue;
      if (!best || result.placed.length > best.placed.length) best = result;
      if (best.placed.length >= size) break;
    }
    if (!best || best.placed.length === 0) return null;
    return numberPuzzle(best);
  }

  // Lexicon loader is shared too — same URL, same parsing.
  async function loadLexicon(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Lexicon fetch failed: ${res.status}`);
    return res.json();
  }

  window.WordWeaver = {
    VERSION,
    GRADE_CODES,
    GRADE_FROM_CODE,
    GRADE_LABELS,
    SIZE_CODES,
    SIZE_FROM_CODE,
    SIZE_LABELS,
    LEXICON_URL: "../../iq/lexicon/lexicon_seed_project/lexicon_seed.json",
    pickRandomSeed,
    encodeId,
    parseId,
    generatePuzzle,
    loadLexicon,
  };
})();
