let RECIPES = [];

const state = {
  view: 'list',
  currentRecipe: null,
  searchTerm: '',
  plan: [],
  activeCategory: 'All'
};

const dom = {
  searchInput: document.getElementById('search-input'),
  recipeList: document.getElementById('recipe-list'),
  detailView: document.getElementById('detail-view'),
  listView: document.getElementById('list-view'),
  cartBtn: document.getElementById('cart-btn'),
  cartCount: document.getElementById('cart-count')
};

function init() {
  RECIPES = window.RECIPES_DATA || [];
  const hash = window.location.hash.substring(1);
  if (hash === 'cart') state.view = 'cart';
  else if (hash) {
    const found = RECIPES.find(r => r.id === hash);
    if (found) { state.currentRecipe = found; state.view = 'detail'; }
  }
  render();
  renderFilters();
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value.toLowerCase();
      render();
    });
  }
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.substring(1);
    handleRoute(newHash);
  });
}

function handleRoute(hash) {
  if (hash === 'cart') state.view = 'cart';
  else if (!hash) { state.view = 'list'; state.currentRecipe = null; }
  else {
    const found = RECIPES.find(r => r.id === hash);
    if (found) { state.currentRecipe = found; state.view = 'detail'; }
  }
  render();
}

function render() {
  updateCartBadge();
  if (state.view === 'list') {
    if (dom.detailView) dom.detailView.classList.add('hidden');
    if (dom.listView) dom.listView.classList.remove('hidden');
    renderList();
  } else if (state.view === 'detail') {
    if (dom.listView) dom.listView.classList.add('hidden');
    if (dom.detailView) dom.detailView.classList.remove('hidden');
    renderDetail();
  } else if (state.view === 'cart') {
    if (dom.listView) dom.listView.classList.add('hidden');
    if (dom.detailView) dom.detailView.classList.remove('hidden');
    renderCart();
  }
}

function updateCartBadge() {
  if (dom.cartCount) {
    dom.cartCount.textContent = state.plan.length;
    dom.cartBtn.classList.toggle('has-items', state.plan.length > 0);
  }
}

