"""
USDA FoodData Central enrichment engine.
Searches for each food, picks the best match (Foundation > SR Legacy > Survey),
and writes full nutrients + amino acids + serving sizes to food.db.

Usage:
    python enrich.py                    # enrich all unenriched foods
    python enrich.py --food "salmon"    # enrich a specific food by name
    python enrich.py --fdc 175167       # enrich by FDC ID directly
    python enrich.py --seed             # load seed list and enrich everything
"""

import json
import os
import re
import sys
import time
import argparse
from pathlib import Path

import ssl
import urllib.request
import urllib.parse
import certifi

from schema import get_connection, init_db, DB_PATH

SSL_CTX = ssl.create_default_context(cafile=certifi.where())

# ── Config ────────────────────────────────────────────────────────────────────

def load_api_key():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("USDA_API_KEY="):
                return line.split("=", 1)[1].strip()
    key = os.environ.get("USDA_API_KEY")
    if not key:
        raise RuntimeError("No USDA_API_KEY found in .env or environment")
    return key

BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# Priority order for data type (Foundation has most complete nutrient profiles)
DATA_TYPE_PRIORITY = {
    "Foundation": 0,
    "SR Legacy": 1,
    "Survey (FNDDS)": 2,
    "Branded": 3,
}

# ── HTTP helpers ──────────────────────────────────────────────────────────────

