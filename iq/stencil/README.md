# Stencil — Letter Practice App

A handwriting practice application designed for children to develop letter and number writing skills using a stylus (like Apple Pencil) on tablets.

## Features

- ✏️ Smooth drawing canvas optimized for stylus input
- 📝 Guide lines (worm, grass, plane, sky) for letter formation
- 🎨 Parchment-style background with subtle texture
- 📱 Optimized for iPad and tablet devices
- 🧹 Clear button to reset canvas

## Quick Start

### Local Development
Simply open `index.html` in your browser, or serve through the root lab server:
```bash
# From warrens-lab-main/:
python3 -m http.server 8001
# Then visit: http://localhost:8001/stencil/
```

---

## 🖼️ Image Asset Pipeline (`tools/stencil_fix.py`)

This tool cleans up raw vocabulary images before they are used in the app. It:
1. **Removes the white/checkerboard background** from images exported out of AI tools or image editors
2. **Crops tightly** to the actual content
3. **Centers it** on a clean `512×512` transparent PNG canvas — the exact format the app expects

All finished assets live in `assets/` and must be lowercase `.png` files (e.g. `candy.png`).

### Prerequisites

Both required libraries are **already installed** on this machine:
```
Pillow 12.1.1
NumPy 2.4.2
```

If you ever need to reinstall them (e.g. on a new machine):
```bash
pip3 install Pillow numpy
```

---

### Usage — all commands run from the `stencil/` folder

#### Mode 1: Process a single raw image → one finished icon

This is the most common workflow. Place your raw image in `tools/` named `raw_<word>.png`, then run:

```bash
python3 tools/stencil_fix.py --in tools/raw_candy.png  --out assets/candy.png
python3 tools/stencil_fix.py --in tools/raw_car.png    --out assets/car.png
python3 tools/stencil_fix.py --in tools/raw_clock.png  --out assets/clock.png
python3 tools/stencil_fix.py --in tools/raw_dice.png   --out assets/dice.png
```

> **Rule:** The `--out` filename (without `.png`) **must exactly match** the word in `STENCIL_CERTIFIED` inside `app.js` — lowercase, no spaces.

---

#### Mode 2: Split a composite image into multiple icons

If you have a single image containing 2 or 3 icons side-by-side (e.g. exported as a strip), split them in one command:

```bash
# Split into 2 icons
python3 tools/stencil_fix.py --in tools/raw_strip.png --split 2 --names fan ring --outdir assets/

# Split into 3 icons
python3 tools/stencil_fix.py --in tools/raw_strip.png --split 3 --names fan map ring --outdir assets/
```

The `--names` list must match the number of slices exactly.

---

#### Mode 3: Batch process an entire folder at once

If you have many raw images in one folder (like `tools/`):

```bash
python3 tools/stencil_fix.py --indir tools/ --outdir assets/
```

> **Note:** In batch mode, only `.png`, `.jpg`, `.jpeg`, and `.webp` files are processed. Output filenames are the source stem lowercased (e.g. `raw_candy.png` → `candy.png`).

---

### Optional flags

| Flag | Default | Description |
|------|---------|-------------|
| `--thresh` | `235` | How aggressively to strip white background (0–255). Raise if too much is removed; lower if white fringe remains. |
| `--pad` | `20` | Pixels of breathing room kept around the cropped content. |
| `--size` | `512` | Output canvas size in pixels (always square). |
| `--margin` | `30` | Inner margin between the icon and the canvas edge. |

---

### After processing — register the word in `app.js`

Once the image is in `assets/`, add the word to the `STENCIL_CERTIFIED` array in `app.js` (alphabetical order):

```js
// In app.js — STENCIL_CERTIFIED array
const STENCIL_CERTIFIED = [
    // ... existing words ...
    'CANDY',   // ← add in alphabetical position
    'CAR',
    'CLOCK',
    // ...
];
```

The word must be **ALL CAPS** in `STENCIL_CERTIFIED`. The asset file must be the **lowercase** equivalent: `candy.png`, `car.png`, `clock.png`.

After saving `app.js`, reload the app in the browser and the new words will appear automatically.

---

## Technology Stack

- Pure HTML5/CSS3/JavaScript
- HTML5 Canvas API
- Touch Events API for stylus support
- Python 3 with Pillow/NumPy (for asset processing)

## Browser Support

Optimized for:
- Safari on iPad
- Chrome on Android tablets
- Modern desktop browsers (for testing)

## License

Personal use only.
