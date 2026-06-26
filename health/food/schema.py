"""
Food database schema — SQLite via Python sqlite3.
Run directly to initialize (or reset) the database.
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "food.db"

COOKING_METHODS = [
    "raw", "baked", "grilled", "steamed", "fried", "sauteed", "boiled",
    "roasted", "microwaved", "poached", "broiled", "air_fried", "braised",
    "smoked", "dehydrated", "pickled", "pressure_cooked", "sous_vide",
]

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

def init_db(reset=False):
    conn = get_connection()
    c = conn.cursor()

    if reset:
        c.executescript("""
            DROP TABLE IF EXISTS amino_acids;
            DROP TABLE IF EXISTS nutrients;
            DROP TABLE IF EXISTS serving_sizes;
            DROP TABLE IF EXISTS foods;
        """)

    c.executescript("""
        CREATE TABLE IF NOT EXISTS foods (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            fdc_id          INTEGER UNIQUE,
            name            TEXT NOT NULL,
            display_name    TEXT NOT NULL,
            category        TEXT NOT NULL,
            subcategory     TEXT,
            brand           TEXT,
            description     TEXT,
            tags            TEXT,       -- JSON array
            usda_type       TEXT,       -- Foundation, SR Legacy, Branded, Survey
            verified        INTEGER DEFAULT 0,
            date_added      TEXT DEFAULT (date('now')),
            last_enriched   TEXT
        );

        CREATE TABLE IF NOT EXISTS serving_sizes (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            food_id         INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
            description     TEXT NOT NULL,  -- e.g. "1 medium", "1 cup", "1 oz"
            grams           REAL NOT NULL,  -- weight in grams
            is_default      INTEGER DEFAULT 0,
            source          TEXT            -- usda, manual
        );

        CREATE TABLE IF NOT EXISTS nutrients (
            id                      INTEGER PRIMARY KEY AUTOINCREMENT,
            food_id                 INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
            cooking_method          TEXT NOT NULL DEFAULT 'raw',
            per_grams               REAL NOT NULL DEFAULT 100,  -- always 100g

            -- Macros
            calories                REAL,
            protein_g               REAL,
            carbs_g                 REAL,
            fiber_g                 REAL,
            sugar_g                 REAL,
            sugar_alcohol_g         REAL,
            net_carbs_g             REAL,   -- computed: carbs - fiber - sugar_alcohol
            fat_g                   REAL,
            saturated_fat_g         REAL,
            monounsaturated_fat_g   REAL,
            polyunsaturated_fat_g   REAL,
            trans_fat_g             REAL,
            cholesterol_mg          REAL,
            water_g                 REAL,
            alcohol_g               REAL,

            -- Vitamins
            vitamin_a_mcg           REAL,   -- RAE
            vitamin_b1_mg           REAL,   -- thiamine
            vitamin_b2_mg           REAL,   -- riboflavin
            vitamin_b3_mg           REAL,   -- niacin
            vitamin_b5_mg           REAL,   -- pantothenic acid
            vitamin_b6_mg           REAL,
            vitamin_b7_mcg          REAL,   -- biotin
            vitamin_b9_mcg          REAL,   -- folate (DFE)
            vitamin_b12_mcg         REAL,
            vitamin_c_mg            REAL,
            vitamin_d_mcg           REAL,
            vitamin_e_mg            REAL,
            vitamin_k_mcg           REAL,

            -- Minerals
            calcium_mg              REAL,
            chromium_mcg            REAL,
            copper_mg               REAL,
            fluoride_mg             REAL,
            iodine_mcg              REAL,
            iron_mg                 REAL,
            magnesium_mg            REAL,
            manganese_mg            REAL,
            molybdenum_mcg          REAL,
            phosphorus_mg           REAL,
            potassium_mg            REAL,
            selenium_mcg            REAL,
            sodium_mg               REAL,
            zinc_mg                 REAL,

            -- Fatty acids
            omega3_ala_g            REAL,
            omega3_epa_g            REAL,
            omega3_dha_g            REAL,
            omega6_linoleic_g       REAL,
            omega6_arachidonic_g    REAL,

            -- Glycemic
            glycemic_index          REAL,
            glycemic_load           REAL,

            -- Scoring / derived
            inflammation_score      REAL,   -- -10 (pro) to +10 (anti), if available
            protein_quality_diaas   REAL,   -- Digestible Indispensable Amino Acid Score
            protein_quality_pdcaas  REAL,

            -- Source / confidence
            data_source             TEXT,   -- usda_foundation, usda_sr, estimated, manual
            notes                   TEXT,

            UNIQUE(food_id, cooking_method)
        );

        CREATE TABLE IF NOT EXISTS amino_acids (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            food_id         INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
            cooking_method  TEXT NOT NULL DEFAULT 'raw',

            -- Essential (per 100g, in mg)
            histidine_mg        REAL,
            isoleucine_mg       REAL,
            leucine_mg          REAL,
            lysine_mg           REAL,
            methionine_mg       REAL,
            phenylalanine_mg    REAL,
            threonine_mg        REAL,
            tryptophan_mg       REAL,
            valine_mg           REAL,

            -- Non-essential (commonly tracked)
            alanine_mg          REAL,
            arginine_mg         REAL,
            aspartic_acid_mg    REAL,
            cystine_mg          REAL,
            glutamic_acid_mg    REAL,
            glycine_mg          REAL,
            proline_mg          REAL,
            serine_mg           REAL,
            tyrosine_mg         REAL,

            UNIQUE(food_id, cooking_method)
        );

        CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
        CREATE INDEX IF NOT EXISTS idx_foods_fdc_id ON foods(fdc_id);
        CREATE INDEX IF NOT EXISTS idx_nutrients_food_method ON nutrients(food_id, cooking_method);
        CREATE INDEX IF NOT EXISTS idx_amino_acids_food_method ON amino_acids(food_id, cooking_method);
    """)

    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

if __name__ == "__main__":
    import sys
    reset = "--reset" in sys.argv
    init_db(reset=reset)
