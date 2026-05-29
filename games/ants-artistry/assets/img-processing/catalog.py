#!/usr/bin/env python3
"""
Ants & Artistry — image catalog / manifest generator.

Scans assets/images/<category>/*.png, parses the "name-#" convention, and
writes assets/images/manifest.json. This single manifest is the source of
truth for BOTH:
  - the live drag-and-drop tool (its element gallery), and
  - the catalog admin dashboard (catalog.html).

Naming convention:
  lion-1.png, lion-2.png  -> base type "lion" (count 2)
  ice-cream-1.png         -> base type "ice-cream" (only the trailing -# is stripped)
  heart.png               -> base type "heart", num null

Run directly:   python3 catalog.py
Or it runs automatically at the end of process.py.
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
IMAGES = HERE.parent / "images"
MANIFEST = IMAGES / "manifest.json"

# Preferred display order; any other folders are appended alphabetically.
PREFERRED_ORDER = [
    "animals", "constructs", "nature", "landscapes", "food", "objects", "misc",
]

NAME_NUM = re.compile(r"^(?P<base>.+)-(?P<num>\d+)$")


def titleize(base: str) -> str:
    return " ".join(w.capitalize() for w in base.replace("_", "-").split("-"))


def parse_stem(stem: str):
    m = NAME_NUM.match(stem)
    if m:
        return m.group("base"), int(m.group("num"))
    return stem, None


def build_manifest() -> dict:
    if not IMAGES.exists():
        raise SystemExit(f"images folder not found: {IMAGES}")

    folders = sorted(p.name for p in IMAGES.iterdir() if p.is_dir())
    ordered = [c for c in PREFERRED_ORDER if c in folders] + \
              [c for c in folders if c not in PREFERRED_ORDER]

    categories = {}
    by_category = {}
    by_type = {}

    for cat in ordered:
        entries = []
        for f in sorted((IMAGES / cat).glob("*.png")):
            base, num = parse_stem(f.stem)
            entries.append({
                "file": f.name,
                "name": base,
                "num": num,
                "label": titleize(base) + (f" {num}" if num is not None else ""),
                "src": f"assets/images/{cat}/{f.name}",
            })
            by_type[base] = by_type.get(base, 0) + 1
        categories[cat] = entries
        by_category[cat] = len(entries)

    total_images = sum(by_category.values())

    manifest = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "categoryOrder": ordered,
        "categories": categories,
        "summary": {
            "totalImages": total_images,
            "totalTypes": len(by_type),
            "byCategory": by_category,
            "byType": dict(sorted(by_type.items())),
        },
    }
    return manifest


def write_manifest() -> dict:
    manifest = build_manifest()
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    s = manifest["summary"]
    print(f"  catalog: {s['totalImages']} images, {s['totalTypes']} types "
          f"across {len(manifest['categoryOrder'])} categories -> {MANIFEST.name}")
    return manifest


if __name__ == "__main__":
    write_manifest()
