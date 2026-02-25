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
        name: "Cheese Omelette",
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
        name: 'French Toast',
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
        id: 'buttered-noodles',
        name: 'Buttered Noodles',
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
        upgrades: ["Add a side of broccoli or cucumber sticks."]
    },
    {
        id: 'bean-tacos',
        name: 'Simple Ground Beef Tacos',
        type: ['Dinner', 'Lunch'],
        description: 'Easy, seasoned ground beef tacos that the whole family loves.',
        ingredients: [
            { item: 'ground beef', amount: '1', unit: 'lb' },
            { item: 'taco seasoning', amount: '1', unit: 'packet' },
            { item: 'small flour tortillas', amount: '8', unit: '' },
            { item: 'shredded cheddar cheese', amount: '1', unit: 'cup' },
            { item: 'shredded lettuce', amount: '1', unit: 'cup' },
            { item: 'guacamole', amount: '', unit: 'side' }
        ],
        instructions: [
            "Brown the ground beef in a skillet over medium-high heat until no longer pink. Drain excess fat.",
            "Add taco seasoning and a splash of water. Simmer for 5 minutes.",
            "Warm the tortillas in a dry pan or microwave.",
            "Assemble tacos with beef, cheese, lettuce, and guacamole.",
            "Serve warm."
        ],
        upgrades: ["Add a spoonful of plain Greek yogurt as a 'sour cream' substitute."]
    },
    {
        id: 'scrambled-soldiers',
        name: "Ballard's Scrambled Eggs & Toast",
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
        type: ['Dinner', 'Rome', 'Roma'],
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
    },
    {
        id: 'lemon-cream-pasta',
        name: 'Lemon Cream Pasta',
        type: ['Dinner'],
        description: 'A bright, creamy, and zesty pasta dish that comes together in the time it takes to boil water.',
        ingredients: [
            { item: 'penne or favorite pasta', amount: '1', unit: 'lb' },
            { item: 'heavy whipping cream', amount: '1', unit: 'cup' },
            { item: 'parmesan cheese', amount: '0.5', unit: 'cup' },
            { item: 'lemon', amount: '1', unit: 'whole' },
            { item: 'shiitake mushrooms', amount: '4', unit: 'oz (optional)' },
            { item: 'garlic', amount: '2', unit: 'cloves (optional)' },
            { item: 'broccoli florets', amount: '1', unit: 'cup (optional)' },
            { item: 'red pepper flakes', amount: '0.5', unit: 'teaspoon' },
            { item: 'salt', amount: '', unit: 'to taste' }
        ],
        instructions: [
            "Boil pasta in salted water until al dente.",
            "Optional: Sauté mushrooms and garlic in a separate pan, or roast broccoli until crispy.",
            "In a large skillet, heat the heavy cream and parmesan over medium-low heat. Squeeze in an entire lemon's juice.",
            "Stir actively to prevent burning until the sauce begins to thicken.",
            "Toss in the cooked pasta and vegetables. Season with red pepper flakes and salt.",
            "Stir well to coat every noodle in the lemon cream sauce and serve immediately."
        ],
        upgrades: ["Add grilled chicken or shrimp for extra protein.", "Top with fresh parsley for a burst of color."]
    },
    {
        id: 'crispy-cast-iron-cod',
        name: 'Crispy Cast Iron Cod with Lemon-Garlic Butter',
        type: ['Dinner'],
        description: 'A restaurant-quality technique for perfectly crispy crust and buttery, flaky inside. Searing in cast iron and finishing in the oven is the key.',
        ingredients: [
            { item: 'cod fillets', amount: '4', unit: '(approx 6oz each)' },
            { item: 'all-purpose flour', amount: '0.25', unit: 'cup' },
            { item: 'garlic powder', amount: '1', unit: 'teaspoon' },
            { item: 'paprika', amount: '0.5', unit: 'teaspoon' },
            { item: 'butter', amount: '4', unit: 'tablespoons' },
            { item: 'olive oil', amount: '1', unit: 'tablespoon' },
            { item: 'garlic', amount: '3', unit: 'cloves, minced' },
            { item: 'lemon', amount: '1', unit: 'halved' },
            { item: 'fresh parsley', amount: '1', unit: 'tablespoon, chopped' },
            { item: 'salt & black pepper', amount: '', unit: 'to taste' }
        ],
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Pat cod fillets VERY dry with paper towels (moisture is the enemy of crispy). Season both sides with salt and pepper.",
            "In a shallow dish, mix flour, garlic powder, and paprika. Lightly dredge the fillets, shaking off all excess so it's a very thin coating.",
            "Heat olive oil and 1 tbsp butter in a large cast iron skillet over medium-high heat until shimmering.",
            "Place cod in skillet. Sear undisturbed for 2-3 minutes until a golden-brown crust forms. Carefully flip the fillets.",
            "Immediately transfer the skillet to the oven. Bake for 4-6 minutes until clear and flaky.",
            "Remove skillet (careful, it's hot!). Move fish to a plate. In the same hot pan, melt the remaining 3 tbsp butter.",
            "Sauté minced garlic for 30 seconds. Squeeze in lemon juice and stir in parsley. Spoon this golden sauce over the crispy fish and serve immediately."
        ],
        upgrades: ["Serve over a bed of sautéed spinach or with roasted asparagus.", "Add a pinch of red pepper flakes to the butter sauce for a tiny kick."]
    },
    {
        id: 'wwf-quinoa',
        name: "WWF Quinoa",
        type: ['Lunch', 'Side', 'Dinner'],
        description: 'A healthy, protein-packed powerhouse with a unique toasted depth and bright lemon finish. Great for meal prep!',
        ingredients: [
            { item: 'quinoa', amount: '1', unit: 'cup (washed)' },
            { item: 'avocado oil or olive oil', amount: '2', unit: 'tablespoons' },
            { item: 'broth (chicken, beef, or veg)', amount: '1', unit: 'cup' },
            { item: 'water', amount: '1', unit: 'cup' },
            { item: 'lemon', amount: '1', unit: 'whole' },
            { item: 'artichoke hearts', amount: '1', unit: 'can (chopped)' },
            { item: 'corn', amount: '0.5', unit: 'cup' },
            { item: 'ground beef', amount: '0.5', unit: 'lb (optional)' },
            { item: 'onion powder', amount: '1', unit: 'teaspoon' },
            { item: 'cardamom', amount: '0.5', unit: 'teaspoon' },
            { item: 'salt', amount: '', unit: 'to taste' }
        ],
        instructions: [
            "Drizzle avocado or olive oil into a pan over medium heat.",
            "Add 1 cup of washed quinoa and another drizzle of oil. Stir and toast the grains for 30-60 seconds until fragrant.",
            "Add 1 cup of broth and seasonings (salt, onion powder, cardamom). Stir well.",
            "Add another cup of water (maintaining a 2:1 liquid-to-grain ratio). Bring to a boil while actively stirring.",
            "Reduce heat to low and cover. Let cook for 10-13 minutes.",
            "Quinoa is done when germs have emerged from the grains and liquid is mostly (but not completely) gone.",
            "Squeeze one whole lemon into the pot and stir. (Tip: if grains are sticking, add a splash of water to help release them).",
            "Stir in chopped artichoke hearts and corn. Add browned ground beef here if you want a protein boost.",
            "Serve hot for dinner or cold for a healthy office lunch!"
        ],
        upgrades: ["Add crumbled feta cheese for a salty tang.", "Toss in some fresh baby spinach at the end for extra greens."]
    },
    {
        id: 'no-cilantro-street-corn-quinoa',
        name: 'No-Cilantro Street Corn Quinoa Salad',
        type: ['Lunch', 'Side'],
        description: 'A vibrant, Mexican-inspired salad with all the creamy, zesty flavors of street corn—but modified with fresh parsley and scallions to be 100% cilantro-free.',
        ingredients: [
            { item: 'quinoa', amount: '1', unit: 'cup (cooked and cooled)' },
            { item: 'corn', amount: '2', unit: 'cups (roasted or canned)' },
            { item: 'black beans', amount: '1', unit: 'can (rinsed)' },
            { item: 'red bell pepper', amount: '1', unit: 'diced' },
            { item: 'red onion', amount: '0.25', unit: 'cup, finely diced' },
            { item: 'fresh parsley', amount: '0.5', unit: 'cup, chopped' },
            { item: 'scallions', amount: '3', unit: 'sliced' },
            { item: 'feta cheese or queso fresco', amount: '0.5', unit: 'cup' },
            { item: 'greek yogurt or mayo', amount: '0.25', unit: 'cup' },
            { item: 'lime juice', amount: '2', unit: 'tablespoons' },
            { item: 'chili powder', amount: '1', unit: 'teaspoon' },
            { item: 'cumin', amount: '0.5', unit: 'teaspoon' },
            { item: 'salt & pepper', amount: '', unit: 'to taste' }
        ],
        instructions: [
            "In a large bowl, combine the cooked/cooled quinoa, corn, black beans, red bell pepper, and red onion.",
            "Add the freshly chopped parsley and sliced scallions (these provide the brightness without the cilantro soap-taste).",
            "In a small jar or bowl, whisk together the greek yogurt (or mayo), lime juice, chili powder, and cumin to create the creamy dressing.",
            "Pour the dressing over the salad and toss well to coat.",
            "Gently fold in the crumbled feta or queso fresco.",
            "Taste and season with additional salt and pepper as needed.",
            "Serve immediately or refrigerate for at least 30 minutes to let the flavors meld. Perfect for a refreshing lunch!"
        ],
        upgrades: ["Add diced avocado right before serving for extra creaminess.", "Stir in some tajin seasoning for a spicy-lime kick."]
    },
    {
        id: 'smashed-parmesan-sprouts',
        name: 'Extra-Crispy Smashed Parmesan Sprouts',
        type: ['Side'],
        description: 'The ultimate crunch. By smashing the sprouts, you create a huge surface area that caramelizes into a salty, cheesy crisp.',
        ingredients: [
            { item: 'brussels sprouts', amount: '1', unit: 'lb' },
            { item: 'parmesan cheese', amount: '0.5', unit: 'cup, finely grated' },
            { item: 'olive oil', amount: '2', unit: 'tablespoons' },
            { item: 'garlic powder', amount: '1', unit: 'teaspoon' },
            { item: 'salt & black pepper', amount: '', unit: 'to taste' }
        ],
        instructions: [
            "Boil a pot of salted water. Add trimmed Brussels sprouts and cook for 8-10 minutes until tender but not mushy. Drain and pat very dry.",
            "Preheat oven to 425°F (220°C). Line a baking sheet with parchment paper.",
            "Place sprouts on the sheet. Use the bottom of a heavy glass or mason jar to gently but firmly press each sprout until it's flattened into a disk.",
            "Drizzle with olive oil and sprinkle with garlic powder, salt, and pepper.",
            "Roast for 15 minutes. Remove from oven and sprinkle generously with parmesan cheese.",
            "Return to the oven for another 5-10 minutes until the cheese is golden and the edges are incredibly crispy.",
            "Serve immediately while hot and crunchy!"
        ],
        upgrades: ["Drizzle with a little truffle oil for a fancy finish.", "Top with toasted pine nuts for extra texture."]
    },
    {
        id: 'cast-iron-brussels-sprouts',
        name: 'Cast Iron Seared Brussels Sprouts',
        type: ['Side'],
        description: 'A faster, intensely flavorful method. Searing face-down in a hot skillet creates a deep, dark caramelization.',
        ingredients: [
            { item: 'brussels sprouts', amount: '1', unit: 'lb (halved lengthwise)' },
            { item: 'bacon or pancetta', amount: '4', unit: 'slices, chopped' },
            { item: 'balsamic glaze', amount: '2', unit: 'tablespoons' },
            { item: 'honey', amount: '1', unit: 'tablespoon' },
            { item: 'lemon juice', amount: '1', unit: 'teaspoon' },
            { item: 'salt & black pepper', amount: '', unit: 'to taste' }
        ],
        instructions: [
            "In a large cast iron skillet over medium heat, cook chopped bacon until crispy. Remove bacon with a slotted spoon, leaving the fat in the pan.",
            "Increase heat to medium-high. Place Brussels sprouts cut-side down in the hot bacon fat. Do not crowd the pan.",
            "Sear undisturbed for 3-5 minutes until the bottoms are dark golden-brown (almost charred).",
            "Give the pan a stir and cook for another 2-3 minutes until tender-crisp.",
            "Whisk together balsamic glaze, honey, and lemon juice. Pour over the sprouts and toss to coat.",
            "Cook for 1 more minute until the glaze is sticky and bubbling.",
            "Stir the crispy bacon back in and serve hot."
        ],
        upgrades: ["Add dried cranberries for a sweet contrast.", "Sprinkle with red pepper flakes if you like a little heat."]
    },
    {
        id: 'cacio-e-pepe',
        name: 'Authentic Cacio e Pepe',
        type: ['Dinner', 'Rome', 'Roma'],
        description: 'The minimalist Roman masterpiece. Just cheese and pepper, emulsified into a creamy, silk-like sauce.',
        ingredients: [
            { item: 'spaghetti or tonnarelli', amount: '1', unit: 'lb' },
            { item: 'pecorino romano', amount: '1.5', unit: 'cups, finely grated' },
            { item: 'black peppercorns', amount: '1', unit: 'tablespoon, whole' },
            { item: 'salt', amount: '', unit: 'for pasta water' }
        ],
        instructions: [
            "Boil pasta in a large pot of lightly salted water until al dente.",
            "While pasta cooks, toast whole black peppercorns in a dry skillet until fragrant, then coarsely grind them.",
            "In a large bowl, whisk the ground pepper with a ladle of the hot pasta water.",
            "Slowly whisk in the Pecorino Romano to form a smooth, thick paste.",
            "Drain pasta (reserve more water!). Toss pasta into the bowl with the cheese paste, stirring vigorously.",
            "Add splashes of pasta water as you toss until the sauce is glossy and perfectly emulsified."
        ],
        upgrades: ["Add a tiny squeeze of lemon at the end for brightness.", "Ensure the pasta water isn't boiling hot when adding cheese to prevent clumping."]
    },
    {
        id: 'pasta-amatriciana',
        name: 'Classic Bucatini all\'Amatriciana',
        type: ['Dinner', 'Rome', 'Roma'],
        description: 'A rich, fiery tomato-based Roman classic centered around crispy guanciale.',
        ingredients: [
            { item: 'bucatini or spaghetti', amount: '1', unit: 'lb' },
            { item: 'guanciale or pancetta', amount: '5', unit: 'oz, sliced' },
            { item: 'peeled plum tomatoes', amount: '1', unit: 'can (14oz), hand-crushed' },
            { item: 'pecorino romano', amount: '0.5', unit: 'cup, grated' },
            { item: 'dry chili flakes', amount: '0.5', unit: 'teaspoon' },
            { item: 'white wine', amount: '0.25', unit: 'cup' },
            { item: 'salt & pepper', amount: '', unit: 'to taste' }
        ],
        instructions: [
            "Cook guanciale in a large skillet over medium heat until crispy and fat is rendered. Remove guanciale and set aside.",
            "Add chili flakes to the fat in the pan. Deglaze with white wine and cook until reduced by half.",
            "Add crushed tomatoes and simmer for 15 minutes until thickened.",
            "Boil pasta in salted water until just before al dente.",
            "Add pasta and crispy guanciale to the tomato sauce. Toss for 2 minutes with a splash of pasta water.",
            "Remove from heat, stir in Pecorino Romano, and serve hot."
        ],
        upgrades: ["Sauté a small red onion in the fat for a non-traditional but sweet depth.", "Finish with a drizzle of high-quality olive oil."]
    },
    {
        id: 'pasta-gricia',
        name: 'Pasta alla Gricia',
        type: ['Dinner', 'Rome', 'Roma'],
        description: 'Often called "white Amatriciana," this is the ancient ancestor of the Roman pasta family.',
        ingredients: [
            { item: 'rigatoni or mezzemaniche', amount: '1', unit: 'lb' },
            { item: 'guanciale', amount: '6', unit: 'oz, sliced' },
            { item: 'pecorino romano', amount: '1', unit: 'cup, grated' },
            { item: 'fresh cracked black pepper', amount: '1', unit: 'teaspoon' },
            { item: 'salt', amount: '', unit: 'for pasta water' }
        ],
        instructions: [
            "Boil rigatoni in salted water until al dente.",
            "Cook guanciale in a large skillet over medium heat until golden and crispy. Remove guanciale, leaving fat behind.",
            "Add black pepper to the fat and a ladle of starchy pasta water to create an emulsion.",
            "Add drained pasta to the skillet and toss vigorously to coat.",
            "Remove from heat, gradually stir in Pecorino Romano and the crispy guanciale, adding pasta water until creamy.",
            "Serve immediately with an extra dusting of cheese."
        ],
        upgrades: ["Serve with a crisp Frascati white wine.", "Use Mezze Maniche pasta for the most authentic Roman shape."]
    },
    {
        id: 'kid-lunch-classic',
        name: 'Kid Lunch: The Classic',
        type: ['Lunch', 'Kid'],
        description: 'A balanced, simple, and predictable win for school lunches. Everything is separately packed and soft for easy eating.',
        ingredients: [
            { item: 'greek yogurt cup', amount: '1', unit: 'individual size' },
            { item: 'string cheese', amount: '1', unit: 'stick' },
            { item: 'Z Bar', amount: '1', unit: 'bar' },
            { item: 'applesauce pouch', amount: '1', unit: 'pouch' },
            { item: 'strawberries', amount: '0.5', unit: 'cup, sliced' }
        ],
        instructions: [
            "Pack the Greek yogurt cup with a separate spoon.",
            "Include the string cheese (ensure it's easy to peel).",
            "Add the Z Bar and applesauce pouch.",
            "Slice the strawberries and pack them in a small, separate container.",
            "Ensure everything is packed in separate compartments to avoid mixing textures."
        ],
        upgrades: ["Add a small ice pack to keep the yogurt and cheese fresh."]
    },
    {
        id: 'kid-lunch-protein',
        name: 'Kid Lunch: Protein Boost',
        type: ['Lunch', 'Kid'],
        description: 'A slight variation on the classic, swapping cheese for turkey roll-ups for a higher protein count while keeping the same feel.',
        ingredients: [
            { item: 'greek yogurt cup', amount: '1', unit: 'individual size' },
            { item: 'turkey deli meat', amount: '2', unit: 'slices (rolled up)' },
            { item: 'Z Bar', amount: '1', unit: 'bar' },
            { item: 'applesauce pouch', amount: '1', unit: 'pouch' },
            { item: 'blueberries', amount: '0.5', unit: 'cup' }
        ],
        instructions: [
            "Roll the turkey slices tightly into 'cigar' shapes for easy finger-food eating.",
            "Pack with the Greek yogurt, Z Bar, and applesauce pouch.",
            "Substitute strawberries for blueberries for a small but manageable change.",
            "Pack items separately as per the standard template."
        ],
        upgrades: ["Add a thin slice of mild cheese inside the turkey roll-ups if preferred."]
    },
    {
        id: 'kid-lunch-crunch',
        name: 'Kid Lunch: Crunch Version',
        type: ['Lunch', 'Kid'],
        description: 'Keeps the core favorite items but adds a small portion of crunchy texture for variety.',
        ingredients: [
            { item: 'greek yogurt cup', amount: '1', unit: 'individual size' },
            { item: 'string cheese', amount: '1', unit: 'stick' },
            { item: 'Z Bar', amount: '1', unit: 'bar' },
            { item: 'applesauce pouch', amount: '1', unit: 'pouch' },
            { item: 'strawberries', amount: '0.5', unit: 'cup, sliced' },
            { item: 'pretzels or crackers', amount: '1', unit: 'small handful' }
        ],
        instructions: [
            "Pack the core classic items: yogurt, string cheese, Z Bar, and applesauce.",
            "Add a small handful of pretzels or crackers in a separate, dry compartment to keep them crunchy.",
            "Pack sliced strawberries in their own container."
        ],
        upgrades: ["Choose 'fish' shaped crackers for a fun extra touch."]
    },
    {
        id: 'kid-lunch-dairy-swap',
        name: 'Kid Lunch: Dairy Swap',
        type: ['Lunch', 'Kid'],
        description: 'Rotates the main dairy component from yogurt to cottage cheese while maintaining the exact same layout.',
        ingredients: [
            { item: 'cottage cheese cup', amount: '1', unit: 'individual size' },
            { item: 'string cheese', amount: '1', unit: 'stick' },
            { item: 'Z Bar', amount: '1', unit: 'bar' },
            { item: 'applesauce pouch', amount: '1', unit: 'pouch' },
            { item: 'strawberries', amount: '0.5', unit: 'cup, sliced' }
        ],
        instructions: [
            "Swap the usual yogurt cup for an individual cottage cheese cup.",
            "Pack with the familiar string cheese, Z Bar, and applesauce.",
            "Add the standard container of sliced strawberries.",
            "The layout remains identical to keep it predictable and 'safe'."
        ],
        upgrades: ["Sprinkle a tiny bit of cinnamon on the cottage cheese if he likes it."]
    },
    {
        id: 'kid-lunch-sandwich',
        name: 'Kid Lunch: Sandwich Light',
        type: ['Lunch', 'Kid'],
        description: 'For days when a slightly bigger meal is needed, using a familiar half-sandwich while keeping the side favorites.',
        ingredients: [
            { item: 'bread', amount: '1', unit: 'slice' },
            { item: 'peanut butter', amount: '1', unit: 'tablespoon' },
            { item: 'string cheese', amount: '1', unit: 'stick' },
            { item: 'applesauce pouch', amount: '1', unit: 'pouch' },
            { item: 'strawberries', amount: '0.5', unit: 'cup, sliced' }
        ],
        instructions: [
            "Make a half peanut butter sandwich (one slice folded or cut in half).",
            "Pack with the favorite string cheese, applesauce, and strawberries.",
            "This keeps the meal familiar but introduces a more substantial carb source."
        ],
        upgrades: ["Add a thin layer of jam or honey if preferred, or keep it 'dry' PB for a cleaner eat."]
    },
    {
        id: 'moms-rolled-biscuits',
        name: "Southern Rolled Biscuits",
        type: ['Breakfast', 'Side'],
        description: 'Traditional flaky, layered biscuits. This recipe uses whole milk and a splash of lemon juice to mimic the acidity of buttermilk.',
        ingredients: [
            { item: 'all-purpose flour', amount: '2', unit: 'cups' },
            { item: 'baking powder', amount: '1', unit: 'tablespoon' },
            { item: 'salt', amount: '1', unit: 'teaspoon' },
            { item: 'unsalted butter, cold', amount: '6', unit: 'tablespoons' },
            { item: 'whole milk', amount: '0.75', unit: 'cup' },
            { item: 'lemon juice (optional)', amount: '1', unit: 'teaspoon' }
        ],
        instructions: [
            "Preheat oven to 450°F (230°C).",
            "Whisk flour, baking powder, and salt in a large bowl.",
            "Cut cold butter into the flour using a pastry cutter or two knives until it looks like coarse crumbs.",
            "Mix lemon juice into the milk, then pour into the flour mixture. Stir until just combined.",
            "Turn dough onto a floured surface. Fold it over itself 5-6 times to create layers. Do not overwork!",
            "Pat down to 1-inch thickness and cut into rounds using a cutter or glass.",
            "Place on a baking sheet, touching each other for higher rise. Bake for 12-15 minutes until golden brown."
        ],
        upgrades: ["Brush the tops with melted butter immediately after taking them out of the oven."]
    },
    {
        id: 'cream-drop-biscuits',
        name: 'Southern Cream Drop Biscuits',
        type: ['Breakfast', 'Side'],
        description: 'The easiest biscuit recipe ever. No cutting in butter required—the heavy cream provides all the fat and moisture.',
        ingredients: [
            { item: 'all-purpose flour', amount: '2', unit: 'cups' },
            { item: 'baking powder', amount: '1', unit: 'tablespoon' },
            { item: 'salt', amount: '1', unit: 'teaspoon' },
            { item: 'heavy cream', amount: '1.25', unit: 'cups' }
        ],
        instructions: [
            "Preheat oven to 450°F (230°C).",
            "Whisk flour, baking powder, and salt together.",
            "Pour in heavy cream and stir until a sticky dough forms.",
            "Use a large spoon to drop mounds of dough (about 1/4 cup each) onto a parchment-lined baking sheet.",
            "Bake for 12-15 minutes until the tops are beautifully golden.",
            "Serve warm with honey or jam."
        ],
        upgrades: ["Add 1/2 cup shredded cheddar cheese and a pinch of garlic powder for savory cheddar biscuits."]
    },
    {
        id: 'golden-egg-biscuits',
        name: 'Golden Southern Egg Biscuits',
        type: ['Breakfast'],
        description: 'A richer, sturdier biscuit with a beautiful golden color. The egg helps create a soft, cake-like interior.',
        ingredients: [
            { item: 'all-purpose flour', amount: '2.25', unit: 'cups' },
            { item: 'baking powder', amount: '1', unit: 'tablespoon' },
            { item: 'salt', amount: '1', unit: 'teaspoon' },
            { item: 'unsalted butter, cold', amount: '0.5', unit: 'cup' },
            { item: 'egg', amount: '1', unit: 'large' },
            { item: 'whole milk', amount: '0.5', unit: 'cup' }
        ],
        instructions: [
            "Preheat oven to 425°F (220°C).",
            "Whisk flour, baking powder, and salt together.",
            "Cut cold butter into the flour mixture until pea-sized crumbs form.",
            "In a small bowl, whisk the egg and milk together.",
            "Pour the wet ingredients into the dry and stir until just combined.",
            "Drop by spoonfuls or gently pat into a rectangle and cut into squares.",
            "Bake for 15-18 minutes until well-risen and golden."
        ],
        upgrades: ["Top with a fried egg and a slice of bacon for a premium breakfast sandwich."]
    },
    {
        id: 'iceberg-chopped-salad',
        name: 'Iceberg Chopped Salad',
        type: ['Lunch', 'Side', 'Dinner'],
        description: 'Crisp, creamy, bright, and extra crunchy with skillet-grilled Ballard Special croutons.',
        ingredients: [
            { item: '— FOR THE SALAD —', amount: '', unit: '' },
            { item: 'iceberg lettuce', amount: '', unit: 'chopped' },
            { item: 'purple onion', amount: '0.5', unit: 'thinly sliced' },
            { item: 'cucumber', amount: '', unit: 'sliced or diced' },
            { item: 'corn', amount: '', unit: 'fresh or cooked kernels' },
            { item: 'avocado', amount: '1', unit: 'diced' },
            { item: 'parmesan', amount: '', unit: 'freshly grated or shaved' },
            { item: 'salt, pepper & oregano', amount: '', unit: 'to taste' },
            { item: '— FOR THE DRESSING —', amount: '', unit: '' },
            { item: 'garlic', amount: '1', unit: 'clove, minced' },
            { item: 'lemon', amount: '1', unit: 'juice + zest (optional)' },
            { item: 'olive oil', amount: '', unit: 'good quality, to taste' },
            { item: 'white vinegar', amount: '', unit: 'splash' },
            { item: 'salt & pepper', amount: '', unit: 'to taste' },
            { item: 'oregano', amount: '', unit: 'light sprinkle' },
            { item: '— BALLARD SPECIAL CROUTONS —', amount: '', unit: '' },
            { item: 'rustic bread', amount: '', unit: 'cubed' },
            { item: 'olive oil', amount: '', unit: 'for skillet' },
            { item: 'salt', amount: '', unit: 'pinch' }
        ],
        instructions: [
            "Make the Ballard Special Croutons: Heat a skillet over medium heat and add a drizzle of olive oil. Add bread cubes and a pinch of salt. Toast, stirring occasionally, until golden and crisp all around (about 5–7 minutes). Set aside to cool.",
            "Combine the salad: In a large bowl, add chopped iceberg lettuce, cucumber, corn, purple onion, and diced avocado. Sprinkle Parmesan over the top.",
            "Make the dressing: In a small bowl, whisk together minced garlic, lemon juice (and zest if using), olive oil, white vinegar, oregano, salt, and pepper until emulsified. Taste and adjust seasoning — you want it bright and balanced.",
            "Toss and serve: Pour the dressing over the salad and gently toss to combine. Add the Ballard Special croutons just before serving so they stay crunchy.",
            "Finish with an extra crack of black pepper and more Parmesan if you like."
        ],
        upgrades: [
            "Pair with grilled chicken or steak to make it a main course.",
            "Croutons can be made ahead and stored airtight for up to a day.",
            "Extra acid? Add a little more lemon juice for lift."
        ]
    }
];

window.RECIPES_DATA = RAW_RECIPES;

