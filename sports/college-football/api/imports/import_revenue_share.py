#!/usr/bin/env python3
"""Revenue-sharing cap context — a single constant, stored for later use as a
possible normalizing denominator. No import needed; this just writes the file
so the source is documented alongside the others."""

from common import raw_payload, write_raw

SEASON = 2026


def main():
    write_raw(
        "revenue-share",
        f"{SEASON}.json",
        raw_payload(
            "House settlement revenue-sharing cap",
            "https://www.ncaa.org/news/2025/6/6/house-settlement.aspx",
            SEASON,
            "Aggregate per-school cap from the House v. NCAA settlement. "
            "Year 1 (2025-26): $20.5M; escalates ~4%/yr, so 2026-27 ≈ $21.3M. "
            "Single constant, not per-team. Stored as a potential normalizing "
            "denominator for a future spend/talent signal.",
            [
                {"team": "__ALL__", "value": 20_500_000, "rank": None,
                 "raw": {"capYear": "2025-26", "escalatorPct": 4,
                         "projected2026_27": 21_320_000}},
            ],
        ),
    )


if __name__ == "__main__":
    main()
