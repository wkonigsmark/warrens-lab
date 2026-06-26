"""
Expansion seed list — ~200 new foods to bring the database from ~118 to ~300+.
Adds depth to all existing categories + 3 new categories:
  - herbs_spices
  - fermented
  - superfood

Run via:  python enrich.py --seed-v2
"""

SEED_FOODS_V2 = [

    # ─────────────────────────────────────────────────────────────────────────
    # PROTEIN — more fish, seafood, meats, cuts, dairy proteins
    # ─────────────────────────────────────────────────────────────────────────

    # Fish & Seafood
    ("mackerel, Atlantic, raw",             "Mackerel (Atlantic)",      "protein", "fish",     ["omega3", "vitamin_d", "selenium", "fatty_fish"]),
    ("herring, Atlantic, raw",              "Herring (Atlantic)",       "protein", "fish",     ["omega3", "vitamin_d", "cheap_protein"]),
    ("trout, rainbow, farmed, raw",         "Rainbow Trout",            "protein", "fish",     ["omega3", "b_vitamins", "lean"]),
    ("mahi mahi, raw",                      "Mahi-Mahi",                "protein", "fish",     ["lean", "mild", "high_protein"]),
    ("swordfish, raw",                      "Swordfish",                "protein", "fish",     ["omega3", "selenium", "meaty"]),
    ("anchovies, canned in oil",            "Anchovies (Canned)",       "protein", "fish",     ["omega3", "calcium", "umami", "anti_inflammatory"]),
    ("salmon, sockeye, raw",                "Salmon (Sockeye/Wild)",    "protein", "fish",     ["omega3", "astaxanthin", "wild_caught"]),
    ("clams, raw",                          "Clams",                    "protein", "seafood",  ["iron", "b12", "zinc", "iodine"]),
    ("scallops, raw",                       "Sea Scallops",             "protein", "seafood",  ["lean", "low_cal", "b12"]),
    ("oysters, raw",                        "Oysters",                  "protein", "seafood",  ["zinc", "b12", "iron", "immune_support"]),
    ("mussels, raw",                        "Mussels",                  "protein", "seafood",  ["omega3", "b12", "iron", "selenium"]),
    ("crab, dungeness, raw",                "Dungeness Crab",           "protein", "seafood",  ["lean", "zinc", "b12", "low_cal"]),
    ("lobster, raw",                        "Lobster",                  "protein", "seafood",  ["lean", "copper", "selenium"]),
    ("octopus, raw",                        "Octopus",                  "protein", "seafood",  ["lean", "iron", "taurine"]),

    # Beef cuts
    ("beef, ribeye steak, raw",             "Ribeye Steak",             "protein", "beef",     ["complete_protein", "iron", "zinc", "creatine", "higher_fat"]),
    ("beef, liver, raw",                    "Beef Liver",               "protein", "beef",     ["vitamin_a", "b12", "folate", "iron", "copper", "superfood"]),
    ("beef, strip steak, raw",              "New York Strip",           "protein", "beef",     ["complete_protein", "iron", "zinc"]),
    ("beef jerky",                          "Beef Jerky",               "protein", "beef",     ["portable_protein", "high_sodium", "high_protein"]),

    # Pork
    ("pork, loin chop, raw",                "Pork Loin Chop",           "protein", "pork",     ["lean", "b_vitamins", "complete_protein"]),
    ("bacon, cured",                        "Bacon",                    "protein", "pork",     ["fat", "sodium", "b_vitamins", "reference"]),
    ("ham, sliced, lean",                   "Ham (Sliced)",             "protein", "pork",     ["lean", "b_vitamins", "high_sodium"]),
    ("pork sausage, Italian",               "Italian Sausage",          "protein", "pork",     ["higher_fat", "sodium", "reference"]),

    # Lamb & Game
    ("lamb, chop, raw",                     "Lamb Chop",                "protein", "lamb",     ["complete_protein", "iron", "zinc", "b12"]),
    ("lamb, ground, raw",                   "Ground Lamb",              "protein", "lamb",     ["complete_protein", "iron", "higher_fat"]),
    ("venison, raw",                        "Venison (Deer)",           "protein", "game",     ["lean", "iron", "complete_protein", "low_fat"]),
    ("duck breast, raw",                    "Duck Breast",              "protein", "poultry",  ["complete_protein", "iron", "b_vitamins"]),
    ("chicken liver, raw",                  "Chicken Liver",            "protein", "poultry",  ["b12", "folate", "iron", "vitamin_a", "superfood"]),

    # Dairy proteins
    ("cheese, ricotta, part skim",          "Ricotta (Part Skim)",      "protein", "dairy",    ["calcium", "protein", "versatile"]),
    ("skyr, plain",                         "Skyr (Icelandic Yogurt)",  "protein", "dairy",    ["high_protein", "calcium", "low_fat", "casein"]),
    ("cheese, cottage, 2% milkfat",         "Cottage Cheese (2%)",      "protein", "dairy",    ["casein", "calcium", "moderate_fat"]),

    # ─────────────────────────────────────────────────────────────────────────
    # VEGETABLES — squash, more leafy, sea veg, alliums, fungi, root
    # ─────────────────────────────────────────────────────────────────────────

    # Leafy Greens
    ("watercress, raw",                     "Watercress",               "vegetable", "leafy_green",  ["vitamin_k", "nitrates", "anti_cancer", "very_low_cal"]),
    ("collard greens, raw",                 "Collard Greens",           "vegetable", "leafy_green",  ["calcium", "vitamin_k", "folate"]),
    ("mustard greens, raw",                 "Mustard Greens",           "vegetable", "leafy_green",  ["vitamin_k", "vitamin_c", "glucosinolates"]),
    ("endive, raw",                         "Belgian Endive",           "vegetable", "leafy_green",  ["folate", "low_cal", "bitter"]),
    ("radicchio, raw",                      "Radicchio",                "vegetable", "leafy_green",  ["inulin", "antioxidants", "bitter"]),
    ("beet greens, raw",                    "Beet Greens",              "vegetable", "leafy_green",  ["potassium", "magnesium", "vitamin_k", "low_waste"]),
    ("broccoli rabe, raw",                  "Broccoli Rabe (Rapini)",   "vegetable", "leafy_green",  ["iron", "calcium", "glucosinolates", "bitter"]),
    ("dandelion greens, raw",               "Dandelion Greens",         "vegetable", "leafy_green",  ["calcium", "iron", "prebiotic", "liver_health"]),

    # Cruciferous additions
    ("kohlrabi, raw",                       "Kohlrabi",                 "vegetable", "cruciferous",  ["vitamin_c", "low_cal", "potassium"]),
    ("radish, raw",                         "Radish",                   "vegetable", "cruciferous",  ["very_low_cal", "vitamin_c", "digestive"]),
    ("turnip, raw",                         "Turnip",                   "vegetable", "cruciferous",  ["low_cal", "vitamin_c", "fiber"]),
    ("horseradish, raw",                    "Horseradish",              "vegetable", "cruciferous",  ["glucosinolates", "anti_inflammatory", "anti_bacterial"]),

    # Alliums
    ("leeks, raw",                          "Leeks",                    "vegetable", "allium",       ["prebiotic", "folate", "kaempferol"]),
    ("shallots, raw",                       "Shallots",                 "vegetable", "allium",       ["quercetin", "allicin", "anti_inflammatory"]),
    ("green onions, raw",                   "Green Onions (Scallions)", "vegetable", "allium",       ["vitamin_k", "low_cal", "prebiotic"]),

    # Squash
    ("squash, butternut, raw",              "Butternut Squash",         "vegetable", "squash",       ["beta_carotene", "potassium", "fiber"]),
    ("squash, acorn, raw",                  "Acorn Squash",             "vegetable", "squash",       ["potassium", "vitamin_c", "fiber", "complex_carb"]),
    ("squash, spaghetti, raw",              "Spaghetti Squash",         "vegetable", "squash",       ["low_cal", "low_carb", "pasta_sub"]),
    ("pumpkin, raw",                        "Pumpkin",                  "vegetable", "squash",       ["beta_carotene", "potassium", "low_cal"]),
    ("zucchini, yellow, raw",               "Yellow Squash",            "vegetable", "squash",       ["low_cal", "manganese", "low_carb"]),

    # Other veg
    ("snap peas, raw",                      "Snap Peas",                "vegetable", "pod",          ["fiber", "vitamin_c", "low_cal"]),
    ("okra, raw",                           "Okra",                     "vegetable", "other",        ["fiber", "folate", "viscous_fiber", "blood_sugar"]),
    ("fennel, raw",                         "Fennel",                   "vegetable", "stalk",        ["anethole", "potassium", "vitamin_c"]),
    ("hearts of palm, canned",              "Hearts of Palm",           "vegetable", "other",        ["low_cal", "low_carb", "fiber"]),
    ("bamboo shoots, canned",               "Bamboo Shoots",            "vegetable", "other",        ["low_cal", "fiber", "potassium"]),
    ("water chestnuts, canned",             "Water Chestnuts",          "vegetable", "other",        ["low_cal", "potassium", "crisp_texture"]),
    ("tomatillo, raw",                      "Tomatillo",                "vegetable", "fruit_veg",    ["vitamin_c", "low_cal", "salsa_verde"]),
    ("cherry tomatoes, raw",                "Cherry Tomatoes",          "vegetable", "fruit_veg",    ["lycopene", "vitamin_c", "antioxidants"]),
    ("celeriac, raw",                       "Celeriac (Celery Root)",   "vegetable", "root",         ["vitamin_k", "phosphorus", "low_cal"]),
    ("parsnip, raw",                        "Parsnip",                  "vegetable", "root",         ["fiber", "folate", "potassium"]),
    ("jicama, raw",                         "Jicama",                   "vegetable", "root",         ["low_cal", "inulin", "prebiotic", "vitamin_c"]),

    # Fungi additions
    ("mushrooms, portobello, raw",          "Portobello Mushroom",      "vegetable", "fungi",        ["b_vitamins", "selenium", "umami", "meaty"]),
    ("mushrooms, oyster, raw",              "Oyster Mushroom",          "vegetable", "fungi",        ["beta_glucan", "immune_support", "b_vitamins"]),
    ("mushrooms, white button, raw",        "Button Mushroom",          "vegetable", "fungi",        ["selenium", "b_vitamins", "low_cal"]),

    # Sea vegetables
    ("seaweed, nori, dried",                "Nori (Dried Seaweed)",     "vegetable", "sea_veg",      ["iodine", "b12", "protein", "minerals"]),
    ("seaweed, wakame",                     "Wakame Seaweed",           "vegetable", "sea_veg",      ["iodine", "manganese", "omega3"]),
    ("spirulina, dried",                    "Spirulina",                "vegetable", "sea_veg",      ["complete_protein", "iron", "b12", "antioxidants", "superfood"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FRUITS — stone, melon, tropical additions, dried, citrus
    # ─────────────────────────────────────────────────────────────────────────

    ("blackberries, raw",                   "Blackberries",             "fruit", "berry",       ["fiber", "antioxidants", "low_gi", "vitamin_c"]),
    ("watermelon, raw",                     "Watermelon",               "fruit", "melon",       ["lycopene", "citrulline", "hydration", "low_cal"]),
    ("cantaloupe, raw",                     "Cantaloupe",               "fruit", "melon",       ["beta_carotene", "vitamin_c", "potassium"]),
    ("honeydew, raw",                       "Honeydew Melon",           "fruit", "melon",       ["potassium", "vitamin_c", "hydration"]),
    ("grapefruit, raw",                     "Grapefruit",               "fruit", "citrus",      ["vitamin_c", "naringenin", "low_gi", "fat_metabolism"]),
    ("lime, raw",                           "Lime",                     "fruit", "citrus",      ["vitamin_c", "flavonoids", "low_cal"]),
    ("tangerine, raw",                      "Tangerine/Clementine",     "fruit", "citrus",      ["vitamin_c", "beta_carotene", "folate"]),
    ("plum, raw",                           "Plum",                     "fruit", "stone",       ["antioxidants", "vitamin_c", "low_cal"]),
    ("apricot, raw",                        "Apricot",                  "fruit", "stone",       ["beta_carotene", "potassium", "low_cal"]),
    ("peach, raw",                          "Peach",                    "fruit", "stone",       ["vitamin_c", "potassium", "low_cal"]),
    ("nectarine, raw",                      "Nectarine",                "fruit", "stone",       ["vitamin_c", "beta_carotene", "low_cal"]),
    ("fig, raw",                            "Fresh Fig",                "fruit", "other",       ["fiber", "calcium", "potassium", "antioxidants"]),
    ("papaya, raw",                         "Papaya",                   "fruit", "tropical",    ["papain", "vitamin_c", "beta_carotene", "digestive"]),
    ("guava, raw",                          "Guava",                    "fruit", "tropical",    ["vitamin_c", "fiber", "lycopene"]),
    ("passion fruit, raw",                  "Passion Fruit",            "fruit", "tropical",    ["fiber", "vitamin_c", "magnesium", "low_cal"]),
    ("coconut meat, raw",                   "Fresh Coconut",            "fruit", "tropical",    ["mct", "fiber", "manganese", "healthy_fat"]),
    ("dates, medjool",                      "Medjool Dates",            "fruit", "dried",       ["potassium", "magnesium", "fiber", "natural_sugar", "energy"]),
    ("dried apricots",                      "Dried Apricots",           "fruit", "dried",       ["iron", "beta_carotene", "potassium", "concentrated"]),
    ("raisins",                             "Raisins",                  "fruit", "dried",       ["iron", "potassium", "concentrated_sugar", "antioxidants"]),
    ("cranberries, raw",                    "Cranberries",              "fruit", "berry",       ["proanthocyanidins", "uti_prevention", "vitamin_c"]),

    # ─────────────────────────────────────────────────────────────────────────
    # GRAINS — white rice variants, couscous, ancient grains, more bread
    # ─────────────────────────────────────────────────────────────────────────

    ("rice, white, long-grain, raw",        "White Rice",               "grain", "rice",        ["complex_carb", "low_fiber", "fast_energy", "reference"]),
    ("rice, basmati, raw",                  "Basmati Rice",             "grain", "rice",        ["low_gi_for_white_rice", "aromatic", "complex_carb"]),
    ("rice, jasmine, raw",                  "Jasmine Rice",             "grain", "rice",        ["complex_carb", "aromatic"]),
    ("couscous, dry",                       "Couscous",                 "grain", "pasta",       ["quick_cook", "selenium", "complex_carb"]),
    ("bulgur, dry",                         "Bulgur Wheat",             "grain", "ancient",     ["fiber", "quick_cook", "whole_grain", "low_gi"]),
    ("amaranth, grain, raw",                "Amaranth",                 "grain", "pseudograin", ["complete_protein", "iron", "calcium", "gluten_free"]),
    ("millet, raw",                         "Millet",                   "grain", "ancient",     ["magnesium", "gluten_free", "complex_carb"]),
    ("teff, raw",                           "Teff",                     "grain", "ancient",     ["iron", "calcium", "complete_protein", "gluten_free"]),
    ("polenta, dry",                        "Polenta (Cornmeal)",       "grain", "corn",        ["complex_carb", "low_fat", "gluten_free"]),
    ("bread, sourdough",                    "Sourdough Bread",          "grain", "bread",       ["lower_gi", "fermented", "digestibility"]),
    ("bread, rye, dark",                    "Rye Bread (Dark)",         "grain", "bread",       ["fiber", "low_gi", "selenium"]),
    ("bread, ezekiel, sprouted",            "Ezekiel Sprouted Bread",   "grain", "bread",       ["complete_protein", "sprouted", "low_gi", "high_fiber"]),
    ("bread, white, commercial",            "White Bread",              "grain", "bread",       ["reference", "high_gi", "enriched"]),
    ("granola, homemade",                   "Granola",                  "grain", "cereal",      ["oats", "fiber", "energy_dense"]),

    # ─────────────────────────────────────────────────────────────────────────
    # LEGUMES — more beans, split peas, soybeans
    # ─────────────────────────────────────────────────────────────────────────

    ("soybeans, mature, raw",               "Soybeans",                 "legume", "bean",       ["complete_protein", "isoflavones", "omega3"]),
    ("peas, split, green, raw",             "Green Split Peas",         "legume", "pea",        ["fiber", "plant_protein", "iron"]),
    ("peas, split, yellow, raw",            "Yellow Split Peas",        "legume", "pea",        ["fiber", "plant_protein", "mild"]),
    ("mung beans, raw",                     "Mung Beans",               "legume", "bean",       ["protein", "folate", "sprout_ready"]),
    ("fava beans, raw",                     "Fava Beans (Broad Beans)", "legume", "bean",       ["l_dopa", "protein", "folate", "iron"]),
    ("black-eyed peas, raw",                "Black-Eyed Peas",          "legume", "bean",       ["folate", "potassium", "plant_protein"]),
    ("lima beans, raw",                     "Lima Beans",               "legume", "bean",       ["potassium", "fiber", "plant_protein"]),
    ("adzuki beans, raw",                   "Adzuki Beans",             "legume", "bean",       ["iron", "potassium", "low_fat"]),
    ("lupini beans, canned",                "Lupini Beans",             "legume", "bean",       ["very_high_protein", "low_carb", "prebiotic"]),

    # ─────────────────────────────────────────────────────────────────────────
    # DAIRY — more cheeses, creams, milks, skyr
    # ─────────────────────────────────────────────────────────────────────────

    ("milk, whole, 3.25%",                  "Whole Milk",               "dairy", "milk",        ["calcium", "vitamin_d", "fat", "complete"]),
    ("milk, nonfat",                        "Skim Milk",                "dairy", "milk",        ["calcium", "vitamin_d", "lean", "low_cal"]),
    ("cheese, swiss",                       "Swiss Cheese",             "dairy", "hard_cheese", ["calcium", "b12", "probiotic"]),
    ("cheese, gouda",                       "Gouda",                    "dairy", "hard_cheese", ["calcium", "vitamin_k2", "protein"]),
    ("cheese, parmesan, grated",            "Parmesan",                 "dairy", "hard_cheese", ["calcium", "high_protein", "umami"]),
    ("cheese, mozzarella, part-skim",       "Mozzarella (Part Skim)",   "dairy", "soft_cheese", ["calcium", "protein", "lower_fat"]),
    ("cheese, brie",                        "Brie",                     "dairy", "soft_cheese", ["fat", "calcium", "fermented", "vitamin_b12"]),
    ("cream cheese",                        "Cream Cheese",             "dairy", "soft_cheese", ["fat", "calcium", "versatile"]),
    ("sour cream",                          "Sour Cream",               "dairy", "fermented",   ["fat", "calcium", "probiotic", "fermented"]),
    ("cream, heavy whipping",               "Heavy Cream",              "dairy", "cream",       ["fat", "vitamins_a_d_k2", "ketogenic"]),
    ("cream, half and half",                "Half & Half",              "dairy", "cream",       ["moderate_fat", "calcium", "coffee_add"]),
    ("butter, unsalted",                    "Butter (Unsalted)",        "dairy", "fat",         ["vitamin_k2", "butyrate", "healthy_fat"]),
    ("ghee",                                "Ghee (Clarified Butter)",  "dairy", "fat",         ["butyrate", "fat_soluble_vitamins", "high_smoke_point", "lactose_free"]),
    ("cheese, blue",                        "Blue Cheese",              "dairy", "soft_cheese", ["calcium", "probiotic", "strong_flavor"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FATS & OILS
    # ─────────────────────────────────────────────────────────────────────────

    ("oil, sesame",                         "Sesame Oil",               "fat", "oil",           ["antioxidants", "sesamol", "high_smoke_point"]),
    ("oil, flaxseed",                       "Flaxseed Oil",             "fat", "oil",           ["omega3_ala", "anti_inflammatory", "do_not_heat"]),
    ("oil, walnut",                         "Walnut Oil",               "fat", "oil",           ["omega3", "antioxidants", "finishing_oil"]),
    ("oil, sunflower, high oleic",          "Sunflower Oil (High Oleic)","fat", "oil",          ["monounsaturated", "high_smoke_point"]),
    ("oil, mct",                            "MCT Oil",                  "fat", "oil",           ["ketones", "fat_burning", "brain_fuel", "quick_energy"]),
    ("beef tallow",                         "Beef Tallow",              "fat", "animal_fat",    ["fat_soluble_vitamins", "high_smoke_point", "traditional_cooking"]),
    ("fish oil, cod liver",                 "Cod Liver Oil",            "fat", "oil",           ["omega3_epa_dha", "vitamin_d", "vitamin_a", "supplement"]),

    # ─────────────────────────────────────────────────────────────────────────
    # CONDIMENTS & SAUCES
    # ─────────────────────────────────────────────────────────────────────────

    ("tahini",                              "Tahini",                   "condiment", "spread",  ["calcium", "healthy_fat", "protein", "copper"]),
    ("pesto, basil",                        "Basil Pesto",              "condiment", "sauce",   ["healthy_fat", "antioxidants", "basil"]),
    ("vinegar, balsamic",                   "Balsamic Vinegar",         "condiment", "vinegar", ["polyphenols", "blood_sugar", "low_cal"]),
    ("sauce, Worcestershire",               "Worcestershire Sauce",     "condiment", "sauce",   ["umami", "iron", "sodium"]),
    ("fish sauce",                          "Fish Sauce",               "condiment", "sauce",   ["umami", "sodium", "iodine", "glutamates"]),
    ("coconut aminos",                      "Coconut Aminos",           "condiment", "sauce",   ["soy_free", "lower_sodium", "umami"]),
    ("sriracha",                            "Sriracha Hot Sauce",       "condiment", "sauce",   ["capsaicin", "low_cal", "metabolism"]),
    ("mustard, dijon",                      "Dijon Mustard",            "condiment", "sauce",   ["low_cal", "no_sugar", "turmeric"]),
    ("tomato sauce, plain",                 "Tomato Sauce (Marinara)",  "condiment", "sauce",   ["lycopene", "vitamin_c", "low_cal"]),
    ("miso paste, white",                   "White Miso Paste",         "condiment", "fermented", ["probiotics", "glutamates", "umami", "fermented"]),
    ("nutritional yeast",                   "Nutritional Yeast",        "condiment", "other",   ["b12", "complete_protein", "umami", "b_vitamins"]),

    # ─────────────────────────────────────────────────────────────────────────
    # BEVERAGES
    # ─────────────────────────────────────────────────────────────────────────

    ("milk, almond, unsweetened",           "Almond Milk (Unsweetened)","beverage", "plant_milk", ["low_cal", "vitamin_e", "dairy_free"]),
    ("milk, oat, unsweetened",              "Oat Milk (Unsweetened)",   "beverage", "plant_milk", ["beta_glucan", "dairy_free", "moderate_carb"]),
    ("milk, soy, unsweetened",              "Soy Milk (Unsweetened)",   "beverage", "plant_milk", ["complete_protein", "isoflavones", "dairy_free"]),
    ("coconut water",                       "Coconut Water",            "beverage", "other",     ["potassium", "electrolytes", "low_cal", "hydration"]),
    ("broth, bone, beef",                   "Beef Bone Broth",          "beverage", "broth",     ["collagen", "glycine", "gut_health", "joint_health"]),
    ("kombucha",                            "Kombucha",                 "beverage", "fermented", ["probiotics", "b_vitamins", "antioxidants", "low_cal"]),
    ("tea, matcha, brewed",                 "Matcha (Brewed)",          "beverage", "tea",       ["egcg", "l_theanine", "focus", "antioxidants"]),
    ("juice, tart cherry",                  "Tart Cherry Juice",        "beverage", "juice",     ["melatonin", "anti_inflammatory", "recovery", "sleep"]),

    # ─────────────────────────────────────────────────────────────────────────
    # HERBS & SPICES — serious micronutrient and phytochemical value
    # ─────────────────────────────────────────────────────────────────────────

    ("turmeric, ground",                    "Turmeric",                 "herbs_spices", "spice",  ["curcumin", "anti_inflammatory", "antioxidant", "joint_health"]),
    ("ginger, raw",                         "Fresh Ginger",             "herbs_spices", "root",   ["gingerol", "anti_nausea", "anti_inflammatory", "digestion"]),
    ("cinnamon, ground",                    "Cinnamon",                 "herbs_spices", "spice",  ["blood_sugar", "antioxidant", "anti_inflammatory"]),
    ("black pepper, ground",                "Black Pepper",             "herbs_spices", "spice",  ["piperine", "bioavailability_enhancer", "antioxidant"]),
    ("cayenne pepper, ground",              "Cayenne Pepper",           "herbs_spices", "spice",  ["capsaicin", "metabolism_boost", "pain_relief"]),
    ("cumin, ground",                       "Cumin",                    "herbs_spices", "spice",  ["iron", "antioxidant", "digestion", "anti_inflammatory"]),
    ("paprika, sweet",                      "Paprika",                  "herbs_spices", "spice",  ["capsanthin", "vitamin_a", "antioxidant"]),
    ("oregano, dried",                      "Dried Oregano",            "herbs_spices", "herb",   ["thymol", "carvacrol", "anti_bacterial", "antioxidant"]),
    ("basil, fresh",                        "Fresh Basil",              "herbs_spices", "herb",   ["eugenol", "anti_inflammatory", "vitamin_k"]),
    ("parsley, fresh",                      "Fresh Parsley",            "herbs_spices", "herb",   ["vitamin_k", "vitamin_c", "folate", "apigenin"]),
    ("cilantro, fresh",                     "Fresh Cilantro",           "herbs_spices", "herb",   ["heavy_metal_chelation", "antioxidant", "vitamin_k"]),
    ("rosemary, fresh",                     "Fresh Rosemary",           "herbs_spices", "herb",   ["carnosic_acid", "anti_inflammatory", "cognitive"]),
    ("thyme, fresh",                        "Fresh Thyme",              "herbs_spices", "herb",   ["thymol", "anti_bacterial", "vitamin_c"]),
    ("mint, fresh",                         "Fresh Mint",               "herbs_spices", "herb",   ["menthol", "digestion", "ibs_relief", "low_cal"]),
    ("dill, fresh",                         "Fresh Dill",               "herbs_spices", "herb",   ["vitamin_c", "flavonoids", "anti_bacterial"]),
    ("garlic powder",                       "Garlic Powder",            "herbs_spices", "spice",  ["allicin", "anti_inflammatory", "cardiovascular"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FERMENTED FOODS — gut health, probiotics, microbiome diversity
    # ─────────────────────────────────────────────────────────────────────────

    ("kimchi",                              "Kimchi",                   "fermented", "fermented_veg", ["probiotics", "vitamin_c", "low_cal", "gut_health", "anti_cancer"]),
    ("sauerkraut",                          "Sauerkraut",               "fermented", "fermented_veg", ["probiotics", "vitamin_c", "vitamin_k2", "gut_health"]),
    ("natto",                               "Natto (Fermented Soy)",    "fermented", "fermented_soy", ["vitamin_k2", "nattokinase", "cardiovascular", "complete_protein"]),
    ("pickles, naturally fermented",        "Fermented Pickles",        "fermented", "fermented_veg", ["probiotics", "very_low_cal", "electrolytes"]),
    ("tempeh, 3-grain",                     "Tempeh",                   "fermented", "fermented_soy", ["complete_protein", "probiotics", "b_vitamins", "fiber"]),
    ("yogurt, plain, whole milk",           "Plain Whole Milk Yogurt",  "fermented", "dairy",         ["probiotics", "calcium", "protein", "fat"]),
    ("kefir, plain",                        "Kefir (Whole Milk)",       "fermented", "dairy",         ["probiotics", "calcium", "complete_protein", "gut_health"]),
    ("cheese, aged, camembert",             "Camembert",                "fermented", "dairy",         ["vitamin_k2", "probiotics", "calcium", "b12"]),

    # ─────────────────────────────────────────────────────────────────────────
    # FUNCTIONAL FOODS / SUPERFOODS — high density, adaptogenic, therapeutic
    # ─────────────────────────────────────────────────────────────────────────

    ("cocoa powder, unsweetened",           "Cocoa Powder (Unsweetened)","superfood", "cacao",   ["flavonoids", "magnesium", "iron", "anti_inflammatory"]),
    ("chocolate, dark, 85%",                "Dark Chocolate (85%)",     "superfood", "cacao",   ["flavonoids", "magnesium", "iron", "antioxidant", "mood"]),
    ("matcha powder",                       "Matcha Powder",            "superfood", "tea",     ["egcg", "l_theanine", "antioxidant", "focus", "fat_burning"]),
    ("acai, frozen puree, unsweetened",     "Acai Puree",               "superfood", "berry",   ["anthocyanins", "omega9", "antioxidant", "brain_health"]),
    ("bee pollen",                          "Bee Pollen",               "superfood", "other",   ["complete_amino_acids", "enzymes", "anti_inflammatory", "energy"]),
    ("maca root powder",                    "Maca Root Powder",         "superfood", "adaptogen", ["hormonal_balance", "energy", "endurance", "adaptogen"]),
    ("chlorella powder",                    "Chlorella Powder",         "superfood", "algae",   ["complete_protein", "chlorophyll", "detox", "b12", "iron"]),
    ("hemp protein powder",                 "Hemp Protein Powder",      "superfood", "protein", ["complete_protein", "omega3", "fiber", "plant_based"]),
    ("black seed oil (nigella sativa)",     "Black Seed Oil",           "superfood", "oil",     ["thymoquinone", "anti_inflammatory", "immune_support"]),
    ("moringa leaf powder",                 "Moringa Powder",           "superfood", "leaf",    ["complete_protein", "iron", "calcium", "vitamin_c", "adaptogen"]),

    # ─────────────────────────────────────────────────────────────────────────
    # SUPPLEMENTS — fill out the performance/recovery tier
    # ─────────────────────────────────────────────────────────────────────────

    ("protein powder, casein",              "Casein Protein Powder",    "supplement", "protein_powder", ["slow_digest", "casein", "overnight_protein", "anti_catabolic"]),
    ("branched chain amino acids",          "BCAA Powder",              "supplement", "amino",          ["leucine", "isoleucine", "valine", "muscle_protein_synthesis"]),
    ("magnesium glycinate",                 "Magnesium Glycinate",      "supplement", "mineral",        ["sleep", "muscle_recovery", "stress", "bone_health"]),
    ("zinc, elemental",                     "Zinc Supplement",          "supplement", "mineral",        ["immune_support", "testosterone", "wound_healing"]),
    ("vitamin d3",                          "Vitamin D3",               "supplement", "vitamin",        ["bone_health", "immune_support", "testosterone", "mood"]),
    ("omega-3 fish oil",                    "Fish Oil (EPA/DHA)",       "supplement", "omega3",         ["anti_inflammatory", "cardiovascular", "brain_health", "joint_health"]),
]

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS_V2:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total expansion foods: {len(SEED_FOODS_V2)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat:<20} {count}")
