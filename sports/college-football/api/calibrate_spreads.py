#!/usr/bin/env python3
"""Spread head: calibrate W² rating gaps onto real-margin scale.

The W² index is built from margin-capped SRS — great for ranking teams, but it
systematically under-prices favorites when used raw as a spread (the almanac
shows −1.3 pts vs market on pick'ems stretching to −12.4 on 21+ lines). Rather
than weaken the cap (which would corrupt the strength ratings), we fit a small
linear transform on top:

    projected margin (home) = b · (W²_home − W²_away) + h · is_home

No intercept: equal teams on a neutral field must be a pick'em. b is the stretch
that undoes the margin-cap compression; h is the fitted home-field points.

Fit honestly: train on weeks 1–7 of 2025, evaluate out-of-sample on weeks 8+
(MAE vs actual, vs the raw W² spread, vs the closing market line; plus ATS).
Then refit on the full season and write the deployed coefficients to
data/spread-cal.json for the frontend + almanac.

Usage:  python3 calibrate_spreads.py
"""

import json
from datetime import date
from pathlib import Path

from backtest_composite import build_preseason_2025
from build_almanac import fetch_lines_map
from fetch_games import load_api_key

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
RAW_HFA = 2.5
TRAIN_MAX_WEEK = 7


def build_rows(api_key):
    pre = build_preseason_2025(api_key)
    ratings, games = pre["ratings"], pre["games25"]
    lines = fetch_lines_map(api_key, 2025)
    rows = []
    for g in games:
        if not g["completed"] or g["homePoints"] is None:
            continue
        if g["homeClass"] != "fbs" or g["awayClass"] != "fbs":
            continue
        h, a = g["homeTeam"], g["awayTeam"]
        if h not in ratings or a not in ratings:
            continue
        spread = lines.get((g["week"], h, a))
        rows.append({
            "week": g["week"],
            "diff": ratings[h] - ratings[a],
            "isHome": 0.0 if g["neutralSite"] else 1.0,
            "act": g["homePoints"] - g["awayPoints"],
            "mkt": -spread if spread is not None else None,  # + = home favored
        })
    return rows


def fit_ols(rows):
    """Least squares (no intercept) for act = b*diff + h*isHome (2x2 normal eqns)."""
    X = [[r["diff"], r["isHome"]] for r in rows]
    y = [r["act"] for r in rows]
    m = [[sum(X[k][i] * X[k][j] for k in range(len(X))) for j in range(2)] for i in range(2)]
    v = [sum(X[k][i] * y[k] for k in range(len(X))) for i in range(2)]
    # cramer's rule (2x2)
    det = m[0][0] * m[1][1] - m[0][1] * m[1][0]
    b = (v[0] * m[1][1] - v[1] * m[0][1]) / det
    h = (m[0][0] * v[1] - m[1][0] * v[0]) / det
    return {"b": b, "h": h}


def predict(cal, r):
    return cal["b"] * r["diff"] + cal["h"] * r["isHome"]


def raw_spread(r):
    return r["diff"] + RAW_HFA * r["isHome"]


def mae(pairs):
    return sum(abs(p - a) for p, a in pairs) / len(pairs)


def tier_bias(rows, pred_fn):
    """Avg favorite-perspective error (predicted − actual) by market-line size.
    Negative = we under-price the favorite (the margin-cap tell)."""
    tiers = [("pick'em 0–3", 0, 3), ("3–7", 3, 7), ("7–14", 7, 14),
             ("14–21", 14, 21), ("blowout 21+", 21, 999)]
    out = []
    for label, lo, hi in tiers:
        sub = [r for r in rows if r["mkt"] is not None and lo <= abs(r["mkt"]) < hi]
        if not sub:
            continue
        errs = []
        for r in sub:
            fav_home = r["mkt"] > 0
            pred_fav = pred_fn(r) if fav_home else -pred_fn(r)
            act_fav = r["act"] if fav_home else -r["act"]
            errs.append(pred_fav - act_fav)
        out.append((label, len(sub), round(sum(errs) / len(errs), 1)))
    return out


