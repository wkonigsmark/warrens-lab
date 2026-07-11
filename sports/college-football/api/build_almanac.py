#!/usr/bin/env python3
"""Biff's Almanac — how do W²-Index spreads perform against the actual spreads?

For every completed FBS-vs-FBS game, compare the W² projected spread to BOTH
the closing market line and the actual result, then expose where the W² pricing
is systematically off — the vulnerabilities you can hunt for value against.

This runs on 2025 (the only completed season) using the *preseason* W² ratings
(no future knowledge — the identical model that prices 2026). When 2026 games
finish, point it at 2026 and it does the same, week by week.

Metrics:
  - margin accuracy: W² mean abs error vs the market's, and how often W² is closer
  - ATS: bet W²'s disagreement with the close — record + ROI at -110, by edge size
  - bias buckets: avg signed W² error (+ = W² overrates) by conference, home/away,
    and market-spread tier (the margin-cap tell shows up on big favorites)
  - auto-generated takeaways + tuning levers mapped to build_power_index constants

Usage:  python3 build_almanac.py [year]     # defaults to 2025
Needs CFBD_API_KEY.
"""

import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

import requests

from backtest_composite import build_preseason_2025
from fetch_games import load_api_key

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
CACHE = DATA_DIR / "backtest-cache"
HFA = 2.5
P4 = {"SEC", "Big Ten", "Big 12", "ACC"}


