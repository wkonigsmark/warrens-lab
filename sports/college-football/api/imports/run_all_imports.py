#!/usr/bin/env python3
"""Run every offseason importer, then refresh the pull-status table in
data/README.md between the PULL-STATUS markers."""

import json
import re
from pathlib import Path

import import_draft_capital
import import_recruiting_247
import import_revenue_share
import import_sp_plus
import import_transfer_portal
from common import DATA_DIR, RAW_DIR

START, END = "<!-- PULL-STATUS:START -->", "<!-- PULL-STATUS:END -->"


def update_readme():
    readme = DATA_DIR / "README.md"
    if not readme.exists():
        return
    lines = ["", "| Raw file | Source | Season | Pulled | Rows |",
             "|---|---|---|---|---|"]
    for f in sorted(RAW_DIR.rglob("*.json")):
        d = json.loads(f.read_text())
        lines.append(
            f"| `{f.relative_to(DATA_DIR)}` | {d['source']} | {d['season']} "
            f"| {d['pulledAt']} | {len(d['data'])} |"
        )
    lines.append("")
    text = readme.read_text()
    block = f"{START}\n" + "\n".join(lines) + f"\n{END}"
    text = re.sub(re.escape(START) + r".*?" + re.escape(END), block, text, flags=re.S)
    readme.write_text(text)
    print(f"📝 Pull-status table refreshed in {readme.relative_to(DATA_DIR.parent)}")


def main():
    for mod in (import_recruiting_247, import_transfer_portal, import_draft_capital,
                import_sp_plus, import_revenue_share):
        mod.main()
    update_readme()


if __name__ == "__main__":
    main()
