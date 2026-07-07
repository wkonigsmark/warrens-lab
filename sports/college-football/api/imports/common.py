"""Shared helpers for the offseason data importers.

Every raw file follows the same envelope so downstream tooling never has to
special-case a source:
    { source, url, pulledAt, season, notes, data: [{team, value, rank, raw}] }
"""

import json
import sys
from datetime import date
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent      # api/imports
API_DIR = HERE.parent                        # api
DATA_DIR = API_DIR.parent / "data"
RAW_DIR = DATA_DIR / "raw"

sys.path.insert(0, str(API_DIR))
from fetch_games import load_api_key        # noqa: E402


def cfbd_get(path, **params):
    r = requests.get(
        "https://api.collegefootballdata.com" + path,
        headers={"Authorization": f"Bearer {load_api_key()}"},
        params=params,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def raw_payload(source, url, season, notes, data):
    return {
        "source": source,
        "url": url,
        "pulledAt": date.today().isoformat(),
        "season": season,
        "notes": notes,
        "data": data,
    }


def write_raw(subdir, filename, payload):
    out = RAW_DIR / subdir / filename
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=1))
    print(f"✅ {payload['source']}: {len(payload['data'])} rows (season {payload['season']}) → {out.relative_to(DATA_DIR.parent)}")
    return out
