#!/usr/bin/env python3
"""
Ants & Artistry — coloring-image background stripper (v2, chroma-key).

INPUT  : line art on a FLAT SENTINEL background (default pure magenta #FF00FF),
         with a SOLID WHITE object interior.
OUTPUT : transparent PNG where
           - sentinel-colored negative space -> transparent
           - white interior                  -> stays solid white (opaque)
           - black line art                  -> stays opaque
         Kept pixels are desaturated to pure grayscale, which cleanly removes
         any colored anti-alias fringe around the lines (the art is meant to be
         black-and-white, so this is lossless for our purposes).

Why a flat sentinel color (vs white / checker):
  - Gap-immune: only sentinel-colored pixels are removed, so a break in the
    outline cannot leak transparency into the white interior.
  - Enclosed-hole aware: paint an interior pocket with the sentinel and it
    knocks out too, even when walled off from the border.
  - No ghosting, trivial detection.

Usage:
  python3 process.py                 # process raw-img/*.png -> finished-img/
  python3 process.py --sentinel 0,255,0   # use green screen instead
"""

import argparse
from pathlib import Path
from PIL import Image
import numpy as np

HERE = Path(__file__).parent
RAW = HERE / "raw-img"
OUT = HERE / "finished-img"

DEFAULT_SENTINEL = (255, 0, 255)   # pure magenta
TOL = 120                          # Euclidean RGB distance: < TOL => background


def strip(path: Path, sentinel) -> Image.Image:
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im, dtype=np.float32)
    h, w, _ = arr.shape

    dist = np.sqrt(((arr - np.array(sentinel, dtype=np.float32)) ** 2).sum(axis=2))
    bg = dist < TOL

    # Desaturate kept pixels -> pure gray (kills magenta fringe on line edges).
    lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2])
    gray = np.clip(lum, 0, 255).astype(np.uint8)
    rgb = np.dstack([gray, gray, gray])

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    out = np.dstack([rgb, alpha])

    print(f"  {path.name}: {w}x{h}  transparent_px={int(bg.sum()):,}  "
          f"kept_px={int((~bg).sum()):,}")
    return Image.fromarray(out, "RGBA")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sentinel", default=None,
                    help="R,G,B of background color (default 255,0,255 magenta)")
    args = ap.parse_args()
    sentinel = DEFAULT_SENTINEL
    if args.sentinel:
        sentinel = tuple(int(v) for v in args.sentinel.split(","))

    OUT.mkdir(exist_ok=True)
    files = [f for f in sorted(RAW.glob("*.png"))]
    if not files:
        print("No PNGs in", RAW)
        return
    print(f"Sentinel = {sentinel}, tolerance = {TOL}")
    for f in files:
        result = strip(f, sentinel)
        dest = OUT / (f.stem + ".png")
        result.save(dest)
    print("Done ->", OUT)

    # Refresh the catalog manifest so the tool + dashboard stay in sync.
    try:
        from catalog import write_manifest
        write_manifest()
    except Exception as e:  # noqa: BLE001
        print("  (catalog refresh skipped:", e, ")")


if __name__ == "__main__":
    main()
