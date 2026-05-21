const boardElement = document.getElementById('game-board');
const resetBtn = document.getElementById('reset-btn');
const winMessage = document.getElementById('win-message');
const sizeBtns = document.querySelectorAll('.size-btn');

let gridSize = 5;
let board = [];
let isGameOver = false;

// Handle size changes
sizeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active class
        sizeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update size and restart
        gridSize = parseInt(e.target.dataset.size);
        boardElement.style.setProperty('--grid-size', gridSize);
        initGame();
    });
});

// Ensure the game is solvable by starting with all lights off 
// and simulating random clicks.
function initGame() {
    boardElement.innerHTML = '';
    winMessage.classList.add('hidden');
    isGameOver = false;
    board = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    
    // Create DOM elements
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellClick(r, c));
            boardElement.appendChild(cell);
        }
    }

    // Randomize board by simulating clicks
    const clicks = gridSize * 3; // scale clicks with grid size
    for (let i = 0; i < clicks; i++) {
        const r = Math.floor(Math.random() * gridSize);
        const c = Math.floor(Math.random() * gridSize);
        toggleCellAndNeighbors(r, c, false); // false to not check win yet
    }
    
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
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
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
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const index = r * gridSize + c;
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
boardElement.style.setProperty('--grid-size', gridSize);
initGame();
