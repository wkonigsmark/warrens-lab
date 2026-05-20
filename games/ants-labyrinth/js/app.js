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

  const THEME_IDS = ['classic', 'dungeon', 'forest', 'space', 'handdrawn'];

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

  // Populate both algorithm dropdowns from the same registry.
  for (const a of Algorithms.list) {
    const o1 = new Option(a.label, a.id);
    algoSelect.appendChild(o1);
    const o2 = new Option(a.label, a.id);
    welcomeAlgo.appendChild(o2);
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
      // Move every child of panelLeft into adjustBody (except brand header).
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

    const ageHintText = AGE_PRESETS[state.age].hint;
    ageHint.textContent = ageHintText;
    if (welcomeHint) welcomeHint.textContent = ageHintText;

    const algo = Algorithms.list.find(a => a.id === state.algorithm);
    algoHint.textContent = algo ? algo.desc : '';
    printTitle.textContent = `Ant's Labyrinth — ${algo?.label || ''}`;

    btnSolve.classList.toggle('active', state.showSolution);
    btnSolve.textContent = state.showSolution ? '👁 Hide Solution' : '👁 Show Solution';

    // Drawer summary chip
    const themeLabel = welcomeTheme.options[welcomeTheme.selectedIndex]?.text ?? state.theme;
    adjustSumm.textContent = `Age ${state.age} · ${algo?.label || ''} · ${themeLabel}`;
  }

  // ---------------------------------------------------------------------------
  // Apply an age preset.
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
  // Regenerate maze + re-render. No-op in welcome state.
  // ---------------------------------------------------------------------------
  function regenerate() {
    pushStateToDom();
    if (state.mode !== 'play') return;
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
      regenerate();
      return;
    }
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
  applyAge(state.age);             // make sure rows/cols/braid match the default age
  if (hadUrlState) {
    // Returning visitor with a share link — skip welcome.
    enterPlay();
  } else {
    // First visit — show welcome card with current defaults visible.
    state.mode = 'welcome';
    pushStateToDom();
  }
})();
