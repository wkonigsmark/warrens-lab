#!/usr/bin/env python3
"""
Chef Image + USDA Pipeline
==========================
End-to-end tool for the Chef / Meal Planner image workflow.

Pipeline:
  1. Read raw PNGs from img-tool/raw-img/
  2. Remove background and standardize each image to a transparent square PNG
  3. Save finished images to img-tool/finished-img/
  4. Add new foods to ../foods.json using the existing app schema
  5. Query USDA FoodData Central for nutrition metadata
  6. Save enriched foods back to ../foods.json

Usage:
  python3 process_and_enrich.py
  python3 process_and_enrich.py --force
  python3 process_and_enrich.py --dry-run
  python3 process_and_enrich.py --skip-usda
  python3 process_and_enrich.py --only raw_baked_salmon.png raw_butter.png

Requirements:
  pip3 install Pillow rembg requests python-dotenv

Configuration:
  USDA_API_KEY should live in recipes/chef/.env
"""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is not installed. Run: pip3 install Pillow rembg requests python-dotenv")
    sys.exit(1)

# pymatting/rembg can trip numba cache issues in local script contexts. Disabling
# JIT keeps the background-removal import stable for this small batch workflow.
os.environ.setdefault("NUMBA_DISABLE_JIT", "1")

try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
    REMBG_IMPORT_ERROR = None
except Exception as exc:
    REMBG_AVAILABLE = False
    REMBG_IMPORT_ERROR = exc

try:
    import requests
except ImportError:
    requests = None

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


TOOL_DIR = Path(__file__).resolve().parent
CHEF_DIR = TOOL_DIR.parent
RAW_DIR = TOOL_DIR / "raw-img"
FINISHED_DIR = TOOL_DIR / "finished-img"
PROCESSED_LOG = TOOL_DIR / ".processed"
DB_PATH = CHEF_DIR / "foods.json"
ENV_PATH = CHEF_DIR / ".env"
BASE_URL = "https://api.nal.usda.gov/fdc/v1"

CANVAS_SIZE = 512
PADDING_PCT = 0.10
REQUEST_DELAY = 0.35

NUTRIENT_MAP = {
    1003: ("protein", "g", 50),
    1005: ("carbohydrates", "g", 275),
    1004: ("fat", "g", 78),
    1258: ("saturated_fat", "g", 20),
    1079: ("fiber", "g", 28),
    2000: ("sugar", "g", None),
    1093: ("sodium", "mg", 2300),
    1162: ("vitamin_c", "mg", 90),
    1106: ("vitamin_a", "mcg", 900),
    1087: ("calcium", "mg", 1300),
    1089: ("iron", "mg", 18),
    1092: ("potassium", "mg", 4700),
}

CATEGORY_HINTS = {
    "fruit": {"apple", "banana", "berry", "blueberry", "blackberry", "raspberry", "strawberry", "cherry", "grape", "orange", "lemon", "lime", "kiwi", "mango", "peach", "pear", "pineapple", "plum", "watermelon"},
    "vegetable": {"asparagus", "broccoli", "carrot", "cauliflower", "celery", "corn", "cucumber", "lettuce", "mushroom", "pepper", "potato", "tomato"},
    "protein": {"beef", "chicken", "cod", "egg", "fish", "hamburger", "hot_dog", "salmon"},
    "dairy": {"butter", "cheese", "cream", "milk", "sour_cream", "yogurt"},
    "grain": {"bagel", "bread", "cereal", "cheerios", "croissant", "muffin", "oatmeal", "pancake", "pasta", "pretzel", "ravioli", "spaghetti", "tortilla"},
    "drink": {"juice", "lemonade", "tea", "water"},
}


@dataclass
class PipelineResult:
    raw_name: str
    food_id: str
    output_path: Path | None = None
    image_processed: bool = False
    db_added: bool = False
    db_enriched: bool = False
    usda_name: str | None = None
    fdc_id: int | None = None
    error: str | None = None


def clean_stem(filename: str) -> str:
    stem = Path(filename).stem
    value = stem.lower().replace(" ", "_").replace("-", "_")
    value = re.sub(r"[^a-z0-9_]+", "", value)
    value = re.sub(r"_+", "_", value).strip("_")
    if value.startswith("raw_"):
        value = value[4:]
    return value


def display_name(food_id: str) -> str:
    fixes = {
        "2_percent_milk": "2 Percent Milk",
        "pbj": "Peanut Butter And Jelly",
    }
    return fixes.get(food_id, food_id.replace("_", " ").title())


