"""
Expansion seed list v3 — ~130 new foods.
Targets:
  - v2 dairy/fruit missing (UNIQUE constraint casualties)
  - Starchy vegetables (corn, yam, plantain, cassava)
  - Bread & wrap staples (pita, tortilla, naan, bagel, white pasta)
  - More proteins (bacon, ham, seitan, edamame, smoked salmon, canned chicken)
  - More condiments & sauces (hummus, dijon, mayo, ranch ref, ACV, more)
  - More dairy (whole milk, swiss, gouda, parmesan, mozzarella, ricotta, butter)
  - More beverages (oat milk, green tea, matcha brewed, protein shake)
  - More nuts (hazelnuts, pine nuts, coconut flakes)
  - More herbs/spices (chili powder, cardamom, garlic fresh, onion powder)
  - More fruits (blackberries, watermelon, cantaloupe, grapefruit, nectarine, grapes, prunes)
  - More vegetables (corn, leek, scallion, bean sprouts, tomatillo, maitake)

Run via: python enrich.py --seed-v3
"""

SEED_FOODS_V3 = [

    # ─────────────────────────────────────────────────────────────────────────
    # DAIRY — v2 casualties + new entries
    # ─────────────────────────────────────────────────────────────────────────
    ("milk, whole, 3.25% milkfat",          "Whole Milk",               "dairy",  "milk",        ["calcium", "vitamin_d", "complete"]),
    ("cheese, swiss",                        "Swiss Cheese",             "dairy",  "hard_cheese", ["calcium", "b12", "protein"]),
    ("cheese, gouda",                        "Gouda",                    "dairy",  "hard_cheese", ["calcium", "vitamin_k2", "protein"]),
    ("cheese, parmesan, grated",             "Parmesan",                 "dairy",  "hard_cheese", ["calcium", "high_protein", "umami"]),
    ("cheese, mozzarella, whole milk",       "Mozzarella (Whole Milk)",  "dairy",  "soft_cheese", ["calcium", "protein"]),
    ("cheese, ricotta, part skim milk",      "Ricotta (Part Skim)",      "dairy",  "soft_cheese", ["calcium", "protein"]),
    ("butter, salted",                       "Butter",                   "dairy",  "fat",         ["vitamin_k2", "butyrate", "healthy_fat"]),
    ("cheese, brie",                         "Brie",                     "dairy",  "soft_cheese", ["fat", "calcium", "fermented"]),
    ("cheese, camembert",                    "Camembert",                "dairy",  "soft_cheese", ["calcium", "probiotic", "vitamin_k2"]),
    ("cream, sour, cultured",                "Sour Cream",               "dairy",  "fermented",   ["fat", "calcium", "probiotic"]),
    ("milk, lowfat, fluid, 1% milkfat",      "1% Milk",                  "dairy",  "milk",        ["calcium", "vitamin_d", "lean"]),
    ("yogurt, greek, plain, lowfat",         "Greek Yogurt (2%)",        "dairy",  "yogurt",      ["protein", "calcium", "probiotic"]),
    ("cheese, provolone",                    "Provolone",                "dairy",  "hard_cheese", ["calcium", "protein", "italian"]),
    ("cheese, pepper jack",                  "Pepper Jack",              "dairy",  "hard_cheese", ["calcium", "protein", "spicy"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FRUIT — v2 casualties + new
    # ─────────────────────────────────────────────────────────────────────────
    ("blackberries, raw",                    "Blackberries",             "fruit",  "berry",       ["fiber", "antioxidants", "low_gi"]),
    ("watermelon, raw",                      "Watermelon",               "fruit",  "melon",       ["lycopene", "citrulline", "hydration"]),
    ("cantaloupe, raw",                      "Cantaloupe",               "fruit",  "melon",       ["beta_carotene", "vitamin_c", "potassium"]),
    ("grapefruit, raw, pink and red",        "Grapefruit",               "fruit",  "citrus",      ["naringenin", "low_gi", "vitamin_c"]),
    ("nectarines, raw",                      "Nectarine",                "fruit",  "stone",       ["vitamin_c", "beta_carotene"]),
    ("grapes, red or green, raw",            "Grapes",                   "fruit",  "other",       ["resveratrol", "antioxidants", "natural_sugar"]),
    ("prunes, dried",                        "Prunes (Dried Plums)",     "fruit",  "dried",       ["sorbitol", "potassium", "iron", "bone_health"]),
    ("raisins, seedless",                    "Raisins",                  "fruit",  "dried",       ["iron", "potassium", "concentrated_sugar"]),
    ("figs, raw",                            "Fresh Figs",               "fruit",  "other",       ["fiber", "calcium", "potassium"]),
    ("dragon fruit, raw",                    "Dragon Fruit",             "fruit",  "tropical",    ["vitamin_c", "fiber", "low_cal"]),
    ("jackfruit, raw",                       "Jackfruit",                "fruit",  "tropical",    ["fiber", "potassium", "complex_carb", "meat_sub"]),
    ("lychee, raw",                          "Lychee",                   "fruit",  "tropical",    ["vitamin_c", "antioxidants", "low_cal"]),
    ("currants, red and white, raw",         "Red Currants",             "fruit",  "berry",       ["vitamin_c", "antioxidants", "fiber"]),
    ("gooseberries, raw",                    "Gooseberries",             "fruit",  "berry",       ["vitamin_c", "fiber", "low_cal"]),

    # ─────────────────────────────────────────────────────────────────────────
    # VEGETABLE — starchy, plus common missing items
    # ─────────────────────────────────────────────────────────────────────────
    ("corn, sweet, yellow, raw",             "Sweet Corn",               "vegetable", "starchy",  ["complex_carb", "fiber", "lutein"]),
    ("yam, raw",                             "Yam",                      "vegetable", "starchy",  ["potassium", "complex_carb", "vitamin_c"]),
    ("plantains, raw",                       "Plantain",                 "vegetable", "starchy",  ["potassium", "vitamin_a", "complex_carb"]),
    ("cassava, raw",                         "Cassava (Yuca)",           "vegetable", "starchy",  ["complex_carb", "resistant_starch"]),
    ("leeks, bulb and lower-leaf, raw",      "Leek",                     "vegetable", "allium",   ["prebiotic", "folate", "kaempferol"]),
    ("onions, spring or scallions, raw",     "Scallions (Green Onions)", "vegetable", "allium",   ["vitamin_k", "low_cal", "prebiotic"]),
    ("bean sprouts, mung, raw",              "Bean Sprouts (Mung)",      "vegetable", "sprout",   ["low_cal", "protein", "vitamin_c"]),
    ("tomatillos, raw",                      "Tomatillo",                "vegetable", "fruit_veg",["vitamin_c", "low_cal", "salsa_verde"]),
    ("mushrooms, maitake, raw",              "Maitake Mushroom",         "vegetable", "fungi",    ["beta_glucan", "immune_support", "vitamin_d"]),
    ("mushrooms, lion's mane, raw",          "Lion's Mane Mushroom",     "vegetable", "fungi",    ["ngf", "cognitive", "immune_support"]),
    ("iceberg lettuce, raw",                 "Iceberg Lettuce",          "vegetable", "leafy_green",["hydration", "very_low_cal", "reference"]),
    ("peppers, hot chili, red, raw",         "Red Chili Pepper",         "vegetable", "pepper",   ["capsaicin", "vitamin_c", "metabolism"]),
    ("peppers, banana, raw",                 "Banana Pepper",            "vegetable", "pepper",   ["vitamin_c", "low_cal"]),
    ("artichoke hearts, canned",             "Artichoke Hearts (Canned)","vegetable", "other",    ["fiber", "prebiotic", "cynarin"]),
    ("rutabaga, raw",                        "Rutabaga",                 "vegetable", "root",     ["vitamin_c", "fiber", "low_cal"]),
    ("napa cabbage, raw",                    "Napa Cabbage",             "vegetable", "cruciferous",["vitamin_k", "low_cal", "probiotics"]),

    # ─────────────────────────────────────────────────────────────────────────
    # GRAIN — breads, wraps, pasta reference
    # ─────────────────────────────────────────────────────────────────────────
    ("bread, pita, white",                   "Pita Bread (White)",       "grain",  "bread",       ["complex_carb", "low_fat"]),
    ("tortillas, ready-to-bake-fry, corn",   "Corn Tortilla",            "grain",  "wrap",        ["gluten_free", "low_cal", "complex_carb"]),
    ("tortillas, ready-to-bake-fry, flour",  "Flour Tortilla",           "grain",  "wrap",        ["complex_carb"]),
    ("bread, naan, commercial",              "Naan Bread",               "grain",  "bread",       ["complex_carb", "iron"]),
    ("bagels, plain",                        "Plain Bagel",              "grain",  "bread",       ["complex_carb", "reference"]),
    ("pasta, dry, enriched",                 "White Pasta (Dry)",        "grain",  "pasta",       ["complex_carb", "reference"]),
    ("crackers, whole wheat",                "Whole Wheat Crackers",     "grain",  "cracker",     ["fiber", "whole_grain", "snack"]),
    ("cream of wheat, regular, dry",         "Cream of Wheat",           "grain",  "cereal",      ["iron", "complex_carb", "quick_cook"]),
    ("waffles, plain, ready-to-heat",        "Waffle (Plain)",           "grain",  "breakfast",   ["reference", "complex_carb"]),

    # ─────────────────────────────────────────────────────────────────────────
    # PROTEIN — more cuts + prepared
    # ─────────────────────────────────────────────────────────────────────────
    ("bacon, pork, cured, raw",              "Bacon (Raw)",              "protein", "pork",       ["fat", "sodium", "b_vitamins", "reference"]),
    ("pork, ham, sliced, regular, roasted",  "Ham (Sliced)",             "protein", "pork",       ["lean", "b_vitamins", "high_sodium"]),
    ("chicken, thigh, meat only, raw",       "Chicken Thigh (Boneless)", "protein", "poultry",    ["complete_protein", "iron", "higher_fat"]),
    ("chicken, wing, meat only, raw",        "Chicken Wings",            "protein", "poultry",    ["complete_protein", "skin_fat"]),
    ("chicken, canned, no broth",            "Canned Chicken",           "protein", "poultry",    ["convenient_protein", "lean"]),
    ("salmon, pink, canned, drained solids, without salt",
                                             "Canned Salmon",            "protein", "fish",       ["omega3", "calcium", "convenient_protein"]),
    ("fish, salmon, Atlantic, smoked",       "Smoked Salmon",            "protein", "fish",       ["omega3", "protein", "sodium"]),
    ("fish, catfish, channel, farmed, raw",  "Catfish",                  "protein", "fish",       ["lean", "b_vitamins", "complete_protein"]),
    ("fish, bass, striped, raw",             "Striped Bass",             "protein", "fish",       ["omega3", "lean", "complete_protein"]),
    ("vital wheat gluten",                   "Seitan (Wheat Gluten)",    "protein", "plant",      ["very_high_protein", "low_carb", "vegan"]),
    ("soybeans, edamame, frozen, prepared",  "Edamame",                  "protein", "plant",      ["complete_protein", "isoflavones", "fiber"]),
    ("pork, ground, raw",                    "Ground Pork",              "protein", "pork",       ["complete_protein", "b_vitamins", "fat"]),
    ("pork, belly, raw",                     "Pork Belly",               "protein", "pork",       ["fat", "protein", "b_vitamins"]),
    ("beef, brisket, whole, raw",            "Beef Brisket",             "protein", "beef",       ["collagen", "complete_protein", "iron"]),
    ("beef jerky, chopped and formed",       "Beef Jerky",               "protein", "beef",       ["portable_protein", "high_sodium", "high_protein"]),
    ("lamb, shoulder, whole, raw",           "Lamb Shoulder",            "protein", "lamb",       ["complete_protein", "iron", "zinc"]),
    ("fish, tuna, light, canned in oil, drained",
                                             "Canned Tuna (Oil)",        "protein", "fish",       ["omega3", "protein", "higher_cal"]),
    ("fish, anchovy, european, canned in oil, drained solids",
                                             "Anchovies (Canned in Oil)", "protein", "fish",     ["omega3", "calcium", "umami"]),

    # ─────────────────────────────────────────────────────────────────────────
    # CONDIMENT — hummus, mustard, mayo, dressings, cooking sauces
    # ─────────────────────────────────────────────────────────────────="────
    ("hummus, commercial",                   "Hummus",                   "condiment", "spread",  ["protein", "fiber", "healthy_fat", "prebiotic"]),
    ("mustard, prepared, yellow",            "Yellow Mustard",           "condiment", "sauce",   ["very_low_cal", "no_sugar", "turmeric"]),
    ("mustard, prepared, yellow, brown",     "Dijon Mustard",            "condiment", "sauce",   ["low_cal", "no_sugar"]),
    ("mayonnaise, regular",                  "Mayonnaise",               "condiment", "spread",  ["fat", "omega6", "reference"]),
    ("salad dressing, ranch dressing",       "Ranch Dressing",           "condiment", "dressing",["fat", "sodium", "reference"]),
    ("catsup",                               "Ketchup",                  "condiment", "sauce",   ["lycopene", "sugar", "reference"]),
    ("sauce, barbecue",                      "Barbecue Sauce",           "condiment", "sauce",   ["sugar", "sodium", "reference"]),
    ("vinegar, cider",                       "Apple Cider Vinegar",      "condiment", "vinegar", ["acetic_acid", "blood_sugar", "low_cal"]),
    ("salsa, ready-to-serve",                "Fresh Salsa (Jar)",        "condiment", "sauce",   ["lycopene", "vitamin_c", "low_cal"]),
    ("sauce, teriyaki, ready-to-serve",      "Teriyaki Sauce",           "condiment", "sauce",   ["sodium", "sugar", "umami"]),
    ("soy sauce, reduced sodium",            "Soy Sauce (Low Sodium)",   "condiment", "sauce",   ["umami", "lower_sodium"]),
    ("lime juice, raw",                      "Lime Juice",               "condiment", "juice",   ["vitamin_c", "low_cal", "alkalizing"]),
    ("lemon juice, raw",                     "Lemon Juice",              "condiment", "juice",   ["vitamin_c", "alkalizing", "low_cal"]),

    # ─────────────────────────────────────────────────────────────────────────
    # BEVERAGE — oat milk, green tea, matcha, protein shake ref
    # ─────────────────────────────────────────────────────────────────────────
    ("beverages, tea, green, brewed",        "Green Tea",                "beverage", "tea",      ["egcg", "antioxidant", "low_cal"]),
    ("beverages, tea, green, instant, decaf","Matcha (Brewed)",          "beverage", "tea",      ["egcg", "l_theanine", "antioxidant"]),
    ("milk, oat, not fortified",             "Oat Milk",                 "beverage", "plant_milk",["beta_glucan", "dairy_free"]),
    ("beverages, orange juice, raw",         "Orange Juice (Fresh)",     "beverage", "juice",    ["vitamin_c", "potassium", "folate"]),
    ("beverages, coconut milk, sweetened",   "Coconut Milk (Canned)",    "beverage", "other",    ["mct", "fat", "cooking_staple"]),
    ("sports drink, ready-to-drink",         "Sports Drink (Ref)",       "beverage", "other",    ["electrolytes", "sugar", "reference"]),

    # ─────────────────────────────────────────────────────────────────────────
    # NUTS & SEEDS — hazelnuts, pine nuts, coconut flakes
    # ─────────────────────────────────────────────────────────────────────────
    ("nuts, hazelnuts or filberts",          "Hazelnuts",                "nuts_seeds", "nut",    ["vitamin_e", "monounsaturated", "folate"]),
    ("nuts, pine nuts, dried",               "Pine Nuts",                "nuts_seeds", "nut",    ["pinolenic_acid", "magnesium", "zinc"]),
    ("nuts, coconut meat, dried, not sweetened",
                                             "Unsweetened Coconut Flakes","nuts_seeds", "seed",  ["mct", "fiber", "manganese"]),
    ("seeds, safflower seed kernels, dried", "Safflower Seeds",          "nuts_seeds", "seed",   ["vitamin_e", "omega6", "healthy_fat"]),

    # ─────────────────────────────────────────────────────────────────────────
    # HERBS & SPICES — more common staples
    # ─────────────────────────────────────────────────────────────────────────
    ("spices, chili powder",                 "Chili Powder",             "herbs_spices", "spice",["capsaicin", "iron", "vitamin_a"]),
    ("spices, cardamom",                     "Cardamom",                 "herbs_spices", "spice",["antioxidant", "digestion", "antimicrobial"]),
    ("spices, onion powder",                 "Onion Powder",             "herbs_spices", "spice",["quercetin", "allicin", "low_cal"]),
    ("spices, garlic powder",                "Garlic Powder",            "herbs_spices", "spice",["allicin", "anti_inflammatory", "cardiovascular"]),
    ("spices, cloves, ground",               "Ground Cloves",            "herbs_spices", "spice",["eugenol", "antioxidant", "anti_inflammatory"]),
    ("spices, nutmeg, ground",               "Ground Nutmeg",            "herbs_spices", "spice",["myristica", "digestion", "anti_inflammatory"]),
    ("spices, fenugreek seed",               "Fenugreek",                "herbs_spices", "spice",["fiber", "testosterone", "blood_sugar"]),
    ("spices, coriander seed",               "Coriander (Ground)",       "herbs_spices", "spice",["fiber", "antioxidant", "digestion"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FAT — walnut oil, sunflower, MCT, beef tallow  (v2 casualties)
    # ─────────────────────────────────────────────────────────────────────────
    ("oil, walnut",                          "Walnut Oil",               "fat", "oil",           ["omega3", "antioxidants", "finishing_oil"]),
    ("oil, sunflower, high oleic, 70% and over",
                                             "Sunflower Oil (High Oleic)","fat","oil",           ["monounsaturated", "high_smoke_point"]),
    ("oil, MCT",                             "MCT Oil",                  "fat", "oil",           ["ketones", "fat_burning", "brain_fuel"]),
    ("beef tallow",                          "Beef Tallow",              "fat", "animal_fat",    ["fat_soluble_vitamins", "high_smoke_point"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FERMENTED — kefir, camembert recovery, tempeh alternate
    # ─────────────────────────────────────────────────────────────────────────
    ("kefir, lowfat, plain",                 "Kefir",                    "fermented", "dairy",   ["probiotics", "calcium", "gut_health"]),
    ("cheese, camembert",                    "Camembert",                "fermented", "dairy",   ["vitamin_k2", "probiotics", "calcium"]),

    # ─────────────────────────────────────────────────────────────────────────
    # SUPERFOOD — acai, spirulina (check), chlorella re-attempt, moringa
    # ─────────────────────────────────────────────────────────────────────────
    ("acai juice, unsweetened",              "Acai (Juice)",             "superfood", "berry",   ["anthocyanins", "antioxidant", "omega9"]),
    ("seaweed, spirulina, dried",            "Spirulina (Dried)",        "superfood", "algae",   ["complete_protein", "iron", "b12", "antioxidants"]),
]

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS_V3:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total v3 foods: {len(SEED_FOODS_V3)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat:<20} {count}")
