#!/usr/bin/env python3
"""
sync_database.py
================
Scans the finished-img/ folder and syncs new foods into foods.json as stub entries.
Run this any time you add new processed images.

USAGE:
  python3 sync_database.py

WORKFLOW:
  1. process_images.py  →  finished-img/apple.png
  2. sync_database.py   →  foods.json gets { "apple": { "status": "stub", ... } }
  3. enrich_database.py →  fills in full nutritional data from USDA API
"""

import json
import re
from datetime import date
from pathlib import Path

FINISHED_DIR = Path(__file__).parent / "img-tool" / "finished-img"
DB_PATH      = Path(__file__).parent / "foods.json"


def load_db() -> dict:
    if DB_PATH.exists() and DB_PATH.stat().st_size > 2:
        return json.loads(DB_PATH.read_text())
    return {}


def save_db(db: dict):
    DB_PATH.write_text(json.dumps(db, indent=2, ensure_ascii=False))


def to_display_name(food_id: str) -> str:
    """Convert 'bell_pepper' → 'Bell Pepper'"""
    return food_id.replace("_", " ").title()


def make_stub(food_id: str) -> dict:
    """Create a blank stub entry for a new food."""
    return {
        "id":           food_id,
        "display_name": to_display_name(food_id),
        "image":        f"{food_id}.png",
        "category":     "",          # e.g. 'fruit', 'vegetable', 'protein', 'dairy', 'grain'
        "serving_size": "",          # e.g. '1 medium (182g)'
        "calories":     None,
        "status":       "stub",      # 'stub' | 'complete'
        "date_added":   str(date.today()),
        "nutrients": {
            "protein":         {"amount": None, "unit": "g",  "daily_pct": None},
            "carbohydrates":   {"amount": None, "unit": "g",  "daily_pct": None},
            "fat":             {"amount": None, "unit": "g",  "daily_pct": None},
            "saturated_fat":   {"amount": None, "unit": "g",  "daily_pct": None},
            "fiber":           {"amount": None, "unit": "g",  "daily_pct": None},
            "sugar":           {"amount": None, "unit": "g",  "daily_pct": None},
            "sodium":          {"amount": None, "unit": "mg", "daily_pct": None},
            "vitamin_c":       {"amount": None, "unit": "mg", "daily_pct": None},
            "vitamin_a":       {"amount": None, "unit": "mcg","daily_pct": None},
            "calcium":         {"amount": None, "unit": "mg", "daily_pct": None},
            "iron":            {"amount": None, "unit": "mg", "daily_pct": None},
            "potassium":       {"amount": None, "unit": "mg", "daily_pct": None},
        }
    }


def main():
    print(f"\n{'='*55}")
    print(f"  Sync Database — foods.json")
    print(f"  Scanning: {FINISHED_DIR}")
    print(f"{'='*55}\n")

    db = load_db()
    images = sorted([f for f in FINISHED_DIR.glob("*.png") if not f.name.startswith(".")])

    if not images:
        print("  No images found in finished-img/. Run process_images.py first.")
        return

    added   = []
    skipped = []

    for img in images:
        food_id = img.stem  # filename without extension = food id
        if food_id in db:
            skipped.append(food_id)
        else:
            db[food_id] = make_stub(food_id)
            added.append(food_id)
            print(f"  ➕ Added stub: {food_id} ({to_display_name(food_id)})")

    if skipped:
        print(f"\n  — {len(skipped)} already in database: {', '.join(skipped)}")

    save_db(db)

    print(f"\n{'='*55}")
    print(f"  Done. {len(added)} new stub(s) added. {len(db)} total foods in database.")
    print(f"  Next: run enrich_database.py to fill in nutritional data.")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    main()
