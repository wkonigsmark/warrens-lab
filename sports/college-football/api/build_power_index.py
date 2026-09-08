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

# --- in-season update (the lever the 2025 replay validated) ---
# rating = (1-w)·preseason prior + w·SRS(2026 results so far),  w = weeks/(weeks+PRIOR_STRENGTH)
# The prior is the FROZEN preseason index (power-index-2026-preseason.json) so it never drifts.
PRIOR_STRENGTH = 4.0        # preseason prior worth ~4 weeks of results
MIN_INSEASON_GAMES = 15     # below this the SRS is noise — stay on the prior

# --- FBS vs FCS games carry asymmetric information (see fcs_game_weight) ---
FCS_FLOOR_W = 0.15          # an expected blowout barely counts
FCS_FULL_AT = 21.0          # points short of expectation at which it counts fully
FCS_LOSS_W = 1.5            # losing to an FCS team counts MORE than a normal game


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
                    "neutralSite": pick(g, "neutralSite", "neutral_site"),
                    "completed": g.get("completed"),
                }
            )
    cache.write_text(json.dumps({"year": year, "games": games}, indent=1))
    print(f"✅ Fetched {len(games)} {year} games → {cache}")
    return games


def srs_from_games(games, cap=MARGIN_CAP, damping=0.5):
    """Margin-capped iterative SRS; non-FBS opponents pooled as one 'FCS' team.
    `cap` is exposed so a looser cap can be used for spread-setting while the
    default (28) still governs strength/ranking.

    `damping` matters early in a season. A raw sweep (damping=1.0) OSCILLATES on a
    sparse schedule graph — when most teams have played one game the system is
    underdetermined, ratings flip between ±margin and 0 on alternating passes, and
    after an even number of iterations entire components collapse to one identical
    value (wk1 2026: LSU, Clemson, Michigan and Oregon all landed on the same number).
    Averaging each sweep with the previous estimate converges to the minimum-norm
    solution instead — a 1-game pair splits to ±half its margin. On a dense
    full-season graph the damped and undamped fixed points are the same."""
    playable = [g for g in games if g["completed"] and g["homePoints"] is not None]
    results = defaultdict(list)
    for g in playable:
        home = g["homeTeam"] if g["homeClass"] == "fbs" else "FCS"
        away = g["awayTeam"] if g["awayClass"] == "fbs" else "FCS"
        margin = max(-cap, min(cap, g["homePoints"] - g["awayPoints"]))
        results[home].append((margin, away))
        results[away].append((-margin, home))

    ratings = {t: 0.0 for t in results}
    for _ in range(SRS_ITERATIONS):
        new = {}
        for team, tgames in results.items():
            new[team] = sum(m + ratings[o] for m, o in tgames) / len(tgames)
        mean = sum(new.values()) / len(new)
        ratings = {t: (1 - damping) * ratings[t] + damping * (new[t] - mean) for t in new}
    return ratings


def fcs_game_weight(fbs_prior, fcs_prior, fbs_margin):
    """How much should an FBS team's game against an FCS opponent count?

    The information in these games is ASYMMETRIC. Winning by 40 when you were
    expected to win by 42 tells you essentially nothing — the blowout is the assumed
    outcome, and the scoreboard stops carrying signal once the starters sit. Worse,
    scoring it at full weight actively PUNISHES good teams, because the best possible
    credit (margin cap + the pooled FCS rating ≈ +5) sits below every elite team's
    rating: Georgia beat Tennessee State 63-3 and fell from #2 to #9.

    But a CLOSE win — or a loss — is one of the loudest signals in the sport, and must
    hurt. So the weight ramps: near-zero when the team meets or beats expectation,
    rising to full as it falls short, and above full if it actually loses. The credit
    itself already handles the direction (a 10-point win over the pool scores −13, a
    loss scores −26); this decides how loudly that credit is heard."""
    if fbs_margin < 0:
        return FCS_LOSS_W
    expected = fbs_prior - fcs_prior            # margin the prior implies, in SRS frame
    shortfall = expected - fbs_margin
    if shortfall <= 0:
        return FCS_FLOOR_W
    return min(1.0, FCS_FLOOR_W + (1.0 - FCS_FLOOR_W) * shortfall / FCS_FULL_AT)