def infer_category(food_id: str) -> str:
    parts = set(food_id.split("_"))
    joined = food_id.lower()
    for category, hints in CATEGORY_HINTS.items():
        if parts & hints or any(hint in joined for hint in hints):
            return category
    return ""


def blank_nutrients() -> dict[str, dict[str, Any]]:
    return {
        "protein": {"amount": None, "unit": "g", "daily_pct": None},
        "carbohydrates": {"amount": None, "unit": "g", "daily_pct": None},
        "fat": {"amount": None, "unit": "g", "daily_pct": None},
        "saturated_fat": {"amount": None, "unit": "g", "daily_pct": None},
        "fiber": {"amount": None, "unit": "g", "daily_pct": None},
        "sugar": {"amount": None, "unit": "g", "daily_pct": None},
        "sodium": {"amount": None, "unit": "mg", "daily_pct": None},
        "vitamin_c": {"amount": None, "unit": "mg", "daily_pct": None},
        "vitamin_a": {"amount": None, "unit": "mcg", "daily_pct": None},
        "calcium": {"amount": None, "unit": "mg", "daily_pct": None},
        "iron": {"amount": None, "unit": "mg", "daily_pct": None},
        "potassium": {"amount": None, "unit": "mg", "daily_pct": None},
    }


def make_stub(food_id: str) -> dict[str, Any]:
    return {
        "id": food_id,
        "display_name": display_name(food_id),
        "image": f"{food_id}.png",
        "category": infer_category(food_id),
        "serving_size": "",
        "calories": None,
        "status": "stub",
        "date_added": str(date.today()),
        "nutrients": blank_nutrients(),
    }


def load_env() -> None:
    if load_dotenv:
        load_dotenv(ENV_PATH)
        return
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def load_json(path: Path) -> dict[str, Any]:
    if path.exists() and path.stat().st_size > 2:
        return json.loads(path.read_text())
    return {}


def save_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")


def load_processed_log() -> set[str]:
    if not PROCESSED_LOG.exists():
        return set()
    return {line.strip() for line in PROCESSED_LOG.read_text().splitlines() if line.strip()}


def save_processed_log(processed: set[str]) -> None:
    PROCESSED_LOG.write_text("\n".join(sorted(processed)) + ("\n" if processed else ""))


