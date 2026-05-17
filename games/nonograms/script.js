const container = document.getElementById('nonogram-container');
const checkBtn = document.getElementById('checkButton');
const resetBtn = document.getElementById('resetButton');
const newPuzzleBtn = document.getElementById('newPuzzleButton');
const printBtn = document.getElementById('printButton');
const messageDiv = document.getElementById('message');
const printView = document.getElementById('printView');

const antImages = [
  '../../iq/ants-apples/assets/coloring-template-ants/ant_jazz_hands.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_apple_cart.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_apple_hoist.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_basket_apple.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_behind_apple.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_celebration.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_chalkboard.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_glasses.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_grad.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_homework.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_pencil.png',
  '../../iq/ants-apples/assets/coloring-template-ants/ants_pencil_3.png'
];

const sizeSelect = document.getElementById('gridSize');



let solution = [];
let numRows = 0;
let numCols = 0;
let grid = [];
let rowClues = [];
let colClues = [];

function calculateClues(line) {
  const clues = [];
  let currentCount = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === 1) {
      currentCount++;
    } else if (currentCount > 0) {
      clues.push(currentCount);
      currentCount = 0;
    }
  }
  if (currentCount > 0) clues.push(currentCount);
  return clues.length > 0 ? clues : [0];
}

function loadPuzzle() {
  const size = parseInt(sizeSelect.value);
  
  numRows = size;
  numCols = size;
  
  // Generate random solution
  solution = Array(numRows).fill().map(() => Array(numCols).fill(0));
  
  let filledCount = 0;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (Math.random() > 0.45) { // ~55% fill rate
        solution[r][c] = 1;
        filledCount++;
      }
    }
  }
  
  // Ensure at least one filled cell so it's an actual puzzle
  if (filledCount === 0) solution[0][0] = 1;
  
  grid = Array(numRows).fill().map(() => Array(numCols).fill(0));
  
  rowClues = solution.map(row => calculateClues(row));
  colClues = [];
  for (let c = 0; c < numCols; c++) {
    const col = [];
    for (let r = 0; r < numRows; r++) {
      col.push(solution[r][c]);
    }
    colClues.push(calculateClues(col));
  }
  
  messageDiv.textContent = '';
  messageDiv.className = 'message';
  
  initGrid();
}

function initGrid() {
  container.innerHTML = '';
  // CSS Grid layout: (numCols + 1) columns
  container.style.gridTemplateColumns = `auto repeat(${numCols}, auto)`;
  
  // Top-left corner (empty, but with ant image)
  const corner = document.createElement('div');
  corner.className = 'cell clue-cell corner-cell';
  const randomAnt = antImages[Math.floor(Math.random() * antImages.length)];
  corner.innerHTML = `<img src="${randomAnt}" alt="Cute ant" style="width: 100%; height: 100%; object-fit: contain; padding: 2px; opacity: 0.8;" />`;
  container.appendChild(corner);
  
  // Top headers (Column clues)
  for (let c = 0; c < numCols; c++) {
    const clueCell = document.createElement('div');
    clueCell.className = 'cell clue-cell';
    clueCell.innerHTML = colClues[c].map(num => `<span>${num}</span>`).join('');
    container.appendChild(clueCell);
  }
  
  // Rows
  for (let r = 0; r < numRows; r++) {
    // Left header (Row clue)
    const clueCell = document.createElement('div');
    clueCell.className = 'cell clue-cell clue-row';
    clueCell.innerHTML = rowClues[r].map(num => `<span style="margin-right: 4px;">${num}</span>`).join('');
    container.appendChild(clueCell);
    
    // Playable cells
    for (let c = 0; c < numCols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell playable-cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      
      // Left click to fill, Right click to cross
      cell.addEventListener('mousedown', handleCellClick);
      cell.addEventListener('contextmenu', e => e.preventDefault());
      
      container.appendChild(cell);
    }
  }
}

function handleCellClick(e) {
  const r = parseInt(e.target.dataset.r);
  const c = parseInt(e.target.dataset.c);
  
  // Left click cycles: 0 (empty) -> 1 (filled) -> 2 (crossed) -> 3 (dot) -> 0
  if (e.button === 0) {
    grid[r][c] = (grid[r][c] + 1) % 4;
  } else if (e.button === 2) {
    // Right click still toggles between empty and crossed as a handy shortcut
    if (grid[r][c] === 2) {
      grid[r][c] = 0;
    } else {
      grid[r][c] = 2;
    }
  }
  
  updateCellUI(e.target, grid[r][c]);
  messageDiv.textContent = '';
}

