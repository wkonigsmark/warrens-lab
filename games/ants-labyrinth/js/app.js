// Main UI controller.
//
// State machine: the app has two visible states, tracked on .app[data-state]:
//   "welcome" — first visit (no URL hash). Welcome card collects the essential
//               choices; the maze is not generated until the user opts in.
//   "play"    — maze is on screen. On phone/tablet, the desktop left panel
//               relocates into the in-maze "Adjust" drawer below the maze.
//
// Returning visits with a populated URL hash skip welcome and go straight to
// play, so share links work as expected.

(function () {

  // ---------------------------------------------------------------------------
  // Age presets — the most important UX hook.
  // ---------------------------------------------------------------------------
  // Each preset bakes in grid size + braid + wall thickness AND difficulty
  // levers (interior start/end, long-path bias). The higher presets crank
  // those harder-maze knobs that strong solvers can't easily defeat.
  const AGE_PRESETS = {
    '3-4': {
      rows: 6, cols: 6, braid: 1.0, wall: 4,
      interior: false, pathBias: 0,
      hint: 'Tiny grid, no dead ends, big markers — toddler-friendly.',
    },
    '5-6': {
      rows: 7, cols: 10, braid: 0.3, wall: 3,
      interior: false, pathBias: 0,
      hint: 'Light braiding, clear markers — for kindergarten.',
    },
    '7-8': {
      rows: 12, cols: 15, braid: 0.1, wall: 2,
      interior: false, pathBias: 0,
      hint: 'Minimal braiding, standard passage width.',
    },
    '9-10': {
      rows: 18, cols: 22, braid: 0.0, wall: 1.5,
      interior: true, pathBias: 50,
      hint: 'Perfect maze, interior S/E, long winding solution.',
    },
    '11-13': {
      rows: 28, cols: 36, braid: 0.0, wall: 1.5,
      interior: true, pathBias: 70,
      hint: 'Big grid, interior S/E, defeats wall-following.',
    },
    'expert': {
      rows: 40, cols: 50, braid: 0.0, wall: 1,
      interior: true, pathBias: 90,
      hint: 'Brutally long solution, interior S/E — for serious solvers.',
    },
  };

  const THEME_IDS = ['classic', 'dungeon', 'forest', 'space', 'handdrawn'];

  // Per-maze-type slider ranges + labels. The `rows` and `cols` state fields
  // are reused across types — they just mean different things (rect cols vs.
  // theta base sectors).
  const TYPE_CONFIG = {
    rect: {
      rowsLabel: 'Rows', colsLabel: 'Cols',
      rowsMin: 3, rowsMax: 60, colsMin: 3, colsMax: 60,
    },
    theta: {
      rowsLabel: 'Rings', colsLabel: 'Base sectors',
      rowsMin: 3, rowsMax: 15, colsMin: 4, colsMax: 12,
    },
    hex: {
      rowsLabel: 'Rows', colsLabel: 'Cols',
      rowsMin: 3, rowsMax: 30, colsMin: 3, colsMax: 30,
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
    mode: 'welcome',     // 'welcome' | 'play'
    thetaSE: 'center-out',  // 'center-out' | 'outer-opposite'
    interiorSE: false,      // when true, place S/E at random non-edge cells
    pathBias: 0,            // 0 = off; >0 = target solution length as % of cells
    checkpoints: 0,         // 0..3 — visit in order before reaching E
  };

  // ---------------------------------------------------------------------------
  // URL state (hash params, so refresh keeps the maze).
  // ---------------------------------------------------------------------------
  function readUrl() {
    if (!location.hash || location.hash.length < 2) return false;
    const params = new URLSearchParams(location.hash.slice(1));
    for (const k of ['age', 'type', 'algorithm', 'theme', 'seed']) {
      if (params.has(k)) state[k] = params.get(k);
    }
    for (const k of ['rows', 'cols', 'wall']) {
      if (params.has(k)) state[k] = +params.get(k);
    }
    if (params.has('braid')) state.braid = +params.get('braid');
    if (params.has('solve')) state.showSolution = params.get('solve') === '1';
    if (params.has('thetaSE')) state.thetaSE = params.get('thetaSE');
    if (params.has('interior')) state.interiorSE = params.get('interior') === '1';
    if (params.has('pathBias')) state.pathBias = +params.get('pathBias');
    if (params.has('cps')) state.checkpoints = +params.get('cps');
    return true;
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
    if (state.type === 'theta') p.set('thetaSE', state.thetaSE);
    if (state.interiorSE) p.set('interior', '1');
    if (state.pathBias > 0) p.set('pathBias', state.pathBias);
    if (state.checkpoints > 0) p.set('cps', state.checkpoints);
    history.replaceState(null, '', '#' + p.toString());
  }

  // ---------------------------------------------------------------------------
  // DOM refs.
  // ---------------------------------------------------------------------------
  const $ = id => document.getElementById(id);
  const app          = document.querySelector('.app');
  const panelLeft    = document.querySelector('.panel-left');
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
  const welcomeCard  = $('welcomeCard');
  const welcomeAlgo  = $('welcomeAlgorithm');
  const welcomeTheme = $('welcomeTheme');
  const welcomeHint  = welcomeCard.querySelector('.welcome-age-hint');
  const adjustDrawer = $('adjustDrawer');
  const adjustToggle = $('adjustToggle');
  const adjustBody   = $('adjustBody');
  const adjustSumm   = $('adjustSummary');
  const thetaSESel   = $('thetaSE');
  const colsName     = $('colsName');
  const rowsName     = $('rowsName');
  const interiorChk  = $('interiorSE');
  const pathBiasInp  = $('pathBias');
  const pathBiasVal  = $('pathBiasVal');
  const cpSel        = $('checkpoints');

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Populate algorithm dropdowns. We refill these on type change so only
  // algorithms supporting the current shape are shown.
  function refillAlgoSelect(sel, type) {
    const prev = sel.value;
    sel.innerHTML = '';
    const allowed = Algorithms.list.filter(a => a.supports.includes(type));
    for (const a of allowed) sel.appendChild(new Option(a.label, a.id));
    // Keep the user's prior pick if still valid; otherwise fall back.
    if (allowed.some(a => a.id === prev)) sel.value = prev;
    else if (allowed.some(a => a.id === state.algorithm)) sel.value = state.algorithm;
    else sel.value = allowed[0].id;
  }
  function syncAlgoSelectsToType() {
    refillAlgoSelect(algoSelect, state.type);
    refillAlgoSelect(welcomeAlgo, state.type);
    // If the previously-selected algorithm isn't supported, fall back.
    const supported = Algorithms.list.find(a => a.id === state.algorithm)?.supports.includes(state.type);
    if (!supported) state.algorithm = algoSelect.value;
  }
  syncAlgoSelectsToType();

  // Relabel & retune sliders based on the active maze type.
  function applyTypeSliders() {
    const cfg = TYPE_CONFIG[state.type] || TYPE_CONFIG.rect;
    rowsName.textContent = cfg.rowsLabel;
    colsName.textContent = cfg.colsLabel;
    rowsInput.min = cfg.rowsMin; rowsInput.max = cfg.rowsMax;
    colsInput.min = cfg.colsMin; colsInput.max = cfg.colsMax;
    // Clamp current values into the new range.
    state.rows = clamp(state.rows, cfg.rowsMin, cfg.rowsMax);
    state.cols = clamp(state.cols, cfg.colsMin, cfg.colsMax);
  }

  // ---------------------------------------------------------------------------
  // Mobile / desktop layout helpers.
  // The panel-left contents need to live in two places: the desktop sidebar
  // (default), or the drawer below the maze on small screens. We physically
  // move the nodes between those two parents on resize so all the existing
  // event listeners keep working.
  // ---------------------------------------------------------------------------
  const MOBILE_QUERY = window.matchMedia('(max-width: 900px)');

  function syncLayoutForViewport() {
    // Only relocate during play state — welcome state hides the left panel
    // anyway and the welcome card carries its own copies.
    if (state.mode !== 'play') return;
    const isMobile = MOBILE_QUERY.matches;
    if (isMobile) {
      // Move every child of panelLeft into adjustBody.
      while (panelLeft.firstChild) {
        adjustBody.appendChild(panelLeft.firstChild);
      }
    } else {
      // Move them back to panelLeft on widening.
      while (adjustBody.firstChild) {
        panelLeft.appendChild(adjustBody.firstChild);
      }
    }
  }
  MOBILE_QUERY.addEventListener('change', syncLayoutForViewport);

  // ---------------------------------------------------------------------------
  // Sync DOM <- state.
  // ---------------------------------------------------------------------------
  function pushStateToDom() {
    app.dataset.state = state.mode;
    app.dataset.theme = state.theme;
    app.dataset.type  = state.type;

    // All age buttons across both panels stay in sync via dataset.
    for (const btn of document.querySelectorAll('.age-btn')) {
      btn.classList.toggle('active', btn.dataset.age === state.age);
    }
    for (const btn of document.querySelectorAll('.tab-btn')) {
      btn.classList.toggle('active', btn.dataset.type === state.type);
    }

    algoSelect.value   = state.algorithm;
    welcomeAlgo.value  = state.algorithm;
    themeSelect.value  = state.theme;
    thetaSESel.value   = state.thetaSE;
    welcomeTheme.value = state.theme;
    colsInput.value   = state.cols;
    rowsInput.value   = state.rows;
    braidInput.value  = Math.round(state.braid * 100);
    wallInput.value   = state.wall;
    colsVal.textContent  = state.cols;
    rowsVal.textContent  = state.rows;
    braidVal.textContent = Math.round(state.braid * 100);
    wallVal.textContent  = state.wall;
    seedInput.value   = state.seed;
    interiorChk.checked    = state.interiorSE;
    pathBiasInp.value      = state.pathBias;
    pathBiasVal.textContent = state.pathBias;
    cpSel.value            = String(state.checkpoints);

    const ageHintText = AGE_PRESETS[state.age].hint;
    ageHint.textContent = ageHintText;
    if (welcomeHint) welcomeHint.textContent = ageHintText;

    const algo = Algorithms.list.find(a => a.id === state.algorithm);
    algoHint.textContent = algo ? algo.desc : '';
    // The brand wordmark lives in the logo image now, so the title slot is
    // just the algorithm name (acts as a subtitle on the print sheet).
    printTitle.textContent = algo?.label || '';

    btnSolve.classList.toggle('active', state.showSolution);
    btnSolve.textContent = state.showSolution ? '👁 Hide Solution' : '👁 Show Solution';

    // Drawer summary chip
    adjustSumm.textContent = 'Maze Configuration';
  }

  // ---------------------------------------------------------------------------
  // Apply an age preset.
  // ---------------------------------------------------------------------------
  function applyAge(age) {
    state.age = age;
    const p = AGE_PRESETS[age];
    state.rows       = p.rows;
    state.cols       = p.cols;
    state.braid      = p.braid;
    state.wall       = p.wall;
    state.interiorSE = p.interior;
    state.pathBias   = p.pathBias;
  }

  // ---------------------------------------------------------------------------
  // Regenerate maze + re-render. No-op in welcome state.
  // ---------------------------------------------------------------------------
  function regenerate() {
    pushStateToDom();
    if (state.mode !== 'play') return;
    writeUrl();
    mazeFrame.innerHTML = '';

    const algo = Algorithms.list.find(a => a.id === state.algorithm) || Algorithms.list[0];

    // Shared closure that builds + carves + braids a grid given a seed. Used
    // by the path-bias retry loop for rect and hex.
    function buildGrid(GridClass, seed) {
      const grid = new GridClass(state.rows, state.cols);
      const r = new RNG(seed);
      algo.fn(grid, r);
      Algorithms.braid(grid, r, state.braid);
      return grid;
    }

    // Place checkpoints (if requested) and compute the solution chained
    // through them. solveFor() returns the full S→...→E path, or null.
    function applyExtras(grid) {
      const placeRng = new RNG(state.seed + ':cps');
      Placement.placeCheckpoints(grid, state.checkpoints, placeRng);
      const solution = state.showSolution
        ? (state.checkpoints > 0 ? Placement.solveThroughCheckpoints(grid) : Solver.solveBFS(grid))
        : null;
      return { solution, checkpoints: grid.checkpoints || [] };
    }

    let svg;
    if (state.type === 'rect') {
      const { grid } = Placement.generateWithPathBias(state.seed, {
        targetFrac: state.pathBias / 100,
        interior: state.interiorSE,
        maxTries: 30,
      }, (s) => buildGrid(RectGrid, s));
      const { solution, checkpoints } = applyExtras(grid);
      const cellSize = clamp(560 / Math.max(state.cols, state.rows), 8, 60);
      svg = Renderer.rect(grid, {
        cellSize,
        wallThick: state.wall,
        theme: state.theme,
        seed: state.seed,
        solution, checkpoints,
      });
    } else if (state.type === 'theta') {
      // For theta: state.rows = rings, state.cols = baseSectors.
      const grid = new ThetaGrid(state.rows, state.cols, { startEnd: state.thetaSE });
      const rng = new RNG(state.seed);
      algo.fn(grid, rng);
      Algorithms.braid(grid, rng, state.braid);
      const { solution, checkpoints } = applyExtras(grid);
      // Scale ring depth so the whole maze fits comfortably in the panel.
      const ringDepth = clamp(540 / (state.rows * 2), 22, 50);
      svg = Renderer.theta(grid, {
        ringDepth,
        wallThick: state.wall,
        theme: state.theme,
        seed: state.seed,
        solution, checkpoints,
      });
    } else if (state.type === 'hex') {
      const { grid } = Placement.generateWithPathBias(state.seed, {
        targetFrac: state.pathBias / 100,
        interior: state.interiorSE,
        maxTries: 30,
      }, (s) => buildGrid(HexGrid, s));
      const { solution, checkpoints } = applyExtras(grid);
      const size = clamp(540 / (Math.max(state.cols * 1.732, state.rows * 1.5)), 8, 50);
      svg = Renderer.hex(grid, {
        size,
        wallThick: state.wall,
        theme: state.theme,
        seed: state.seed,
        solution, checkpoints,
      });
    } else {
      svg = Renderer.hex();  // shouldn't happen, but harmless fallback
    }
    mazeFrame.appendChild(svg);
  }

  // ---------------------------------------------------------------------------
  // Enter play state from welcome (or from a direct URL load).
  // ---------------------------------------------------------------------------
  function enterPlay() {
    state.mode = 'play';
    pushStateToDom();
    syncLayoutForViewport();
    regenerate();
  }

  // ---------------------------------------------------------------------------
  // Surprise me: randomize algorithm + theme so "you never get the same boring
  // maze twice". Keeps age the user picked.
  // ---------------------------------------------------------------------------
  function surprise() {
    const rng = new RNG(String(Date.now()));
    state.algorithm = rng.pick(Algorithms.list).id;
    state.theme     = rng.pick(THEME_IDS);
    state.seed      = String(Math.floor(Math.random() * 1e9));
  }

  // ---------------------------------------------------------------------------
  // Event wiring. Every age/type button (welcome or play panel) shares the
  // same data-* attributes, so a single delegated handler covers both.
  // ---------------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const ageBtn = e.target.closest('.age-btn');
    if (ageBtn) {
      applyAge(ageBtn.dataset.age);
      regenerate();
      return;
    }
    const typeBtn = e.target.closest('.tab-btn');
    if (typeBtn) {
      state.type = typeBtn.dataset.type;
      applyTypeSliders();
      syncAlgoSelectsToType();
      regenerate();
      return;
    }
  });

  thetaSESel.addEventListener('change', () => {
    state.thetaSE = thetaSESel.value;
    regenerate();
  });

  interiorChk.addEventListener('change', () => {
    state.interiorSE = interiorChk.checked;
    regenerate();
  });

  pathBiasInp.addEventListener('input', () => {
    state.pathBias = +pathBiasInp.value;
    pathBiasVal.textContent = state.pathBias;
    regenerate();
  });

  cpSel.addEventListener('change', () => {
    state.checkpoints = +cpSel.value;
    regenerate();
  });

  algoSelect.addEventListener('change', () => {
    state.algorithm = algoSelect.value;
    regenerate();
  });
  welcomeAlgo.addEventListener('change', () => {
    state.algorithm = welcomeAlgo.value;
    pushStateToDom();
  });
  themeSelect.addEventListener('change', () => {
    state.theme = themeSelect.value;
    regenerate();
  });
  welcomeTheme.addEventListener('change', () => {
    state.theme = welcomeTheme.value;
    pushStateToDom();
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

  // Welcome card actions.
  $('btnMake').addEventListener('click', () => {
    enterPlay();
  });
  $('btnSurprise').addEventListener('click', () => {
    surprise();
    enterPlay();
  });

  // Adjust drawer toggle.
  adjustToggle.addEventListener('click', () => {
    const open = adjustToggle.getAttribute('aria-expanded') === 'true';
    adjustToggle.setAttribute('aria-expanded', String(!open));
    adjustBody.hidden = open;
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
  // TODO: Batch PDF export — see jsPDF (https://github.com/parallax/jsPDF).
  // TODO: Special cells (checkpoints, keys, one-way).
  // TODO: Interactive solve mode.
  // TODO: Theta + hex full generation.
  // ---------------------------------------------------------------------------

  // Boot.
  const hadUrlState = readUrl();
  // Only apply the age preset when there's no URL state. Otherwise we'd
  // clobber the explicit rows/cols/interior/etc that the share link carries.
  if (!hadUrlState) applyAge(state.age);
  syncAlgoSelectsToType();         // type read from URL may differ from default
  applyTypeSliders();              // relabel + retune sliders for the active type
  if (hadUrlState) {
    // Returning visitor with a share link — skip welcome.
    enterPlay();
  } else {
    // First visit — show welcome card with current defaults visible.
    state.mode = 'welcome';
    pushStateToDom();
  }
})();
