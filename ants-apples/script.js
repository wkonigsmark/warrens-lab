(function () {
  function initAntsApples() {
    const root = document.getElementById('ants-apples-root');
    if (!root) return;

    root.innerHTML = `
      <div class="banner-container">
        <img id="ants-banner" src="assets/ants_apples_.webp" alt="Ants & Apples">
      </div>
      <header>
        <div class="header-left">
          <button id="ants-grid-size-btn" type="button">Settings</button>
          <button id="ants-music-toggle" type="button">Music: On</button>
          <button id="ants-print-worksheet" type="button">Print Worksheet</button>
        </div>
        <div class="status">
          <div class="status-line">
            Level: <span id="ants-level-label">1</span> / <span id="ants-level-max">3</span>
          </div>
          <div class="status-line">
            Time: <span id="ants-timer">0:00</span> · Streak: <span id="ants-streak-current">0</span>
          </div>
        </div>
      </header>
      <main>
        <table id="ants-apples-grid"></table>
        <div class="controls">
          <button class="btn secondary" id="ants-reset-btn">Reset Game</button>
        </div>
        <div class="message" id="ants-message"></div>

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
            <div class="key action" data-action="clear">CLEAR</div>
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
          <input type="number" id="ants-level-count-input" min="1" value="3" />

          <div id="ants-op-title">Choose operation:</div>
          <div id="ants-op-options">
            <label>
              <input type="radio" name="ants-op" value="add" checked>
              Addition (+)
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
          <div id="ants-divide-note" style="display:none; font-size:0.78rem; color:#888; margin-top:4px;">Division mode: grid capped at 5×5 for whole-number results.</div>

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

    let currentLevel = 1;
    let activeTileEl = null;
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
        size = Math.max(3, Math.min(5, size));
        if (size === 3) {
          ROWS = [4, 8, 12];
          COLS = [1, 2, 4];
        } else if (size === 4) {
          ROWS = [4, 8, 12, 16];
          COLS = [1, 2, 4, 8];
        } else if (size === 5) {
          ROWS = [4, 8, 12, 16, 24];
          COLS = [1, 2, 4, 8, 12];
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
          if (operation !== 'divide' || r % c === 0) playableCount++;
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
      corner.textContent = (operation === 'add') ? '+' : (operation === 'multiply') ? '×' : '÷';
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
    }

    function showKeypad() {
      document.getElementById('ants-apples-keypad-backdrop').style.display = 'flex';
    }

    function hideKeypad() {
      document.getElementById('ants-apples-keypad-backdrop').style.display = 'none';
      activeTileEl = null;
      currentInput = '';
      updateKeypadDisplay();
      const eq = document.getElementById('ants-keypad-equation');
      if (eq) eq.textContent = '\u00A0';
    }

    function appendDigit(d) {
      if (currentInput.length >= 3) return;
      currentInput += d;
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
      const correctAnswer = (operation === 'add') ? (a + b) : (operation === 'multiply') ? (a * b) : (a / b);

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
        firstOptions = [4, 8, 12, 16, 24];
        secondOptions = [1, 2, 4, 8, 12];
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
      } else if (operation === 'add') {
        const total = (first || 0) + (second || 0);
        if (total >= 20) fontSize = 0.9;
        else if (total >= 16) fontSize = 1.1;
        else if (total >= 12) fontSize = 1.3;
      }
      visual.style.fontSize = `${fontSize}rem`;

      if (operation === 'add') {
        // Addition mode: simple rows of ants + apples
        opSymbolEl.textContent = '+';
        plusEl.textContent = '+';

        if (first > 0) {
          antsDiv.textContent = Array(first).fill(antEmoji).join(' ');
        }
        if (second > 0) {
          applesDiv.textContent = Array(second).fill(appleEmoji).join(' ');
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

          // Geometric alignment logic
          let gridCols = Math.ceil(Math.sqrt(quotient));
          // If divisor is large (8+), keep columns low to avoid overflow (max 2 or 3)
          if (divisor >= 8) {
            gridCols = quotient <= 3 ? quotient : 2;
          } else if (divisor >= 4) {
            gridCols = Math.min(gridCols, 3);
          }

          // Specific overrides for "nice" layouts
          if (quotient === 6) gridCols = 3;
          if (quotient === 4) gridCols = 2;
          if (quotient === 9) gridCols = 3;

          applesDiv.style.display = 'grid';
          applesDiv.style.gridTemplateColumns = `repeat(${gridCols}, auto)`;
          applesDiv.style.justifyContent = 'center';
          applesDiv.style.gap = '8px';

          let html = '';
          for (let g = 0; g < quotient; g++) {
            html += `<span style="display:inline-block; padding:4px 6px; border:1px dashed #aaa; border-radius:6px; white-space: nowrap;">${Array(divisor).fill(appleEmoji).join(' ')}</span>`;
          }
          applesDiv.innerHTML = html;
        } else {
          antsDiv.textContent = `${dividend} ÷ ${divisor}`;
          applesDiv.style.display = 'block';
        }
      }
    }

    /* ---------- Event wiring ---------- */

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
            if (val > 5) {
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

        // If current selection is invalid, reset to 5
        if (opVal === 'divide' && sizeVal > 5) {
          sizeSelect.value = '5';
        }

        // Calculate actual playable max tiles
        let playableCount = 0;
        let tempRows = [], tempCols = [];
        const finalSize = parseInt(sizeSelect.value, 10);

        if (opVal === 'divide') {
          if (finalSize === 3) { tempRows = [4, 8, 12]; tempCols = [1, 2, 4]; }
          else if (finalSize === 4) { tempRows = [4, 8, 12, 16]; tempCols = [1, 2, 4, 8]; }
          else if (finalSize === 5) { tempRows = [4, 8, 12, 16, 24]; tempCols = [1, 2, 4, 8, 12]; }
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

      document.getElementById('ants-size-start-btn').addEventListener('click', startGameFromSettings);

      function startGameFromSettings() {
        const size = parseInt(sizeSelect.value, 10) || 3;
        const maxTiles = size * size;

        const opRadios = document.querySelectorAll('input[name="ants-op"]');
        opRadios.forEach(r => {
          if (r.checked) {
            operation = r.value; // 'add', 'multiply', or 'divide'
          }
        });

        // Division: enforce max 5×5
        if (operation === 'divide' && size > 5) {
          sizeSelect.value = '5';
          size = 5;
        }

        let levelCount = parseInt(levelCountInput.value, 10);
        if (isNaN(levelCount) || levelCount < 1) levelCount = 3;
        if (levelCount > maxTiles) levelCount = maxTiles;

        showHelper = document.getElementById('ants-show-helper-toggle').checked;
        const helperDiv = document.getElementById('ants-helper');

        // Handle Pro Mode Visuals
        const existingBadge = document.getElementById('ants-pro-badge');
        if (existingBadge) existingBadge.remove();

        if (helperDiv) {
          if (showHelper) {
            helperDiv.style.display = 'block';
          } else {
            helperDiv.style.display = 'none';
            // Inject the Pro Badge
            const badge = document.createElement('div');
            badge.id = 'ants-pro-badge';
            badge.className = 'pro-mode-badge';
            badge.innerHTML = 'Pro Mode Active';
            helperDiv.parentNode.insertBefore(badge, helperDiv.nextSibling);
          }
        }

        configureGrid(size, levelCount);
        closeSizeDialog();

        // Start music after user hits "Start" (if enabled)
        if (musicEnabled) {
          playMusic();
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
        let symbol = (operation === 'add') ? '+' : (operation === 'multiply') ? '×' : '÷';
        eq.textContent = `${a} ${symbol} ${b}`;
      }

      setHelperValues(a, b);

      currentInput = '';
      updateKeypadDisplay();
      showKeypad();
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
        titleEl.innerHTML = "🏆 PRO MODE CHAMPION! 🏆";
        titleEl.className = "pro-victory-title";
        bodyEl.innerHTML = `Spectacular! You solved all levels without the helper in ${timeText}.<br><span class="pro-victory-badge">Gold Mastery Earned</span>`;
      } else {
        titleEl.textContent = "Congratulations!";
        titleEl.className = "";
        bodyEl.textContent =
          `Congratulations! You completed Ants & Apples in ${timeText} in ${modeLabel} mode, playing ${MAX_LEVEL} level${MAX_LEVEL === 1 ? '' : 's'}, with a best streak of ${bestStreak} correct answers in a row!`;
      }

      backdrop.style.display = 'flex';
    }

    function hideWinOverlay() {
      document.getElementById('ants-win-backdrop').style.display = 'none';
    }

    /* ---------- Worksheet Print ---------- */

    function printWorksheet() {
      const opSymbol = (operation === 'add') ? '+' : (operation === 'multiply') ? '×' : '÷';
      const problems = [];

      ROWS.forEach(r => {
        COLS.forEach(c => {
          if (operation !== 'divide' || r % c === 0) {
            problems.push(`${r} ${opSymbol} ${c} = `);
          }
        });
      });

      // Shuffle problems to make it a real worksheet
      shuffleArray(problems);

      const win = window.open('', '_blank');
      if (!win) {
        alert("Please allow popups to print the worksheet.");
        return;
      }

      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ants & Apples Worksheet</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #222; }
            h1 { text-align: center; margin-bottom: 30px; color: #333; }
            .meta { margin-bottom: 20px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; }
            .problem { font-size: 1.8rem; padding: 15px; border-bottom: 1px dashed #ccc; }
            .footer { margin-top: 50px; text-align: center; font-size: 0.9rem; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              .no-print { display: none; }
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Print PDF</button>
          </div>
          <h1>Ants & Apples Worksheet</h1>
          <div class="meta">
            Grid: ${gridSize}x${gridSize} &nbsp;|&nbsp; Operation: ${opLabel()} (${opSymbol})
          </div>
          <div class="grid">
            ${problems.map(p => `<div class="problem">${p} ________</div>`).join('')}
          </div>
          <div class="footer">
            Generated by Ants & Apples Math Master
          </div>
          <script>
            // Auto-trigger print dialog
            window.onload = function() {
              // window.print();
            };
          </script>
        </body>
        </html>
      `);
      win.document.close();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAntsApples);
  } else {
    initAntsApples();
  }
})();
