"""
Seed food list — 120+ foods across 7 categories optimized for:
  - Body recomp / fat loss
  - Mid-40s micronutrient needs (bone, hormone, cardiovascular, cognitive health)
  - Real-world meal building

Format: (name_for_usda_search, display_name, category, subcategory, tags)
"""

SEED_FOODS = [

    # ─────────────────────────────────────────────────────────────────────────
    # LEAN PROTEINS
    # ─────────────────────────────────────────────────────────────────────────
    ("chicken breast, raw",             "Chicken Breast",           "protein", "poultry",    ["lean", "complete_protein", "high_protein"]),
    ("chicken thigh, raw",              "Chicken Thigh",            "protein", "poultry",    ["moderate_fat", "complete_protein"]),
    ("turkey breast, raw",              "Turkey Breast",            "protein", "poultry",    ["lean", "complete_protein"]),
    ("ground turkey, 93 percent lean",  "Ground Turkey (93/7)",     "protein", "poultry",    ["lean", "versatile"]),
    ("salmon, Atlantic, raw",           "Salmon (Atlantic)",        "protein", "fish",        ["omega3", "anti_inflammatory", "complete_protein"]),
    ("tuna, light, canned in water",    "Canned Tuna (Water)",      "protein", "fish",        ["lean", "high_protein", "omega3"]),
    ("cod, raw",                        "Cod",                      "protein", "fish",        ["lean", "low_cal", "complete_protein"]),
    ("tilapia, raw",                    "Tilapia",                  "protein", "fish",        ["lean", "mild"]),
    ("shrimp, raw",                     "Shrimp",                   "protein", "seafood",     ["lean", "low_cal", "iodine"]),
    ("halibut, raw",                    "Halibut",                  "protein", "fish",        ["lean", "omega3"]),
    ("sardines, canned in oil",         "Sardines (Canned)",        "protein", "fish",        ["omega3", "calcium", "anti_inflammatory"]),
    ("beef, ground, 93 percent lean",   "Ground Beef (93/7)",       "protein", "beef",        ["complete_protein", "iron", "zinc"]),
    ("beef, sirloin steak, raw",        "Sirloin Steak",            "protein", "beef",        ["complete_protein", "iron", "creatine"]),
    ("beef, flank steak, raw",          "Flank Steak",              "protein", "beef",        ["lean", "complete_protein"]),
    ("bison, ground, raw",              "Ground Bison",             "protein", "beef",        ["lean", "complete_protein", "lower_fat_than_beef"]),
    ("pork tenderloin, raw",            "Pork Tenderloin",          "protein", "pork",        ["lean", "complete_protein", "b_vitamins"]),
    ("egg, whole, raw",                 "Whole Egg",                "protein", "eggs",        ["complete_protein", "choline", "vitamin_d"]),
    ("egg white, raw",                  "Egg White",                "protein", "eggs",        ["lean", "complete_protein", "low_cal"]),
    ("greek yogurt, plain, nonfat",     "Greek Yogurt (Nonfat)",    "protein", "dairy",       ["probiotics", "calcium", "high_protein"]),
    ("greek yogurt, plain, whole milk", "Greek Yogurt (Whole)",     "protein", "dairy",       ["probiotics", "calcium", "fat"]),
    ("cottage cheese, lowfat",          "Cottage Cheese (Low Fat)", "protein", "dairy",       ["casein", "high_protein", "calcium"]),
    ("tofu, firm",                      "Tofu (Firm)",              "protein", "plant",       ["complete_protein", "plant_based", "isoflavones"]),
    ("tempeh",                          "Tempeh",                   "protein", "plant",       ["complete_protein", "fermented", "probiotics"]),
    ("edamame",                         "Edamame",                  "protein", "plant",       ["complete_protein", "fiber", "plant_based"]),

    # ─────────────────────────────────────────────────────────────────────────
    # VEGETABLES
    # ─────────────────────────────────────────────────────────────────────────
    ("spinach, raw",                    "Spinach",                  "vegetable", "leafy_green",  ["iron", "folate", "vitamin_k", "anti_inflammatory"]),
    ("kale, raw",                       "Kale",                     "vegetable", "leafy_green",  ["vitamin_k", "calcium", "antioxidants"]),
    ("arugula, raw",                    "Arugula",                  "vegetable", "leafy_green",  ["low_cal", "nitrates", "peppery"]),
    ("romaine lettuce",                 "Romaine Lettuce",          "vegetable", "leafy_green",  ["folate", "vitamin_k", "low_cal"]),
    ("swiss chard, raw",                "Swiss Chard",              "vegetable", "leafy_green",  ["magnesium", "potassium", "anti_inflammatory"]),
    ("broccoli, raw",                   "Broccoli",                 "vegetable", "cruciferous",  ["vitamin_c", "fiber", "sulforaphane", "anti_cancer"]),
    ("cauliflower, raw",                "Cauliflower",              "vegetable", "cruciferous",  ["low_carb", "choline", "versatile"]),
    ("brussels sprouts, raw",           "Brussels Sprouts",         "vegetable", "cruciferous",  ["vitamin_k", "vitamin_c", "fiber"]),
    ("cabbage, raw",                    "Cabbage",                  "vegetable", "cruciferous",  ["low_cal", "vitamin_c", "ferments_well"]),
    ("bok choy, raw",                   "Bok Choy",                 "vegetable", "cruciferous",  ["calcium", "vitamin_c", "low_cal"]),
    ("asparagus, raw",                  "Asparagus",                "vegetable", "stalk",        ["folate", "prebiotic", "low_cal"]),
    ("celery, raw",                     "Celery",                   "vegetable", "stalk",        ["very_low_cal", "sodium_free", "hydration"]),
    ("green beans, raw",                "Green Beans",              "vegetable", "pod",          ["fiber", "vitamin_k", "low_cal"]),
    ("bell pepper, red, raw",           "Red Bell Pepper",          "vegetable", "pepper",       ["vitamin_c", "antioxidants", "low_cal"]),
    ("bell pepper, green, raw",         "Green Bell Pepper",        "vegetable", "pepper",       ["vitamin_c", "low_cal"]),
    ("jalapeno pepper, raw",            "Jalapeño",                 "vegetable", "pepper",       ["capsaicin", "metabolism_boost", "low_cal"]),
    ("cucumber, raw",                   "Cucumber",                 "vegetable", "gourd",        ["hydration", "very_low_cal"]),
    ("zucchini, raw",                   "Zucchini",                 "vegetable", "gourd",        ["low_carb", "low_cal", "versatile"]),
    ("tomato, raw",                     "Tomato",                   "vegetable", "fruit_veg",    ["lycopene", "vitamin_c", "anti_cancer"]),
    ("mushrooms, cremini, raw",         "Cremini Mushrooms",        "vegetable", "fungi",        ["b_vitamins", "selenium", "umami"]),
    ("mushrooms, shiitake, raw",        "Shiitake Mushrooms",       "vegetable", "fungi",        ["immune_support", "b_vitamins", "umami"]),
    ("garlic, raw",                     "Garlic",                   "vegetable", "allium",       ["allicin", "anti_inflammatory", "cardiovascular"]),
    ("onion, raw",                      "Onion",                    "vegetable", "allium",       ["quercetin", "prebiotic", "anti_inflammatory"]),
    ("carrot, raw",                     "Carrot",                   "vegetable", "root",         ["beta_carotene", "fiber", "eye_health"]),
    ("beet, raw",                       "Beet",                     "vegetable", "root",         ["nitrates", "folate", "endurance"]),
    ("sweet potato, raw",               "Sweet Potato",             "vegetable", "root",         ["beta_carotene", "potassium", "fiber", "complex_carb"]),
    ("potato, russet, raw",             "Russet Potato",            "vegetable", "root",         ["potassium", "vitamin_b6", "satiety"]),
    ("artichoke, raw",                  "Artichoke",                "vegetable", "other",        ["prebiotic", "fiber", "liver_health"]),
    ("eggplant, raw",                   "Eggplant",                 "vegetable", "other",        ["anthocyanins", "low_cal", "versatile"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FRUITS
    # ─────────────────────────────────────────────────────────────────────────
    ("blueberries, raw",                "Blueberries",              "fruit", "berry",      ["antioxidants", "brain_health", "low_gi"]),
    ("strawberries, raw",               "Strawberries",             "fruit", "berry",      ["vitamin_c", "low_cal", "anti_inflammatory"]),
    ("raspberries, raw",                "Raspberries",              "fruit", "berry",      ["fiber", "ketones", "low_gi"]),
    ("blackberries, raw",               "Blackberries",             "fruit", "berry",      ["fiber", "antioxidants", "low_gi"]),
    ("cherries, sweet, raw",            "Cherries",                 "fruit", "stone",      ["melatonin", "anti_inflammatory", "antioxidants"]),
    ("apple, raw",                      "Apple",                    "fruit", "pome",       ["fiber", "polyphenols", "satiety"]),
    ("pear, raw",                       "Pear",                     "fruit", "pome",       ["fiber", "copper", "low_gi"]),
    ("banana, raw",                     "Banana",                   "fruit", "tropical",   ["potassium", "b6", "energy", "prebiotic"]),
    ("mango, raw",                      "Mango",                    "fruit", "tropical",   ["vitamin_c", "vitamin_a", "folate"]),
    ("pineapple, raw",                  "Pineapple",                "fruit", "tropical",   ["bromelain", "vitamin_c", "manganese"]),
    ("kiwi, raw",                       "Kiwi",                     "fruit", "tropical",   ["vitamin_c", "vitamin_k", "serotonin"]),
    ("orange, raw",                     "Orange",                   "fruit", "citrus",     ["vitamin_c", "folate", "flavonoids"]),
    ("grapefruit, raw",                 "Grapefruit",               "fruit", "citrus",     ["vitamin_c", "fat_burning", "low_gi"]),
    ("lemon, raw",                      "Lemon",                    "fruit", "citrus",     ["vitamin_c", "alkalizing", "flavonoids"]),
    ("avocado, raw",                    "Avocado",                  "fruit", "fatty_fruit", ["healthy_fat", "potassium", "folate", "fiber"]),
    ("pomegranate, raw",                "Pomegranate",              "fruit", "other",       ["punicalagins", "anti_inflammatory", "cardiovascular"]),
    ("watermelon, raw",                 "Watermelon",               "fruit", "melon",       ["lycopene", "citrulline", "hydration"]),

    # ─────────────────────────────────────────────────────────────────────────
    # WHOLE GRAINS & COMPLEX CARBS
    # ─────────────────────────────────────────────────────────────────────────
    ("oats, rolled, dry",               "Rolled Oats",              "grain", "oats",       ["beta_glucan", "fiber", "slow_release"]),
    ("brown rice, dry",                 "Brown Rice",               "grain", "rice",       ["complex_carb", "manganese", "whole_grain"]),
    ("quinoa, dry",                     "Quinoa",                   "grain", "pseudograin", ["complete_protein", "fiber", "gluten_free"]),
    ("farro, dry",                      "Farro",                    "grain", "ancient",    ["fiber", "protein", "magnesium"]),
    ("barley, pearl, dry",              "Pearl Barley",             "grain", "ancient",    ["beta_glucan", "fiber", "cholesterol_lowering"]),
    ("whole wheat bread",               "Whole Wheat Bread",        "grain", "bread",      ["fiber", "whole_grain", "b_vitamins"]),
    ("whole wheat pasta, dry",          "Whole Wheat Pasta",        "grain", "pasta",      ["fiber", "complex_carb", "whole_grain"]),
    ("rice cakes, plain",               "Rice Cakes",               "grain", "snack",      ["low_cal", "gluten_free", "snack"]),
    ("corn tortilla",                   "Corn Tortilla",            "grain", "flatbread",  ["gluten_free", "low_cal"]),
    ("buckwheat groats, dry",           "Buckwheat",                "grain", "pseudograin", ["complete_protein", "rutin", "gluten_free"]),

    # ─────────────────────────────────────────────────────────────────────────
    # LEGUMES
    # ─────────────────────────────────────────────────────────────────────────
    ("lentils, red, dry",               "Red Lentils",              "legume", "lentil",    ["iron", "folate", "fiber", "plant_protein"]),
    ("lentils, green, dry",             "Green Lentils",            "legume", "lentil",    ["iron", "folate", "fiber", "plant_protein"]),
    ("black beans, dry",                "Black Beans",              "legume", "bean",      ["fiber", "antioxidants", "plant_protein"]),
    ("chickpeas, dry",                  "Chickpeas",                "legume", "bean",      ["fiber", "folate", "plant_protein", "versatile"]),
    ("kidney beans, dry",               "Kidney Beans",             "legume", "bean",      ["fiber", "iron", "plant_protein"]),
    ("white beans, navy, dry",          "Navy Beans",               "legume", "bean",      ["fiber", "calcium", "plant_protein"]),
    ("pinto beans, dry",                "Pinto Beans",              "legume", "bean",      ["fiber", "folate", "plant_protein"]),

    # ─────────────────────────────────────────────────────────────────────────
    # NUTS & SEEDS
    # ─────────────────────────────────────────────────────────────────────────
    ("almonds, raw",                    "Almonds",                  "nuts_seeds", "tree_nut",  ["vitamin_e", "magnesium", "healthy_fat"]),
    ("walnuts, raw",                    "Walnuts",                  "nuts_seeds", "tree_nut",  ["omega3", "brain_health", "anti_inflammatory"]),
    ("cashews, raw",                    "Cashews",                  "nuts_seeds", "tree_nut",  ["magnesium", "zinc", "iron"]),
    ("pecans, raw",                     "Pecans",                   "nuts_seeds", "tree_nut",  ["antioxidants", "healthy_fat", "manganese"]),
    ("macadamia nuts, raw",             "Macadamia Nuts",           "nuts_seeds", "tree_nut",  ["monounsaturated_fat", "low_omega6"]),
    ("brazil nuts, raw",                "Brazil Nuts",              "nuts_seeds", "tree_nut",  ["selenium", "thyroid_health"]),
    ("pistachio nuts, raw",             "Pistachios",               "nuts_seeds", "tree_nut",  ["protein", "potassium", "eye_health"]),
    ("peanuts, raw",                    "Peanuts",                  "nuts_seeds", "legume_nut", ["protein", "niacin", "resveratrol"]),
    ("pumpkin seeds, raw",              "Pumpkin Seeds",            "nuts_seeds", "seed",      ["zinc", "magnesium", "tryptophan"]),
    ("sunflower seeds, raw",            "Sunflower Seeds",          "nuts_seeds", "seed",      ["vitamin_e", "selenium", "healthy_fat"]),
    ("chia seeds, raw",                 "Chia Seeds",               "nuts_seeds", "seed",      ["omega3", "fiber", "calcium"]),
    ("flaxseeds, raw",                  "Flaxseeds",                "nuts_seeds", "seed",      ["omega3", "lignans", "fiber"]),
    ("hemp seeds, raw",                 "Hemp Seeds",               "nuts_seeds", "seed",      ["complete_protein", "omega3", "omega6"]),
    ("sesame seeds, raw",               "Sesame Seeds",             "nuts_seeds", "seed",      ["calcium", "zinc", "lignans"]),
    ("peanut butter, natural",          "Peanut Butter (Natural)",  "nuts_seeds", "nut_butter", ["protein", "healthy_fat", "niacin"]),
    ("almond butter",                   "Almond Butter",            "nuts_seeds", "nut_butter", ["vitamin_e", "magnesium", "healthy_fat"]),

    # ─────────────────────────────────────────────────────────────────────────
    # DAIRY
    # ─────────────────────────────────────────────────────────────────────────
    ("milk, whole, 3.25%",              "Whole Milk",               "dairy", "milk",    ["calcium", "vitamin_d", "complete_protein"]),
    ("milk, 2% fat",                    "2% Milk",                  "dairy", "milk",    ["calcium", "vitamin_d", "lower_fat"]),
    ("milk, skim",                      "Skim Milk",                "dairy", "milk",    ["calcium", "vitamin_d", "lean"]),
    ("cheddar cheese",                  "Cheddar Cheese",           "dairy", "hard_cheese", ["calcium", "vitamin_k2", "protein"]),
    ("mozzarella cheese, part skim",    "Mozzarella (Part Skim)",   "dairy", "soft_cheese", ["calcium", "protein", "lower_fat"]),
    ("feta cheese",                     "Feta Cheese",              "dairy", "soft_cheese", ["calcium", "probiotic", "mediterranean"]),
    ("parmesan cheese",                 "Parmesan",                 "dairy", "hard_cheese", ["calcium", "high_protein", "umami"]),
    ("kefir, plain, lowfat",            "Kefir (Low Fat)",          "dairy", "fermented",   ["probiotics", "calcium", "gut_health"]),
    ("butter, salted",                  "Butter",                   "dairy", "fat",          ["vitamin_k2", "butyrate", "fat"]),

    # ─────────────────────────────────────────────────────────────────────────
    # OILS & FATS
    # ─────────────────────────────────────────────────────────────────────────
    ("olive oil",                       "Olive Oil (Extra Virgin)", "fat", "oil",  ["oleic_acid", "polyphenols", "anti_inflammatory"]),
    ("coconut oil",                     "Coconut Oil",              "fat", "oil",  ["mct", "lauric_acid", "saturated"]),
    ("avocado oil",                     "Avocado Oil",              "fat", "oil",  ["monounsaturated", "high_smoke_point"]),

    # ─────────────────────────────────────────────────────────────────────────
    # CONDIMENTS & FLAVOR
    # ─────────────────────────────────────────────────────────────────────────
    ("apple cider vinegar",             "Apple Cider Vinegar",      "condiment", "vinegar",  ["blood_sugar", "gut_health", "acetic_acid"]),
    ("soy sauce",                       "Soy Sauce",                "condiment", "sauce",    ["sodium", "umami", "fermented"]),
    ("hot sauce",                       "Hot Sauce",                "condiment", "sauce",    ["capsaicin", "low_cal", "metabolism"]),
    ("mustard, yellow",                 "Yellow Mustard",           "condiment", "sauce",    ["low_cal", "turmeric"]),
    ("hummus",                          "Hummus",                   "condiment", "spread",   ["fiber", "plant_protein", "healthy_fat"]),
    ("salsa, fresh",                    "Fresh Salsa",              "condiment", "sauce",    ["low_cal", "lycopene", "vitamin_c"]),

    # ─────────────────────────────────────────────────────────────────────────
    # BEVERAGES
    # ─────────────────────────────────────────────────────────────────────────
    ("coffee, brewed",                  "Black Coffee",             "beverage", "coffee",  ["antioxidants", "caffeine", "metabolic"]),
    ("tea, green, brewed",              "Green Tea",                "beverage", "tea",     ["egcg", "antioxidants", "fat_burning"]),
    ("tea, black, brewed",              "Black Tea",                "beverage", "tea",     ["theaflavins", "antioxidants", "caffeine"]),

    # ─────────────────────────────────────────────────────────────────────────
    # SUPPLEMENTS / FUNCTIONAL FOODS
    # ─────────────────────────────────────────────────────────────────────────
    ("whey protein powder",             "Whey Protein Powder",      "supplement", "protein_powder", ["complete_protein", "bcaa", "post_workout"]),
    ("protein powder, pea",             "Pea Protein Powder",       "supplement", "protein_powder", ["plant_based", "hypoallergenic", "iron"]),
    ("creatine monohydrate",            "Creatine Monohydrate",     "supplement", "performance",    ["strength", "muscle", "cognitive"]),
    ("collagen peptides",               "Collagen Peptides",        "supplement", "other",           ["joint_health", "skin", "glycine"]),
]

CATEGORIES = {
    "protein":    "Proteins (Meat, Fish, Eggs, Dairy Protein)",
    "vegetable":  "Vegetables",
    "fruit":      "Fruits",
    "grain":      "Whole Grains & Complex Carbs",
    "legume":     "Legumes",
    "nuts_seeds": "Nuts & Seeds",
    "dairy":      "Dairy",
    "fat":        "Oils & Fats",
    "condiment":  "Condiments & Flavor",
    "beverage":   "Beverages",
    "supplement": "Supplements & Functional Foods",
}

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total seed foods: {len(SEED_FOODS)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat}: {count}")