function renderList() {
  const filtered = RECIPES.filter(recipe => {
    // Search logic
    const inTitle = recipe.name.toLowerCase().includes(state.searchTerm);
    const inIngredients = recipe.ingredients.some(ing => ing.item.toLowerCase().includes(state.searchTerm));
    const inType = recipe.type.some(t => t.toLowerCase().includes(state.searchTerm));
    const matchesSearch = inTitle || inIngredients || inType;

    // Category logic
    const matchesCategory = state.activeCategory === 'All' || recipe.type.includes(state.activeCategory);

    return matchesSearch && matchesCategory;
  });

  if (dom.recipeList) {
    if (filtered.length === 0) {
      dom.recipeList.innerHTML = `
        <div class="empty-state">
          <p>No recipes found matching "${state.searchTerm}" in ${state.activeCategory}.</p>
          <button class="secondary-btn" onclick="window.clearFilters()">Clear Filters</button>
        </div>
      `;
    } else {
      dom.recipeList.innerHTML = filtered.map(recipe => {
        const isSelected = state.plan.some(p => p.id === recipe.id);
        return `
          <div class="recipe-card ${isSelected ? 'selected' : ''}" onclick="window.showRecipe('${recipe.id}')">
            <div class="card-header">
              <div>
                <div class="recipe-type-tag">${recipe.type.join(' / ')}</div>
                <h2>${recipe.name}</h2>
              </div>
              <button class="select-toggle" onclick="event.stopPropagation(); window.toggleSelect('${recipe.id}')">
                ${isSelected ? '✓' : '+'}
              </button>
            </div>
            <p>${recipe.description}</p>
            <div class="tag-list">
              ${getUniqueIngredients(recipe).slice(0, 4).map(ing => `<span class="tag">${ing}</span>`).join('')}
              ${recipe.ingredients.length > 4 ? '<span class="tag">...</span>' : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

window.clearFilters = () => {
  state.searchTerm = '';
  state.activeCategory = 'All';
  if (dom.searchInput) dom.searchInput.value = '';
  renderFilters();
  renderList();
};

function renderFilters() {
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Side'];
  const filterContainer = document.getElementById('category-filters');
  if (filterContainer) {
    filterContainer.innerHTML = categories.map(cat => `
      <button class="filter-chip ${state.activeCategory === cat ? 'active' : ''}" 
              onclick="window.setCategory('${cat}')">
        ${cat}
      </button>
    `).join('');
  }
}

window.setCategory = (cat) => {
  state.activeCategory = cat;
  renderFilters();
  renderList();
};

function getUniqueIngredients(recipe) {
  return [...new Set(recipe.ingredients.map(i => i.item.split(',')[0].trim()))];
}

function renderDetail() {
  const recipe = state.currentRecipe;
  if (!recipe || !dom.detailView) return;
  const isSelected = state.plan.some(p => p.id === recipe.id);
  dom.detailView.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="window.backToList()">← Back</button>
      <div class="detail-actions">
        <button class="action-btn share-btn" onclick="window.shareRecipe('${recipe.id}')">🔗 Share</button>
        <button class="action-btn select-btn ${isSelected ? 'active' : ''}" onclick="window.toggleSelect('${recipe.id}')">
          ${isSelected ? '✓ In Plan' : '+ Add to Plan'}
        </button>
      </div>
    </div>
    <div class="recipe-type-tag detail">${recipe.type.join(' / ')}</div>
    <h1 class="recipe-title">${recipe.name}</h1>
    <p class="description">${recipe.description}</p>
    <section>
      <h3>Ingredients</h3>
      <div class="ingredient-list">
        ${recipe.ingredients.map(ing => `
          <div class="ingredient-item">
            <span class="step-text">${ing.item}</span>
            <span class="amount">${ing.amount} ${ing.unit}</span>
          </div>
        `).join('')}
      </div>
    </section>
    <section>
      <h3>Instructions</h3>
      <div class="instruction-list">
        ${recipe.instructions.map((step, idx) => `
          <div class="instruction-step">
            <div class="step-number">${idx + 1}</div>
            <div class="step-text">${step}</div>
          </div>
        `).join('')}
      </div>
    </section>
    ${recipe.upgrades.length ? `<section><h3>Upgrades & Tips</h3>${recipe.upgrades.map(n => `<div class="note-box">${n}</div>`).join('')}</section>` : ''}
  `;
  window.scrollTo(0, 0);
}

function aggregateIngredients() {
  const CATEGORY_MAP = {
    'all-purpose flour': 'Pantry', 'baking powder': 'Pantry', 'salt': 'Pantry', 'sugar': 'Pantry', 'milk': 'Dairy', 'egg': 'Dairy', 'eggs': 'Dairy', 'melted butter': 'Dairy', 'butter': 'Dairy', 'vanilla extract': 'Pantry', 'cheddar cheese': 'Dairy', 'cheese': 'Dairy', 'plain Greek yogurt': 'Dairy', 'Greek yogurt': 'Dairy', 'honey': 'Pantry', 'granola': 'Pantry', 'blueberries': 'Produce', 'banana': 'Produce', 'grapes': 'Produce', 'strawberry jelly': 'Pantry', 'grape jelly': 'Pantry', 'jelly': 'Pantry', 'creamy peanut butter': 'Pantry', 'peanut butter': 'Pantry', 'hummus': 'Deli', 'pita bread': 'Bread', 'cucumber sticks': 'Produce', 'carrot sticks': 'Produce', 'rotini or penne pasta': 'Pantry', 'parmesan cheese': 'Dairy', 'broccoli florets': 'Produce', 'olive oil': 'Pantry', 'lemon juice': 'Produce', 'small flour tortillas': 'Pantry', 'tortilla': 'Pantry', 'canned refried beans': 'Pantry', 'guacamole': 'Produce', 'thick-cut bread': 'Bread', 'bread': 'Bread', 'cinnamon': 'Pantry', 'maple syrup': 'Pantry'
  };

  const master = {};
  state.plan.forEach(p => {
    const recipe = RECIPES.find(r => r.id === p.id);
    if (recipe) {
      recipe.ingredients.forEach(ing => {
        const itemName = ing.item.toLowerCase().trim();
        const category = Object.keys(CATEGORY_MAP).find(key => itemName.includes(key))
          ? CATEGORY_MAP[Object.keys(CATEGORY_MAP).find(key => itemName.includes(key))]
          : 'Other';
        const key = `${itemName}|${ing.unit.toLowerCase().trim()}`;
        if (!master[key]) master[key] = { item: ing.item, unit: ing.unit, amount: 0, category };
        const val = parseFloat(ing.amount);
        if (!isNaN(val)) master[key].amount += val;
        else if (!master[key].amount) master[key].amount = ing.amount;
      });
    }
  });

  // Group by category
  const grouped = {};
  Object.values(master).forEach(ing => {
    if (!grouped[ing.category]) grouped[ing.category] = [];
    grouped[ing.category].push(ing);
  });
  return grouped;
}

function renderCart() {
  const masterList = aggregateIngredients();
  dom.detailView.innerHTML = `
    <div class="detail-header">
      <button class="back-btn" onclick="window.backToList()">← Back</button>
      <button class="action-btn print-btn" onclick="window.print()">🖨️ Export PDF</button>
    </div>
    <h1 class="recipe-title">Plan Summary</h1>
    <p class="description">Sequence your meals and review the aggregated shopping list.</p>
    ${state.plan.length === 0 ? '<p>No recipes selected yet.</p>' : `
      <section>
        <h3 class="master-list-title">📦 Master Shopping List</h3>
        <div class="master-list-container">
          ${Object.entries(masterList).map(([cat, ings]) => `
            <div class="category-group">
              <h4 class="category-name">${cat}</h4>
              <div class="master-list">
                ${ings.map(ing => `
                  <div class="master-item">
                    <span class="item-name">${ing.item}</span>
                    <span class="item-total">${ing.amount} ${ing.unit}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      <section>
        <h3>⏳ Meal Sequence</h3>
        <p class="instruction-note">Sequence is updated automatically as you drag.</p>
        <div class="cart-items" id="draggable-list">
          ${state.plan.map((item, index) => {
    const recipe = RECIPES.find(r => r.id === item.id);
    return `
              <div class="cart-item draggable" 
                   draggable="true" 
                   data-index="${index}" 
                   ondragstart="window.onDragStart(event)" 
                   ondragover="window.onDragOver(event)" 
                   ondrop="window.onDrop(event)"
                   ontouchstart="window.onTouchStart(event)"
                   ontouchmove="window.onTouchMove(event)"
                   ontouchend="window.onTouchEnd(event)">
                <div class="cart-item-header">
                  <div class="drag-handle">☰</div>
                  <div class="cart-item-info">
                    <h3>${recipe.name}</h3>
                    <div class="meal-controls">
                      <input type="date" value="${item.date || ''}" onchange="window.updatePlanItem(${index}, 'date', this.value)">
                      <select onchange="window.updatePlanItem(${index}, 'meal', this.value)">
                        <option value="" ${!item.meal ? 'selected' : ''}>Pick Meal</option>
                        <option value="Breakfast" ${item.meal === 'Breakfast' ? 'selected' : ''}>Breakfast</option>
                        <option value="Lunch" ${item.meal === 'Lunch' ? 'selected' : ''}>Lunch</option>
                        <option value="Dinner" ${item.meal === 'Dinner' ? 'selected' : ''}>Dinner</option>
                      </select>
                    </div>
                  </div>
                  <button class="remove-btn" onclick="window.toggleSelect('${recipe.id}')">×</button>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      </section>
    `}
    <div class="print-only">
      <h2>Master Shopping List</h2>
      <ul>${Object.values(masterList).flat().map(ing => `<li>${ing.amount} ${ing.unit} ${ing.item}</li>`).join('')}</ul>
      <h2>Schedule</h2>
      ${state.plan.map(p => `<div><strong>${p.date || ''} - ${p.meal || ''}:</strong> ${RECIPES.find(r => r.id === p.id).name}</div>`).join('')}
    </div>
  `;
}

window.showRecipe = (id) => { window.location.hash = id; };
window.backToList = () => { window.location.hash = ''; };
window.goToCart = () => { window.location.hash = 'cart'; };
window.toggleSelect = (id) => {
  const index = state.plan.findIndex(p => p.id === id);
  if (index > -1) state.plan.splice(index, 1);
  else {
    const recipe = RECIPES.find(r => r.id === id);
    const slot = findNextAvailableSlot(recipe);
    state.plan.push({ id, ...slot });
  }
  render();
};
window.updatePlanItem = (index, key, value) => { state.plan[index][key] = value; };

// Shared Reordering Logic
function moveItem(from, to) {
  if (from === to) return;
  const moved = state.plan.splice(from, 1)[0];
  state.plan.splice(to, 0, moved);
  render();
}

function findNextAvailableSlot(recipe) {
  const types = recipe.type || ['Dinner'];
  const today = new Date();

  for (let i = 0; i < 14; i++) { // Look up to 2 weeks ahead
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Check preferred types for this recipe in order
    for (const type of types) {
      if (['Breakfast', 'Lunch', 'Dinner'].includes(type)) {
        const isTaken = state.plan.some(p => p.date === dateStr && p.meal === type);
        if (!isTaken) return { date: dateStr, meal: type };
      }
    }

    // If no preferred type is available on this day, check other major slots
    for (const type of ['Breakfast', 'Lunch', 'Dinner']) {
      const isTaken = state.plan.some(p => p.date === dateStr && p.meal === type);
      if (!isTaken) return { date: dateStr, meal: type };
    }
  }

  return { date: today.toISOString().split('T')[0], meal: 'Dinner' };
}

// Drag & Drop (Mouse)
let dragSourceIndex = null;
window.onDragStart = (e) => {
  dragSourceIndex = parseInt(e.target.closest('.draggable').dataset.index);
  e.dataTransfer.effectAllowed = 'move';
};
window.onDragOver = (e) => {
  e.preventDefault();
  const target = e.target.closest('.draggable');
  if (target && dragSourceIndex !== null) {
    const targetIndex = parseInt(target.dataset.index);
    if (dragSourceIndex !== targetIndex) {
      moveItem(dragSourceIndex, targetIndex);
      dragSourceIndex = targetIndex; // Update source during hover
    }
  }
};
window.onDrop = (e) => { e.preventDefault(); dragSourceIndex = null; };

// Drag & Drop (Touch/Mobile)
let touchSourceIndex = null;
let touchStartY = 0;
let lastTargetIndex = null;

window.onTouchStart = (e) => {
  const draggable = e.target.closest('.draggable');
  touchSourceIndex = parseInt(draggable.dataset.index);
  lastTargetIndex = touchSourceIndex;
  touchStartY = e.touches[0].clientY;
  draggable.classList.add('dragging');
};

window.onTouchMove = (e) => {
  e.preventDefault();
  const touchY = e.touches[0].clientY;
  const draggable = e.target.closest('.draggable');
  const deltaY = touchY - touchStartY;

  draggable.style.transform = `translateY(${deltaY}px)`;
  draggable.style.zIndex = "1000";

  // Real-time swapping logic
  const elements = document.elementsFromPoint(e.touches[0].clientX, touchY);
  const target = elements.find(el => el.classList.contains('draggable') && el !== draggable);

  if (target) {
    const targetIndex = parseInt(target.dataset.index);
    if (targetIndex !== lastTargetIndex) {
      // Find indices in CURRENT state
      const currentSource = state.plan.findIndex((_, idx) => idx === lastTargetIndex);
      moveItem(lastTargetIndex, targetIndex);
      lastTargetIndex = targetIndex;
    }
  }
};

window.onTouchEnd = (e) => {
  const draggable = e.target.closest('.draggable');
  draggable.classList.remove('dragging');
  draggable.style.transform = '';
  draggable.style.zIndex = "";
  touchSourceIndex = null;
  lastTargetIndex = null;
};

window.shareRecipe = (id) => {
  const url = `${window.location.origin}${window.location.pathname}#${id}`;
  navigator.clipboard.writeText(url).then(() => alert('Copied!'));
};
document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'complete' || document.readyState === 'interactive') init();
