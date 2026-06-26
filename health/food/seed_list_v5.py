"""
Pantry expansion v5 — ~110 new foods.
Focus: pantry staples Warren actually keeps at home.
  - Pasta shapes: spaghetti, angel hair, fettuccine, penne, rigatoni, lasagna, egg noodles
  - Jams / jellies / spreads: grape jelly, strawberry jam, marmalade, apricot, raspberry
  - Baking: all-purpose flour, bread flour, cornstarch, baking powder, brown sugar,
            powdered sugar, molasses, maple syrup, honey, corn syrup, vanilla extract
  - Canned goods: tuna in water, corn, chickpeas cooked, tomato paste, cream of mushroom,
                  diced tomatoes, chicken noodle soup, V8, applesauce
  - Deli meats / charcuterie: ham, bologna, salami, pepperoni (sliced), turkey breast deli
  - Snacks: potato chips, tortilla chips, pretzels, popcorn, milk chocolate, Goldfish-style crackers
  - More beverages: OJ, lemonade, sports drink, energy drink, coconut milk (can), tonic water
  - Misc pantry: tahini (already in), coconut milk powder, evaporated milk, sweetened cond milk
  - Breakfast: maple syrup, pancake mix, instant oatmeal, sausage link (pork), hash brown
  - More protein: pepperoni, bacon (have?), deli turkey, canned tuna (water)
"""

