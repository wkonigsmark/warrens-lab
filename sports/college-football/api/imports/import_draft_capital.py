#!/usr/bin/env python3
"""NFL draft capital by school, trailing five drafts, via CFBD.

PFR has the same data but scraping sports-reference is discouraged by their
ToS and unnecessary — CFBD's /draft/picks carries college attribution.

Capital metric: sum of (257 − overall pick) across all picks, so a #1 overall
is worth 256 points and a Mr. Irrelevant ~0. Deliberately simple and lossless —
the raw pick list stays in the file so a fancier value curve (Jimmy Johnson,
Massey-Thaler) can be swapped in later without re-pulling.
"""

from collections import defaultdict

from common import cfbd_get, raw_payload, write_raw

YEARS = [2021, 2022, 2023, 2024, 2025]


def main():
    schools = defaultdict(lambda: {"capital": 0, "picks": 0, "firstRounders": 0,
                                   "byYear": {}, "topPicks": []})
    for year in YEARS:
        for p in cfbd_get("/draft/picks", year=year):
            school = p.get("collegeTeam")
            if not school:
                continue
            s = schools[school]
            s["capital"] += max(0, 257 - p["overall"])
            s["picks"] += 1
            s["byYear"][str(year)] = s["byYear"].get(str(year), 0) + 1
            if p["round"] == 1:
                s["firstRounders"] += 1
                s["topPicks"].append(f"{year} #{p['overall']} {p['name']}")

    data = [
        {"team": school, "value": s["capital"], "rank": None,
         "raw": {"picks": s["picks"], "firstRounders": s["firstRounders"],
                 "byYear": s["byYear"], "topPicks": s["topPicks"][:8]}}
        for school, s in schools.items()
    ]
    data.sort(key=lambda d: -d["value"])
    for i, d in enumerate(data, 1):
        d["rank"] = i

    write_raw(
        "draft-capital",
        f"by-school-{YEARS[0]}-{YEARS[-1]}.json",
        raw_payload(
            "NFL draft capital by school (via CFBD)",
            "https://api.collegefootballdata.com/draft/picks",
            YEARS[-1],
            f"Trailing {len(YEARS)} drafts ({YEARS[0]}–{YEARS[-1]}). "
            "capital = Σ (257 − overall pick). Lagging validation signal, not current-season.",
            data,
        ),
    )


if __name__ == "__main__":
    main()
