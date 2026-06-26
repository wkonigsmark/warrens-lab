"""
Expansion seed list v4 — ~140 new foods.
Targets:
  - Protein: calamari, crawfish, pollock, flounder, sea bass, turkey leg, beef heart,
             pork ribs, Italian sausage, chicken sausage, goat
  - Vegetables: green peas, sun-dried tomatoes, chayote, roasted peppers, lotus root,
                artichoke (fresh), shishito, green onion cooked
  - Fruits: kumquat, pomelo, starfruit, mulberries, goji, boysenberries
  - Grains: soba, rice noodles, orzo, English muffin, oat bran, wheat germ, bran flakes
  - Dairy: goat cheese, paneer, halloumi, manchego, mascarpone, string cheese,
           queso fresco, cottage cheese (4%), American cheese
  - Condiments: hoisin, oyster sauce, ponzu, harissa, gochujang, sambal, caesar dressing,
                peanut sauce, olive tapenade
  - Herbs/Spices: smoked paprika, curry powder, garam masala, dried thyme, allspice,
                  star anise, white pepper, tarragon, marjoram, sumac, za'atar
  - Nuts/Seeds: poppy seeds, sunflower seed butter, coconut butter, watermelon seeds
  - Fats: lard, grapeseed oil, peanut oil, rice bran oil
  - Beverages: espresso, chocolate milk, apple juice, carrot juice, beet juice,
               chicken bone broth, sparkling water, kefir water
  - Legumes: cannellini, great northern, cranberry beans, urad dal, chana dal
  - Superfoods: goji berries, cacao nibs, tiger nuts, baobab, sacha inchi
  - NEW — processed (reference): instant noodles, granola bar, tomato soup, white rice cooked
"""