SEED_FOODS_V5 = [

    # ─────────────────────────────────────────────────────────────────────────
    # PASTA — named shapes (nutritionally near-identical to white pasta but
    # users search by shape, so they need distinct entries)
    # ─────────────────────────────────────────────────────────────────────────
    ("spaghetti, dry, enriched",             "Spaghetti (Dry)",        "grain", "pasta",    ["complex_carb","enriched","classic"]),
    ("pasta, fettuccine, dry, enriched",     "Fettuccine (Dry)",       "grain", "pasta",    ["complex_carb","enriched"]),
    ("pasta, penne, dry, enriched",          "Penne (Dry)",            "grain", "pasta",    ["complex_carb","enriched"]),
    ("pasta, rotini, dry, enriched",         "Rotini/Fusilli (Dry)",   "grain", "pasta",    ["complex_carb","enriched"]),
    ("pasta, bow-tie, farfalle, dry",        "Farfalle / Bow-Ties (Dry)","grain","pasta",   ["complex_carb","enriched"]),
    ("pasta, lasagna, dry, enriched",        "Lasagna Sheets (Dry)",   "grain", "pasta",    ["complex_carb","enriched"]),
    ("noodles, egg, dry, enriched",          "Egg Noodles (Dry)",      "grain", "noodle",   ["complex_carb","enriched","egg"]),
    ("pasta, cooked, enriched, without added salt","Pasta (Cooked, ref)","grain","pasta",  ["cooked_reference","complex_carb"]),

    # ─────────────────────────────────────────────────────────────────────────
    # JAMS, JELLIES & SWEET SPREADS
    # ─────────────────────────────────────────────────────────────────────────
    ("jellies, grape",                       "Grape Jelly",            "condiment","spread",["sugar","antioxidants","resveratrol"]),
    ("jams and preserves, strawberry",       "Strawberry Jam",         "condiment","spread",["sugar","vitamin_c","low_fat"]),
    ("marmalades, orange",                   "Orange Marmalade",       "condiment","spread",["sugar","vitamin_c","citrus"]),
    ("jams and preserves, raspberry",        "Raspberry Jam",          "condiment","spread",["sugar","antioxidants","low_fat"]),
    ("jams and preserves, apricot",          "Apricot Jam",            "condiment","spread",["sugar","beta_carotene","low_fat"]),
    ("jams and preserves, blueberry",        "Blueberry Jam",          "condiment","spread",["sugar","antioxidants"]),
    ("candies, chocolate hazelnut spread",   "Chocolate Hazelnut Spread","condiment","spread",["sugar","fat","hazelnut","reference"]),

    # ─────────────────────────────────────────────────────────────────────────
    # BAKING STAPLES
    # ─────────────────────────────────────────────────────────────────────────
    ("wheat flour, white, all-purpose, enriched, bleached","All-Purpose Flour","grain","baking",["complex_carb","enriched","baking"]),
    ("wheat flour, white, bread, enriched",  "Bread Flour",            "grain", "baking",   ["complex_carb","higher_protein","baking"]),
    ("cornstarch",                           "Cornstarch",             "grain", "baking",   ["thickener","gluten_free","pure_carb"]),
    ("leavening agents, baking powder",      "Baking Powder",          "condiment","baking",["sodium","leavening"]),
    ("sugars, brown",                        "Brown Sugar",            "condiment","sweetener",["molasses","natural_sugar","baking"]),
    ("sugars, powdered",                     "Powdered Sugar",         "condiment","sweetener",["refined_sugar","baking"]),
    ("molasses",                             "Molasses",               "condiment","sweetener",["iron","calcium","potassium","b6"]),
    ("syrups, maple",                        "Maple Syrup",            "condiment","sweetener",["manganese","zinc","natural_sugar"]),
    ("honey",                                "Honey",                  "condiment","sweetener",["natural_sugar","antimicrobial","antioxidant"]),
    ("syrups, corn, light",                  "Light Corn Syrup",       "condiment","sweetener",["refined_sugar","baking","reference"]),
    ("vanilla extract",                      "Vanilla Extract",        "condiment","baking",  ["negligible_cal","flavoring"]),

    # ─────────────────────────────────────────────────────────────────────────
    # CANNED GOODS
    # ─────────────────────────────────────────────────────────────────────────
    ("fish, tuna, light, canned in water, without salt","Canned Tuna (in Water)","protein","canned_fish",["lean","protein","b12","omega3"]),
    ("corn, sweet, yellow, canned, whole kernel, drained","Canned Corn",        "vegetable","canned",["complex_carb","fiber","vitamin_c"]),
    ("chickpeas (garbanzo beans), mature seeds, canned","Canned Chickpeas",    "legume", "bean",    ["protein","fiber","iron","cooked_ready"]),
    ("tomatoes, red, ripe, canned, packed in tomato juice","Diced Tomatoes",   "vegetable","canned",["lycopene","vitamin_c","low_cal"]),
    ("tomato products, canned, paste",       "Tomato Paste",           "condiment","sauce",   ["lycopene","concentrated","umami"]),
    ("soup, cream of mushroom, canned, condensed","Cream of Mushroom Soup","condiment","soup",["sodium","reference"]),
    ("soup, chicken noodle, canned, condensed","Chicken Noodle Soup",  "condiment","soup",   ["sodium","comfort_food","reference"]),
    ("applesauce, canned, unsweetened",      "Applesauce (Unsweetened)","fruit",  "canned",  ["fiber","low_cal","natural_sugar"]),
    ("peaches, canned, juice pack",          "Canned Peaches",         "fruit",  "canned",  ["natural_sugar","vitamin_c","reference"]),
    ("pineapple, canned, juice pack",        "Canned Pineapple",       "fruit",  "canned",  ["bromelain","vitamin_c","natural_sugar"]),
    ("fruit cocktail, canned, juice pack",   "Fruit Cocktail",         "fruit",  "canned",  ["natural_sugar","reference"]),

    # ─────────────────────────────────────────────────────────────────────────
    # DELI MEATS & CHARCUTERIE
    # ─────────────────────────────────────────────────────────────────────────
    ("pork, cured, ham, sliced, regular",    "Deli Ham",               "protein","deli",    ["sodium","protein","convenience"]),
    ("turkey breast, pre-basted, meat only, roasted","Deli Turkey Breast","protein","deli", ["lean","protein","sodium","convenience"]),
    ("beef, cured, corned beef, brisket, cooked","Corned Beef",        "protein","deli",    ["protein","sodium","b12"]),
    ("salami, cooked, beef and pork",        "Salami",                 "protein","deli",    ["fat","sodium","protein"]),
    ("bologna, beef and pork",               "Bologna",                "protein","deli",    ["fat","sodium","reference"]),
    ("mortadella, beef and pork",            "Mortadella",             "protein","deli",    ["fat","sodium","protein"]),
    ("frankfurter, beef",                    "Beef Hot Dog",           "protein","deli",    ["fat","sodium","reference"]),
    ("pork, cured, bacon, raw",              "Bacon (Raw)",            "protein","pork",    ["fat","sodium","protein","b_vitamins"]),

    # ─────────────────────────────────────────────────────────────────────────
    # SNACKS
    # ─────────────────────────────────────────────────────────────────────────
    ("snacks, potato chips, plain",          "Potato Chips (Plain)",   "grain",  "snack",   ["fat","sodium","reference"]),
    ("snacks, tortilla chips, plain",        "Tortilla Chips",         "grain",  "snack",   ["fat","sodium","corn_based"]),
    ("snacks, pretzels, hard, plain",        "Pretzels (Hard)",        "grain",  "snack",   ["low_fat","sodium","carb"]),
    ("popcorn, air-popped",                  "Air-Popped Popcorn",     "grain",  "snack",   ["fiber","low_cal","whole_grain"]),
    ("popcorn, oil-popped, regular butter flavor","Movie Butter Popcorn","grain","snack",  ["fat","sodium","reference"]),
    ("snacks, cheese-flavor puffed corn",    "Cheese Puffs",           "grain",  "snack",   ["fat","sodium","reference"]),
    ("crackers, standard snack-type",        "Ritz-Style Crackers",    "grain",  "cracker", ["fat","sodium","refined"]),
    ("candy, chocolate, dark",               "Dark Chocolate Bar",     "grain",  "dessert", ["flavanols","magnesium","antioxidant"]),
    ("candies, milk chocolate",              "Milk Chocolate",         "grain",  "dessert", ["sugar","fat","calcium","reference"]),
    ("candy, gumdrops, starch jelly pieces", "Gummy Candy",            "grain",  "dessert", ["sugar","reference"]),
    ("snacks, fruit leather, pieces",        "Fruit Snacks",           "grain",  "snack",   ["sugar","vitamin_c","reference"]),

    # ─────────────────────────────────────────────────────────────────────────
    # BEVERAGES — expanded
    # ─────────────────────────────────────────────────────────────────────────
    ("orange juice, raw",                    "Orange Juice (Fresh)",   "beverage","juice",  ["vitamin_c","folate","potassium"]),
    ("beverages, lemonade, frozen, white, diluted","Lemonade",         "beverage","juice",  ["vitamin_c","natural_sugar","reference"]),
    ("sports drink, ready-to-drink",         "Sports Drink (Gatorade-style)","beverage","sports",["sodium","potassium","simple_carb"]),
    ("beverages, energy drink, red bull",    "Energy Drink",           "beverage","energy", ["caffeine","taurine","b_vitamins","reference"]),
    ("beverages, coconut water, not from concentrate","Coconut Water",  "beverage","juice",  ["electrolytes","potassium","low_cal"]),
    ("milk, coconut beverage, unsweetened",  "Coconut Milk (Carton)",  "beverage","milk",   ["mct","low_protein","dairy_free"]),
    ("water, tap, drinking",                 "Tap Water",              "beverage","water",  ["zero_cal","fluoride","reference"]),
    ("tea, black, brewed",                   "Black Tea (Brewed)",     "beverage","tea",    ["caffeine","antioxidant","low_cal"]),
    ("beverages, tonic water",               "Tonic Water",            "beverage","mixer",  ["quinine","sugar","carbonated"]),

    # ─────────────────────────────────────────────────────────────────────────
    # BREAKFAST ITEMS
    # ─────────────────────────────────────────────────────────────────────────
    ("pancakes, plain, prepared from recipe","Pancakes (Homemade)",    "grain",  "breakfast",["complex_carb","moderate_cal"]),
    ("cereals, oatmeal, instant, fortified, plain",  "Instant Oatmeal","grain", "breakfast",["fiber","beta_glucan","b_vitamins"]),
    ("hash brown potatoes, refrigerated",    "Hash Browns",            "vegetable","breakfast",["complex_carb","potassium","comfort"]),

    # ─────────────────────────────────────────────────────────────────────────
    # DAIRY EXTRAS
    # ─────────────────────────────────────────────────────────────────────────
    ("milk, canned, evaporated, whole",      "Evaporated Milk",        "dairy",  "milk",    ["concentrated","calcium","protein"]),
    ("milk, canned, condensed, sweetened",   "Sweetened Condensed Milk","dairy", "milk",    ["very_high_sugar","calcium","baking"]),
    ("cream, sour, cultured, reduced fat",   "Light Sour Cream",       "dairy",  "cream",   ["probiotic","lower_fat","calcium"]),
    ("cream, half and half, fat free",       "Fat Free Half & Half",   "dairy",  "cream",   ["calcium","low_fat","reference"]),

    # ─────────────────────────────────────────────────────────────────────────
    # MORE CONDIMENTS
    # ─────────────────────────────────────────────────────────────────────────
    ("vinegar, red wine",                    "Red Wine Vinegar",       "condiment","vinegar",["polyphenols","probiotic","very_low_cal"]),
    ("vinegar, distilled",                   "White Vinegar",          "condiment","vinegar",["very_low_cal","antimicrobial"]),
    ("sauce, buffalo",                       "Buffalo Wing Sauce",     "condiment","sauce",  ["capsaicin","sodium","low_cal"]),
    ("sauce, pasta, spaghetti/marinara, ready-to-serve","Jar Pasta Sauce","condiment","sauce",["lycopene","sodium","reference"]),
    ("dressings, thousand island, fat-free", "Thousand Island Dressing","condiment","dressing",["fat","sodium","reference"]),
    ("sauce, steak",                         "Steak Sauce (A1-style)", "condiment","sauce",  ["sodium","umami","low_cal"]),
]

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS_V5:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total v5 foods: {len(SEED_FOODS_V5)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat:<20} {count}")
