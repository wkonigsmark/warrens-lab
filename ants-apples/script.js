(function () {
  function initAntsApples() {
    const root = document.getElementById('ants-apples-root');
    if (!root) return;

    root.innerHTML = `
      <header>
        <div class="header-left">
          <button id="ants-grid-size-btn" type="button">Grid Size</button>
          <button id="ants-music-toggle" type="button">Music: On</button>
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
          <button class="btn" id="ants-next-btn">Next Level</button>
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
    let operation = 'add'; // 'add' or 'multiply'

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

    buildKeypadDigits();
    buildHelperControls();
    hookButtons();
    configureGrid(3, 3);      // default 3×3, 3 levels
    openSizeDialog(true);     // show picker on first load

    // Keyboard shortcuts (ESC to close keypad, Enter to submit)
    document.addEventListener('keydown', onKeyDown);

    updateMusicToggleLabel();

    /* ---------- Grid + game setup ---------- */

    function configureGrid(size, levelCount) {
      size = Math.max(3, Math.min(9, size || 3));
      gridSize = size;
      ROWS = Array.from({ length: size }, (_, i) => i + 1);
      COLS = Array.from({ length: size }, (_, i) => i + 1);

      const maxTiles = size * size;
      let desiredLevels = parseInt(levelCount, 10);
      if (isNaN(desiredLevels) || desiredLevels < 1) {
        desiredLevels = 3; // default to 3
      }
      if (desiredLevels > maxTiles) {
        desiredLevels = maxTiles;
      }
      MAX_LEVEL = desiredLevels;

      currentLevel = 1;

      resetTimerAndStreak();

      document.getElementById('ants-level-max').textContent = MAX_LEVEL.toString();
      document.getElementById('ants-level-label').textContent = currentLevel.toString();

      buildGrid();
      setupLevel(currentLevel);
      setMessage(`Grid: ${size} × ${size} · Levels: ${MAX_LEVEL} · Mode: ${operation === 'add' ? 'Addition' : 'Multiplication'}.`);
      updateHelperDisplay(); // make sure helper shows correct operator/visual
    }

    function buildGrid() {
      const table = document.getElementById('ants-apples-grid');
      table.innerHTML = '';

      const headerRow = document.createElement('tr');
      const corner = document.createElement('td');
      corner.className = 'header';
      corner.textContent = (operation === 'add') ? '+' : '×';
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
          td.addEventListener('click', () => onTileClick(td));
          tr.appendChild(td);
        });

        table.appendChild(tr);
      });
    }

    function setupLevel(level) {
      document.getElementById('ants-level-label').textContent = level.toString();

      const tiles = root.querySelectorAll('.tile');
      tiles.forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile inactive';
        tile.dataset.active = 'false';
        tile.dataset.status = 'inactive';
      });

      const tileArray = Array.from(tiles);
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
      if (currentInput.length >= 2) return;
      currentInput += d;
      updateKeypadDisplay();
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
      const a = ROWS[rowIdx];
      const b = COLS[colIdx];
      const correctAnswer = (operation === 'add') ? (a + b) : (a * b);

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
            setMessage(`Level ${currentLevel} complete! Tap "Next Level" to continue.`);
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

      firstSelect.innerHTML = '';
      secondSelect.innerHTML = '';

      for (let i = 0; i <= 9; i++) {
        const opt1 = document.createElement('option');
        opt1.value = i.toString();
        opt1.textContent = i.toString();
        firstSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = i.toString();
        opt2.textContent = i.toString();
        secondSelect.appendChild(opt2);
      }

      firstSelect.value = '1';
      secondSelect.value = '1';

      firstSelect.addEventListener('change', updateHelperDisplay);
      secondSelect.addEventListener('change', updateHelperDisplay);

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
      } else {
        // Multiplication mode: array of apples (rows × columns)
        opSymbolEl.textContent = '×';
        plusEl.textContent = '×';

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

      document.getElementById('ants-next-btn').addEventListener('click', () => {
        // Require current level to be fully solved
        if (!isLevelComplete()) {
          setMessage('Finish all the squares on this level before moving on.');
          return;
        }

        if (currentLevel >= MAX_LEVEL) {
          setMessage('You have completed all chosen levels!');
          return;
        }

        currentLevel++;
        setupLevel(currentLevel);
        setMessage(`Welcome to Level ${currentLevel}.`);
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
        const maxTiles = sizeVal * sizeVal;
        levelCountInput.max = String(maxTiles);
        levelCountMaxLabel.textContent = String(maxTiles);

        const currentVal = parseInt(levelCountInput.value, 10);
        if (isNaN(currentVal) || currentVal < 1 || currentVal > maxTiles) {
          levelCountInput.value = String(Math.min(MAX_LEVEL, maxTiles));
        }
      }

      sizeSelect.addEventListener('change', updateLevelInputBounds);

      document.getElementById('ants-grid-size-btn').addEventListener('click', () => {
        openSizeDialog(false);
      });

      document.getElementById('ants-size-start-btn').addEventListener('click', () => {
        const size = parseInt(sizeSelect.value, 10) || 3;
        const maxTiles = size * size;

        const opRadios = document.querySelectorAll('input[name="ants-op"]');
        opRadios.forEach(r => {
          if (r.checked) {
            operation = r.value; // 'add' or 'multiply'
          }
        });

        let levelCount = parseInt(levelCountInput.value, 10);
        if (isNaN(levelCount) || levelCount < 1) levelCount = 3;
        if (levelCount > maxTiles) levelCount = maxTiles;

        configureGrid(size, levelCount);
        closeSizeDialog();

        // Start music after user hits "Start" (if enabled)
        if (musicEnabled) {
          playMusic();
        }
      });

      document.getElementById('ants-size-cancel-btn').addEventListener('click', () => {
        closeSizeDialog();
      });

      document.getElementById('ants-size-backdrop').addEventListener('click', (e) => {
        if (e.target.id === 'ants-size-backdrop') {
          closeSizeDialog();
        }
      });

      document.getElementById('ants-win-play-again').addEventListener('click', () => {
        hideWinOverlay();
        currentLevel = 1;
        resetTimerAndStreak();
        setupLevel(currentLevel);
        setMessage(`New game on a ${gridSize} × ${gridSize} grid. Levels: ${MAX_LEVEL}. Mode: ${operation === 'add' ? 'Addition' : 'Multiplication'}.`);
      });

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
      const a = ROWS[rowIdx];
      const b = COLS[colIdx];

      // Show equation at top of keypad
      const eq = document.getElementById('ants-keypad-equation');
      if (eq) {
        const symbol = (operation === 'add') ? '+' : '×';
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

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
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
      const backdrop = document.getElementById('ants-apples-keypad-backdrop');
      if (!backdrop) return;

      const isVisible = backdrop.style.display === 'flex';
      if (!isVisible) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        hideKeypad();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitInput();
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
      const body = document.getElementById('ants-win-body');
      const timeText = formatTime(elapsedSeconds);
      const modeLabel = (operation === 'add') ? 'Addition' : 'Multiplication';
      body.textContent =
        `Congratulations! You completed Ants & Apples in ${timeText} in ${modeLabel} mode, playing ${MAX_LEVEL} level${MAX_LEVEL === 1 ? '' : 's'}, with a best streak of ${bestStreak} correct answers in a row!`;
      backdrop.style.display = 'flex';
    }

    function hideWinOverlay() {
      document.getElementById('ants-win-backdrop').style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAntsApples);
  } else {
    initAntsApples();
  }
})();
