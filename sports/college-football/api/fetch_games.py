#!/usr/bin/env python3
"""Fetch the CFB schedule/results from collegefootballdata.com and snapshot
it to ../data/games-<year>.json for the static frontend to read.

Usage:
    python3 fetch_games.py [year]        # defaults to 2026

Requires an API key (free at https://collegefootballdata.com/key) in either
the CFBD_API_KEY environment variable or a .env file next to this script:
    CFBD_API_KEY=yourkeyhere
"""

import json
import os
import sys
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"


def load_api_key():
    key = os.environ.get("CFBD_API_KEY")
    if key:
        return key
    env_file = HERE / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line.startswith("CFBD_API_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit("No API key found. Set CFBD_API_KEY or create api/.env (see .env.example).")


def pick(game, camel, snake):
    # CFBD migrated from snake_case to camelCase; accept either
    return game.get(camel, game.get(snake))


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
    api_key = load_api_key()

    response = requests.get(
        "https://api.collegefootballdata.com/games",
        headers={"Authorization": f"Bearer {api_key}"},
        params={"year": year, "seasonType": "regular", "division": "fbs"},
        timeout=30,
    )
    response.raise_for_status()
    if "<html" in response.text[:200].lower():
        sys.exit("Received HTML instead of JSON — check API key or endpoint.")

    games = response.json()

    trimmed = [
        {
            "id": game.get("id"),
            "week": game.get("week"),
            "date": pick(game, "startDate", "start_date"),
            "homeTeam": pick(game, "homeTeam", "home_team"),
            "homeConf": pick(game, "homeConference", "home_conference"),
            "homeClass": pick(game, "homeClassification", "home_classification"),
            "homePoints": pick(game, "homePoints", "home_points"),
            "awayTeam": pick(game, "awayTeam", "away_team"),
            "awayConf": pick(game, "awayConference", "away_conference"),
            "awayClass": pick(game, "awayClassification", "away_classification"),
            "awayPoints": pick(game, "awayPoints", "away_points"),
            "venue": game.get("venue"),
            "neutralSite": pick(game, "neutralSite", "neutral_site"),
            "completed": game.get("completed"),
        }
        for game in games
    ]
    # CFBD's division filter stopped trimming lower divisions (D2/D3 games started
    # appearing) — keep only games with at least one FBS side. Classification is
    # kept on each record so the in-season SRS can pool FCS opponents.
    trimmed = [g for g in trimmed if "fbs" in (g["homeClass"], g["awayClass"])]
    trimmed.sort(key=lambda g: (g["week"] or 0, g["date"] or ""))

    DATA_DIR.mkdir(exist_ok=True)
    out_path = DATA_DIR / f"games-{year}.json"
    out_path.write_text(json.dumps({"year": year, "games": trimmed}, indent=1))
    print(f"✅ Fetched {len(trimmed)} games for {year} → {out_path}")


if __name__ == "__main__":
    main()
