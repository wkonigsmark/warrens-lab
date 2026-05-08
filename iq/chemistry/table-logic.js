const periodicTableUrl = 'periodic-table.json';
const gridContainer = document.getElementById('periodic-grid');
const detailOverlay = document.getElementById('element-detail');
const closeBtn = document.getElementById('close-detail');

const searchInput = document.getElementById('element-search');
const categoryFilter = document.getElementById('category-filter');
const legendPills = document.querySelectorAll('.legend-pill');
const insightPanel = document.getElementById('category-insight');
const insightClose = document.getElementById('close-insight');

const categoryInsights = {
    'alkali-metal': {
        title: 'Alkali Metals',
        text: 'The "Excitables." These elements have just one electron in their outer shell, making them incredibly reactive—they will even burst into flame if they touch water! They are soft enough to cut with a butter knife.',
        color: 'var(--clr-alkali)'
    },
    'alkaline-earth-metal': {
        title: 'Alkaline Earth Metals',
        text: 'The "Miners." Almost as reactive as the Alkalies, these metals are shiny and silver-white. They are frequently found in the Earth\'s crust and are famous for being essential to life (like Magnesium and Calcium).',
        color: 'var(--clr-alkaline)'
    },
    'transition-metal': {
        title: 'Transition Metals',
        text: 'The "Powerhouses." These are the strong, durable metals we use for building the world. They can use electrons from two shells instead of one, which makes them very flexible in form and chemistry.',
        color: 'var(--clr-transition)'
    },
    'post-transition-metal': {
        title: 'Post-transition Metals',
        text: 'The "Softies." These metals are softer or have lower melting points than traditional ones. They occupy the border between typical metals and the nonmetals.',
        color: 'var(--clr-post-transition)'
    },
    'metalloid': {
        title: 'Metalloids',
        text: 'The "Shape-shifters." They look like metals but behave like brittle nonmetals. Because they are "semi-conductors," they are the absolute backbone of the computer industry and all modern electronics.',
        color: 'var(--clr-metalloid)'
    },
    'reactive-nonmetal': {
        title: 'Reactive Nonmetals',
        text: 'The "Life-Givers." Most of the biology on Earth (like you!) is built from these. They are highly reactive because they are hungry for more electrons to complete their shells.',
        color: 'var(--clr-reactive)'
    },
    'noble-gas': {
        title: 'Noble Gases',
        text: 'The "Loners." These gases have "full" outer shells, meaning they are perfectly happy alone. They almost never react with other elements because they don\'t need to gain or lose electrons.',
        color: 'var(--clr-noble)'
    },
    'lanthanide': {
        title: 'Lanthanides',
        text: 'The "Rare Earths." These 15 elements are actually quite abundant but very hard to separate. They are crucial for modern high-tech magnets, lasers, and smartphone screens.',
        color: 'var(--clr-lanthanide)'
    },
    'actinide': {
        title: 'Actinides',
        text: 'The "Nuclear Front." Most of these are radioactive and heavy. While Thorium and Uranium occur naturally, most others were created by humans in laboratories.',
        color: 'var(--clr-actinide)'
    }
};

let elementsData = [];
let currentFilter = 'all';
let searchQuery = '';

async function loadTable() {
    try {
        const response = await fetch(periodicTableUrl);
        const data = await response.json();
        elementsData = data.elements;
        renderGrid(elementsData);
        setupEventListeners();
    } catch (error) {
        console.error("Error loading periodic table data:", error);
    }
}

function normalizeCategory(cat) {
    const c = cat.toLowerCase();
    if (c.includes('diatomic nonmetal') || c.includes('polyatomic nonmetal')) {
        return 'reactive-nonmetal';
    }
    return c.replace(/ /g, '-');
}

function renderGrid(elements) {
    gridContainer.innerHTML = '';
    
    elements.forEach(el => {
        const tile = document.createElement('div');
        const normalizedCat = normalizeCategory(el.category);
        tile.className = `element-tile ${normalizedCat}`;
        tile.id = `el-${el.number}`;
        
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

function updateView() {
    const tiles = document.querySelectorAll('.element-tile');
    
    tiles.forEach(tile => {
        const elNumber = parseInt(tile.id.split('-')[1]);
        const el = elementsData.find(e => e.number === elNumber);
        const normalizedCat = normalizeCategory(el.category);
        
        const matchesSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             el.symbol.toLowerCase().includes(searchQuery.toLowerCase());
                             
        const matchesCategory = currentFilter === 'all' || normalizedCat === currentFilter;
        
        if (matchesSearch && matchesCategory) {
            tile.classList.remove('dimmed');
        } else {
            tile.classList.add('dimmed');
        }
    });

    updateInsightPanel();
}

function updateInsightPanel() {
    if (currentFilter === 'all' || !categoryInsights[currentFilter]) {
        insightPanel.classList.add('hidden');
        return;
    }

    const info = categoryInsights[currentFilter];
    document.getElementById('insight-title').textContent = info.title;
    document.getElementById('insight-text').textContent = info.text;
    document.querySelector('.insight-dot').style.backgroundColor = info.color;
    
    insightPanel.classList.remove('hidden');
}

function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        updateView();
    });

    categoryFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        updateLegendPills();
        updateView();
    });

    legendPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const cat = pill.getAttribute('data-category');
            if (currentFilter === cat) {
                currentFilter = 'all';
            } else {
                currentFilter = cat;
            }
            categoryFilter.value = currentFilter;
            updateLegendPills();
            updateView();
        });
    });

    insightClose.addEventListener('click', (e) => {
        e.stopPropagation();
        currentFilter = 'all';
        categoryFilter.value = 'all';
        updateLegendPills();
        updateView();
    });

    // Esc to Reset Table, Click-away to Hide Insight
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Full Reset
            currentFilter = 'all';
            searchQuery = '';
            searchInput.value = '';
            categoryFilter.value = 'all';
            detailOverlay.classList.add('hidden');
            updateLegendPills();
            updateView();
        }
    });

    window.addEventListener('click', (e) => {
        // If clicking outside insight card and detail card, hide insight
        const insightCard = document.querySelector('.insight-card');
        const detailCard = document.querySelector('.card');
        
        if (insightCard && !insightCard.contains(e.target) && 
            !e.target.closest('.legend-pill') && 
            !e.target.closest('#category-filter')) {
            insightPanel.classList.add('hidden');
        }
    });
}

function updateLegendPills() {
    legendPills.forEach(pill => {
        if (pill.getAttribute('data-category') === currentFilter) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
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

detailOverlay.addEventListener('click', (e) => {
    if (e.target === detailOverlay) {
        detailOverlay.classList.add('hidden');
    }
});

loadTable();
