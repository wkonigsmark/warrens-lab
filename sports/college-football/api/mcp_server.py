#!/usr/bin/env python3
"""Viva CFP — MCP server for the W²-Index.

Exposes the college-football index/model as query tools for the Claude desktop
app: rankings, team reports, matchup projections, the weekly model-vs-market
edge board, conference races, and SOS-decay watch. Reads the JSON the pipeline
produces (data/*.json) fresh on every call, so it's always current after a
refresh. Runs over stdio — registered in claude_desktop_config.json.

Setup:  python3 -m venv api/.venv && api/.venv/bin/pip install "mcp[cli]"
Run  :  api/.venv/bin/python api/mcp_server.py   (Claude Desktop launches this)
"""

import json
import subprocess
import sys
from pathlib import Path

from mcp.server import MCPServer

HERE = Path(__file__).resolve().parent      # .../college-football/api
DATA = HERE.parent / "data"

mcp = MCPServer(name="viva-cfp",
                instructions="Query Warren's Viva CFP W²-Index: rankings, team "
                "reports, matchup projections, the weekly model-vs-market edge board, "
                "conference races, schedules, and SOS-decay analysis.")

CONF_ACRO = {
    "SEC": "SEC", "Big Ten": "B10", "Big 12": "B12", "ACC": "ACC", "Pac-12": "P12",
    "American Athletic": "AAC", "Sun Belt": "SBC", "Mountain West": "MW",
    "Conference USA": "CUSA", "Mid-American": "MAC", "FBS Independents": "IND",
}


def load(name):
    return json.loads((DATA / name).read_text())


def teams():
    return load("power-index-2026.json")["teams"]


def sign(v):
    return f"+{v}" if v > 0 else f"{v}"


def find_team(q):
    q = q.strip().lower()
    ts = teams()
    for pred in (lambda t: t["school"].lower() == q,
                 lambda t: t["school"].lower().startswith(q),
                 lambda t: q in t["school"].lower(),
                 lambda t: q in t["school"].lower().replace(" ", "")):
        hit = next((t for t in ts if pred(t)), None)
        if hit:
            return hit
    return None


def cal():
    try:
        c = load("spread-cal.json")
        return c["b"], c["h"]
    except Exception:
        return 1.0, 2.5


def win_prob(margin):
    return 1 / (1 + 10 ** (-margin / 15))


# ---------------------------------------------------------------- tools

@mcp.tool()
def w2_index(top_n: int = 25, conference: str = "") -> str:
    """The W²-Index — the proprietary team-strength ranking for 2026.
    Rating = points better/worse than an average FBS team (reads like a point
    spread). Optionally filter to one conference (e.g. 'SEC', 'Big Ten')."""
    ts = teams()
    if conference:
        cl = conference.strip().lower()
        ts = [t for t in ts if cl in (t["conference"] or "").lower()
              or cl == (CONF_ACRO.get(t["conference"], "")).lower()]
    ts = ts[:top_n]
    lines = [f"W²-Index{' · ' + conference if conference else ''} (top {len(ts)}):", ""]
    for t in ts:
        poll = f" · ESPN #{t['pollRank']}" if t.get("pollRank") else ""
        lines.append(f"{t['rank']:>3}. {t['school']:<18} {sign(t['rating']):>6}  "
                     f"[{CONF_ACRO.get(t['conference'], t['conference'])}"
                     f" · SoS {sign(t.get('sos2026', 0))}{poll}]")
    return "\n".join(lines)


@mcp.tool()
def team_report(team: str) -> str:
    """Full W² report for one team: rating, rank, 2025 SRS, strength of schedule,
    conference, and ESPN poll cross-reference. Accepts partial names."""
    t = find_team(team)
    if not t:
        return f"No team matches '{team}'. Try a fuller name."
    poll = f"ESPN preseason #{t['pollRank']}" if t.get("pollRank") else "unranked by ESPN"
    return (f"{t['school']} ({CONF_ACRO.get(t['conference'], t['conference'])}, "
            f"{t['confTier']})\n"
            f"  W²-Index rank : #{t['rank']} of 138\n"
            f"  Rating        : {sign(t['rating'])}  (vs an average FBS team, ≈ point spread)\n"
            f"  2025 SRS      : {sign(t['srs2025']) if t.get('srs2025') is not None else 'new'}\n"
            f"  2026 SoS      : {sign(t.get('sos2026', 0))}  (avg projected opponent rating)\n"
            f"  Offseason comp: {sign(t['compositePts']) if t.get('compositePts') is not None else '—'}"
            f"  ({poll})")


