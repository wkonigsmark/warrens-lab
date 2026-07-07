#!/usr/bin/env python3
"""Blueprint Step 5: backtest the v1 recipe against the 2025 season.

Rebuild the index exactly as it would have looked in July 2025 — using only
preseason-knowable inputs — then score it against what actually happened
(2025 final SRS).

Preseason-2025 inputs (mirrors the current 2026 stand-in configuration):
  results base       : 2024 SRS regressed 35% to conference strength
  SP+                : 2024 FINAL ratings (prior-year final, same lag as prod)
  returning production: 2025 preseason figure (genuinely preseason)
  recruiting         : 2025 class (signed Feb 2025)
  portal net         : 2025 cycle
  draft capital      : 2020–2024 drafts

Scores Pearson r, Spearman rho, and MAE for: base alone, composite alone, and
the full blend sweep (0% → 100% composite) so the 50/50 choice is tested, not
assumed. Writes data/backtest-2025.json.

NOTE: this validates *team-strength* prediction. Playoff-field selection is a
different problem — see Duke 2025 (won the ACC, missed the field) in the
callouts section.
"""

import json
from collections import defaultdict
from datetime import date
from pathlib import Path

import requests

from build_power_index import (CARRYOVER_W, COMPOSITE_WEIGHTS, Z_TO_POINTS,
                               fetch_season_results, srs_from_games)
from fetch_games import load_api_key
from normalize_sources import build_resolver

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
RAW = DATA_DIR / "raw"
CACHE = DATA_DIR / "backtest-cache"

STAR_RATING = {5: 0.98, 4: 0.90, 3: 0.84, 2: 0.78, 1: 0.72}


