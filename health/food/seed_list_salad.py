"""
Salad-focused seed list — croutons, greens, toppings, dressings.
"""

SEED_FOODS_SALAD = [

    # ── CROUTONS ──────────────────────────────────────────────────────────────
    ("croutons, seasoned",                               "Croutons (Seasoned)",        "grain",     "salad",    ["salad","crunchy","topping","sodium"]),
    ("croutons, plain style",                            "Croutons (Plain)",           "grain",     "salad",    ["salad","crunchy","topping","lower_sodium"]),

    # ── SALAD GREENS ──────────────────────────────────────────────────────────
    ("lettuce, green leaf, raw",                         "Green Leaf Lettuce",         "vegetable", "leafy_green", ["very_low_cal","vitamin_k","salad"]),
    ("lettuce, red leaf, raw",                           "Red Leaf Lettuce",           "vegetable", "leafy_green", ["very_low_cal","anthocyanins","salad"]),
    ("lettuce, butterhead (includes boston and bibb), raw","Butter Lettuce (Boston/Bibb)","vegetable","leafy_green",["very_low_cal","folate","salad"]),
    ("lettuce, looseleaf, raw",                          "Spring Mix / Looseleaf",     "vegetable", "leafy_green", ["very_low_cal","vitamin_k","salad"]),
    ("chicory, raw",                                     "Chicory (Frisée)",           "vegetable", "leafy_green", ["inulin","prebiotic","very_low_cal","salad"]),

    # ── KEY SALAD VEGETABLES ──────────────────────────────────────────────────
    ("tomatoes, red, ripe, raw, year round average",     "Cherry Tomatoes",            "vegetable", "fruit_veg",   ["lycopene","vitamin_c","low_cal","salad"]),
    ("artichoke hearts, canned",                         "Artichoke Hearts (Canned)",  "vegetable", "canned",      ["fiber","cynarin","prebiotic","salad"]),
    ("hearts of palm, canned",                           "Hearts of Palm",             "vegetable", "canned",      ["low_cal","fiber","potassium","salad"]),
    ("beets, canned, drained",                           "Beets (Canned/Cooked)",      "vegetable", "root",        ["nitrates","folate","low_cal","salad"]),
    ("snap beans, green, raw",                           "Green Beans (Raw / Blanched)","vegetable","pod",         ["vitamin_k","low_cal","fiber","salad"]),
    ("peas, green, frozen, unprepared",                  "Frozen Peas",                "vegetable", "pod",         ["protein","fiber","vitamin_k","salad"]),
    ("corn, sweet, yellow, raw",                         "Fresh Corn (off cob)",       "vegetable", "corn",        ["fiber","complex_carb","salad"]),
    ("fennel, bulb, raw",                                "Fennel Bulb",                "vegetable", "other",       ["anethole","vitamin_c","low_cal","salad"]),
    ("kohlrabi, raw",                                    "Kohlrabi",                   "vegetable", "cruciferous",  ["vitamin_c","fiber","low_cal","salad"]),

    # ── SALAD TOPPINGS / ADD-INS ──────────────────────────────────────────────
    ("cranberries, dried, sweetened",                    "Dried Cranberries (Craisins)","fruit",    "dried",       ["antioxidants","sugar","vitamin_c","salad"]),
    ("raisins, seedless",                                "Raisins",                    "fruit",     "dried",       ["iron","potassium","natural_sugar","salad"]),
    ("seeds, pumpkin and squash seed kernels, dried",    "Pepitas (Pumpkin Seeds)",    "nuts_seeds","seed",        ["magnesium","zinc","protein","salad"]),
    ("nuts, pine nuts, dried",                           "Pine Nuts",                  "nuts_seeds","nut",         ["healthy_fat","manganese","vitamin_e","salad"]),
    ("nuts, walnuts, english",                           "Walnuts",                    "nuts_seeds","nut",         ["omega3","antioxidant","brain_health","salad"]),
    ("nuts, almonds",                                    "Almonds",                    "nuts_seeds","nut",         ["vitamin_e","magnesium","healthy_fat","salad"]),
    ("cheese, parmesan, grated",                         "Parmesan (Shredded / Grated)","dairy",   "hard_cheese",  ["calcium","protein","umami","salad"]),
    ("egg, whole, cooked, hard-boiled",                  "Hard-Boiled Egg",            "protein",   "egg",         ["complete_protein","choline","vitamin_d","salad"]),
    ("chicken, broilers or fryers, breast, meat only, cooked, grilled","Grilled Chicken Breast","protein","poultry",["lean","complete_protein","b6","salad"]),
    ("shrimp, mixed species, cooked, moist heat",        "Shrimp (Cooked)",            "protein",   "seafood",     ["very_lean","iodine","selenium","salad"]),
    ("seeds, sesame seeds, whole, dried",                "Sesame Seeds",               "nuts_seeds","seed",        ["calcium","healthy_fat","sesamin","salad"]),
    ("nuts, chestnuts, european, roasted",               "Chestnuts (Roasted)",        "nuts_seeds","nut",         ["low_fat","complex_carb","seasonal","salad"]),

    # ── SALAD DRESSINGS (gaps) ────────────────────────────────────────────────
    ("salad dressing, blue or roquefort cheese dressing","Blue Cheese Dressing",       "condiment", "dressing",    ["fat","calcium","sodium","salad"]),
    ("salad dressing, french dressing, commercial, regular","French Dressing",         "condiment", "dressing",    ["fat","sodium","classic","salad"]),
    ("salad dressing, honey mustard dressing",           "Honey Mustard Dressing",     "condiment", "dressing",    ["fat","sodium","sweet","salad"]),
    ("salad dressing, greek dressing",                   "Greek Dressing",             "condiment", "dressing",    ["fat","herbs","classic","salad"]),
    ("salad dressing, sesame seed dressing",             "Sesame Ginger Dressing",     "condiment", "dressing",    ["sesame","asian","salad"]),
    ("salad dressing, vinegar and oil",                  "Simple Vinaigrette",         "condiment", "dressing",    ["fat","clean","versatile","salad"]),
    ("salad dressing, poppyseed dressing",               "Poppyseed Dressing",         "condiment", "dressing",    ["sweet","creamy","salad"]),

    # ── OIL / ACID BASICS (for home-made dressings) ───────────────────────────
    ("lemon juice, raw",                                 "Lemon Juice (Fresh)",        "condiment", "juice",       ["vitamin_c","alkalizing","very_low_cal","dressing"]),
    ("lime juice, raw",                                  "Lime Juice (Fresh)",         "condiment", "juice",       ["vitamin_c","very_low_cal","dressing"]),
]

if __name__ == "__main__":
    cats = {}
    for item in SEED_FOODS_SALAD:
        c = item[2]
        cats[c] = cats.get(c, 0) + 1
    print(f"Total salad foods: {len(SEED_FOODS_SALAD)}")
    for cat, count in sorted(cats.items()):
        print(f"  {cat:<20} {count}")
