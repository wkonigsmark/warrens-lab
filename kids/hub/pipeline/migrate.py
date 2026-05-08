"""
migrate.py — One-time script to load existing JSON files into Supabase.
Run once: python3 kids/hub/pipeline/migrate.py
"""

import json
import os
import sys
from pathlib import Path

from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

DATA_DIR = Path(__file__).parent.parent / "data"


def load(filename):
    path = DATA_DIR / filename
    if not path.exists():
        return []
    return json.loads(path.read_text())


def item_to_row(item: dict, type_: str) -> dict:
    return {
        "id":                   item.get("id") or f"{type_}-{hash(str(item)) % 99999:05d}",
        "type":                 type_,
        "title":                item.get("title") or item.get("topic") or "",
        "date":                 item.get("date") or item.get("due_date"),
        "time":                 item.get("time"),
        "description":          item.get("description"),
        "child":                item.get("child"),
        "school":               item.get("school"),
        "subject":              item.get("subject"),
        "completed":            item.get("completed", False),
        "source_email_subject": item.get("source_email_subject"),
        "raw":                  item,
    }


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    rows = []
    for filename, type_ in [
        ("events.json",     "event"),
        ("tasks.json",      "task"),
        ("curriculum.json", "curriculum"),
    ]:
        items = load(filename)
        rows.extend(item_to_row(i, type_) for i in items)

    print(f"Inserting {len(rows)} rows...")
    # upsert in batches of 100
    for i in range(0, len(rows), 100):
        batch = rows[i:i+100]
        sb.table("items").upsert(batch).execute()
        print(f"  {min(i+100, len(rows))}/{len(rows)}")

    print("Done.")


if __name__ == "__main__":
    main()
