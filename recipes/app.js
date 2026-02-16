let RECIPES = [];

const state = {
  view: 'list', // 'list' or 'detail'
  currentRecipe: null,
  searchTerm: ''
};

const dom = {
  searchInput: document.getElementById('search-input'),
  recipeList: document.getElementById('recipe-list'),
  detailView: document.getElementById('detail-view'),
  listView: document.getElementById('list-view')
};

function init() {
  // Populate data from global variable
  RECIPES = window.RECIPES_DATA || [];
  console.log('Recipes loaded:', RECIPES.length);

  render();

  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value.toLowerCase();
      render();
    });
  }
}

function render() {
  if (state.view === 'list') {
    dom.detailView.classList.add('hidden');
    dom.listView.classList.remove('hidden');
    renderList();
  } else {
    dom.listView.classList.add('hidden');
    dom.detailView.classList.remove('hidden');
    renderDetail();
  }
}

function renderList() {
  const filtered = RECIPES.filter(recipe => {
    const inTitle = recipe.name.toLowerCase().includes(state.searchTerm);
    const inIngredients = recipe.ingredients.some(ing => ing.item.toLowerCase().includes(state.searchTerm));
    return inTitle || inIngredients;
  });

  dom.recipeList.innerHTML = filtered.map(recipe => `
    <div class="recipe-card" onclick="window.showRecipe('${recipe.id}')">
      <h2>${recipe.name}</h2>
      <p>${recipe.description}</p>
      <div class="tag-list">
        ${getUniqueIngredients(recipe).slice(0, 4).map(ing => `<span class="tag">${ing}</span>`).join('')}
        ${recipe.ingredients.length > 4 ? '<span class="tag">...</span>' : ''}
      </div>
    </div>
  `).join('');
}

function getUniqueIngredients(recipe) {
  return [...new Set(recipe.ingredients.map(i => i.item.split(',')[0].trim()))];
}

function renderDetail() {
  const recipe = state.currentRecipe;
  if (!recipe) return;

  dom.detailView.innerHTML = `
    <button class="back-btn" onclick="window.backToList()">← Back to Recipes</button>
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

    ${recipe.upgrades.length ? `
      <section>
        <h3>Upgrades & Tips</h3>
        ${recipe.upgrades.map(note => `<div class="note-box">${note}</div>`).join('')}
      </section>
    ` : ''}
  `;

  // Scroll to top
  window.scrollTo(0, 0);
}

// Global exposure for onclick handlers
window.showRecipe = (id) => {
  state.currentRecipe = RECIPES.find(r => r.id === id);
  state.view = 'detail';
  render();
};

window.backToList = () => {
  state.view = 'list';
  render();
};

document.addEventListener('DOMContentLoaded', init);
