"""
NYC staples seed list — pizza, bagels, deli, breakfast sandwiches.
All SR Legacy search terms.
"""

SEED_FOODS_NYC = [

    # ── PIZZA ─────────────────────────────────────────────────────────────────
    # USDA has pizza under "fast foods" in SR Legacy — most reliable source.
    # NYC thin-crust is closest to "regular crust" (not deep dish).
    ("fast foods, pizza, cheese, regular crust",             "Pizza Slice (Cheese)",       "grain", "pizza",     ["pizza","nyc","cheese","reference"]),
    ("fast foods, pizza, pepperoni, regular crust",          "Pizza Slice (Pepperoni)",    "grain", "pizza",     ["pizza","nyc","pepperoni","reference"]),
    ("fast foods, pizza, vegetable, regular crust",          "Pizza Slice (Veggie)",       "grain", "pizza",     ["pizza","nyc","vegetable","reference"]),
    ("pizza, cheese, frozen, rising crust",                  "Pizza (Deep Dish, Cheese)",  "grain", "pizza",     ["pizza","deep_dish","frozen","reference"]),
    ("pizza dough",                                          "Pizza Dough",                "grain", "pizza",     ["pizza","dough","fermented","complex_carb"]),

    # ── BAGELS ────────────────────────────────────────────────────────────────
    # "Plain Bagel" already in DB — adding varieties
    ("bagels, egg",                                          "Egg Bagel",                  "grain", "bread",     ["nyc","bagel","egg","complex_carb"]),
    ("bagels, whole-wheat",                                  "Whole Wheat Bagel",          "grain", "bread",     ["nyc","bagel","fiber","whole_grain"]),
    ("bagels, cinnamon-raisin",                              "Cinnamon Raisin Bagel",      "grain", "bread",     ["nyc","bagel","sweet","complex_carb"]),
    ("bagels, oat-bran",                                     "Everything Bagel",           "grain", "bread",     ["nyc","bagel","seeds","sesame","poppy"]),
    ("rolls, hard",                                          "Kaiser / Hard Roll",         "grain", "bread",     ["nyc","roll","bec","sandwich","complex_carb"]),
    ("english muffins, toasted, plain",                      "English Muffin (Toasted)",   "grain", "bread",     ["breakfast","nyc","bec"]),

    # ── BACON & BREAKFAST MEAT ────────────────────────────────────────────────
    ("pork, cured, bacon, cooked, pan-fried",                "Bacon (Cooked)",             "protein", "pork",   ["nyc","bec","fat","sodium","breakfast"]),
    ("pork, cured, canadian-style bacon, unheated",          "Canadian Bacon",             "protein", "pork",   ["lean","sodium","lower_fat_bacon"]),
    ("sausage, pork, fresh, cooked",                         "Breakfast Sausage Patty",    "protein", "pork",   ["breakfast","fat","sodium"]),
    ("pork and beef sausage, fresh, cooked",                 "Pork Roll / Taylor Ham",     "protein", "pork",   ["nyc_nj","breakfast","sodium","bec"]),

    # ── BREAKFAST SANDWICHES (fast food proxies for BEC) ─────────────────────
    ("fast foods, egg, scrambled",                           "Scrambled Eggs (Diner)",     "protein", "egg",    ["breakfast","nyc","protein","reference"]),
    ("fast foods, egg, cheese",                              "Egg & Cheese (BEC component)","protein","egg",    ["breakfast","nyc","bec","reference"]),
    ("fast foods, biscuit with egg and bacon",               "Bacon Egg & Cheese (Biscuit)","grain", "breakfast",["nyc","bec","reference"]),
    ("fast foods, croissant, with egg and cheese",           "Bacon Egg & Cheese (Croissant)","grain","breakfast",["nyc","bec","reference"]),
    ("fast foods, bagel, with egg and sausage",              "Bagel Egg & Cheese (Full)",  "grain", "breakfast", ["nyc","bec","bagel","reference"]),

    # ── NYC DELI ──────────────────────────────────────────────────────────────
    ("beef, cured, pastrami",                                "Pastrami",                   "protein", "deli",   ["nyc","deli","sodium","classic"]),
    ("beef, cured, corned beef, canned",                     "Corned Beef (Deli Sliced)",  "protein", "deli",   ["nyc","deli","sodium","b12"]),
    ("luncheon meat, pork, canned",                          "SPAM / Luncheon Meat",       "protein", "deli",   ["sodium","processed","reference"]),
    ("pork, cured, ham, with natural juices, roasted",       "Black Forest Ham",           "protein", "deli",   ["lean","sodium","nyc"]),
    ("turkey, breast, smoked, cooked",                       "Smoked Turkey Breast",       "protein", "deli",   ["lean","sodium","nyc"]),

    # ── SOFT PRETZEL ─────────────────────────────────────────────────────────
    ("pretzels, soft",                                       "Soft Pretzel (NYC Cart)",    "grain", "snack",    ["nyc","street_food","sodium","complex_carb"]),

    # ── NYC DESSERTS / BAKERY ──────────────────────────────────────────────────
    ("cheesecake, prepared from mix",                        "New York Cheesecake (slice)","dairy", "dessert",  ["nyc","classic","fat","sugar"]),
    ("cookies, chocolate chip",                              "Black & White Cookie",       "grain", "dessert",  ["nyc","classic","sugar","reference"]),
    ("cake, cheese",                                         "Cheesecake (Plain)",         "dairy", "dessert",  ["nyc","fat","sugar","calcium"]),
    ("danish pastry, fruit",                                 "Rugelach / Danish Pastry",   "grain", "dessert",  ["nyc","bakery","fat","sugar"]),

    # ── NYC STREET FOOD ───────────────────────────────────────────────────────
    ("beef, variety meats and by-products, tripe, cooked",   "Halal Chicken Over Rice (ref)","protein","street",["nyc","halal","protein","reference"]),
    ("frankfurter, beef",                                    "NYC Hot Dog (Cart)",         "protein", "street",  ["nyc","street","sodium","reference"]),
    ("knishes, potato",                                      "Potato Knish",               "grain", "street",   ["nyc","classic","complex_carb","comfort"]),
]

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS_NYC:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total NYC foods: {len(SEED_FOODS_NYC)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat:<20} {count}")
