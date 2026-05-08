# Chef Image Processor
### Automated food image standardizer for the Meal Planner game

Takes raw food PNGs from ChatGPT, removes the background, centers the food,
and outputs clean 512×512 transparent PNGs ready to use in the app.

---

## ⚙️ One-Time Setup

Only do this once. Open Terminal and run:

```bash
pip3 install Pillow rembg
pip3 install "rembg[cpu]"
```

> **Note:** The first time you run the processor, it will automatically download
> the AI background-removal model (~170MB). This happens once and is cached.

---

## 📁 Folder Structure

```
img-tool/
├── raw-img/          ← DROP YOUR FILES IN HERE
├── finished-img/     ← PROCESSED FILES APPEAR HERE
├── process_images.py ← The processor script
└── README.md         ← This file
```

---

## 🏷️ Naming Convention

All files dropped into `raw-img/` **must** follow this format:

```
raw_[food name].png
```

- Always start with `raw_`
- Use underscores for spaces — **no spaces in filenames**
- All lowercase
- Must be `.png`

### Examples

| You name it (raw-img/) | Processor outputs (finished-img/) |
| :--------------------- | :-------------------------------- |
| `raw_apple.png`        | `apple.png`                       |
| `raw_banana.png`       | `banana.png`                      |
| `raw_bell_pepper.png`  | `bell_pepper.png`                 |
| `raw_red_grapes.png`   | `red_grapes.png`                  |
| `raw_chicken_breast.png` | `chicken_breast.png`            |
| `raw_cheddar_cheese.png` | `cheddar_cheese.png`            |

---

## 🚀 How to Process Images (Every Time)

### Step 1 — Generate the image in ChatGPT
Use this prompt template for consistent results:

> *"Generate a high-resolution image of **[FOOD ITEM]** on a transparent background,
> photographed from a slightly overhead front angle. No shadows, no text, no extra objects. PNG format."*

### Step 2 — Name and drop the file
- Rename the downloaded file using the `raw_` naming convention above
- Drop it into the `raw-img/` folder

### Step 3 — Open Terminal and navigate to this folder
```bash
cd /Users/warren/Downloads/warrens-lab-main/recipes/chef/img-tool
```

### Step 4 — Run the processor
```bash
python3 process_images.py
```

The script will:
1. Detect any new files in `raw-img/` that haven't been processed yet
2. Strip the background using AI
3. Center and standardize to 512×512 transparent PNG
4. Save the result to `finished-img/`

You'll see output like:
```
⏳ Removing background from raw_apple.png...
✓ raw_apple.png  →  apple.png  [420×390 → 512×512px, 82KB]

Done. 1 image(s) processed.
```

---

## 🔧 Advanced Options

```bash
# Reprocess files that were already processed (e.g. after making changes)
python3 process_images.py --force

# Watch the raw-img/ folder continuously — drop a file in and it auto-processes
python3 process_images.py --watch

# Use a different canvas size (default is 512)
python3 process_images.py --size 256

# Adjust the padding around the food (default is 10%)
python3 process_images.py --padding 0.08
```

---

## ❓ Troubleshooting

| Problem | Fix |
| :------ | :-- |
| `pip: command not found` | Use `pip3` instead of `pip` |
| `No onnxruntime backend found` | Run `pip3 install "rembg[cpu]"` |
| `ModuleNotFoundError: PIL` | Run `pip3 install Pillow` |
| File not showing in output | Make sure filename starts with `raw_` and ends with `.png` |
| Already processed, want to redo | Add `--force` flag to the command |

---

*Part of the Chef / Meal Planner sub-system within Warren's Lab.*
