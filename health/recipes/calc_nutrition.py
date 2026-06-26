#!/usr/bin/env python3
"""
Calculate per-serving nutrition for each recipe, using ingredient_matches.json
and the ingredient amounts in recipes.js.

Outputs nutrition_data.js — a JS file that can be <script>-included in the
recipes app to enrich each recipe card with macro/calorie info.

Usage:
    python3 calc_nutrition.py
"""

import sqlite3, re, json

DB_PATH = '../food/food.db'
RECIPES_JS = 'recipes.js'
MATCHES_JSON = 'ingredient_matches.json'
OUTPUT = 'nutrition_data.js'

# Volume-to-grams for common units (approximate, ingredient-agnostic)
# For accurate results these should eventually be per-ingredient density lookups.
UNIT_TO_GRAMS = {
    'cup': 240, 'cups': 240,
    'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
    'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
    'oz': 28.35,
    'lb': 453.6,
    'g': 1, 'gram': 1, 'grams': 1,
    'kg': 1000,
    'ml': 1, 'fl oz': 29.57,
    'liter': 1000, 'liters': 1000,
    'large': 50,    # egg proxy
    '': 0,          # "to taste", "optional" → 0
}

# Per-ingredient gram overrides for things volume can't capture
INGREDIENT_GRAM_OVERRIDES = {
    'egg': 50, 'eggs': 50, 'free-range eggs': 60,
    'avocado': 150, 'avocados': 150,
    'banana': 120, 'banana, thinly sliced': 80,
    'lemon': 84, 'lime': 67,
}

SKIP_UNITS = {'to taste', 'optional', 'for pan', 'for serving', 'preferred', 'to finish',
              'pinch', 'dash', 'handful', '', None}


def load_nutrients():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''SELECT food_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg
                 FROM nutrients WHERE cooking_method = 'raw' OR cooking_method IS NULL''')
    rows = c.fetchall()
    conn.close()
    # food_id → nutrients per 100g
    result = {}
    for r in rows:
        fid = r[0]
        if fid not in result:
            result[fid] = {
                'calories': r[1], 'protein': r[2], 'carbs': r[3],
                'fat': r[4], 'fiber': r[5], 'sugar': r[6], 'sodium': r[7]
            }
    return result


def parse_amount(amount_str):
    """Parse mixed fractions and decimals like '1.25', '1½', '0.33'."""
    if not amount_str or not amount_str.strip():
        return 0
    s = amount_str.strip()
    # Handle 'tbsp +' style
    s = re.sub(r'\s*\+\s*.*', '', s)
    try:
        return float(s)
    except ValueError:
        return 0


def ingredient_grams(item, amount_str, unit_str):
    """Convert an ingredient entry to grams."""
    item_lower = item.lower()

    # Direct override by ingredient name
    for key, grams in INGREDIENT_GRAM_OVERRIDES.items():
        if key in item_lower:
            amt = parse_amount(amount_str)
            return grams * amt if amt else grams

    unit = (unit_str or '').lower().strip()

    # Skip non-quantifiable
    if unit in SKIP_UNITS:
        return 0

    # Strip parenthetical gram weights like "(100g)" from unit string
    gram_match = re.search(r'\((\d+(?:\.\d+)?)\s*g\)', unit)
    if gram_match:
        base_grams = float(gram_match.group(1))
        amt = parse_amount(amount_str)
        return base_grams * (amt if amt else 1)

    amt = parse_amount(amount_str)
    if amt == 0:
        return 0

    # Look up unit
    for key, g_per_unit in UNIT_TO_GRAMS.items():
        if key and unit.startswith(key):
            return amt * g_per_unit

    # Unknown unit — can't estimate
    return 0


def extract_recipes(js_content):
    """
    Very light parser — extracts id + ingredients list from the JS array.
    Relies on the consistent formatting in recipes.js.
    """
    recipes = []
    # Find each recipe block by id
    blocks = re.split(r"\{\s*\n\s*id:", js_content)
    for block in blocks[1:]:
        id_match = re.match(r"\s*'([^']+)'", block)
        if not id_match:
            continue
        recipe_id = id_match.group(1)

        # Extract ingredients
        ing_section = re.search(r'ingredients:\s*\[(.*?)\]', block, re.DOTALL)
        if not ing_section:
            recipes.append({'id': recipe_id, 'ingredients': []})
            continue

        ing_text = ing_section.group(1)
        items = re.findall(
            r"\{\s*item:\s*'([^']+)',\s*amount:\s*'([^']*)',\s*unit:\s*'([^']*)'\s*\}",
            ing_text
        )
        recipes.append({'id': recipe_id, 'ingredients': [
            {'item': i[0], 'amount': i[1], 'unit': i[2]} for i in items
        ]})

    return recipes


def main():
    with open(MATCHES_JSON) as f:
        matches = json.load(f)

    with open(RECIPES_JS) as f:
        js = f.read()

    nutrients_db = load_nutrients()
    recipes = extract_recipes(js)

    # Extract servings from recipe names (default 4)
    servings_map = {}
    for m in re.finditer(r"id:\s*'([^']+)'.*?(?:Serves|Makes|serves|makes)\s+(\d+)", js, re.DOTALL):
        servings_map[m.group(1)] = int(m.group(2))

    output = {}

    for recipe in recipes:
        rid = recipe['id']
        servings = servings_map.get(rid, 4)

        totals = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0, 'sugar': 0, 'sodium': 0}
        mapped_count = 0
        skipped_items = []

        for ing in recipe['ingredients']:
            item = ing['item']
            match = matches.get(item)
            if not match or match['food_id'] is None:
                skipped_items.append(item)
                continue

            food_id = match['food_id']
            n = nutrients_db.get(food_id)
            if not n:
                skipped_items.append(item)
                continue

            grams = ingredient_grams(item, ing['amount'], ing['unit'])
            if grams == 0:
                skipped_items.append(f"{item} (0g — unit: {ing['unit']!r})")
                continue

            factor = grams / 100.0
            mapped_count += 1
            for key in totals:
                val = n.get(key)
                if val is not None:
                    totals[key] += val * factor

        per_serving = {k: round(v / servings, 1) for k, v in totals.items()}

        output[rid] = {
            'servings': servings,
            'per_serving': per_serving,
            'total': {k: round(v, 1) for k, v in totals.items()},
            'mapped_ingredients': mapped_count,
            'skipped_ingredients': skipped_items,
            'coverage_note': f"{mapped_count}/{len(recipe['ingredients'])} ingredients mapped"
        }

    # Write as JS module
    with open(OUTPUT, 'w') as f:
        f.write('// Auto-generated by calc_nutrition.py — do not edit by hand\n')
        f.write('// Re-run after updating recipes.js or ingredient_matches.json\n\n')
        f.write('window.NUTRITION_DATA = ')
        f.write(json.dumps(output, indent=2))
        f.write(';\n')

    print(f"\nWrote {OUTPUT}\n")
    for rid, data in output.items():
        ps = data['per_serving']
        print(f"  {rid:<35} {data['coverage_note']}")
        print(f"    per serving: {ps['calories']:.0f} kcal | P {ps['protein']:.1f}g | C {ps['carbs']:.1f}g | F {ps['fat']:.1f}g")
        if data['skipped_ingredients']:
            print(f"    skipped: {', '.join(data['skipped_ingredients'][:4])}{'...' if len(data['skipped_ingredients']) > 4 else ''}")


if __name__ == '__main__':
    main()
