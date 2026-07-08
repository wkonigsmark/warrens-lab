(function () {
  function initAntsAlgebra() {
    const root = document.getElementById('ants-algebra-root');
    if (!root) return;

    root.innerHTML = `
      <div class="banner-container">
        <img id="banner" src="banner-ants-algebra.png" alt="Ants & Algebra" fetchpriority="high" loading="eager">
      </div>

      <header>
        <div class="header-left">
          <a class="pill-btn" href="../ants-apples/index.html" title="Back to Ants & Apples">← Ants & Apples</a>
          <a class="pill-btn primary" href="../index.html" title="IQ Toolkit">IQ</a>
          <button id="help-btn" class="pill-btn help" type="button" title="How to play">? Help</button>
          <button id="music-toggle-btn" class="pill-btn music" type="button" title="Toggle background music">Music: On</button>
          <button id="print-worksheet-btn" class="pill-btn print" type="button" title="Print a worksheet for the current mode">Print Worksheet</button>
        </div>
      </header>

      <audio id="bg-music" src="../ants-apples/assets/hyrule_theme.mp3" preload="auto" loop></audio>

      <main>
        <div class="mode-tabs" role="tablist" aria-label="Choose mode">
          <button id="mode-solve" class="mode-tab active" type="button">Solve x</button>
          <button id="mode-chain" class="mode-tab" type="button">Chains</button>
          <button id="mode-chainx" class="mode-tab" type="button">Chains &amp; X</button>
        </div>

        <div id="settings-solve" class="settings-row">
          <div class="op-settings">
            <button id="op-add" class="op-btn active" type="button" title="Addition">+</button>
            <button id="op-sub" class="op-btn" type="button" title="Subtraction">−</button>
            <button id="op-mul" class="op-btn" type="button" title="Multiplication">×</button>
            <button id="op-div" class="op-btn" type="button" title="Division">÷</button>
          </div>
        </div>

        <div id="settings-chain" class="settings-row" style="display:none;">
          <div id="chain-len-group" style="display:flex; align-items:center; gap:6px;">
            <span class="label">Len:</span>
            <button class="len-btn active" data-len="3" type="button">3</button>
            <button class="len-btn" data-len="4" type="button">4</button>
            <button class="len-btn" data-len="5" type="button">5</button>
          </div>
          <span class="divider"></span>
          <button id="chain-mode-toggle" class="toggle-btn" type="button">Simple</button>
          <button id="chain-neg-toggle" class="toggle-btn" type="button">Pos only</button>
        </div>

        <div id="settings-chainx" class="settings-row" style="display:none;">
          <button id="chainx-mode-toggle" class="toggle-btn" type="button">Simple</button>
          <button id="chainx-neg-toggle" class="toggle-btn" type="button">Pos only</button>
        </div>

        <div class="problem-box">
          <div id="prob-text" class="problem-text">2 + x = 5</div>
          <div class="input-row">
            <span id="input-label" class="x-label"><span class="xvar">x</span> =</span>
            <input id="x-input" class="x-input" type="text" inputmode="none" readonly placeholder="?">
          </div>
        </div>

        <div class="controls">
          <button id="check-btn" class="btn" type="button">Check Answer</button>
          <button id="next-btn" class="btn secondary" type="button">New Problem</button>
          <div id="msg" class="message"></div>
        </div>

        <div class="keypad" id="keypad">
          <div class="key" data-k="1">1</div>
          <div class="key" data-k="2">2</div>
          <div class="key" data-k="3">3</div>
          <div class="key" data-k="4">4</div>
          <div class="key" data-k="5">5</div>
          <div class="key" data-k="6">6</div>
          <div class="key" data-k="7">7</div>
          <div class="key" data-k="8">8</div>
          <div class="key" data-k="9">9</div>
          <div class="key action neg" data-k="-">±</div>
          <div class="key" data-k="0">0</div>
          <div class="key action clear" data-k="C">CLR</div>
        </div>

        <div class="status">
          Solved: <span class="accent" id="solved">0</span> ·
          Streak: <span class="accent" id="streak">0</span> ·
          Best: <span class="accent" id="best">0</span>
        </div>
      </main>

      <!-- Help overlay -->
      <div id="help-backdrop">
        <div id="help-dialog">
          <div id="help-dialog-header">
            <span id="help-dialog-title">How Algebra Works 🐜</span>
            <button id="help-close-x" type="button" aria-label="Close">✕</button>
          </div>

          <!-- Tab bar -->
          <div id="help-tabs">
            <button class="help-tab active" data-tab="solve">Solve <em>x</em></button>
            <button class="help-tab" data-tab="chain">Chains</button>
            <button class="help-tab" data-tab="chainx">Chains &amp; <em>x</em></button>
          </div>

          <!-- Solve x panel -->
          <div class="help-panel active" id="help-panel-solve">
            <div class="help-hero"><em>x</em></div>
            <p class="help-intro"><strong><em>x</em> is a mystery number</strong> hiding in the equation. Your job is to figure out what it is!</p>
            <div class="help-think">
              <div class="help-think-label">Think of it like a balance scale ⚖️</div>
              <div class="help-think-body">Both sides of the <strong>=</strong> sign must weigh the same. Figure out what number makes it balance!</div>
            </div>
            <div class="help-example">
              <div class="help-example-eq">3 + <em>x</em> = 7</div>
              <div class="help-steps">
                <div class="help-step">🤔 <span>"3 plus <strong>what</strong> equals 7?"</span></div>
                <div class="help-step">🧮 <span>Count up from 3 to 7 — that's <strong>4 steps</strong>.</span></div>
                <div class="help-step">✅ <span><em>x</em> = <strong>4</strong></span></div>
              </div>
            </div>
            <div class="help-tip">💡 <strong>Tip:</strong> Cover the <em>x</em> with your finger and think "what number fits here?"</div>
          </div>

          <!-- Chains panel -->
          <div class="help-panel" id="help-panel-chain">
            <div class="help-hero">🔗</div>
            <p class="help-intro"><strong>Chains</strong> are problems with lots of numbers linked together. Work through them <strong>one step at a time</strong>, left to right.</p>
            <div class="help-example">
              <div class="help-example-label">Simple chain:</div>
              <div class="help-example-eq">4 + 3 − 2 =</div>
              <div class="help-steps">
                <div class="help-step">① <span>4 + 3 = <strong>7</strong></span></div>
                <div class="help-step">② <span>7 − 2 = <strong>5</strong></span></div>
                <div class="help-step">✅ <span>Answer: <strong>5</strong></span></div>
              </div>
            </div>
            <div class="help-example">
              <div class="help-example-label">Complex chain (with parentheses):</div>
              <div class="help-example-eq">8 + (6 ÷ 2) =</div>
              <div class="help-steps">
                <div class="help-step">① <span>Do the <strong>( ) part first</strong>: 6 ÷ 2 = <strong>3</strong></span></div>
                <div class="help-step">② <span>8 + 3 = <strong>11</strong></span></div>
                <div class="help-step">✅ <span>Answer: <strong>11</strong></span></div>
              </div>
            </div>
            <div class="help-tip">💡 <strong>Tip:</strong> See parentheses ( )? Always solve what's inside them first!</div>
          </div>

          <!-- Chains & X panel -->
          <div class="help-panel" id="help-panel-chainx">
            <div class="help-hero">🔗<em>x</em></div>
            <p class="help-intro">Now <em>x</em> is <strong>hiding inside a chain</strong>. Solve the numbers you can see, then figure out what <em>x</em> must be to make it balance.</p>
            <div class="help-example">
              <div class="help-example-label">Simple Chains & <em>x</em>:</div>
              <div class="help-example-eq">5 + <em>x</em> − 2 = 7</div>
              <div class="help-steps">
                <div class="help-step">① <span>Ignore <em>x</em> for now. What does 5 − 2 equal? <strong>3</strong></span></div>
                <div class="help-step">② <span>So <em>x</em> + 3 must equal 7. What's <em>x</em>?</span></div>
                <div class="help-step">✅ <span><em>x</em> = <strong>4</strong></span></div>
              </div>
            </div>
            <div class="help-example">
              <div class="help-example-label">Complex Chains & <em>x</em>:</div>
              <div class="help-example-eq">10 + (3 × <em>x</em>) = 19</div>
              <div class="help-steps">
                <div class="help-step">① <span>19 − 10 = <strong>9</strong>, so the ( ) part must equal 9</span></div>
                <div class="help-step">② <span>3 × <em>x</em> = 9 → <em>x</em> = <strong>3</strong></span></div>
                <div class="help-step">✅ <span><em>x</em> = <strong>3</strong></span></div>
              </div>
            </div>
            <div class="help-tip">💡 <strong>Tip:</strong> Work backwards from the answer — peel away the numbers you know!</div>
          </div>

          <div id="help-actions">
            <button id="help-close-btn" type="button">Got it — let's go! 🐜</button>
          </div>
        </div>
      </div>
    `;

    // ---- Shared state ----
    let mode = 'solve'; // 'solve' | 'chain' | 'chainx'
    let correctAnswer = 0;
    let solved = 0, streak = 0, best = 0;

    // Solve-mode state
    let op = 'add';

    // Chain-mode state
    let chainLen = 3;
    let chainComplex = false;
    let chainAllowNeg = false;

    // ChainsX-mode state
    let chainxComplex = false;
    let chainxAllowNeg = false;

    // ---- Element refs ----
    const probEl = document.getElementById('prob-text');
    const xInput = document.getElementById('x-input');
    const inputLabel = document.getElementById('input-label');
    const msgEl = document.getElementById('msg');
    const solvedEl = document.getElementById('solved');
    const streakEl = document.getElementById('streak');
    const bestEl = document.getElementById('best');

    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function setMode(newMode) {
      mode = newMode;
      ['solve', 'chain', 'chainx'].forEach(m => {
        document.getElementById('mode-' + m).classList.toggle('active', m === mode);
        document.getElementById('settings-' + m).style.display = (m === mode ? 'flex' : 'none');
      });
      inputLabel.innerHTML = (mode === 'chain') ? '=' : '<span class="xvar">x</span> =';
      newProblem();
    }

    function setOp(newOp) {
      op = newOp;
      [['op-add', 'add'], ['op-sub', 'subtract'], ['op-mul', 'multiply'], ['op-div', 'divide']]
        .forEach(([id, val]) => {
          document.getElementById(id).classList.toggle('active', op === val);
        });
      newProblem();
    }

    function setProbDisplay(html, rawLen) {
      probEl.classList.remove('compact', 'tiny');
      if (rawLen > 22) probEl.classList.add('tiny');
      else if (rawLen > 14) probEl.classList.add('compact');
      probEl.innerHTML = html;
    }

    // ---- Solve x ----
    function newSolveProblem() {
      let a, x, b, eq;
      if (op === 'add') {
        a = rand(1, 12); x = rand(1, 12); b = a + x;
        eq = `${a} + <span class="xvar">x</span> = ${b}`;
      } else if (op === 'subtract') {
        x = rand(1, 10); b = rand(1, 10); a = b + x;
        eq = `${a} − <span class="xvar">x</span> = ${b}`;
      } else if (op === 'multiply') {
        a = rand(2, 6); x = rand(1, 9); b = a * x;
        eq = `${a}<span class="xvar">x</span> = ${b}`;
      } else {
        x = rand(2, 6); b = rand(2, 6); a = b * x;
        eq = `${a} ÷ <span class="xvar">x</span> = ${b}`;
      }
      correctAnswer = x;
      setProbDisplay(eq, eq.length);
    }

    // ---- Chains (multi-number calc) ----
    function newChainProblem() {
      if (chainComplex) {
        newComplexChainProblem();
        return;
      }
      let terms = [];
      let ops = [];
      let result = rand(1, 10);
      terms.push(result);

      for (let i = 1; i < chainLen; i++) {
        const sign = Math.random() > 0.5 ? '+' : '−';
        let term = rand(1, 6);
        if (sign === '−') {
          if (!chainAllowNeg && term >= result) {
            term = Math.max(1, Math.floor(result / 2));
          }
          result -= term;
        } else {
          result += term;
        }
        ops.push(sign);
        terms.push(term);
      }

      let raw = '';
      for (let i = 0; i < terms.length; i++) {
        raw += terms[i];
        if (i < ops.length) raw += ` ${ops[i]} `;
      }
      correctAnswer = result;
      setProbDisplay(raw + ' =', raw.length + 2);
    }

    function newComplexChainProblem() {
      // Form: a op1 (b op2 c)
      const outerOps = ['+', '−'];
      const innerOps = ['+', '−', '×', '÷'];
      const op1 = outerOps[rand(0, 1)];
      const op2 = innerOps[rand(0, 3)];

      let a, b, c, inner;
      if (op2 === '÷') {
        c = rand(2, 4);
        inner = rand(1, 4);
        b = c * inner;
      } else if (op2 === '×') {
        b = rand(2, 5);
        c = rand(1, 3);
        inner = b * c;
      } else if (op2 === '+') {
        b = rand(1, 6);
        c = rand(1, 6);
        inner = b + c;
      } else {
        b = rand(4, 11);
        c = rand(1, 4);
        if (!chainAllowNeg && c > b) { const t = b; b = c; c = t; }
        inner = b - c;
      }

      a = rand(5, 12);
      let result;
      if (op1 === '+') {
        result = a + inner;
      } else {
        if (!chainAllowNeg && inner > a) {
          a = inner + rand(1, 5);
        }
        result = a - inner;
      }
      correctAnswer = result;
      const html = `${a} ${op1} <span class="paren">(${b} ${op2} ${c})</span> =`;
      const raw = `${a} ${op1} (${b} ${op2} ${c}) =`;
      setProbDisplay(html, raw.length);
    }

    // ---- Chains & X ----
    function newChainsXProblem() {
      if (chainxComplex) {
        newComplexChainsXProblem(0);
        return;
      }
      newSimpleChainsXProblem(0);
    }

    function newSimpleChainsXProblem(depth) {
      // Form: a op1 x op2 b = result
      const opsArr = ['+', '−'];
      const op1 = opsArr[rand(0, 1)];
      const op2 = opsArr[rand(0, 1)];
      const a = rand(5, 14);
      const b = rand(1, 8);
      const x = chainxAllowNeg ? rand(-6, 6) : rand(1, 6);

      const v1 = op1 === '+' ? a + x : a - x;
      const result = op2 === '+' ? v1 + b : v1 - b;

      if (!chainxAllowNeg && (v1 < 0 || result < 0 || x < 1)) {
        if (depth < 20) { newSimpleChainsXProblem(depth + 1); return; }
      }

      correctAnswer = x;
      const html = `${a} ${op1} <span class="xvar">x</span> ${op2} ${b} = ${result}`;
      const raw = `${a} ${op1} x ${op2} ${b} = ${result}`;
      setProbDisplay(html, raw.length);
    }

    function newComplexChainsXProblem(depth) {
      // Form: a op1 (b op2 x) = result
      const outerOps = ['+', '−'];
      const innerOps = ['+', '−', '×'];
      const op1 = outerOps[rand(0, 1)];
      const op2 = innerOps[rand(0, 2)];

      let x = chainxAllowNeg ? rand(-5, 5) : rand(1, 5);
      let b = rand(1, 6);
      let inner;

      if (op2 === '+') {
        inner = b + x;
      } else if (op2 === '−') {
        if (!chainxAllowNeg) b = x + rand(0, 4);
        inner = b - x;
      } else {
        b = rand(2, 4);
        inner = b * x;
      }

      let a = rand(5, 14);
      let result;
      if (op1 === '+') {
        result = a + inner;
      } else {
        if (!chainxAllowNeg && inner > a) a = inner + rand(1, 6);
        result = a - inner;
      }

      if (!chainxAllowNeg && (inner < 0 || result < 0 || x < 1)) {
        if (depth < 20) { newComplexChainsXProblem(depth + 1); return; }
      }

      correctAnswer = x;
      const html = `${a} ${op1} <span class="paren">(${b} ${op2} <span class="xvar">x</span>)</span> = ${result}`;
      const raw = `${a} ${op1} (${b} ${op2} x) = ${result}`;
      setProbDisplay(html, raw.length);
    }

    function newProblem() {
      xInput.value = '';
      msgEl.textContent = '';
      if (mode === 'solve') newSolveProblem();
      else if (mode === 'chain') newChainProblem();
      else newChainsXProblem();
    }

    function checkAnswer() {
      const guess = parseInt(xInput.value, 10);
      if (Number.isNaN(guess)) {
        msgEl.textContent = 'Tap a number first!';
        msgEl.style.color = '#c62828';
        return;
      }
      if (guess === correctAnswer) {
        solved += 1;
        streak += 1;
        if (streak > best) best = streak;
        solvedEl.textContent = solved;
        streakEl.textContent = streak;
        bestEl.textContent = best;
        const label = (mode === 'chain') ? `= ${correctAnswer}` : `x = ${correctAnswer}`;
        msgEl.textContent = `🎉 Yes! ${label}`;
        msgEl.style.color = '#2e7d32';
        setTimeout(newProblem, 1100);
      } else {
        streak = 0;
        streakEl.textContent = streak;
        msgEl.textContent = 'Not quite — try again!';
        msgEl.style.color = '#c62828';
      }
    }

    function pressKey(k) {
      if (k === 'C') {
        xInput.value = '';
        return;
      }
      if (k === '-') {
        if (xInput.value.startsWith('-')) {
          xInput.value = xInput.value.slice(1);
        } else {
          xInput.value = '-' + xInput.value;
        }
        return;
      }
      if (xInput.value.replace('-', '').length >= 3) return;
      xInput.value += k;
    }

    // ---- Wire mode tabs ----
    document.getElementById('mode-solve').addEventListener('click', () => setMode('solve'));
    document.getElementById('mode-chain').addEventListener('click', () => setMode('chain'));
    document.getElementById('mode-chainx').addEventListener('click', () => setMode('chainx'));

    // ---- Wire Solve op buttons ----
    document.getElementById('op-add').addEventListener('click', () => setOp('add'));
    document.getElementById('op-sub').addEventListener('click', () => setOp('subtract'));
    document.getElementById('op-mul').addEventListener('click', () => setOp('multiply'));
    document.getElementById('op-div').addEventListener('click', () => setOp('divide'));

    // ---- Wire Chain settings ----
    document.querySelectorAll('#chain-len-group .len-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#chain-len-group .len-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chainLen = parseInt(btn.dataset.len, 10);
        newProblem();
      });
    });

    const chainModeBtn = document.getElementById('chain-mode-toggle');
    chainModeBtn.addEventListener('click', () => {
      chainComplex = !chainComplex;
      chainModeBtn.textContent = chainComplex ? 'Complex' : 'Simple';
      chainModeBtn.classList.toggle('active', chainComplex);
      document.getElementById('chain-len-group').style.display = chainComplex ? 'none' : 'flex';
      newProblem();
    });

    const chainNegBtn = document.getElementById('chain-neg-toggle');
    chainNegBtn.addEventListener('click', () => {
      chainAllowNeg = !chainAllowNeg;
      chainNegBtn.textContent = chainAllowNeg ? '± Neg' : 'Pos only';
      chainNegBtn.classList.toggle('active', chainAllowNeg);
      chainNegBtn.classList.toggle('warn', chainAllowNeg);
      newProblem();
    });

    // ---- Wire ChainsX settings ----
    const chainxModeBtn = document.getElementById('chainx-mode-toggle');
    chainxModeBtn.addEventListener('click', () => {
      chainxComplex = !chainxComplex;
      chainxModeBtn.textContent = chainxComplex ? 'Complex' : 'Simple';
      chainxModeBtn.classList.toggle('active', chainxComplex);
      newProblem();
    });

    const chainxNegBtn = document.getElementById('chainx-neg-toggle');
    chainxNegBtn.addEventListener('click', () => {
      chainxAllowNeg = !chainxAllowNeg;
      chainxNegBtn.textContent = chainxAllowNeg ? '± Neg' : 'Pos only';
      chainxNegBtn.classList.toggle('active', chainxAllowNeg);
      chainxNegBtn.classList.toggle('warn', chainxAllowNeg);
      newProblem();
    });

    // ---- Action buttons ----
    document.getElementById('check-btn').addEventListener('click', checkAnswer);
    document.getElementById('next-btn').addEventListener('click', newProblem);
    document.getElementById('print-worksheet-btn').addEventListener('click', printWorksheet);

    // ---- Help overlay ----
    const helpBackdrop = document.getElementById('help-backdrop');
    document.getElementById('help-btn').addEventListener('click', () => {
      helpBackdrop.style.display = 'flex';
    });
    document.getElementById('help-close-btn').addEventListener('click', () => {
      helpBackdrop.style.display = 'none';
    });
    document.getElementById('help-close-x').addEventListener('click', () => {
      helpBackdrop.style.display = 'none';
    });
    helpBackdrop.addEventListener('click', (e) => {
      if (e.target === helpBackdrop) helpBackdrop.style.display = 'none';
    });
    // Help dialog tabs
    document.querySelectorAll('.help-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.help-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('help-panel-' + tab.dataset.tab).classList.add('active');
      });
    });

    document.getElementById('keypad').addEventListener('click', (e) => {
      const target = e.target.closest('.key');
      if (!target) return;
      pressKey(target.dataset.k);
    });

    document.addEventListener('keydown', (e) => {
      if (/^[0-9]$/.test(e.key)) pressKey(e.key);
      else if (e.key === '-') pressKey('-');
      else if (e.key === 'Backspace') xInput.value = xInput.value.slice(0, -1);
      else if (e.key === 'Enter') checkAnswer();
      else if (e.key === 'Escape') xInput.value = '';
    });

    // ---- Background music + idle timeout (parent-friendly auto-off) ----
    const musicEl = document.getElementById('bg-music');
    let musicEnabled = true;
    let idleTimer = null;
    const IDLE_LIMIT = 30000; // 30s — matches Ants & Apples

    function playMusic() {
      if (!musicEl) return;
      const p = musicEl.play();
      if (p && p.catch) p.catch(() => { /* ignore autoplay rejections */ });
    }

    function pauseMusic() {
      if (!musicEl) return;
      musicEl.pause();
    }

    function updateMusicToggleLabel() {
      const btn = document.getElementById('music-toggle-btn');
      if (!btn) return;
      btn.textContent = musicEnabled ? 'Music: On' : 'Music: Off';
    }

    function resetIdleTimer() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(autoStopMusic, IDLE_LIMIT);
    }

    function autoStopMusic() {
      if (musicEnabled) {
        pauseMusic();
        musicEnabled = false;
        updateMusicToggleLabel();
        msgEl.textContent = 'Music paused due to inactivity.';
        msgEl.style.color = '#666';
      }
    }

    document.getElementById('music-toggle-btn').addEventListener('click', () => {
      musicEnabled = !musicEnabled;
      if (musicEnabled) playMusic(); else pauseMusic();
      updateMusicToggleLabel();
      resetIdleTimer();
    });

    // Start music on first user interaction (browser autoplay policy)
    function tryStartMusicOnce() {
      if (musicEnabled) playMusic();
      window.removeEventListener('pointerdown', tryStartMusicOnce, true);
      window.removeEventListener('keydown', tryStartMusicOnce, true);
    }
    window.addEventListener('pointerdown', tryStartMusicOnce, true);
    window.addEventListener('keydown', tryStartMusicOnce, true);

    // Reset idle timer on any activity
    window.addEventListener('pointerdown', resetIdleTimer, true);
    window.addEventListener('keydown', resetIdleTimer, true);

    updateMusicToggleLabel();
    resetIdleTimer();

    // ---- Worksheet printing ----
    const ANT_ASSETS = [
      'ant_jazz_hands.png', 'ants_apple_cart.png', 'ants_apple_hoist.png',
      'ants_basket_apple.png', 'ants_behind_apple.png', 'ants_celebration.png',
      'ants_chalkboard.png', 'ants_glasses.png', 'ants_grad.png',
      'ants_homework.png', 'ants_pencil.png', 'ants_pencil_3.png'
    ];
    const ANT_ASSET_BASE = '../ants-apples/assets/coloring-template-ants/';

    function printWorksheet() {
      if (mode === 'solve') {
        printSolveWorksheet();
      } else if (mode === 'chain') {
        printChainWorksheet();
      } else {
        printChainsXWorksheet();
      }
    }

    function printSolveWorksheet() {
      const numProblems = 12;
      const opLabel = { add: 'Addition', subtract: 'Subtraction', multiply: 'Multiplication', divide: 'Division' }[op];
      const probs = [];
      for (let i = 0; i < numProblems; i++) {
        let a, x, b, p;
        if (op === 'add') {
          a = rand(1, 15); x = rand(1, 15); b = a + x;
          p = `${a} + <span class="math-var">x</span> = ${b}`;
        } else if (op === 'subtract') {
          x = rand(1, 12); b = rand(1, 12); a = b + x;
          p = `${a} − <span class="math-var">x</span> = ${b}`;
        } else if (op === 'multiply') {
          a = rand(2, 7); x = rand(1, 10); b = a * x;
          p = `${a}<span class="math-var">x</span> = ${b}`;
        } else {
          x = rand(2, 6); b = rand(2, 7); a = b * x;
          p = `${a} ÷ <span class="math-var">x</span> = ${b}`;
        }
        probs.push(`<div style="display:inline-block; text-align:left;">${p}<br><span class="math-var">x</span> = ___</div>`);
      }
      openWorksheet(probs, [`Solve for x — ${opLabel}`], 4);
    }

    function printChainWorksheet() {
      const numProblems = 12;
      const probs = [];

      function buildSimple() {
        let result = rand(1, 10);
        let eq = String(result);
        for (let j = 1; j < chainLen; j++) {
          const sign = Math.random() > 0.5 ? '+' : '−';
          let term = rand(1, 9);
          if (sign === '−') {
            if (!chainAllowNeg && term >= result) term = Math.max(1, Math.floor(result / 2));
            result -= term;
          } else {
            result += term;
          }
          eq += ` ${sign} ${term}`;
        }
        return eq + ' = ___';
      }

      function buildComplex() {
        const outerOps = ['+', '−'];
        const innerOps = ['+', '−', '×', '÷'];
        const op1 = outerOps[rand(0, 1)];
        const op2 = innerOps[rand(0, 3)];
        let a, b, c, inner;
        if (op2 === '÷') {
          c = rand(2, 4); inner = rand(1, 4); b = c * inner;
        } else if (op2 === '×') {
          b = rand(2, 5); c = rand(1, 3); inner = b * c;
        } else if (op2 === '+') {
          b = rand(1, 8); c = rand(1, 8); inner = b + c;
        } else {
          b = rand(4, 11); c = rand(1, 4);
          if (!chainAllowNeg && c > b) { const t = b; b = c; c = t; }
          inner = b - c;
        }
        a = rand(5, 14);
        if (op1 === '−' && !chainAllowNeg && inner > a) a = inner + rand(1, 5);
        const mulOp2 = (op2 === '×') ? '<span class="math-op-mul">×</span>' : op2;
        return `${a} ${op1} (${b} ${mulOp2} ${c}) = ___`;
      }

      for (let i = 0; i < numProblems; i++) {
        probs.push(chainComplex ? buildComplex() : buildSimple());
      }

      const modeLabel = chainComplex ? 'Complex' : `Length ${chainLen}`;
      const resLabel = chainAllowNeg ? '± Negatives' : 'Positive Only';
      openWorksheet(probs, [`Math Chains — ${modeLabel} (${resLabel})`], 4);
    }

    function printChainsXWorksheet() {
      const numProblems = 12;
      const probs = [];

      function buildSimple() {
        for (let tries = 0; tries < 50; tries++) {
          const opsArr = ['+', '−'];
          const o1 = opsArr[rand(0, 1)], o2 = opsArr[rand(0, 1)];
          const a = rand(5, 15);
          const b = rand(1, 9);
          const x = chainxAllowNeg ? rand(-6, 6) : rand(1, 8);
          const v1 = (o1 === '+') ? a + x : a - x;
          const result = (o2 === '+') ? v1 + b : v1 - b;
          if (!chainxAllowNeg && (v1 < 0 || result < 0 || x < 1)) continue;
          return `${a} ${o1} <span class="math-var">x</span> ${o2} ${b} = ${result}`;
        }
        return `5 + <span class="math-var">x</span> + 1 = 10`; // safety fallback
      }

      function buildComplex() {
        for (let tries = 0; tries < 50; tries++) {
          const outerOps = ['+', '−'];
          const innerOps = ['+', '−', '×'];
          const op1 = outerOps[rand(0, 1)];
          const op2 = innerOps[rand(0, 2)];
          let x = chainxAllowNeg ? rand(-5, 5) : rand(1, 6);
          let b = rand(1, 6);
          let inner;
          if (op2 === '+') {
            inner = b + x;
          } else if (op2 === '−') {
            if (!chainxAllowNeg) b = x + rand(0, 4);
            inner = b - x;
          } else {
            b = rand(2, 4);
            inner = b * x;
          }
          let a = rand(5, 14);
          if (op1 === '−' && !chainxAllowNeg && inner > a) a = inner + rand(1, 6);
          const result = (op1 === '+') ? a + inner : a - inner;
          if (!chainxAllowNeg && (inner < 0 || result < 0 || x < 1)) continue;
          const mulOp2 = (op2 === '×') ? '<span class="math-op-mul">×</span>' : op2;
          return `${a} ${op1} (${b} ${mulOp2} <span class="math-var">x</span>) = ${result}`;
        }
        return `5 + (2 + <span class="math-var">x</span>) = 10`;
      }

      for (let i = 0; i < numProblems; i++) {
        const eq = chainxComplex ? buildComplex() : buildSimple();
        probs.push(`<div style="display:inline-block; text-align:left;">${eq}<br><span class="math-var">x</span> = ___</div>`);
      }

      const modeLabel = chainxComplex ? 'Complex' : 'Simple';
      const resLabel = chainxAllowNeg ? '± Negatives' : 'Positive Only';
      openWorksheet(probs, [`Chains & X — ${modeLabel} (${resLabel})`], 3);
    }

    function openWorksheet(problems, metaLines, numCols) {
      numCols = numCols || 4;
      let selectedAnts;
      // 10% chance for the "Math Master" easter egg
      if (Math.random() < 0.10) {
        selectedAnts = ['math_master.png'];
        const others = [...ANT_ASSETS].sort(() => 0.5 - Math.random()).slice(0, 2);
        selectedAnts.push(...others);
        selectedAnts.sort(() => 0.5 - Math.random());
      } else {
        selectedAnts = [...ANT_ASSETS].sort(() => 0.5 - Math.random()).slice(0, 3);
      }

      const win = window.open('', '_blank');
      if (!win) {
        alert('Please allow popups to print the worksheet.');
        return;
      }
      const baseUrl = window.location.href.split('index.html')[0];

      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <base href="${baseUrl}">
          <title> </title>
          <style>
            @page { margin: 0; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: #222; background: #fff; }
            .page-container { padding: 0.5in; min-height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; position: relative; margin: 0; }
            .worksheet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px; }
            .header-left { flex: 0 0 210px; text-align: left; }
            .header-logo { max-width: 210px; height: auto; display: block; }
            .header-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 8px; font-weight: bold; font-size: 1.1rem; text-align: center; }
            .header-right { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font-weight: bold; font-size: 1.1rem; text-align: right; }
            h1 { margin: 0; font-size: 1.8rem; text-transform: uppercase; letter-spacing: 2px; }
            .grid { display: grid; grid-template-columns: repeat(${numCols}, 1fr); gap: 18px; flex-grow: 0; align-content: start; margin-top: 20px; width: 100%; }
            .problem { font-size: 1.2rem; padding: 14px 2px; white-space: nowrap; text-align: center; border-bottom: 2px dashed #f0f0f0; display: flex; align-items: center; justify-content: center; gap: 5px; }
            .math-var { font-family: "Times New Roman", serif; font-style: italic; font-weight: 800; color: #1976d2; }
            .math-op-mul { font-weight: 900; font-size: 0.8em; vertical-align: middle; padding: 0 4px; display: inline-block; transform: translateY(-1px); }
            .coloring-section { margin-top: 10px; display: flex; justify-content: space-around; align-items: flex-end; flex-grow: 1; padding-bottom: 10px; }
            .ant-illustration { max-width: 180px; max-height: 180px; height: auto; opacity: 0.7; filter: grayscale(1); }
            .footer { margin-top: 15px; display: flex; justify-content: space-between; font-size: 0.75rem; color: #888; }
            .no-print { position: fixed; top: 20px; right: 20px; z-index: 1000; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button onclick="window.print()" style="padding: 12px 24px; background: #2e7d32; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">Print / Save PDF</button>
          </div>
          <div class="page-container">
            <header class="worksheet-header">
              <div class="header-left">
                <img src="ants_algebra.png" class="header-logo" alt="Ants & Algebra"
                     onerror="this.style.display='none'; document.getElementById('fallback-title').style.display='block';">
                <h1 id="fallback-title" style="display:none;">Ants &amp; Algebra</h1>
              </div>
              <div class="header-center">
                ${metaLines.map(line => `<span>${line}</span>`).join('')}
              </div>
              <div class="header-right">
                <span>Name: ______________________</span>
                <span>Date: ___________</span>
              </div>
            </header>
            <div class="grid">
              ${problems.map(p => `<div class="problem">${p}</div>`).join('')}
            </div>
            <div class="coloring-section">
              ${selectedAnts.map(img => `<img src="${ANT_ASSET_BASE}${img}" class="ant-illustration" alt="Ant Art">`).join('')}
            </div>
            <div class="footer">
              <span>Ants &amp; Algebra · Solve for x · Page 1/1</span>
            </div>
          </div>
        </body>
        </html>
      `);
      win.document.close();
    }

    newProblem();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAntsAlgebra);
  } else {
    initAntsAlgebra();
  }
})();
