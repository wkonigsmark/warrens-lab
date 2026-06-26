"""
Targeted retry for 36 unenriched v2 foods using correct SR Legacy search terms.
Two items intentionally excluded (not in USDA): Black Seed Oil, Chlorella Powder.
"""

SEED_RETRY = [
    # ── Beverages ─────────────────────────────────────────────────────────────
    ("beverages, water, coconut",                 "Coconut Water",              "beverage",    "other",          ["potassium", "electrolytes", "low_cal", "hydration"]),

    # ── Fats ──────────────────────────────────────────────────────────────────
    ("oil, avocado",                              "Avocado Oil",                "fat",         "oil",            ["monounsaturated", "high_smoke_point", "oleic_acid"]),
    ("oil, flaxseed, cold pressed",               "Flaxseed Oil",               "fat",         "oil",            ["omega3_ala", "anti_inflammatory", "do_not_heat"]),

    # ── Fruits ────────────────────────────────────────────────────────────────
    ("apricots, dried, sulfured, uncooked",       "Dried Apricots",             "fruit",       "dried",          ["iron", "beta_carotene", "potassium", "concentrated"]),
    ("limes, raw",                                "Lime",                       "fruit",       "citrus",         ["vitamin_c", "flavonoids", "low_cal"]),
    ("pomegranate, raw",                          "Pomegranate",                "fruit",       "other",          ["punicalagins", "antioxidant", "inflammation"]),

    # ── Grains ────────────────────────────────────────────────────────────────
    ("couscous, dry",                             "Couscous",                   "grain",       "pasta",          ["quick_cook", "selenium", "complex_carb"]),
    ("bread, whole-wheat, sprouted",              "Ezekiel Sprouted Bread",     "grain",       "bread",          ["complete_protein", "sprouted", "low_gi", "high_fiber"]),
    ("rice, white, medium-grain, raw, enriched",  "Jasmine Rice",               "grain",       "rice",           ["complex_carb", "aromatic"]),
    ("cornmeal, whole-grain, yellow",             "Polenta (Cornmeal)",         "grain",       "corn",           ["complex_carb", "low_fat", "gluten_free"]),
    ("teff, raw",                                 "Teff",                       "grain",       "ancient",        ["iron", "calcium", "complete_protein", "gluten_free"]),

    # ── Legumes ───────────────────────────────────────────────────────────────
    ("adzuki beans, mature seeds, raw",           "Adzuki Beans",               "legume",      "bean",           ["iron", "potassium", "low_fat"]),
    ("cowpeas, common, mature seeds, raw",        "Black-Eyed Peas",            "legume",      "bean",           ["folate", "potassium", "plant_protein"]),
    ("broadbeans (fava beans), mature seeds, raw","Fava Beans (Broad Beans)",   "legume",      "bean",           ["l_dopa", "protein", "folate", "iron"]),
    ("lentils, raw",                              "Green Lentils",              "legume",      "lentil",         ["protein", "iron", "folate", "low_gi"]),
    ("peas, split, mature seeds, raw",            "Green Split Peas",           "legume",      "pea",            ["fiber", "plant_protein", "iron"]),
    ("lima beans, large, mature seeds, raw",      "Lima Beans",                 "legume",      "bean",           ["potassium", "fiber", "plant_protein"]),
    ("peas, yellow, mature seeds, raw",           "Yellow Split Peas",          "legume",      "pea",            ["fiber", "plant_protein", "mild"]),

    # ── Nuts & Seeds ──────────────────────────────────────────────────────────
    ("nuts, brazilnuts, dried, unblanched",       "Brazil Nuts",                "nuts_seeds",  "nut",            ["selenium", "magnesium", "healthy_fat"]),
    ("seeds, hemp seed, hulled",                  "Hemp Seeds",                 "nuts_seeds",  "seed",           ["complete_protein", "omega3", "fiber", "plant_based"]),
    ("seeds, sesame seeds, whole, dried",         "Sesame Seeds",               "nuts_seeds",  "seed",           ["calcium", "copper", "sesamin", "healthy_fat"]),

    # ── Proteins ──────────────────────────────────────────────────────────────
    ("fish, anchovy, european, raw",              "Anchovies (Canned)",         "protein",     "fish",           ["omega3", "calcium", "umami", "anti_inflammatory"]),
    ("duck, domesticated, meat only, raw",        "Duck Breast",                "protein",     "poultry",        ["complete_protein", "iron", "b_vitamins"]),
    ("lamb, domestic, ground, raw",               "Ground Lamb",                "protein",     "lamb",           ["complete_protein", "iron", "higher_fat"]),
    ("fish, mussel, blue, raw",                   "Mussels",                    "protein",     "seafood",        ["omega3", "b12", "iron", "selenium"]),
    ("fish, trout, rainbow, farmed, raw",         "Rainbow Trout",              "protein",     "fish",           ["omega3", "b_vitamins", "lean"]),
    ("game meat, deer, raw",                      "Venison (Deer)",             "protein",     "game",           ["lean", "iron", "complete_protein", "low_fat"]),

    # ── Vegetables ────────────────────────────────────────────────────────────
    ("chicory, witloof, raw",                     "Belgian Endive",             "vegetable",   "leafy_green",    ["folate", "low_cal", "bitter"]),
    ("dandelion greens, raw",                     "Dandelion Greens",           "vegetable",   "leafy_green",    ["calcium", "iron", "prebiotic", "liver_health"]),
    ("horseradish, prepared",                     "Horseradish",                "vegetable",   "cruciferous",    ["glucosinolates", "anti_inflammatory", "anti_bacterial"]),
    ("mustard greens, raw",                       "Mustard Greens",             "vegetable",   "leafy_green",    ["vitamin_k", "vitamin_c", "glucosinolates"]),
    ("mushrooms, oyster, raw",                    "Oyster Mushroom",            "vegetable",   "fungi",          ["beta_glucan", "immune_support", "b_vitamins"]),
    ("mushrooms, portabella, raw",                "Portobello Mushroom",        "vegetable",   "fungi",          ["b_vitamins", "selenium", "umami", "meaty"]),
    ("pumpkin, raw",                              "Pumpkin",                    "vegetable",   "squash",         ["beta_carotene", "potassium", "low_cal"]),
    ("peas, edible-podded, raw",                  "Snap Peas",                  "vegetable",   "pod",            ["fiber", "vitamin_c", "low_cal"]),
    ("watercress, raw",                           "Watercress",                 "vegetable",   "leafy_green",    ["vitamin_k", "nitrates", "anti_cancer", "very_low_cal"]),
]
