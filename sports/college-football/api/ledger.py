#!/usr/bin/env python3
"""The Ledger — the 2026 live forward test of the W²-Index.

Biff's Almanac replayed 2025 after the fact. This is the real thing, recorded
forward, with no look-ahead: every week the full rankings and the model's line
on every game with a posted market number are FROZEN before kickoff, then graded
against the actual result once it's final. Grading always reads the frozen
snapshot — never the live index — so nothing can be quietly revised.

    python3 ledger.py snapshot <week> [--force]   freeze rankings + every lined pick (pre-kickoff)
    python3 ledger.py grade <week>                 grade the completed games against the snapshot
    python3 ledger.py status                       season-to-date scorecard

Files: data/ledger/snapshots/week-NN.json (immutable freezes, full rankings)
       data/ledger/ledger.json               (picks + grades + running summary; UI/MCP read this)
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
LEDGER_DIR = DATA / "ledger"
SNAP_DIR = LEDGER_DIR / "snapshots"
LEDGER = LEDGER_DIR / "ledger.json"

# "Playable" = the honest actionable set. Everything else is still logged for the record.
#   - market line beyond RELIABLE_MKT → cupcake blowout; the margin cap softens these (artifact)
#   - FBS-vs-FCS → every FCS team shares ONE pooled rating, so the model can't tell a strong
#     FCS program (South Dakota State) from a cupcake — the market can. Not a bet.
RELIABLE_MKT = 21
EDGE_TIERS = [("small", 0, 3), ("mid", 3, 7), ("big", 7, 999)]
VIG_WIN = 100 / 110        # units returned on a win at -110


def load(name):
    return json.loads((DATA / name).read_text())


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ")


def cal():
    try:
        c = load("spread-cal.json")
        return c["b"], c["h"]
    except Exception:
        return 1.0, 2.5


def win_prob(home_margin):
    return 1 / (1 + 10 ** (-home_margin / 15))


def tier(edge):
    for name, lo, hi in EDGE_TIERS:
        if lo <= abs(edge) < hi:
            return name
    return "big"


def load_ledger():
    if LEDGER.exists():
        return json.loads(LEDGER.read_text())
    return {"season": 2026, "createdAt": now(), "weeks": {}, "summary": None}


def save_ledger(L):
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    L["updatedAt"] = now()
    L["summary"] = summarize(L)
    LEDGER.write_text(json.dumps(L, indent=1))


# ------------------------------------------------------------------ snapshot

def snapshot(week, force=False):
    SNAP_DIR.mkdir(parents=True, exist_ok=True)
    path = SNAP_DIR / f"week-{week:02d}.json"
    if path.exists() and not force:
        print(f"🧊 Week {week} is already frozen ({path.name}) — leaving the record alone. "
              f"Use --force to re-freeze.")
        return
    pi = load("power-index-2026.json")
    by = {t["school"]: t for t in pi["teams"]}
    fcs = pi["fcsPoolRating"]
    games = {g["id"]: g for g in load("games-2026.json")["games"]}
    lines = load("lines-2026.json")["games"]
    b, h = cal()

    picks = []
    for ln in lines:
        g = games.get(ln["id"])
        if not g or g["week"] != week or ln.get("marketSpread") is None:
            continue
        rh = by.get(g["homeTeam"], {}).get("rating", fcs)
        ra = by.get(g["awayTeam"], {}).get("rating", fcs)
        fcs_game = g["homeTeam"] not in by or g["awayTeam"] not in by
        model_home = b * (rh - ra) + h * (0 if g["neutralSite"] else 1)
        mkt_home = -ln["marketSpread"]                   # market's expected home margin
        edge = model_home - mkt_home                     # + → model likes home more than market
        mislabel = ((model_home > 0) != (mkt_home > 0)
                    and abs(model_home) >= 10 and abs(mkt_home) >= 10)
        played = bool(g.get("completed") and g.get("homePoints") is not None)
        picks.append({
            "id": ln["id"], "week": week, "date": (g.get("date") or "")[:10],
            "home": g["homeTeam"], "away": g["awayTeam"], "neutral": bool(g["neutralSite"]),
            "homeRating": round(rh, 2), "awayRating": round(ra, 2),
            "modelHome": round(model_home, 1), "mktHome": round(mkt_home, 1),
            "edge": round(edge, 1), "edgeTier": tier(edge),
            "modelSide": g["homeTeam"] if edge >= 0 else g["awayTeam"],
            "homeWinProb": round(win_prob(model_home), 3),
            "books": [bk["book"] for bk in ln.get("books", [])],
            "fcsGame": fcs_game,
            "playable": abs(mkt_home) <= RELIABLE_MKT and not mislabel and not fcs_game,
            "preGame": not played,               # False = frozen after the fact vs the closing line
            "grade": None,
        })

    rankings = [{"school": t["school"], "rank": t["rank"], "rating": t["rating"],
                 "preseasonRating": t.get("preseasonRating", t["rating"]),
                 "conference": t["conference"]} for t in pi["teams"]]
    snap = {"season": 2026, "week": week, "snapshotAt": now(), "indexVersion": pi.get("indexVersion"),
            "inseason": pi.get("inseason"), "spreadCal": {"b": b, "h": h},
            "rankings": rankings, "picks": picks}
    path.write_text(json.dumps(snap, indent=1))

    L = load_ledger()
    L["weeks"][str(week)] = {
        "week": week, "snapshotAt": snap["snapshotAt"], "inseason": snap["inseason"],
        "rankTop25": [{k: r[k] for k in ("school", "rank", "rating")} for r in rankings[:25]],
        "picks": picks,
    }
    save_ledger(L)
    print(f"📸 Week {week} frozen → {path.name}: {len(rankings)} teams ranked, "
          f"{len(picks)} lined picks ({sum(p['playable'] for p in picks)} playable, "
          f"{sum(not p['preGame'] for p in picks)} already played → vs closing line)")


# --------------------------------------------------------------------- grade

def grade(week):
    L = load_ledger()
    wk = L["weeks"].get(str(week))
    if not wk:
        sys.exit(f"No snapshot for week {week} — run: ledger.py snapshot {week}")
    games = {g["id"]: g for g in load("games-2026.json")["games"]}
    new = 0
    for p in wk["picks"]:
        g = games.get(p["id"])
        if not g or not g.get("completed") or g.get("homePoints") is None:
            continue
        actual = g["homePoints"] - g["awayPoints"]
        model_err, mkt_err = abs(actual - p["modelHome"]), abs(actual - p["mktHome"])
        # we "bet" the model's side at the market number
        if p["edge"] >= 0:      # model likes home → home must beat the spread
            ats = "W" if actual > p["mktHome"] else "L" if actual < p["mktHome"] else "P"
        else:                   # model likes away
            ats = "W" if actual < p["mktHome"] else "L" if actual > p["mktHome"] else "P"
        if p["grade"] is None:
            new += 1
        p["grade"] = {"homePts": g["homePoints"], "awayPts": g["awayPoints"], "actualHome": actual,
                      "modelErr": round(model_err, 1), "mktErr": round(mkt_err, 1),
                      "modelCloser": model_err < mkt_err, "ats": ats, "gradedAt": now()}
    save_ledger(L)
    done = sum(1 for p in wk["picks"] if p["grade"])
    print(f"✅ Week {week}: {done}/{len(wk['picks'])} picks graded ({new} new)")
    print_week(wk)


# ------------------------------------------------------------------- summary

def agg(picks):
    g = [p for p in picks if p["grade"]]
    w = sum(p["grade"]["ats"] == "W" for p in g)
    l = sum(p["grade"]["ats"] == "L" for p in g)
    dec = w + l
    return {
        "n": len(g), "w": w, "l": l, "p": len(g) - dec,
        "atsPct": round(100 * w / dec, 1) if dec else None,
        "roi": round(100 * (w * VIG_WIN - l) / dec, 1) if dec else None,
        "modelMae": round(sum(p["grade"]["modelErr"] for p in g) / len(g), 2) if g else None,
        "mktMae": round(sum(p["grade"]["mktErr"] for p in g) / len(g), 2) if g else None,
        "modelCloserPct": round(100 * sum(p["grade"]["modelCloser"] for p in g) / len(g), 1) if g else None,
    }


def summarize(L):
    weeks = sorted(L["weeks"].values(), key=lambda w: w["week"])
    allp = [p for w in weeks for p in w["picks"]]
    playable = [p for p in allp if p["playable"]]
    return {
        "all": agg(allp),
        "playable": agg(playable),
        "byEdgeTier": {t: agg([p for p in playable if p["edgeTier"] == t]) for t, _, _ in EDGE_TIERS},
        "byWeek": [{"week": w["week"], **agg(w["picks"]),
                    "pending": sum(1 for p in w["picks"] if not p["grade"])} for w in weeks],
        "weeksFrozen": [w["week"] for w in weeks],
        "totalPicks": len(allp),
    }


def print_week(wk):
    for p in sorted(wk["picks"], key=lambda p: -abs(p["edge"])):
        gr = p["grade"]
        mark = {"W": "✅", "L": "❌", "P": "➖"}.get(gr["ats"], "") if gr else "⏳"
        score = f"{gr['awayPts']}-{gr['homePts']}" if gr else "—"
        flag = "" if p["playable"] else " (not playable)"
        print(f"  {mark} {p['away']} @ {p['home']:<20} model {p['home']} {p['modelHome']:+.1f} · "
              f"mkt {p['mktHome']:+.1f} · edge {p['edge']:+.1f} → {p['modelSide']}{flag}  [{score}]")


def status():
    L = load_ledger()
    s = L.get("summary")
    if not s or not s["totalPicks"]:
        print("Ledger is empty — freeze a week first: ledger.py snapshot <week>")
        return
    a, pl = s["all"], s["playable"]
    print(f"📓 The Ledger · 2026 · weeks frozen: {s['weeksFrozen']} · {s['totalPicks']} picks")
    print(f"   All lined games : {a['w']}-{a['l']}-{a['p']} ATS ({a['atsPct']}%) · ROI {a['roi']:+}% · "
          f"model miss {a['modelMae']} vs market {a['mktMae']}" if a["n"] else "   nothing graded yet")
    if pl["n"]:
        print(f"   Playable only   : {pl['w']}-{pl['l']}-{pl['p']} ATS ({pl['atsPct']}%) · ROI {pl['roi']:+}% · "
              f"model closer {pl['modelCloserPct']}% of games")
        for t, _, _ in EDGE_TIERS:
            e = s["byEdgeTier"][t]
            if e["n"]:
                print(f"     edge {t:<5}: {e['w']}-{e['l']}-{e['p']} ({e['atsPct']}%)  ROI {e['roi']:+}%")
    for w in s["byWeek"]:
        print(f"   wk{w['week']:>2}: {w['n']} graded, {w['pending']} pending"
              + (f" · {w['w']}-{w['l']}-{w['p']} · miss {w['modelMae']} vs {w['mktMae']}" if w["n"] else ""))


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    cmd = args[0]
    if cmd == "snapshot" and len(args) >= 2:
        snapshot(int(args[1]), force="--force" in args)
    elif cmd == "grade" and len(args) >= 2:
        grade(int(args[1]))
    elif cmd == "status":
        status()
    else:
        sys.exit(__doc__)
