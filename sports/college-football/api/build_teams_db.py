#!/usr/bin/env python3
"""Build the comprehensive team database at ../data/teams-db.json.

Base layer: every team from the CFBD /teams endpoint that has an active
classification (fbs / fcs / ii / iii). On top of that we merge the extras
from data/source/cfp_meta.csv (acronym, helmet art URL, ESPN name variants),
joined on the CSV's "CFD Name" column.

Usage:
    python3 build_teams_db.py

Needs CFBD_API_KEY (env var or api/.env), same as fetch_games.py.
"""

import csv
import json
import re
import sys
from pathlib import Path

import requests

from fetch_games import load_api_key

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
CSV_PATH = DATA_DIR / "source" / "cfp_meta.csv"

# CFP auto-bid tiers (2026-27 format): champs of the Power 4 get auto bids,
# the highest-ranked Group of 6 team gets one, and Notre Dame qualifies as
# an independent by finishing top 12.
POWER_4 = {"ACC", "Big 12", "Big Ten", "SEC"}
GROUP_6 = {
    "American Athletic",
    "Conference USA",
    "Mid-American",
    "Mountain West",
    "Pac-12",
    "Sun Belt",
}


def conf_tier(team):
    if team.get("classification") != "fbs":
        return None
    conf = team.get("conference")
    if conf in POWER_4:
        return "power4"
    if conf in GROUP_6:
        return "group6"
    return "independent"


def load_csv_meta():
    """Index CSV rows by their CFD (collegefootballdata) school name."""
    meta = {}
    with CSV_PATH.open() as f:
        for row in list(csv.reader(f))[1:]:
            if len(row) < 8:
                continue
            futures, schedule, acronym, conf, helmet_url, _, power_index, cfd = (
                c.strip() for c in row[:8]
            )
            if not cfd:
                continue
            # Futures name has the acronym glued on ("Army Black KnightsARMY")
            if acronym and futures.endswith(acronym):
                futures = futures[: -len(acronym)].strip()
            meta[cfd] = {
                "acronym": acronym or None,
                "csvConference": conf or None,
                "helmetUrl": helmet_url or None,
                "espnFuturesName": futures or None,
                "espnScheduleName": schedule or None,
                "espnPowerIndexName": power_index or None,
            }
    return meta


def main():
    api_key = load_api_key()
    response = requests.get(
        "https://api.collegefootballdata.com/teams",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=30,
    )
    response.raise_for_status()
    cfbd_teams = [t for t in response.json() if t.get("classification")]

    csv_meta = load_csv_meta()
    matched_csv_names = set()

    records = []
    for t in cfbd_teams:
        school = t["school"]
        extra = csv_meta.get(school, {})
        if extra:
            matched_csv_names.add(school)
        loc = t.get("location") or {}
        aliases = sorted(
            {
                n
                for n in [
                    *(t.get("alternateNames") or []),
                    extra.get("espnFuturesName"),
                    extra.get("espnScheduleName"),
                    extra.get("espnPowerIndexName"),
                ]
                if n and n != school
            }
        )
        records.append(
            {
                "id": t["id"],
                "school": school,
                "mascot": t.get("mascot"),
                "abbreviation": t.get("abbreviation") or extra.get("acronym"),
                "acronym": extra.get("acronym") or t.get("abbreviation"),
                "aliases": aliases,
                "conference": t.get("conference") or extra.get("csvConference"),
                "confTier": conf_tier(t),
                "division": t.get("division"),
                "classification": t["classification"],
                "colors": {"primary": t.get("color"), "alt": t.get("alternateColor")},
                "logos": t.get("logos") or [],
                "helmetUrl": extra.get("helmetUrl"),
                "twitter": t.get("twitter"),
                "venue": {
                    "name": loc.get("name"),
                    "city": loc.get("city"),
                    "state": loc.get("state"),
                    "capacity": loc.get("capacity"),
                    "grass": loc.get("grass"),
                    "dome": loc.get("dome"),
                },
            }
        )

    records.sort(key=lambda r: (r["classification"], r["school"]))

    unmatched = sorted(set(csv_meta) - matched_csv_names)
    if unmatched:
        print(f"⚠️  {len(unmatched)} CSV teams had no CFBD match: {unmatched}")

    out_path = DATA_DIR / "teams-db.json"
    out_path.write_text(json.dumps({"teams": records}, indent=1))
    by_class = {}
    for r in records:
        by_class[r["classification"]] = by_class.get(r["classification"], 0) + 1
    print(f"✅ Wrote {len(records)} teams → {out_path}  {by_class}")
    print(f"   CSV extras merged for {len(matched_csv_names)}/{len(csv_meta)} CSV teams")


if __name__ == "__main__":
    main()
