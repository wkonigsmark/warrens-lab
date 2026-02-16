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
  },
  {
    id: 'french-toast',
    name: 'WWF French Toast (The Special)',
    description: 'Simple, dependable, and feels special. Infused with cinnamon and vanilla.',
    ingredients: [
      { item: 'thick-cut bread (brioche or challah)', amount: '4', unit: 'slices' },
      { item: 'eggs', amount: '2', unit: 'large' },
      { item: 'milk', amount: '0.5', unit: 'cup' },
      { item: 'cinnamon', amount: '1', unit: 'teaspoon' },
      { item: 'vanilla extract', amount: '1', unit: 'teaspoon' },
      { item: 'maple syrup (in the mix)', amount: '1', unit: 'teaspoon' },
      { item: 'butter', amount: '1', unit: 'tablespoon' }
    ],
    instructions: [
      "Whisk eggs, milk, cinnamon, vanilla, and the tiny drizzle of maple syrup in a shallow bowl.",
      "Dip bread slices into the egg mixture, allowing each side to soak for 10-15 seconds.",
      "Melt butter in a large skillet over medium heat.",
      "Fry the bread until golden brown on both sides (about 2-3 mins per side).",
      "Cut into 'soldiers' (strips) for easy dipping if serving to kids."
    ],
    upgrades: [
      "Top with fresh berries and an extra dust of powdered sugar."
    ]
  },
  {
    id: 'yogurt-parfait',
    name: 'Greek Yogurt Parfait Bar',
    description: 'Interactive, protein-heavy, and requires zero cooking.',
    ingredients: [
      { item: 'plain Greek yogurt', amount: '1', unit: 'cup' },
      { item: 'honey', amount: '1', unit: 'tablespoon' },
      { item: 'granola', amount: '0.25', unit: 'cup' },
      { item: 'blueberries', amount: '0.25', unit: 'cup' },
      { item: 'banana', amount: '0.5', unit: 'sliced' }
    ],
    instructions: [
      "Scoop the Greek yogurt into a clear bowl or glass.",
      "Layer the granola and fruits on top of the yogurt.",
      "Drizzle the honey over the top for natural sweetness.",
      "Serve as a bar where everyone can pick their own toppings."
    ],
    upgrades: [
      "Add a sprinkle of chia seeds or flax seeds for extra fiber."
    ]
  },
  {
    id: 'breakfast-sandwich',
    name: 'Egg & Cheese Breakfast Sandwich',
    description: 'The customizable restaurant-style sandwich you can hold in your hand.',
    ingredients: [
      { item: 'bread or English muffin', amount: '1', unit: '' },
      { item: 'egg', amount: '1', unit: '' },
      { item: 'cheddar cheese', amount: '1', unit: 'slice' },
      { item: 'butter', amount: '1', unit: 'teaspoon' },
      { item: 'spinach', amount: '', unit: 'optional' }
    ],
    instructions: [
      "Toast your bread or English muffin until golden.",
      "Whisk the egg and scramble it in a small pan with butter until just set.",
      "If using spinach, wilt it in the pan with the egg during the last 30 seconds.",
      "Place the egg and cheese on the toasted bread. The heat from the egg will melt the cheese.",
      "Top with the other slice of bread and serve."
    ],
    upgrades: [
      "Add a slice of tomato or a smear of avocado for a 'deluxe' version."
    ]
  },
  {
    id: 'scrambled-soldiers',
    name: 'WWF Scrambled Eggs & Toast Soldiers',
    description: 'Soft-scrambled perfection with buttery dipping strips.',
    ingredients: [
      { item: 'eggs', amount: '3', unit: 'large' },
      { item: 'milk', amount: '1', unit: 'tablespoon' },
      { item: 'butter', amount: '2', unit: 'tablespoons' },
      { item: 'bread', amount: '2', unit: 'slices' },
      { item: 'chives', amount: '', unit: 'to taste' }
    ],
    instructions: [
      "Whisk eggs and milk until completely pale and streak-free.",
      "In a cool pan, add 1 tbsp butter and the eggs. Cook over medium-low heat.",
      "Stir constantly with a spatula for soft, small curds. Remove when slightly runny (they finish on the plate).",
      "Toast the bread and butter it heavily. Cut into 1-inch strips (soldiers).",
      "Serve eggs in a bowl with soldiers arranged on the side for dipping."
    ],
    upgrades: [
      "Garnish with fresh chives for a pop of color and flavor."
    ]
  },
  {
    id: 'bagel-morning',
    name: 'Bagel Morning Buffet',
    description: 'An occasional treat that feels grown-up and versatile.',
    ingredients: [
      { item: 'bagel', amount: '1', unit: 'your choice' },
      { item: 'cream cheese', amount: '2', unit: 'tablespoons' },
      { item: 'peanut butter', amount: '1', unit: 'tablespoon' },
      { item: 'strawberries', amount: '3', unit: 'sliced' }
    ],
    instructions: [
      "Slice the bagel in half and toast to your preferred level of crispness.",
      "Spread cream cheese on one half and peanut butter on the other.",
      "Top the peanut butter side with sliced strawberries.",
      "Serve as a mini-buffet with different spreads on the table."
    ],
    upgrades: [
      "Try a savory version with avocado and everything bagel seasoning."
    ]
  },
  {
    id: 'smoothie-bowl',
    name: 'Smoothie Bowls / Fun Cups',
    description: 'Frozen, fruity, and interactive. Let them pick the toppings.',
    ingredients: [
      { item: 'frozen berries', amount: '1', unit: 'cup' },
      { item: 'banana', amount: '1', unit: 'frozen' },
      { item: 'milk', amount: '0.5', unit: 'cup' },
      { item: 'yogurt', amount: '0.25', unit: 'cup' },
      { item: 'toppings (granola, seeds, fruit)', amount: '', unit: 'to taste' }
    ],
    instructions: [
      "Add berries, frozen banana, milk, and yogurt to a blender.",
      "Blend until thick and smooth (use less milk for a bowl, more for a cup).",
      "Pour into a bowl or a 'fun cup'.",
      "Let the kids (or yourself) arrange toppings over the surface."
    ],
    upgrades: [
      "Add a scoop of protein powder or a handful of spinach for a hidden health boost."
    ]
  },
  {
    id: 'silver-dollar',
    name: 'Silver Dollar Pancakes',
    description: 'Miniature pancakes that look like coins. A fun twist on the classic.',
    ingredients: [
      { item: 'Classic Pancake Batter', amount: '1', unit: 'batch' },
      { item: 'butter', amount: '1', unit: 'tablespoon' }
    ],
    instructions: [
      "Prepare the Classic Homemade Pancake batter.",
      "Heat a buttered skillet over medium heat.",
      "Drop 1-tablespoon sized mounds of batter onto the pan.",
      "Flip when bubbles appear (they cook much faster than regular pancakes!).",
      "Serve in stacks of 5 like high-stakes pancake coins."
    ],
    upgrades: [
      "Add a single chocolate chip to the center of each 'coin'."
    ]
  },
  {
    id: 'oatmeal-bar',
    name: 'Oatmeal Bar',
    description: 'Warm, comforting, and consistently great for a rainy morning.',
    ingredients: [
      { item: 'old fashioned oats', amount: '0.5', unit: 'cup' },
      { item: 'water or milk', amount: '1', unit: 'cup' },
      { item: 'brown sugar', amount: '1', unit: 'teaspoon' },
      { item: 'cinnamon', amount: '0.5', unit: 'teaspoon' },
      { item: 'apples', amount: '0.25', unit: 'diced' },
      { item: 'raisins', amount: '1', unit: 'tablespoon' }
    ],
    instructions: [
      "Combine oats and liquid in a small pot or microwave-safe bowl.",
      "Cook until soft and creamy (about 5-7 mins on stovetop or 2 mins in microwave).",
      "Stir in the cinnamon and brown sugar.",
      "Top with diced apples and raisins.",
      "Serve as a 'bar' where everyone adds their own spice and fruits."
    ],
    upgrades: [
      "Swap brown sugar for maple syrup or a dollop of almond butter."
    ]
  },
  {
    id: 'breakfast-quesadilla',
    name: 'Breakfast Quesadilla',
    description: 'Scrambled eggs and melted cheese in a crisp tortilla triangle.',
    ingredients: [
      { item: 'flour tortilla', amount: '1', unit: 'large' },
      { item: 'eggs', amount: '2', unit: '' },
      { item: 'cheddar cheese', amount: '0.25', unit: 'cup' },
      { item: 'butter', amount: '1', unit: 'teaspoon' }
    ],
    instructions: [
      "Scramble the eggs in a buttered pan until just set.",
      "Place a tortilla in a dry skillet over medium heat.",
      "Sprinkle half the cheese on one side, top with the eggs, then the remaining cheese.",
      "Fold the tortilla in half and press down with a spatula.",
      "Flip when the bottom is golden and cook until cheese is fully melted and tortilla is crisp.",
      "Slice into triangles for easy dipping in salsa or yogurt."
    ],
    upgrades: [
      "Add black beans or diced peppers inside for a southwest flair."
    ]
  }
];

