#!/usr/bin/env python3
"""
Ants & Artistry — coloring-image background stripper (prototype v1).

Strategy: FLOOD FILL FROM THE BORDER.
  - Treat "light" pixels (luminance > LIGHT_T) as potential background.
  - Flood from every border pixel through connected light pixels.
  - Any light region reachable from the border  -> background -> transparent.
  - Light regions NOT reachable (enclosed interiors) -> stay opaque WHITE.
  - Dark pixels (the line art) -> always stay opaque.

This makes the object render as a SOLID object on the canvas (white interior),
with only the true exterior negative space knocked out to transparent.

Works identically on solid-white OR checkerboard backgrounds, because both
are "light" and both are border-connected.
"""

import sys
from collections import deque
from pathlib import Path
from PIL import Image
import numpy as np

LIGHT_T = 235   # luminance above this = "light" (background or interior fill)
RAW = Path(__file__).parent / "raw-img"
OUT = Path(__file__).parent / "finished-img"


def strip(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im, dtype=np.int16)
    h, w, _ = arr.shape

    lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2])
    light = lum > LIGHT_T                       # True = floodable

    # BFS flood from every border pixel that is light
    bg = np.zeros((h, w), dtype=bool)
    dq = deque()

    for x in range(w):
        for y in (0, h - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True
                dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if light[y, x] and not bg[y, x]:
                bg[y, x] = True
                dq.append((y, x))

    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                dq.append((ny, nx))

    # Build RGBA: background -> alpha 0; everything else opaque.
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    out = np.dstack([arr.astype(np.uint8), alpha])

    interior_light = int((light & ~bg).sum())
    print(f"  {path.name}: {w}x{h}  bg_px={int(bg.sum()):,}  "
          f"kept_interior_light_px={interior_light:,}")
    return Image.fromarray(out, "RGBA")


def main():
    OUT.mkdir(exist_ok=True)
    files = sorted(RAW.glob("*.png"))
    if not files:
        print("No PNGs found in", RAW)
        sys.exit(1)
    for f in files:
        result = strip(f)
        dest = OUT / f.name.replace(".png", "-transparent.png")
        result.save(dest)
    print("Done ->", OUT)


if __name__ == "__main__":
    main()
