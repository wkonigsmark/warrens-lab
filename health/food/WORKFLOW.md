# Food Database Workflow

This document explains the complete workflow for adding new foods to the Nutrition Planner.

## Overview

The app uses a **static JSON deployment model**:

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────┐
│  Add new foods  │────▶│   Enrich DB  │────▶│ Export JSON │────▶│  Deploy   │
│  (Python seed   │     │  (USDA API)  │     │  (foods.db) │     │ (GitHub)  │
│    list file)   │     │              │     │             │     │           │
└─────────────────┘     └──────────────┘     └─────────────┘     └───────────┘
        LOCAL               LOCAL                LOCAL              PRODUCTION
```

**Key advantage:** Once exported to JSON, the app runs fully static—no backend server needed on production.

---

## Step 1: Add New Foods (Local)

### Option A: Create a New Seed List

Create `seed_list_xyz.py` for a batch of foods:

```python
SEED_FOODS_XYZ = [
    ("food_name_lowercase", "Display Name", "category", "subcategory", ["tags"]),
    # Example:
    ("tuna, canned in water", "Tuna (Canned, Water)", "protein", "fish", ["canned", "shelf_stable", "omega3"]),
]
```

**Categories:** `protein`, `vegetable`, `fruit`, `grain`, `dairy`, `legume`, `nuts_seeds`, `condiment`, `fat`, `beverage`, `herbs_spices`, `fermented`, `superfood`, `supplement`

### Option B: Edit an Existing Seed List

```bash
nano seed_list_v5.py  # Or whichever is most relevant
```

---

## Step 2: Enrich Foods from USDA

### Register Your Seed List

Edit `enrich.py` and add a CLI flag:

```python
# Around line 370
elif seed_module == "seed_list_xyz":
    from seed_list_xyz import SEED_FOODS_XYZ as foods

# Around line 410
parser.add_argument("--seed-xyz", action="store_true", help="Enrich XYZ foods")

# Around line 470
if args.seed_xyz:
    enrich_all_seeds(verbose, seed_module="seed_list_xyz")
```

### Run Enrichment

```bash
cd /Users/warren/labs/warrens-lab-main/health/food

# Enrich your new batch
python3 enrich.py --seed-xyz

# Check for errors (duplicate display_names, UNIQUE violations)
sqlite3 food.db "SELECT display_name, COUNT(*) FROM foods GROUP BY display_name HAVING COUNT > 1"
```

**What happens:**
- Each food is searched in USDA FoodData Central API
- Nutrient data (per 100g) is fetched and stored in `food.db`
- If a food can't be found, it appears as an unenriched entry (empty nutrients row)

### Fix Unenriched or Mismatched Foods

**Problem:** Food matched the wrong USDA entry (e.g., "Shrimp" matched clams).

**Solution 1 — Find the correct FDC ID:**

```bash
# Search USDA for the correct food
python3 -c "
from enrich import load_api_key, get_food_detail
api_key = load_api_key()
# Search for correct match, note its FDC ID
result = get_food_detail('175180', api_key)  # Example: real shrimp
print(result)
"
```

Then use `enrich_direct()`:

```python
from enrich import enrich_direct, upsert_food, write_nutrients
from schema import get_connection

conn = get_connection()
# Delete the mismatched entry and re-enrich with correct FDC
enrich_direct(conn, food_name="shrimp, mixed species, cooked", fdc_id=175180, sr_only=False)
```

**Solution 2 — Manually insert computed macros:**

For foods without USDA entries (e.g., cocktails, local pizza), compute macros and insert:

```python
from schema import get_connection
from enrich import upsert_food

conn = get_connection()
c = conn.cursor()

def insert_manual(name, display, cat, subcat, tags, nutrients_dict, serving_ml=None):
    food_id = upsert_food(conn, name, display, cat, subcat, tags)
    # Clear old nutrients
    for t in ("nutrients", "amino_acids", "serving_sizes"):
        c.execute(f"DELETE FROM {t} WHERE food_id=?", (food_id,))
    
    # Compute net carbs
    nutrients_dict["net_carbs_g"] = max(0, nutrients_dict.get("carbs_g", 0) - nutrients_dict.get("fiber_g", 0))
    
    # Insert nutrients per 100g/ml
    cols = list(nutrients_dict.keys())
    c.execute(
        f"INSERT INTO nutrients (food_id,cooking_method,per_grams,data_source,{','.join(cols)}) "
        f"VALUES (?,'raw',100,'recipe_calculated',{','.join(['?']*len(cols))})",
        [food_id] + [nutrients_dict[k] for k in cols]
    )
    
    # Insert serving size
    c.execute("INSERT INTO serving_sizes(food_id,description,grams,is_default,source) VALUES(?,?,?,?,?)",
              (food_id, "100ml", 100.0, 0, "standard"))
    if serving_ml:
        c.execute("INSERT INTO serving_sizes(food_id,description,grams,is_default,source) VALUES(?,?,?,?,?)",
                  (food_id, f"1 serving ({serving_ml}ml)", float(serving_ml), 1, "recipe"))
    
    conn.commit()

