const boardElement = document.getElementById('game-board');
const resetBtn = document.getElementById('reset-btn');
const winMessage = document.getElementById('win-message');

const ROWS = 5;
const COLS = 5;
let board = [];
let isGameOver = false;

// Ensure the game is solvable by starting with all lights off 
// and simulating random clicks.
function initGame() {
    boardElement.innerHTML = '';
    winMessage.classList.add('hidden');
    isGameOver = false;
    board = Array(ROWS).fill().map(() => Array(COLS).fill(false));
    
    // Create DOM elements
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellClick(r, c));
            boardElement.appendChild(cell);
        }
    }

    // Randomize board by simulating clicks
    const clicks = 15;
    for (let i = 0; i < clicks; i++) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        toggleCellAndNeighbors(r, c, false); // false to not check win yet
    }
    
    // It's possible (though rare with 15 clicks) that we solved the game immediately. 
    // Just in case, if the board is empty, flip one random cell.
    if (board.every(row => row.every(cell => !cell))) {
        toggleCellAndNeighbors(0, 0, false);
    }
    
    renderBoard();
}

function handleCellClick(r, c) {
    if (isGameOver) return;
    toggleCellAndNeighbors(r, c, true);
}

function toggleCellAndNeighbors(r, c, checkWinCondition = true) {
    // Array of the cell itself + its 4 neighbors
    const coords = [
        [r, c],
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
    ];

    coords.forEach(([row, col]) => {
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            board[row][col] = !board[row][col];
        }
    });

    if (checkWinCondition) {
        renderBoard();
        checkWin();
    }
}

function renderBoard() {
    const cells = boardElement.children;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const index = r * COLS + c;
            const cell = cells[index];
            if (board[r][c]) {
                cell.classList.add('is-on');
            } else {
                cell.classList.remove('is-on');
            }
        }
    }
}

function checkWin() {
    const isWin = board.every(row => row.every(cell => !cell));
    if (isWin) {
        isGameOver = true;
        winMessage.classList.remove('hidden');
    }
}

resetBtn.addEventListener('click', initGame);

// Start game
initGame();
