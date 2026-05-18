#!/usr/bin/env python3
"""Dedupe lexicon_seed.json — Phase 1 (true dupes) + Phase 2 (oddballs).

Run with no args for a dry-run report. Pass --apply to write changes.
A backup is written to lexicon_seed.pre_dedupe.json before applying.

Selection rule (which entry wins inside a duplicate group):
  1. Longer definition (more educational content)
  2. Then: lower grade_level (more accessible)
  3. Then: lower difficulty
  4. Then: more tags + richer etymology
  5. Then: earlier index (stable tiebreaker)
"""
import json
import os
import sys
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")
BACKUP_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.pre_dedupe.json")

GRADE_ORDER = ["preK", "K", "1", "2", "3", "4", "5+", "Adult"]


def grade_rank(g):
    try:
        return GRADE_ORDER.index(g)
    except ValueError:
        return len(GRADE_ORDER)


def quality_score(entry):
    """Higher = better. Tuple comparison so each tier breaks the previous tie."""
    defn = entry.get("senses", [{}])[0].get("definition", "") or ""
    tags = entry.get("senses", [{}])[0].get("tags", []) or []
    etym = entry.get("history", {}).get("etymology_note", "") or ""
    return (
        len(defn),                # 1. longer def
        -grade_rank(entry.get("grade_level")),  # 2. lower grade rank (preK=0 best)
        -(entry.get("difficulty") or 5),        # 3. lower difficulty
        len(tags),                # 4. more tags
        len(etym),                # 5. richer etymology
    )


def pick_winner(entries_with_idx):
    """Return (keep, drops) given a list of (idx, entry)."""
    sorted_entries = sorted(
        entries_with_idx,
        key=lambda pair: (quality_score(pair[1]), -pair[0]),
        reverse=True,
    )
    keep = sorted_entries[0]
    drops = sorted_entries[1:]
    return keep, drops


def short_defn(entry, n=85):
    defn = entry.get("senses", [{}])[0].get("definition", "")
    return defn[:n] + ("…" if len(defn) > n else "")


def group_duplicates(lex):
    """Return dict keyed by (word_lower, pos) -> list of (idx, entry).
    Keys with len(values) > 1 are true-duplicate groups."""
    groups = defaultdict(list)
    for i, w in enumerate(lex):
        key = (w["word"].strip().lower(), w.get("part_of_speech", ""))
        groups[key].append((i, w))
    return groups


def reason_for(keep_entry, drop_entry):
    """Explain why keep won over drop."""
    k_def = keep_entry.get("senses", [{}])[0].get("definition", "")
    d_def = drop_entry.get("senses", [{}])[0].get("definition", "")
    if len(k_def) != len(d_def):
        return f"longer definition ({len(k_def)} vs {len(d_def)} chars)"
    if grade_rank(keep_entry.get("grade_level")) != grade_rank(drop_entry.get("grade_level")):
        return f"more accessible grade ({keep_entry.get('grade_level')} vs {drop_entry.get('grade_level')})"
    if keep_entry.get("difficulty") != drop_entry.get("difficulty"):
        return f"lower difficulty ({keep_entry.get('difficulty')} vs {drop_entry.get('difficulty')})"
    k_tags = len(keep_entry.get("senses", [{}])[0].get("tags", []))
    d_tags = len(drop_entry.get("senses", [{}])[0].get("tags", []))
    if k_tags != d_tags:
        return f"more tags ({k_tags} vs {d_tags})"
    k_etym = len(keep_entry.get("history", {}).get("etymology_note", ""))
    d_etym = len(drop_entry.get("history", {}).get("etymology_note", ""))
    if k_etym != d_etym:
        return f"richer etymology ({k_etym} vs {d_etym} chars)"
    return "identical quality — kept earlier entry"


