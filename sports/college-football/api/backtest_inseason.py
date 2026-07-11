#!/usr/bin/env python3
"""Progressive in-season backtest: replay 2025 week by week.

Validates the process we'll run live in 2026. At each week W, the rating is a
shrinkage blend of the preseason prior and the SRS of games actually played so
far — the prior fades as real results accumulate:

    inseasonWeight = gamesWeeks / (gamesWeeks + PRIOR_STRENGTH)
    rating_W = (1-w)·preseason + w·SRS(weeks < W)

Then each week's games are projected from ratings-known-before-that-week and
scored: W² spread MAE vs the actual margin, vs the closing market line, and ATS.
The payoff view is the convergence curve — does W² accuracy walk down toward the
market's ~12 as the season fills in? If so, weekly rating updates are worth it.

Writes data/inseason-2025.json. Read-only backtest; deploys nothing.
"""

import json
from datetime import date
from pathlib import Path

from backtest_composite import build_preseason_2025
from build_almanac import fetch_lines_map
from build_power_index import srs_from_games
from fetch_games import load_api_key

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
PRIOR_STRENGTH = 4.0     # preseason prior worth ~4 weeks of results


def main():
    api_key = load_api_key()
    pre = build_preseason_2025(api_key)
    preseason, games = pre["ratings"], pre["games25"]
    lines = fetch_lines_map(api_key, 2025)
    cal = json.loads((DATA_DIR / "spread-cal.json").read_text())

    fbs_games = [g for g in games if g["completed"] and g["homePoints"] is not None
                 and g["homeClass"] == "fbs" and g["awayClass"] == "fbs"
                 and g["homeTeam"] in preseason and g["awayTeam"] in preseason]
    weeks = sorted({g["week"] for g in fbs_games})

    def spread(ratings, g):
        gap = ratings.get(g["homeTeam"], -10) - ratings.get(g["awayTeam"], -10)
        return cal["b"] * gap + cal["h"] * (0 if g["neutralSite"] else 1)

    rows = []
    for w in weeks:
        prior_games = [g for g in fbs_games if g["week"] < w]
        if len(prior_games) < 20:      # too little in-season signal yet
            ratings = dict(preseason)
        else:
            weeks_played = w - 1
            iw = weeks_played / (weeks_played + PRIOR_STRENGTH)
            insrs = srs_from_games(prior_games)
            ratings = {t: (1 - iw) * preseason.get(t, -10) + iw * insrs.get(t, -10)
                       for t in preseason}

        wk_games = [g for g in fbs_games if g["week"] == w]
        w2_ae, mkt_ae, plays = [], [], []
        for g in wk_games:
            act = g["homePoints"] - g["awayPoints"]
            w2 = spread(ratings, g)
            w2_ae.append(abs(w2 - act))
            mk = lines.get((w, g["homeTeam"], g["awayTeam"]))
            if mk is None:
                continue
            mkt = -mk
            mkt_ae.append(abs(mkt - act))
            edge = w2 - mkt
            if abs(edge) < 3:
                continue
            cover = act - mkt
            if abs(cover) < 1e-9:
                continue
            plays.append((edge > 0) == (cover > 0))
        if not w2_ae:
            continue
        wgt = w - 1
        iw = 0.0 if len(prior_games) < 20 else wgt / (wgt + PRIOR_STRENGTH)
        rows.append({
            "week": w, "games": len(wk_games),
            "priorWeight": round(1 - iw, 2),
            "w2Mae": round(sum(w2_ae) / len(w2_ae), 2),
            "mktMae": round(sum(mkt_ae) / len(mkt_ae), 2) if mkt_ae else None,
            "atsW": sum(plays), "atsL": len(plays) - sum(plays),
        })

    tot_w = sum(r["atsW"] for r in rows)
    tot_l = sum(r["atsL"] for r in rows)
    late = [r for r in rows if r["week"] >= 8 and r["mktMae"] is not None]
    out = {
        "season": 2025, "generatedAt": date.today().isoformat(),
        "priorStrengthWeeks": PRIOR_STRENGTH,
        "model": "rating = shrink(preseason prior, in-season SRS); spread via spread head",
        "weeks": rows,
        "summary": {
            "atsW": tot_w, "atsL": tot_l,
            "atsPct": round(100 * tot_w / (tot_w + tot_l), 1) if tot_w + tot_l else None,
            "earlyW2Mae": round(sum(r["w2Mae"] for r in rows[:4]) / 4, 2),
            "lateW2Mae": round(sum(r["w2Mae"] for r in late) / len(late), 2) if late else None,
            "lateMktMae": round(sum(r["mktMae"] for r in late) / len(late), 2) if late else None,
        },
    }
    (DATA_DIR / "inseason-2025.json").write_text(json.dumps(out, indent=1))

    print("Progressive in-season backtest (2025):")
    print(f"  {'wk':>3} {'games':>6} {'prior%':>7} {'W² MAE':>8} {'mkt MAE':>8} {'ATS 3+':>8}")
    for r in rows:
        print(f"  {r['week']:>3} {r['games']:>6} {int(r['priorWeight']*100):>6}% "
              f"{r['w2Mae']:>8} {str(r['mktMae']):>8} {r['atsW']:>3}-{r['atsL']:<3}")
    s = out["summary"]
    print(f"\n  Early-season W² MAE (wk1-4): {s['earlyW2Mae']}  →  late (wk8+): {s['lateW2Mae']}"
          f"  vs market {s['lateMktMae']}")
    print(f"  Full-season ATS on 3+ edges: {s['atsW']}-{s['atsL']} ({s['atsPct']}%)")
    print(f"✅ → data/inseason-2025.json")


if __name__ == "__main__":
    main()