# Example: Martini
insert_manual(
    "cocktail, martini, gin based", 
    "Martini (Gin)",
    "beverage", "cocktail",
    ["alcohol", "cocktail", "nyc"],
    {"calories": 175, "carbs_g": 0.5, "sugar_g": 0.5, "alcohol_g": 12.5, "protein_g": 0.0, "fat_g": 0.0},
    serving_ml=60
)
```

**Why `data_source='recipe_calculated'`?** It marks these as manually entered, so you know they're not from USDA.

---

## Step 3: Deduplicate & Verify

After enrichment, check for duplicates:

```bash
sqlite3 food.db "SELECT display_name, COUNT(*) as cnt FROM foods GROUP BY display_name HAVING cnt > 1"
```

If duplicates exist, keep the enriched one and delete others:

```python
from schema import get_connection

conn = get_connection()
c = conn.cursor()

# Find duplicates
c.execute("""
  SELECT display_name, COUNT(*) as cnt 
  FROM foods 
  GROUP BY display_name 
  HAVING cnt > 1
""")

for row in c.fetchall():
    display = row['display_name']
    
    # Get all IDs for this display name
    c.execute("SELECT id FROM foods WHERE display_name = ? ORDER BY id", (display,))
    ids = [r['id'] for r in c.fetchall()]
    
    # Delete all but the first (usually the enriched one)
    for del_id in ids[1:]:
        for t in ("nutrients", "amino_acids", "serving_sizes"):
            c.execute(f"DELETE FROM {t} WHERE food_id = ?", (del_id,))
        c.execute("DELETE FROM foods WHERE id = ?", (del_id,))
    
    conn.commit()
    print(f"Deduped: {display} (kept ID {ids[0]})")
```

---

## Step 4: Export to JSON

Once all foods are enriched and deduplicated:

```bash
python3 export_to_json.py
```

This creates `foods.json` (~850KB for 600+ foods) with all nutrient data.

**Verify the export:**

```bash
python3 -c "
import json
with open('foods.json') as f:
    data = json.load(f)
print(f'Foods: {data[\"metadata\"][\"total_foods\"]}')
print(f'Categories: {len(data[\"metadata\"][\"categories\"])}')
print(f'File size: {len(json.dumps(data)) / 1024 / 1024:.2f} MB')
"
```

---

## Step 5: Commit & Deploy

Push the updated database and JSON to GitHub:

```bash
git add food.db foods.json
git commit -m "Add XYZ foods (N new entries)"
git push
```

**The app will auto-update** on any static host (GitHub Pages, Vercel, Netlify) because it loads `foods.json` on startup.

No backend server needed. Fully static. No deployment scripts.

---

## Troubleshooting

### "UNIQUE constraint failed: foods.fdc_id"

**Problem:** Multiple foods matched the same FDC ID (e.g., all pasta shapes = FDC 169736).

**Solution:**
1. Keep one with the correct FDC ID
2. Delete the others and clone their nutrients from the kept one:

```python
from schema import get_connection

conn = get_connection()
c = conn.cursor()

# Delete mismatched entries
for bad_id in [bad_id1, bad_id2]:
    for t in ("nutrients", "amino_acids", "serving_sizes"):
        c.execute(f"DELETE FROM {t} WHERE food_id = ?", (bad_id,))
    c.execute("DELETE FROM foods WHERE id = ?", (bad_id,))

# Clone nutrients from the source food
c.execute("""
  INSERT INTO nutrients (food_id, cooking_method, per_grams, data_source, calories, protein_g, ...)
  SELECT ?, cooking_method, per_grams, 'cloned_from_usda_169736', calories, protein_g, ...
  FROM nutrients
  WHERE food_id = ?
""", (new_food_id, source_food_id))

conn.commit()
```

### "HTTP 400 from search: carambola (starfruit), raw"

**Problem:** Parentheses in food names break USDA search.

**Solution:** Remove parentheses from the seed list name:

```python
# ❌ Bad
("carambola (starfruit), raw", "Carambola (Starfruit)", ...),

# ✅ Good
("carambola, raw", "Carambola (Starfruit)", ...),  # Display name can keep the parentheses
```

### Food shows but has 0 calories

**Problem:** USDA doesn't have complete nutrient data for this food.

**Solution:** Use `insert_manual()` with computed or researched values.

---

## Quick Reference

| Task | Command |
|------|---------|
| Add seed list | Create `seed_list_new.py` with food tuples |
| Enrich | `python3 enrich.py --seed-new` |
| Check for USDA mismatches | `sqlite3 food.db "SELECT * FROM foods WHERE fdc_id IS NULL"` |
| Deduplicate | Run dedup script (above) |
| Export | `python3 export_to_json.py` |
| Commit | `git add food.db foods.json && git commit -m "..."` |
| Deploy | `git push` (auto-updates on static host) |

---

## The Data Flow

```
seed_list_xyz.py
    ↓ (food names)
enrich.py (USDA API search)
    ↓ (nutrient data)
food.db (SQLite, normalized schema)
    ↓ (entire DB export)
foods.json (static, ~850KB)
    ↓ (HTTP GET on page load)
index.html (in-browser search, no server needed)
    ↓ (meal planning UI)
User sees 600+ foods, 0 latency ✨
```

---

## Future Improvements

- [ ] Batch USDA API calls to speed up enrichment
- [ ] Web UI for adding foods (POST → regenerate JSON → auto-commit)
- [ ] Sync `foods.json` to CDN for faster global loads
- [ ] Mobile app that syncs meals to GitHub Gists

---

## Questions?

Check the app's "💡 Setup Guide" and "➕ Add Foods" buttons for quick reminders!
