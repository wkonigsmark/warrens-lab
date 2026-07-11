#!/usr/bin/env python3
"""Experiment: does a looser SRS margin cap sharpen spread-setting?

Warren's hypothesis: the 28-pt cap is great for strength but compresses the
rating gap on mismatches, so spreads under-price big favorites. This rebuilds
the preseason-2025 ratings at several caps, fits the spread head (weeks 1–7)
for each, and reports out-of-sample (weeks 8+) MAE and — the real target — the
residual favorite bias on blowout lines. Read-only; deploys nothing.
"""

from backtest_composite import build_preseason_2025
from build_almanac import fetch_lines_map
from calibrate_spreads import (TRAIN_MAX_WEEK, ats, fit_ols, mae, predict,
                               raw_spread, tier_bias)
from fetch_games import load_api_key


def rows_for_cap(api_key, lines, cap):
    pre = build_preseason_2025(api_key, srs_cap=cap)
    ratings, games = pre["ratings"], pre["games25"]
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
            "week": g["week"], "diff": ratings[h] - ratings[a],
            "isHome": 0.0 if g["neutralSite"] else 1.0,
            "act": g["homePoints"] - g["awayPoints"],
            "mkt": -spread if spread is not None else None,
        })
    return rows


def main():
    api_key = load_api_key()
    lines = fetch_lines_map(api_key, 2025)
    print(f"{'cap':>5} {'b':>6} {'h':>6} {'calMAE':>8} {'blowoutBias':>12} {'ATS3+':>10} {'ROI':>7}")
    for cap in (28, 40, 55, 80, 200):
        rows = rows_for_cap(api_key, lines, cap)
        train = [r for r in rows if r["week"] <= TRAIN_MAX_WEEK]
        test = [r for r in rows if r["week"] > TRAIN_MAX_WEEK]
        cal = fit_ols(train)
        cal_mae = mae([(predict(cal, r), r["act"]) for r in test])
        blow = [e for t, n, e in tier_bias(test, lambda r: predict(cal, r))
                if t.startswith("blowout")]
        a = ats(test, lambda r: predict(cal, r))
        print(f"{cap:>5} {cal['b']:>6.3f} {cal['h']:>6.2f} {cal_mae:>8.2f} "
              f"{(blow[0] if blow else 0):>+12.1f} {a['w']:>4}-{a['l']:<4} {a['roi']:>+6.1f}%")
    print("\nReference — closing market MAE on weeks 8+: "
          f"{mae([(r['mkt'], r['act']) for r in rows_for_cap(api_key, lines, 28) if r['week'] > TRAIN_MAX_WEEK and r['mkt'] is not None]):.2f}")


if __name__ == "__main__":
    main()
