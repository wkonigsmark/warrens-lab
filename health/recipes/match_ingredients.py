#!/usr/bin/env python3
"""
Match recipe ingredients to food.db entries.
Outputs a JSON file for manual review, then can be used to enrich recipes.js.

Usage:
    python3 match_ingredients.py            # generate matches.json
    python3 match_ingredients.py --review   # print review summary
"""

import sqlite3, re, json, sys
from difflib import SequenceMatcher

DB_PATH = '../food/food.db'
RECIPES_JS = 'recipes.js'
OUTPUT = 'ingredient_matches.json'

STOP_WORDS = {
    'raw', 'fresh', 'cooked', 'dried', 'frozen', 'canned', 'sliced', 'diced',
    'chopped', 'minced', 'grated', 'shredded', 'melted', 'unsalted', 'salted',
    'cold', 'hot', 'small', 'large', 'medium', 'thin', 'thinly', 'thick',
    'optional', 'or', 'and', 'to', 'taste', 'for', 'serving', 'pan', 'preferred',
    'finish', 'cut', 'into', '8', 'slices', 'beaten', 'ground', 'whole',
    'plain', 'free-range', 'extra-virgin', 'extra', 'virgin',
}

# Manual overrides: ingredient text fragment → food_id
# Add entries here after reviewing matches.json to fix bad auto-matches.
OVERRIDES = {
    # --- not in food db, skip ---
    'agave syrup': None,
    'baking powder': None,
    'taco seasoning': None,
    'vanilla extract': None,
    'toasted sesame oil': None,
    'toasted sesame oil (noodles)': None,
    'toasted sesame oil (tofu)': None,
    'rice bran oil': None,
    'oyster sauce or hoisin': None,
    'noodles (sweet potato, soba, or udon)': None,
    'nori sheets': None,
    'guanciale': None,
    'guanciale or pancetta': None,
    'breadcrumbs': None,
    'brioche or slider buns': None,
    'thick-cut bread (brioche or challah)': None,
    'white wine': None,
    'pecorino romano': None,
    'rigatoni or mezzemaniche': None,
    'balsamic glaze': None,
    'guacamole': None,
    '— ballard special croutons —': None,
    '— for the dressing —': None,
    '— for the salad —': None,
    'z bar': None,
    'applesauce pouch': None,
    'cheese puffs': None,
    'popcorn': None,
    'pretzels': None,
    'pretzels or crackers': None,
    'cottage cheese cup': None,
    'greek yogurt cup': None,
    'mozz string cheese': None,
    'string cheese': None,
    'cucumber sticks': None,
    'grapes': None,
    # --- seasoning combos: too ambiguous, skip ---
    'salt & pepper': None,
    'salt & black pepper': None,
    'salt, pepper & oregano': None,
    'fresh cracked pepper': None,
    'fresh cracked black pepper': None,

    # --- resolved manually ---
    'soy sauce': 86,
    'soy sauce (noodles)': 86,
    'soy sauce (tofu)': 86,
    'avocados': 54,
    'avocado': 54,
    'baby spinach': 19,
    'bacon or pancetta': 612,
    'black peppercorns': 269,
    'broccoli florets': 102,
    'broth (chicken, beef, or veg)': 500,          # chicken bone broth as proxy
    'bucatini or spaghetti': 594,
    'chicken breasts, sliced thin': 1,
    'cod fillets': 6,
    'chinese broccoli (or similar greens)': 102,
    'dry chili flakes': 270,                        # cayenne as proxy
    'red pepper flakes': 270,
    'free-range eggs': 96,
    'fresh cracked pepper': None,
    'freshly grated parmesan': 307,
    'frozen shelled edamame, thawed': 366,
    'firm tofu, cut into 8 slices': None,           # tofu not in db yet
    'maple syrup (in the mix)': 542,
    'peeled plum tomatoes': 549,                    # diced tomatoes as proxy
    'penne or favorite pasta': 522,
    'purple onion': 37,
    'red onion': 37,
    'rigatoni or mezzemaniche': 594,                # spaghetti dry as proxy
    'rotini or penne pasta': 523,
    'rustic bread': 194,                            # sourdough as proxy
    'salmon fillets': 5,
    'shredded mild cheddar': 107,
    'small pasta (shells or elbows)': 353,          # white pasta dry
    'spaghetti or tonnarelli': 594,
    'white wine': None,
}


