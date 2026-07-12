#!/usr/bin/env python3
"""Time Machine + Progressive SOS index — weekly snapshots of the 2025 season.

Reconstructs the season week by week (no look-ahead: each week's ratings come
only from games played through that week, blended off the preseason prior — the
same in-season model backtest_inseason.py validated). At every week we recompute
each team's Strength of Schedule using opponents' CURRENT revealed strength, so
a schedule that LOOKED brutal in August deflates as those opponents flop.

SOS is one combined full-season number (all scheduled FBS opponents valued at
their current rating), with the played / remaining split carried alongside —
the played games are what reveal the strengths that reprice the whole slate.

Index: 100 = a league-average schedule at preseason. Higher = tougher.
    sosIndex = 100 + SCALE · (avg opponent current rating − league anchor)

Writes data/timeline-2025.json. Read-only backtest; deploys nothing.
"""

import json
import statistics
from datetime import date
from pathlib import Path

from backtest_composite import build_preseason_2025
from build_power_index import srs_from_games
from fetch_games import load_api_key

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
PRIOR_STRENGTH = 4.0     # preseason prior worth ~4 weeks (matches backtest_inseason)
SCALE = 3.0              # rating points → index points (tuned for a readable ~70–130 range)


def main():
    api_key = load_api_key()
    pre = build_preseason_2025(api_key)
    preseason, games = pre["ratings"], pre["games25"]
    meta = {t["school"]: t for t in
            json.loads((DATA_DIR / "teams-db.json").read_text())["teams"]}

    fbs_games = [g for g in games if g["completed"] and g["homePoints"] is not None
                 and g["homeClass"] == "fbs" and g["awayClass"] == "fbs"
                 and g["homeTeam"] in preseason and g["awayTeam"] in preseason]
    max_week = max(g["week"] for g in fbs_games)
    fbs_teams = sorted({t for g in fbs_games for t in (g["homeTeam"], g["awayTeam"])})

    # each team's full FBS schedule: (opponent, week)
    sched = {t: [] for t in fbs_teams}
    for g in fbs_games:
        sched[g["homeTeam"]].append((g["awayTeam"], g["week"]))
        sched[g["awayTeam"]].append((g["homeTeam"], g["week"]))

    # in-season ratings snapshot through week w (w=0 → preseason prior)
    def ratings_through(w):
        if w == 0:
            return dict(preseason)
        played = [g for g in fbs_games if g["week"] <= w]
        if len(played) < 20:
            return dict(preseason)
        iw = w / (w + PRIOR_STRENGTH)
        srs = srs_from_games(played)
        return {t: (1 - iw) * preseason.get(t, -10) + iw * srs.get(t, -10)
                for t in preseason}

    snapshots = {w: ratings_through(w) for w in range(0, max_week + 1)}

    def avg_opp(team, ratings, opps):
        vals = [ratings[o] for (o, _) in opps if o in ratings]
        return sum(vals) / len(vals) if vals else None

    # league anchor = average schedule at preseason
    anchor = statistics.fmean(
        avg_opp(t, preseason, sched[t]) for t in fbs_teams if sched[t])

    def idx(v):
        return round(100 + SCALE * (v - anchor), 1) if v is not None else None

    out_teams = {}
    for t in fbs_teams:
        series = []
        for w in range(0, max_week + 1):
            R = snapshots[w]
            allopps = sched[t]
            played = [(o, wk) for o, wk in allopps if wk <= w]
            remaining = [(o, wk) for o, wk in allopps if wk > w]
            # record through week w
            wins = losses = 0
            for g in fbs_games:
                if g["week"] > w:
                    continue
                if g["homeTeam"] == t:
                    wins += g["homePoints"] > g["awayPoints"]
                    losses += g["homePoints"] < g["awayPoints"]
                elif g["awayTeam"] == t:
                    wins += g["awayPoints"] > g["homePoints"]
                    losses += g["awayPoints"] < g["homePoints"]
            rank = sorted(fbs_teams, key=lambda x: -R.get(x, -99)).index(t) + 1
            series.append({
                "week": w,
                "sosIndex": idx(avg_opp(t, R, allopps)),
                "playedIndex": idx(avg_opp(t, R, played)),
                "remainIndex": idx(avg_opp(t, R, remaining)),
                "rating": round(R[t], 1),
                "rank": rank,
                "record": f"{wins}-{losses}",
            })
        m = meta.get(t, {})
        out_teams[t] = {
            "conference": m.get("conference"),
            "logo": (m.get("logos") or [None])[0],
            "color": (m.get("colors") or {}).get("primary"),
            "preseasonIndex": series[0]["sosIndex"],
            "finalIndex": series[-1]["sosIndex"],
            "swing": round(series[-1]["sosIndex"] - series[0]["sosIndex"], 1),
            "series": series,
        }

    ranked = sorted(out_teams.items(), key=lambda kv: kv[1]["swing"])
    decliners = [{"team": t, **{k: v[k] for k in ("preseasonIndex", "finalIndex", "swing")}}
                 for t, v in ranked[:12]]
    risers = [{"team": t, **{k: v[k] for k in ("preseasonIndex", "finalIndex", "swing")}}
              for t, v in ranked[-12:][::-1]]

    out = {
        "season": 2025,
        "generatedAt": date.today().isoformat(),
        "maxWeek": max_week,
        "scale": SCALE,
        "note": ("SOS index: 100 = league-average schedule at preseason. Recomputed each "
                 "week with opponents' current in-season rating (no look-ahead). A falling "
                 "line = the schedule was tougher on paper than it turned out to be."),
        "decliners": decliners,
        "risers": risers,
        "teams": out_teams,
    }
    (DATA_DIR / "timeline-2025.json").write_text(json.dumps(out))
    kb = (DATA_DIR / "timeline-2025.json").stat().st_size // 1024

    print(f"✅ Timeline built → data/timeline-2025.json ({kb} KB, {len(fbs_teams)} teams, "
          f"weeks 0–{max_week})")
    pres = [v["preseasonIndex"] for v in out_teams.values()]
    print(f"   preseason SOS index range: {min(pres)} … {max(pres)}  (anchor {round(anchor,2)})")
    print("   Biggest schedule deflators (preseason → final SOS index):")
    for d in decliners[:6]:
        print(f"     {d['team']:<18} {d['preseasonIndex']:>6} → {d['finalIndex']:<6} ({d['swing']:+})")
    print("   Biggest risers (schedule got tougher than billed):")
    for d in risers[:3]:
        print(f"     {d['team']:<18} {d['preseasonIndex']:>6} → {d['finalIndex']:<6} ({d['swing']:+})")


if __name__ == "__main__":
    main()
