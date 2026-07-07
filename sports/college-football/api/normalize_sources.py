#!/usr/bin/env python3
"""Normalize the raw offseason sources into data/normalized/*.json.

Per the Phase 1 spec:
  - every team name is reconciled to the canonical school key from
    teams-db.json (aliases handled; unmatched names are reported, never
    silently dropped without a note)
  - a z-score and percentile are computed per team WITHIN each source, as a
    display convenience only — sources stay separate, nothing is combined
  - the original raw value is preserved next to the normalized one

Source file preference order supports manual overrides: drop a
manual-2026.json (same raw envelope) next to a source's raw file and it wins.

Output shape per source:
  { source, sourceFile, season, generatedAt, stat,
    teams: [{team, value, zscore, percentile, rank}], unmatched: [...] }
"""

import json
import statistics
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"
RAW = DATA_DIR / "raw"
OUT = DATA_DIR / "normalized"

# candidate raw files per normalized output, first match wins
SOURCES = {
    "recruiting-247": {
        "stat": "247 Composite class points",
        "files": ["recruiting-247/manual-2026.json", "recruiting-247/2026.json",
                  "recruiting-247/2025.json"],
    },
    "transfer-portal": {
        "stat": "portal net talent (gained − lost)",
        "files": ["transfer-portal/manual-2026.json", "transfer-portal/2026.json"],
    },
    "draft-capital": {
        "stat": "draft capital, 2021–2025 (Σ 257 − pick)",
        "files": ["draft-capital/by-school-2021-2025.json"],
    },
    "sp-plus": {
        "stat": "SP+ overall rating",
        "files": ["sp-plus/manual-2026.json", "sp-plus/ratings-2026.json",
                  "sp-plus/ratings-2025.json"],
    },
    "returning-production": {
        "stat": "share of prior-season production returning",
        "files": ["sp-plus/manual-returning-2026.json", "sp-plus/returning-2026.json",
                  "sp-plus/returning-2025.json"],
    },
}

# names that differ across sources and aren't in teams-db aliases
EXTRA_ALIASES = {
    "Mississippi": "Ole Miss",
    "Southern California": "USC",
    "Miami (FL)": "Miami",
    "NC State": "NC State",
    "Connecticut": "UConn",
    "Hawaii": "Hawai'i",
    "San Jose State": "San José State",
    "UL Monroe": "UL Monroe",
    "Louisiana-Monroe": "UL Monroe",
    "Appalachian St.": "App State",
    "Appalachian State": "App State",
}


def build_resolver():
    db = json.loads((DATA_DIR / "teams-db.json").read_text())["teams"]
    fbs = {t["school"] for t in db if t["classification"] == "fbs"}
    lookup = {}
    for t in db:
        if t["classification"] != "fbs":
            continue
        lookup[t["school"].lower()] = t["school"]
        for a in t["aliases"]:
            lookup.setdefault(a.lower(), t["school"])
    for alias, school in EXTRA_ALIASES.items():
        lookup[alias.lower()] = school

    def resolve(name):
        return lookup.get(name.strip().lower())

    return resolve, fbs


def normalize_source(key, cfg, resolve):
    raw_file = next((RAW / f for f in cfg["files"] if (RAW / f).exists()), None)
    if raw_file is None:
        print(f"⚠️  {key}: no raw file found — skipped")
        return

    payload = json.loads(raw_file.read_text())
    matched, unmatched = {}, []
    for row in payload["data"]:
        if row["team"] == "__ALL__" or row["value"] is None:
            continue
        school = resolve(row["team"])
        if school:
            matched[school] = row  # later duplicates overwrite; sources are per-team
        else:
            unmatched.append(row["team"])

    values = [r["value"] for r in matched.values()]
    mean = statistics.fmean(values)
    stdev = statistics.stdev(values) if len(values) > 1 else 1.0
    ordered = sorted(matched.items(), key=lambda kv: -kv[1]["value"])
    n = len(ordered)

    teams = [
        {
            "team": school,
            "value": row["value"],
            "zscore": round((row["value"] - mean) / stdev, 2),
            "percentile": round(100 * (n - i - 0.5) / n, 1),
            "rank": i + 1,
        }
        for i, (school, row) in enumerate(ordered)
    ]

    out = {
        "source": payload["source"],
        "sourceFile": str(raw_file.relative_to(DATA_DIR)),
        "season": payload["season"],
        "generatedAt": date.today().isoformat(),
        "stat": cfg["stat"],
        "notes": payload["notes"],
        "teams": teams,
        "unmatched": sorted(set(unmatched)),
    }
    OUT.mkdir(exist_ok=True)
    (OUT / f"{key}.json").write_text(json.dumps(out, indent=1))
    tail = f", {len(set(unmatched))} unmatched non-FBS/unknown" if unmatched else ""
    print(f"✅ {key}: {n} FBS teams normalized (season {payload['season']}){tail}")


def main():
    resolve, _ = build_resolver()
    for key, cfg in SOURCES.items():
        normalize_source(key, cfg, resolve)
    # revenue share: constant passthrough, no z-scores
    src = RAW / "revenue-share" / "2026.json"
    if src.exists():
        (OUT / "revenue-share.json").write_text(src.read_text())
        print("✅ revenue-share: constant copied through (no normalization)")


if __name__ == "__main__":
    main()
