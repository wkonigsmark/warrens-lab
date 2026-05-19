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
        </div>
      </header>

      <main>
        <div class="mode-tabs" role="tablist" aria-label="Choose mode">
          <button id="mode-solve" class="mode-tab active" type="button">Solve x</button>
          <button id="mode-chain" class="mode-tab" type="button">Chains</button>
          <button id="mode-chainx" class="mode-tab" type="button">Chains &amp; X</button>
        </div>

        <div id="settings-solve" class="settings-row">
          <span class="label">Op:</span>
          <div class="op-settings" style="margin:0;">
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
          <span class="label">Solve for x</span>
          <span class="divider"></span>
          <button id="chainx-mode-toggle" class="toggle-btn" type="button">Simple</button>
          <button id="chainx-neg-toggle" class="toggle-btn" type="button">Pos only</button>
        </div>

        <div class="problem-box">
          <div id="prob-text" class="problem-text">2 + x = 5</div>
          <div class="input-row">
            <span id="input-label" class="x-label">x =</span>
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
      inputLabel.textContent = (mode === 'chain') ? '=' : 'x =';
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

    newProblem();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAntsAlgebra);
  } else {
    initAntsAlgebra();
  }
})();
