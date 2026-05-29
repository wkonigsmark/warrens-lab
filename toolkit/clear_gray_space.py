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
import base64
import io
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


def is_background_like(pixel, min_lightness: int, max_channel_spread: int, max_lightness: int | None = None) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True

    lightness = max(r, g, b)
    darkness = min(r, g, b)
    channel_spread = lightness - darkness
    if max_lightness is not None and lightness > max_lightness:
        return False
    return lightness >= min_lightness and channel_spread <= max_channel_spread


def estimate_background_lightness_bounds(
    img: Image.Image,
    min_lightness: int,
    max_channel_spread: int,
    manual_max_lightness: int | None,
) -> tuple[int, int | None]:
    if manual_max_lightness is not None:
        return min_lightness, manual_max_lightness

    pixels = img.load()
    values: list[int] = []

    def collect(x: int, y: int) -> None:
        r, g, b, a = pixels[x, y]
        if a == 0:
            return
        lightness = max(r, g, b)
        if lightness >= min_lightness and lightness - min(r, g, b) <= max_channel_spread:
            values.append(lightness)

    for x in range(img.width):
        collect(x, 0)
        collect(x, img.height - 1)
    for y in range(img.height):
        collect(0, y)
        collect(img.width - 1, y)

    if not values:
        return min_lightness, None

    values.sort()
    low = values[int(len(values) * 0.05)]
    high = values[int(len(values) * 0.95)]
    return max(0, min(min_lightness, low - 18)), min(255, high + 18)


def find_connected_background(
    img: Image.Image,
    min_lightness: int,
    max_channel_spread: int,
    max_lightness: int | None,
) -> set[tuple[int, int]]:
    width, height = img.size
    pixels = img.load()
    background: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        point = (x, y)
        if point not in background and is_background_like(pixels[x, y], min_lightness, max_channel_spread, max_lightness):
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
            if is_background_like(pixels[nx, ny], min_lightness, max_channel_spread, max_lightness):
                background.add(point)
                queue.append(point)

    return background


def clear_interior_checker_gray(
    img: Image.Image,
    min_lightness: int,
    max_lightness: int,
    max_channel_spread: int,
    dark_guard_radius: int,
) -> None:
    pixels = img.load()

    def near_dark_ink(px: int, py: int) -> bool:
        left = max(0, px - dark_guard_radius)
        top = max(0, py - dark_guard_radius)
        right = min(img.width, px + dark_guard_radius + 1)
        bottom = min(img.height, py + dark_guard_radius + 1)
        for ny in range(top, bottom):
            for nx in range(left, right):
                r, g, b, a = pixels[nx, ny]
                if a > 0 and max(r, g, b) < 90:
                    return True
        return False

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue

            lightness = max(r, g, b)
            channel_spread = lightness - min(r, g, b)
            if (
                min_lightness <= lightness <= max_lightness
                and channel_spread <= max_channel_spread
                and not near_dark_ink(x, y)
            ):
                pixels[x, y] = (r, g, b, 0)


