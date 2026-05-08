#!/usr/bin/env python3
"""
enrich_database.py
==================
Finds all 'stub' entries in foods.json and auto-populates them
with full nutritional data from the USDA FoodData Central API.

USAGE:
  python3 enrich_database.py            # Enrich all stubs
  python3 enrich_database.py --dry-run  # Preview what would be fetched
  python3 enrich_database.py --force    # Re-fetch even 'complete' entries

REQUIREMENTS:
  pip3 install requests python-dotenv

API KEY:
  Stored in chef/.env as USDA_API_KEY
  Get a free key at: https://fdc.nal.usda.gov/api-guide.html
"""

import argparse
import json
import os
import sys
import time
from datetime import date
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip3 install requests")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    # dotenv not installed — try reading .env manually
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

API_KEY  = os.environ.get("USDA_API_KEY", "")
BASE_URL = "https://api.nal.usda.gov/fdc/v1"
DB_PATH  = Path(__file__).parent / "foods.json"

# USDA nutrient ID → our database key + unit + daily value (FDA 2020)
NUTRIENT_MAP = {
    1003: ("protein",        "g",   50),     # Protein
    1005: ("carbohydrates",  "g",   275),    # Carbohydrates
    1004: ("fat",            "g",   78),     # Total Fat
    1258: ("saturated_fat",  "g",   20),     # Saturated Fat
    1079: ("fiber",          "g",   28),     # Fiber
    2000: ("sugar",          "g",   None),   # Sugars (no DV)
    1093: ("sodium",         "mg",  2300),   # Sodium
    1162: ("vitamin_c",      "mg",  90),     # Vitamin C
    1106: ("vitamin_a",      "mcg", 900),    # Vitamin A (RAE)
    1087: ("calcium",        "mg",  1300),   # Calcium
    1089: ("iron",           "mg",  18),     # Iron
    1092: ("potassium",      "mg",  4700),   # Potassium
}


def load_db() -> dict:
    if DB_PATH.exists():
        return json.loads(DB_PATH.read_text())
    return {}


def save_db(db: dict):
    DB_PATH.write_text(json.dumps(db, indent=2, ensure_ascii=False))


def search_food(query: str) -> dict | None:
    """Search USDA for the best matching food entry."""
    resp = requests.get(
        f"{BASE_URL}/foods/search",
        params={
            "api_key":    API_KEY,
            "query":      query,
            "dataType":   "Foundation,SR Legacy",  # Prefer Foundation & SR Legacy (whole foods)
            "pageSize":   5,
        },
        timeout=10
    )
    resp.raise_for_status()
    data = resp.json()
    foods = data.get("foods", [])
    return foods[0] if foods else None


def get_food_detail(fdc_id: int) -> dict | None:
    """Fetch full nutritional detail for a specific FDC ID."""
    resp = requests.get(
        f"{BASE_URL}/food/{fdc_id}",
        params={"api_key": API_KEY},
        timeout=10
    )
    resp.raise_for_status()
    return resp.json()


def extract_nutrients(food_detail: dict) -> tuple[int | None, str, dict]:
    """Extract calories, serving size, and key nutrients from USDA food detail."""
    calories = None
    serving_size = ""
    nutrients = {}

    # Serving size
    portion = food_detail.get("foodPortions", [])
    if portion:
        p = portion[0]
        amount = p.get("amount", 1)
        unit   = p.get("modifier", p.get("measureUnit", {}).get("name", ""))
        grams  = p.get("gramWeight", "")
        serving_size = f"{amount} {unit} ({grams}g)".strip() if grams else f"{amount} {unit}".strip()

    # Nutrients
    for n in food_detail.get("foodNutrients", []):
        nutrient = n.get("nutrient", {})
        nid    = nutrient.get("id")
        amount = n.get("amount")

        if nid == 1008:  # Energy (kcal)
            calories = round(amount) if amount is not None else None

        if nid in NUTRIENT_MAP and amount is not None:
            key, unit, daily_value = NUTRIENT_MAP[nid]
            daily_pct = round((amount / daily_value) * 100) if daily_value else None
            nutrients[key] = {
                "amount":    round(amount, 2),
                "unit":      unit,
                "daily_pct": daily_pct
            }

    return calories, serving_size, nutrients


def enrich_food(food_id: str, entry: dict, dry_run: bool = False) -> dict | None:
    """Look up a food in USDA and return the enriched entry."""
    # Use display name for search (better results than underscore version)
    query = entry.get("display_name", food_id.replace("_", " "))
    print(f"  🔍 Searching USDA for: '{query}'...")

    if dry_run:
        print(f"     [DRY RUN] Would search and enrich '{food_id}'")
        return None

    try:
        result = search_food(query)
        if not result:
            print(f"  ⚠️  No USDA match found for '{query}' — leaving as stub.")
            return None

        fdc_id      = result["fdcId"]
        description = result.get("description", "")
        print(f"     Matched: '{description}' (FDC ID: {fdc_id})")

        detail = get_food_detail(fdc_id)
        calories, serving_size, nutrients = extract_nutrients(detail)

        entry.update({
            "serving_size":  serving_size or entry.get("serving_size", ""),
            "calories":      calories,
            "status":        "complete",
            "fdc_id":        fdc_id,
            "usda_name":     description,
            "last_enriched": str(date.today()),
            "nutrients":     {**entry.get("nutrients", {}), **nutrients}
        })

        cals = f"{calories} kcal" if calories else "unknown kcal"
        print(f"  ✓  Enriched '{food_id}' — {cals}, {len(nutrients)} nutrients populated.")
        return entry

    except Exception as e:
        print(f"  ✗  Error enriching '{food_id}': {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Enrich foods.json with USDA nutritional data.")
    parser.add_argument("--dry-run", action="store_true", help="Preview without making API calls")
    parser.add_argument("--force",   action="store_true", help="Re-enrich already complete entries")
    args = parser.parse_args()

    print(f"\n{'='*55}")
    print(f"  Enrich Database — USDA FoodData Central")
    print(f"  Dry run: {args.dry_run}")
    print(f"{'='*55}\n")

    if not API_KEY:
        print("ERROR: USDA_API_KEY not found. Check your chef/.env file.")
        sys.exit(1)

    db = load_db()
    if not db:
        print("  foods.json is empty. Run sync_database.py first.")
        return

    targets = {
        k: v for k, v in db.items()
        if v.get("status") == "stub" or args.force
    }

    if not targets:
        print("  No stub entries found — all foods are already enriched!")
        print("  Use --force to re-fetch existing entries.")
        return

    print(f"  Found {len(targets)} food(s) to enrich:\n")

    enriched_count = 0
    for food_id, entry in targets.items():
        result = enrich_food(food_id, entry, dry_run=args.dry_run)
        if result:
            db[food_id] = result
            enriched_count += 1
            if not args.dry_run:
                save_db(db)  # Save after each success so progress isn't lost
        time.sleep(0.3)  # Be polite to the API

    print(f"\n{'='*55}")
    if args.dry_run:
        print(f"  Dry run complete. {len(targets)} food(s) would be enriched.")
    else:
        print(f"  Done. {enriched_count}/{len(targets)} food(s) successfully enriched.")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    main()