def load_foods():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, name, display_name, category FROM foods')
    foods = [{'id': r[0], 'name': r[1], 'display_name': r[2], 'category': r[3]} for r in c.fetchall()]
    conn.close()
    return foods


def normalize(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    words = [w for w in text.split() if w not in STOP_WORDS]
    return ' '.join(words)


def score(ingredient_norm, food):
    food_norm = normalize(food['name'] + ' ' + food['display_name'])
    # Token overlap
    ing_tokens = set(ingredient_norm.split())
    food_tokens = set(food_norm.split())
    if not ing_tokens:
        return 0
    overlap = len(ing_tokens & food_tokens) / len(ing_tokens)
    # Sequence similarity
    seq = SequenceMatcher(None, ingredient_norm, food_norm).ratio()
    return 0.7 * overlap + 0.3 * seq


def extract_ingredients(js_content):
    return list(set(re.findall(r"{ item: '([^']+)'", js_content)))


def find_matches(ingredient, foods, top_n=3):
    norm = normalize(ingredient)
    if not norm.strip():
        return []
    scored = [(score(norm, f), f) for f in foods]
    scored.sort(key=lambda x: -x[0])
    return [(round(s, 3), f) for s, f in scored[:top_n] if s > 0.05]


def main():
    with open(RECIPES_JS) as f:
        js = f.read()

    ingredients = extract_ingredients(js)
    ingredients = [i for i in ingredients if not i.startswith('—')]
    ingredients.sort()

    foods = load_foods()

    results = {}
    skipped = []
    auto_matched = []
    needs_review = []

    for ing in ingredients:
        ing_lower = ing.lower()

        # Check overrides
        override_key = next((k for k in OVERRIDES if k in ing_lower), None)
        if override_key is not None:
            food_id = OVERRIDES[override_key]
            results[ing] = {
                'food_id': food_id,
                'confidence': 'override',
                'match_name': None,
                'candidates': []
            }
            if food_id is None:
                skipped.append(ing)
            continue

        matches = find_matches(ing, foods)
        if not matches:
            results[ing] = {'food_id': None, 'confidence': 'no_match', 'match_name': None, 'candidates': []}
            needs_review.append(ing)
            continue

        top_score, top_food = matches[0]
        candidates = [{'food_id': s[1]['id'], 'name': s[1]['display_name'], 'category': s[1]['category'], 'score': s[0]} for s in matches]

        if top_score >= 0.65:
            confidence = 'high'
            auto_matched.append(ing)
        elif top_score >= 0.35:
            confidence = 'medium'
            needs_review.append(ing)
        else:
            confidence = 'low'
            needs_review.append(ing)

        results[ing] = {
            'food_id': top_food['id'] if top_score >= 0.65 else None,
            'confidence': confidence,
            'match_name': top_food['display_name'],
            'candidates': candidates
        }

    with open(OUTPUT, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n✅ Matched {len(auto_matched)} ingredients automatically (high confidence)")
    print(f"⚠️  {len(needs_review)} need manual review")
    print(f"⛔  {len(skipped)} skipped (no food db entry)\n")
    print(f"Review {OUTPUT} — for each 'medium'/'low' entry, set food_id to the correct candidate id, or null to skip.")
    print(f"Then add confirmed food_ids to OVERRIDES and re-run to finalize.")

    if '--review' in sys.argv:
        print('\n--- NEEDS REVIEW ---')
        for ing in needs_review:
            r = results[ing]
            print(f"\n  [{r['confidence'].upper()}] {ing!r}")
            for c in r['candidates']:
                print(f"    {c['food_id']:>4}  {c['name']:<35} ({c['category']})  score={c['score']}")


if __name__ == '__main__':
    main()
