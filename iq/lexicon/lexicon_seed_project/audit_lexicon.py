#!/usr/bin/env python3
"""Surface dedupe + cleanup candidates in lexicon_seed.json.

Prints four reports:
  1. Exact duplicate words (same `word`, multiple entries)
  2. Adverbs and whether their root word already exists
  3. Definitions with narrow contextual scope (ship/boat/tree/etc.)
  4. Multi-meaning hotspots — words that almost certainly need a 2nd sense
"""
import json
import os
import re
from collections import defaultdict, Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")


def load():
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def report_duplicates(lex):
    groups = defaultdict(list)
    for i, w in enumerate(lex):
        key = w["word"].strip().lower()
        groups[key].append((i, w))
    dups = {k: v for k, v in groups.items() if len(v) > 1}
    print(f"\n=== 1. DUPLICATES ({len(dups)} words) ===")
    for word in sorted(dups):
        entries = dups[word]
        print(f"\n• {word}  ({len(entries)} entries)")
        for idx, w in entries:
            defn = w.get("senses", [{}])[0].get("definition", "")
            pos = w.get("part_of_speech", "")
            grade = w.get("grade_level", "")
            print(f"    [{idx}] ({pos}, {grade}) {defn[:90]}")


def report_adverbs(lex):
    by_word = {w["word"].strip().lower(): w for w in lex}
    advs = [w for w in lex if w.get("part_of_speech") == "adv"]
    print(f"\n=== 2. ADVERBS ({len(advs)} entries) ===")
    has_root, no_root = [], []
    for w in advs:
        word = w["word"].lower()
        # Common adverb endings -> guess root
        candidates = []
        if word.endswith("ly"):
            candidates.append(word[:-2])        # quickly -> quick
            candidates.append(word[:-2] + "e")  # truly -> true
            candidates.append(word[:-3] + "y")  # easily -> easy (drop ily, add y)
        if word.endswith("ily"):
            candidates.append(word[:-3] + "y")
        root_match = next((c for c in candidates if c in by_word), None)
        if root_match:
            has_root.append((word, root_match))
        else:
            no_root.append(word)
    print(f"\n  -- {len(has_root)} adverbs whose root word already exists (safe to delete) --")
    for adv, root in sorted(has_root):
        print(f"    • {adv:<20} -> root '{root}' present")
    print(f"\n  -- {len(no_root)} adverbs without an existing root --")
    for adv in sorted(no_root):
        defn = by_word[adv].get("senses", [{}])[0].get("definition", "")
        print(f"    • {adv:<20} {defn[:80]}")


CONTEXT_PATTERNS = [
    ("nautical", r"\b(ship|boat|sea|sail|mast|deck|rudder|hull|harbor|anchor|port|starboard)s?\b"),
    ("garden",   r"\b(garden|crop|harvest|plant|sow|till|seed|seedling|mulch)s?\b"),
    ("farm",     r"\b(farm|crop|barn|livestock|pasture|tractor)s?\b"),
    ("math",     r"\b(equation|formula|number line|coefficient|integer|polynomial)s?\b"),
    ("body",     r"\b(arm|leg|knee|elbow|wrist|jaw|hip|shoulder|toe|finger)s?\b"),
]


def report_narrow(lex):
    print("\n=== 3. POSSIBLY-NARROW DEFINITIONS ===")
    print("(Words whose first sense pins them to a single context. Candidates for a broader rewrite or a 2nd sense.)")
    suspects_by_ctx = defaultdict(list)
    for w in lex:
        defn = w.get("senses", [{}])[0].get("definition", "")
        if not defn:
            continue
        word_lower = w["word"].lower()
        for ctx, pat in CONTEXT_PATTERNS:
            # Skip words that ARE the domain (e.g. don't flag "ship" for nautical context)
            if word_lower in pat:
                continue
            if re.search(pat, defn, flags=re.IGNORECASE):
                suspects_by_ctx[ctx].append((word_lower, w.get("part_of_speech", ""), defn))
                break
    for ctx, suspects in suspects_by_ctx.items():
        print(f"\n  -- {ctx} ({len(suspects)} suspects) --")
        for word, pos, defn in sorted(suspects):
            print(f"    • {word:<14} ({pos:<5}) {defn[:100]}")


# Known polysemous words a kid would learn early — almost always need 2 senses.
MULTI_MEANING = [
    "bark", "deck", "fan", "ring", "hand", "duck", "bat", "bear", "bow",
    "tie", "watch", "wave", "fly", "spring", "fall", "leaf", "rock", "saw",
    "trunk", "trip", "match", "play", "park", "kind", "light", "right",
    "left", "mean", "stick", "ball", "bowl", "box", "bridge", "club",
    "crown", "drop", "fire", "foot", "head", "iron", "jam", "lap", "mine",
    "nail", "note", "pen", "plot", "point", "pool", "race", "rose", "sound",
    "star", "stamp", "tear", "top", "well", "wind", "yard",
]


def report_multi_meaning(lex):
    by_word = defaultdict(list)
    for i, w in enumerate(lex):
        by_word[w["word"].strip().lower()].append((i, w))
    print(f"\n=== 4. MULTI-MEANING HOTSPOTS ===")
    print("(Common words that usually need 2 senses. Showing current definition so you can spot gaps.)")
    present = []
    for w in MULTI_MEANING:
        if w in by_word:
            for idx, entry in by_word[w]:
                defn = entry.get("senses", [{}])[0].get("definition", "")
                pos = entry.get("part_of_speech", "")
                sense_count = len(entry.get("senses", []))
                present.append((w, idx, pos, sense_count, defn))
    for word, idx, pos, sense_count, defn in sorted(present):
        flag = "✓" if sense_count > 1 else "⚠"
        print(f"  {flag} {word:<10} [{idx}] ({pos}, {sense_count} sense{'s' if sense_count != 1 else ''}) {defn[:90]}")


def main():
    lex = load()
    print(f"Lexicon: {len(lex)} entries\n" + "=" * 60)
    report_duplicates(lex)
    report_adverbs(lex)
    report_narrow(lex)
    report_multi_meaning(lex)


if __name__ == "__main__":
    main()
