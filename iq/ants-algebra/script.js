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
        <div class="op-settings" role="tablist" aria-label="Choose operation">
          <button id="op-add" class="op-btn active" type="button" title="Addition">+</button>
          <button id="op-sub" class="op-btn" type="button" title="Subtraction">−</button>
          <button id="op-mul" class="op-btn" type="button" title="Multiplication">×</button>
          <button id="op-div" class="op-btn" type="button" title="Division">÷</button>
        </div>

        <div class="problem-box">
          <div id="prob-text" class="problem-text">2 + x = 5</div>
          <div class="input-row">
            <span class="x-label">x =</span>
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

    let op = 'add';
    let curA = 0, curX = 0, curB = 0;
    let solved = 0, streak = 0, best = 0;

    const probEl = document.getElementById('prob-text');
    const xInput = document.getElementById('x-input');
    const msgEl = document.getElementById('msg');
    const solvedEl = document.getElementById('solved');
    const streakEl = document.getElementById('streak');
    const bestEl = document.getElementById('best');

    function setOp(newOp) {
      op = newOp;
      [['op-add', 'add'], ['op-sub', 'subtract'], ['op-mul', 'multiply'], ['op-div', 'divide']]
        .forEach(([id, val]) => {
          document.getElementById(id).classList.toggle('active', op === val);
        });
      newProblem();
    }

    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function newProblem() {
      if (op === 'add') {
        curA = rand(1, 12);
        curX = rand(1, 12);
        curB = curA + curX;
        probEl.textContent = `${curA} + x = ${curB}`;
      } else if (op === 'subtract') {
        curX = rand(1, 10);
        curB = rand(1, 10);
        curA = curB + curX;
        probEl.textContent = `${curA} − x = ${curB}`;
      } else if (op === 'multiply') {
        curA = rand(2, 6);
        curX = rand(1, 9);
        curB = curA * curX;
        probEl.textContent = `${curA}x = ${curB}`;
      } else {
        curX = rand(2, 6);
        curB = rand(2, 6);
        curA = curB * curX;
        probEl.textContent = `${curA} ÷ x = ${curB}`;
      }
      xInput.value = '';
      msgEl.textContent = '';
    }

    function checkAnswer() {
      const guess = parseInt(xInput.value, 10);
      if (Number.isNaN(guess)) {
        msgEl.textContent = 'Tap a number first!';
        msgEl.style.color = '#c62828';
        return;
      }
      if (guess === curX) {
        solved += 1;
        streak += 1;
        if (streak > best) best = streak;
        solvedEl.textContent = solved;
        streakEl.textContent = streak;
        bestEl.textContent = best;
        msgEl.textContent = `🎉 Yes! x = ${curX}`;
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

    document.getElementById('op-add').addEventListener('click', () => setOp('add'));
    document.getElementById('op-sub').addEventListener('click', () => setOp('subtract'));
    document.getElementById('op-mul').addEventListener('click', () => setOp('multiply'));
    document.getElementById('op-div').addEventListener('click', () => setOp('divide'));

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
