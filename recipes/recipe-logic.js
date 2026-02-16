const RECIPES = [
  {
    id: 'pancakes',
    name: 'Pancakes from Scratch',
    type: ['Breakfast'],
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
    upgrades: ["Protein Version: Replace ¼ cup milk with ¼ cup Greek yogurt, add 1 scoop vanilla protein powder, and reduce flour by 2 tablespoons."]
  },
  {
    id: 'waffles',
    name: "Warren's Waffles",
    type: ['Breakfast'],
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
    upgrades: ["Health Upgrade: Replace ½ cup milk with ¼–½ cup Greek yogurt + add blueberries.", "Crispy Tip: Keep finished waffles in a 200°F oven directly on the rack (not stacked)."]
  },
  {
    id: 'omelette',
    name: "WWF Omelette (Warren's World Famous)",
    type: ['Breakfast', 'Lunch'],
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
    upgrades: ["Leaner: Use 2 whole eggs + 2 egg whites.", "Cheese Swap: Try Swiss, part-skim mozzarella, or crumbled feta."]
  },
  {
    id: 'french-toast',
    name: 'WWF French Toast (The Special)',
    type: ['Breakfast'],
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
    upgrades: ["Top with fresh berries and an extra dust of powdered sugar."]
  },
  {
    id: 'yogurt-parfait',
    name: 'Greek Yogurt Parfait Bar',
    type: ['Breakfast', 'Lunch'],
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
    upgrades: ["Add a sprinkle of chia seeds or flax seeds for extra fiber."]
  },
  {
    id: 'pb-j',
    name: 'Classic PB&J (Crust-Off Option)',
    type: ['Lunch'],
    description: 'The golden standard of school-day lunches. Simple and dependable.',
    ingredients: [
      { item: 'sandwich bread', amount: '2', unit: 'slices' },
      { item: 'creamy peanut butter', amount: '2', unit: 'tablespoons' },
      { item: 'grape or strawberry jelly', amount: '1', unit: 'tablespoon' },
      { item: 'fruit on the side (grapes/strawberries)', amount: '', unit: '' }
    ],
    instructions: [
      "Spread peanut butter evenly on one slice of bread.",
      "Spread jelly on the other slice.",
      "Press the slices together.",
      "Cut off the crusts if requested, and slice into fun shapes (triangles or squares).",
      "Serve with a handful of fresh grapes or strawberries."
    ],
    upgrades: ["Swap bread for a tortilla to make a PB&J roll-up."]
  },
  {
    id: 'hummus-pita',
    name: 'Hummus & Pita Dipper',
    type: ['Lunch'],
    description: 'A cold, fresh platter that kids love to assemble and dip.',
    ingredients: [
      { item: 'hummus', amount: '0.5', unit: 'cup' },
      { item: 'pita bread', amount: '1', unit: 'pocket' },
      { item: 'cucumber sticks', amount: '4', unit: '' },
      { item: 'carrot sticks', amount: '4', unit: '' },
      { item: 'grapes', amount: '6', unit: '' }
    ],
    instructions: [
      "Cut the pita bread into triangles.",
      "Place a scoop of hummus in the center of a plate.",
      "Arrange pita, cucumber, carrots, and grapes in sections around the hummus.",
      "Encourage dipping each item into the hummus."
    ],
    upgrades: ["Add a small dollop of guacamole for extra dipping variety."]
  },
  {
    id: 'buttered-noodles',
    name: 'Buttered Noodles (Kid Gold Standard)',
    type: ['Dinner'],
    description: 'The ultimate comfort meal. High-visibility, low-drama.',
    ingredients: [
      { item: 'rotini or penne pasta', amount: '1', unit: 'cup' },
      { item: 'unsalted butter', amount: '1', unit: 'tablespoon' },
      { item: 'parmesan cheese', amount: '1', unit: 'tablespoon' },
      { item: 'salt', amount: '', unit: 'for water' }
    ],
    instructions: [
      "Boil water in a small pot with a pinch of salt.",
      "Cook pasta until tender (about 8-10 mins).",
      "Drain the pasta, reserving a tiny splash of the water.",
      "Toss with butter and parmesan cheese until every noodle is coated and glossy.",
      "Serve warm in a favorite bowl."
    ],
    upgrades: ["Add a side of 'Broccoli Stars' for a balanced plate."]
  },
  {
    id: 'broccoli-stars',
    name: 'Roasted Broccoli Stars',
    type: ['Dinner', 'Side'],
    description: 'Simple, crispy roasted broccoli that actually tastes like a snack.',
    ingredients: [
      { item: 'broccoli florets', amount: '2', unit: 'cups' },
      { item: 'olive oil', amount: '1', unit: 'tablespoon' },
      { item: 'salt', amount: '', unit: 'to taste' },
      { item: 'lemon juice', amount: '', unit: 'optional' }
    ],
    instructions: [
      "Preheat oven to 400°F.",
      "Toss broccoli florets in a bowl with olive oil and a pinch of salt.",
      "Spread on a baking sheet and roast for 15-18 mins until the tips are crispy.",
      "Finish with a squeeze of lemon juice or a dust of parmesan."
    ],
    upgrades: ["Serve with a small side of chicken tenders for a full meal."]
  },
  {
    id: 'bean-tacos',
    name: 'Simple Bean & Cheese Tacos',
    type: ['Dinner', 'Lunch'],
    description: 'Bland but delicious. Protein-packed and zero spice.',
    ingredients: [
      { item: 'small flour tortillas', amount: '2', unit: '' },
      { item: 'canned refried beans (no spice)', amount: '0.5', unit: 'cup' },
      { item: 'shredded cheddar cheese', amount: '0.25', unit: 'cup' },
      { item: 'guacamole', amount: '', unit: 'side' }
    ],
    instructions: [
      "Warm the refried beans in a small bowl (microwave or stovetop).",
      "Slightly warm the tortillas in a dry pan.",
      "Spread a layer of beans down the center of each tortilla.",
      "Sprinkle generously with cheese.",
      "Fold over and serve with a side of mild guacamole for dipping."
    ],
    upgrades: ["Add a spoonful of plain Greek yogurt as a 'sour cream' substitute."]
  },
  {
    id: 'scrambled-soldiers',
    name: 'WWF Scrambled Eggs & Toast Soldiers',
    type: ['Breakfast', 'Lunch'],
    description: 'Soft-scrambled perfection with buttery dipping strips.',
    ingredients: [
      { item: 'eggs', amount: '3', unit: 'large' },
      { item: 'milk', amount: '1', unit: 'tablespoon' },
      { item: 'butter', amount: '2', unit: 'tablespoons' },
      { item: 'bread', amount: '2', unit: 'slices' }
    ],
    instructions: [
      "Whisk eggs and milk until pale.",
      "Cook in a cool pan with 1 tbsp butter over low heat, stirring constantly.",
      "Remove when soft. Butter the toast and cut into strips (soldiers).",
      "Serve with eggs as a dip."
    ],
    upgrades: []
  },
  {
    id: 'breakfast-quesadilla',
    name: 'Breakfast Quesadilla',
    type: ['Breakfast', 'Lunch'],
    description: 'Scrambled egg + cheese folded in tortilla.',
    ingredients: [
      { item: 'tortilla', amount: '1', unit: '' },
      { item: 'eggs', amount: '2', unit: '' },
      { item: 'cheese', amount: '0.25', unit: 'cup' },
      { item: 'butter', amount: '1', unit: 'teaspoon' }
    ],
    instructions: [
      "Scramble eggs with butter.",
      "Place tortilla in pan, fill half with egg and cheese.",
      "Fold and cook until golden brown.",
      "Slice into triangles."
    ],
    upgrades: []
  }
];

