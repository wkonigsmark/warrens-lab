#!/usr/bin/env python3
"""
Clear light gray / checkerboard background space from images.

Workflow:
  1. Drop source images into raw-img/
  2. Run: python3 clear_gray_space.py
  3. Pick up transparent PNGs from finished-img/
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is required. Install it with: python3 -m pip install Pillow")
    sys.exit(1)


ROOT = Path(__file__).resolve().parent
RAW_DIR = ROOT / "raw-img"
FINISHED_DIR = ROOT / "finished-img"
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}
NEIGHBORS_8 = (
    (-1, -1),
    (0, -1),
    (1, -1),
    (-1, 0),
    (1, 0),
    (-1, 1),
    (0, 1),
    (1, 1),
)


def is_background_like(pixel, min_lightness: int, max_channel_spread: int) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True

    lightness = max(r, g, b)
    darkness = min(r, g, b)
    channel_spread = lightness - darkness
    return lightness >= min_lightness and channel_spread <= max_channel_spread


def find_connected_background(img: Image.Image, min_lightness: int, max_channel_spread: int) -> set[tuple[int, int]]:
    width, height = img.size
    pixels = img.load()
    background: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        point = (x, y)
        if point not in background and is_background_like(pixels[x, y], min_lightness, max_channel_spread):
            background.add(point)
            queue.append(point)

    for x in range(width):
        seed(x, 0)
        seed(x, height - 1)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for dx, dy in NEIGHBORS_8:
            nx = x + dx
            ny = y + dy
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            point = (nx, ny)
            if point in background:
                continue
            if is_background_like(pixels[nx, ny], min_lightness, max_channel_spread):
                background.add(point)
                queue.append(point)

    return background


def clear_background(
    src_path: Path,
    dst_path: Path,
    min_lightness: int,
    max_channel_spread: int,
    crop: bool,
    padding: int,
    no_center: bool,
    extra_passes: int,
) -> None:
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()

    for pass_index in range(extra_passes + 1):
        pass_lightness = max(0, min_lightness - (pass_index * 10))
        pass_spread = max_channel_spread + (pass_index * 4)
        background = find_connected_background(img, pass_lightness, pass_spread)
        if not background:
            break

        for x, y in background:
            r, g, b, _ = pixels[x, y]
            pixels[x, y] = (r, g, b, 0)

    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if bbox and not crop and not no_center:
        artwork = img.crop(bbox)
        centered = Image.new("RGBA", img.size, (0, 0, 0, 0))
        x = (img.width - artwork.width) // 2
        y = (img.height - artwork.height) // 2
        centered.paste(artwork, (x, y), artwork)
        img = centered

    if crop:
        bbox = img.getchannel("A").getbbox()
        if bbox:
            left, top, right, bottom = bbox
            left = max(0, left - padding)
            top = max(0, top - padding)
            right = min(img.width, right + padding)
            bottom = min(img.height, bottom + padding)
            img = img.crop((left, top, right, bottom))

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst_path, "PNG", optimize=True)


def output_name(src_path: Path) -> str:
    cleaned_stem = src_path.stem.strip().lower()
    cleaned_stem = re.sub(r"[^a-z0-9]+", "_", cleaned_stem).strip("_")
    if cleaned_stem.startswith("raw_"):
        cleaned_stem = cleaned_stem[4:]
    return f"{cleaned_stem}.png"


def process_all(args: argparse.Namespace) -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    FINISHED_DIR.mkdir(parents=True, exist_ok=True)

    sources = sorted(path for path in RAW_DIR.iterdir() if path.suffix.lower() in SUPPORTED_EXTENSIONS)
    if not sources:
        print(f"No source images found in {RAW_DIR}")
        return 0

    completed = 0
    for src_path in sources:
        dst_path = FINISHED_DIR / output_name(src_path)
        if dst_path.exists() and not args.force:
            print(f"skip {src_path.name} -> {dst_path.name} already exists")
            continue

        clear_background(
            src_path=src_path,
            dst_path=dst_path,
            min_lightness=args.min_lightness,
            max_channel_spread=args.max_channel_spread,
            crop=args.crop,
            padding=args.padding,
            no_center=args.no_center,
            extra_passes=args.extra_passes,
        )
        completed += 1
        print(f"done {src_path.name} -> {dst_path.name}")

    return completed


def watch(args: argparse.Namespace) -> None:
    print(f"Watching {RAW_DIR} for images. Press Ctrl+C to stop.")
    while True:
        process_all(args)
        time.sleep(args.interval)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Remove connected light gray/checker background from raw images.")
    parser.add_argument("--watch", action="store_true", help="Keep checking raw-img for new files.")
    parser.add_argument("--force", action="store_true", help="Overwrite files already in finished-img.")
    parser.add_argument("--crop", action="store_true", help="Crop output to the non-transparent artwork.")
    parser.add_argument("--no-center", action="store_true", help="Leave artwork in its original canvas position.")
    parser.add_argument("--padding", type=int, default=24, help="Pixels of padding when using --crop.")
    parser.add_argument("--interval", type=float, default=2.0, help="Seconds between scans in --watch mode.")
    parser.add_argument("--min-lightness", type=int, default=205, help="Lower values remove darker gray background.")
    parser.add_argument("--max-channel-spread", type=int, default=28, help="Higher values allow less neutral background colors.")
    parser.add_argument("--extra-passes", type=int, default=1, help="Additional edge-connected cleanup passes.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.watch:
        watch(args)
        return

    count = process_all(args)
    print(f"Finished: {count} image(s) processed.")


if __name__ == "__main__":
    main()