def fetch_lines_map(api_key, year):
    """{(week, home, away): median home-perspective spread} — neg = home favored."""
    CACHE.mkdir(exist_ok=True)
    cache = CACHE / f"lines-{year}.json"
    if cache.exists():
        raw = json.loads(cache.read_text())
    else:
        r = requests.get(
            "https://api.collegefootballdata.com/lines",
            headers={"Authorization": f"Bearer {api_key}"},
            params={"year": year, "seasonType": "regular"}, timeout=30,
        )
        r.raise_for_status()
        raw = r.json()
        cache.write_text(json.dumps(raw))
    out = {}
    for g in raw:
        spreads = [ln["spread"] for ln in (g.get("lines") or [])
                   if ln.get("spread") is not None]
        if not spreads:
            continue
        spreads.sort()
        mid = spreads[len(spreads) // 2]
        out[(g.get("week"), g.get("homeTeam"), g.get("awayTeam"))] = mid
    return out


def roi_record(plays):
    """plays: list of 'W'/'L'/'P'. Returns dict with record, win%, ROI% at -110."""
    w = plays.count("W")
    loss = plays.count("L")
    p = plays.count("P")
    decided = w + loss
    win_pct = round(100 * w / decided, 1) if decided else None
    roi = round(100 * (0.9091 * w - loss) / decided, 1) if decided else None
    return {"w": w, "l": loss, "p": p, "winPct": win_pct, "roi": roi}


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2025
    api_key = load_api_key()

    if year == 2025:
        pre = build_preseason_2025(api_key)
        ratings, games = pre["ratings"], pre["games25"]
        team_conf = pre["team_conf"]
    else:
        sys.exit("Only 2025 wired up so far (the completed season). "
                 "For 2026, snapshot preseason ratings before Week 1 first.")

    lines = fetch_lines_map(api_key, year)
    ranks = {t: i + 1 for i, (t, _) in
             enumerate(sorted(ratings.items(), key=lambda kv: -kv[1]))}

    # spread head (deployed by calibrate_spreads.py) — convert rating gap → margin.
    # Falls back to the raw gap + fixed HFA if not yet fitted.
    cal_path = DATA_DIR / "spread-cal.json"
    cal = json.loads(cal_path.read_text()) if cal_path.exists() else None
    def w2_home_margin(gap, is_home):
        if cal:
            return cal["b"] * gap + cal["h"] * is_home
        return gap + HFA * is_home

    rows = []
    for g in games:
        if not g["completed"] or g["homePoints"] is None:
            continue
        if g["homeClass"] != "fbs" or g["awayClass"] != "fbs":
            continue
        home, away = g["homeTeam"], g["awayTeam"]
        if home not in ratings or away not in ratings:
            continue
        spread = lines.get((g["week"], home, away))
        if spread is None:
            continue
        w2_home = w2_home_margin(ratings[home] - ratings[away],
                                 0 if g["neutralSite"] else 1)
        mkt_home = -spread                       # + = home favored
        act_home = g["homePoints"] - g["awayPoints"]
        rows.append({
            "week": g["week"], "home": home, "away": away,
            "w2_home": w2_home, "mkt_home": mkt_home, "act_home": act_home,
            "confHome": team_conf.get(home), "confAway": team_conf.get(away),
        })

    n = len(rows)
    if not n:
        sys.exit("No qualifying games with lines — check line coverage.")

    # margin accuracy
    w2_ae = [abs(r["w2_home"] - r["act_home"]) for r in rows]
    mkt_ae = [abs(r["mkt_home"] - r["act_home"]) for r in rows]
    w2_closer = sum(1 for a, b in zip(w2_ae, mkt_ae) if a < b)

    # ATS: bet W²'s side vs the close, at rising edge thresholds
    def ats_at(min_edge):
        plays = []
        for r in rows:
            edge = r["w2_home"] - r["mkt_home"]
            if abs(edge) < min_edge:
                continue
            cover_margin = r["act_home"] - r["mkt_home"]   # + = home covered
            if abs(cover_margin) < 1e-9:
                plays.append("P")
            else:
                lean_home = edge > 0
                home_covered = cover_margin > 0
                plays.append("W" if lean_home == home_covered else "L")
        return roi_record(plays)

    ats = {k: ats_at(v) for k, v in {"all": 0.5, "e1": 1, "e3": 3, "e6": 6}.items()}

    # bias buckets: team-perspective signed error (+ = W² overrated this side)
    conf_err = defaultdict(list)
    home_err, away_err = [], []
    for r in rows:
        he = r["w2_home"] - r["act_home"]        # home-perspective error
        conf_err[r["confHome"]].append(he)
        conf_err[r["confAway"]].append(-he)
        home_err.append(he)
        away_err.append(-he)

    conf_bias = sorted(
        ({"conf": c, "n": len(e), "avgErr": round(sum(e) / len(e), 2)}
         for c, e in conf_err.items() if c and len(e) >= 20),
        key=lambda d: -abs(d["avgErr"]))

    # market-spread tiers — where does W² diverge from actual & from the market?
    tiers = [("pick'em (0–3)", 0, 3), ("3–7", 3, 7), ("7–14", 7, 14),
             ("14–21", 14, 21), ("blowout (21+)", 21, 999)]
    tier_stats = []
    for label, lo, hi in tiers:
        sub = [r for r in rows if lo <= abs(r["mkt_home"]) < hi]
        if not sub:
            continue
        # favorite-perspective: does W² give the favorite fewer/more pts than reality & market?
        fav_vs_actual = []
        fav_vs_market = []
        for r in sub:
            fav_is_home = r["mkt_home"] > 0
            w2_fav = r["w2_home"] if fav_is_home else -r["w2_home"]
            mkt_fav = abs(r["mkt_home"])
            act_fav = r["act_home"] if fav_is_home else -r["act_home"]
            fav_vs_actual.append(w2_fav - act_fav)
            fav_vs_market.append(w2_fav - mkt_fav)
        tier_stats.append({
            "tier": label, "n": len(sub),
            "w2Mae": round(sum(abs(r["w2_home"] - r["act_home"]) for r in sub) / len(sub), 1),
            "mktMae": round(sum(abs(r["mkt_home"] - r["act_home"]) for r in sub) / len(sub), 1),
            "favVsMarket": round(sum(fav_vs_market) / len(sub), 1),
        })

    # ATS of W²'s value plays (edge >= 3) attributed to the side W² backed
    conf_ats = defaultdict(list)
    for r in rows:
        edge = r["w2_home"] - r["mkt_home"]
        if abs(edge) < 3:
            continue
        cover = r["act_home"] - r["mkt_home"]
        if abs(cover) < 1e-9:
            continue
        backed = r["home"] if edge > 0 else r["away"]
        backed_conf = r["confHome"] if edge > 0 else r["confAway"]
        win = (edge > 0) == (cover > 0)
        conf_ats[backed_conf].append("W" if win else "L")
    conf_ats_rows = sorted(
        ({"conf": c, **roi_record(p)} for c, p in conf_ats.items() if c and len(p) >= 10),
        key=lambda d: d["roi"])

    # --- auto-generated takeaways ---
    insights, tuning = [], []
    w2_mae = round(sum(w2_ae) / n, 2)
    mkt_mae = round(sum(mkt_ae) / n, 2)
    beat_pct = round(100 * w2_closer / n, 1)
    insights.append(
        f"Across {n} games, the W² line missed the final margin by {w2_mae} pts on average "
        f"vs the market's {mkt_mae}. W² was the closer number in {beat_pct}% of games.")
    e3 = ats["e3"]
    if e3["w"] + e3["l"]:
        verdict = "found value" if (e3["roi"] or 0) > 0 else "got picked off"
        insights.append(
            f"Betting every game where W² disagreed with the close by 3+ pts went "
            f"{e3['w']}–{e3['l']} ATS ({e3['winPct']}%, {e3['roi']:+}% ROI at -110) — "
            f"the model {verdict} on its disagreements. (Break-even is 52.4%.)")
    home_avg = round(sum(home_err) / len(home_err), 2)
    if abs(home_avg) >= 0.5:
        side = "overrates home teams" if home_avg > 0 else "underrates home teams"
        insights.append(f"W² {side} by {abs(home_avg)} pts/game against the result.")
        tuning.append(
            f"Home-field: W²'s home error is {home_avg:+}. The HFA constant is {HFA} — "
            f"{'trim it' if home_avg > 0 else 'nudge it up'} in build_power_index.py.")
    if conf_bias:
        worst = conf_bias[0]
        d = "overrated" if worst["avgErr"] > 0 else "underrated"
        insights.append(
            f"Biggest conference bias: W² {d} {worst['conf']} by {abs(worst['avgErr'])} "
            f"pts/game ({worst['n']} team-games) — fade them against the number.")
        tuning.append(
            f"Conference strength: {worst['conf']} ran {worst['avgErr']:+} — its members' "
            "regression target looks miscalibrated.")
    blow = next((t for t in tier_stats if t["tier"].startswith("blowout")), None)
    if blow and blow["favVsMarket"] <= -3:
        capped = " (post-calibration)" if cal else ""
        insights.append(
            f"On blowout lines (21+), W² still priced the favorite {abs(blow['favVsMarket'])} pts "
            f"below the market{capped} across {blow['n']} games. Tested: raising the margin cap "
            "does NOT fix this — the residual is preseason projection error (we didn't know the "
            "elites would be THIS good), not the cap. Keep the cap at 28 for clean strength.")
        tuning.append(
            "Blowouts: the residual is projection error, not the cap (experiment_cap.py confirms "
            "looser caps don't help). The real lever is in-season rating updates, not a preseason knob.")

    out = {
        "season": year,
        "generatedAt": date.today().isoformat(),
        "ratingBasis": ("preseason July-2025 W², spreads via the fitted spread head"
                        if cal else "preseason July-2025 W², raw rating gap + fixed HFA"),
        "spreadModel": (f"calibrated: margin = {cal['b']}·gap + {cal['h']}·home"
                        if cal else "raw: margin = gap + 2.5·home"),
        "caveat": ("Proof-of-concept on 2025 using static preseason ratings — the market "
                   "sharpens week to week, so late-season edges partly reflect projection "
                   "staleness, not just pricing. The robust biases (margin cap, home field, "
                   "conference) are the real, exploitable vulnerabilities. 2026 fills in weekly."),
        "scorecard": {
            "games": n, "w2Mae": w2_mae, "mktMae": mkt_mae, "w2CloserPct": beat_pct,
            "ats": ats,
        },
        "confBias": conf_bias,
        "homeBias": {"home": home_avg, "away": round(sum(away_err) / len(away_err), 2)},
        "spreadTiers": tier_stats,
        "confAts": conf_ats_rows,
        "insights": insights,
        "tuning": tuning,
    }
    (DATA_DIR / f"almanac-{year}.json").write_text(json.dumps(out, indent=1))

    print(f"✅ Biff's Almanac ({year}): {n} games → data/almanac-{year}.json")
    print(f"   W² MAE {w2_mae} vs market {mkt_mae} · W² closer {beat_pct}%")
    for k, a in ats.items():
        print(f"   ATS {k:>4}: {a['w']}-{a['l']}-{a['p']}  {a['winPct']}%  ROI {a['roi']}%")
    print("   Insights:")
    for s in insights:
        print(f"     • {s}")


if __name__ == "__main__":
    main()
