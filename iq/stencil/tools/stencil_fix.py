#!/usr/bin/env python3
"""
Stencil icon post-processor
- Removes baked-in "checkerboard" transparency background
- Crops to non-transparent content (based on alpha after background removal)
- Centers on a 512x512 transparent canvas
- Optionally splits a composite image into N equal vertical slices (2 or 3)
- Batch processes a folder

Usage examples:

1) Fix a single image to a single icon
python stencil_fix.py --in ./input.png --out ./output.png

2) Composite 3-up (fan/map/ring style) -> folder of 3 icons
python stencil_fix.py --in ./composite.png --split 3 --names fan map ring --outdir ./out

3) Batch process a folder of singles
python stencil_fix.py --indir ./raw --outdir ./fixed

Notes:
- The "checkerboard" baked background is typically near-white (#f0f0f0 to #ffffff).
- We treat near-white pixels as background and set alpha=0.
"""

import argparse
import os
from pathlib import Path

import numpy as np
from PIL import Image


def remove_checkerboard_rgba(img: Image.Image, thresh: int = 235) -> Image.Image:
    """
    Remove near-white background by making those pixels transparent.
    thresh: 0-255. Higher = only very-white pixels removed.
    """
    rgba = img.convert("RGBA")
    arr = np.array(rgba)

    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    mask = (r >= thresh) & (g >= thresh) & (b >= thresh)

    # Set masked pixels to fully transparent
    arr[mask, 3] = 0
    arr[mask, 0:3] = 0

    return Image.fromarray(arr, mode="RGBA")


def crop_to_content(img: Image.Image, pad: int = 20) -> Image.Image:
    """
    Crop to bounding box of non-transparent pixels (alpha > 0).
    """
    rgba = img.convert("RGBA")
    arr = np.array(rgba)
    alpha = arr[..., 3]

    ys, xs = np.where(alpha > 0)
    if len(xs) == 0 or len(ys) == 0:
        # no content; return original
        return rgba

    x0, x1 = xs.min(), xs.max()
    y0, y1 = ys.min(), ys.max()

    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(rgba.width - 1, x1 + pad)
    y1 = min(rgba.height - 1, y1 + pad)

    return rgba.crop((x0, y0, x1 + 1, y1 + 1))


def center_on_canvas(img: Image.Image, size: int = 512, margin: int = 30) -> Image.Image:
    """
    Resize image to fit within (size - 2*margin) while preserving aspect ratio,
    then paste centered onto a transparent canvas.
    """
    rgba = img.convert("RGBA")
    max_w = size - 2 * margin
    max_h = size - 2 * margin

    w, h = rgba.size
    if w == 0 or h == 0:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))

    scale = min(max_w / w, max_h / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))

    resized = rgba.resize((nw, nh), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def process_icon(
    img: Image.Image,
    thresh: int = 235,
    pad: int = 20,
    out_size: int = 512,
    margin: int = 30,
) -> Image.Image:
    cleaned = remove_checkerboard_rgba(img, thresh=thresh)
    cropped = crop_to_content(cleaned, pad=pad)
    final = center_on_canvas(cropped, size=out_size, margin=margin)
    return final


def split_vertical(img: Image.Image, n: int) -> list[Image.Image]:
    """
    Split image into n equal vertical slices.
    """
    w, h = img.size
    step = w // n
    slices = []
    for i in range(n):
        x0 = i * step
        x1 = (i + 1) * step if i < n - 1 else w
        slices.append(img.crop((x0, 0, x1, h)))
    return slices


def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="infile", help="Input image file (png/jpg/etc)")
    ap.add_argument("--out", dest="outfile", help="Output file (single icon mode)")
    ap.add_argument("--indir", help="Batch mode: input folder")
    ap.add_argument("--outdir", help="Batch mode: output folder")
    ap.add_argument("--split", type=int, default=0, help="Split composite into N slices (2 or 3)")
    ap.add_argument("--names", nargs="*", help="Names for split outputs (without .png)")
    ap.add_argument("--thresh", type=int, default=235, help="Near-white threshold for background removal")
    ap.add_argument("--pad", type=int, default=20, help="Padding when cropping")
    ap.add_argument("--size", type=int, default=512, help="Output size (default 512)")
    ap.add_argument("--margin", type=int, default=30, help="Margin inside the 512 canvas")
    args = ap.parse_args()

    if args.indir:
        if not args.outdir:
            raise SystemExit("Batch mode requires --outdir")
        in_dir = Path(args.indir)
        out_dir = Path(args.outdir)
        ensure_dir(out_dir)

        for fp in sorted(in_dir.glob("*")):
            if fp.suffix.lower() not in [".png", ".jpg", ".jpeg", ".webp"]:
                continue
            img = Image.open(fp)
            out_img = process_icon(img, thresh=args.thresh, pad=args.pad, out_size=args.size, margin=args.margin)
            out_path = out_dir / (fp.stem.lower() + ".png")
            out_img.save(out_path, "PNG")
            print("Wrote", out_path)
        return

    if not args.infile:
        raise SystemExit("Provide --in or --indir")

    img = Image.open(args.infile)

    # Split mode
    if args.split and args.split > 1:
        if not args.outdir:
            raise SystemExit("Split mode requires --outdir")
        out_dir = Path(args.outdir)
        ensure_dir(out_dir)

        slices = split_vertical(img, args.split)
        names = args.names or [f"icon{i+1}" for i in range(args.split)]
        if len(names) != len(slices):
            raise SystemExit(f"--names must provide exactly {len(slices)} names")

        for sl, nm in zip(slices, names):
            out_img = process_icon(sl, thresh=args.thresh, pad=args.pad, out_size=args.size, margin=args.margin)
            out_path = out_dir / (nm.lower() + ".png")
            out_img.save(out_path, "PNG")
            print("Wrote", out_path)
        return

    # Single output mode
    if not args.outfile:
        raise SystemExit("Single mode requires --out")
    out_img = process_icon(img, thresh=args.thresh, pad=args.pad, out_size=args.size, margin=args.margin)
    out_img.save(args.outfile, "PNG")
    print("Wrote", args.outfile)


if __name__ == "__main__":
    main()
