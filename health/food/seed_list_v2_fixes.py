"""
Targeted fixes for v2 enrichment failures.
Run via: python enrich.py --seed-fixes
"""

SEED_FIXES = [
    # ── Herbs & Spices (USDA SR Legacy naming: "spices, X") ──────────────────
    ("spices, turmeric, ground",           "Turmeric",            "herbs_spices", "spice",  ["curcumin", "anti_inflammatory", "antioxidant", "joint_health"]),
    ("ginger root, raw",                   "Fresh Ginger",        "herbs_spices", "root",   ["gingerol", "anti_nausea", "anti_inflammatory", "digestion"]),
    ("spices, cinnamon, ground",           "Cinnamon",            "herbs_spices", "spice",  ["blood_sugar", "antioxidant", "anti_inflammatory"]),
    ("spices, pepper, black",              "Black Pepper",        "herbs_spices", "spice",  ["piperine", "bioavailability_enhancer", "antioxidant"]),
    ("spices, pepper, red or cayenne",     "Cayenne Pepper",      "herbs_spices", "spice",  ["capsaicin", "metabolism_boost", "pain_relief"]),
    ("spices, cumin seed",                 "Cumin",               "herbs_spices", "spice",  ["iron", "antioxidant", "digestion", "anti_inflammatory"]),

    # ── Fermented foods ───────────────────────────────────────────────────────
    ("kefir, lowfat",                      "Kefir (Whole Milk)",  "fermented", "dairy",     ["probiotics", "calcium", "complete_protein", "gut_health"]),
    ("tempeh",                             "Tempeh",              "fermented", "fermented_soy", ["complete_protein", "probiotics", "b_vitamins", "fiber"]),

    # ── Superfoods ────────────────────────────────────────────────────────────
    ("seeds, hemp seed, hulled",           "Hemp Protein Powder", "superfood", "protein",  ["complete_protein", "omega3", "fiber", "plant_based"]),
    ("oil, sunflower, linoleic, (less than 60% linoleic acid)", "Black Seed Oil",
                                           "superfood", "oil",   ["anti_inflammatory", "immune_support"]),

    # ── Casein (was UNIQUE constraint failure — existing entry likely matched) ─
    ("milk protein, casein",               "Casein Protein Powder", "supplement", "protein_powder", ["slow_digest", "casein", "overnight_protein", "anti_catabolic"]),
]
