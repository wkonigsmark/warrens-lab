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
POLL_BLEND = 0.5            # v0 only: weight on poll-implied score for Top-25 teams
POLL_TOP, POLL_FLOOR = 26.0, 12.0   # implied SRS for poll rank 1 and 25

# --- v1 offseason composite (the Data Lab blueprint, "boring starting weights") ---
INDEX_VERSION = "v1"
COMPOSITE_WEIGHTS = {
    "sp-plus": 0.35,
    "returning-production": 0.20,
    "recruiting-247": 0.20,
    "transfer-portal": 0.15,
    "draft-capital": 0.10,
}
Z_TO_POINTS = 9.0           # 1 σ of FBS strength ≈ 9 points of SRS
OFFSEASON_BLEND = 0.5       # v1 = 50% results-based base + 50% offseason composite


def fetch_season_results(api_key, year):
    """Completed-season results (regular + postseason), cached per year."""
    cache = DATA_DIR / f"games-{year}.json"
    if cache.exists():
        return json.loads(cache.read_text())["games"]
    games = []
    for season_type in ("regular", "postseason"):
        r = requests.get(
            "https://api.collegefootballdata.com/games",
            headers={"Authorization": f"Bearer {api_key}"},
            params={"year": year, "seasonType": season_type, "division": "fbs"},
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
                    "awayPoints": pick(g, "awayPoints", "away_points"),
                    "awayClass": pick(g, "awayClassification", "away_classification"),
                    "completed": g.get("completed"),
                }
            )
    cache.write_text(json.dumps({"year": year, "games": games}, indent=1))
    print(f"✅ Fetched {len(games)} {year} games → {cache}")
    return games


def srs_from_games(games):
    """Margin-capped iterative SRS; non-FBS opponents pooled as one 'FCS' team."""
    playable = [g for g in games if g["completed"] and g["homePoints"] is not None]
    results = defaultdict(list)
    for g in playable:
        home = g["homeTeam"] if g["homeClass"] == "fbs" else "FCS"
        away = g["awayTeam"] if g["awayClass"] == "fbs" else "FCS"
        margin = max(-MARGIN_CAP, min(MARGIN_CAP, g["homePoints"] - g["awayPoints"]))
        results[home].append((margin, away))
        results[away].append((-margin, home))

    ratings = {t: 0.0 for t in results}
    for _ in range(SRS_ITERATIONS):
        new = {}
        for team, tgames in results.items():
            new[team] = sum(m + ratings[o] for m, o in tgames) / len(tgames)
        mean = sum(new.values()) / len(new)
        ratings = {t: v - mean for t, v in new.items()}
    return ratings


def load_top25():
    src = (DATA_DIR / "teams.js").read_text()
    return {
        m.group(2): int(m.group(1))
        for m in re.finditer(r"rank:\s*(\d+),\s*team:\s*\"([^\"]+)\"", src)
    }


def load_composite_sources():
    """Per-source z-scores from data/normalized/ (built by normalize_sources.py)."""
    sources = {}
    for key in COMPOSITE_WEIGHTS:
        path = DATA_DIR / "normalized" / f"{key}.json"
        if path.exists():
            d = json.loads(path.read_text())
            sources[key] = {t["team"]: t["zscore"] for t in d["teams"]}
        else:
            print(f"⚠️  normalized/{key}.json missing — composite runs without it")
    return sources


def composite_z(school, sources):
    """Weighted z across available sources, weights renormalized when one is absent."""
    parts = [(w, sources[k][school]) for k, w in COMPOSITE_WEIGHTS.items()
             if k in sources and school in sources[k]]
    if not parts:
        return None
    return sum(w * z for w, z in parts) / sum(w for w, _ in parts)