function updateCellUI(cell, state) {
  cell.className = 'cell playable-cell';
  if (state === 1) {
    cell.classList.add('filled');
  } else if (state === 2) {
    cell.classList.add('crossed');
  } else if (state === 3) {
    cell.classList.add('dotted');
  }
}

function checkSolution() {
  // Validate user's grid against the calculated row/col clues instead of the hidden solution array
  const userRowClues = grid.map(row => {
    return calculateClues(row.map(cell => cell === 1 ? 1 : 0));
  });
  
  const userColClues = [];
  for (let c = 0; c < numCols; c++) {
    const col = [];
    for (let r = 0; r < numRows; r++) {
      col.push(grid[r][c] === 1 ? 1 : 0);
    }
    userColClues.push(calculateClues(col));
  }
  
  let isCorrect = true;
  
  for (let r = 0; r < numRows; r++) {
    if (userRowClues[r].join(',') !== rowClues[r].join(',')) {
      isCorrect = false;
      break;
    }
  }
  
  if (isCorrect) {
    for (let c = 0; c < numCols; c++) {
      if (userColClues[c].join(',') !== colClues[c].join(',')) {
        isCorrect = false;
        break;
      }
    }
  }
  
  if (isCorrect) {
    messageDiv.textContent = 'Congratulations! Puzzle solved!';
    messageDiv.className = 'message success';
  } else {
    messageDiv.textContent = 'Not quite right. Keep trying!';
    messageDiv.className = 'message error';
  }
}

function resetGame() {
  grid = Array(numRows).fill().map(() => Array(numCols).fill(0));
  const cells = document.querySelectorAll('.playable-cell');
  cells.forEach(cell => {
    updateCellUI(cell, 0);
  });
  messageDiv.textContent = '';
}

function generatePrintView() {
  const size = parseInt(sizeSelect.value);
  
  printView.innerHTML = `
    <div class="print-header">
      <h2>Nonograms Worksheet - ${size}x${size}</h2>
      <p>Use logic to fill in the correct squares!</p>
    </div>
    <div class="print-page"></div>
  `;
  const page = printView.querySelector('.print-page');
  
  for (let i = 0; i < 6; i++) {
    // Generate random solution
    const pSol = Array(size).fill().map(() => Array(size).fill(0));
    let filledCount = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (Math.random() > 0.45) {
          pSol[r][c] = 1;
          filledCount++;
        }
      }
    }
    if (filledCount === 0) pSol[0][0] = 1;
    
    // Calculate clues
    const pRowClues = pSol.map(row => calculateClues(row));
    const pColClues = [];
    for (let c = 0; c < size; c++) {
      const col = [];
      for (let r = 0; r < size; r++) {
        col.push(pSol[r][c]);
      }
      pColClues.push(calculateClues(col));
    }
    
    // Build DOM
    const item = document.createElement('div');
    item.className = 'print-item';
    
    const pGrid = document.createElement('div');
    pGrid.className = 'nonogram-container print-nonogram';
    pGrid.style.gridTemplateColumns = `auto repeat(${size}, auto)`;
    
    const corner = document.createElement('div');
    corner.className = 'cell clue-cell corner-cell';
    const randomAnt = antImages[Math.floor(Math.random() * antImages.length)];
    corner.innerHTML = `<img src="${randomAnt}" alt="Cute ant" style="width: 100%; height: 100%; object-fit: contain; padding: 2px; opacity: 0.8;" />`;
    pGrid.appendChild(corner);
    
    for (let c = 0; c < size; c++) {
      const clueCell = document.createElement('div');
      clueCell.className = 'cell clue-cell';
      clueCell.innerHTML = pColClues[c].map(num => `<span>${num}</span>`).join('');
      pGrid.appendChild(clueCell);
    }
    
    for (let r = 0; r < size; r++) {
      const clueCell = document.createElement('div');
      clueCell.className = 'cell clue-cell clue-row';
      clueCell.innerHTML = pRowClues[r].map(num => `<span style="margin-right: 4px;">${num}</span>`).join('');
      pGrid.appendChild(clueCell);
      
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell playable-cell'; // keep class for sizing
        pGrid.appendChild(cell);
      }
    }
    
    item.appendChild(pGrid);
    page.appendChild(item);
  }
}

checkBtn.addEventListener('click', checkSolution);
resetBtn.addEventListener('click', resetGame);
newPuzzleBtn.addEventListener('click', loadPuzzle);
printBtn.addEventListener('click', () => {
  generatePrintView();
  window.print();
});
sizeSelect.addEventListener('change', loadPuzzle);

// Disable right-click menu on container
container.addEventListener('contextmenu', e => e.preventDefault());

loadPuzzle();