const state = {
  view: 'list',
  currentRecipe: null,
  searchTerm: '',
  plan: [] // Array of { id, date, meal }
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
  console.log('Recipes App Initialize. Recipes Count:', RECIPES.length);

  // Handle Deep Linking
  const hash = window.location.hash.substring(1);
  if (hash === 'cart') {
    state.view = 'cart';
  } else if (hash) {
    const found = RECIPES.find(r => r.id === hash);
    if (found) {
      state.currentRecipe = found;
      state.view = 'detail';
    }
  }

  render();

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
  if (hash === 'cart') {
    state.view = 'cart';
  } else if (!hash) {
    state.view = 'list';
    state.currentRecipe = null;
  } else {
    const found = RECIPES.find(r => r.id === hash);
    if (found) {
      state.currentRecipe = found;
      state.view = 'detail';
    }
  }
  render();
}

function render() {
  updateCartBadge();

  if (state.view === 'list') {
    dom.detailView.classList.add('hidden');
    dom.listView.classList.remove('hidden');
    renderList();
  } else if (state.view === 'detail') {
    dom.listView.classList.add('hidden');
    dom.detailView.classList.remove('hidden');
    renderDetail();
  } else if (state.view === 'cart') {
    dom.listView.classList.add('hidden');
    dom.detailView.classList.remove('hidden');
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
    const inTitle = recipe.name.toLowerCase().includes(state.searchTerm);
    const inIngredients = recipe.ingredients.some(ing => ing.item.toLowerCase().includes(state.searchTerm));
    return inTitle || inIngredients;
  });

  if (dom.recipeList) {
    dom.recipeList.innerHTML = filtered.map(recipe => {
      const isSelected = state.plan.some(p => p.id === recipe.id);
      return `
        <div class="recipe-card ${isSelected ? 'selected' : ''}" onclick="window.showRecipe('${recipe.id}')">
          <div class="card-header">
            <h2>${recipe.name}</h2>
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

function aggregateIngredients() {
  const master = {}; // { "flour (cups)": { amount: 2, item: "flour", unit: "cups" } }
  state.plan.forEach(p => {
    const recipe = RECIPES.find(r => r.id === p.id);
    if (recipe) {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.item.toLowerCase().trim()}|${ing.unit.toLowerCase().trim()}`;
        if (!master[key]) {
          master[key] = { item: ing.item, unit: ing.unit, amount: 0 };
        }
        const val = parseFloat(ing.amount);
        if (!isNaN(val)) {
          master[key].amount += val;
        } else if (!master[key].amount) {
          master[key].amount = ing.amount; // Keep string if first entry
        }
      });
    }
  });
  return Object.values(master);
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
    
    ${state.plan.length === 0 ? '<p>No recipes selected yet. Browse and add some ideas!</p>' : `
      <section>
        <h3 class="master-list-title">📦 Master Shopping List</h3>
        <div class="master-list">
          ${masterList.map(ing => `
            <div class="master-item">
              <span class="item-name">${ing.item}</span>
              <span class="item-total">${ing.amount} ${ing.unit}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <section>
        <h3>⏳ Meal Sequence</h3>
        <p class="instruction-note">Drag recipes to reorder the sequence.</p>
        <div class="cart-items" id="draggable-list">
          ${state.plan.map((item, index) => {
    const recipe = RECIPES.find(r => r.id === item.id);
    return `
              <div class="cart-item draggable" draggable="true" data-index="${index}" ondragstart="window.onDragStart(event)" ondragover="window.onDragOver(event)" ondrop="window.onDrop(event)">
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
      <h2>Aggregated Shopping List</h2>
      <div class="master-list">
        ${masterList.map(ing => `<li>${ing.amount} ${ing.unit} ${ing.item}</li>`).join('')}
      </div>
      <h2>Daily Schedule</h2>
      ${state.plan.map(p => {
    const r = RECIPES.find(res => res.id === p.id);
    return `<div><strong>${p.date || 'No Date'} - ${p.meal || 'No Meal'}:</strong> ${r.name}</div>`;
  }).join('')}
    </div>
  `;
}

window.showRecipe = (id) => {
  window.location.hash = id;
};

window.backToList = () => {
  window.location.hash = '';
};

window.goToCart = () => {
  window.location.hash = 'cart';
};

window.toggleSelect = (id) => {
  if (state.selectedIds.has(id)) {
    state.selectedIds.delete(id);
  } else {
    state.selectedIds.add(id);
  }
  render();
};

window.shareRecipe = (id) => {
  const url = `${window.location.origin}${window.location.pathname}#${id}`;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link copied to clipboard! Send this to your companion.');
  });
};

document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
}
