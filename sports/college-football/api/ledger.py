#!/usr/bin/env python3
"""The Ledger — the 2026 live forward test of the W²-Index.

Biff's Almanac replayed 2025 after the fact. This is the real thing, recorded
forward, with no look-ahead: every week the full rankings and the model's line
on every game with a posted market number are FROZEN before kickoff, then graded
against the actual result once it's final. Grading always reads the frozen
snapshot — never the live index — so nothing can be quietly revised.

    python3 ledger.py snapshot <week> [--force]   freeze rankings + every lined pick (pre-kickoff)
    python3 ledger.py grade <week>                 grade the completed games against the snapshot
    python3 ledger.py note <week> "..."            add a dated analyst note to the week's record
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

# --- what actually goes in play ---
# A playable game is one the model is ALLOWED to price. It only becomes a live play
# if we meaningfully disagree with the market: under 3 points we're essentially
# agreeing with Vegas, and counting those as bets both pads the sample and pollutes
# the record (wk2 opened 0-2 on edges of 1.2 and 0.9 — never real convictions).
# Sub-threshold picks are still graded and kept, as OBSERVATIONS.
ACTION_MIN = 3.0
STAKE_TIERS = [(7.0, 2), (ACTION_MIN, 1)]   # |edge| ≥7 → 2 units, ≥3 → 1 unit, else 0


def stake_for(pick):
    """Units risked on a pick. Derived from the frozen edge, never stored at freeze
    time — so the action rule can be re-tuned without touching the immutable record."""
    if not pick.get("playable"):
        return 0
    e = abs(pick["edge"])
    for lo, units in STAKE_TIERS:
        if e >= lo:
            return units
    return 0


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
    # re-stamp stakes every save so the action rule stays consistent across all weeks
    for wk in L["weeks"].values():
        for p in wk["picks"]:
            p["stake"] = stake_for(p)
    L["actionRule"] = {"minEdge": ACTION_MIN, "tiers": STAKE_TIERS,
                       "note": "units risked per pick; <%g pts = observation only" % ACTION_MIN}
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

def note(week, text):
    """Attach a dated analyst note to a week — the qualitative half of the record.
    What you believed at the time, kept next to what the numbers actually did."""
    L = load_ledger()
    wk = L["weeks"].get(str(week))
    if not wk:
        sys.exit(f"No snapshot for week {week} — freeze it first.")
    wk.setdefault("notes", []).append({"at": now(), "text": text})
    save_ledger(L)
    print(f"📝 Week {week} note added ({len(wk['notes'])} total)")


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
    # unit-weighted P&L: a 2-unit win pays 2×(100/110), a 2-unit loss costs 2
    risked = sum(p.get("stake", 0) for p in g)
    pnl = sum((p.get("stake", 0) * VIG_WIN) if p["grade"]["ats"] == "W"
              else (-p.get("stake", 0)) if p["grade"]["ats"] == "L" else 0.0
              for p in g)
    return {
        "n": len(g), "w": w, "l": l, "p": len(g) - dec,
        "atsPct": round(100 * w / dec, 1) if dec else None,
        "roi": round(100 * (w * VIG_WIN - l) / dec, 1) if dec else None,
        "units": round(risked, 1),
        "pnl": round(pnl, 2),
        "unitRoi": round(100 * pnl / risked, 1) if risked else None,
        "modelMae": round(sum(p["grade"]["modelErr"] for p in g) / len(g), 2) if g else None,
        "mktMae": round(sum(p["grade"]["mktErr"] for p in g) / len(g), 2) if g else None,
        "modelCloserPct": round(100 * sum(p["grade"]["modelCloser"] for p in g) / len(g), 1) if g else None,
    }


def summarize(L):
    weeks = sorted(L["weeks"].values(), key=lambda w: w["week"])
    allp = [p for w in weeks for p in w["picks"]]
    playable = [p for p in allp if p["playable"]]
    action = [p for p in playable if p.get("stake", 0) > 0]
    observation = [p for p in playable if p.get("stake", 0) == 0]
    return {
        "all": agg(allp),
        "playable": agg(playable),
        "action": agg(action),              # ← the real betting record
        "observation": agg(observation),    # sub-threshold: we agreed with the market
        "byEdgeTier": {t: agg([p for p in playable if p["edgeTier"] == t]) for t, _, _ in EDGE_TIERS},
        "byWeek": [{"week": w["week"],
                    **agg([p for p in w["picks"] if p.get("stake", 0) > 0]),
                    "actionPicks": sum(1 for p in w["picks"] if p.get("stake", 0) > 0),
                    "pending": sum(1 for p in w["picks"]
                                   if p.get("stake", 0) > 0 and not p["grade"])}
                   for w in weeks],
        "weeksFrozen": [w["week"] for w in weeks],
        "totalPicks": len(allp),
        "actionPicks": len(action),
    }


def print_week(wk):
    for p in sorted(wk["picks"], key=lambda p: -abs(p["edge"])):
        gr = p["grade"]
        mark = {"W": "✅", "L": "❌", "P": "➖"}.get(gr["ats"], "") if gr else "⏳"
        score = f"{gr['awayPts']}-{gr['homePts']}" if gr else "—"
        st = stake_for(p)
        flag = f" [{st}u]" if st else (" (observation)" if p["playable"] else " (not playable)")
        print(f"  {mark} {p['away']} @ {p['home']:<20} model {p['home']} {p['modelHome']:+.1f} · "
              f"mkt {p['mktHome']:+.1f} · edge {p['edge']:+.1f} → {p['modelSide']}{flag}  [{score}]")


def status():
    L = load_ledger()
    s = L.get("summary")
    if not s or not s["totalPicks"]:
        print("Ledger is empty — freeze a week first: ledger.py snapshot <week>")
        return
    a, pl, act, obs = s["all"], s["playable"], s["action"], s["observation"]
    print(f"📓 The Ledger · 2026 · weeks frozen: {s['weeksFrozen']} · "
          f"{s['totalPicks']} picks logged, {s['actionPicks']} in play "
          f"(edge ≥{ACTION_MIN:g}: 1u, ≥7: 2u)")
    if act["n"]:
        print(f"   ▶ IN PLAY      : {act['w']}-{act['l']}-{act['p']} ATS ({act['atsPct']}%) · "
              f"{act['pnl']:+.2f}u on {act['units']:g}u risked = {act['unitRoi']:+}% · "
              f"model miss {act['modelMae']} vs market {act['mktMae']}")
    else:
        print("   ▶ IN PLAY      : nothing graded yet")
    if obs["n"]:
        print(f"     observation  : {obs['w']}-{obs['l']}-{obs['p']} ({obs['atsPct']}%) "
              f"— sub-{ACTION_MIN:g}pt, we agreed with the market (not bet)")
    if pl["n"]:
        for t, _, _ in EDGE_TIERS:
            e = s["byEdgeTier"][t]
            if e["n"]:
                tag = "obs " if t == "small" else f"{2 if t == 'big' else 1}u  "
                print(f"     edge {t:<5} {tag}: {e['w']}-{e['l']}-{e['p']} ({e['atsPct']}%)  flat ROI {e['roi']:+}%")
    if a["n"]:
        print(f"   (all {a['n']} lined incl. FCS/blowouts: {a['w']}-{a['l']}-{a['p']}, "
              f"miss {a['modelMae']} vs {a['mktMae']})")
    for w in s["byWeek"]:
        print(f"   wk{w['week']:>2}: {w['actionPicks']} in play — {w['n']} graded, {w['pending']} pending"
              + (f" · {w['w']}-{w['l']}-{w['p']} · {w['pnl']:+.2f}u" if w["n"] else ""))


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    cmd = args[0]
    if cmd == "snapshot" and len(args) >= 2:
        snapshot(int(args[1]), force="--force" in args)
    elif cmd == "grade" and len(args) >= 2:
        grade(int(args[1]))
    elif cmd == "note" and len(args) >= 3:
        note(int(args[1]), " ".join(args[2:]))
    elif cmd == "status":
        status()
    else:
        sys.exit(__doc__)
