#!/usr/bin/env python3
"""
Ants & Artistry — image pipeline (v3): strip background AND file into the catalog.

ONE COMMAND, end to end:
  1. You drop magenta-background line art into  raw-img/<category>/<name>.png
  2. Run  python3 process.py
  3. Each image is chroma-keyed to transparent, auto-numbered, and saved to
       images/<category>/<name>-<N>.png
  4. The raw source is archived to  raw-img/_processed/<category>/
  5. manifest.json is regenerated, so the tool + catalog show the new art.

FILENAME / CATEGORY RULES
  - The CATEGORY is the subfolder name under raw-img/ (e.g. raw-img/animals/).
  - The BASE NAME is the raw filename with any trailing "-<number>" removed
    (so "dragon.png", "dragon-1.png", "ice-cream.png" all work).
  - The NEXT NUMBER continues the sequence already present in images/<category>/
    (e.g. if unicorn-1..9 exist, a new unicorn becomes unicorn-10).

CHROMA KEY
  Input: line art on a FLAT SENTINEL background (default magenta #FF00FF) with a
  solid white interior. Sentinel pixels -> transparent; white interior stays
  solid; kept pixels are desaturated to pure gray to kill any colored fringe.

USAGE
  python3 process.py                  # process every raw-img/<category>/*.png
  python3 process.py --dry-run        # preview actions, write/move nothing
  python3 process.py --sentinel 0,255,0   # green screen instead of magenta
  python3 process.py --keep-raw       # don't archive raws after processing
"""

import argparse
import re
import shutil
from pathlib import Path
from PIL import Image
import numpy as np

HERE = Path(__file__).parent
RAW = HERE / "raw-img"
ARCHIVE = RAW / "_processed"
LEGACY_OUT = HERE / "finished-img"
IMAGES = HERE.parent / "images"

DEFAULT_SENTINEL = (255, 0, 255)   # pure magenta
TOL = 120                          # Euclidean RGB distance: < TOL => background

NAME_NUM = re.compile(r"^(.+)-(\d+)$")


# ---------- core image op ----------
def strip(path: Path, sentinel) -> Image.Image:
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im, dtype=np.float32)

    dist = np.sqrt(((arr - np.array(sentinel, dtype=np.float32)) ** 2).sum(axis=2))
    bg = dist < TOL

    lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2])
    gray = np.clip(lum, 0, 255).astype(np.uint8)
    rgb = np.dstack([gray, gray, gray])
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, alpha]), "RGBA")


# ---------- naming helpers ----------
def base_of(stem: str) -> str:
    m = NAME_NUM.match(stem)
    return m.group(1) if m else stem


def existing_max(cat_dir: Path, base: str) -> int:
    mx = 0
    if cat_dir.exists():
        for f in cat_dir.glob(f"{base}-*.png"):
            m = re.match(rf"^{re.escape(base)}-(\d+)$", f.stem)
            if m:
                mx = max(mx, int(m.group(1)))
    return mx


# ---------- main pipeline ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sentinel", default=None, help="R,G,B background (default 255,0,255)")
    ap.add_argument("--dry-run", action="store_true", help="preview only, change nothing")
    ap.add_argument("--keep-raw", action="store_true", help="don't archive raw sources")
    ap.add_argument("--clean", action="store_true",
                    help="delete archived originals in raw-img/_processed/ and exit")
    args = ap.parse_args()

    # --clean: purge the archive of original source files (run after verifying)
    if args.clean:
        if ARCHIVE.exists():
            size = sum(f.stat().st_size for f in ARCHIVE.rglob("*") if f.is_file())
            shutil.rmtree(ARCHIVE)
            print(f"🧹 Deleted raw-img/_processed/ ({size/1e6:.1f} MB of archived originals).")
        else:
            print("Nothing to clean — raw-img/_processed/ doesn't exist.")
        return

    sentinel = DEFAULT_SENTINEL
    if args.sentinel:
        sentinel = tuple(int(v) for v in args.sentinel.split(","))

    if not RAW.exists():
        print("No raw-img/ folder found at", RAW)
        return

    # Category subfolders under raw-img/ (skip the archive folder + hidden dirs)
    cat_dirs = sorted(
        p for p in RAW.iterdir()
        if p.is_dir() and p.name != "_processed" and not p.name.startswith(".")
    )
    loose = sorted(RAW.glob("*.png"))  # files dropped directly in raw-img/ (no category)

    if not cat_dirs and not loose:
        print(f"Nothing to do. Drop images into raw-img/<category>/ (e.g. raw-img/animals/).")
        return

    print(f"Sentinel = {sentinel}, tolerance = {TOL}"
          f"{'   [DRY RUN]' if args.dry_run else ''}\n")

    next_num = {}        # (category, base) -> next number to assign
    processed = 0
    per_cat = {}

    for cat_dir in cat_dirs:
        cat = cat_dir.name
        raws = sorted(cat_dir.glob("*.png"))
        if not raws:
            continue
        target = IMAGES / cat
        print(f"[{cat}]")
        for f in raws:
            base = base_of(f.stem)
            key = (cat, base)
            if key not in next_num:
                next_num[key] = existing_max(target, base) + 1
            num = next_num[key]
            next_num[key] += 1

            dest = target / f"{base}-{num}.png"
            print(f"   {f.name:<28} ->  images/{cat}/{dest.name}")

            if not args.dry_run:
                target.mkdir(parents=True, exist_ok=True)
                strip(f, sentinel).save(dest)
                if not args.keep_raw:
                    arch = ARCHIVE / cat
                    arch.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(f), str(arch / f.name))

            processed += 1
            per_cat[cat] = per_cat.get(cat, 0) + 1
        print()

    # Loose files (no category) — can't be filed; warn and route to finished-img/ for review.
    if loose:
        print("⚠  Files found directly in raw-img/ with NO category subfolder:")
        for f in loose:
            print(f"     {f.name}  (move it into raw-img/<category>/ to auto-file it)")
        if not args.dry_run:
            LEGACY_OUT.mkdir(exist_ok=True)
            for f in loose:
                strip(f, sentinel).save(LEGACY_OUT / (f.stem + ".png"))
            print(f"   -> stripped copies placed in finished-img/ for manual filing\n")

    breakdown = ", ".join(f"{c} +{n}" for c, n in per_cat.items()) or "none"
    verb = "Would process" if args.dry_run else "Processed"
    print(f"{verb} {processed} image(s)  [{breakdown}]")

    # Regenerate manifest (skip on dry-run)
    if not args.dry_run and processed:
        try:
            from catalog import write_manifest
            write_manifest()
        except Exception as e:  # noqa: BLE001
            print("  (catalog refresh failed:", e, ")")

        # Point the user to the single place to purge originals after verifying.
        if not args.keep_raw and ARCHIVE.exists():
            print(f"\n📦 Originals archived in: raw-img/_processed/")
            print(f"   ➜ After you verify the new art in the tool, delete them with:")
            print(f"       python3 process.py --clean")
    elif args.dry_run:
        print("  (dry run — manifest not regenerated)")


if __name__ == "__main__":
    main()
