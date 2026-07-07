#!/usr/bin/env python3
"""Build the Viva CFP power index from 2025 results.

Pipeline:
  1. Fetch 2025 games (regular + postseason), cache to ../data/games-2025.json
  2. Team SRS ratings from 2025 results (margin-capped, iterative);
     non-FBS opponents are pooled into one "FCS" pseudo-team
  3. Cross-conference analysis: W-L matrix between FBS conferences (2025
     membership, from the game records themselves) + FBS-vs-FCS record
  4. Conference strength = average member SRS (both 2025 and, for the
     forward-looking index, 2026 membership from teams-db.json)
  5. Projected 2026 rating per team:
       base = 0.65 * SRS2025 + 0.35 * 2026 conference strength
       (teams new to FBS or without 2025 data regress fully to conference)
       Top-25 teams: blended 50/50 with a poll-implied score, since the
       futures market already prices in portal/QB changes
  6. 2026 strength of schedule = average projected opponent rating from
     games-2026.json

Writes ../data/power-index-2026.json. Needs CFBD_API_KEY (env or api/.env).
"""

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import requests

from fetch_games import load_api_key, pick

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"

MARGIN_CAP = 28
SRS_ITERATIONS = 200
CARRYOVER_W = 0.65          # weight on last year's team SRS
POLL_BLEND = 0.5            # weight on poll-implied score for Top-25 teams
POLL_TOP, POLL_FLOOR = 26.0, 12.0   # implied SRS for poll rank 1 and 25


def fetch_2025_games(api_key):
    cache = DATA_DIR / "games-2025.json"
    if cache.exists():
        return json.loads(cache.read_text())["games"]
    games = []
    for season_type in ("regular", "postseason"):
        r = requests.get(
            "https://api.collegefootballdata.com/games",
            headers={"Authorization": f"Bearer {api_key}"},
            params={"year": 2025, "seasonType": season_type, "division": "fbs"},
            timeout=30,
        )
        r.raise_for_status()
        for g in r.json():
            games.append(
                {
                    "seasonType": season_type,
                    "week": g.get("week"),
                    "homeTeam": pick(g, "homeTeam", "home_team"),
                    "homeConf": pick(g, "homeConference", "home_conference"),
                    "homeClass": pick(g, "homeClassification", "home_classification"),
                    "homePoints": pick(g, "homePoints", "home_points"),
                    "awayTeam": pick(g, "awayTeam", "away_team"),
                    "awayConf": pick(g, "awayConference", "away_conference"),
                    "awayClass": pick(g, "awayClassification", "away_classification"),
                    "awayPoints": pick(g, "awayPoints", "away_points"),
                    "completed": g.get("completed"),
                }
            )
    cache.write_text(json.dumps({"year": 2025, "games": games}, indent=1))
    print(f"✅ Fetched {len(games)} 2025 games → {cache}")
    return games


def load_top25():
    src = (DATA_DIR / "teams.js").read_text()
    return {
        m.group(2): int(m.group(1))
        for m in re.finditer(r"rank:\s*(\d+),\s*team:\s*\"([^\"]+)\"", src)
    }


