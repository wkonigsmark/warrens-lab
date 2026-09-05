#!/usr/bin/env python3
"""One command for the weekly discipline. Run once week W's games are final:

    python3 weekly_update.py <W>

  1. fetch fresh scores             fetch_games.py 2026
  2. grade week W                   ledger.py grade W        ← vs the frozen pre-kickoff snapshot
  3. onboard W's results            build_power_index.py     (in-season blend into the frozen prior)
  4. pull next week's lines         fetch_lines.py 2026
  5. freeze week W+1                ledger.py snapshot W+1   (skips if already frozen)

Order matters: grade BEFORE the index moves, snapshot AFTER the new lines land.
Safe to re-run — grading is idempotent and a frozen week is never overwritten.
"""

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PY = sys.executable


def run(label, *args):
    print(f"\n▶ {label}")
    r = subprocess.run([PY, *args], cwd=HERE)
    if r.returncode:
        sys.exit(f"✗ {label} failed — stopping so nothing downstream runs on bad data.")


def main():
    if len(sys.argv) < 2 or not sys.argv[1].isdigit():
        sys.exit(__doc__)
    w = int(sys.argv[1])
    run("1/5 fetch fresh scores", "fetch_games.py", "2026")
    run(f"2/5 grade week {w} against its frozen snapshot", "ledger.py", "grade", str(w))
    run("3/5 onboard results into the index", "build_power_index.py")
    run("4/5 pull the latest betting lines", "fetch_lines.py", "2026")
    run(f"5/5 freeze week {w + 1}", "ledger.py", "snapshot", str(w + 1))
    print(f"\n🏁 Week {w} closed, week {w + 1} frozen. Ledger + index are current.")


if __name__ == "__main__":
    main()
