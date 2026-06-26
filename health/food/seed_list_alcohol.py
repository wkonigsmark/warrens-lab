"""
Adult beverages seed list.
USDA SR Legacy uses "Alcoholic beverage, ..." naming for most of these.
All nutrients per 100g/100ml — client scales by actual pour/can size.

Typical pour references:
  Beer / hard seltzer: 355ml (12 oz can)
  Wine: 148ml (5 oz)
  Shot (1.5 oz): 44ml
  Cocktail: varies
"""

SEED_FOODS_ALCOHOL = [

    # ── BEER ──────────────────────────────────────────────────────────────────
    ("alcoholic beverage, beer, regular, all",
        "Beer (Regular / Lager)",       "beverage", "beer",
        ["alcohol","carbonated","nyc","reference"]),

    ("alcoholic beverage, beer, light",
        "Beer (Light)",                 "beverage", "beer",
        ["alcohol","low_cal","carbonated","reference"]),

    ("alcoholic beverage, beer, higher alcohol",
        "IPA / Craft Beer",             "beverage", "beer",
        ["alcohol","higher_abv","hoppy","reference"]),

    ("alcoholic beverage, beer, stout",
        "Stout / Porter",               "beverage", "beer",
        ["alcohol","dark","roasted","reference"]),

    ("alcoholic beverage, beer, wheat",
        "Wheat Beer / Hefeweizen",      "beverage", "beer",
        ["alcohol","wheat","cloudy","reference"]),

    ("alcoholic beverage, beer, nonalcoholic",
        "Non-Alcoholic Beer",           "beverage", "beer",
        ["low_alcohol","low_cal","reference"]),

    # ── WINE ──────────────────────────────────────────────────────────────────
    ("alcoholic beverage, wine, table, red",
        "Red Wine (Table)",             "beverage", "wine",
        ["alcohol","resveratrol","antioxidant","tannins"]),

    ("alcoholic beverage, wine, table, white",
        "White Wine (Table)",           "beverage", "wine",
        ["alcohol","crisp","low_sugar"]),

    ("alcoholic beverage, wine, rose",
        "Rosé Wine",                    "beverage", "wine",
        ["alcohol","summer","anthocyanins"]),

    ("alcoholic beverage, wine, table, all",
        "Sancerre / Pinot Grigio (Dry White)",  "beverage", "wine",
        ["alcohol","dry","crisp","nyc"]),

    ("alcoholic beverage, wine, dessert, sweet",
        "Dessert Wine (Sweet)",         "beverage", "wine",
        ["alcohol","high_sugar","sipping"]),

    ("alcoholic beverage, wine, sparkling, white",
        "Champagne / Prosecco",         "beverage", "wine",
        ["alcohol","carbonated","celebration"]),

    # ── SPIRITS (straight pours) ──────────────────────────────────────────────
    # USDA lumps most 80-proof spirits together — all ~231 kcal/100ml
    ("alcoholic beverage, distilled, all (gin, rum, vodka, whiskey) 80 proof",
        "Vodka (80 proof)",             "beverage", "spirit",
        ["alcohol","zero_carb","80_proof","nyc"]),

    ("alcoholic beverage, distilled, gin, 90 proof",
        "Gin (90 proof)",               "beverage", "spirit",
        ["alcohol","zero_carb","juniper","botanical"]),

    ("alcoholic beverage, distilled, rum, 80 proof",
        "Rum (80 proof)",               "beverage", "spirit",
        ["alcohol","zero_carb","tropical"]),

    ("alcoholic beverage, distilled, whiskey, 86 proof",
        "Whiskey / Bourbon (86 proof)", "beverage", "spirit",
        ["alcohol","zero_carb","oak","nyc"]),

    ("alcoholic beverage, distilled, tequila, 80 proof",
        "Tequila (80 proof)",           "beverage", "spirit",
        ["alcohol","zero_carb","agave","nyc"]),

    ("alcoholic beverage, distilled, brandy, all (pisco, cognac)",
        "Cognac / Brandy",              "beverage", "spirit",
        ["alcohol","grape_based","sipping"]),

    # ── COCKTAILS ─────────────────────────────────────────────────────────────
    ("alcoholic beverage, daiquiri, canned",
        "Daiquiri",                     "beverage", "cocktail",
        ["alcohol","rum","lime","sugar","nyc"]),

    ("alcoholic beverage, pina colada, canned",
        "Piña Colada",                  "beverage", "cocktail",
        ["alcohol","rum","coconut","high_cal"]),

    ("alcoholic beverage, tequila sunrise, canned",
        "Tequila Sunrise",              "beverage", "cocktail",
        ["alcohol","tequila","oj","grenadine"]),

    ("alcoholic beverage, whiskey sour",
        "Whiskey Sour",                 "beverage", "cocktail",
        ["alcohol","whiskey","lemon","sour"]),

    ("alcoholic beverage, screwdriver",
        "Screwdriver (Vodka + OJ)",     "beverage", "cocktail",
        ["alcohol","vodka","oj","classic"]),

    ("alcoholic beverage, manhattan",
        "Manhattan",                    "beverage", "cocktail",
        ["alcohol","whiskey","vermouth","nyc","classic"]),

    ("alcoholic beverage, tom collins",
        "Tom Collins / Gin & Tonic",    "beverage", "cocktail",
        ["alcohol","gin","lemon","soda"]),

    ("alcoholic beverage, gin and tonic",
        "Margarita (on the rocks)",     "beverage", "cocktail",
        ["alcohol","tequila","lime","triple_sec","nyc"]),

    ("alcoholic beverage, martini",
        "Martini (Dry)",                "beverage", "cocktail",
        ["alcohol","vodka_or_gin","vermouth","nyc","classic"]),

    ("alcoholic beverage, bloody mary",
        "Bloody Mary",                  "beverage", "cocktail",
        ["alcohol","vodka","tomato","low_cal","nyc"]),

    ("alcoholic beverage, cosmopolitan",
        "Cosmopolitan",                 "beverage", "cocktail",
        ["alcohol","vodka","cranberry","triple_sec","nyc"]),

    ("alcoholic beverage, pina colada, prepared-from-recipe",
        "Old Fashioned",                "beverage", "cocktail",
        ["alcohol","bourbon","sugar","bitters","nyc","classic"]),

    ("alcoholic beverage, mojito",
        "Mojito",                       "beverage", "cocktail",
        ["alcohol","rum","mint","lime","soda"]),

    # ── HARD SELTZERS / RTD ───────────────────────────────────────────────────
    # High Noon, White Claw, Truly ≈ ~100 kcal/12oz = ~29 kcal/100ml
    # USDA doesn't have branded seltzers; closest is light beer nutritionally
    ("alcoholic beverage, beer, light",
        "High Noon (Hard Seltzer)",     "beverage", "hard_seltzer",
        ["alcohol","low_cal","gluten_free","nyc","reference"]),

    ("alcoholic beverage, hard cider",
        "Hard Cider",                   "beverage", "hard_seltzer",
        ["alcohol","apple","carbonated","gluten_free"]),

    # ── MIXERS & MODIFIERS ────────────────────────────────────────────────────
    ("alcoholic beverage, liqueur, coffee, 53 proof",
        "Coffee Liqueur (Kahlúa)",      "beverage", "liqueur",
        ["alcohol","coffee","high_sugar","digestif"]),

    ("alcoholic beverage, liqueur, coffee with cream, 34 proof",
        "Irish Cream (Baileys)",        "beverage", "liqueur",
        ["alcohol","cream","coffee","sweet"]),

    ("alcoholic beverage, wine, vermouth, dry",
        "Dry Vermouth",                 "beverage", "mixer",
        ["alcohol","fortified","low_cal","martini"]),

    ("alcoholic beverage, wine, vermouth, sweet",
        "Sweet Vermouth",               "beverage", "mixer",
        ["alcohol","fortified","manhattan","negroni"]),

    ("grenadine",
        "Grenadine Syrup",              "condiment", "mixer",
        ["sugar","pomegranate","cocktail","mixer"]),

    ("agave nectar",
        "Agave Nectar",                 "condiment", "sweetener",
        ["natural_sugar","low_gi","margarita","mixer"]),
]

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS_ALCOHOL:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total alcohol foods: {len(SEED_FOODS_ALCOHOL)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat:<20} {count}")