def anchored_ratings(games, prior, fcs_prior, prior_strength, cap=MARGIN_CAP,
                     iterations=SRS_ITERATIONS, damping=0.5):
    """Ridge ('Bayesian') SRS anchored on the frozen preseason prior.

    Plain SRS is effectively unbounded on a sparse early-season graph: with one or two
    games per team the system is barely constrained, and feedback between under-played
    teams inflates it. Week 1 of 2026 handed USC +41 on two G5 wins — a FULL season of
    SRS spans roughly ±25 — because San José State had itself ballooned to +25, so USC
    got credit for beating a phantom. Blending a global 21% of that made USC #1.

    Anchoring shrinks every team toward its own preseason rating in proportion to how
    little it has played:

        rating[t] = ( Σ(capped margin + rating[opponent]) + k·prior[t] ) / (n_games + k)

    That gives per-team confidence instead of one global weight — a 1-game team sits
    ~20% on results, 2 games ~33%, a full 12-game season ~75% — and because the
    opponent terms are shrunk too, an extreme value can no longer propagate through
    the network. No mean-centering: the prior already fixes the scale."""
    playable = [g for g in games if g["completed"] and g["homePoints"] is not None]
    results = defaultdict(list)
    for g in playable:
        home_fbs = g.get("homeClass") == "fbs"
        away_fbs = g.get("awayClass") == "fbs"
        home = g["homeTeam"] if home_fbs else "FCS"
        away = g["awayTeam"] if away_fbs else "FCS"
        raw = g["homePoints"] - g["awayPoints"]
        margin = max(-cap, min(cap, raw))
        weight = 1.0
        if home_fbs != away_fbs:                    # exactly one side is FBS
            team, tm = (home, raw) if home_fbs else (away, -raw)
            weight = fcs_game_weight(prior.get(team, fcs_prior), fcs_prior, tm)
        # one observation, one weight — applied to both sides of the game
        results[home].append((margin, away, weight))
        results[away].append((-margin, home, weight))

    def anchor(t):
        return fcs_prior if t == "FCS" else prior.get(t, fcs_prior)

    ratings = {t: anchor(t) for t in results}
    for _ in range(iterations):
        new = {}
        for team, tg in results.items():
            total = sum(w * (m + ratings[o]) for m, o, w in tg)
            wsum = sum(w for _, _, w in tg)
            new[team] = (total + prior_strength * anchor(team)) / (wsum + prior_strength)
        ratings = {t: (1 - damping) * ratings[t] + damping * new[t] for t in new}
    counts = {t: (len(v), sum(w for _, _, w in v)) for t, v in results.items()}
    return ratings, counts


