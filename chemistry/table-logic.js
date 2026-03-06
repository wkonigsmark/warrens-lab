const periodicTableUrl = 'periodic-table.json';
const gridContainer = document.getElementById('periodic-grid');
const detailOverlay = document.getElementById('element-detail');
const closeBtn = document.getElementById('close-detail');

let elementsData = [];

async function loadTable() {
    try {
        const response = await fetch(periodicTableUrl);
        const data = await response.json();
        elementsData = data.elements;
        renderGrid(elementsData);
    } catch (error) {
        console.error("Error loading periodic table data:", error);
    }
}

function renderGrid(elements) {
    gridContainer.innerHTML = '';
    
    elements.forEach(el => {
        const tile = document.createElement('div');
        tile.className = `element-tile ${el.category.replace(/ /g, '-')}`;
        
        // Use Grid positions from JSON
        // Some datasets use 1-based indexing for xpos and ypos
        tile.style.gridColumn = el.xpos;
        tile.style.gridRow = el.ypos;
        
        tile.innerHTML = `
            <span class="tile-number">${el.number}</span>
            <span class="tile-symbol">${el.symbol}</span>
            <span class="tile-name">${el.name}</span>
            <span class="tile-mass">${el.atomic_mass.toFixed(3)}</span>
        `;
        
        tile.addEventListener('click', () => showDetail(el));
        gridContainer.appendChild(tile);
    });
}

function showDetail(el) {
    document.getElementById('detail-symbol').textContent = el.symbol;
    document.getElementById('detail-name').textContent = el.name;
    document.getElementById('detail-category').textContent = el.category;
    
    document.getElementById('val-number').textContent = el.number;
    document.getElementById('val-mass').textContent = el.atomic_mass;
    document.getElementById('val-en').textContent = el.electronegativity_pauling || 'N/A';
    document.getElementById('val-block').textContent = el.block || 'N/A';
    document.getElementById('val-config').textContent = el.electron_configuration_semantic || el.electron_configuration || 'N/A';
    
    document.getElementById('detail-summary').textContent = el.summary;
    document.getElementById('detail-wiki').href = el.source;
    
    detailOverlay.classList.remove('hidden');
}

closeBtn.addEventListener('click', () => {
    detailOverlay.classList.add('hidden');
});

// Close on background click
detailOverlay.addEventListener('click', (e) => {
    if (e.target === detailOverlay) {
        detailOverlay.classList.add('hidden');
    }
});

loadTable();