def clear_trapped_backdrop(
    img: Image.Image,
    min_lightness: int,
    max_channel_spread: int,
    max_lightness: int | None,
    dark_barrier: int,
) -> None:
    width, height = img.size
    pixels = img.load()
    outside: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    def can_flow(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        return a == 0 or max(r, g, b) >= dark_barrier

    def seed(x: int, y: int) -> None:
        point = (x, y)
        if point not in outside and can_flow(x, y):
            outside.add(point)
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
            if point in outside or not can_flow(nx, ny):
                continue
            outside.add(point)
            queue.append(point)

    for x, y in outside:
        r, g, b, a = pixels[x, y]
        if a > 0 and is_background_like((r, g, b, a), min_lightness, max_channel_spread, max_lightness):
            pixels[x, y] = (r, g, b, 0)


def clear_small_light_components(
    img: Image.Image,
    max_area: int,
    min_lightness: int,
    max_channel_spread: int,
) -> None:
    if max_area <= 0:
        return

    pixels = img.load()
    seen: set[tuple[int, int]] = set()

    def is_light_artifact(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        if a == 0:
            return False
        lightness = max(r, g, b)
        return lightness >= min_lightness and lightness - min(r, g, b) <= max_channel_spread

    for start_y in range(img.height):
        for start_x in range(img.width):
            start = (start_x, start_y)
            if start in seen or not is_light_artifact(start_x, start_y):
                continue

            component: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([start])
            seen.add(start)

            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                for dx, dy in NEIGHBORS_8:
                    nx = x + dx
                    ny = y + dy
                    point = (nx, ny)
                    if nx < 0 or ny < 0 or nx >= img.width or ny >= img.height:
                        continue
                    if point in seen or not is_light_artifact(nx, ny):
                        continue
                    seen.add(point)
                    queue.append(point)

            if len(component) <= max_area:
                for x, y in component:
                    r, g, b, _ = pixels[x, y]
                    pixels[x, y] = (r, g, b, 0)


def clear_checker_components(
    img: Image.Image,
    dark_barrier: int,
    checker_ratio: float,
    max_white_ratio: float,
    max_channel_spread: int,
) -> None:
    pixels = img.load()
    seen: set[tuple[int, int]] = set()

    def is_non_dark(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        return a > 0 and max(r, g, b) >= dark_barrier

    for start_y in range(img.height):
        for start_x in range(img.width):
            start = (start_x, start_y)
            if start in seen or not is_non_dark(start_x, start_y):
                continue

            component: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([start])
            seen.add(start)
            touches_edge = False
            checker_pixels = 0
            white_pixels = 0

            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                if x == 0 or y == 0 or x == img.width - 1 or y == img.height - 1:
                    touches_edge = True

                r, g, b, _ = pixels[x, y]
                lightness = max(r, g, b)
                if 235 <= lightness <= 252 and lightness - min(r, g, b) <= max_channel_spread:
                    checker_pixels += 1
                if lightness >= 253 and lightness - min(r, g, b) <= max_channel_spread:
                    white_pixels += 1

                for dx, dy in NEIGHBORS_8:
                    nx = x + dx
                    ny = y + dy
                    point = (nx, ny)
                    if nx < 0 or ny < 0 or nx >= img.width or ny >= img.height:
                        continue
                    if point in seen or not is_non_dark(nx, ny):
                        continue
                    seen.add(point)
                    queue.append(point)

            if touches_edge or not component:
                continue

            if checker_pixels / len(component) >= checker_ratio and white_pixels / len(component) <= max_white_ratio:
                for x, y in component:
                    r, g, b, _ = pixels[x, y]
                    pixels[x, y] = (r, g, b, 0)


def clear_small_negative_light_components(
    img: Image.Image,
    max_area: int,
    always_remove_area: int,
    max_density: float,
    min_lightness: int,
    max_channel_spread: int,
) -> None:
    pixels = img.load()
    seen: set[tuple[int, int]] = set()

    def is_light(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        if a == 0:
            return False
        lightness = max(r, g, b)
        return lightness >= min_lightness and lightness - min(r, g, b) <= max_channel_spread

    for start_y in range(img.height):
        for start_x in range(img.width):
            start = (start_x, start_y)
            if start in seen or not is_light(start_x, start_y):
                continue

            component: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([start])
            seen.add(start)
            min_x = max_x = start_x
            min_y = max_y = start_y

            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)

                for dx, dy in NEIGHBORS_8:
                    nx = x + dx
                    ny = y + dy
                    point = (nx, ny)
                    if nx < 0 or ny < 0 or nx >= img.width or ny >= img.height:
                        continue
                    if point in seen or not is_light(nx, ny):
                        continue
                    seen.add(point)
                    queue.append(point)

            area = len(component)
            if area > max_area:
                continue

            bbox_area = (max_x - min_x + 1) * (max_y - min_y + 1)
            density = area / bbox_area
            if area <= always_remove_area or density <= max_density:
                for x, y in component:
                    r, g, b, _ = pixels[x, y]
                    pixels[x, y] = (r, g, b, 0)


def clear_background(
    src_path: Path,
    min_lightness: int,
    max_channel_spread: int,
    crop: bool,
    padding: int,
    no_center: bool,
    extra_passes: int,
    interior_gray_cleanup: bool,
    interior_min_lightness: int,
    interior_max_lightness: int,
    dark_guard_radius: int,
    trapped_backdrop_cleanup: bool,
    dark_barrier: int,
    small_light_component_limit: int,
    checker_component_cleanup: bool,
    checker_component_ratio: float,
    checker_component_max_white_ratio: float,
    negative_light_cleanup: bool,
    negative_light_max_area: int,
    negative_light_always_area: int,
    negative_light_max_density: float,
    background_max_lightness: int | None,
) -> Image.Image:
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    background_min_lightness, background_max_lightness = estimate_background_lightness_bounds(
        img,
        min_lightness=min_lightness,
        max_channel_spread=max_channel_spread,
        manual_max_lightness=background_max_lightness,
    )

    for pass_index in range(extra_passes + 1):
        pass_lightness = max(0, background_min_lightness - (pass_index * 10))
        pass_spread = max_channel_spread + (pass_index * 4)
        background = find_connected_background(img, pass_lightness, pass_spread, background_max_lightness)
        if not background:
            break

        for x, y in background:
            r, g, b, _ = pixels[x, y]
            pixels[x, y] = (r, g, b, 0)

    if trapped_backdrop_cleanup:
        clear_trapped_backdrop(
            img=img,
            min_lightness=background_min_lightness,
            max_channel_spread=max_channel_spread,
            max_lightness=background_max_lightness,
            dark_barrier=dark_barrier,
        )

    if checker_component_cleanup:
        clear_checker_components(
            img=img,
            dark_barrier=dark_barrier,
            checker_ratio=checker_component_ratio,
            max_white_ratio=checker_component_max_white_ratio,
            max_channel_spread=max_channel_spread,
        )

    if negative_light_cleanup:
        clear_small_negative_light_components(
            img=img,
            max_area=negative_light_max_area,
            always_remove_area=negative_light_always_area,
            max_density=negative_light_max_density,
            min_lightness=180,
            max_channel_spread=50,
        )

    if interior_gray_cleanup:
        clear_interior_checker_gray(
            img=img,
            min_lightness=interior_min_lightness,
            max_lightness=interior_max_lightness,
            max_channel_spread=max_channel_spread,
            dark_guard_radius=dark_guard_radius,
        )

    clear_small_light_components(
        img=img,
        max_area=small_light_component_limit,
        min_lightness=interior_min_lightness,
        max_channel_spread=max_channel_spread,
    )

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

    return img


def save_png(img: Image.Image, dst_path: Path) -> None:
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst_path, "PNG", optimize=True)


def save_svg(img: Image.Image, dst_path: Path) -> None:
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    buffer = io.BytesIO()
    img.save(buffer, "PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{img.width}" height="{img.height}" viewBox="0 0 {img.width} {img.height}">
  <image width="{img.width}" height="{img.height}" href="data:image/png;base64,{encoded}" xlink:href="data:image/png;base64,{encoded}"/>
</svg>
"""
    dst_path.write_text(svg)


def output_name(src_path: Path, suffix: str) -> str:
    cleaned_stem = src_path.stem.strip().lower()
    cleaned_stem = re.sub(r"[^a-z0-9]+", "_", cleaned_stem).strip("_")
    if cleaned_stem.startswith("raw_"):
        cleaned_stem = cleaned_stem[4:]
    return f"{cleaned_stem}.{suffix}"


def process_all(args: argparse.Namespace) -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    FINISHED_DIR.mkdir(parents=True, exist_ok=True)

    sources = sorted(path for path in RAW_DIR.iterdir() if path.suffix.lower() in SUPPORTED_EXTENSIONS)
    if not sources:
        print(f"No source images found in {RAW_DIR}")
        return 0

    completed = 0
    for src_path in sources:
        output_suffixes = ["png", "svg"] if args.format == "both" else [args.format]
        dst_paths = [FINISHED_DIR / output_name(src_path, suffix) for suffix in output_suffixes]
        if all(dst_path.exists() for dst_path in dst_paths) and not args.force:
            names = ", ".join(dst_path.name for dst_path in dst_paths)
            print(f"skip {src_path.name} -> {names} already exists")
            continue

        img = clear_background(
            src_path=src_path,
            min_lightness=args.min_lightness,
            max_channel_spread=args.max_channel_spread,
            crop=args.crop,
            padding=args.padding,
            no_center=args.no_center,
            extra_passes=args.extra_passes,
            interior_gray_cleanup=args.interior_gray_cleanup,
            interior_min_lightness=args.interior_min_lightness,
            interior_max_lightness=args.interior_max_lightness,
            dark_guard_radius=args.dark_guard_radius,
            trapped_backdrop_cleanup=not args.no_trapped_backdrop_cleanup,
            dark_barrier=args.dark_barrier,
            small_light_component_limit=args.small_light_component_limit,
            checker_component_cleanup=args.checker_component_cleanup,
            checker_component_ratio=args.checker_component_ratio,
            checker_component_max_white_ratio=args.checker_component_max_white_ratio,
            negative_light_cleanup=args.negative_light_cleanup,
            negative_light_max_area=args.negative_light_max_area,
            negative_light_always_area=args.negative_light_always_area,
            negative_light_max_density=args.negative_light_max_density,
            background_max_lightness=args.background_max_lightness,
        )

        for dst_path in dst_paths:
            if dst_path.suffix == ".svg":
                save_svg(img, dst_path)
            else:
                save_png(img, dst_path)
        completed += 1
        names = ", ".join(dst_path.name for dst_path in dst_paths)
        print(f"done {src_path.name} -> {names}")

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
    parser.add_argument("--format", choices=("png", "svg", "both"), default="png", help="Output format.")
    parser.add_argument("--crop", action="store_true", help="Crop output to the non-transparent artwork.")
    parser.add_argument("--no-center", action="store_true", help="Leave artwork in its original canvas position.")
    parser.add_argument("--padding", type=int, default=24, help="Pixels of padding when using --crop.")
    parser.add_argument("--interval", type=float, default=2.0, help="Seconds between scans in --watch mode.")
    parser.add_argument("--min-lightness", type=int, default=150, help="Lower values remove darker gray background.")
    parser.add_argument("--max-channel-spread", type=int, default=24, help="Higher values allow less neutral background colors.")
    parser.add_argument("--background-max-lightness", type=int, default=None, help="Optional upper brightness limit for background removal.")
    parser.add_argument("--extra-passes", type=int, default=1, help="Additional edge-connected cleanup passes.")
    parser.add_argument("--interior-gray-cleanup", action="store_true", help="Also remove mid-light enclosed gray pixels; useful for stubborn checker remnants.")
    parser.add_argument("--interior-min-lightness", type=int, default=230, help="Lowest gray value removed by interior cleanup.")
    parser.add_argument("--interior-max-lightness", type=int, default=252, help="Highest gray value removed by interior cleanup.")
    parser.add_argument("--dark-guard-radius", type=int, default=2, help="Keep gray antialias pixels this close to dark artwork.")
    parser.add_argument("--no-trapped-backdrop-cleanup", action="store_true", help="Skip the black-outline bounded backdrop cleanup pass.")
    parser.add_argument("--dark-barrier", type=int, default=120, help="Pixels darker than this block trapped-backdrop cleanup.")
    parser.add_argument("--small-light-component-limit", type=int, default=0, help="Remove isolated light remnants up to this many pixels.")
    parser.add_argument("--checker-component-cleanup", action="store_true", help="Remove enclosed checker-like regions; useful for black-outline text logos.")
    parser.add_argument("--checker-component-ratio", type=float, default=0.35, help="Checker-tone share needed to remove an enclosed light region.")
    parser.add_argument("--checker-component-max-white-ratio", type=float, default=0.20, help="Do not remove checker-like regions with more true-white fill than this.")
    parser.add_argument("--negative-light-cleanup", action="store_true", help="Remove small light islands left in text-logo negative space.")
    parser.add_argument("--negative-light-max-area", type=int, default=10000, help="Largest light island considered by --negative-light-cleanup.")
    parser.add_argument("--negative-light-always-area", type=int, default=3500, help="Always remove light islands up to this area.")
    parser.add_argument("--negative-light-max-density", type=float, default=0.60, help="Remove larger light islands up to max area when density is below this.")
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