const state = {
  view: 'list',
  currentRecipe: null,
  searchTerm: '',
  plan: []
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
  const hash = window.location.hash.substring(1);
  if (hash === 'cart') state.view = 'cart';
  else if (hash) {
    const found = RECIPES.find(r => r.id === hash);
    if (found) { state.currentRecipe = found; state.view = 'detail'; }
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
    const inTitle = recipe.name.toLowerCase().includes(state.searchTerm);
    const inIngredients = recipe.ingredients.some(ing => ing.item.toLowerCase().includes(state.searchTerm));
    const inType = recipe.type.some(t => t.toLowerCase().includes(state.searchTerm));
    return inTitle || inIngredients || inType;
  });

  if (dom.recipeList) {
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
  const master = {};
  state.plan.forEach(p => {
    const recipe = RECIPES.find(r => r.id === p.id);
    if (recipe) {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.item.toLowerCase().trim()}|${ing.unit.toLowerCase().trim()}`;
        if (!master[key]) master[key] = { item: ing.item, unit: ing.unit, amount: 0 };
        const val = parseFloat(ing.amount);
        if (!isNaN(val)) master[key].amount += val;
        else if (!master[key].amount) master[key].amount = ing.amount;
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
    ${state.plan.length === 0 ? '<p>No recipes selected yet.</p>' : `
      <section>
        <h3 class="master-list-title">📦 Master Shopping List</h3>
        <div class="master-list">${masterList.map(ing => `<div class="master-item"><span class="item-name">${ing.item}</span><span class="item-total">${ing.amount} ${ing.unit}</span></div>`).join('')}</div>
      </section>
      <section>
        <h3>⏳ Meal Sequence</h3>
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
      <h2>Master Shopping List</h2>
      <ul>${masterList.map(ing => `<li>${ing.amount} ${ing.unit} ${ing.item}</li>`).join('')}</ul>
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
    const today = new Date().toISOString().split('T')[0];
    state.plan.push({ id, date: today, meal: '' });
  }
  render();
};
window.updatePlanItem = (index, key, value) => { state.plan[index][key] = value; };
let dragSourceIndex = null;
window.onDragStart = (e) => { dragSourceIndex = e.target.closest('.draggable').dataset.index; e.dataTransfer.effectAllowed = 'move'; };
window.onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
window.onDrop = (e) => {
  const targetIndex = e.target.closest('.draggable').dataset.index;
  if (dragSourceIndex !== targetIndex) {
    const moved = state.plan.splice(dragSourceIndex, 1)[0];
    state.plan.splice(targetIndex, 0, moved);
    render();
  }
};
window.shareRecipe = (id) => {
  const url = `${window.location.origin}${window.location.pathname}#${id}`;
  navigator.clipboard.writeText(url).then(() => alert('Copied!'));
};
document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'complete' || document.readyState === 'interactive') init();
