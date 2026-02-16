const RECIPES = [
  {
    id: 'pancakes',
    name: 'Classic Homemade Pancakes',
    description: 'Fluffy, tall, and golden-brown pancakes perfect for any morning.',
    ingredients: [
      { item: 'all-purpose flour', amount: '1.5', unit: 'cups' },
      { item: 'baking powder', amount: '3.5', unit: 'teaspoons' },
      { item: 'salt', amount: '1', unit: 'teaspoon' },
      { item: 'sugar', amount: '1', unit: 'tablespoon' },
      { item: 'milk', amount: '1.25', unit: 'cups' },
      { item: 'egg', amount: '1', unit: '' },
      { item: 'melted butter', amount: '3', unit: 'tablespoons' }
    ],
    instructions: [
      "In a large bowl, whisk together the flour, baking powder, salt, and sugar.",
      "Make a well in the center of the dry ingredients and pour in the milk, egg, and melted butter. Stir until combined. The batter may be slightly lumpy.",
      "Heat a non-stick skillet or griddle over medium heat. Add a small pat of butter and let it melt.",
      "Scoop about ¼ cup of batter for each pancake. Cook until bubbles form (2-3 mins). Flip and cook other side until golden brown (1-2 mins).",
      "Serve hot with syrup or toppings."
    ],
    upgrades: [
      "Protein Version: Replace ¼ cup milk with ¼ cup Greek yogurt, add 1 scoop vanilla protein powder, and reduce flour by 2 tablespoons."
    ]
  },
  {
    id: 'waffles',
    name: 'Classic Homemade Waffles',
    description: 'Crispy on the outside, light and airy on the inside.',
    ingredients: [
      { item: 'all-purpose flour', amount: '2', unit: 'cups' },
      { item: 'sugar', amount: '1', unit: 'tablespoon' },
      { item: 'baking powder', amount: '1', unit: 'tablespoon' },
      { item: 'salt', amount: '0.5', unit: 'teaspoon' },
      { item: 'eggs', amount: '2', unit: 'large' },
      { item: 'milk', amount: '1.75', unit: 'cups' },
      { item: 'unsalted butter, melted', amount: '0.5', unit: 'cup' },
      { item: 'vanilla extract', amount: '1', unit: 'teaspoon' }
    ],
    instructions: [
      "Preheat your waffle iron.",
      "In a large bowl, whisk together flour, sugar, baking powder, and salt.",
      "In a separate bowl, whisk eggs, milk, melted butter, and vanilla.",
      "Pour wet ingredients into dry. Stir until just combined. Small lumps are fine.",
      "Pour batter (approx. ½–¾ cup) and cook until golden brown and crisp.",
      "Serve immediately for maximum crispness."
    ],
    upgrades: [
      "Health Upgrade: Replace ½ cup milk with ¼–½ cup Greek yogurt + add blueberries.",
      "Crispy Tip: Keep finished waffles in a 200°F oven directly on the rack (not stacked)."
    ]
  },
  {
    id: 'omelette',
    name: "WWF Omelette (Warren's World Famous)",
    description: "Family-certified fluffy omelette with build-and-fold technique.",
    ingredients: [
      { item: 'eggs', amount: '4', unit: '' },
      { item: 'milk', amount: '2', unit: 'tablespoons' },
      { item: 'red pepper', amount: '', unit: 'to taste' },
      { item: 'salt', amount: '', unit: 'to taste' },
      { item: 'onion powder', amount: '', unit: 'to taste' },
      { item: 'garlic powder', amount: '', unit: 'to taste' },
      { item: 'avocado oil', amount: '', unit: 'for pan' },
      { item: 'cheddar cheese', amount: '', unit: 'preferred' },
      { item: 'hot sauce', amount: '', unit: 'optional' },
      { item: 'fresh cracked pepper', amount: '', unit: 'to finish' }
    ],
    instructions: [
      "Crack 4 eggs into a bowl. Add milk, red pepper, salt, onion powder, and garlic powder. Whisk until smooth.",
      "Coat a non-stick pan with avocado oil. Heat between medium and medium-low.",
      "Pour in mixture, cover with lid, and cook for 4 mins until top is set.",
      "Fill one half with cheese/hot sauce, fold in half, cover, and cook on low for 1 min.",
      "Finish with fresh cracked pepper and let sit briefly before serving."
    ],
    upgrades: [
      "Leaner: Use 2 whole eggs + 2 egg whites.",
      "Cheese Swap: Try Swiss, part-skim mozzarella, or crumbled feta."
    ]
  }
];

const state = {
  view: 'list',
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
  console.log('Recipes App Initialize. Recipes Count:', RECIPES.length);
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

  if (dom.recipeList) {
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
}

function getUniqueIngredients(recipe) {
  return [...new Set(recipe.ingredients.map(i => i.item.split(',')[0].trim()))];
}

function renderDetail() {
  const recipe = state.currentRecipe;
  if (!recipe || !dom.detailView) return;

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

  window.scrollTo(0, 0);
}

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
// Backup for browsers where DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
}
