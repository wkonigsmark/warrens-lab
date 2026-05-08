(function () {
  function initAntsApples() {
    const root = document.getElementById('ants-apples-root');
    if (!root) return;

    root.innerHTML = `
      <div class="banner-container">
        <img id="ants-banner" src="assets/ants_apples_.webp" alt="Ants & Apples" fetchpriority="high" loading="eager">
      </div>
      <header>
        <div class="header-left">
          <button id="ants-grid-size-btn" type="button">Settings</button>
          <button id="ants-music-toggle" type="button">Music: On</button>
          <button id="ants-print-worksheet" type="button">Print Worksheet</button>
          <button id="ants-dev-mode-btn" type="button">Dev Mode</button>
        </div>
      </header>
      <main>
        <div id="ants-game-view">
          <table id="ants-apples-grid"></table>
          <div class="controls">
            <button class="btn secondary" id="ants-reset-btn">Reset Game</button>
          </div>
          <div class="message" id="ants-message"></div>
          <div class="status">
            <div class="status-line">
              Level: <span id="ants-level-label">1</span> / <span id="ants-level-max">3</span>
            </div>
            <div class="status-line">
              Time: <span id="ants-timer">0:00</span> · Streak: <span id="ants-streak-current">0</span>
            </div>
          </div>

          <div id="ants-helper">
            <div id="ants-helper-title">Helper Calculator</div>
            <div id="ants-helper-inputs">
              <div class="ants-helper-field">
                <div class="ants-helper-label">First Number</div>
                <select id="ants-helper-first"></select>
              </div>
              <div id="ants-helper-op">+</div>
              <div class="ants-helper-field">
                <div class="ants-helper-label">Second Number</div>
                <select id="ants-helper-second"></select>
              </div>
            </div>
            <div id="ants-helper-visual">
              <div id="ants-helper-ants"></div>
              <div id="ants-helper-plus">+</div>
              <div id="ants-helper-apples"></div>
            </div>
          </div>
        </div>

        <div id="ants-dev-view" style="display:none;">
          <div id="ants-dev-banner" class="dev-banner">Dev Dashboard</div>
          <div id="ants-dev-canvas">
            <div class="dev-placeholder">Blank Canvas: Work out the details here...</div>
          </div>
        </div>
      </main>

      <audio id="ants-music" src="assets/hyrule_theme.mp3" preload="auto" loop></audio>

      <div id="ants-apples-keypad-backdrop">
        <div id="ants-apples-keypad">
          <div id="ants-apples-keypad-header">
            <div id="ants-keypad-equation">&nbsp;</div>
            <button class="btn secondary" id="ants-esc-btn" style="padding:4px 10px;font-size:0.8rem;">ESC</button>
          </div>
          <div id="ants-apples-keypad-display"></div>
          <div id="ants-apples-keypad-grid"></div>
          <div id="ants-apples-keypad-actions">
            <div class="key-side-by-side">
              <div class="key action" data-action="clear">CLR</div>
              <div class="key action" data-action="minus">-</div>
            </div>
            <div class="key action" data-action="zero">0</div>
            <div class="key action" data-action="submit">ENTER</div>
          </div>
        </div>
      </div>

      <div id="ants-size-backdrop">
        <div id="ants-size-dialog">
          <div id="ants-size-title">Welcome to Ants & Apples!</div>
          <div id="ants-size-body">Choose a grid size between 3×3 and 9×9, how many levels to play, and the operation.</div>
          <select id="ants-size-select">
            <option value="3">3 × 3 (easiest)</option>
            <option value="4">4 × 4</option>
            <option value="5">5 × 5</option>
            <option value="6">6 × 6</option>
            <option value="7">7 × 7</option>
            <option value="8">8 × 8</option>
            <option value="9">9 × 9 (challenge!)</option>
          </select>

          <div id="ants-level-count-label">How many levels? (1–<span id="ants-level-count-max-label">9</span>)</div>
          <input type="text" id="ants-level-count-input" value="3" readonly />

          <div id="ants-op-title">Choose operation:</div>
          <div id="ants-op-options">
            <label>
              <input type="radio" name="ants-op" value="add" checked>
              Addition (+)
            </label>
            <label>
              <input type="radio" name="ants-op" value="subtract">
              Subtraction (-)
            </label>
            <label>
              <input type="radio" name="ants-op" value="subtract-neg">
              Subtraction (-Neg)
            </label>
            <label>
              <input type="radio" name="ants-op" value="multiply">
              Multiplication (×)
            </label>
            <label>
              <input type="radio" name="ants-op" value="divide">
              Division (÷)
            </label>
          </div>
          <div id="ants-divide-note" style="display:none; font-size:0.78rem; color:#888; margin-top:4px;">Division mode: dynamic 6×6 grid supported for whole-number results.</div>

          <div id="ants-helper-opt-title" style="font-size:0.85rem; margin-top:8px; margin-bottom:4px;">Learning Aids:</div>
          <div id="ants-helper-options" style="font-size:0.85rem; margin-bottom:12px;">
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="checkbox" id="ants-show-helper-toggle" checked>
              Show Ants & Apples Helper
            </label>
          </div>

          <div id="ants-size-actions">
            <button id="ants-size-cancel-btn" type="button">Cancel</button>
            <button id="ants-size-start-btn" type="button">Start</button>
          </div>
        </div>
      </div>

      <div id="ants-win-backdrop">
        <div id="ants-win-dialog">
          <div id="ants-win-title">Great job!</div>
          <div id="ants-win-body"></div>
          <div id="ants-win-actions">
            <button id="ants-win-play-again" type="button">Play Again</button>
          </div>
        </div>
      </div>


    `;

    /* Dynamic grid + operation + level-count state */
    let gridSize = 3;
    let ROWS = [];
    let COLS = [];
    let MAX_LEVEL = 3; // user-chosen max levels
    let operation = 'add'; // 'add', 'multiply', or 'divide'
    let showHelper = true; // showAntsApplesHelper
    let devMode = false;
    let fractionDenom = 2; // Starting denominator for fractions level
    let currentF1 = 0, currentF2 = 0;
    let fractionProblemsSolved = 0;
    const FRACTION_TOTAL_PROBLEMS = 6;
    let fractionOp = 'add'; // 'add', 'subtract', or 'multiply'
    let algebraOp = 'add'; // 'add', 'subtract', 'multiply', 'divide'
    let currentAlgA = 0, currentAlgX = 0, currentAlgB = 0;
    let currentDevModule = 'fractions'; // 'fractions', 'algebra', 'chains', 'chainsX'
    let currentChainsXMode = 'simple'; // 'simple' or 'complex'
    let currentChainLength = 3;
    let currentChainMode = 'simple'; // 'simple' or 'complex'
    let currentChainAllowNegative = false;
    let currentChainEquation = "";
    let currentChainResult = 0;
    let currentChainsXResult = 0;

    let currentLevel = 1;
    let activeTileEl = null;    // For main game tiles
    let activeInputEl = null;   // For generic inputs (Dev Mode)
    let currentInput = "";

    /* Timer + streak */
    let timerStarted = false;
    let timerIntervalId = null;
    let elapsedSeconds = 0;

    let currentStreak = 0;
    let bestStreak = 0;

    /* Music state */
    const musicEl = document.getElementById('ants-music');
    let musicEnabled = true;

    /* Idle Timer (Parent-Friendly Auto-Off) */
    let idleTimer = null;
    const IDLE_LIMIT = 30000; // 30 seconds

    /**
     * Scales font size for math problems based on text length to prevent mobile cutoff.
     */
    function setProblemFontSize(el, rawText) {
      if (!el) return;
      const len = rawText.length;
      let fs = "2.4rem";
      let ls = "2px";
      if (len > 25) { fs = "1.0rem"; ls = "0px"; }
      else if (len > 20) { fs = "1.2rem"; ls = "0px"; }
      else if (len > 16) { fs = "1.4rem"; ls = "0.5px"; }
      else if (len > 12) { fs = "1.8rem"; ls = "1px"; }
      else if (len > 10) { fs = "2.1rem"; ls = "1.5px"; }
      
      el.style.fontSize = fs;
      el.style.letterSpacing = ls;
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
        setMessage("Music paused due to inactivity.");
      }
    }

    // Interaction Listeners (Reset idle timer on any activity)
    window.addEventListener('pointerdown', resetIdleTimer, true);
    window.addEventListener('keydown', resetIdleTimer, true);

    buildKeypadDigits();
    buildHelperControls();
    hookButtons();
    configureGrid(3, 3);      // default 3×3, 3 levels
    openSizeDialog(true);     // show picker on first load

    // Keyboard shortcuts (ESC to close keypad, Enter to submit)
    document.addEventListener('keydown', onKeyDown);

    updateMusicToggleLabel();
    resetIdleTimer(); // Start the first idle countdown

    /* ---------- Grid + game setup ---------- */

    function configureGrid(size, levelCount) {
      size = parseInt(size, 10) || 3;
      if (operation === 'divide') {
        size = Math.max(3, Math.min(6, size));
        if (size === 3) {
          ROWS = [4, 8, 12];
          COLS = [1, 2, 4];
        } else if (size === 4) {
          ROWS = [4, 8, 12, 16];
          COLS = [1, 2, 4, 8];
        } else if (size === 5) {
          ROWS = [4, 8, 12, 16, 24];
          COLS = [1, 2, 4, 8, 12];
        } else if (size === 6) {
          const X = Math.floor(Math.random() * 7) + 1; // Random 1-7
          ROWS = [24, 48, 72, 96, 120, 144].map(v => v * X);
          COLS = [1, 2, 3, 6, 12, 24].map(v => v * X);
        }
      } else {
        size = Math.max(3, Math.min(9, size));
        ROWS = Array.from({ length: size }, (_, i) => i + 1);
        COLS = Array.from({ length: size }, (_, i) => i + 1);
      }
      gridSize = size;

      // Count playable (non-embargoed) tiles
      let playableCount = 0;
      ROWS.forEach(r => {
        COLS.forEach(c => {
          if (operation === 'divide') {
            if (r % c === 0) playableCount++;
          } else if (operation === 'subtract') {
            if (r >= c) playableCount++;
          } else if (operation === 'subtract-neg') {
            playableCount++;
          } else {
            playableCount++;
          }
        });
      });

      let desiredLevels = parseInt(levelCount, 10);
      if (isNaN(desiredLevels) || desiredLevels < 1) desiredLevels = 3;
      if (desiredLevels > playableCount) desiredLevels = playableCount;
      MAX_LEVEL = desiredLevels;

      currentLevel = 1;

      resetTimerAndStreak();

      document.getElementById('ants-level-max').textContent = MAX_LEVEL.toString();
      document.getElementById('ants-level-label').textContent = currentLevel.toString();

      buildGrid();
      setupLevel(currentLevel);
      setMessage(`Grid: ${size} × ${size} · Levels: ${MAX_LEVEL} · Mode: ${opLabel()}.`);
      updateHelperSelects();
    }

    function buildGrid() {
      const table = document.getElementById('ants-apples-grid');
      table.innerHTML = '';

      const headerRow = document.createElement('tr');
      const corner = document.createElement('td');
      corner.className = 'header';
      const symbols = { 'add': '+', 'subtract': '-', 'subtract-neg': '-', 'multiply': '×', 'divide': '÷' };
      corner.textContent = symbols[operation] || '+';
      headerRow.appendChild(corner);

      COLS.forEach(colVal => {
        const td = document.createElement('td');
        td.className = 'header';
        td.textContent = colVal;
        headerRow.appendChild(td);
      });
      table.appendChild(headerRow);

      ROWS.forEach((rowVal, rowIndex) => {
        const tr = document.createElement('tr');

        const headerCell = document.createElement('td');
        headerCell.className = 'header';
        headerCell.textContent = rowVal;
        tr.appendChild(headerCell);

        COLS.forEach((colVal, colIndex) => {
          const td = document.createElement('td');
          td.className = 'tile inactive';
          td.dataset.row = (rowIndex + 1).toString();
          td.dataset.col = (colIndex + 1).toString();
          td.dataset.active = 'false';
          td.dataset.status = 'inactive';

          if (operation === 'divide' && rowVal % colVal !== 0) {
            td.classList.add('embargoed');
            td.textContent = 'X';
            td.dataset.embargoed = 'true';
          } else if (operation === 'subtract' && rowVal < colVal) {
            td.classList.add('embargoed');
            td.textContent = 'X';
            td.dataset.embargoed = 'true';
          } else {
            td.addEventListener('click', () => onTileClick(td));
          }
          tr.appendChild(td);
        });

        table.appendChild(tr);
      });
    }

    function setupLevel(level) {
      document.getElementById('ants-level-label').textContent = level.toString();

      const tiles = Array.from(root.querySelectorAll('.tile')).filter(t => t.dataset.embargoed !== 'true');
      tiles.forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile inactive';
        tile.dataset.active = 'false';
        tile.dataset.status = 'inactive';
      });

      const tileArray = [...tiles];
      shuffleArray(tileArray);
      const activeTiles = tileArray.slice(0, level);

      activeTiles.forEach(tile => {
        tile.dataset.active = 'true';
        tile.dataset.status = 'pending';
        tile.classList.remove('inactive');
        tile.classList.add('pending');
      });

      hideKeypad();
    }

    /* ---------- Keypad ---------- */

    function buildKeypadDigits() {
      const grid = document.getElementById('ants-apples-keypad-grid');
      grid.innerHTML = '';
      for (let n = 1; n <= 9; n++) {
        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = n.toString();
        key.dataset.value = n.toString();
        key.addEventListener('click', () => appendDigit(n.toString()));
        grid.appendChild(key);
      }

      root.querySelector('[data-action="clear"]').addEventListener('click', clearInput);
      root.querySelector('[data-action="zero"]').addEventListener('click', () => appendDigit('0'));
      root.querySelector('[data-action="submit"]').addEventListener('click', submitInput);
      root.querySelector('[data-action="minus"]').addEventListener('click', toggleMinus);
    }

    function showKeypad(target, equation = '') {
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
        activeInputEl = target;
        activeTileEl = null;
        currentInput = target.value || '';
      } else {
        activeTileEl = target;
        activeInputEl = null;
        currentInput = '';
      }

      const eq = document.getElementById('ants-keypad-equation');
      if (eq) eq.textContent = equation || '\u00A0';
      
      updateKeypadDisplay();
      document.getElementById('ants-apples-keypad-backdrop').style.display = 'flex';
    }

    function hideKeypad() {
      document.getElementById('ants-apples-keypad-backdrop').style.display = 'none';
      activeTileEl = null;
      activeInputEl = null;
      currentInput = '';
      updateKeypadDisplay();
      const eq = document.getElementById('ants-keypad-equation');
      if (eq) eq.textContent = '\u00A0';
    }

    function appendDigit(d) {
      if (currentInput.replace('-', '').length >= 3) return;
      currentInput += d;
      updateKeypadDisplay();
    }

    function toggleMinus() {
      if (currentInput.startsWith('-')) {
        currentInput = currentInput.slice(1);
      } else {
        // Prevent minus if it would exceed length (though minus doesn't count towards digit limit)
        currentInput = '-' + currentInput;
      }
      updateKeypadDisplay();
    }

    function backspaceInput() {
      if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        updateKeypadDisplay();
      }
    }

    function clearInput() {
      currentInput = '';
      updateKeypadDisplay();
    }

    function updateKeypadDisplay() {
      document.getElementById('ants-apples-keypad-display').textContent = currentInput || ' ';
    }

    function submitInput() {
      // Branch logic based on target type
      if (activeInputEl) {
        activeInputEl.value = currentInput;
        
        // Trigger "Check Answer" if we're in a dev mode that has a submit button
        if (currentDevModule === 'fractions') {
          checkFractionAnswer();
        } else if (currentDevModule === 'algebra') {
          checkAlgebraAnswer();
        } else if (currentDevModule === 'chains') {
          checkChainAnswer();
        } else if (currentDevModule === 'chainsX') {
          checkChainsXAnswer();
        }
        
        hideKeypad();
        return;
      }

      if (!activeTileEl) return;

      if (!currentInput) {
        setMessage('Try entering a number before pressing ENTER.');
        hideKeypad();
        return;
      }

      const guess = parseInt(currentInput, 10);
      const rowIdx = parseInt(activeTileEl.dataset.row, 10) - 1;
      const colIdx = parseInt(activeTileEl.dataset.col, 10) - 1;
      const a = ROWS[rowIdx]; // dividend
      const b = COLS[colIdx]; // divisor
      let correctAnswer;
      if (operation === 'add') correctAnswer = a + b;
      else if (operation === 'subtract' || operation === 'subtract-neg') correctAnswer = a - b;
      else if (operation === 'multiply') correctAnswer = a * b;
      else correctAnswer = a / b;

      activeTileEl.textContent = guess.toString();

      if (guess === correctAnswer) {
        activeTileEl.classList.remove('pending', 'incorrect');
        activeTileEl.classList.add('correct');
        activeTileEl.dataset.status = 'correct';
        setMessage('Nice work!');

        // Streak update
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        updateStreakDisplay();

        hideKeypad();

        if (isLevelComplete()) {
          if (currentLevel < MAX_LEVEL) {
            setMessage(`Level ${currentLevel} complete! Get ready...`);
            setTimeout(goToNextLevel, 1200);
            hideKeypad();
          } else {
            // Game finished
            clearTimer();
            showWinOverlay();
          }
        }
      } else {
        activeTileEl.classList.remove('pending');
        activeTileEl.classList.add('incorrect');
        activeTileEl.dataset.status = 'incorrect';
        setMessage('Not quite. Try again!');

        // Reset streak on miss
        currentStreak = 0;
        updateStreakDisplay();

        hideKeypad();
      }
    }

    /* ---------- Helper calculator ---------- */

    function buildHelperControls() {
      const firstSelect = document.getElementById('ants-helper-first');
      const secondSelect = document.getElementById('ants-helper-second');
      if (!firstSelect || !secondSelect) return;

      firstSelect.addEventListener('change', updateHelperDisplay);
      secondSelect.addEventListener('change', updateHelperDisplay);

      updateHelperSelects();
    }

    function updateHelperSelects() {
      const firstSelect = document.getElementById('ants-helper-first');
      const secondSelect = document.getElementById('ants-helper-second');
      if (!firstSelect || !secondSelect) return;

      const currentFirstVal = firstSelect.value;
      const currentSecondVal = secondSelect.value;

      firstSelect.innerHTML = '';
      secondSelect.innerHTML = '';

      let firstOptions = [];
      let secondOptions = [];

      if (operation === 'divide') {
        firstOptions = [...new Set(ROWS)].sort((a, b) => a - b);
        secondOptions = [...new Set(COLS)].sort((a, b) => a - b);
      } else {
        // For add/multiply, 0-10 covers all possible header values (up to 9x9 grid)
        firstOptions = Array.from({ length: 11 }, (_, i) => i);
        secondOptions = Array.from({ length: 11 }, (_, i) => i);
      }

      firstOptions.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val.toString();
        opt.textContent = val.toString();
        firstSelect.appendChild(opt);
      });

      secondOptions.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val.toString();
        opt.textContent = val.toString();
        secondSelect.appendChild(opt);
      });

      // Restore previously selected values if they still exist in the new operation's set
      if (currentFirstVal && Array.from(firstSelect.options).some(o => o.value === currentFirstVal)) {
        firstSelect.value = currentFirstVal;
      } else if (firstOptions.length > 0) {
        firstSelect.value = firstOptions[0].toString();
      }

      if (currentSecondVal && Array.from(secondSelect.options).some(o => o.value === currentSecondVal)) {
        secondSelect.value = currentSecondVal;
      } else if (secondOptions.length > 0) {
        secondSelect.value = secondOptions[0].toString();
      }

      updateHelperDisplay();
    }

    function setHelperValues(first, second) {
      const firstSelect = document.getElementById('ants-helper-first');
      const secondSelect = document.getElementById('ants-helper-second');
      if (!firstSelect || !secondSelect) return;
      firstSelect.value = String(first);
      secondSelect.value = String(second);
      updateHelperDisplay();
    }

    function updateHelperDisplay() {
      const firstSelect = document.getElementById('ants-helper-first');
      const secondSelect = document.getElementById('ants-helper-second');
      if (!firstSelect || !secondSelect) return;

      const first = parseInt(firstSelect.value, 10) || 0;
      const second = parseInt(secondSelect.value, 10) || 0;

      const antsDiv = document.getElementById('ants-helper-ants');
      const applesDiv = document.getElementById('ants-helper-apples');
      const opSymbolEl = document.getElementById('ants-helper-op');
      const plusEl = document.getElementById('ants-helper-plus');

      const antEmoji = '🐜';
      const appleEmoji = '🍎';

      antsDiv.textContent = '';
      applesDiv.textContent = '';
      antsDiv.innerHTML = '';
      applesDiv.innerHTML = '';
      const visual = document.getElementById('ants-helper-visual');
      visual.style.flexDirection = 'row';
      visual.style.alignItems = 'flex-start';
      plusEl.style.display = 'block';
      antsDiv.style.marginBottom = '0';

      // Dynamic font size calculation to prevent overflow
      let fontSize = 1.6; // Default
      if (operation === 'divide') {
        if (second >= 12) fontSize = 0.95;
        else if (second >= 10) fontSize = 1.1;
        else if (second >= 8) fontSize = 1.3;
        else if (second >= 6) fontSize = 1.5;
      } else if (operation === 'multiply') {
        if (second >= 10) fontSize = 1.1;
        else if (second >= 8) fontSize = 1.3;
      } else if (operation === 'add' || operation === 'subtract' || operation === 'subtract-neg') {
        const total = (operation === 'add') ? (first + second) : first;
        if (total >= 20) fontSize = 0.9;
        else if (total >= 16) fontSize = 1.1;
        else if (total >= 12) fontSize = 1.3;
      }
      visual.style.fontSize = `${fontSize}rem`;

      if (operation === 'add' || operation === 'subtract' || operation === 'subtract-neg') {
        // Addition/Subtraction modes: simple rows of ants + apples
        const sign = (operation === 'add') ? '+' : '-';
        opSymbolEl.textContent = sign;
        plusEl.textContent = sign;

        if (first > 0) {
          antsDiv.textContent = Array(first).fill(antEmoji).join(' ');
        }
        if (second > 0) {
          if (operation === 'subtract' || operation === 'subtract-neg') {
            // Show apples as "ghosted" to imply subtraction
            applesDiv.innerHTML = `<span class="ghost">${Array(second).fill(appleEmoji).join(' ')}</span>`;
          } else {
            applesDiv.textContent = Array(second).fill(appleEmoji).join(' ');
          }
        }
      } else if (operation === 'multiply') {
        // Multiplication mode: array of apples (rows × columns)
        opSymbolEl.textContent = '×';
        plusEl.textContent = '=';

        if (first > 0 && second > 0) {
          let html = '';
          for (let r = 0; r < first; r++) {
            html += Array(second).fill(appleEmoji).join(' ') + '<br>';
          }
          applesDiv.innerHTML = html;
          antsDiv.textContent = `${first} × ${second}`;
        } else if (first > 0 || second > 0) {
          antsDiv.textContent = `${first} × ${second}`;
        }
      } else {
        // Division mode: Move equation to its own line above the visualization
        visual.style.flexDirection = 'column';
        visual.style.alignItems = 'center';
        plusEl.style.display = 'none'; // Equation is self-contained in antsDiv

        const dividend = first;
        const divisor = second;

        if (dividend > 0 && divisor > 0) {
          const quotient = Math.round(dividend / divisor);
          antsDiv.textContent = `${dividend} ÷ ${divisor} = `;
          antsDiv.style.marginBottom = '10px';

          // Ultra-Dynamic scaling for high-number division (X-Multiplier era)
          const maxDim = Math.max(dividend, divisor, quotient * 5); 
          let calcFontSize = 1.4;
          if (maxDim > 500) calcFontSize = 0.5;
          else if (maxDim > 250) calcFontSize = 0.65;
          else if (maxDim > 150) calcFontSize = 0.8;
          else if (maxDim > 80) calcFontSize = 1.0;
          else if (maxDim > 40) calcFontSize = 1.2;
          
          visual.style.fontSize = `${calcFontSize}rem`;

          applesDiv.style.display = 'flex';
          applesDiv.style.flexWrap = 'wrap';
          applesDiv.style.justifyContent = 'center';
          applesDiv.style.gap = quotient > 20 ? '4px' : '8px';

          let html = '';
          const boxPadding = calcFontSize < 1.0 ? '2px 4px' : '4px 6px';
          for (let g = 0; g < quotient; g++) {
            // Remove nowrap and add a flexible max-width to the box 
            // so 100+ apples don't push the box off-screen
            html += `<span style="display:inline-block; padding:${boxPadding}; border:1px dashed #aaa; border-radius:6px; max-width: 140px; line-height:1.2;">${Array(divisor).fill(appleEmoji).join(' ')}</span>`;
          }
          applesDiv.innerHTML = html;
        } else {
          antsDiv.textContent = `${dividend} ÷ ${divisor}`;
          applesDiv.style.display = 'block';
        }
      }
    }

    /* ---------- Event wiring ---------- */

    function toggleDevMode() {
      const devModeBtn = document.getElementById('ants-dev-mode-btn');
      devMode = !devMode;
      const gameView = document.getElementById('ants-game-view');
      const devView = document.getElementById('ants-dev-view');
      const banner = document.getElementById('ants-banner');
      
      if (devMode) {
        if (gameView) gameView.style.display = 'none';
        if (devView) devView.style.display = 'block';
        if (devModeBtn) {
          devModeBtn.textContent = 'Back to Game';
          devModeBtn.classList.add('active');
        }
        if (banner) banner.style.opacity = '0.3';
        pauseMusic();
        showDevPicker();
      } else {
        if (gameView) gameView.style.display = 'block';
        if (devView) devView.style.display = 'none';
        if (devModeBtn) {
          devModeBtn.textContent = 'Dev Mode';
          devModeBtn.classList.remove('active');
        }
        if (banner) banner.style.opacity = '1';
        if (musicEnabled) playMusic();
      }
    }

    function showDevPicker() {
      const banner = document.getElementById('ants-dev-banner');
      if (banner) banner.textContent = "Dev Dashboard";
      const devCanvas = document.getElementById('ants-dev-canvas');
      if (!devCanvas) return;
      
      devCanvas.innerHTML = `
        <div class="dev-picker-container">
          <h2 class="dev-picker-title">Select Module</h2>
          <div class="dev-picker-grid">
            <button id="pick-fractions" class="picker-card">
              <div class="card-icon">½</div>
              <div class="card-text">Fractions</div>
            </button>
            <button id="pick-algebra" class="picker-card">
              <div class="card-icon">x</div>
              <div class="card-text">Algebra</div>
            </button>
            <button id="pick-chains" class="picker-card">
              <div class="card-icon">3+</div>
              <div class="card-text">Chains</div>
            </button>
            <button id="pick-chainsX" class="picker-card">
              <div class="card-icon">x+</div>
              <div class="card-text">Chains & X</div>
            </button>
          </div>
        </div>
      `;

      document.getElementById('pick-fractions').addEventListener('click', initFractionsDev);
      document.getElementById('pick-algebra').addEventListener('click', initAlgebraDev);
      document.getElementById('pick-chains').addEventListener('click', initChainsDev);
      document.getElementById('pick-chainsX').addEventListener('click', initChainsAlgebraDev);
    }

    function hookButtons() {
      document.getElementById('ants-reset-btn').addEventListener('click', () => {
        currentLevel = 1;
        resetTimerAndStreak();
        setupLevel(currentLevel);
        setMessage(`Game reset. Back to Level 1 on a ${gridSize} × ${gridSize} grid.`);
      });

      document.getElementById('ants-esc-btn').addEventListener('click', hideKeypad);

      document.getElementById('ants-apples-keypad-backdrop').addEventListener('click', (e) => {
        if (e.target.id === 'ants-apples-keypad-backdrop') {
          hideKeypad();
        }
      });

      const sizeSelect = document.getElementById('ants-size-select');
      const levelCountInput = document.getElementById('ants-level-count-input');
      const levelCountMaxLabel = document.getElementById('ants-level-count-max-label');

      function updateLevelInputBounds() {
        const sizeVal = parseInt(sizeSelect.value, 10) || 3;
        const opVal = Array.from(document.querySelectorAll('input[name="ants-op"]')).find(r => r.checked)?.value || 'add';

        // Restrict size options for division
        Array.from(sizeSelect.options).forEach(opt => {
          const val = parseInt(opt.value, 10);
          if (opVal === 'divide') {
            if (val > 6) {
              opt.disabled = true;
              opt.style.display = 'none';
            } else {
              opt.disabled = false;
              opt.style.display = 'block';
            }
          } else {
            opt.disabled = false;
            opt.style.display = 'block';
          }
        });

        // If current selection is invalid, reset to 6
        if (opVal === 'divide' && sizeVal > 6) {
          sizeSelect.value = '6';
        }

        // Calculate actual playable max tiles
        let playableCount = 0;
        let tempRows = [], tempCols = [];
        const finalSize = parseInt(sizeSelect.value, 10);

        if (opVal === 'divide') {
          if (finalSize === 3) { tempRows = [4, 8, 12]; tempCols = [1, 2, 4]; }
          else if (finalSize === 4) { tempRows = [4, 8, 12, 16]; tempCols = [1, 2, 4, 8]; }
          else if (finalSize === 5) { tempRows = [4, 8, 12, 16, 24]; tempCols = [1, 2, 4, 8, 12]; }
          else if (finalSize === 6) { 
             // Note: Multiplier X logic handled in current configuration, 
             // for bounds checking we just use base patterns
             tempRows = [24, 48, 72, 96, 120, 144]; 
             tempCols = [1, 2, 3, 6, 12, 24]; 
          }
        } else {
          tempRows = Array.from({ length: finalSize }, (_, i) => i + 1);
          tempCols = Array.from({ length: finalSize }, (_, i) => i + 1);
        }

        tempRows.forEach(r => {
          tempCols.forEach(c => {
            if (opVal !== 'divide' || r % c === 0) playableCount++;
          });
        });

        levelCountInput.max = String(playableCount);
        levelCountMaxLabel.textContent = String(playableCount);

        const currentVal = parseInt(levelCountInput.value, 10);
        if (isNaN(currentVal) || currentVal < 1 || currentVal > playableCount) {
          levelCountInput.value = String(Math.min(MAX_LEVEL, playableCount));
        }
      }

      sizeSelect.addEventListener('change', updateLevelInputBounds);
      document.querySelectorAll('input[name="ants-op"]').forEach(r => {
        r.addEventListener('change', updateLevelInputBounds);
      });

      document.getElementById('ants-grid-size-btn').addEventListener('click', () => {
        openSizeDialog(false);
      });

      document.getElementById('ants-level-count-input').addEventListener('click', (e) => {
        showKeypad(e.target, "Number of Levels");
      });

      document.getElementById('ants-size-start-btn').addEventListener('click', startGameFromSettings);

      function startGameFromSettings() {
        let size = parseInt(sizeSelect.value, 10) || 3;
        const maxTiles = size * size;

        const opRadios = document.querySelectorAll('input[name="ants-op"]');
        opRadios.forEach(r => {
          if (r.checked) {
            operation = r.value; // 'add', 'multiply', or 'divide'
          }
        });

        // Division: enforce max 6×6
        if (operation === 'divide' && size > 6) {
          sizeSelect.value = '6';
          size = 6;
        }

        let levelCount = parseInt(levelCountInput.value, 10);
        if (isNaN(levelCount) || levelCount < 1) levelCount = 3;
        if (levelCount > maxTiles) levelCount = maxTiles;

        showHelper = document.getElementById('ants-show-helper-toggle').checked;
        const helperDiv = document.getElementById('ants-helper');

        // Handle Master Mode Visuals
        const existingBadge = document.getElementById('ants-master-badge');
        if (existingBadge) existingBadge.remove();

        if (helperDiv) {
          if (showHelper) {
            helperDiv.style.display = 'block';
          } else {
            helperDiv.style.display = 'none';
            // Inject the Master Badge
            const badge = document.createElement('div');
            badge.id = 'ants-master-badge';
            badge.className = 'master-mode-badge';
            badge.innerHTML = 'Master Mode Active';
            helperDiv.parentNode.insertBefore(badge, helperDiv.nextSibling);
          }
        }

        configureGrid(size, levelCount);
        closeSizeDialog();

        // Start music after user hits "Start" (if enabled)
        if (musicEnabled) {
          playMusic();
        }

        // Track game start
        if (typeof gtag === 'function') {
          gtag('event', 'game_start', {
            'grid_size': size,
            'operation': operation,
            'level_count': levelCount,
            'learning_aids': showHelper
          });
        }
      }

      document.getElementById('ants-size-cancel-btn').addEventListener('click', () => {
        closeSizeDialog();
      });

      document.getElementById('ants-size-backdrop').addEventListener('click', (e) => {
        if (e.target.id === 'ants-size-backdrop') {
          closeSizeDialog();
        }
      });

      document.getElementById('ants-win-play-again').addEventListener('click', restartGameFromVictory);

      function restartGameFromVictory() {
        hideWinOverlay();
        currentLevel = 1;
        resetTimerAndStreak();
        setupLevel(currentLevel);
        setMessage(`New game on a ${gridSize} × ${gridSize} grid. Levels: ${MAX_LEVEL}. Mode: ${opLabel()}.`);
      }

      document.getElementById('ants-win-backdrop').addEventListener('click', (e) => {
        if (e.target.id === 'ants-win-backdrop') {
          hideWinOverlay();
        }
      });

      // Music toggle
      const musicToggle = document.getElementById('ants-music-toggle');
      if (musicToggle) {
        musicToggle.addEventListener('click', () => {
          musicEnabled = !musicEnabled;
          if (musicEnabled) {
            playMusic();
          } else {
            pauseMusic();
          }
          updateMusicToggleLabel();
        });
      }

      // Print Worksheet
      const printBtn = document.getElementById('ants-print-worksheet');
      if (printBtn) {
        printBtn.addEventListener('click', printWorksheet);
      }

      // Dev Mode toggle
      const devModeBtn = document.getElementById('ants-dev-mode-btn');
      if (devModeBtn) {
        devModeBtn.addEventListener('click', toggleDevMode);
      }



      // Wire divide note toggle — show hint when Division is selected
      const opRadioEls = document.querySelectorAll('input[name="ants-op"]');
      const divideNote = document.getElementById('ants-divide-note');
      opRadioEls.forEach(r => {
        r.addEventListener('change', () => {
          if (divideNote) divideNote.style.display = r.value === 'divide' && r.checked ? 'block' : 'none';
        });
      });

      // Initialize bounds the first time
      updateLevelInputBounds();
    }

    function onTileClick(tile) {
      const active = tile.dataset.active === 'true';
      if (!active) return;

      const status = tile.dataset.status;
      if (status === 'correct') return;

      // Start timer on first valid tile click
      startTimerIfNeeded();

      activeTileEl = tile;
      if (status === 'incorrect') {
        tile.classList.remove('incorrect');
        tile.classList.add('pending');
        tile.dataset.status = 'pending';
      }

      const rowIdx = parseInt(tile.dataset.row, 10) - 1;
      const colIdx = parseInt(tile.dataset.col, 10) - 1;
      const a = ROWS[rowIdx]; // quotient (hidden row value)
      const b = COLS[colIdx]; // divisor (visible col value)

      // Show equation at top of keypad
      const eq = document.getElementById('ants-keypad-equation');
      if (eq) {
        const symbols = { 'add': '+', 'subtract': '-', 'subtract-neg': '-', 'multiply': '×', 'divide': '÷' };
        let symbol = symbols[operation] || '+';
        setHelperValues(a, b);
        showKeypad(tile, `${a} ${symbol} ${b}`);
      }
    }

    function isLevelComplete() {
      const tiles = root.querySelectorAll('.tile[data-active="true"]');
      return Array.from(tiles).every(t => t.dataset.status === 'correct');
    }

    function setMessage(msg) {
      document.getElementById('ants-message').textContent = msg || '';
    }

    function opLabel() {
      if (operation === 'add') return 'Addition';
      if (operation === 'subtract') return 'Subtraction';
      if (operation === 'subtract-neg') return 'Subtraction (Negative)';
      if (operation === 'multiply') return 'Multiplication';
      return 'Division';
    }

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function goToNextLevel() {
      if (currentLevel >= MAX_LEVEL) return;
      currentLevel++;
      setupLevel(currentLevel);
      setMessage(`Welcome to Level ${currentLevel}.`);
    }

    /* ---------- Grid size + op + level-count dialog ---------- */

    function openSizeDialog(isInitial) {
      const backdrop = document.getElementById('ants-size-backdrop');
      const select = document.getElementById('ants-size-select');
      const opRadios = document.querySelectorAll('input[name="ants-op"]');
      const levelCountInput = document.getElementById('ants-level-count-input');
      const levelCountMaxLabel = document.getElementById('ants-level-count-max-label');

      if (!isInitial) {
        select.value = String(gridSize);
        opRadios.forEach(r => {
          r.checked = (r.value === operation);
        });

        const maxTiles = gridSize * gridSize;
        levelCountInput.max = String(maxTiles);
        levelCountMaxLabel.textContent = String(maxTiles);

        if (!levelCountInput.value || parseInt(levelCountInput.value, 10) > maxTiles) {
          levelCountInput.value = String(Math.min(MAX_LEVEL, maxTiles));
        }
      } else {
        const sizeVal = parseInt(select.value, 10) || 3;
        const maxTiles = sizeVal * sizeVal;
        levelCountInput.max = String(maxTiles);
        levelCountMaxLabel.textContent = String(maxTiles);
        levelCountInput.value = '3';
      }

      backdrop.style.display = 'flex';
      hideKeypad();
    }

    function closeSizeDialog() {
      document.getElementById('ants-size-backdrop').style.display = 'none';
    }

    /* ---------- Timer + streak helpers ---------- */

    function startTimerIfNeeded() {
      if (timerStarted) return;
      timerStarted = true;
      elapsedSeconds = 0;
      updateTimerLabel();
      timerIntervalId = setInterval(() => {
        elapsedSeconds++;
        updateTimerLabel();
      }, 1000);
    }

    function clearTimer() {
      if (timerIntervalId !== null) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
      }
    }

    function resetTimerAndStreak() {
      clearTimer();
      timerStarted = false;
      elapsedSeconds = 0;
      updateTimerLabel();
      currentStreak = 0;
      bestStreak = 0;
      updateStreakDisplay();
    }

    function updateTimerLabel() {
      const el = document.getElementById('ants-timer');
      if (!el) return;
      el.textContent = formatTime(elapsedSeconds);
    }

    function updateStreakDisplay() {
      const el = document.getElementById('ants-streak-current');
      if (!el) return;
      el.textContent = String(currentStreak);
    }

    function formatTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const secStr = seconds < 10 ? '0' + seconds : String(seconds);
      return `${minutes}:${secStr}`;
    }

    /* ---------- Keyboard shortcuts for keypad ---------- */

    function onKeyDown(e) {
      // 1. Keypad
      const keypadBackdrop = document.getElementById('ants-apples-keypad-backdrop');
      if (keypadBackdrop && keypadBackdrop.style.display === 'flex') {
        if (e.key === 'Escape') {
          e.preventDefault();
          hideKeypad();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          submitInput();
        } else if (e.key >= '0' && e.key <= '9') {
          appendDigit(e.key);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          backspaceInput();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          toggleMinus();
        }
        return;
      }

      // 2. Settings
      const sizeBackdrop = document.getElementById('ants-size-backdrop');
      if (sizeBackdrop && sizeBackdrop.style.display === 'flex') {
        if (e.key === 'Enter') {
          e.preventDefault();
          // The functions are scoped within initAntsApples and hoisted or defined
          // We need to make sure they are accessible. They are now defined in hookButtons.
          // To be safe, let's call the click on the button or ensure accessibility.
          document.getElementById('ants-size-start-btn').click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeSizeDialog();
        }
        return;
      }

      // 3. Victory
      const winBackdrop = document.getElementById('ants-win-backdrop');
      if (winBackdrop && winBackdrop.style.display === 'flex') {
        if (e.key === 'Enter') {
          e.preventDefault();
          document.getElementById('ants-win-play-again').click();
        }
        return;
      }
    }

    /* ---------- Music helpers ---------- */

    function playMusic() {
      if (!musicEl) return;
      // play() may return a promise we don't care about
      const p = musicEl.play();
      if (p && p.catch) {
        p.catch(() => {
          // ignore autoplay rejections
        });
      }
    }

    function pauseMusic() {
      if (!musicEl) return;
      musicEl.pause();
    }

    function updateMusicToggleLabel() {
      const btn = document.getElementById('ants-music-toggle');
      if (!btn) return;
      btn.textContent = musicEnabled ? 'Music: On' : 'Music: Off';
    }

    /* ---------- Win overlay ---------- */

    function showWinOverlay() {
      const backdrop = document.getElementById('ants-win-backdrop');
      const titleEl = document.getElementById('ants-win-title');
      const bodyEl = document.getElementById('ants-win-body');
      const timeText = formatTime(elapsedSeconds);
      const modeLabel = opLabel();

      if (!showHelper) {
        titleEl.innerHTML = "MASTER MODE CHAMPION!";
        titleEl.className = "master-victory-title";

        let nextGrid = gridSize;
        let nextOpName = opLabel();
        const isDivisionMax = (operation === 'divide' && gridSize === 5);

        if (gridSize < 9 && !(operation === 'divide' && gridSize >= 5)) {
          nextGrid = gridSize + 1;
        } else {
          nextGrid = 3;
          if (operation === 'add') nextOpName = 'Subtraction';
          else if (operation === 'subtract') nextOpName = 'Subtraction (Negative)';
          else if (operation === 'subtract-neg') nextOpName = 'Multiplication';
          else if (operation === 'multiply') nextOpName = 'Division';
          else nextOpName = 'Addition';
        }

        const currentOpLabel = opLabel().toLowerCase();
        const nextOpLabel = nextOpName.toLowerCase();

        bodyEl.innerHTML = `
          <img src="assets/coloring-template-ants/math_master.png" class="master-victory-img" alt="Math Master Ant">
          Impressive! You solved a ${gridSize}×${gridSize} matrix in ${currentOpLabel} mode.<br>
          ${isDivisionMax ? '<strong>You have mastered Ants and Apples!</strong>' : `Consider challenging yourself to ${nextGrid}×${nextGrid} ${nextOpLabel}.`}
        `;
      } else {
        titleEl.textContent = "Congratulations!";
        titleEl.className = "";
        const currentOpLabel = modeLabel.toLowerCase();
        bodyEl.innerHTML = `
          You completed ${gridSize}×${gridSize} ${currentOpLabel} in ${timeText}.<br><br>
          Next time, try the same challenge in <strong>Master Mode</strong> (turn off "Learning Aids" in Settings) to become a math master!
        `;
      }

      backdrop.style.display = 'flex';

      // Track game win
      if (typeof gtag === 'function') {
        gtag('event', 'game_win', {
          'grid_size': gridSize,
          'operation': operation,
          'duration_secs': elapsedSeconds,
          'learning_aids': showHelper
        });
      }
    }

    function hideWinOverlay() {
      document.getElementById('ants-win-backdrop').style.display = 'none';
    }

    /* ---------- Worksheet Print ---------- */

    function printWorksheet() {
      if (devMode) {
        if (currentDevModule === 'fractions') {
          printFractionsWorksheet();
        } else if (currentDevModule === 'algebra') {
          printAlgebraWorksheet();
        } else if (currentDevModule === 'chains') {
          printChainsWorksheet();
        } else if (currentDevModule === 'chainsX') {
          printChainsXWorksheet();
        }
        return;
      }

      const symbols = { 'add': '+', 'subtract': '-', 'subtract-neg': '-', 'multiply': '×', 'divide': '÷' };
      const opSymbol = symbols[operation] || '+';
      const availableProblems = [];

      ROWS.forEach(r => {
        COLS.forEach(c => {
          let playable = true;
          if (operation === 'divide') playable = (r % c === 0);
          else if (operation === 'subtract') playable = (r >= c);

          if (playable) {
            availableProblems.push(`${r} ${opSymbol} ${c} = ___`);
          }
        });
      });

      const selectedProblems = [];
      if (availableProblems.length > 0) {
        shuffleArray(availableProblems);
        for (let i = 0; i < 12; i++) {
          selectedProblems.push(availableProblems[i % availableProblems.length]);
        }
        shuffleArray(selectedProblems);
      }

      const metaLines = [
        `Operation: ${opLabel()} (${opSymbol})`
      ];

      openWorksheet(selectedProblems, metaLines);
    }

    const ANT_ASSETS = [
      'ant_jazz_hands.png', 'ants_apple_cart.png', 'ants_apple_hoist.png',
      'ants_basket_apple.png', 'ants_behind_apple.png', 'ants_celebration.png',
      'ants_chalkboard.png', 'ants_glasses.png', 'ants_grad.png',
      'ants_homework.png', 'ants_pencil.png', 'ants_pencil_3.png'
    ];

    function openWorksheet(problems, metaLines, numCols = 6) {
      let selectedAnts = [];

      // 10% chance for the "Math Master" easter egg image
      if (Math.random() < 0.10) {
        selectedAnts.push('math_master.png');
        const others = [...ANT_ASSETS].sort(() => 0.5 - Math.random()).slice(0, 2);
        selectedAnts.push(...others);
        selectedAnts.sort(() => 0.5 - Math.random()); // Randomize position
      } else {
        selectedAnts = [...ANT_ASSETS].sort(() => 0.5 - Math.random()).slice(0, 3);
      }

      const win = window.open('', '_blank');
      if (!win) {
        alert("Please allow popups to print.");
        return;
      }

      const baseUrl = window.location.href.split('index.html')[0];

      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <base href="${baseUrl}">
          <title> </title> <!-- Empty title helps hide center header -->
          <style>
            @page { 
              margin: 0; /* Helps hide browser headers/footers */
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0;
              color: #222;
              background: #fff;
            }
            .page-container {
              padding: 0.5in; /* Safe area but closer to edge for "full bleed" feel */
              min-height: 100vh;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              position: relative;
              margin: 0;
            }
            .worksheet-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              border-bottom: 3px solid #333;
              padding-bottom: 20px;
            }
            .header-left {
              flex: 0 0 210px;
              text-align: left;
            }
            .header-logo {
              max-width: 210px;
              height: auto;
              display: block;
            }
            .header-center {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              gap: 8px;
              font-weight: bold;
              font-size: 1.1rem;
              text-align: center;
            }
            .header-right {
              flex: 0 0 auto;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 8px;
              font-weight: bold;
              font-size: 1.1rem;
              text-align: right;
            }
            h1 { 
              margin: 0; 
              font-size: 1.8rem;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(${numCols}, 1fr); 
              gap: 15px; 
              flex-grow: 0;
              align-content: start;
              margin-top: 20px;
              width: 100%;
            }
            .problem { 
               font-size: 1.3rem; 
               padding: 12px 2px; 
               white-space: nowrap; 
               text-align: center;
               border-bottom: 2px dashed #f0f0f0;
               display: flex;
               align-items: center;
               justify-content: center;
               gap: 5px;
             }
             /* Vertical Fractions in Print */
             .f-wrap { display: flex; flex-direction: column; align-items: center; min-width: 25px; }
             .n { border-bottom: 2px solid #000; width: 100%; text-align: center; padding-bottom: 2px; font-size: 0.9em; }
             .d { width: 100%; text-align: center; padding-top: 2px; font-size: 0.9em; }
             .f-op { font-weight: bold; margin: 0 4px; font-size: 1.1em; }
             .f-box { border: 1px solid #999; width: 35px; height: 45px; margin-left: 5px; border-radius: 4px; display: flex; flex-direction: column; }
             .f-whole { font-weight: 800; font-size: 1.4em; }
             .math-op-mul { font-weight: 900; font-size: 0.8em; vertical-align: middle; padding: 0 4px; display: inline-block; transform: translateY(-1px); }
             .math-var { font-family: "Times New Roman", serif; font-style: italic; font-weight: 800; color: #1976d2; }
            .coloring-section {
              margin-top: 10px;
              display: flex;
              justify-content: space-around;
              align-items: flex-end;
              flex-grow: 1; /* Expand to fill space */
              padding-bottom: 10px;
            }
            .ant-illustration {
              max-width: 180px;
              max-height: 180px;
              height: auto;
              opacity: 0.7;
              filter: grayscale(1);
            }
            .footer { 
              margin-top: 15px; 
              display: flex;
              justify-content: space-between;
              font-size: 0.75rem; 
              color: #888;
            }
            .no-print { 
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 1000;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button onclick="window.print()" style="padding: 12px 24px; background: #2e7d32; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">Print / Save PDF</button>
          </div>
          <div class="page-container">
            <header class="worksheet-header">
              <div class="header-left">
                <img src="assets/ants-apples-text.png" 
                     class="header-logo" 
                     alt="Ants & Apples" 
                     onerror="this.style.display='none'; document.getElementById('fallback-title').style.display='block';">
                <h1 id="fallback-title" style="display:none;">Ants & Apples</h1>
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
              ${selectedAnts.map(img => `<img src="assets/coloring-template-ants/${img}" class="ant-illustration" alt="Ant Art">`).join('')}
            </div>

            <div class="footer">
              <span>Ants & Apples Math Master · Page 1/1</span>
            </div>
          </div>
        </body>
        </html>
      `);
      win.document.close();
    }




/* ---------- Fractions Dev Mode ---------- */

    function initFractionsDev() {
      const banner = document.getElementById('ants-dev-banner');
      if (banner) banner.textContent = "Fractions Dev Mode";
      
      currentDevModule = 'fractions';
      const devCanvas = document.getElementById('ants-dev-canvas');
      if (!devCanvas) return;

      devCanvas.innerHTML = `
        <div class="fractions-container">
          <button id="f-home" class="f-home-btn" title="Back to Settings">🏠</button>
          <div class="f-settings">
            <button id="f-op-add" class="f-setting-btn active">+</button>
            <button id="f-op-sub" class="f-setting-btn">-</button>
            <button id="f-op-mul" class="f-setting-btn">×</button>
          </div>
          <div class="fraction-problem">
            <div id="f-vis-1" class="fraction-vis"></div>
            <div class="f-math" id="f-math-1">
              <div class="f-num" id="f-n1">1</div>
              <div class="f-bar" id="f-b1"></div>
              <div class="f-den" id="f-d1">4</div>
            </div>
            
            <div class="f-op" id="f-op-symbol">+</div>

            <div id="f-vis-2" class="fraction-vis"></div>
            <div class="f-math">
              <div class="f-num" id="f-n2">2</div>
              <div class="f-bar"></div>
              <div class="f-den" id="f-d2">4</div>
            </div>

            <div class="f-op">=</div>

            <div class="f-math result">
              <input type="text" id="f-res-n" class="f-res-input" placeholder="?" readonly>
              <div class="f-bar"></div>
              <div class="f-den" id="f-res-d">4</div>
            </div>
          </div>
          <div class="f-controls">
            <button id="f-submit-btn" class="btn">Check Answer</button>
            <div id="f-msg" class="message"></div>
          </div>
          <div class="f-level-track">Problem <span id="f-count-label">1</span> / 6 (Challenge: Denominator <span id="f-denom-label">2</span>)</div>
        </div>
      `;

      document.getElementById('f-op-add').addEventListener('click', () => setFractionOp('add'));
      document.getElementById('f-op-sub').addEventListener('click', () => setFractionOp('subtract'));
      document.getElementById('f-op-mul').addEventListener('click', () => setFractionOp('multiply'));
      document.getElementById('f-submit-btn').addEventListener('click', checkFractionAnswer);
      document.getElementById('f-home').addEventListener('click', showDevPicker);
      document.getElementById('f-res-n').addEventListener('click', (e) => {
        showKeypad(e.target, "Solve Fraction");
      });

      generateFractionProblem(true);
    }

    function setFractionOp(op) {
      fractionOp = op;
      document.getElementById('f-op-add').classList.toggle('active', op === 'add');
      document.getElementById('f-op-sub').classList.toggle('active', op === 'subtract');
      document.getElementById('f-op-mul').classList.toggle('active', op === 'multiply');
      
      const symbols = { 'add': '+', 'subtract': '-', 'multiply': '×' };
      document.getElementById('f-op-symbol').textContent = symbols[op];
      
      // Update first operand UI for multiplication (show as whole number)
      const b1 = document.getElementById('f-b1');
      const d1 = document.getElementById('f-d1');
      const v1 = document.getElementById('f-vis-1');
      if (op === 'multiply') {
        if (b1) b1.style.display = 'none';
        if (d1) d1.style.display = 'none';
        if (v1) v1.style.display = 'none';
      } else {
        if (b1) b1.style.display = 'block';
        if (d1) d1.style.display = 'block';
        if (v1) v1.style.display = 'block';
      }
      
      generateFractionProblem(true);
    }

    function generateFractionProblem(isFirst = false) {
      if (isFirst) {
        fractionProblemsSolved = 0;
        fractionDenom = 2; // Start simple
      } else {
        // Random denominator between 2 and 10
        fractionDenom = Math.floor(Math.random() * 9) + 2;
      }

      // f1 (op) f2
      if (fractionOp === 'add') {
        currentF1 = Math.floor(Math.random() * fractionDenom) + 1;
        currentF2 = Math.floor(Math.random() * (fractionDenom - currentF1 + 1));
        if (currentF2 === 0 && Math.random() > 0.3) currentF2 = 1;
      } else if (fractionOp === 'subtract') {
        // Subtraction: f1 >= f2
        currentF1 = Math.floor(Math.random() * fractionDenom) + 1;
        currentF2 = Math.floor(Math.random() * (currentF1 + 1));
        if (currentF1 === 0) currentF1 = 1; 
      } else {
        // Multiplication: Integer * Fraction
        // n1 (whole) * (n2 / d) = (n1*n2) / d
        currentF1 = Math.floor(Math.random() * 3) + 1; // Multiplier 1-3
        currentF2 = Math.floor(Math.random() * (Math.floor(fractionDenom / currentF1))) + 1;
      }

      document.getElementById('f-n1').textContent = currentF1;
      document.getElementById('f-n2').textContent = currentF2;
      document.getElementById('f-d1').textContent = fractionDenom;
      document.getElementById('f-d2').textContent = fractionDenom;
      document.getElementById('f-res-d').textContent = fractionDenom;
      document.getElementById('f-denom-label').textContent = fractionDenom;
      document.getElementById('f-count-label').textContent = fractionProblemsSolved + 1;

      renderFractionVis('f-vis-1', currentF1, fractionDenom, '#448aff');
      renderFractionVis('f-vis-2', currentF2, fractionDenom, '#ff8a80');

      const input = document.getElementById('f-res-n');
      if (input) {
        input.value = '';
        input.focus();
      }
      document.getElementById('f-msg').textContent = '';
    }

    function renderFractionVis(containerId, num, den, color) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      for (let i = den; i >= 1; i--) {
        const box = document.createElement('div');
        box.className = 'f-box';
        if (i <= num) {
          box.style.background = color;
        }
        container.appendChild(box);
      }
    }

    function checkFractionAnswer() {
      const input = document.getElementById('f-res-n');
      if (!input) return;
      const guess = parseInt(input.value, 10);
      let correct = 0;
      if (fractionOp === 'add') correct = currentF1 + currentF2;
      else if (fractionOp === 'subtract') correct = currentF1 - currentF2;
      else correct = currentF1 * currentF2;
      
      const msg = document.getElementById('f-msg');

      if (guess === correct) {
        fractionProblemsSolved++;
        msg.textContent = "Great job!";
        msg.style.color = "#2e7d32";
        
        setTimeout(() => {
          if (fractionProblemsSolved < FRACTION_TOTAL_PROBLEMS) {
            generateFractionProblem();
          } else {
            msg.textContent = "FRACTIONS MASTER! You've solved all 6 problems.";
            msg.style.color = "#b8860b";
            msg.classList.add('master-victory-title');
          }
        }, 1500);
      } else {
        msg.textContent = "Oops! Try adding the top numbers (numerators).";
        msg.style.color = "#c62828";
        input.select();
      }
    }

    function initAlgebraDev() {
      const banner = document.getElementById('ants-dev-banner');
      if (banner) banner.textContent = "Algebra Dev Mode";
      
      currentDevModule = 'algebra';
      const devCanvas = document.getElementById('ants-dev-canvas');
      if (!devCanvas) return;
      
      devCanvas.innerHTML = `
        <div class="algebra-dev-container">
           <button id="a-home" class="f-home-btn" title="Back to Settings">🏠</button>
           
           <div class="f-settings">
            <button id="a-op-add" class="f-setting-btn active">+</button>
            <button id="a-op-sub" class="f-setting-btn">-</button>
            <button id="a-op-mul" class="f-setting-btn">×</button>
            <button id="a-op-div" class="f-setting-btn">÷</button>
          </div>

           <div class="algebra-problem-box">
             <div id="a-prob-text" class="algebra-text">2 + x = 5</div>
             <div class="algebra-input-row">
               <span class="x-label">x = </span>
               <input type="text" id="a-res-x" class="f-res-input" placeholder="?" readonly>
             </div>
           </div>

           <div class="f-controls">
            <button id="a-submit-btn" class="btn">Check Answer</button>
            <div id="a-msg" class="message"></div>
          </div>
        </div>
      `;

      document.getElementById('a-op-add').addEventListener('click', () => setAlgebraOp('add'));
      document.getElementById('a-op-sub').addEventListener('click', () => setAlgebraOp('subtract'));
      document.getElementById('a-op-mul').addEventListener('click', () => setAlgebraOp('multiply'));
      document.getElementById('a-op-div').addEventListener('click', () => setAlgebraOp('divide'));
      
      document.getElementById('a-submit-btn').addEventListener('click', checkAlgebraAnswer);
      document.getElementById('a-res-x').addEventListener('click', (e) => {
        showKeypad(e.target, "Solve for x");
      });

      document.getElementById('a-home').addEventListener('click', showDevPicker);

      generateAlgebraProblem();
    }

    function setAlgebraOp(op) {
      algebraOp = op;
      document.getElementById('a-op-add').classList.toggle('active', op === 'add');
      document.getElementById('a-op-sub').classList.toggle('active', op === 'subtract');
      document.getElementById('a-op-mul').classList.toggle('active', op === 'multiply');
      document.getElementById('a-op-div').classList.toggle('active', op === 'divide');
      generateAlgebraProblem();
    }

    function generateAlgebraProblem() {
      // Very simple problems initially
      const range = 10;
      if (algebraOp === 'add') {
        currentAlgA = Math.floor(Math.random() * 9) + 1;
        currentAlgX = Math.floor(Math.random() * 9) + 1;
        currentAlgB = currentAlgA + currentAlgX;
        document.getElementById('a-prob-text').textContent = `${currentAlgA} + x = ${currentAlgB}`;
      } else if (algebraOp === 'subtract') {
        currentAlgX = Math.floor(Math.random() * 8) + 1;
        currentAlgB = Math.floor(Math.random() * 8) + 1;
        currentAlgA = currentAlgB + currentAlgX;
        document.getElementById('a-prob-text').textContent = `${currentAlgA} - x = ${currentAlgB}`;
      } else if (algebraOp === 'multiply') {
        currentAlgA = Math.floor(Math.random() * 4) + 2; // coefficient 2-5
        currentAlgX = Math.floor(Math.random() * 5) + 1; // x 1-5
        currentAlgB = currentAlgA * currentAlgX;
        document.getElementById('a-prob-text').textContent = `${currentAlgA}x = ${currentAlgB}`;
      } else {
        // Division: a / x = b
        currentAlgX = Math.floor(Math.random() * 4) + 2; // divisor 2-5
        currentAlgB = Math.floor(Math.random() * 4) + 2; // quotient 2-5
        currentAlgA = currentAlgB * currentAlgX;
        document.getElementById('a-prob-text').textContent = `${currentAlgA} ÷ x = ${currentAlgB}`;
      }

      const input = document.getElementById('a-res-x');
      if (input) {
        input.value = '';
      }
      document.getElementById('a-msg').textContent = '';
    }

    function checkAlgebraAnswer() {
      const input = document.getElementById('a-res-x');
      const guess = parseInt(input.value, 10);
      const msg = document.getElementById('a-msg');
      
      if (guess === currentAlgX) {
        msg.textContent = "Great job! x = " + currentAlgX;
        msg.style.color = "#2e7d32";
        setTimeout(generateAlgebraProblem, 1500);
      } else {
        msg.textContent = "Not quite. Think about what number for x makes the equation true!";
        msg.style.color = "#c62828";
        input.select();
      }
    }

    /* ---------- Dev Mode Print Logic ---------- */

    function printFractionsWorksheet() {
      const numProblems = 12;
      const opSymbol = fractionOp === 'add' ? '+' : (fractionOp === 'subtract' ? '-' : '×');
      const opLabel = fractionOp.charAt(0).toUpperCase() + fractionOp.slice(1);
      
      const problemStrings = [];
      for (let i = 0; i < numProblems; i++) {
        let n1, n2, denom = fractionDenom;
        if (fractionOp === 'add') {
           n1 = Math.floor(Math.random() * denom) + 1;
           n2 = Math.floor(Math.random() * (denom - n1 + 1));
        } else if (fractionOp === 'subtract') {
           n1 = Math.floor(Math.random() * denom) + 1;
           n2 = Math.floor(Math.random() * (n1 + 1));
        } else {
           n1 = Math.floor(Math.random() * 3) + 1;
           n2 = Math.floor(Math.random() * (Math.floor(denom / n1))) + 1;
        }

        const p = `
          ${fractionOp === 'multiply' ? `<span class="f-whole">${n1}</span>` : `
          <div class="f-wrap">
            <div class="n">${n1}</div>
            <div class="d">${denom}</div>
          </div>`}
          <span class="f-op">${opSymbol}</span>
          <div class="f-wrap">
            <div class="n">${n2}</div>
            <div class="d">${denom}</div>
          </div>
          <span class="f-op">=</span>
          <div class="f-box">
             <div class="b"></div><div class="b"></div>
          </div>
        `;
        problemStrings.push(p);
      }

      openWorksheet(problemStrings, [`Fractions: ${opLabel} (Denom: ${fractionDenom})`]);
    }

    function printAlgebraWorksheet() {
      const numProblems = 12;
      const opLabel = algebraOp.charAt(0).toUpperCase() + algebraOp.slice(1);
      const problemStrings = [];
      for (let i = 0; i < numProblems; i++) {
        let a, x, b, pStr;
        if (algebraOp === 'add') {
          a = Math.floor(Math.random() * 15) + 1;
          x = Math.floor(Math.random() * 15) + 1;
          b = a + x;
          pStr = `${a} + x = ${b}`;
        } else if (algebraOp === 'subtract') {
          x = Math.floor(Math.random() * 12) + 1;
          b = Math.floor(Math.random() * 12) + 1;
          a = b + x;
          pStr = `${a} - x = ${b}`;
        } else if (algebraOp === 'multiply') {
          a = Math.floor(Math.random() * 6) + 2;
          x = Math.floor(Math.random() * 10) + 1;
          b = a * x;
          pStr = `${a}x = ${b}`;
        } else {
          x = Math.floor(Math.random() * 5) + 2;
          b = Math.floor(Math.random() * 6) + 2;
          a = b * x;
          pStr = `${a} ÷ x = ${b}`;
        }
        problemStrings.push(pStr + " ___");
      }

      openWorksheet(problemStrings, [`Algebra: Solve for (x) - ${opLabel}`]);
    }

    function printChainsWorksheet() {
      const numProblems = 12;
      const modeLabel = currentChainAllowNegative ? "± Neg" : "Positive Only";
      const problemStrings = [];
      
      for (let i = 0; i < numProblems; i++) {
        let terms = [], ops = [], result = 0;
        let currentVal = Math.floor(Math.random() * 10) + 1;
        terms.push(currentVal);
        result = currentVal;

        for (let j = 1; j < currentChainLength; j++) {
            const op = Math.random() > 0.5 ? '+' : '-';
            let term = Math.floor(Math.random() * 9) + 1;
            if (op === '-') {
                if (!currentChainAllowNegative && term >= result) term = Math.max(1, Math.floor(result / 2));
                result -= term;
            } else {
                result += term;
            }
            ops.push(op);
            terms.push(term);
        }

        let eq = "";
        for (let j = 0; j < terms.length; j++) {
            eq += terms[j];
            if (j < ops.length) eq += ` ${ops[j]} `;
        }
        problemStrings.push(eq + " = ___");
      }

      openWorksheet(problemStrings, [`Math Chains: Length ${currentChainLength} (${modeLabel})`], 4);
    }

    function printChainsXWorksheet() {
      const numProblems = 12;
      const modeName = currentChainsXMode.charAt(0).toUpperCase() + currentChainsXMode.slice(1);
      const problemStrings = [];

      for (let i = 0; i < numProblems; i++) {
        let pStr = "";
        if (currentChainsXMode === 'simple') {
            const ops = ['+', '-'];
            const o1 = ops[Math.floor(Math.random() * 2)], o2 = ops[Math.floor(Math.random() * 2)];
            let a = Math.floor(Math.random() * 15) + 5, b = Math.floor(Math.random() * 10) + 1, x = Math.floor(Math.random() * 10) + 1;
            let val = (o1 === '+') ? a + x : a - x;
            let resFinal = (o2 === '+') ? val + b : val - b;
            pStr = `${a} ${o1} <span class="math-var">x</span> ${o2} ${b} = ${resFinal}`;
        } else {
            const opsFull = ['+', '-', '×', '÷'];
            const op1 = opsFull[Math.floor(Math.random() * 2)], op2 = opsFull[Math.floor(Math.random() * opsFull.length)];
            let a, b, c, resultInner, finalResult;
            if (op2 === '÷') {
                c = Math.floor(Math.random() * 4) + 2; resultInner = Math.floor(Math.random() * 4) + 1; b = c * resultInner;
            } else if (op2 === '×') {
                b = Math.floor(Math.random() * 5) + 2; c = Math.floor(Math.random() * 5) + 1; resultInner = b * c;
            } else if (op2 === '+') {
                b = Math.floor(Math.random() * 10) + 1; c = Math.floor(Math.random() * 10) + 1; resultInner = b + c;
            } else {
                b = Math.floor(Math.random() * 10) + 5; c = Math.floor(Math.random() * 5) + 1; resultInner = b - c;
            }
            a = Math.floor(Math.random() * 10) + 10;
            if (op1 === '+') finalResult = a + resultInner;
            else { 
                if (resultInner >= a) a = resultInner + Math.floor(Math.random() * 5) + 1;
                finalResult = a - resultInner;
            }
            const mulChar = '<span class="math-op-mul">×</span>';
            const formattedOp2 = op2 === '×' ? mulChar : op2;
            pStr = `${a} ${op1} (${b} ${formattedOp2} <span class="math-var">x</span>) = ${finalResult}`;
        }
        problemStrings.push(`<div style="display:inline-block; text-align:left;">${pStr}<br><span class="math-var">x</span> = ___</div>`);
      }

      openWorksheet(problemStrings, [`Chains & X: ${modeName} Mode`], 4);
    }

/* ---------- Chains Dev Mode ---------- */

    function initChainsDev() {
      const banner = document.getElementById('ants-dev-banner');
      if (banner) banner.textContent = "Chains Dev Mode";
      
      currentDevModule = 'chains';
      const devCanvas = document.getElementById('ants-dev-canvas');
      if (!devCanvas) return;

      devCanvas.innerHTML = `
        <div class="chains-container">
          <div class="f-settings" style="flex-wrap: wrap; border-radius: 12px; justify-content: center; width: 100%; box-sizing: border-box; gap: 8px;">
            <button id="c-home" class="f-home-btn" title="Back to Settings" style="position:static; width:34px; height:34px; flex-shrink:0;">🏠</button>
            
            <div id="c-simple-settings" style="display:${currentChainMode === 'simple' ? 'flex' : 'none'}; align-items:center; gap:4px; margin:4px 0;">
              <label style="font-size:0.7rem; font-weight:700; color:#555;">Len:</label>
              <button class="c-len-btn ${currentChainLength === 3 ? 'active' : ''}" data-len="3">3</button>
              <button class="c-len-btn ${currentChainLength === 4 ? 'active' : ''}" data-len="4">4</button>
              <button class="c-len-btn ${currentChainLength === 5 ? 'active' : ''}" data-len="5">5</button>
            </div>

            <div style="width:1px; height:20px; background:#ddd; margin:0 2px;"></div>

            <button id="c-mode-toggle" class="c-mode-btn" style="min-width: 80px;">
                ${currentChainMode === 'simple' ? 'Mode: Simple' : 'Mode: Complex'}
            </button>
            
            <button id="c-neg-toggle" class="c-mode-btn ${currentChainAllowNegative ? 'active' : ''}" style="margin:4px 0;">
                ${currentChainAllowNegative ? 'Result: ± Neg' : 'Result: Pos'}
            </button>
          </div>
          
          <div class="fraction-problem">
             <div id="c-prob-text" class="algebra-text" style="margin-bottom:20px;">3 + 4 - 2 = ?</div>
          </div>

          <div class="algebra-input-row" style="margin-top:0;">
             <input type="text" id="c-res-input" class="f-res-input" style="width:120px; font-size:2rem;" placeholder="?" readonly>
          </div>

          <div class="f-controls">
            <button id="c-submit-btn" class="btn">Check Answer</button>
            <div id="c-msg" class="message"></div>
          </div>
        </div>
      `;

      // Wire length buttons
      document.querySelectorAll('.c-len-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.c-len-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentChainLength = parseInt(btn.dataset.len, 10);
          generateChainProblem();
        });
      });

      document.getElementById('c-mode-toggle').addEventListener('click', (e) => {
        currentChainMode = (currentChainMode === 'simple' ? 'complex' : 'simple');
        e.target.textContent = (currentChainMode === 'simple' ? 'Mode: Simple' : 'Mode: Complex');
        document.getElementById('c-simple-settings').style.display = (currentChainMode === 'simple' ? 'flex' : 'none');
        generateChainProblem();
      });

      document.getElementById('c-neg-toggle').addEventListener('click', (e) => {
        currentChainAllowNegative = !currentChainAllowNegative;
        const btn = e.target;
        btn.classList.toggle('active', currentChainAllowNegative);
        btn.textContent = currentChainAllowNegative ? 'Result: ± Neg' : 'Result: Pos';
        generateChainProblem();
      });

      document.getElementById('c-submit-btn').addEventListener('click', checkChainAnswer);
      document.getElementById('c-home').addEventListener('click', showDevPicker);
      document.getElementById('c-res-input').addEventListener('click', (e) => {
        showKeypad(e.target, "Solve Chain");
      });

      generateChainProblem();
    }

    function generateChainProblem() {
      if (currentChainMode === 'complex') {
        generateComplexProblem();
        return;
      }
      
      let terms = [];
      let ops = [];
      let result = 0;
      
      // Generate first term 1-10
      let currentVal = Math.floor(Math.random() * 10) + 1;
      terms.push(currentVal);
      result = currentVal;

      for (let i = 1; i < currentChainLength; i++) {
        const op = Math.random() > 0.5 ? '+' : '-';
        let term = Math.floor(Math.random() * 6) + 1; // Lowered to 1-6
        
        if (op === '-') {
            // If not allowing negatives, keep intermediate and final result positive
            if (!currentChainAllowNegative && term >= result) {
                term = Math.max(1, Math.floor(result / 2));
            }
            result -= term;
        } else {
            result += term;
        }
        
        ops.push(op);
        terms.push(term);
      }

      let equationStr = "";
      for (let i = 0; i < terms.length; i++) {
        equationStr += terms[i];
        if (i < ops.length) {
          equationStr += ` ${ops[i]} `;
        }
      }
      
      currentChainEquation = equationStr;
      currentChainResult = result;

      const probEl = document.getElementById('c-prob-text');
      if (probEl) {
        probEl.textContent = equationStr + " =";
        setProblemFontSize(probEl, equationStr + " =");
      }
      const input = document.getElementById('c-res-input');
      if (input) input.value = '';
      document.getElementById('c-msg').textContent = '';
    }

    function checkChainAnswer() {
      const input = document.getElementById('c-res-input');
      const guess = parseInt(input.value, 10);
      const msg = document.getElementById('c-msg');
      
      if (guess === currentChainResult) {
        msg.textContent = "Correct! " + currentChainEquation + " = " + currentChainResult;
        msg.style.color = "#2e7d32";
        setTimeout(generateChainProblem, 1500);
      } else {
        msg.textContent = "Not quite. Check your math!";
        msg.style.color = "#c62828";
      }
    }

    function generateComplexProblem() {
        const opsFull = ['+', '-', '×', '÷'];
        const op1 = opsFull[Math.floor(Math.random() * 2)]; // Outside (+, -)
        const op2 = opsFull[Math.floor(Math.random() * opsFull.length)]; // Inside (+, -, *, /)
        
        let a, b, c;
        let resultInner = 0;
        
        // Inside Parens
        if (op2 === '÷') {
            c = Math.floor(Math.random() * 3) + 2; // 2-4
            resultInner = Math.floor(Math.random() * 4) + 1; // 1-4
            b = c * resultInner;
        } else if (op2 === '×') {
            b = Math.floor(Math.random() * 4) + 2; // 2-5
            c = Math.floor(Math.random() * 3) + 1; // 1-3
            resultInner = b * c;
        } else if (op2 === '+') {
            b = Math.floor(Math.random() * 6) + 1; // 1-6
            c = Math.floor(Math.random() * 6) + 1; // 1-6
            resultInner = b + c;
        } else {
            b = Math.floor(Math.random() * 8) + 4; // 4-11
            c = Math.floor(Math.random() * 4) + 1; // 1-4
            resultInner = b - c;
        }

        // Outside Parens
        a = Math.floor(Math.random() * 8) + 5; // 5-12
        let finalResult = 0;
        if (op1 === '+') {
            finalResult = a + resultInner;
        } else {
            // Subtracting the whole block
            if (!currentChainAllowNegative && resultInner >= a) {
                // Ensure positive result if needed
                a = resultInner + Math.floor(Math.random() * 5) + 1;
            }
            finalResult = a - resultInner;
        }

        const mulChar = '<span class="math-op-mul">×</span>';
        const formattedOp2 = op2 === '×' ? mulChar : op2;
        currentChainEquation = `${a} ${op1} <span class="math-no-break">(${b} ${formattedOp2} ${c})</span>`;
        currentChainResult = finalResult;

        if (probEl) {
            probEl.innerHTML = currentChainEquation + " &nbsp;=";
            // Use a raw version for length calculation
            const raw = `${a} ${op1} (${b} ${op2} ${c}) =`;
            setProblemFontSize(probEl, raw);
        }
        const input = document.getElementById('c-res-input');
        if (input) input.value = '';
        document.getElementById('c-msg').textContent = '';
    }

/* ---------- Chains & X (Algebraic Chains) ---------- */

    function initChainsAlgebraDev() {
      const banner = document.getElementById('ants-dev-banner');
      if (banner) banner.textContent = "Chains & X Dev Mode";
      
      currentDevModule = 'chainsX';
      const devCanvas = document.getElementById('ants-dev-canvas');
      if (!devCanvas) return;

      devCanvas.innerHTML = `
        <div class="chains-container">
          <div class="f-settings" style="flex-wrap: wrap; border-radius: 12px; justify-content: center; width: 100%; box-sizing: border-box; gap: 8px;">
            <button id="cx-home" class="f-home-btn" title="Back to Settings" style="position:static; width:34px; height:34px;">🏠</button>
            <button id="cx-mode-toggle" class="c-mode-btn" style="min-width: 80px;">
                ${currentChainsXMode === 'simple' ? 'Mode: Simple' : 'Mode: Complex'}
            </button>
            <div style="font-size:0.85rem; font-weight:800; color:#1976d2;">Chains & X: Solve for (x)</div>
          </div>
          
          <div class="fraction-problem">
             <div id="cx-prob-text" class="algebra-text" style="margin-bottom:20px;">10 + (2 + x) = 15</div>
          </div>

          <div class="algebra-input-row" style="margin-top:0;">
             <span class="x-label">x = </span>
             <input type="text" id="cx-res-input" class="f-res-input" style="width:100px; font-size:1.5rem;" placeholder="?" readonly>
          </div>

          <div class="f-controls">
            <button id="cx-submit-btn" class="btn">Check Answer</button>
            <div id="cx-msg" class="message"></div>
          </div>
        </div>
      `;

      document.getElementById('cx-mode-toggle').addEventListener('click', (e) => {
        currentChainsXMode = (currentChainsXMode === 'simple' ? 'complex' : 'simple');
        e.target.textContent = (currentChainsXMode === 'simple' ? 'Mode: Simple' : 'Mode: Complex');
        generateChainsXProblem();
      });

      document.getElementById('cx-submit-btn').addEventListener('click', checkChainsXAnswer);
      document.getElementById('cx-home').addEventListener('click', showDevPicker);
      document.getElementById('cx-res-input').addEventListener('click', (e) => {
        showKeypad(e.target, "Solve for x");
      });

      generateChainsXProblem();
    }

    function generateChainsXProblem() {
        if (currentChainsXMode === 'complex') {
            generateComplexChainsXProblem();
            return;
        }

        // Form: a op1 x op2 b = resFinal
        const ops = ['+', '-'];
        const op1 = ops[Math.floor(Math.random() * 2)];
        const op2 = ops[Math.floor(Math.random() * 2)];
        
        let a, b, x, resFinal;

        a = Math.floor(Math.random() * 10) + 5; // 5-14
        b = Math.floor(Math.random() * 8) + 1; // 1-8
        x = Math.floor(Math.random() * 6) + 1; // 1-6

        // Calculate resFinal: a (op1) x (op2) b
        let val;
        if (op1 === '+') val = a + x; else val = a - x;
        if (op2 === '+') resFinal = val + b; else resFinal = val - b;

        // Ensure we don't present a problem with a negative intermediate/final result for simple mode
        if (val < 0 || resFinal < 0) {
            generateChainsXProblem();
            return;
        }

        currentChainsXResult = x;
        const eqStr = `${a} ${op1} <span class="math-no-break"><span class="math-var">x</span> ${op2} ${b}</span> = ${resFinal}`;

        const probEl = document.getElementById('cx-prob-text');
        if (probEl) {
          probEl.innerHTML = eqStr;
          // Calculate length without HTML tags
          const raw = `${a} ${op1} x ${op2} ${b} = ${resFinal}`;
          setProblemFontSize(probEl, raw);
        }

        const input = document.getElementById('cx-res-input');
        if (input) input.value = '';
        document.getElementById('cx-msg').textContent = '';
    }

    function generateComplexChainsXProblem() {
        // Form: a op1 (b op2 x) = resultFinal
        const opsFull = ['+', '-', '×']; // Keep it sane for beginning
        const op1 = opsFull[Math.floor(Math.random() * 2)]; // +, -
        const op2 = opsFull[Math.floor(Math.random() * 3)]; // +, -, ×
        
        let a, b, x, resInner, resFinal;

        // 1. Solve for X first
        x = Math.floor(Math.random() * 5) + 1; // 1-5
        b = Math.floor(Math.random() * 6) + 1; // 1-6

        if (op2 === '+') {
            resInner = b + x;
        } else if (op2 === '-') {
            b = x + Math.floor(Math.random() * 4); // Ensure b >= x
            resInner = b - x;
        } else {
            // Multiply
            b = Math.floor(Math.random() * 3) + 2; // 2-4
            resInner = b * x;
        }

        // 2. Wrap into overall result
        a = Math.floor(Math.random() * 10) + 5; // 5-14
        if (op1 === '+') {
            resFinal = a + resInner;
        } else {
            // Ensure positive result for start
            a = resInner + Math.floor(Math.random() * 10) + 1;
            resFinal = a - resInner;
        }

        currentChainsXResult = x;
        const eqStr = `${a} ${op1} <span class="math-no-break">(${b} ${op2} x)</span> = ${resFinal}`;

        const probEl = document.getElementById('cx-prob-text');
        if (probEl) {
          probEl.innerHTML = eqStr;
          const raw = `${a} ${op1} (${b} ${op2} x) = ${resFinal}`;
          setProblemFontSize(probEl, raw);
        }

        const input = document.getElementById('cx-res-input');
        if (input) input.value = '';
        document.getElementById('cx-msg').textContent = '';
    }

    function checkChainsXAnswer() {
      const input = document.getElementById('cx-res-input');
      const guess = parseInt(input.value, 10);
      const msg = document.getElementById('cx-msg');
      
      if (guess === currentChainsXResult) {
        msg.textContent = "Fantastic! x = " + currentChainsXResult;
        msg.style.color = "#2e7d32";
        setTimeout(generateChainsXProblem, 1500);
      } else {
        msg.textContent = "Almost! Try checking your parentheses math again.";
        msg.style.color = "#c62828";
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAntsApples);
  } else {
    initAntsApples();
  }
})();