SEED_FOODS_V4 = [

    # ─────────────────────────────────────────────────────────────────────────
    # PROTEIN — more seafood, more cuts, poultry variety
    # ─────────────────────────────────────────────────────────────────────────
    ("squid, mixed species, raw",                     "Calamari (Squid)",       "protein", "seafood",  ["lean", "taurine", "selenium", "b12"]),
    ("crustaceans, crayfish, mixed species, wild, raw","Crawfish",               "protein", "seafood",  ["lean", "b12", "iron", "low_cal"]),
    ("fish, pollock, alaska, raw",                    "Alaska Pollock",          "protein", "fish",     ["lean", "low_cal", "b12", "white_fish"]),
    ("fish, flounder, summer, raw",                   "Flounder",                "protein", "fish",     ["lean", "b12", "selenium", "white_fish"]),
    ("fish, sea bass, mixed species, raw",             "Sea Bass",                "protein", "fish",     ["omega3", "lean", "selenium"]),
    ("fish, perch, mixed species, raw",               "Perch",                   "protein", "fish",     ["lean", "b12", "phosphorus", "white_fish"]),
    ("fish, tuna, fresh, bluefin, raw",               "Fresh Tuna (Bluefin)",    "protein", "fish",     ["omega3", "b12", "complete_protein", "premium"]),
    ("fish, eel, mixed species, raw",                 "Eel",                     "protein", "fish",     ["omega3", "vitamin_a", "b12", "distinctive"]),
    ("turkey, dark meat, raw",                        "Turkey (Dark Meat)",      "protein", "poultry",  ["iron", "zinc", "complete_protein", "higher_fat"]),
    ("beef, heart, raw",                              "Beef Heart",              "protein", "beef",     ["coq10", "b12", "iron", "zinc", "lean_organ"]),
    ("beef, short loin, t-bone steak, raw",           "T-Bone Steak",            "protein", "beef",     ["complete_protein", "iron", "zinc"]),
    ("beef, ground, 80% lean, raw",                   "Ground Beef (80/20)",     "protein", "beef",     ["complete_protein", "iron", "zinc", "higher_fat"]),
    ("pork, backribs, raw",                           "Pork Ribs (Back)",        "protein", "pork",     ["complete_protein", "zinc", "b_vitamins"]),
    ("pork sausage, link/patty, raw",                 "Pork Sausage",            "protein", "pork",     ["fat", "sodium", "b_vitamins", "complete_protein"]),
    ("chicken, roasting, dark meat, raw",             "Chicken Drumstick",       "protein", "poultry",  ["iron", "zinc", "complete_protein"]),
    ("goat, raw",                                     "Goat Meat",               "protein", "game",     ["lean", "iron", "complete_protein", "low_fat"]),
    ("lamb, domestic, rib, raw",                      "Lamb Rack (Rib)",         "protein", "lamb",     ["complete_protein", "iron", "zinc", "premium"]),
    ("rabbit, wild, raw",                             "Rabbit",                  "protein", "game",     ["very_lean", "complete_protein", "low_fat"]),

    # ─────────────────────────────────────────────────────────────────────────
    # VEGETABLE — green peas, sun-dried, chayote, lotus, artichoke fresh
    # ─────────────────────────────────────────────────────────────────────────
    ("peas, green, raw",                              "Green Peas (Fresh)",      "vegetable", "pod",    ["protein", "fiber", "vitamin_k", "complex_carb"]),
    ("tomatoes, sun-dried",                           "Sun-Dried Tomatoes",      "vegetable", "fruit_veg",["lycopene", "concentrated", "umami", "iron"]),
    ("peppers, sweet, red, canned, solids",           "Roasted Red Peppers",     "vegetable", "pepper", ["vitamin_c", "lycopene", "low_cal"]),
    ("chayote, fruit, raw",                           "Chayote Squash",          "vegetable", "squash", ["low_cal", "vitamin_c", "fiber"]),
    ("lotus root, raw",                               "Lotus Root",              "vegetable", "root",   ["vitamin_c", "fiber", "potassium", "b6"]),
    ("artichokes, raw",                               "Artichoke (Whole)",       "vegetable", "other",  ["cynarin", "prebiotic", "fiber", "folate"]),
    ("peppers, sweet, green, frozen",                 "Shishito / Green Pepper", "vegetable", "pepper", ["vitamin_c", "low_cal", "antioxidants"]),
    ("pepperoni",                                     "Pepperoncini Pepper",     "vegetable", "pepper", ["vitamin_c", "low_cal", "pickled"]),
    ("salsify, raw",                                  "Salsify",                 "vegetable", "root",   ["inulin", "prebiotic", "iron"]),
    ("amaranth leaves, raw",                          "Amaranth Leaves",         "vegetable", "leafy_green",["calcium", "iron", "protein", "vitamin_k"]),
    ("chrysanthemum, garland, raw",                   "Chrysanthemum Greens",    "vegetable", "leafy_green",["calcium", "iron", "low_cal"]),
    ("fiddlehead ferns, raw",                         "Fiddlehead Ferns",        "vegetable", "other",  ["omega3", "iron", "antioxidants", "seasonal"]),
    ("sweet potato leaves, raw",                      "Sweet Potato Greens",     "vegetable", "leafy_green",["protein", "calcium", "iron", "low_cal"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FRUIT — more exotic, dried, berries
    # ─────────────────────────────────────────────────────────────────────────
    ("kumquats, raw",                                 "Kumquat",                 "fruit", "citrus",     ["vitamin_c", "fiber", "eat_whole", "low_cal"]),
    ("pummelo, raw",                                  "Pomelo",                  "fruit", "citrus",     ["vitamin_c", "naringenin", "low_cal"]),
    ("carambola (starfruit), raw",                    "Starfruit",               "fruit", "tropical",   ["vitamin_c", "very_low_cal", "oxalate"]),
    ("mulberries, raw",                               "Mulberries",              "fruit", "berry",      ["anthocyanins", "iron", "resveratrol", "low_cal"]),
    ("boysenberries, frozen, unsweetened",            "Boysenberries",           "fruit", "berry",      ["fiber", "vitamin_c", "anthocyanins"]),
    ("elderberries, raw",                             "Elderberries",            "fruit", "berry",      ["vitamin_c", "antioxidant", "immune_support"]),
    ("sapodilla, raw",                                "Sapodilla",               "fruit", "tropical",   ["fiber", "natural_sugar", "calcium"]),
    ("feijoa, raw",                                   "Feijoa",                  "fruit", "tropical",   ["vitamin_c", "fiber", "iodine"]),
    ("breadfruit, raw",                               "Breadfruit",              "fruit", "tropical",   ["complex_carb", "fiber", "potassium", "vitamin_c"]),

    # ─────────────────────────────────────────────────────────────────────────
    # GRAIN — noodles, oat bran, wheat germ, cereal, English muffin
    # ─────────────────────────────────────────────────────────────────────────
    ("noodles, japanese, soba, dry",                  "Soba Noodles (Dry)",      "grain", "noodle",    ["buckwheat", "protein", "manganese"]),
    ("noodles, chinese, rice, dry",                   "Rice Noodles (Dry)",      "grain", "noodle",    ["gluten_free", "complex_carb", "low_protein"]),
    ("pasta, orzo, dry, unenriched",                  "Orzo (Dry)",              "grain", "pasta",     ["complex_carb", "versatile"]),
    ("english muffins, plain",                        "English Muffin",          "grain", "bread",     ["complex_carb", "moderate_cal", "versatile"]),
    ("oat bran, raw",                                 "Oat Bran",                "grain", "cereal",    ["beta_glucan", "cholesterol", "fiber", "protein"]),
    ("wheat germ, crude",                             "Wheat Germ",              "grain", "cereal",    ["vitamin_e", "folate", "zinc", "fiber"]),
    ("cereals, bran flakes, ready-to-eat",            "Bran Flakes Cereal",      "grain", "cereal",    ["fiber", "iron", "b_vitamins", "reference"]),
    ("crackers, rye, wafers, plain",                  "Rye Crisp Crackers",      "grain", "cracker",   ["fiber", "low_fat", "whole_grain"]),
    ("rice, white, long-grain, cooked",               "White Rice (Cooked)",     "grain", "rice",      ["complex_carb", "cooked_reference"]),
    ("pasta, whole-wheat, dry",                       "Whole Wheat Pasta (Dry)", "grain", "pasta",     ["fiber", "protein", "complex_carb"]),

    # ─────────────────────────────────────────────────────────────────────────
    # DAIRY — goat cheese, paneer, halloumi, manchego, mascarpone, queso
    # ─────────────────────────────────────────────────────────────────────────
    ("cheese, goat, soft type",                       "Goat Cheese (Chèvre)",    "dairy", "soft_cheese",["calcium", "protein", "lower_lactose"]),
    ("cheese, cottage, large or small curd",          "Cottage Cheese (Full Fat)","dairy","soft_cheese",["casein", "calcium", "protein"]),
    ("cheese, mozzarella, string, low moisture",      "String Cheese",           "dairy", "soft_cheese",["calcium", "protein", "portable_snack"]),
    ("cheese, manchego",                              "Manchego",                "dairy", "hard_cheese",["calcium", "protein", "vitamin_k2"]),
    ("cheese, mascarpone",                            "Mascarpone",              "dairy", "soft_cheese",["fat", "calcium", "rich"]),
    ("cheese, queso fresco (queso blanco)",           "Queso Fresco",            "dairy", "soft_cheese",["calcium", "sodium", "lower_fat"]),
    ("cheese, American, pasteurized process",         "American Cheese",         "dairy", "processed",  ["calcium", "sodium", "reference"]),
    ("milk, chocolate, lowfat",                       "Chocolate Milk (Lowfat)", "dairy", "milk",       ["calcium", "protein", "recovery", "reference"]),
    ("yogurt, plain, skim milk",                      "Nonfat Plain Yogurt",     "dairy", "yogurt",     ["protein", "calcium", "probiotic", "low_cal"]),

    # ─────────────────────────────────────────────────────────────────────────
    # CONDIMENT — hoisin, oyster, gochujang, harissa, caesar, ponzu
    # ─────────────────────────────────────────────────────────────────────────
    ("sauce, hoisin, ready-to-serve",                 "Hoisin Sauce",            "condiment", "sauce",  ["sodium", "sugar", "umami", "chinese"]),
    ("sauce, oyster, ready-to-serve",                 "Oyster Sauce",            "condiment", "sauce",  ["sodium", "umami", "iron", "chinese"]),
    ("salad dressing, caesar",                        "Caesar Dressing",         "condiment", "dressing",["fat", "sodium", "umami"]),
    ("salad dressing, italian dressing",              "Italian Dressing",        "condiment", "dressing",["fat", "herbs", "low_cal"]),
    ("sauce, hot, green, jalapeno",                   "Green Hot Sauce",         "condiment", "sauce",  ["capsaicin", "very_low_cal", "vitamin_c"]),
    ("pickle relish, sweet",                          "Sweet Pickle Relish",     "condiment", "sauce",  ["sodium", "sugar", "low_cal"]),
    ("capers, canned",                                "Capers",                  "condiment", "other",  ["quercetin", "low_cal", "umami"]),
    ("olives, ripe, canned, small-extra large",       "Black Olives",            "condiment", "other",  ["monounsaturated", "vitamin_e", "low_cal"]),
    ("olive oil, salad or cooking",                   "Olive Oil (Light)",       "condiment", "oil",    ["monounsaturated", "vitamin_e"]),

    # ─────────────────────────────────────────────────────────────────────────
    # HERBS & SPICES — smoked paprika, curry, garam masala, allspice, more
    # ─────────────────────────────────────────────────────────────────────────
    ("spices, paprika, smoked",                       "Smoked Paprika",          "herbs_spices","spice",["capsanthin", "vitamin_a", "antioxidant"]),
    ("spices, curry powder",                          "Curry Powder",            "herbs_spices","blend",["curcumin", "anti_inflammatory", "iron"]),
    ("spices, allspice, ground",                      "Allspice",                "herbs_spices","spice",["antioxidant", "eugenol", "anti_inflammatory"]),
    ("spices, anise seed",                            "Star Anise",              "herbs_spices","spice",["anethole", "digestion", "anti_bacterial"]),
    ("spices, pepper, white",                         "White Pepper",            "herbs_spices","spice",["piperine", "milder_heat", "antibacterial"]),
    ("spices, tarragon, dried",                       "Dried Tarragon",          "herbs_spices","herb", ["estragole", "digestion", "anti_inflammatory"]),
    ("spices, marjoram, dried",                       "Dried Marjoram",          "herbs_spices","herb", ["antioxidant", "anti_inflammatory"]),
    ("spices, sage, ground",                          "Dried Sage",              "herbs_spices","herb", ["rosmarinic_acid", "cognitive", "anti_inflammatory"]),
    ("spices, thyme, dried",                          "Dried Thyme",             "herbs_spices","herb", ["thymol", "anti_bacterial", "vitamin_k"]),
    ("spices, rosemary, dried",                       "Dried Rosemary",          "herbs_spices","herb", ["carnosic_acid", "anti_inflammatory", "cognitive"]),
    ("spices, bay leaf",                              "Bay Leaf",                "herbs_spices","herb", ["antioxidant", "manganese", "anti_inflammatory"]),

    # ─────────────────────────────────────────────────────────────────────────
    # NUTS & SEEDS — poppy, sunflower seed butter, watermelon seeds
    # ─────────────────────────────────────────────────────────────────────────
    ("seeds, poppy",                                  "Poppy Seeds",             "nuts_seeds", "seed",  ["calcium", "healthy_fat", "zinc", "magnesium"]),
    ("seeds, watermelon seed kernels, dried",         "Watermelon Seeds",        "nuts_seeds", "seed",  ["magnesium", "zinc", "protein", "healthy_fat"]),
    ("nut and seed butters, sunflower seed butter",   "Sunflower Seed Butter",   "nuts_seeds", "butter",["vitamin_e", "healthy_fat", "nut_free"]),
    ("nuts, mixed, dry roasted, with peanuts",        "Mixed Nuts (Dry Roasted)","nuts_seeds", "nut",   ["healthy_fat", "protein", "convenience"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FATS & OILS — lard, grapeseed, peanut, rice bran
    # ─────────────────────────────────────────────────────────────────────────
    ("lard",                                          "Lard",                    "fat", "animal_fat",   ["fat_soluble_vitamins", "high_smoke_point", "traditional"]),
    ("oil, grapeseed",                                "Grapeseed Oil",           "fat", "oil",          ["vitamin_e", "omega6", "high_smoke_point"]),
    ("oil, peanut",                                   "Peanut Oil",              "fat", "oil",          ["monounsaturated", "high_smoke_point", "neutral"]),
    ("oil, rice bran",                                "Rice Bran Oil",           "fat", "oil",          ["gamma_oryzanol", "vitamin_e", "high_smoke_point"]),

    # ─────────────────────────────────────────────────────────────────────────
    # BEVERAGES — espresso, chocolate milk, juices, broth, sparkling water
    # ─────────────────────────────────────────────────────────────────────────
    ("beverages, coffee, espresso, restaurant-prepared","Espresso",              "beverage", "coffee",  ["caffeine", "antioxidant", "very_low_cal"]),
    ("beverages, apple juice, unsweetened",           "Apple Juice",             "beverage", "juice",   ["vitamin_c", "natural_sugar", "reference"]),
    ("juice, carrot",                                 "Carrot Juice",            "beverage", "juice",   ["beta_carotene", "vitamin_a", "potassium"]),
    ("beverages, grape juice, unsweetened",           "Grape Juice",             "beverage", "juice",   ["resveratrol", "antioxidants", "natural_sugar"]),
    ("soup, chicken broth, canned, ready-to-serve",   "Chicken Bone Broth",      "beverage", "broth",   ["collagen", "glycine", "gut_health", "low_cal"]),
    ("water, bottled, generic",                       "Sparkling Water",         "beverage", "water",   ["zero_cal", "hydration", "reference"]),

    # ─────────────────────────────────────────────────────────────────────────
    # LEGUMES — cannellini, great northern, cranberry beans, urad, chana dal
    # ─────────────────────────────────────────────────────────────────────────
    ("beans, white, mature seeds, raw",               "Cannellini Beans",        "legume", "bean",      ["protein", "fiber", "iron", "potassium"]),
    ("beans, great northern, mature seeds, raw",      "Great Northern Beans",    "legume", "bean",      ["protein", "fiber", "iron"]),
    ("beans, cranberry (roman), mature seeds, raw",   "Cranberry Beans",         "legume", "bean",      ["protein", "fiber", "folate"]),
    ("beans, black, mature seeds, raw",               "Urad Dal (Black Gram)",   "legume", "dal",       ["protein", "iron", "calcium", "b1"]),
    ("chickpeas, mature seeds, dry roasted",          "Roasted Chickpeas",       "legume", "snack",     ["protein", "fiber", "crunchy_snack"]),
    ("lentils, pink or red, raw",                     "Red Lentils (Dry)",       "legume", "lentil",    ["protein", "iron", "folate", "quick_cook"]),

    # ─────────────────────────────────────────────────────────────────────────
    # SUPERFOODS — goji berries, cacao nibs, tiger nuts, baobab, sacha inchi
    # ─────────────────────────────────────────────────────────────────────────
    ("goji berries, dried",                           "Goji Berries (Dried)",    "superfood","berry",   ["zeaxanthin", "antioxidant", "immune_support", "vision"]),
    ("cacao, raw, unsweetened",                       "Raw Cacao Nibs",          "superfood","cacao",   ["flavonoids", "magnesium", "iron", "antioxidant"]),
    ("chufa, dried (tigernut)",                       "Tiger Nuts",              "superfood","tuber",   ["prebiotic", "inulin", "magnesium", "vitamin_e"]),
    ("sacha inchi seeds",                             "Sacha Inchi Seeds",       "superfood","seeds",   ["omega3", "complete_protein", "vitamin_e", "antioxidant"]),

    # ─────────────────────────────────────────────────────────────────────────
    # PROCESSED — reference items for real-world meal tracking
    # ─────────────────────────────────────────────────────────────────────────
    ("noodles, instant, dry",                         "Instant Noodles (Dry)",   "grain",  "processed", ["reference", "high_sodium", "refined_carb"]),
    ("snacks, granola bar, soft, uncoated",           "Granola Bar",             "grain",  "snack",     ["oats", "fiber", "reference"]),
    ("soup, tomato, canned, condensed",               "Canned Tomato Soup",      "condiment","soup",    ["lycopene", "reference", "sodium"]),
    ("cake, white, with frosting",                    "White Cake",              "grain",  "dessert",   ["reference", "high_sugar", "refined"]),
    ("ice cream, vanilla",                            "Vanilla Ice Cream",       "dairy",  "dessert",   ["fat", "sugar", "calcium", "reference"]),
]

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS_V4:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total v4 foods: {len(SEED_FOODS_V4)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat:<20} {count}")
