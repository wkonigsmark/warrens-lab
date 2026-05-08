#!/usr/bin/env python3
"""
Chef Image Processor
====================
Watches raw-img/ for new PNG files, then:
  1. Strips background using AI (rembg) — handles any background type
  2. Detects the tight bounding box of non-transparent content
  3. Crops to content + adds uniform padding (10% each side)
  4. Resizes to a standardized square canvas (512×512 by default)
  5. Saves to finished-img/ with a clean lowercase name

NAMING CONVENTION:
  Input:   raw-img/raw_apple.png       → finished-img/apple.png
  Input:   raw-img/raw_bell_pepper.png → finished-img/bell_pepper.png

USAGE:
  python3 process_images.py              # Process all files in raw-img/ once
  python3 process_images.py --watch      # Watch raw-img/ for new files continuously
  python3 process_images.py --force      # Reprocess already-done files

REQUIREMENTS:
  pip install Pillow rembg
"""

import argparse
import os
import sys
import time
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow rembg")
    sys.exit(1)

try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

# ── CONFIG ──────────────────────────────────────────────────────────────────
CANVAS_SIZE    = 512     # Output canvas (square)
PADDING_PCT    = 0.10    # Padding as fraction of bounding-box size
RAW_DIR        = Path(__file__).parent / "raw-img"
FINISHED_DIR   = Path(__file__).parent / "finished-img"
PROCESSED_LOG  = Path(__file__).parent / ".processed"   # tracks already-done files


def clean_stem(filename: str) -> str:
    """
    Convert raw filename to clean output name.
    Strips leading 'raw_' prefix and lowercases everything.
    Examples:
      raw_apple.png       → apple
      raw_bell_pepper.png → bell_pepper
      raw_red_grapes.png  → red_grapes
    """
    stem = Path(filename).stem
    lower = stem.lower().replace(" ", "_").replace("-", "_")
    # Strip leading raw_ prefix if present
    if lower.startswith("raw_"):
        lower = lower[4:]
    return lower


def process_image(src_path: Path, canvas_size: int = CANVAS_SIZE, padding_pct: float = PADDING_PCT) -> Path | None:
    """
    Process a single image file. Returns the output path on success, None on failure.
    """
    if not REMBG_AVAILABLE:
        print("  ✗ rembg not installed. Run: pip install rembg")
        return None

    try:
        raw_bytes = src_path.read_bytes()
        print(f"  ⏳ Removing background from {src_path.name}...")
        # rembg strips any background (white, grey, checkerboard) using AI
        cleaned_bytes = rembg_remove(raw_bytes)
        img = Image.open(__import__('io').BytesIO(cleaned_bytes)).convert("RGBA")
    except Exception as e:
        print(f"  ✗ Could not process {src_path.name}: {e}")
        return None

    # ── 1. Get bounding box of non-transparent content ───────────────────────
    _, _, _, a = img.split()
    bbox = a.getbbox()

    if bbox is None:
        print(f"  ✗ {src_path.name} appears entirely transparent after background removal — skipping.")
        return None

    # ── 2. Crop to content ───────────────────────────────────────────────────
    cropped = img.crop(bbox)
    w, h = cropped.size

    # ── 3. Add uniform padding ────────────────────────────────────────────────
    pad = int(max(w, h) * padding_pct)
    padded_w = w + pad * 2
    padded_h = h + pad * 2

    padded = Image.new("RGBA", (padded_w, padded_h), (0, 0, 0, 0))
    padded.paste(cropped, (pad, pad), mask=cropped.split()[3])  # use alpha as mask

    # ── 4. Center in square canvas ────────────────────────────────────────────
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))

    scale = min(canvas_size / padded_w, canvas_size / padded_h)
    new_w = int(padded_w * scale)
    new_h = int(padded_h * scale)
    resized = padded.resize((new_w, new_h), Image.LANCZOS)

    x_offset = (canvas_size - new_w) // 2
    y_offset = (canvas_size - new_h) // 2
    canvas.paste(resized, (x_offset, y_offset), mask=resized.split()[3])  # use alpha as mask

    # ── 5. Save ───────────────────────────────────────────────────────────────
    output_name = clean_stem(src_path.name) + ".png"
    output_path = FINISHED_DIR / output_name
    canvas.save(output_path, "PNG", optimize=True)

    size_kb = output_path.stat().st_size // 1024
    print(f"  ✓ {src_path.name}  →  {output_name}  [{new_w}×{new_h} → {canvas_size}×{canvas_size}px, {size_kb}KB]")
    return output_path


