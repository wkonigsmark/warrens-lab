#!/usr/bin/env python3
"""Phase 4 / Batch B — Add second senses for 10 more multi-meaning kid words.

Same dual-operation pattern as Batch A.
"""
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")
BACKUP_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.pre_phase4b.json")


def sense(definition, tags, relevance):
    return {"definition": definition, "tags": tags, "relevance": relevance}


def E(word, pos, grade, diff, defn, tags, relevance,
      root_lang, root_word, emergence, etym,
      synonyms=None, antonyms=None, families=None, related=None):
    return {
        "word": word,
        "part_of_speech": pos,
        "grade_level": grade,
        "difficulty": diff,
        "senses": [{"definition": defn, "tags": tags, "relevance": relevance}],
        "history": {
            "root_language": root_lang,
            "root_word": root_word,
            "emergence": emergence,
            "etymology_note": etym,
        },
        "associations": {
            "synonyms": synonyms or [],
            "antonyms": antonyms or [],
            "families": families or [],
            "related_concepts": related or [],
        },
    }


APPEND_SENSES = {
    ("crown", "noun"): sense(
        "The top of the head, or the highest part of something like a tree or hill.",
        ["body", "top", "position"],
        {"body": 9, "top": 10, "position": 8},
    ),
    ("plot", "noun"): sense(
        "The main story of a book, movie, or play.",
        ["books", "stories", "writing"],
        {"books": 10, "stories": 10, "writing": 8},
    ),
    ("star", "noun"): sense(
        "A famous person known for their talent, like in movies, music, or sports.",
        ["people", "fame", "entertainment"],
        {"people": 10, "fame": 10, "entertainment": 9},
    ),
    ("trunk", "noun"): sense(
        "The long nose of an elephant, used for breathing, smelling, and grabbing things.",
        ["animals", "body", "mammals"],
        {"animals": 10, "body": 9, "mammals": 9},
    ),
    ("pen", "noun"): sense(
        "A fenced or walled area where farm animals are kept.",
        ["farm", "animals", "enclosure"],
        {"farm": 10, "animals": 9, "enclosure": 10},
    ),
    ("hand", "noun"): sense(
        "One of the pointers on a clock or watch that show the time.",
        ["time", "clock", "objects"],
        {"time": 10, "clock": 10, "objects": 7},
    ),
}

NEW_ENTRIES = [
    E("duck", "verb", "1", 2,
      "To quickly lower your head or body to avoid being hit by something.",
      ["action", "movement", "safety"],
      {"action": 10, "movement": 9, "safety": 8},
      "Middle English", "douken", "13th Century",
      "From Middle English 'douken' meaning to dive or plunge under, related to the diving behavior of the bird. The verb came first; the bird was named for what it does.",
      synonyms=["dodge", "dip"], antonyms=["rise", "raise"],
      families=["Actions", "Movement"],
      related=["dodge", "dive", "avoid", "bend"]),

    E("light", "adj", "K", 1,
      "Not heavy; easy to lift or carry.",
      ["weight", "physical", "senses"],
      {"weight": 10, "physical": 9, "senses": 7},
      "Old English", "līht", "Old English era",
      "From Old English 'līht' meaning not heavy — a different word from 'lēoht' (illumination), though both became 'light' in modern English.",
      synonyms=["weightless", "feathery"], antonyms=["heavy", "weighty"],
      families=["Weight", "Senses"],
      related=["heavy", "lift", "carry", "feather"]),

    E("play", "noun", "1", 2,
      "A story that actors perform on a stage in front of an audience.",
      ["theater", "entertainment", "story"],
      {"theater": 10, "entertainment": 10, "story": 9},
      "Old English", "plega", "Old English era",
      "From Old English 'plega' meaning game or sport. The theater sense developed in late Middle English as performances became a form of public play.",
      synonyms=["drama", "show"], antonyms=[],
      families=["Theater", "Entertainment"],
      related=["actor", "stage", "drama", "show"]),

    E("rock", "verb", "K", 1,
      "To move gently back and forth, like a baby in a cradle.",
      ["action", "movement", "gentle"],
      {"action": 10, "movement": 10, "gentle": 9},
      "Old English", "roccian", "Old English era",
      "From Old English 'roccian' meaning to move a cradle to and fro. A different origin from 'rock' (stone), which came from Old French.",
      synonyms=["sway", "cradle", "rock"], antonyms=["still", "stop"],
      families=["Actions", "Movement"],
      related=["sway", "cradle", "baby", "rhythm"]),
]


def main(apply_changes=False):
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        lex = json.load(f)
    before = len(lex)

    appends = []
    for (word, pos), new_sense in APPEND_SENSES.items():
        idx = next(
            (i for i, w in enumerate(lex)
             if w["word"].lower() == word and w.get("part_of_speech") == pos),
            None,
        )
        if idx is None:
            print(f"  WARNING: target {word}/{pos} not found in lexicon — skipping")
            continue
        appends.append((idx, word, pos, new_sense))

    new_to_add = []
    for entry in NEW_ENTRIES:
        clash = next(
            (i for i, w in enumerate(lex)
             if w["word"].lower() == entry["word"].lower()
             and w.get("part_of_speech") == entry["part_of_speech"]),
            None,
        )
        if clash is not None:
            print(f"  WARNING: {entry['word']}/{entry['part_of_speech']} already exists at idx {clash} — skipping")
            continue
        new_to_add.append(entry)

    print("=" * 70)
    print("PHASE 4 / BATCH B — MULTI-SENSE EXPANSION")
    print("=" * 70)
    print(f"\nAppending senses to existing entries ({len(appends)}):")
    for idx, word, pos, new_sense in appends:
        existing_def = lex[idx]["senses"][0]["definition"]
        print(f"  • {word} ({pos}) [idx {idx}]")
        print(f"      existing: {existing_def[:75]}")
        print(f"      + new:    {new_sense['definition'][:75]}")

    print(f"\nAdding new POS entries ({len(new_to_add)}):")
    for entry in new_to_add:
        print(f"  + {entry['word']} ({entry['part_of_speech']}, {entry['grade_level']}, diff {entry['difficulty']})")
        print(f"      {entry['senses'][0]['definition']}")

    after = before + len(new_to_add)
    print(f"\nLexicon: {before} → {after} entries (+{len(new_to_add)} new; {len(appends)} entries gain a 2nd sense)")

    if not apply_changes:
        print(f"\nDry run. Apply with: python3 {os.path.basename(__file__)} --apply")
        return

    print(f"\nBacking up to {os.path.basename(BACKUP_PATH)} …")
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)
    for idx, _, _, new_sense in appends:
        lex[idx]["senses"].append(new_sense)
    lex.extend(new_to_add)
    with open(LEXICON_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(lex)} entries to {os.path.basename(LEXICON_PATH)}")


if __name__ == "__main__":
    main(apply_changes="--apply" in sys.argv)
