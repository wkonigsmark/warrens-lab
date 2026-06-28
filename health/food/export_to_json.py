#!/usr/bin/env python3
"""
Export food.db to foods.json for static deployment.

Usage:
  python3 export_to_json.py

This creates a foods.json file that can be deployed to static hosting
(GitHub Pages, Vercel, etc.) without needing a Python backend server.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from schema import get_connection

def export_to_json(output_file="foods.json"):
    conn = get_connection()
    c = conn.cursor()

    # Get all foods with their full nutrient data
    c.execute("""
        SELECT DISTINCT
            f.id, f.name, f.display_name, f.category, f.subcategory,
            f.tags, f.fdc_id, n.id as nutrient_id,
            n.cooking_method, n.per_grams, n.data_source,
            n.calories, n.protein_g, n.carbs_g, n.net_carbs_g,
            n.fiber_g, n.sugar_g, n.fat_g, n.saturated_fat_g,
            n.cholesterol_mg, n.sodium_mg, n.potassium_mg,
            n.calcium_mg, n.iron_mg, n.magnesium_mg, n.phosphorus_mg,
            n.zinc_mg, n.copper_mg, n.manganese_mg, n.selenium_mcg,
            n.vitamin_a_mcg, n.vitamin_c_mg, n.vitamin_d_mcg,
            n.vitamin_e_mg, n.vitamin_k_mcg, n.vitamin_b1_mg,
            n.vitamin_b2_mg, n.vitamin_b3_mg, n.vitamin_b5_mg,
            n.vitamin_b6_mg, n.vitamin_b9_mcg, n.vitamin_b12_mcg,
            n.alcohol_g, n.water_g, n.omega3_ala_g, n.omega3_dha_g,
            n.omega3_epa_g, n.omega6_linoleic_g, n.omega6_arachidonic_g
        FROM foods f
        LEFT JOIN nutrients n ON f.id = n.food_id
        ORDER BY f.category, f.display_name, n.cooking_method
    """)

    foods_dict = {}
    for row in c.fetchall():
        food_id = row['id']
        if food_id not in foods_dict:
            foods_dict[food_id] = {
                "id": row['id'],
                "name": row['name'],
                "display_name": row['display_name'],
                "category": row['category'],
                "subcategory": row['subcategory'],
                "tags": row['tags'].split(',') if row['tags'] else [],
                "fdc_id": row['fdc_id'],
                "nutrients": []
            }

        if row['nutrient_id'] is not None:
            nutrient = {
                "cooking_method": row['cooking_method'],
                "per_grams": row['per_grams'],
                "data_source": row['data_source'],
                "calories": row['calories'],
                "protein_g": row['protein_g'],
                "carbs_g": row['carbs_g'],
                "net_carbs_g": row['net_carbs_g'],
                "fiber_g": row['fiber_g'],
                "sugar_g": row['sugar_g'],
                "fat_g": row['fat_g'],
                "saturated_fat_g": row['saturated_fat_g'],
                "cholesterol_mg": row['cholesterol_mg'],
                "sodium_mg": row['sodium_mg'],
                "potassium_mg": row['potassium_mg'],
                "calcium_mg": row['calcium_mg'],
                "iron_mg": row['iron_mg'],
                "magnesium_mg": row['magnesium_mg'],
                "phosphorus_mg": row['phosphorus_mg'],
                "zinc_mg": row['zinc_mg'],
                "copper_mg": row['copper_mg'],
                "manganese_mg": row['manganese_mg'],
                "selenium_mcg": row['selenium_mcg'],
                "vitamin_a_mcg": row['vitamin_a_mcg'],
                "vitamin_c_mg": row['vitamin_c_mg'],
                "vitamin_d_mcg": row['vitamin_d_mcg'],
                "vitamin_e_mg": row['vitamin_e_mg'],
                "vitamin_k_mcg": row['vitamin_k_mcg'],
                "vitamin_b1_mg": row['vitamin_b1_mg'],
                "vitamin_b2_mg": row['vitamin_b2_mg'],
                "vitamin_b3_mg": row['vitamin_b3_mg'],
                "vitamin_b5_mg": row['vitamin_b5_mg'],
                "vitamin_b6_mg": row['vitamin_b6_mg'],
                "vitamin_b9_mcg": row['vitamin_b9_mcg'],
                "vitamin_b12_mcg": row['vitamin_b12_mcg'],
                "alcohol_g": row['alcohol_g'],
                "water_g": row['water_g'],
                "omega3_ala_g": row['omega3_ala_g'],
                "omega3_dha_g": row['omega3_dha_g'],
                "omega3_epa_g": row['omega3_epa_g'],
                "omega6_linoleic_g": row['omega6_linoleic_g'],
                "omega6_arachidonic_g": row['omega6_arachidonic_g']
            }
            # Remove None values to keep JSON smaller
            nutrient = {k: v for k, v in nutrient.items() if v is not None}
            foods_dict[food_id]["nutrients"].append(nutrient)

    # Get categories for quick reference
    c.execute("SELECT DISTINCT category FROM foods WHERE category IS NOT NULL ORDER BY category")
    categories = [row['category'] for row in c.fetchall()]

    output = {
        "metadata": {
            "total_foods": len(foods_dict),
            "categories": categories,
            "exported_at": __import__('datetime').datetime.now().isoformat()
        },
        "foods": list(foods_dict.values())
    }

    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)

    conn.close()

    # Print stats
    total_size = len(json.dumps(output)) / 1024 / 1024  # MB
    print(f"✓ Exported {len(foods_dict)} foods to {output_file}")
    print(f"  File size: {total_size:.2f} MB")
    print(f"  Categories: {len(categories)}")
    print(f"\nNext: Commit this file to GitHub and deploy!")

if __name__ == "__main__":
    export_to_json()
