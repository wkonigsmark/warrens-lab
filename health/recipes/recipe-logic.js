let RECIPES = [];

const state = {
  view: 'list',
  currentRecipe: null,
  searchTerm: '',
  plan: [],
  activeCategory: 'All',
  checkedIngredients: {} // item-key -> boolean
};

const dom = {
  searchInput: document.getElementById('search-input'),
  recipeList: document.getElementById('recipe-list'),
  detailView: document.getElementById('detail-view'),
  listView: document.getElementById('list-view'),
  cartBtn: document.getElementById('cart-btn'),
  cartCount: document.getElementById('cart-count'),
  backBtn: document.getElementById('back-btn')
};

let isInitialized = false;

function init() {
  if (isInitialized) return;
  isInitialized = true;

  RECIPES = window.RECIPES_DATA || [];

  // Search handling
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', (e) => {
      state.searchTerm = (e.target.value || '').toLowerCase();
      render();
    });
  }

  // Routing
  window.addEventListener('hashchange', () => {
    const rawHash = window.location.hash || '';
    const cleanHash = rawHash.replace(/^#/, '');
    handleRoute(cleanHash);
  });

  // Initial Route
  const initialHash = (window.location.hash || '').replace(/^#/, '');
  handleRoute(initialHash);
  renderFilters();
}

function handleRoute(hash) {
  // Normalize hash
  const target = (hash || '').trim();

  let pageTitle = "Kitchen Sync";

  if (target === 'cart') {
    state.view = 'cart';
    state.currentRecipe = null;
    pageTitle = "Kitchen Sync | My Plan";
  } else if (!target) {
    state.view = 'list';
    state.currentRecipe = null;
    pageTitle = "Kitchen Sync";
  } else {
    const found = RECIPES.find(r => r.id === target);
    if (found) {
      state.currentRecipe = found;
      state.view = 'detail';
      pageTitle = `Kitchen Sync | ${found.name}`;
    } else {
      state.view = 'list';
      state.currentRecipe = null;
      pageTitle = "Kitchen Sync";
    }
  }

  // Update DOM Title and OG Meta Tag for link previews
  document.title = pageTitle;
  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.setAttribute('content', pageTitle);

  render();
  window.scrollTo(0, 0);
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

  // Handle global Back button visibility
  if (dom.backBtn) {
    dom.backBtn.classList.toggle('hidden', state.view === 'list');
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
    <div class="detail-header-v2">
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
}

function aggregateIngredients() {
  const CATEGORY_MAP = {
    'all-purpose flour': 'Pantry', 'flour': 'Pantry', 'baking powder': 'Pantry', 'salt': 'Pantry', 'sugar': 'Pantry', 'milk': 'Dairy', 'egg': 'Dairy', 'eggs': 'Dairy', 'melted butter': 'Dairy', 'butter': 'Dairy', 'vanilla extract': 'Pantry', 'cheddar cheese': 'Dairy', 'cheese': 'Dairy', 'plain Greek yogurt': 'Dairy', 'Greek yogurt': 'Dairy', 'honey': 'Pantry', 'granola': 'Pantry', 'blueberries': 'Produce', 'banana': 'Produce', 'grapes': 'Produce', 'strawberry jelly': 'Pantry', 'grape jelly': 'Pantry', 'jelly': 'Pantry', 'creamy peanut butter': 'Pantry', 'peanut butter': 'Pantry', 'hummus': 'Deli', 'pita bread': 'Bread', 'cucumber sticks': 'Produce', 'carrot sticks': 'Produce', 'rotini or penne pasta': 'Pantry', 'pasta': 'Pantry', 'parmesan cheese': 'Dairy', 'broccoli florets': 'Produce', 'olive oil': 'Pantry', 'lemon juice': 'Produce', 'small flour tortillas': 'Pantry', 'tortilla': 'Pantry', 'canned_refried_beans': 'Pantry', 'guacamole': 'Produce', 'thick-cut bread': 'Bread', 'bread': 'Bread', 'cinnamon': 'Pantry', 'maple syrup': 'Pantry', 'string cheese': 'Dairy', 'strawberries': 'Produce', 'cheese puffs': 'Pantry', 'pretzels': 'Pantry', 'popcorn': 'Pantry', 'ground beef': 'Meat', 'taco seasoning': 'Pantry', 'lettuce': 'Produce', 'heavy whipping cream': 'Dairy', 'shiitake mushrooms': 'Produce', 'garlic': 'Produce', 'red pepper flakes': 'Pantry', 'lemon': 'Produce', 'penne': 'Pantry'
  };

  const CONSOLIDATION_MAP = {
    'eggs': 'egg', 'melted butter': 'butter', 'unsalted butter': 'butter',
    'penne': 'pasta', 'rotini': 'pasta', 'all-purpose flour': 'flour',
    'sea salt': 'salt', 'kosher salt': 'salt'
  };

  const master = {};
  state.plan.forEach(p => {
    const recipe = RECIPES.find(r => r.id === p.id);
    if (!recipe) return;

    recipe.ingredients.forEach(ing => {
      let name = (ing.item || '').toLowerCase().trim();
      let unit = (ing.unit || '').toLowerCase().trim();
      if (!name) return;

      // Canonicalize name
      for (const [key, val] of Object.entries(CONSOLIDATION_MAP)) {
        if (name.includes(key)) { name = val; break; }
      }

      // Group salt variants
      if (name === 'salt') unit = unit.includes('teaspoon') ? 'teaspoon' : '';
      // Group eggs (ignore 'large', etc)
      if (name === 'egg') unit = '';

      // Consolidate units
      if (unit.includes('teaspoon') || unit === 'tsp') unit = 'tsp';
      if (unit.includes('tablespoon') || unit === 'tbsp') unit = 'tbsp';
      if (unit.includes('cup')) unit = 'cup';
      if (unit === 'lb' || unit === 'lbs' || unit === 'pound' || unit === 'pounds') unit = 'lb';

      const categoryKey = Object.keys(CATEGORY_MAP).find(key => name.includes(key) || (ing.item || '').toLowerCase().includes(key));
      const category = categoryKey ? CATEGORY_MAP[categoryKey] : 'Other';

      const aggregationKey = `${name}|${unit}`;
      if (!master[aggregationKey]) {
        master[aggregationKey] = { item: name, unit: unit, amount: 0, category };
      }

      const val = parseFloat(ing.amount);
      if (!isNaN(val)) master[aggregationKey].amount += val;
      else if (!master[aggregationKey].amount) master[aggregationKey].amount = ing.amount;
    });
  });

  // Group by category for rendering
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
    <div class="detail-header-v2">
      <div class="detail-actions">
        <button class="action-btn share-btn" style="background: #e1f5fe; color: #0288d1;" onclick="window.shareNeededItems()">📤 Share Needed</button>
        <button class="action-btn share-btn" style="background: #fee2e2; color: #dc2626;" onclick="window.clearPlan()">🗑️ Clear All</button>
        <button class="action-btn print-btn" onclick="window.print()">🖨️ Export PDF</button>
      </div>
    </div>
    <h1 class="recipe-title">Plan Summary</h1>
    <p class="description">Sequence your meals and review the aggregated shopping list.</p>
    ${state.plan.length === 0 ? '<p>No recipes selected yet.</p>' : `
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

      <section>
        <h3 class="master-list-title">📦 Master Shopping List</h3>
        <div class="master-list-container">
          ${Object.entries(masterList).map(([cat, ings]) => `
            <div class="category-group">
              <h4 class="category-name">${cat}</h4>
              <ul class="shopping-bullets">
                ${ings.map(ing => {
    const key = `${ing.item}|${ing.unit}`.toLowerCase().trim();
    const isChecked = state.checkedIngredients[key];
    const safeKey = key.replace(/'/g, "\\'");
    return `
                  <li class="shopping-li ${isChecked ? 'checked' : ''}" onclick="window.toggleIngredient('${safeKey}')">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} style="pointer-events: none;">
                    <span>${ing.item} - <strong>${ing.amount} ${ing.unit}</strong></span>
                  </li>
                `;
  }).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </section>
    `}
    <div class="print-only">
      <h1 class="print-main-title">Kitchen Sync | Meal Plan & Grocery List</h1>
      <p class="print-date">Generated on ${new Date().toLocaleDateString()}</p>

      <section class="print-section">
        <h2 class="print-sec-title">⏳ Meal Schedule</h2>
        <div class="print-schedule">
          ${state.plan.map(p => {
    const r = RECIPES.find(recipe => recipe.id === p.id);
    return r ? `<div class="print-schedule-item"><strong>${p.date || 'TBD'} - ${p.meal || 'Meal'}:</strong> ${r.name}</div>` : '';
  }).join('')}
        </div>
      </section>

      <section class="print-section">
        <h2 class="print-sec-title">📦 Needed Shopping Items</h2>
        ${Object.entries(masterList).map(([cat, ings]) => {
    const needed = ings.filter(ing => !state.checkedIngredients[`${ing.item}|${ing.unit}`.toLowerCase().trim()]);
    if (needed.length === 0) return '';
    return `
            <div class="print-cat-group">
              <h3 class="print-cat-name">${cat}</h3>
              <ul class="print-shopping-list">
                ${needed.map(ing => `<li>${ing.item} (${ing.amount} ${ing.unit})</li>`).join('')}
              </ul>
            </div>
          `;
  }).join('')}
      </section>

      <div class="print-page-break"></div>

      <section class="print-section">
        <h2 class="print-sec-title">👨‍🍳 Cooking Instructions</h2>
        ${[...new Set(state.plan.map(p => p.id))].map(id => {
    const r = RECIPES.find(recipe => recipe.id === id);
    if (!r) return '';
    return `
            <div class="print-recipe-block">
              <h3>${r.name}</h3>
              <p><em>${r.description}</em></p>
              
              <div class="print-recipe-cols">
                <div class="print-ingredients">
                  <h4>Ingredients</h4>
                  <ul>
                    ${r.ingredients.map(i => `<li>${i.item} (${i.amount} ${i.unit})</li>`).join('')}
                  </ul>
                </div>
                <div class="print-instructions">
                  <h4>Instructions</h4>
                  <ol>
                    ${r.instructions.map(step => `<li>${step}</li>`).join('')}
                  </ol>
                </div>
              </div>
              <hr class="print-divider">
            </div>
          `;
  }).join('')}
      </section>
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
window.clearPlan = () => {
  if (confirm("Clear the entire plan?")) {
    state.plan = [];
    state.checkedIngredients = {};
    render();
  }
};
window.toggleIngredient = (key) => {
  state.checkedIngredients[key] = !state.checkedIngredients[key];
  render();
};
window.shareNeededItems = () => {
  const masterList = aggregateIngredients();

  // Get unique recipe names from the plan
  const recipeNames = [...new Set(state.plan.map(p => {
    const r = RECIPES.find(recipe => recipe.id === p.id);
    return r ? r.name : null;
  }).filter(Boolean))];

  let text = "🍽️ Upcoming Meals:\n";
  recipeNames.forEach(name => text += `- ${name}\n`);
  text += "\n🛒 Needed Grocery Items:\n\n";

  let hasItems = false;

  Object.entries(masterList).forEach(([cat, ings]) => {
    const needed = ings.filter(ing => !state.checkedIngredients[`${ing.item}|${ing.unit}`.toLowerCase().trim()]);
    if (needed.length > 0) {
      hasItems = true;
      text += `[${cat}]\n`;
      needed.forEach(ing => {
        text += `- ${ing.item} (${ing.amount} ${ing.unit})\n`;
      });
      text += "\n";
    }
  });

  if (!hasItems && recipeNames.length === 0) {
    alert("Plan is empty!");
    return;
  }

  navigator.clipboard.writeText(text.trim()).then(() => alert('Meal plan & needed items copied to clipboard!'));
};

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