def load_processed_log() -> set:
    if not PROCESSED_LOG.exists():
        return set()
    return set(PROCESSED_LOG.read_text().splitlines())


def save_processed_log(processed: set):
    PROCESSED_LOG.write_text("\n".join(sorted(processed)))


def run_once(force: bool = False) -> int:
    """Process all PNGs in raw-img/. Returns count processed."""
    FINISHED_DIR.mkdir(parents=True, exist_ok=True)
    processed_log = load_processed_log() if not force else set()

    extensions = ["*.png", "*.jpg", "*.jpeg", "*.PNG", "*.JPG", "*.JPEG"]
    candidates = []
    for ext in extensions:
        candidates.extend(RAW_DIR.glob(ext))
    candidates = sorted(candidates)
    if not candidates:
        print(f"  No PNG files found in {RAW_DIR}")
        return 0

    count = 0
    for src in candidates:
        if src.name in processed_log:
            print(f"  — {src.name} already processed (use --force to reprocess)")
            continue
        result = process_image(src)
        if result:
            processed_log.add(src.name)
            count += 1

    save_processed_log(processed_log)
    return count


def watch_mode(poll_interval: float = 2.0):
    """Continuously watch raw-img/ for new PNGs and process them."""
    FINISHED_DIR.mkdir(parents=True, exist_ok=True)
    print(f"👁  Watching {RAW_DIR} for new PNG files... (Ctrl+C to stop)\n")
    seen = load_processed_log()

    while True:
        extensions = ["*.png", "*.jpg", "*.jpeg", "*.PNG", "*.JPG", "*.JPEG"]
        current = set()
        for ext in extensions:
            current.update({f.name for f in RAW_DIR.glob(ext)})
        new_files = current - seen
        for name in sorted(new_files):
            src = RAW_DIR / name
            print(f"\n🆕 New file detected: {name}")
            result = process_image(src)
            if result:
                seen.add(name)
                save_processed_log(seen)
        time.sleep(poll_interval)


def main():
    parser = argparse.ArgumentParser(description="Chef Image Processor — standardize food PNGs for the meal planner game.")
    parser.add_argument("--watch",    action="store_true",  help="Watch raw-img/ continuously for new files")
    parser.add_argument("--force",    action="store_true",  help="Reprocess already-processed files")
    parser.add_argument("--size",     type=int, default=CANVAS_SIZE, help=f"Output canvas size in px (default: {CANVAS_SIZE})")
    parser.add_argument("--padding",  type=float, default=PADDING_PCT, help=f"Padding as fraction of image (default: {PADDING_PCT})")
    args = parser.parse_args()

    rembg_status = "✓ READY" if REMBG_AVAILABLE else "✗ NOT INSTALLED — run: pip install rembg"

    print(f"\n{'='*60}")
    print(f"  Chef Image Processor")
    print(f"  Canvas: {args.size}×{args.size}px  |  Padding: {int(args.padding*100)}%")
    print(f"  BG Removal: {rembg_status}")
    print(f"  Raw:      {RAW_DIR}")
    print(f"  Finished: {FINISHED_DIR}")
    print(f"{'='*60}\n")

    if not REMBG_AVAILABLE:
        print("ERROR: rembg is required. Install it with:\n  pip install rembg\n")
        sys.exit(1)

    if args.watch:
        watch_mode()
    else:
        count = run_once(force=args.force)
        print(f"\n{'='*60}")
        print(f"  Done. {count} image(s) processed.")
        print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
