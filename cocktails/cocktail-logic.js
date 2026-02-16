// Cocktail Compass Logic
const state = {
    searchTerm: '',
    allCocktails: typeof window !== 'undefined' ? window.COCKTAILS_DATA : []
};

const dom = {
    searchInput: document.getElementById('search-input'),
    grid: document.getElementById('cocktail-grid')
};

function init() {
    if (!dom.searchInput || !dom.grid) return;

    dom.searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        render();
    });

    render();
}

function render() {
    const filtered = state.allCocktails.filter(drink => {
        const inTitle = drink.title.toLowerCase().includes(state.searchTerm);
        const inIngredients = drink.ingredients.some(ing => ing.item.toLowerCase().includes(state.searchTerm));
        return inTitle || inIngredients;
    });

    if (filtered.length === 0) {
        dom.grid.innerHTML = `
      <div class="empty-state">
        <h3>No cocktails found matching "${state.searchTerm}"</h3>
        <p>Try searching for an ingredient like "gin" or "citrus".</p>
      </div>
    `;
        return;
    }

    dom.grid.innerHTML = filtered.map(drink => `
    <article class="cocktail-card">
      <div class="cocktail-img-wrapper">
        <img src="${drink.imgUrl}" alt="${drink.title}" class="cocktail-img" 
             onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
      </div>
      <div class="card-content">
        <h2 class="cocktail-title">${drink.title}</h2>
        
        <span class="section-label">Ingredients</span>
        <ul class="ingredients-list">
          ${drink.ingredients.map(ing => `
            <li>${ing.amount} ${ing.unit} ${ing.item}</li>
          `).join('')}
        </ul>

        <div class="divider"></div>

        <span class="section-label">Instructions</span>
        <p class="instructions-text">${drink.instructions}</p>
      </div>
    </article>
  `).join('');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
