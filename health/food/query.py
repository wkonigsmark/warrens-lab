"""
Query helpers for the food database.
Examples:
    python query.py --top-protein 10
    python query.py --search salmon
    python query.py --compare "chicken breast" "salmon"
    python query.py --stats
"""

import json
import argparse
from schema import get_connection

def get_food(conn, name_or_id):
    c = conn.cursor()
    if str(name_or_id).isdigit():
        c.execute("SELECT * FROM foods WHERE id=?", (int(name_or_id),))
    else:
        c.execute("SELECT * FROM foods WHERE lower(display_name) LIKE lower(?)", (f"%{name_or_id}%",))
    return c.fetchall()

def get_nutrients(conn, food_id, method="raw"):
    c = conn.cursor()
    c.execute("SELECT * FROM nutrients WHERE food_id=? AND cooking_method=?", (food_id, method))
    return c.fetchone()

def top_by_nutrient(conn, nutrient_col, limit=10, category=None, method="raw"):
    c = conn.cursor()
    base = f"""
        SELECT f.display_name, f.category, n.{nutrient_col}, n.calories,
               ROUND(n.{nutrient_col} / NULLIF(n.calories, 0) * 100, 2) as per_100kcal
        FROM nutrients n
        JOIN foods f ON f.id = n.food_id
        WHERE n.cooking_method = ? AND n.{nutrient_col} IS NOT NULL
    """
    params = [method]
    if category:
        base += " AND f.category = ?"
        params.append(category)
    base += f" ORDER BY n.{nutrient_col} DESC LIMIT ?"
    params.append(limit)
    c.execute(base, params)
    return c.fetchall()

def protein_efficiency(conn, limit=20, method="raw"):
    """Protein per calorie — the body recomp metric."""
    c = conn.cursor()
    c.execute("""
        SELECT f.display_name, f.category,
               n.protein_g, n.calories, n.fat_g, n.carbs_g,
               ROUND(n.protein_g / NULLIF(n.calories, 0) * 100, 2) as protein_per_100kcal
        FROM nutrients n
        JOIN foods f ON f.id = n.food_id
        WHERE n.cooking_method = ? AND n.calories > 0 AND n.protein_g > 0
        ORDER BY protein_per_100kcal DESC
        LIMIT ?
    """, (method, limit))
    return c.fetchall()

def search_foods(conn, query):
    c = conn.cursor()
    c.execute("""
        SELECT f.*, n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g
        FROM foods f
        LEFT JOIN nutrients n ON n.food_id = f.id AND n.cooking_method = 'raw'
        WHERE lower(f.display_name) LIKE lower(?)
           OR lower(f.name) LIKE lower(?)
           OR lower(f.tags) LIKE lower(?)
        ORDER BY f.category, f.display_name
    """, (f"%{query}%", f"%{query}%", f"%{query}%"))
    return c.fetchall()

def db_stats(conn):
    c = conn.cursor()
    c.execute("SELECT COUNT(*) as n FROM foods")
    total = c.fetchone()["n"]
    c.execute("SELECT COUNT(*) as n FROM foods WHERE verified=1")
    verified = c.fetchone()["n"]
    c.execute("SELECT category, COUNT(*) as n FROM foods GROUP BY category ORDER BY n DESC")
    by_cat = c.fetchall()
    c.execute("SELECT COUNT(*) as n FROM nutrients")
    nut_rows = c.fetchone()["n"]
    c.execute("SELECT COUNT(*) as n FROM amino_acids")
    aa_rows = c.fetchone()["n"]
    return {
        "total": total,
        "verified": verified,
        "by_category": {r["category"]: r["n"] for r in by_cat},
        "nutrient_rows": nut_rows,
        "amino_acid_rows": aa_rows,
    }

def print_row(row, cols=None):
    if cols:
        vals = [f"{row[c]}" for c in cols if row[c] is not None]
        print("  " + " | ".join(vals))
    else:
        print(dict(row))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query the food database")
    parser.add_argument("--stats", action="store_true")
    parser.add_argument("--search", type=str)
    parser.add_argument("--top-protein", type=int, metavar="N")
    parser.add_argument("--top-fiber", type=int, metavar="N")
    parser.add_argument("--top-omega3", type=int, metavar="N")
    parser.add_argument("--protein-efficiency", type=int, metavar="N")
    parser.add_argument("--category", type=str)
    parser.add_argument("--method", type=str, default="raw")
    args = parser.parse_args()

    conn = get_connection()

    if args.stats:
        s = db_stats(conn)
        print(f"\nFood Database Stats")
        print(f"  Total foods:     {s['total']}")
        print(f"  Enriched (USDA): {s['verified']}")
        print(f"  Nutrient rows:   {s['nutrient_rows']}")
        print(f"  Amino acid rows: {s['amino_acid_rows']}")
        print(f"\n  By category:")
        for cat, n in s["by_category"].items():
            print(f"    {cat:<20} {n}")

    elif args.search:
        rows = search_foods(conn, args.search)
        print(f"\nSearch: '{args.search}' — {len(rows)} results")
        for r in rows:
            cal = r["calories"] or 0
            prot = r["protein_g"] or 0
            print(f"  [{r['category']:<12}] {r['display_name']:<35} {cal:>5.0f} kcal  {prot:>5.1f}g protein")

    elif args.top_protein:
        rows = top_by_nutrient(conn, "protein_g", args.top_protein, args.category, args.method)
        print(f"\nTop {args.top_protein} by protein (per 100g, method={args.method}):")
        for r in rows:
            print(f"  {r['display_name']:<35} {r['protein_g']:>6.1f}g  ({r['per_100kcal']}g/100kcal)")

    elif args.top_fiber:
        rows = top_by_nutrient(conn, "fiber_g", args.top_fiber, args.category, args.method)
        print(f"\nTop {args.top_fiber} by fiber (per 100g, method={args.method}):")
        for r in rows:
            print(f"  {r['display_name']:<35} {r['fiber_g']:>6.1f}g fiber")

    elif args.top_omega3:
        rows = top_by_nutrient(conn, "omega3_dha_g", args.top_omega3, args.category, args.method)
        print(f"\nTop {args.top_omega3} by Omega-3 DHA (per 100g):")
        for r in rows:
            print(f"  {r['display_name']:<35} {r['omega3_dha_g']:>6.3f}g DHA")

    elif args.protein_efficiency:
        rows = protein_efficiency(conn, args.protein_efficiency, args.method)
        print(f"\nTop {args.protein_efficiency} protein-efficient foods (protein per 100 kcal):")
        for r in rows:
            print(f"  {r['display_name']:<35} {r['protein_per_100kcal']:>5.1f}g/100kcal  ({r['protein_g']:.1f}g protein, {r['calories']:.0f} kcal)")

    else:
        parser.print_help()

    conn.close()
