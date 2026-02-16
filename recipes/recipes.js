// Recipes database
const RAW_RECIPES = [
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
    },
    {
        id: 'spaghetti-carbonara',
        name: 'Quick Spaghetti Carbonara',
        type: ['Dinner'],
        description: 'A creamy, peppery Italian classic that comes together in 15 minutes.',
        ingredients: [
            { item: 'spaghetti', amount: '1', unit: 'lb' },
            { item: 'guanciale or pancetta', amount: '4', unit: 'oz' },
            { item: 'eggs', amount: '3', unit: 'large' },
            { item: 'pecorino romano', amount: '1', unit: 'cup' },
            { item: 'fresh cracked pepper', amount: '1', unit: 'tablespoon' }
        ],
        instructions: [
            "Boil spaghetti in salted water until al dente.",
            "In a bowl, whisk eggs, cheese, and pepper until thick.",
            "Fry pancetta in a pan until crispy.",
            "Toss pasta in pancetta fat, remove from heat, and quickly stir in egg mixture.",
            "Add pasta water if needed to reach a creamy consistency."
        ],
        upgrades: ["Add a handful of peas for a pop of color and sweetness."]
    },
    {
        id: 'chicken-stir-fry',
        name: '10-Minute Chicken Stir Fry',
        type: ['Dinner', 'Lunch'],
        description: 'High heat, fast pace, and deep flavors.',
        ingredients: [
            { item: 'chicken breast', amount: '2', unit: 'sliced' },
            { item: 'broccoli florets', amount: '2', unit: 'cups' },
            { item: 'soy sauce', amount: '3', unit: 'tablespoons' },
            { item: 'ginger', amount: '1', unit: 'tablespoon' },
            { item: 'garlic', amount: '2', unit: 'cloves' }
        ],
        instructions: [
            "Sear chicken in a hot wok or skillet until golden.",
            "Add broccoli and a splash of water, cover for 2 mins.",
            "Stir in soy sauce, ginger, and garlic.",
            "Toss until sauce thickens and coats everything.",
            "Serve over rice or noodles."
        ],
        upgrades: ["Top with sesame seeds and sliced green onions."]
    },
    {
        id: 'sheet-pan-salmon',
        name: 'Honey-Glazed Sheet Pan Salmon',
        type: ['Dinner'],
        description: 'Minimal cleanup, maximum flavor. Sweet, savory, and healthy.',
        ingredients: [
            { item: 'salmon fillets', amount: '2', unit: '' },
            { item: 'asparagus', amount: '1', unit: 'bunch' },
            { item: 'honey', amount: '2', unit: 'tablespoons' },
            { item: 'soy sauce', amount: '1', unit: 'tablespoon' },
            { item: 'olive oil', amount: '1', unit: 'tablespoon' }
        ],
        instructions: [
            "Preheat oven to 400°F.",
            "Place salmon and asparagus on a baking sheet.",
            "Whisk honey, soy sauce, and oil; brush over salmon and veg.",
            "Roast for 12-15 minutes until salmon flakes easily.",
            "Finish with a squeeze of fresh lemon."
        ],
        upgrades: ["Add baby potatoes to the pan 15 minutes before the salmon."]
    },
    {
        id: 'rainbow-bento',
        name: 'Rainbow Bento Box',
        type: ['Lunch'],
        description: 'A colorful, no-cook lunch box with a balance of protein and crunch.',
        ingredients: [
            { item: 'mozz string cheese', amount: '1', unit: 'stick' },
            { item: 'strawberries', amount: '4', unit: 'sliced' },
            { item: 'grapes', amount: '6', unit: '' },
            { item: 'pretzels', amount: '1', unit: 'handful' }
        ],
        instructions: [
            "Slice the strawberries and wash the grapes.",
            "Peel the string cheese into 'threads' or keep whole.",
            "Place items into separate compartments of a lunch box.",
            "Add a small handful of crunchy pretzels for texture."
        ],
        upgrades: ["Add a dip of Greek yogurt and honey for the fruit."]
    },
    {
        id: 'snack-pack-lunch',
        name: "Crunch & Munch Snack Pack",
        type: ['Lunch'],
        description: 'Perfect for grazing. Low pressure, high fun.',
        ingredients: [
            { item: 'popcorn', amount: '1', unit: 'small bag' },
            { item: 'cheese puffs', amount: '1', unit: 'handful' },
            { item: 'greek yogurt', amount: '1', unit: 'pot' },
            { item: 'pretzels', amount: '1', unit: 'handful' }
        ],
        instructions: [
            "Divide the savory snacks (popcorn, puffs, pretzels) into small bags or boxes.",
            "Keep the yogurt cold until mealtime.",
            "A great option for quick lunch breaks."
        ],
        upgrades: ["Mix some honey into the yogurt for a sweet treat."]
    },
    {
        id: 'cold-pasta-salad',
        name: 'Simple Cold Pasta Salad',
        type: ['Lunch', 'Side'],
        description: 'A reliable leftover-friendly lunch that stays good in a bag.',
        ingredients: [
            { item: 'cooked pasta', amount: '1', unit: 'cup' },
            { item: 'olive oil', amount: '1', unit: 'teaspoon' },
            { item: 'parmesan cheese', amount: '1', unit: 'tablespoon' },
            { item: 'cucumber sticks', amount: '4', unit: '' }
        ],
        instructions: [
            "Toss cold pasta with olive oil and parmesan cheese.",
            "Add a pinch of salt if needed.",
            "Box it up with cucumber sticks on the side for a refreshing crunch."
        ],
        upgrades: ["Add finely chopped broccoli stars for extra nutrition."]
    }
];

window.RECIPES_DATA = RAW_RECIPES;