def load_polls():
    """Live AP / Coaches ranks from polls-<year>.json (fetch_polls.py).
    Comparison only — the human polls are never an input to the W² rating."""
    path = DATA_DIR / "polls-2026.json"
    if not path.exists():
        print("⚠️  data/polls-2026.json missing — run fetch_polls.py (poll columns will be blank)")
        return {}, {}, None
    d = json.loads(path.read_text())
    grab = lambda name: {x["school"]: x["rank"]
                         for x in d.get("latest", {}).get(name, {}).get("ranks", [])}
    return grab("AP Top 25"), grab("Coaches Poll"), d.get("latestWeek")


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
    ap_rank, coaches_rank, poll_week = load_polls()

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

    # --- 4b. in-season update: blend 2026 results into the frozen preseason prior ---
    anchor_path = DATA_DIR / "power-index-2026-preseason.json"
    prior = dict(projected)
    if anchor_path.exists():
        for t in json.loads(anchor_path.read_text())["teams"]:
            if t["school"] in prior:
                prior[t["school"]] = t["rating"]
    fbs_involved = [g for g in games_2026 if "fbs" in (g.get("homeClass"), g.get("awayClass"))]
    done_2026 = [g for g in fbs_involved if g.get("completed") and g.get("homePoints") is not None]
    # "Weeks played" = average completed games per FBS team. This is what the 2025
    # backtest's prior-strength was calibrated against (weeks elapsed ≈ games each
    # team has played). Do NOT use games-completed/games-total: game counts per week
    # are lopsided (wk1 ran 99 vs a ~59 average) and that over-credits early weeks.
    fcs_prior = ratings.get("FCS", -25.0)
    use_results = len(done_2026) >= MIN_INSEASON_GAMES
    blended, gp = (anchored_ratings(done_2026, prior, fcs_prior, PRIOR_STRENGTH)
                   if use_results else ({}, {}))
    inseason = {}
    for school in projected:
        p = prior[school]
        n, wsum = gp.get(school, (0, 0.0))
        projected[school] = blended.get(school, p)
        inseason[school] = {"prior": p, "games": n, "evidence": round(wsum, 2),
                            "weight": round(wsum / (wsum + PRIOR_STRENGTH), 3) if wsum else 0.0}
    played = sum(gp.get(s, (0, 0.0))[0] for s in projected)
    weeks_played = played / len(fbs_2026) if fbs_2026 else 0.0
    iw = weeks_played / (weeks_played + PRIOR_STRENGTH) if use_results else 0.0

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

    # --- 6b. actual 2026 record so far ---
    rec_2026 = defaultdict(lambda: [0, 0])
    for g in done_2026:
        hw = g["homePoints"] > g["awayPoints"]
        if g.get("homeClass") == "fbs":
            rec_2026[g["homeTeam"]][0 if hw else 1] += 1
        if g.get("awayClass") == "fbs":
            rec_2026[g["awayTeam"]][1 if hw else 0] += 1

    rows = []
    for school, rating in projected.items():
        t = fbs_2026[school]
        opps = opponents_2026.get(school, [])
        w, l = conf_wins.get(school, (0, 0))
        rw, rl = rec_2026.get(school, (0, 0))
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
                "preseasonRating": round(inseason[school]["prior"], 2),
                "gamesPlayed": inseason[school]["games"],
                "resultsEvidence": inseason[school]["evidence"],
                "resultsWeight": inseason[school]["weight"],
                "confStrength2026": round(conf_strength_2026.get(t["conference"], 0), 2),
                "confRecord2025": f"{w}-{l}" if (w or l) else None,
                "record": f"{rw}-{rl}" if (rw or rl) else None,
                "pollRank": top25.get(school),
                "apRank": ap_rank.get(school),
                "coachesRank": coaches_rank.get(school),
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
        "pollWeek": poll_week,
        "inseason": {
            "gamesUsed": len(done_2026),
            "weeksPlayed": round(weeks_played, 2),
            "blendWeight": round(iw, 3),
            "priorStrengthWeeks": PRIOR_STRENGTH,
            "priorFrozen": anchor_path.exists(),
            "method": ("anchored ridge SRS — each team shrinks to its frozen preseason "
                       "rating by games played: w = n/(n+k), k=%g" % PRIOR_STRENGTH),
        },
        "teams": rows,
    }
    out_path = DATA_DIR / "power-index-2026.json"
    out_path.write_text(json.dumps(out, indent=1))
    print(f"✅ Power index built → {out_path}")
    if iw > 0:
        print(f"   In-season: {len(done_2026)} results onboarded ≈ {weeks_played:.2f} games/team → "
              f"anchored ridge SRS, ~{iw:.1%} avg weight on 2026 results "
              f"(per-team: n/(n+{PRIOR_STRENGTH:g}))")
    else:
        print(f"   Preseason mode: {len(done_2026)} results (< {MIN_INSEASON_GAMES}) — rating = frozen prior")
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
