// Recipes database (Global Variable for local file compatibility)
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
// Removed export for local compatibility
window.RECIPES_DATA = RECIPES;