def process_image(src_path: Path, canvas_size: int, padding_pct: float) -> Path:
    if not REMBG_AVAILABLE:
        detail = f": {REMBG_IMPORT_ERROR}" if REMBG_IMPORT_ERROR else ""
        raise RuntimeError(f"rembg is not available{detail}. Run: pip3 install rembg")

    raw_bytes = src_path.read_bytes()
    cleaned_bytes = rembg_remove(raw_bytes)
    img = Image.open(io.BytesIO(cleaned_bytes)).convert("RGBA")

    _, _, _, alpha = img.split()
    bbox = alpha.getbbox()
    if bbox is None:
        raise RuntimeError("image appears fully transparent after background removal")

    cropped = img.crop(bbox)
    width, height = cropped.size
    pad = int(max(width, height) * padding_pct)
    padded = Image.new("RGBA", (width + pad * 2, height + pad * 2), (0, 0, 0, 0))
    padded.paste(cropped, (pad, pad), mask=cropped.split()[3])

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    scale = min(canvas_size / padded.width, canvas_size / padded.height)
    resized = padded.resize((int(padded.width * scale), int(padded.height * scale)), Image.LANCZOS)
    offset = ((canvas_size - resized.width) // 2, (canvas_size - resized.height) // 2)
    canvas.paste(resized, offset, mask=resized.split()[3])

    FINISHED_DIR.mkdir(parents=True, exist_ok=True)
    output_path = FINISHED_DIR / f"{clean_stem(src_path.name)}.png"
    canvas.save(output_path, "PNG", optimize=True)
    return output_path


def usda_search(query: str, api_key: str, page_size: int = 8) -> dict[str, Any] | None:
    if requests is None:
        raise RuntimeError("requests is not installed. Run: pip3 install requests")
    response = requests.get(
        f"{BASE_URL}/foods/search",
        params={
            "api_key": api_key,
            "query": query,
            "dataType": "Foundation,SR Legacy",
            "pageSize": page_size,
        },
        timeout=15,
    )
    response.raise_for_status()
    foods = response.json().get("foods", [])
    return choose_best_usda_match(query, foods)


def choose_best_usda_match(query: str, foods: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not foods:
        return None
    query_words = set(re.findall(r"[a-z0-9]+", query.lower()))

    def score(food: dict[str, Any]) -> tuple[int, int, int]:
        description = food.get("description", "").lower()
        data_type = food.get("dataType", "")
        desc_words = set(re.findall(r"[a-z0-9]+", description))
        overlap = len(query_words & desc_words)
        foundation_bonus = 3 if data_type == "Foundation" else 0
        exact_bonus = 5 if description == query.lower() else 0
        return (exact_bonus + foundation_bonus + overlap, -len(description), -int(food.get("fdcId", 0)))

    return sorted(foods, key=score, reverse=True)[0]


def usda_detail(fdc_id: int, api_key: str) -> dict[str, Any]:
    if requests is None:
        raise RuntimeError("requests is not installed. Run: pip3 install requests")
    response = requests.get(f"{BASE_URL}/food/{fdc_id}", params={"api_key": api_key}, timeout=15)
    response.raise_for_status()
    return response.json()


def extract_nutrients(food_detail: dict[str, Any]) -> tuple[int | None, str, dict[str, dict[str, Any]]]:
    calories = None
    serving_size = ""
    nutrients: dict[str, dict[str, Any]] = {}

    portions = food_detail.get("foodPortions", [])
    if portions:
        portion = portions[0]
        amount = portion.get("amount", 1)
        unit = portion.get("modifier") or portion.get("measureUnit", {}).get("name", "")
        grams = portion.get("gramWeight")
        serving_size = f"{amount} {unit} ({grams}g)".strip() if grams else f"{amount} {unit}".strip()

    for item in food_detail.get("foodNutrients", []):
        nutrient = item.get("nutrient", {})
        nutrient_id = nutrient.get("id")
        amount = item.get("amount")

        if nutrient_id == 1008 and amount is not None:
            calories = round(amount)

        if nutrient_id in NUTRIENT_MAP and amount is not None:
            key, unit, daily_value = NUTRIENT_MAP[nutrient_id]
            nutrients[key] = {
                "amount": round(float(amount), 2),
                "unit": unit,
                "daily_pct": round((float(amount) / daily_value) * 100) if daily_value else None,
            }

    return calories, serving_size, nutrients


def enrich_entry(food_id: str, entry: dict[str, Any], api_key: str) -> dict[str, Any] | None:
    query = entry.get("display_name") or display_name(food_id)
    match = usda_search(query, api_key)
    if not match:
        return None

    fdc_id = int(match["fdcId"])
    description = match.get("description", "")
    detail = usda_detail(fdc_id, api_key)
    calories, serving_size, nutrients = extract_nutrients(detail)

    merged_nutrients = blank_nutrients()
    merged_nutrients.update(entry.get("nutrients", {}))
    merged_nutrients.update(nutrients)

    entry.update({
        "serving_size": serving_size or entry.get("serving_size", ""),
        "calories": calories,
        "status": "complete",
        "fdc_id": fdc_id,
        "usda_name": description,
        "last_enriched": str(date.today()),
        "nutrients": merged_nutrients,
    })
    return entry


def find_raw_images(only: list[str] | None = None) -> list[Path]:
    if only:
        paths = []
        for name in only:
            path = RAW_DIR / name
            if not path.suffix:
                path = path.with_suffix(".png")
            paths.append(path)
        return sorted(paths)
    return sorted(path for path in RAW_DIR.glob("*.png") if not path.name.startswith("."))


def run_pipeline(args: argparse.Namespace) -> list[PipelineResult]:
    load_env()
    api_key = os.environ.get("USDA_API_KEY", "")
    if not args.skip_usda and not api_key:
        raise RuntimeError("USDA_API_KEY not found. Add it to recipes/chef/.env or run with --skip-usda.")

    if not REMBG_AVAILABLE and not args.skip_images and not args.dry_run:
        detail = f": {REMBG_IMPORT_ERROR}" if REMBG_IMPORT_ERROR else ""
        raise RuntimeError(f"rembg is required for image processing{detail}. Run: pip3 install rembg")

    db = load_json(DB_PATH)
    processed = load_processed_log() if not args.force else set()
    raw_images = find_raw_images(args.only)
    results: list[PipelineResult] = []

    for src in raw_images:
        food_id = clean_stem(src.name)
        result = PipelineResult(raw_name=src.name, food_id=food_id)
        results.append(result)

        if not src.exists():
            result.error = "raw file not found"
            continue

        try:
            if args.skip_images:
                output_path = FINISHED_DIR / f"{food_id}.png"
                if not output_path.exists():
                    raise RuntimeError(f"finished image missing: {output_path.name}")
            elif src.name in processed and not args.force:
                output_path = FINISHED_DIR / f"{food_id}.png"
                print(f"  - {src.name} already processed")
            elif args.dry_run:
                output_path = FINISHED_DIR / f"{food_id}.png"
                print(f"  [DRY RUN] Would process {src.name} -> {output_path.name}")
            else:
                print(f"  Processing image: {src.name}")
                output_path = process_image(src, args.size, args.padding)
                processed.add(src.name)
                save_processed_log(processed)
                result.image_processed = True

            result.output_path = output_path

            if food_id not in db:
                db[food_id] = make_stub(food_id)
                result.db_added = True
                print(f"  Added foods.json stub: {food_id}")
            else:
                db[food_id].setdefault("id", food_id)
                db[food_id].setdefault("display_name", display_name(food_id))
                db[food_id]["image"] = f"{food_id}.png"
                db[food_id].setdefault("category", infer_category(food_id))
                db[food_id].setdefault("nutrients", blank_nutrients())

            should_enrich = not args.skip_usda and (args.force_usda or db[food_id].get("status") != "complete")
            if should_enrich:
                if args.dry_run:
                    print(f"  [DRY RUN] Would query USDA for {db[food_id].get('display_name', food_id)}")
                else:
                    print(f"  Querying USDA: {db[food_id].get('display_name', food_id)}")
                    enriched = enrich_entry(food_id, db[food_id], api_key)
                    if enriched:
                        db[food_id] = enriched
                        result.db_enriched = True
                        result.usda_name = enriched.get("usda_name")
                        result.fdc_id = enriched.get("fdc_id")
                        print(f"  Enriched: {food_id} -> {result.usda_name} (FDC {result.fdc_id})")
                    else:
                        print(f"  No USDA match found for {food_id}; leaving as stub")
                time.sleep(args.delay)

            if not args.dry_run:
                save_json(DB_PATH, dict(sorted(db.items())))

        except Exception as exc:
            result.error = str(exc)
            print(f"  ERROR {src.name}: {exc}")

    if not args.dry_run:
        save_json(DB_PATH, dict(sorted(db.items())))
    return results


def print_summary(results: list[PipelineResult]) -> None:
    processed = sum(1 for result in results if result.image_processed)
    added = sum(1 for result in results if result.db_added)
    enriched = sum(1 for result in results if result.db_enriched)
    errors = [result for result in results if result.error]

    print(f"\n{'=' * 64}")
    print("  Chef Image + USDA Pipeline Complete")
    print(f"  Images processed: {processed}")
    print(f"  JSON entries added: {added}")
    print(f"  USDA entries enriched: {enriched}")
    print(f"  Errors: {len(errors)}")
    if errors:
        print("\n  Error details:")
        for result in errors:
            print(f"    - {result.raw_name}: {result.error}")
    print(f"{'=' * 64}\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Process Chef food images, sync foods.json, and enrich with USDA metadata.")
    parser.add_argument("--force", action="store_true", help="Reprocess raw images even if listed in .processed")
    parser.add_argument("--force-usda", action="store_true", help="Re-query USDA even for complete entries")
    parser.add_argument("--dry-run", action="store_true", help="Preview image/database/USDA actions without writing changes")
    parser.add_argument("--skip-images", action="store_true", help="Do not transform images; use existing finished-img PNGs")
    parser.add_argument("--skip-usda", action="store_true", help="Do not query USDA; only process images and add JSON stubs")
    parser.add_argument("--only", nargs="+", help="Only process these raw image filenames")
    parser.add_argument("--size", type=int, default=CANVAS_SIZE, help=f"Output canvas size in px (default: {CANVAS_SIZE})")
    parser.add_argument("--padding", type=float, default=PADDING_PCT, help=f"Padding fraction around food (default: {PADDING_PCT})")
    parser.add_argument("--delay", type=float, default=REQUEST_DELAY, help=f"Delay between USDA calls in seconds (default: {REQUEST_DELAY})")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    print(f"\n{'=' * 64}")
    print("  Chef Image + USDA Pipeline")
    print(f"  Raw images: {RAW_DIR}")
    print(f"  Finished images: {FINISHED_DIR}")
    print(f"  JSON database: {DB_PATH}")
    print(f"  Canvas: {args.size}x{args.size}px | Padding: {int(args.padding * 100)}%")
    print(f"{'=' * 64}\n")
    try:
        results = run_pipeline(args)
    except Exception as exc:
        print(f"ERROR: {exc}")
        sys.exit(1)
    print_summary(results)


if __name__ == "__main__":
    main()
