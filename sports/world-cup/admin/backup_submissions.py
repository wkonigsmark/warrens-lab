#!/usr/bin/env python3
import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from admin_server import supabase_request


ROOT = Path(__file__).resolve().parent
BACKUP_ROOT = ROOT / "backups"
EXPECTED_GROUP_PICKS = 48
EXPECTED_THIRD_PICKS = 8
PAGE_SIZE = 1000


def write_json(path, payload):
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n")


def write_csv(path, rows):
    if not rows:
        path.write_text("")
        return
    headers = list(rows[0].keys())
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fetch_all(table, order):
    rows = []
    offset = 0
    while True:
        page = supabase_request(
            f"{table}?select=*&order={order}&limit={PAGE_SIZE}&offset={offset}"
        ) or []
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            return rows
        offset += PAGE_SIZE


def main():
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_dir = BACKUP_ROOT / timestamp
    backup_dir.mkdir(parents=True, exist_ok=False)

    entries = fetch_all("pool_entries", "submitted_at.asc")
    picks = fetch_all(
        "pool_entry_picks",
        "entry_id.asc,section.asc,group_letter.asc,rank.asc",
    )

    picks_by_entry = {}
    for pick in picks:
        picks_by_entry.setdefault(pick["entry_id"], []).append(pick)

    complete_entries = []
    flattened_picks = []
    validation = []

    for entry in entries:
        entry_picks = picks_by_entry.get(entry["id"], [])
        group_picks = [pick for pick in entry_picks if pick["section"] == "group_order"]
        third_picks = [pick for pick in entry_picks if pick["section"] == "third_place_order"]
        payload = entry.get("payload") or {}
        goals = (payload.get("tiebreakers") or {}).get("totalGroupGoals")

        issues = []
        if len(group_picks) != EXPECTED_GROUP_PICKS:
            issues.append(f"expected 48 group picks, found {len(group_picks)}")
        if len(third_picks) != EXPECTED_THIRD_PICKS:
            issues.append(f"expected 8 third-place picks, found {len(third_picks)}")
        if not isinstance(goals, (int, float)):
            issues.append("missing total-group-goals tiebreaker")

        complete_entries.append({
            **entry,
            "total_group_goals_tiebreaker": goals,
            "normalized_picks": entry_picks,
        })
        validation.append({
            "entry_id": entry["id"],
            "entry_code": entry["entry_code"],
            "bracket_name": entry["bracket_name"],
            "group_pick_count": len(group_picks),
            "third_pick_count": len(third_picks),
            "total_group_goals_tiebreaker": goals,
            "valid": not issues,
            "issues": "; ".join(issues),
        })

        for pick in entry_picks:
            flattened_picks.append({
                "entry_id": entry["id"],
                "entry_code": entry["entry_code"],
                "bracket_name": entry["bracket_name"],
                "email": entry["email"],
                "venmo": entry["venmo"],
                "status": entry["status"],
                "paid": entry["paid"],
                "test_entry": entry["test_entry"],
                "voided": entry["voided"],
                "submitted_at": entry["submitted_at"],
                "total_group_goals_tiebreaker": goals,
                **pick,
            })

    entry_ids = {entry["id"] for entry in entries}
    orphan_pick_count = sum(1 for pick in picks if pick["entry_id"] not in entry_ids)
    invalid_entries = [row for row in validation if not row["valid"]]

    files = {
        "pool-entries.json": entries,
        "pool-picks.json": picks,
        "complete-entries.json": complete_entries,
    }
    for filename, payload in files.items():
        write_json(backup_dir / filename, payload)

    entry_csv_rows = []
    for entry in entries:
        payload = entry.get("payload") or {}
        entry_csv_rows.append({
            **{key: value for key, value in entry.items() if key != "payload"},
            "total_group_goals_tiebreaker": (
                (payload.get("tiebreakers") or {}).get("totalGroupGoals")
            ),
            "payload": json.dumps(payload, separators=(",", ":"), ensure_ascii=True),
        })

    write_csv(backup_dir / "pool-entries.csv", entry_csv_rows)
    write_csv(backup_dir / "complete-picks.csv", flattened_picks)
    write_csv(backup_dir / "validation-report.csv", validation)

    generated_files = sorted(path for path in backup_dir.iterdir() if path.is_file())
    manifest = {
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "entry_count": len(entries),
        "pick_count": len(picks),
        "valid_entry_count": len(entries) - len(invalid_entries),
        "invalid_entry_count": len(invalid_entries),
        "orphan_pick_count": orphan_pick_count,
        "files": {
            path.name: {
                "bytes": path.stat().st_size,
                "sha256": checksum(path),
            }
            for path in generated_files
        },
    }
    write_json(backup_dir / "manifest.json", manifest)

    print(f"Backup created: {backup_dir}")
    print(f"Entries: {len(entries)}")
    print(f"Picks: {len(picks)}")
    print(f"Validation issues: {len(invalid_entries)}")
    print(f"Orphan picks: {orphan_pick_count}")
    if invalid_entries:
        print("Review validation-report.csv before locking submissions.")


if __name__ == "__main__":
    main()
