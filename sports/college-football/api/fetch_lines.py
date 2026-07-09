#!/usr/bin/env python3
"""Fetch betting lines from collegefootballdata.com → ../data/lines-<year>.json.

CFBD aggregates spreads from a handful of books (DraftKings, Bovada, ESPN Bet,
consensus). We do NOT scrape ESPN/sportsbook pages directly (ToS-restricted).

Spread convention (kept as CFBD returns it): from the HOME team's perspective,
negative = home favored. We also store a median across books so the frontend
has one robust number.

Usage:
    python3 fetch_lines.py [year]     # defaults to 2026

In July most games have no line yet — books post spreads closer to kickoff —
so expect partial coverage that grows through the summer. Needs CFBD_API_KEY.
"""

import json
import statistics
import sys
from pathlib import Path

import requests

from fetch_games import load_api_key, pick

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"


def median_or_none(values):
    vals = [v for v in values if v is not None]
    return round(statistics.median(vals), 1) if vals else None


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
    api_key = load_api_key()

    response = requests.get(
        "https://api.collegefootballdata.com/lines",
        headers={"Authorization": f"Bearer {api_key}"},
        params={"year": year, "seasonType": "regular"},
        timeout=30,
    )
    response.raise_for_status()

    games = []
    for g in response.json():
        raw_lines = g.get("lines") or []
        if not raw_lines:
            continue
        books = []
        for ln in raw_lines:
            spread = ln.get("spread")
            if spread is None:
                continue
            books.append({
                "book": ln.get("provider"),
                "spread": spread,                       # home perspective
                "overUnder": ln.get("overUnder"),
            })
        if not books:
            continue
        games.append({
            "id": g.get("id"),
            "week": g.get("week"),
            "homeTeam": pick(g, "homeTeam", "home_team"),
            "awayTeam": pick(g, "awayTeam", "away_team"),
            "marketSpread": median_or_none([b["spread"] for b in books]),
            "overUnder": median_or_none([b["overUnder"] for b in books]),
            "books": books,
        })

    out = {"year": year, "games": games}
    out_path = DATA_DIR / f"lines-{year}.json"
    out_path.write_text(json.dumps(out, indent=1))
    book_names = sorted({b["book"] for game in games for b in game["books"]})
    print(f"✅ {len(games)} games with lines → {out_path}")
    print(f"   books seen: {', '.join(book_names)}")


if __name__ == "__main__":
    main()