@mcp.tool()
def matchup(home: str, away: str, neutral: bool = False) -> str:
    """Project a single game: the calibrated W² spread and win probability.
    `home`/`away` are team names; set neutral=True for a neutral-site game."""
    h, a = find_team(home), find_team(away)
    if not h or not a:
        return f"Couldn't match {'home' if not h else 'away'} team."
    b, hf = cal()
    gap = h["rating"] - a["rating"]
    margin = b * gap + hf * (0 if neutral else 1)      # home perspective
    fav, dog = (h, a) if margin >= 0 else (a, h)
    spread = abs(margin)
    p = win_prob(spread)
    loc = "neutral site" if neutral else f"at {h['school']}"
    return (f"{a['school']} (#{a['rank']}, {sign(a['rating'])}) vs "
            f"{h['school']} (#{h['rank']}, {sign(h['rating'])}) — {loc}\n"
            f"  W² line : {fav['school']} by {spread:.1f}\n"
            f"  Win prob: {fav['school']} {p*100:.0f}% / {dog['school']} {(1-p)*100:.0f}%\n"
            f"  (calibrated spread head: gap ×{b} {'+' if hf>=0 else ''}{hf} home field)")


@mcp.tool()
def weekly_edges(week: int = 0, max_results: int = 20) -> str:
    """The model-vs-market signal board: games where the W² line most disagrees
    with the posted betting line. week=0 → all lined games; else a specific week.
    Edges only shown on competitive games (market spread ≤21). This is a
    'where to look' list — the model does NOT reliably beat the closing line."""
    try:
        lines = {g["id"]: g for g in load("lines-2026.json")["games"]}
        games = {g["id"]: g for g in load("games-2026.json")["games"]}
    except Exception:
        return "No betting lines loaded yet. Run fetch_lines.py 2026 (or refresh_data)."
    by = {t["school"]: t for t in teams()}
    fcs = load("power-index-2026.json")["fcsPoolRating"]
    b, hf = cal()
    rows = []
    for gid, L in lines.items():
        g = games.get(gid)
        if not g or L.get("marketSpread") is None:
            continue
        if week and g["week"] != week:
            continue
        rh = by.get(g["homeTeam"], {}).get("rating", fcs)
        ra = by.get(g["awayTeam"], {}).get("rating", fcs)
        model_home = b * (rh - ra) + hf * (0 if g["neutralSite"] else 1)
        mkt_home = -L["marketSpread"]
        if abs(mkt_home) > 21:
            continue
        if (model_home > 0) != (mkt_home > 0) and abs(model_home) >= 10 and abs(mkt_home) >= 10:
            continue
        edge = model_home - mkt_home
        team = g["homeTeam"] if edge >= 0 else g["awayTeam"]
        opp = g["awayTeam"] if edge >= 0 else g["homeTeam"]
        mfav = g["homeTeam"] if mkt_home >= 0 else g["awayTeam"]
        books = [b["book"] for b in L.get("books", [])]
        rows.append((abs(edge), team, opp, mfav, abs(mkt_home), g["week"], books))
    rows.sort(reverse=True)
    rows = rows[:max_results]
    if not rows:
        return "No lined competitive games match. Most lines post closer to kickoff."
    out = [f"Model-vs-market edges ({'wk ' + str(week) if week else 'all lined games'}):",
           "Reminder: 'where to look', not locks — biggest edges cluster on softer G5 markets.", ""]
    for e, team, opp, mfav, mm, wk, books in rows:
        out.append(f"  +{e:4.1f}  model likes {team:<20} vs {opp:<20} "
                   f"(market: {mfav} -{mm:.1f}, wk{wk}, {'/'.join(books)})")
    return "\n".join(out)


@mcp.tool()
def conference_race(conference: str) -> str:
    """Teams in a conference ranked by W² rating — the title-race pecking order."""
    cl = conference.strip().lower()
    ts = [t for t in teams() if cl in (t["conference"] or "").lower()
          or cl == (CONF_ACRO.get(t["conference"], "")).lower()]
    if not ts:
        return f"No conference matches '{conference}'."
    ts.sort(key=lambda t: -t["rating"])
    name = ts[0]["conference"]
    out = [f"{name} — by W² rating:", ""]
    for i, t in enumerate(ts, 1):
        tag = " ★ favorite" if i == 1 else ""
        out.append(f"{i:>2}. {t['school']:<18} {sign(t['rating']):>6} (overall #{t['rank']}){tag}")
    return "\n".join(out)


