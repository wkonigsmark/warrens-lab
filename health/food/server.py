"""
Nutrition Planner API server.
Serves index.html and exposes JSON endpoints over the food.db SQLite database.

Usage: python server.py
       → http://localhost:9020
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import urllib.parse

PORT = int(os.environ.get("PORT", 9020))

os.chdir(Path(__file__).parent)
from schema import get_connection


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress access logs

    def send_json(self, data, status=200):
        body = json.dumps(data, default=str).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, filepath):
        p = Path(filepath)
        if not p.exists():
            self.send_response(404)
            self.end_headers()
            return
        mime = {
            ".html": "text/html; charset=utf-8",
            ".css":  "text/css",
            ".js":   "application/javascript",
            ".png":  "image/png",
        }.get(p.suffix, "text/plain")
        body = p.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path   = parsed.path
        params = dict(urllib.parse.parse_qsl(parsed.query))

        if path in ("/", "/index.html"):
            self.send_file("index.html")
        elif path == "/api/search":
            self._search(params)
        elif path.startswith("/api/food/"):
            self._food_detail(path.rstrip("/").split("/")[-1])
        elif path == "/api/categories":
            self._categories()
        else:
            self.send_response(404)
            self.end_headers()

    # ── API handlers ────────────────────────────────────────────────────────

    def _search(self, params):
        q   = params.get("q", "").strip()
        cat = params.get("category", "").strip()
        conn = get_connection()
        c    = conn.cursor()

        sql = """
            SELECT f.id, f.display_name, f.category, f.subcategory, f.tags,
                   n.calories, n.protein_g, n.carbs_g, n.net_carbs_g,
                   n.fat_g, n.fiber_g, n.sugar_g, n.saturated_fat_g,
                   n.omega3_epa_g, n.omega3_dha_g, n.sodium_mg
            FROM foods f
            LEFT JOIN nutrients n ON n.food_id = f.id AND n.cooking_method = 'raw'
            WHERE f.verified = 1
        """
        args = []
        if q:
            sql += """ AND (
                lower(f.display_name) LIKE lower(?)
             OR lower(f.name)         LIKE lower(?)
             OR lower(f.tags)         LIKE lower(?)
             OR lower(f.category)     LIKE lower(?)
            )"""
            args += [f"%{q}%"] * 4
        if cat:
            sql += " AND f.category = ?"
            args.append(cat)
        sql += " ORDER BY f.category, f.display_name LIMIT 80"

        c.execute(sql, args)
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        self.send_json(rows)

    def _food_detail(self, food_id):
        conn = get_connection()
        c    = conn.cursor()

        c.execute("SELECT * FROM foods WHERE id = ?", (food_id,))
        food = c.fetchone()
        if not food:
            conn.close()
            return self.send_json({"error": "not found"}, 404)

        c.execute("""
            SELECT * FROM nutrients
            WHERE food_id = ? AND cooking_method = 'raw'
        """, (food_id,))
        nutrients = c.fetchone()

        c.execute("""
            SELECT description, grams, is_default FROM serving_sizes
            WHERE food_id = ?
            ORDER BY is_default DESC, grams ASC
        """, (food_id,))
        servings = [dict(s) for s in c.fetchall()]

        conn.close()
        self.send_json({
            "food":      dict(food),
            "nutrients": dict(nutrients) if nutrients else {},
            "servings":  servings,
        })

    def _categories(self):
        conn = get_connection()
        c    = conn.cursor()
        c.execute("""
            SELECT category, COUNT(*) as n
            FROM foods WHERE verified = 1
            GROUP BY category ORDER BY n DESC
        """)
        cats = [{"name": r["category"], "count": r["n"]} for r in c.fetchall()]
        conn.close()
        self.send_json(cats)


if __name__ == "__main__":
    server = HTTPServer(("", PORT), Handler)
    print(f"Nutrition Planner  →  http://localhost:{PORT}")
    print("Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
