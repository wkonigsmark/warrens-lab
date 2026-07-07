#!/usr/bin/env python3
"""247Sports Composite team recruiting points, via CFBD's licensed feed.

We do NOT scrape 247sports.com (ToS-restricted, bot-blocked). CFBD carries the
247 Composite team points. The 2026 class isn't loaded there yet, so this
falls back to the 2025 class and says so loudly; drop a manual file at
data/raw/recruiting-247/manual-2026.json (same envelope) to override.
"""

from common import cfbd_get, raw_payload, write_raw

TARGET = 2026


def main():
    season = TARGET
    rows = cfbd_get("/recruiting/teams", year=season)
    if not rows:
        season = TARGET - 1
        rows = cfbd_get("/recruiting/teams", year=season)
        print(f"⚠️  {TARGET} class not in CFBD yet — fell back to the {season} class")

    data = [
        {"team": r["team"], "value": r["points"], "rank": r["rank"], "raw": {}}
        for r in rows
    ]
    notes = "247Sports Composite team points via CFBD (licensed). Team-level aggregate only."
    if season != TARGET:
        notes += f" FALLBACK: {season} class standing in until the {TARGET} class lands in CFBD."
    write_raw(
        "recruiting-247",
        f"{season}.json",
        raw_payload("247Sports Composite (via CFBD)",
                    "https://api.collegefootballdata.com/recruiting/teams",
                    season, notes, data),
    )


if __name__ == "__main__":
    main()