def ats(rows, pred_fn, min_edge=3.0):
    w = loss = 0
    for r in rows:
        if r["mkt"] is None:
            continue
        edge = pred_fn(r) - r["mkt"]
        if abs(edge) < min_edge:
            continue
        cover = r["act"] - r["mkt"]
        if abs(cover) < 1e-9:
            continue
        if (edge > 0) == (cover > 0):
            w += 1
        else:
            loss += 1
    dec = w + loss
    return {"w": w, "l": loss,
            "winPct": round(100 * w / dec, 1) if dec else None,
            "roi": round(100 * (0.9091 * w - loss) / dec, 1) if dec else None}


def main():
    api_key = load_api_key()
    rows = build_rows(api_key)
    train = [r for r in rows if r["week"] <= TRAIN_MAX_WEEK]
    test = [r for r in rows if r["week"] > TRAIN_MAX_WEEK]

    cal = fit_ols(train)
    print(f"Spread head fit on weeks 1–{TRAIN_MAX_WEEK} ({len(train)} games):")
    print(f"   margin = {cal['b']:.3f}·(W² gap) + {cal['h']:.2f}·home  (no intercept)")

    test_l = [r for r in test if r["mkt"] is not None]
    print(f"\nOut-of-sample (weeks {TRAIN_MAX_WEEK + 1}+, {len(test)} games, {len(test_l)} with lines):")
    print(f"   raw W² spread MAE:        {mae([(raw_spread(r), r['act']) for r in test]):.2f}")
    print(f"   calibrated spread MAE:    {mae([(predict(cal, r), r['act']) for r in test]):.2f}")
    print(f"   closing market MAE:       {mae([(r['mkt'], r['act']) for r in test_l]):.2f}")

    print("\n   Favorite bias by line size (predicted − actual, − = under-priced):")
    print(f"   {'tier':<14}{'n':>5}{'raw W²':>10}{'calibrated':>12}")
    braw = dict((t, (n, e)) for t, n, e in tier_bias(test, raw_spread))
    bcal = dict((t, (n, e)) for t, n, e in tier_bias(test, lambda r: predict(cal, r)))
    for t in braw:
        print(f"   {t:<14}{braw[t][0]:>5}{braw[t][1]:>+10}{bcal[t][1]:>+12}")

    a_raw = ats(test, raw_spread)
    a_cal = ats(test, lambda r: predict(cal, r))
    print(f"\n   ATS 3+ edges — raw:        {a_raw['w']}-{a_raw['l']}  {a_raw['winPct']}%  ROI {a_raw['roi']}%")
    print(f"   ATS 3+ edges — calibrated: {a_cal['w']}-{a_cal['l']}  {a_cal['winPct']}%  ROI {a_cal['roi']}%")

    # deploy: refit on the full season
    final = fit_ols(rows)
    out = {
        "generatedAt": date.today().isoformat(),
        "fitOn": "2025 full season (evaluation used weeks 1–7 train / 8+ test)",
        "model": "homeMargin = b*(w2Home - w2Away) + h*isHome  (h=0 on neutral, no intercept)",
        "b": round(final["b"], 3), "h": round(final["h"], 3),
        "eval": {
            "trainWeeks": f"1-{TRAIN_MAX_WEEK}", "testWeeks": f"{TRAIN_MAX_WEEK + 1}+",
            "rawMae": round(mae([(raw_spread(r), r["act"]) for r in test]), 2),
            "calMae": round(mae([(predict(cal, r), r["act"]) for r in test]), 2),
            "mktMae": round(mae([(r["mkt"], r["act"]) for r in test_l]), 2),
            "atsRaw": a_raw, "atsCal": a_cal,
        },
    }
    (DATA_DIR / "spread-cal.json").write_text(json.dumps(out, indent=1))
    print(f"\n✅ Deployed coefficients (refit on all {len(rows)} games) → data/spread-cal.json")
    print(f"   b={out['b']}  h={out['h']}")


if __name__ == "__main__":
    main()
