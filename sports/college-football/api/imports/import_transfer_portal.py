#!/usr/bin/env python3
"""Transfer portal team-level net talent, computed from CFBD player-level data.

247/On3 publish editorial team portal rankings, but scraping their pages is
ToS-restricted — flagged, not scraped. Instead we aggregate CFBD's player-level
portal feed into a net score per team:

    net = sum(ratings of players gained) - sum(ratings of players lost)

Ratings are the 247-style 0-1 scale. When a player has no rating we map stars
(5→0.98 … 1→0.72), and default to 0.75 if neither exists. This is a computed
approximation of "talent gained vs lost", not 247's editorial ranking — if you
want their exact board, paste it into data/raw/transfer-portal/manual-2026.json.
"""

from collections import defaultdict

from common import cfbd_get, raw_payload, write_raw

SEASON = 2026
STAR_RATING = {5: 0.98, 4: 0.90, 3: 0.84, 2: 0.78, 1: 0.72}
DEFAULT_RATING = 0.75


def main():
    moves = cfbd_get("/player/portal", year=SEASON)
    teams = defaultdict(lambda: {"in": 0, "out": 0, "gained": 0.0, "lost": 0.0})
    unrated = 0
    for m in moves:
        val = m.get("rating")
        if val is None:
            val = STAR_RATING.get(m.get("stars"), DEFAULT_RATING)
            unrated += 1
        if m.get("destination"):
            t = teams[m["destination"]]
            t["in"] += 1
            t["gained"] += val
        if m.get("origin"):
            t = teams[m["origin"]]
            t["out"] += 1
            t["lost"] += val

    data = [
        {
            "team": team,
            "value": round(t["gained"] - t["lost"], 3),
            "rank": None,
            "raw": {"in": t["in"], "out": t["out"],
                    "gained": round(t["gained"], 3), "lost": round(t["lost"], 3)},
        }
        for team, t in teams.items()
    ]
    data.sort(key=lambda d: -d["value"])
    for i, d in enumerate(data, 1):
        d["rank"] = i

    write_raw(
        "transfer-portal",
        f"{SEASON}.json",
        raw_payload(
            "Transfer portal net (computed from CFBD player feed)",
            "https://api.collegefootballdata.com/player/portal",
            SEASON,
            f"Computed net = talent in − talent out from {len(moves)} portal moves; "
            f"{unrated} moves had no rating (star-mapped or defaulted to {DEFAULT_RATING}). "
            "NOT 247/On3's editorial team ranking (their pages are ToS-restricted — not scraped).",
            data,
        ),
    )


if __name__ == "__main__":
    main()