@mcp.tool()
def team_schedule(team: str) -> str:
    """A team's 2026 schedule with the W² projected spread and win% per game."""
    t = find_team(team)
    if not t:
        return f"No team matches '{team}'."
    school = t["school"]
    games = load("games-2026.json")["games"]
    by = {x["school"]: x for x in teams()}
    fcs = load("power-index-2026.json")["fcsPoolRating"]
    b, hf = cal()
    mine = [g for g in games if school in (g["homeTeam"], g["awayTeam"])]
    mine.sort(key=lambda g: (g["week"] or 0, g.get("date") or ""))
    out = [f"{school} — 2026 schedule (W² projection):", ""]
    exp = 0.0
    for g in mine:
        home = g["homeTeam"] == school
        opp = g["awayTeam"] if home else g["homeTeam"]
        oppr = by.get(opp, {}).get("rating", fcs)
        oppn = f"#{by[opp]['rank']} {opp}" if opp in by else f"{opp} (FCS)"
        sgn = 0 if g["neutralSite"] else (1 if home else -1)
        margin = b * (t["rating"] - oppr) + hf * sgn
        p = win_prob(abs(margin)) if margin >= 0 else 1 - win_prob(abs(margin))
        exp += p
        loc = "vs" if g["neutralSite"] else ("vs" if home else "at")
        out.append(f"  Wk {g['week']:>2}  {loc} {oppn:<22} "
                   f"{school} {'by' if margin>=0 else 'lose by'} {abs(margin):.1f} · {p*100:.0f}%")
    out.append("")
    out.append(f"  Projected wins: {exp:.1f} of {len(mine)}")
    return "\n".join(out)


@mcp.tool()
def sos_watch() -> str:
    """Progressive Strength-of-Schedule decay from the 2025 replay — teams whose
    brutal-looking schedules deflated (or got tougher) than billed. Validates the
    concept before the live 2026 version."""
    try:
        tl = load("timeline-2025.json")
    except Exception:
        return "No timeline built. Run api/build_timeline.py."
    out = ["SOS credibility (2025 replay · 100 = league-avg schedule):", "",
           "Biggest deflators (brutal on paper → soft in reality):"]
    for d in tl["decliners"][:6]:
        out.append(f"  {d['team']:<18} {d['preseasonIndex']:>6} → {d['finalIndex']:<6} ({d['swing']:+})")
    out.append("")
    out.append("Biggest risers (tougher than billed):")
    for d in tl["risers"][:4]:
        out.append(f"  {d['team']:<18} {d['preseasonIndex']:>6} → {d['finalIndex']:<6} ({d['swing']:+})")
    return "\n".join(out)


@mcp.tool()
def methodology() -> str:
    """How the W²-Index and its projections work — the model summary."""
    pi = load("power-index-2026.json")
    b, hf = cal()
    return (
        "The W²-Index (Viva CFP)\n"
        f"  {pi.get('note', '')}\n\n"
        "  Rating = 50% results base (2025 SRS regressed 35% to 2026 conference strength)\n"
        "           + 50% offseason composite (SP+ 35 / returning prod 20 / recruiting 20 /\n"
        "           portal 15 / draft capital 10, standardized z × 9 pts). ESPN poll is\n"
        "           display-only.\n"
        f"  Spreads = calibrated head: margin = rating gap ×{b} {'+' if hf>=0 else ''}{hf} home field\n"
        "            (fit on 2025 to undo the strength-model's blowout compression).\n"
        "  Honesty: backtested on 2025 the model matches the market on margins by midseason\n"
        "           but does NOT beat the closing line — treat edges as 'where to look'.")


@mcp.tool()
def refresh_data() -> str:
    """Re-run the weekly-relevant pipeline: rebuild the index from current data and
    re-pull betting lines. Takes ~30–60s. (For a full source refresh — SP+, portal,
    recruiting — run api/imports/run_all_imports.py + normalize_sources.py first.)"""
    py = sys.executable
    steps = [("rebuild index", [py, str(HERE / "build_power_index.py")]),
             ("pull betting lines", [py, str(HERE / "fetch_lines.py"), "2026"])]
    log = []
    for label, cmd in steps:
        try:
            r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, timeout=180)
            tail = (r.stdout or r.stderr).strip().splitlines()[-1:] or ["(no output)"]
            log.append(f"✓ {label}: {tail[0]}" if r.returncode == 0
                       else f"✗ {label} failed: {(r.stderr or '')[-200:]}")
        except Exception as e:
            log.append(f"✗ {label} errored: {e}")
    return "Refresh complete.\n" + "\n".join(log)


if __name__ == "__main__":
    mcp.run()