def _get(url, params, api_key):
    params["api_key"] = api_key
    query = urllib.parse.urlencode(params)
    full_url = f"{url}?{query}"
    req = urllib.request.Request(full_url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as resp:
        return json.loads(resp.read().decode())

def search_food(query, api_key, data_types=None):
    """Return list of matching foods from USDA search."""
    params = {
        "query": query,
        "pageSize": 10,
    }
    if data_types:
        params["dataType"] = ",".join(data_types)
    data = _get(f"{BASE_URL}/foods/search", params, api_key)
    return data.get("foods", [])

def get_food_detail(fdc_id, api_key):
    """Fetch full nutrient detail for a specific FDC ID."""
    params = {"format": "full"}
    return _get(f"{BASE_URL}/food/{fdc_id}", params, api_key)

# ── Nutrient ID → field mapping ───────────────────────────────────────────────
# USDA nutrient IDs: https://api.nal.usda.gov/fdc/v1/nutrients

NUTRIENT_MAP = {
    # Macros — Foundation foods use 2048, SR Legacy uses 1008
    1008: "calories",
    2047: "calories",  # Energy (Atwater General Factors) - Foundation
    2048: "calories",  # Energy (Atwater Specific Factors) - Foundation (preferred)
    1003: "protein_g",
    1005: "carbs_g",
    1079: "fiber_g",
    2000: "sugar_g",
    1004: "fat_g",
    1258: "saturated_fat_g",
    1292: "monounsaturated_fat_g",
    1293: "polyunsaturated_fat_g",
    1257: "trans_fat_g",
    1253: "cholesterol_mg",
    1051: "water_g",
    1018: "alcohol_g",
    # Net carbs is computed

    # Vitamins
    1106: "vitamin_a_mcg",
    1165: "vitamin_b1_mg",
    1166: "vitamin_b2_mg",
    1167: "vitamin_b3_mg",
    1170: "vitamin_b5_mg",
    1175: "vitamin_b6_mg",
    1176: "vitamin_b7_mcg",
    1190: "vitamin_b9_mcg",
    1178: "vitamin_b12_mcg",
    1162: "vitamin_c_mg",
    1114: "vitamin_d_mcg",
    1109: "vitamin_e_mg",
    1185: "vitamin_k_mcg",

    # Minerals
    1087: "calcium_mg",
    1096: "chromium_mcg",
    1098: "copper_mg",
    1099: "fluoride_mg",
    1100: "iodine_mcg",
    1089: "iron_mg",
    1090: "magnesium_mg",
    1101: "manganese_mg",
    1102: "molybdenum_mcg",
    1091: "phosphorus_mg",
    1092: "potassium_mg",
    1103: "selenium_mcg",
    1093: "sodium_mg",
    1095: "zinc_mg",

    # Fatty acids
    1404: "omega3_ala_g",
    1278: "omega3_epa_g",
    1272: "omega3_dha_g",
    1269: "omega6_linoleic_g",
    1271: "omega6_arachidonic_g",
}

AMINO_MAP = {
    1221: "histidine_mg",
    1212: "isoleucine_mg",
    1213: "leucine_mg",
    1214: "lysine_mg",
    1215: "methionine_mg",
    1217: "phenylalanine_mg",
    1211: "threonine_mg",
    1210: "tryptophan_mg",
    1219: "valine_mg",
    1222: "alanine_mg",
    1220: "arginine_mg",
    1223: "aspartic_acid_mg",
    1216: "cystine_mg",
    1224: "glutamic_acid_mg",
    1225: "glycine_mg",
    1226: "proline_mg",
    1227: "serine_mg",
    1228: "tyrosine_mg",
}

# ── Best-match selection ──────────────────────────────────────────────────────

def best_match(candidates):
    """Pick the best USDA result: Foundation first, then SR Legacy, then others."""
    if not candidates:
        return None
    scored = []
    for c in candidates:
        dt = c.get("dataType", "")
        priority = DATA_TYPE_PRIORITY.get(dt, 99)
        scored.append((priority, c))
    scored.sort(key=lambda x: x[0])
    return scored[0][1]

# ── Parse a detail response → nutrient dicts ──────────────────────────────────

def parse_nutrients(detail):
    """Extract nutrient and amino acid dicts (per 100g) from a detail response."""
    nutrients = {}
    aminos = {}

    # Track which nutrient ID filled each field so we can prefer more specific ones
    # Priority: 2048 > 2047 > 1008 for calories
    calorie_priority = {2048: 0, 2047: 1, 1008: 2}
    calorie_filled_by = None

    for n in detail.get("foodNutrients", []):
        nid = n.get("nutrient", {}).get("id") or n.get("nutrientId")
        amount = n.get("amount")
        if nid is None or amount is None:
            continue
        if nid in NUTRIENT_MAP:
            field = NUTRIENT_MAP[nid]
            if field == "calories":
                # Only overwrite with a higher-priority source
                cur_pri = calorie_priority.get(calorie_filled_by, 99)
                new_pri = calorie_priority.get(nid, 99)
                if calorie_filled_by is None or new_pri < cur_pri:
                    nutrients["calories"] = float(amount)
                    calorie_filled_by = nid
            else:
                nutrients[field] = float(amount)
        elif nid in AMINO_MAP:
            aminos[AMINO_MAP[nid]] = float(amount)

    # Compute net carbs
    carbs = nutrients.get("carbs_g", 0) or 0
    fiber = nutrients.get("fiber_g", 0) or 0
    sugar_alc = nutrients.get("sugar_alcohol_g", 0) or 0
    nutrients["net_carbs_g"] = max(0, carbs - fiber - sugar_alc)

    return nutrients, aminos

def parse_serving_sizes(detail):
    """Extract serving size options from a detail response."""
    servings = []
    # Standard 100g reference
    servings.append({"description": "100g", "grams": 100.0, "is_default": 0, "source": "standard"})

    portions = detail.get("foodPortions", [])
    for p in portions:
        gram_weight = p.get("gramWeight")
        if not gram_weight:
            continue
        desc = p.get("portionDescription") or p.get("modifier") or ""
        amount = p.get("amount", 1)
        if amount and amount != 1:
            desc = f"{amount} {desc}".strip()
        servings.append({
            "description": desc or "serving",
            "grams": float(gram_weight),
            "is_default": 0,
            "source": "usda",
        })

    # Mark the first non-100g serving as default if available
    non_std = [s for s in servings if s["description"] != "100g"]
    if non_std:
        non_std[0]["is_default"] = 1
    else:
        servings[0]["is_default"] = 1

    return servings

# ── Database write ─────────────────────────────────────────────────────────────

def upsert_food(conn, name, display_name, category, subcategory, tags):
    c = conn.cursor()
    c.execute("SELECT id FROM foods WHERE name = ?", (name,))
    row = c.fetchone()
    if row:
        return row["id"]
    c.execute("""
        INSERT INTO foods (name, display_name, category, subcategory, tags)
        VALUES (?, ?, ?, ?, ?)
    """, (name, display_name, category, subcategory, json.dumps(tags)))
    conn.commit()
    return c.lastrowid

def write_nutrients(conn, food_id, nutrients, aminos, fdc_id, usda_type, servings):
    c = conn.cursor()

    # Update food metadata
    c.execute("""
        UPDATE foods SET fdc_id=?, usda_type=?, verified=1, last_enriched=date('now')
        WHERE id=?
    """, (fdc_id, usda_type, food_id))

    # Upsert nutrients (raw method)
    cols = list(nutrients.keys())
    col_names = ",".join(cols)
    placeholders = ",".join(["?"] * len(cols))
    updates = ",".join(f"{col}=excluded.{col}" for col in cols)

    values = [food_id] + [nutrients[k] for k in cols]
    c.execute(f"""
        INSERT INTO nutrients (food_id, cooking_method, per_grams, data_source, {col_names})
        VALUES (?, 'raw', 100, 'usda_api', {placeholders})
        ON CONFLICT(food_id, cooking_method) DO UPDATE SET
            data_source=excluded.data_source, {updates}
    """, values)

    # Upsert amino acids
    if aminos:
        a_cols = list(aminos.keys())
        a_ph = ",".join(["?"] * len(a_cols))
        a_names = ",".join(a_cols)
        a_updates = ",".join(f"{col}=excluded.{col}" for col in a_cols)

        c.execute(f"""
            INSERT INTO amino_acids (food_id, cooking_method, {a_names})
            VALUES (?, 'raw', {a_ph})
            ON CONFLICT(food_id, cooking_method) DO UPDATE SET {a_updates}
        """, [food_id] + [aminos[k] for k in a_cols])

    # Insert serving sizes (skip if already have them)
    c.execute("SELECT COUNT(*) as n FROM serving_sizes WHERE food_id=?", (food_id,))
    if c.fetchone()["n"] == 0:
        for s in servings:
            c.execute("""
                INSERT INTO serving_sizes (food_id, description, grams, is_default, source)
                VALUES (?, ?, ?, ?, ?)
            """, (food_id, s["description"], s["grams"], s["is_default"], s["source"]))

    conn.commit()

# ── Main enrichment logic ─────────────────────────────────────────────────────

def enrich_food(conn, api_key, name, display_name, category, subcategory, tags, verbose=True, sr_only=False):
    if verbose:
        print(f"  Searching: {display_name!r} ({name!r})")

    if sr_only:
        candidates = search_food(name, api_key, data_types=["SR Legacy"])
    else:
        # Search Foundation + SR Legacy first, then fall back to all types
        candidates = search_food(name, api_key, data_types=["Foundation", "SR Legacy"])
    if not candidates:
        candidates = search_food(name, api_key)
    if not candidates:
        print(f"    ✗ No USDA results for: {name!r}")
        return False

    match = best_match(candidates)
    fdc_id = match["fdcId"]
    usda_type = match.get("dataType", "Unknown")

    if verbose:
        print(f"    → FDC {fdc_id} [{usda_type}]: {match.get('description', '')[:70]}")

    # Get full detail
    detail = get_food_detail(fdc_id, api_key)
    nutrients, aminos = parse_nutrients(detail)
    servings = parse_serving_sizes(detail)

    if not nutrients.get("calories"):
        print(f"    ✗ No calorie data in response for FDC {fdc_id}")
        return False

    # Upsert food record
    food_id = upsert_food(conn, name, display_name, category, subcategory, tags)
    if not food_id:
        print(f"    ✗ Could not insert food record for {name!r}")
        return False

    write_nutrients(conn, food_id, nutrients, aminos, fdc_id, usda_type, servings)

    cal = nutrients.get("calories", 0)
    prot = nutrients.get("protein_g", 0)
    if verbose:
        print(f"    ✓ {cal:.0f} kcal, {prot:.1f}g protein, {len(nutrients)} nutrients, {len(aminos)} amino acids")

    return True

def enrich_all_seeds(verbose=True, seed_module="seed_list"):
    if seed_module == "seed_list":
        from seed_list import SEED_FOODS as foods
    elif seed_module == "seed_list_v2":
        from seed_list_v2 import SEED_FOODS_V2 as foods
    elif seed_module == "seed_list_v2_fixes":
        from seed_list_v2_fixes import SEED_FIXES as foods
    elif seed_module == "seed_list_v2_retry":
        from seed_list_v2_retry import SEED_RETRY as foods
    elif seed_module == "seed_list_v3":
        from seed_list_v3 import SEED_FOODS_V3 as foods
    else:
        from seed_list_v4 import SEED_FOODS_V4 as foods

    if not DB_PATH.exists():
        init_db()

    api_key = load_api_key()
    conn = get_connection()

    sr_only = seed_module in ("seed_list_v2_retry", "seed_list_v3", "seed_list_v4")

    ok, fail = 0, 0
    for item in foods:
        name, display_name, category, subcategory, tags = item
        try:
            success = enrich_food(conn, api_key, name, display_name, category, subcategory, tags, verbose, sr_only=sr_only)
            if success:
                ok += 1
            else:
                fail += 1
            time.sleep(0.25)  # be polite to USDA API
        except Exception as e:
            print(f"    ✗ Error for {name!r}: {e}")
            fail += 1
            time.sleep(1)

    conn.close()
    print(f"\nDone. ✓ {ok} enriched, ✗ {fail} failed.")

# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="USDA food enrichment engine")
    parser.add_argument("--seed", action="store_true", help="Enrich all seed list foods (seed_list.py)")
    parser.add_argument("--seed-v2", action="store_true", help="Enrich expansion seed list (seed_list_v2.py, ~200 new foods)")
    parser.add_argument("--seed-fixes", action="store_true", help="Re-enrich failed/unenriched v2 items with corrected search terms")
    parser.add_argument("--seed-retry", action="store_true", help="Retry 36 unenriched foods with correct SR Legacy search terms")
    parser.add_argument("--seed-v3", action="store_true", help="Enrich v3 expansion (~130 new foods, SR Legacy only)")
    parser.add_argument("--seed-v4", action="store_true", help="Enrich v4 expansion (~140 new foods, SR Legacy only)")
    parser.add_argument("--food", type=str, help="Search and enrich a single food by name")
    parser.add_argument("--display", type=str, default=None, help="Display name for --food")
    parser.add_argument("--category", type=str, default="other", help="Category for --food")
    parser.add_argument("--fdc", type=int, help="Enrich a food by FDC ID directly")
    parser.add_argument("--quiet", action="store_true", help="Suppress per-food output")
    args = parser.parse_args()

    if not DB_PATH.exists():
        init_db()

    api_key = load_api_key()
    conn = get_connection()
    verbose = not args.quiet

    if args.seed:
        conn.close()
        enrich_all_seeds(verbose, seed_module="seed_list")

    elif args.seed_v2:
        conn.close()
        enrich_all_seeds(verbose, seed_module="seed_list_v2")

    elif args.seed_fixes:
        conn.close()
        enrich_all_seeds(verbose, seed_module="seed_list_v2_fixes")

    elif args.seed_retry:
        conn.close()
        enrich_all_seeds(verbose, seed_module="seed_list_v2_retry")

    elif args.seed_v3:
        conn.close()
        enrich_all_seeds(verbose, seed_module="seed_list_v3")

    elif args.seed_v4:
        conn.close()
        enrich_all_seeds(verbose, seed_module="seed_list_v4")

    elif args.food:
        display = args.display or args.food.title()
        enrich_food(conn, api_key, args.food, display, args.category, None, [], verbose)
        conn.close()

    elif args.fdc:
        detail = get_food_detail(args.fdc, api_key)
        desc = detail.get("description", "Unknown")
        print(f"FDC {args.fdc}: {desc}")
        nutrients, aminos = parse_nutrients(detail)
        for k, v in nutrients.items():
            print(f"  {k}: {v}")
        conn.close()

    else:
        parser.print_help()
