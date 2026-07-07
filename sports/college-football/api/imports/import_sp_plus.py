#!/usr/bin/env python3
"""SP+ ratings and returning production, via CFBD.

Bill Connelly's SP+ articles live behind the ESPN+ paywall — flagged, not
scraped. CFBD carries both datasets through its Connelly partnership. As of
this writing only the 2025 finals are loaded; 2026 preseason projections
usually land in CFBD around when the August article drops. This script tries
2026 first and falls back to 2025 with a loud note.

Manual override: data/raw/sp-plus/manual-2026.json (ratings) and
data/raw/sp-plus/manual-returning-2026.json (returning production), same
envelope — paste from the ESPN+ article if you can't wait for CFBD.
"""

from common import cfbd_get, raw_payload, write_raw

TARGET = 2026


def pull(path, year_key="year"):
    season = TARGET
    rows = cfbd_get(path, **{year_key: season})
    if not rows:
        season = TARGET - 1
        rows = cfbd_get(path, **{year_key: season})
        print(f"⚠️  {path} has no {TARGET} data yet — fell back to {season}")
    return season, rows


def main():
    # SP+ overall ratings
    season, rows = pull("/ratings/sp")
    data = [
        {"team": r["team"], "value": r["rating"], "rank": r.get("ranking"),
         "raw": {"offense": (r.get("offense") or {}).get("rating"),
                 "defense": (r.get("defense") or {}).get("rating")}}
        for r in rows if r.get("team") != "nationalAverages"
    ]
    notes = "SP+ overall rating via CFBD (ESPN+ article is paywalled — not scraped)."
    if season != TARGET:
        notes += f" FALLBACK: {season} final ratings standing in until {TARGET} projections publish."
    write_raw("sp-plus", f"ratings-{season}.json",
              raw_payload("SP+ ratings (via CFBD)",
                          "https://api.collegefootballdata.com/ratings/sp",
                          season, notes, data))

    # Returning production
    season, rows = pull("/player/returning")
    data = [
        {"team": r["team"], "value": r.get("percentPPA"), "rank": None,
         "raw": {"totalPPA": r.get("totalPPA"), "usage": r.get("usage")}}
        for r in rows
    ]
    data.sort(key=lambda d: -(d["value"] or 0))
    for i, d in enumerate(data, 1):
        d["rank"] = i
    notes = "Returning production (share of prior-season PPA returning) via CFBD."
    if season != TARGET:
        notes += (f" FALLBACK: {season} figures — these describe rosters entering {season}, "
                  f"NOT {TARGET}; treat as plumbing validation only until {TARGET} data lands.")
    write_raw("sp-plus", f"returning-{season}.json",
              raw_payload("SP+ returning production (via CFBD)",
                          "https://api.collegefootballdata.com/player/returning",
                          season, notes, data))


if __name__ == "__main__":
    main()