def cfbd(api_key, path, **params):
    r = requests.get("https://api.collegefootballdata.com" + path,
                     headers={"Authorization": f"Bearer {api_key}"},
                     params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def cached(api_key, name, path, **params):
    CACHE.mkdir(exist_ok=True)
    f = CACHE / f"{name}.json"
    if f.exists():
        return json.loads(f.read_text())
    data = cfbd(api_key, path, **params)
    f.write_text(json.dumps(data))
    print(f"   fetched {name}: {len(data)} rows")
    return data


# --- preseason-2025 source values, keyed by raw source name ---

def source_values_2025(api_key):
    values = {}

    # recruiting: 2025 class (already pulled as the prod fallback)
    rec = json.loads((RAW / "recruiting-247" / "2025.json").read_text())
    values["recruiting-247"] = {r["team"]: r["value"] for r in rec["data"]}

    # returning production: 2025 preseason (already pulled)
    ret = json.loads((RAW / "sp-plus" / "returning-2025.json").read_text())
    values["returning-production"] = {r["team"]: r["value"] for r in ret["data"]
                                      if r["value"] is not None}

    # SP+: 2024 FINAL (prior-year final — same lag as the current 2026 setup)
    sp = cached(api_key, "sp-2024", "/ratings/sp", year=2024)
    values["sp-plus"] = {r["team"]: r["rating"] for r in sp
                         if r.get("team") != "nationalAverages"}

    # portal: 2025 cycle, same aggregation as the importer
    moves = cached(api_key, "portal-2025", "/player/portal", year=2025)
    net = defaultdict(float)
    for m in moves:
        val = m.get("rating") or STAR_RATING.get(m.get("stars"), 0.75)
        if m.get("destination"):
            net[m["destination"]] += val
        if m.get("origin"):
            net[m["origin"]] -= val
    values["transfer-portal"] = dict(net)

    # draft capital: 2020–2024
    cap = defaultdict(int)
    for year in range(2020, 2025):
        for p in cached(api_key, f"draft-{year}", "/draft/picks", year=year):
            if p.get("collegeTeam"):
                cap[p["collegeTeam"]] += max(0, 257 - p["overall"])
    values["draft-capital"] = dict(cap)

    return values


def zscores(vals):
    n = len(vals)
    mean = sum(vals.values()) / n
    std = (sum((v - mean) ** 2 for v in vals.values()) / (n - 1)) ** 0.5 or 1.0
    return {t: (v - mean) / std for t, v in vals.items()}


def pearson(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    vx = sum((x - mx) ** 2 for x in xs) ** 0.5
    vy = sum((y - my) ** 2 for y in ys) ** 0.5
    return cov / (vx * vy)


def spearman(xs, ys):
    def ranks(v):
        order = sorted(range(len(v)), key=lambda i: -v[i])
        r = [0] * len(v)
        for rank, i in enumerate(order, 1):
            r[i] = rank
        return r
    return pearson(ranks(xs), ranks(ys))


def main():
    api_key = load_api_key()
    resolve, fbs = build_resolver()

    print("Backtest: July-2025 index vs actual 2025 results")
    games24 = fetch_season_results(api_key, 2024)
    games25 = fetch_season_results(api_key, 2025)
    srs24 = srs_from_games(games24)
    srs25 = srs_from_games(games25)   # the answer key

    # 2025 FBS teams + conference membership (known preseason)
    members = defaultdict(set)
    fbs25 = set()
    for g in games25:
        for side in ("home", "away"):
            if g[f"{side}Class"] == "fbs":
                fbs25.add(g[f"{side}Team"])
                if g[f"{side}Conf"]:
                    members[g[f"{side}Conf"]].add(g[f"{side}Team"])
    conf_strength = {c: sum(srs24.get(t, -8.0) for t in ts) / len(ts)
                     for c, ts in members.items()}
    team_conf = {t: c for c, ts in members.items() for t in ts}

    # results base as of July 2025
    base = {}
    for t in fbs25:
        conf_avg = conf_strength.get(team_conf.get(t), -8.0)
        base[t] = (CARRYOVER_W * srs24[t] + (1 - CARRYOVER_W) * conf_avg
                   if t in srs24 else conf_avg)

    # offseason composite as of July 2025 (same weights, same standardization)
    raw_values = source_values_2025(api_key)
    z_by_source = {}
    for key, vals in raw_values.items():
        mapped = {}
        for team, v in vals.items():
            school = resolve(team)
            if school:
                mapped[school] = v
        keep = {t: v for t, v in mapped.items() if t in fbs25 or t in fbs}
        if key == "draft-capital":   # Phase-2 policy: zero-fill FBS
            for t in fbs25:
                keep.setdefault(t, 0)
        z_by_source[key] = zscores(keep)

    def composite_z(team):
        parts = [(w, z_by_source[k][team]) for k, w in COMPOSITE_WEIGHTS.items()
                 if team in z_by_source[k]]
        if not parts:
            return None
        return sum(w * z for w, z in parts) / sum(w for w, _ in parts)

    raw_cz = {t: composite_z(t) for t in fbs25}
    have = {t: v for t, v in raw_cz.items() if v is not None}
    std_cz = zscores(have)
    comp_pts = {t: Z_TO_POINTS * z for t, z in std_cz.items()}

    # evaluation set: teams with a real 2025 result
    eval_teams = sorted(t for t in fbs25 if t in srs25 and t in base)
    actual = [srs25[t] for t in eval_teams]

    def score(pred):
        xs = [pred[t] for t in eval_teams]
        mae = sum(abs(x - y) for x, y in zip(xs, actual)) / len(xs)
        return {"pearson": round(pearson(xs, actual), 3),
                "spearman": round(spearman(xs, actual), 3),
                "mae": round(mae, 2)}

    sweep = {}
    for w10 in range(0, 11):
        w = w10 / 10
        pred = {t: (1 - w) * base[t] + w * comp_pts.get(t, base[t])
                for t in eval_teams}
        sweep[f"{w:.1f}"] = score(pred)

    base_score = sweep["0.0"]
    comp_only = score({t: comp_pts.get(t, base[t]) for t in eval_teams})
    v1_score = sweep["0.5"]
    best_w = max(sweep, key=lambda k: sweep[k]["pearson"])

    # v1 predictions for callouts / misses
    pred_v1 = {t: 0.5 * base[t] + 0.5 * comp_pts.get(t, base[t]) for t in eval_teams}
    pred_rank = {t: i for i, t in enumerate(
        sorted(eval_teams, key=lambda t: -pred_v1[t]), 1)}
    actual_rank = {t: i for i, t in enumerate(
        sorted(eval_teams, key=lambda t: -srs25[t]), 1)}

    callouts = {}
    for t in ("Duke", "Miami", "Notre Dame", "Indiana", "Vanderbilt"):
        if t in pred_rank:
            callouts[t] = {"predictedRank": pred_rank[t], "actualSrsRank": actual_rank[t],
                           "predicted": round(pred_v1[t], 1), "actualSrs": round(srs25[t], 1)}

    misses = sorted(eval_teams, key=lambda t: -abs(pred_v1[t] - srs25[t]))[:6]
    biggest = [{"team": t, "predicted": round(pred_v1[t], 1),
                "actual": round(srs25[t], 1),
                "missBy": round(pred_v1[t] - srs25[t], 1)} for t in misses]

    out = {
        "ranAt": date.today().isoformat(),
        "design": "July-2025-knowable inputs only; SP+ = 2024 final (same lag as prod); scored vs actual 2025 SRS",
        "teamsScored": len(eval_teams),
        "baseOnly": base_score,
        "compositeOnly": comp_only,
        "v1Blend50_50": v1_score,
        "blendSweep": sweep,
        "bestBlendByPearson": best_w,
        "callouts": callouts,
        "biggestMisses": biggest,
    }
    (DATA_DIR / "backtest-2025.json").write_text(json.dumps(out, indent=1))

    print(f"\n   Scored {len(eval_teams)} teams vs actual 2025 SRS:")
    print(f"   {'model':<22}{'pearson':>8}{'spearman':>9}{'MAE':>7}")
    print(f"   {'results base only':<22}{base_score['pearson']:>8}{base_score['spearman']:>9}{base_score['mae']:>7}")
    print(f"   {'composite only':<22}{comp_only['pearson']:>8}{comp_only['spearman']:>9}{comp_only['mae']:>7}")
    print(f"   {'v1 blend (50/50)':<22}{v1_score['pearson']:>8}{v1_score['spearman']:>9}{v1_score['mae']:>7}")
    print(f"   best blend by pearson: {best_w} composite "
          f"(r={sweep[best_w]['pearson']}, MAE={sweep[best_w]['mae']})")
    print("\n   Callouts (v1 predicted rank → actual SRS rank):")
    for t, c in callouts.items():
        print(f"     {t:<12} #{c['predictedRank']} → #{c['actualSrsRank']}  ({c['predicted']} pred, {c['actualSrs']} actual)")
    print("\n   Biggest misses:")
    for m in biggest:
        direction = "overrated" if m["missBy"] > 0 else "underrated"
        print(f"     {m['team']:<18} pred {m['predicted']:>6}, actual {m['actual']:>6}  ({direction} by {abs(m['missBy'])})")
    print(f"\n✅ Written → {DATA_DIR / 'backtest-2025.json'}")


if __name__ == "__main__":
    main()