def main(apply_changes=False):
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        lex = json.load(f)

    groups = group_duplicates(lex)
    drop_indices = set()
    notes = []

    # Phase 1: same-word, same-POS duplicates
    print("=" * 78)
    print("PHASE 1 — TRUE DUPLICATES (same word + same POS)")
    print("=" * 78)
    phase1_groups = sorted(
        [(k, v) for k, v in groups.items() if len(v) > 1],
        key=lambda kv: kv[0][0],
    )
    p1_drops = 0
    for (word, pos), entries in phase1_groups:
        keep, drops = pick_winner(entries)
        keep_idx, keep_entry = keep
        print(f"\n  {word} ({pos})")
        print(f"    KEEP [{keep_idx:>4}] grade={keep_entry.get('grade_level'):<5} diff={keep_entry.get('difficulty')}  {short_defn(keep_entry)}")
        for drop_idx, drop_entry in drops:
            print(f"    DROP [{drop_idx:>4}] grade={drop_entry.get('grade_level'):<5} diff={drop_entry.get('difficulty')}  {short_defn(drop_entry)}")
            print(f"           ↳ reason: {reason_for(keep_entry, drop_entry)}")
            drop_indices.add(drop_idx)
            p1_drops += 1

    print(f"\n  Phase 1 total drops: {p1_drops}")

    # Phase 2: oddballs that aren't covered by the same-POS grouping
    print("\n" + "=" * 78)
    print("PHASE 2 — MIXED-POS ODDBALLS (3-entry groups)")
    print("=" * 78)

    # All entries by word (regardless of POS)
    by_word = defaultdict(list)
    for i, w in enumerate(lex):
        by_word[w["word"].strip().lower()].append((i, w))

    # SPROUT: keep the better of the 2 verb entries; keep the noun separately
    sprout_entries = by_word["sprout"]
    sprout_verbs = [(i, e) for i, e in sprout_entries if e.get("part_of_speech") == "verb"]
    sprout_nouns = [(i, e) for i, e in sprout_entries if e.get("part_of_speech") == "noun"]
    print(f"\n  sprout ({len(sprout_entries)} entries):")
    if len(sprout_verbs) > 1:
        keep, drops = pick_winner(sprout_verbs)
        print(f"    KEEP [{keep[0]:>4}] (verb)  {short_defn(keep[1])}")
        for drop_idx, drop_entry in drops:
            print(f"    DROP [{drop_idx:>4}] (verb)  {short_defn(drop_entry)}")
            print(f"           ↳ reason: {reason_for(keep[1], drop_entry)}")
            drop_indices.add(drop_idx)
    for i, e in sprout_nouns:
        print(f"    KEEP [{i:>4}] (noun)  {short_defn(e)}  ← legitimate separate-POS entry")

    # YEARNING: keep the better of the 2 noun entries; keep the adj separately
    yearning_entries = by_word["yearning"]
    yearning_nouns = [(i, e) for i, e in yearning_entries if e.get("part_of_speech") == "noun"]
    yearning_adjs = [(i, e) for i, e in yearning_entries if e.get("part_of_speech") == "adj"]
    print(f"\n  yearning ({len(yearning_entries)} entries):")
    if len(yearning_nouns) > 1:
        keep, drops = pick_winner(yearning_nouns)
        print(f"    KEEP [{keep[0]:>4}] (noun) {short_defn(keep[1])}")
        for drop_idx, drop_entry in drops:
            print(f"    DROP [{drop_idx:>4}] (noun) {short_defn(drop_entry)}")
            print(f"           ↳ reason: {reason_for(keep[1], drop_entry)}")
            drop_indices.add(drop_idx)
    for i, e in yearning_adjs:
        print(f"    KEEP [{i:>4}] (adj)  {short_defn(e)}  ← legitimate separate-POS entry")

    # Note: harvest/row/weed/whisper noun+verb pairs are legitimately separate; no action.
    print("\n  No-op (legitimate noun+verb pairs — kept as-is):")
    for word in ["harvest", "row", "weed", "whisper"]:
        entries = by_word.get(word, [])
        pos_list = sorted({e.get("part_of_speech", "") for _, e in entries})
        print(f"    • {word:<10} ({', '.join(pos_list)})")

    print(f"\n  Phase 2 total drops: {sum(1 for i in drop_indices if i not in {di for word in [k[0] for k in [g[0] for g in phase1_groups]] for di in []})}")

    total_drops = len(drop_indices)
    print("\n" + "=" * 78)
    print(f"SUMMARY")
    print("=" * 78)
    print(f"  Lexicon before: {len(lex)} entries")
    print(f"  Total drops:    {total_drops}")
    print(f"  Lexicon after:  {len(lex) - total_drops} entries")

    if not apply_changes:
        print(f"\n  This was a DRY RUN. To apply, run:")
        print(f"    python3 {os.path.basename(__file__)} --apply")
        return

    # Apply
    print(f"\n  Backing up to {os.path.basename(BACKUP_PATH)} …")
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)
    cleaned = [e for i, e in enumerate(lex) if i not in drop_indices]
    with open(LEXICON_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
    print(f"  Wrote {len(cleaned)} entries to {os.path.basename(LEXICON_PATH)}")


if __name__ == "__main__":
    main(apply_changes="--apply" in sys.argv)
