// Main UI controller.
//
// Single source of truth = `state`. Every control mutates state, then we
// call regenerate() which re-runs the algorithm and re-renders. Cheap: even
// 40x40 mazes regenerate in a couple of milliseconds.

(function () {

  // ---------------------------------------------------------------------------
  // Age presets — the most important UX hook. The user picks an age and all
  // four key parameters jump to a coherent set; they can still fine-tune.
  // ---------------------------------------------------------------------------
  const AGE_PRESETS = {
    '3-4': {
      rows: 6, cols: 6, braid: 1.0, wall: 4,
      hint: 'Tiny grid, no dead ends, big markers — toddler-friendly.',
    },
    '5-6': {
      rows: 7, cols: 10, braid: 0.3, wall: 3,
      hint: 'Light braiding, clear markers — for kindergarten.',
    },
    '7-8': {
      rows: 12, cols: 15, braid: 0.1, wall: 2,
      hint: 'Minimal braiding, standard passage width.',
    },
    '9-10': {
      rows: 18, cols: 22, braid: 0.0, wall: 1.5,
      hint: 'Perfect maze, narrow passages, long solution.',
    },
  };

  // Defaults (overridden by URL hash if present).
  const state = {
    age: '5-6',
    type: 'rect',
    algorithm: 'backtracker',
    theme: 'classic',
    rows: 7,
    cols: 10,
    braid: 0.3,
    wall: 3,
    seed: String(Math.floor(Math.random() * 1e9)),
    showSolution: false,
  };

  // ---------------------------------------------------------------------------
  // URL state (hash params, so refresh keeps the maze).
  // ---------------------------------------------------------------------------
  function readUrl() {
    if (!location.hash || location.hash.length < 2) return;
    const params = new URLSearchParams(location.hash.slice(1));
    for (const k of ['age', 'type', 'algorithm', 'theme', 'seed']) {
      if (params.has(k)) state[k] = params.get(k);
    }
    for (const k of ['rows', 'cols', 'wall']) {
      if (params.has(k)) state[k] = +params.get(k);
    }
    if (params.has('braid')) state.braid = +params.get('braid');
    if (params.has('solve')) state.showSolution = params.get('solve') === '1';
  }
  function writeUrl() {
    const p = new URLSearchParams();
    p.set('age', state.age);
    p.set('type', state.type);
    p.set('algorithm', state.algorithm);
    p.set('theme', state.theme);
    p.set('rows', state.rows);
    p.set('cols', state.cols);
    p.set('braid', state.braid.toFixed(2));
    p.set('wall', state.wall);
    p.set('seed', state.seed);
    if (state.showSolution) p.set('solve', '1');
    history.replaceState(null, '', '#' + p.toString());
  }

  // ---------------------------------------------------------------------------
  // DOM refs.
  // ---------------------------------------------------------------------------
  const $ = id => document.getElementById(id);
  const app          = document.querySelector('.app');
  const algoSelect   = $('algorithm');
  const algoHint     = $('algoHint');
  const themeSelect  = $('theme');
  const colsInput    = $('cols');
  const rowsInput    = $('rows');
  const braidInput   = $('braid');
  const wallInput    = $('wall');
  const colsVal      = $('colsVal');
  const rowsVal      = $('rowsVal');
  const braidVal     = $('braidVal');
  const wallVal      = $('wallVal');
  const seedInput    = $('seed');
  const mazeFrame    = $('mazeFrame');
  const ageHint      = $('ageHint');
  const printTitle   = $('printTitle');
  const btnSolve     = $('btnSolve');
  const toast        = $('toast');

  // Populate algorithm dropdown from registry.
  for (const a of Algorithms.list) {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.label;
    algoSelect.appendChild(opt);
  }

  // ---------------------------------------------------------------------------
  // Sync DOM <- state.
  // ---------------------------------------------------------------------------
  function pushStateToDom() {
    // Age buttons
    for (const btn of document.querySelectorAll('.age-btn')) {
      btn.classList.toggle('active', btn.dataset.age === state.age);
    }
    // Type tabs
    for (const btn of document.querySelectorAll('.tab-btn')) {
      btn.classList.toggle('active', btn.dataset.type === state.type);
    }
    algoSelect.value  = state.algorithm;
    themeSelect.value = state.theme;
    colsInput.value   = state.cols;
    rowsInput.value   = state.rows;
    braidInput.value  = Math.round(state.braid * 100);
    wallInput.value   = state.wall;
    colsVal.textContent  = state.cols;
    rowsVal.textContent  = state.rows;
    braidVal.textContent = Math.round(state.braid * 100);
    wallVal.textContent  = state.wall;
    seedInput.value   = state.seed;
    app.dataset.theme = state.theme;
    ageHint.textContent = AGE_PRESETS[state.age].hint;
    const algo = Algorithms.list.find(a => a.id === state.algorithm);
    algoHint.textContent = algo ? algo.desc : '';
    printTitle.textContent = `Ant's Labyrinth — ${algo?.label || ''}`;
    btnSolve.classList.toggle('active', state.showSolution);
    btnSolve.textContent = state.showSolution ? '👁 Hide Solution' : '👁 Show Solution';
  }

  // ---------------------------------------------------------------------------
  // Apply an age preset (overwrites grid + difficulty knobs, keeps theme/algo).
  // ---------------------------------------------------------------------------
  function applyAge(age) {
    state.age = age;
    const p = AGE_PRESETS[age];
    state.rows  = p.rows;
    state.cols  = p.cols;
    state.braid = p.braid;
    state.wall  = p.wall;
  }

  // ---------------------------------------------------------------------------
  // Regenerate maze + re-render.
  // ---------------------------------------------------------------------------
  function regenerate() {
    pushStateToDom();
    writeUrl();
    mazeFrame.innerHTML = '';

    let svg;
    if (state.type === 'rect') {
      const grid = new Grid(state.rows, state.cols);
      const rng  = new RNG(state.seed);
      const algo = Algorithms.list.find(a => a.id === state.algorithm) || Algorithms.list[0];
      algo.fn(grid, rng);
      Algorithms.braid(grid, rng, state.braid);

      const solution = state.showSolution ? Solver.solveBFS(grid) : null;
      // Cell size is computed so the SVG roughly fits the viewport.
      const cellSize = clamp(560 / Math.max(state.cols, state.rows), 14, 60);
      svg = Renderer.rect(grid, {
        cellSize,
        wallThick: state.wall,
        theme: state.theme,
        seed: state.seed,
        solution,
      });
    } else if (state.type === 'hex') {
      svg = Renderer.hex();
    } else {
      svg = Renderer.theta();
    }
    mazeFrame.appendChild(svg);
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ---------------------------------------------------------------------------
  // Event wiring.
  // ---------------------------------------------------------------------------
  document.querySelectorAll('.age-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyAge(btn.dataset.age);
      regenerate();
    });
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.type = btn.dataset.type;
      regenerate();
    });
  });
  algoSelect.addEventListener('change', () => {
    state.algorithm = algoSelect.value;
    regenerate();
  });
  themeSelect.addEventListener('change', () => {
    state.theme = themeSelect.value;
    regenerate();   // re-render so hand-drawn jitter takes effect
  });
  colsInput.addEventListener('input', () => {
    state.cols = +colsInput.value;
    colsVal.textContent = state.cols;
    regenerate();
  });
  rowsInput.addEventListener('input', () => {
    state.rows = +rowsInput.value;
    rowsVal.textContent = state.rows;
    regenerate();
  });
  braidInput.addEventListener('input', () => {
    state.braid = (+braidInput.value) / 100;
    braidVal.textContent = +braidInput.value;
    regenerate();
  });
  wallInput.addEventListener('input', () => {
    state.wall = +wallInput.value;
    wallVal.textContent = state.wall;
    regenerate();
  });
  seedInput.addEventListener('change', () => {
    state.seed = seedInput.value.trim() || '1';
    regenerate();
  });
  $('reseed').addEventListener('click', () => {
    state.seed = String(Math.floor(Math.random() * 1e9));
    regenerate();
  });

  // ---------------------------------------------------------------------------
  // Bottom bar.
  // ---------------------------------------------------------------------------
  $('btnNew').addEventListener('click', () => {
    state.seed = String(Math.floor(Math.random() * 1e9));
    regenerate();
  });
  $('btnSolve').addEventListener('click', () => {
    state.showSolution = !state.showSolution;
    regenerate();
  });
  $('btnPrint').addEventListener('click', () => window.print());
  $('btnShare').addEventListener('click', async () => {
    writeUrl();
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Share link copied!');
    } catch {
      showToast('Copy failed — link is in the address bar.');
    }
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  // ---------------------------------------------------------------------------
  // Stretch goal hooks — left as TODOs so the structure stays visible.
  //
  // TODO: Batch PDF export. Add a "Make N mazes" control; for each, build the
  //   SVG and feed into jsPDF (https://github.com/parallax/jsPDF) — one page
  //   each, then prompt download.
  //
  // TODO: Special cells. Extend Cell with `marker: 'checkpoint' | 'key' | ...`
  //   and a `passable(from)` predicate for one-way passages. Renderer would
  //   draw an icon in the cell; solver would check `passable`.
  //
  // TODO: Interactive solve mode. Track a "player" cell, listen for arrow keys
  //   / touch gestures, validate against `cell.isLinked(target)`. Lay it over
  //   the existing SVG as a separate <g>.
  //
  // TODO: Theta + hex generation. The current generators use cell.neighbors,
  //   which already abstracts direction. A theta grid would set up neighbors
  //   as { CW, CCW, IN, OUT } and a theta renderer would draw arcs.
  // ---------------------------------------------------------------------------

  // Boot.
  readUrl();
  if (state.age && AGE_PRESETS[state.age] && !location.hash) applyAge(state.age);
  regenerate();
})();