def main():
    api_key = load_api_key()
    teams_db = json.loads((DATA_DIR / "teams-db.json").read_text())["teams"]
    fbs_2026 = {t["school"]: t for t in teams_db if t["classification"] == "fbs"}
    games_2025 = [g for g in fetch_season_results(api_key, 2025)
                  if g["completed"] and g["homePoints"] is not None]
    games_2026 = json.loads((DATA_DIR / "games-2026.json").read_text())["games"]
    top25 = load_top25()

    # --- 1. SRS ratings from 2025 results ---
    ratings = srs_from_games(games_2025)

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
    # v0 (kept for comparison): results base + ESPN poll blend for the Top 25
    # v1 (the index):           results base + offseason composite; poll is display-only
    composite_sources = load_composite_sources()
    # weighted-average z has stdev < 1 (sources don't perfectly correlate), which
    # would compress the point-spread scale — re-standardize across FBS so 1σ = 1σ
    raw_cz = {s: composite_z(s, composite_sources) for s in fbs_2026}
    cz_vals = [v for v in raw_cz.values() if v is not None]
    cz_mean = sum(cz_vals) / len(cz_vals)
    cz_std = (sum((v - cz_mean) ** 2 for v in cz_vals) / (len(cz_vals) - 1)) ** 0.5

    poll_step = (POLL_TOP - POLL_FLOOR) / 24
    projected = {}      # school -> v1 rating (drives SoS, ranks, downstream UI)
    detail = {}         # school -> {v0, compositeZ, compositePts}
    for school, t in fbs_2026.items():
        conf_avg = conf_strength_2026.get(t["conference"], -10.0)
        srs = ratings.get(school)
        base = conf_avg if srs is None else CARRYOVER_W * srs + (1 - CARRYOVER_W) * conf_avg
        v0 = base
        if school in top25:
            implied = POLL_TOP - (top25[school] - 1) * poll_step
            v0 = (1 - POLL_BLEND) * base + POLL_BLEND * implied
        cz = raw_cz[school]
        if cz is None:
            v1, cpts = base, None
        else:
            cz = (cz - cz_mean) / cz_std
            cpts = Z_TO_POINTS * cz
            v1 = (1 - OFFSEASON_BLEND) * base + OFFSEASON_BLEND * cpts
        projected[school] = v1
        detail[school] = {"v0": v0, "compositeZ": cz, "compositePts": cpts}

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
        d = detail[school]
        rows.append(
            {
                "school": school,
                "conference": t["conference"],
                "confTier": t["confTier"],
                "logo": (t["logos"] or [None])[0],
                "color": t["colors"]["primary"],
                "rating": round(rating, 2),
                "ratingV0": round(d["v0"], 2),
                "compositePts": round(d["compositePts"], 2) if d["compositePts"] is not None else None,
                "compositeZ": round(d["compositeZ"], 2) if d["compositeZ"] is not None else None,
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
        "indexVersion": INDEX_VERSION,
        "compositeWeights": COMPOSITE_WEIGHTS,
        "offseasonBlend": OFFSEASON_BLEND,
        "zToPoints": Z_TO_POINTS,
        "note": (
            "v1: rating = 50% results base (2025 SRS regressed 35% to 2026 conference strength) "
            "+ 50% offseason composite (weighted z of SP+ 35 / returning production 20 / recruiting 20 / "
            "portal net 15 / draft capital 10, × 9 pts per σ). ESPN poll is display-only in v1; "
            "ratingV0 (results + poll blend) kept for comparison."
        ),
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
    v0_order = sorted(rows, key=lambda r: -r["ratingV0"])
    v0_rank = {r["school"]: i for i, r in enumerate(v0_order, 1)}
    print(f"   Top 12 projected ({INDEX_VERSION}, Δ vs v0 rank):")
    for r in rows[:12]:
        shift = v0_rank[r["school"]] - r["rank"]
        arrow = f"{'▲' if shift > 0 else '▼'}{abs(shift)}" if shift else "·"
        print(f"     {r['rank']:>2}. {r['school']:<15} {r['rating']:>6}  "
              f"(comp {r['compositePts']}, v0 {r['ratingV0']}, {arrow})")


if __name__ == "__main__":
    main()