def main():
    api_key = load_api_key()
    teams_db = json.loads((DATA_DIR / "teams-db.json").read_text())["teams"]
    fbs_2026 = {t["school"]: t for t in teams_db if t["classification"] == "fbs"}
    games_2025 = [g for g in fetch_2025_games(api_key)
                  if g["completed"] and g["homePoints"] is not None]
    games_2026 = json.loads((DATA_DIR / "games-2026.json").read_text())["games"]
    top25 = load_top25()

    # --- normalize: pool non-FBS opponents into a single "FCS" pseudo-team ---
    def norm(team, klass):
        return team if klass == "fbs" else "FCS"

    # --- 1. SRS ratings from 2025 results ---
    results = defaultdict(list)   # team -> [(margin, opponent)]
    for g in games_2025:
        home = norm(g["homeTeam"], g["homeClass"])
        away = norm(g["awayTeam"], g["awayClass"])
        margin = max(-MARGIN_CAP, min(MARGIN_CAP, g["homePoints"] - g["awayPoints"]))
        results[home].append((margin, away))
        results[away].append((-margin, home))

    ratings = {t: 0.0 for t in results}
    for _ in range(SRS_ITERATIONS):
        new = {}
        for team, games in results.items():
            new[team] = sum(m + ratings[o] for m, o in games) / len(games)
        mean = sum(new.values()) / len(new)
        ratings = {t: v - mean for t, v in new.items()}

    # --- 2. cross-conference matrix (2025 membership, FBS-vs-FBS + vs FCS) ---
    matrix = defaultdict(lambda: defaultdict(lambda: {"w": 0, "l": 0}))
    fbs_vs_fcs = {"w": 0, "l": 0}
    for g in games_2025:
        hw = g["homePoints"] > g["awayPoints"]
        if g["homeClass"] == "fbs" and g["awayClass"] == "fbs":
            hc, ac = g["homeConf"] or "Ind", g["awayConf"] or "Ind"
            if hc == ac:
                continue
            matrix[hc][ac]["w" if hw else "l"] += 1
            matrix[ac][hc]["l" if hw else "w"] += 1
        elif g["homeClass"] == "fbs":
            fbs_vs_fcs["w" if hw else "l"] += 1
        elif g["awayClass"] == "fbs":
            fbs_vs_fcs["l" if hw else "w"] += 1

    # --- 3. conference strength ---
    conf_2025_members = defaultdict(set)
    for g in games_2025:
        for side in ("home", "away"):
            if g[f"{side}Class"] == "fbs" and g[f"{side}Conf"]:
                conf_2025_members[g[f"{side}Conf"]].add(g[f"{side}Team"])

    conf_strength_2025 = {
        conf: sum(ratings.get(t, 0.0) for t in members) / len(members)
        for conf, members in conf_2025_members.items()
    }

    conf_2026_members = defaultdict(list)
    for t in fbs_2026.values():
        conf_2026_members[t["conference"]].append(t["school"])
    conf_strength_2026 = {
        conf: sum(ratings.get(t, conf_strength_2025.get(conf, -10.0)) for t in members) / len(members)
        for conf, members in conf_2026_members.items()
    }

    # --- 4. projected 2026 rating ---
    poll_step = (POLL_TOP - POLL_FLOOR) / 24
    projected = {}
    for school, t in fbs_2026.items():
        conf_avg = conf_strength_2026.get(t["conference"], -10.0)
        srs = ratings.get(school)
        base = conf_avg if srs is None else CARRYOVER_W * srs + (1 - CARRYOVER_W) * conf_avg
        if school in top25:
            implied = POLL_TOP - (top25[school] - 1) * poll_step
            base = (1 - POLL_BLEND) * base + POLL_BLEND * implied
        projected[school] = base

    # --- 5. 2026 SoS from projected ratings ---
    opponents_2026 = defaultdict(list)
    for g in games_2026:
        h, a = g["homeTeam"], g["awayTeam"]
        if h in projected and a in projected:
            opponents_2026[h].append(projected[a])
            opponents_2026[a].append(projected[h])
        elif h in projected:
            opponents_2026[h].append(ratings.get("FCS", -25.0))
        elif a in projected:
            opponents_2026[a].append(ratings.get("FCS", -25.0))

    # --- 6. 2025 conference finish (win% inside conference games) ---
    conf_wins = defaultdict(lambda: [0, 0])
    for g in games_2025:
        if (g["homeClass"] == g["awayClass"] == "fbs"
                and g["homeConf"] and g["homeConf"] == g["awayConf"]
                and g["seasonType"] == "regular"):
            hw = g["homePoints"] > g["awayPoints"]
            conf_wins[g["homeTeam"]][0 if hw else 1] += 1
            conf_wins[g["awayTeam"]][1 if hw else 0] += 1

    rows = []
    for school, rating in projected.items():
        t = fbs_2026[school]
        opps = opponents_2026.get(school, [])
        w, l = conf_wins.get(school, (0, 0))
        rows.append(
            {
                "school": school,
                "conference": t["conference"],
                "confTier": t["confTier"],
                "logo": (t["logos"] or [None])[0],
                "color": t["colors"]["primary"],
                "rating": round(rating, 2),
                "srs2025": round(ratings[school], 2) if school in ratings else None,
                "confStrength2026": round(conf_strength_2026.get(t["conference"], 0), 2),
                "confRecord2025": f"{w}-{l}" if (w or l) else None,
                "pollRank": top25.get(school),
                "sos2026": round(sum(opps) / len(opps), 2) if opps else None,
            }
        )
    rows.sort(key=lambda r: -r["rating"])
    for i, r in enumerate(rows, 1):
        r["rank"] = i

    conf_table = sorted(
        (
            {
                "conference": conf,
                "srsAvg2025": round(conf_strength_2025.get(conf, -10.0), 2),
                "srsAvg2026": round(strength, 2),
                "teams": len(conf_2026_members[conf]),
                "crossRecord2025": {
                    "w": sum(v["w"] for v in matrix[conf].values()),
                    "l": sum(v["l"] for v in matrix[conf].values()),
                },
            }
            for conf, strength in conf_strength_2026.items()
        ),
        key=lambda c: -c["srsAvg2026"],
    )

    out = {
        "note": "SRS from 2025 results (margin capped, FCS pooled); projections regress to 2026 conference strength; Top-25 teams blended with poll-implied score",
        "fbsVsFcs2025": fbs_vs_fcs,
        "confMatrix2025": {c: dict(v) for c, v in matrix.items()},
        "confStrength": conf_table,
        "fcsPoolRating": round(ratings.get("FCS", 0), 2),
        "teams": rows,
    }
    out_path = DATA_DIR / "power-index-2026.json"
    out_path.write_text(json.dumps(out, indent=1))
    print(f"✅ Power index built → {out_path}")
    print(f"   FBS vs FCS in 2025: {fbs_vs_fcs['w']}-{fbs_vs_fcs['l']}")
    print("   Conference strength (2026 membership):")
    for c in conf_table:
        if c["conference"] != "FBS Independents":
            print(f"     {c['conference']:<18} {c['srsAvg2026']:>6}  (cross-conf {c['crossRecord2025']['w']}-{c['crossRecord2025']['l']})")
    print("   Top 10 projected:")
    for r in rows[:10]:
        print(f"     {r['rank']:>2}. {r['school']:<15} {r['rating']:>6}  (srs25 {r['srs2025']}, poll {r['pollRank']})")


if __name__ == "__main__":
    main()
