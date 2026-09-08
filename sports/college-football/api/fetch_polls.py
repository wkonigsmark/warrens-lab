#!/usr/bin/env python3
"""Fetch the live AP Top 25 and Coaches Poll → ../data/polls-2026.json.

Replaces the hardcoded ESPN "way-too-early" Top 25 that seeded the project. These
are the real human polls, refreshed weekly, kept as a COMPARISON against the
W²-Index — never an input to it. Keeping every week lets the ledger show how the
polls and the model diverged as the season went.

    python3 fetch_polls.py [year]
"""

import json
import sys
from datetime import date
from pathlib import Path

import requests

from fetch_games import load_api_key

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
WANTED = ("AP Top 25", "Coaches Poll")      # ignore the FCS / D-II / D-III polls


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
    r = requests.get(
        "https://api.collegefootballdata.com/rankings",
        headers={"Authorization": f"Bearer {load_api_key()}"},
        params={"year": year, "seasonType": "regular"},
        timeout=30,
    )
    r.raise_for_status()
    weeks = sorted(r.json(), key=lambda w: w.get("week") or 0)
    if not weeks:
        sys.exit(f"No polls published yet for {year}.")

    history, latest = [], {}
    for w in weeks:
        entry = {"week": w.get("week"), "polls": {}}
        for p in w.get("polls", []):
            if p["poll"] not in WANTED:
                continue
            ranks = [
                {"rank": x["rank"], "school": x["school"],
                 "points": x.get("points"), "firstPlaceVotes": x.get("firstPlaceVotes")}
                for x in sorted(p["ranks"], key=lambda x: x["rank"])
            ]
            entry["polls"][p["poll"]] = ranks
            latest[p["poll"]] = {"week": w.get("week"), "ranks": ranks}
        if entry["polls"]:
            history.append(entry)

    out = {
        "season": year,
        "fetchedAt": date.today().isoformat(),
        "latestWeek": history[-1]["week"] if history else None,
        "note": ("Live AP & Coaches polls (CFBD). Display/comparison only — the human "
                 "polls are never an input to the W²-Index."),
        "latest": latest,
        "history": history,
    }
    path = DATA_DIR / f"polls-{year}.json"
    path.write_text(json.dumps(out, indent=1))
    print(f"✅ Polls → {path.name} · through week {out['latestWeek']} "
          f"({len(history)} week(s) kept)")
    for name, poll in latest.items():
        top = ", ".join(f"{x['rank']}.{x['school']}" for x in poll["ranks"][:5])
        print(f"   {name}: {top}")


if __name__ == "__main__":
    main()
