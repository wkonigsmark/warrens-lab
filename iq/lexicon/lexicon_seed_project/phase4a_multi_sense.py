#!/usr/bin/env python3
"""Phase 4 / Batch A — Add second senses for 10 high-value kid words.

Two operation types:
  * APPEND a second sense to an existing entry (same POS)
  * INSERT a new entry with a different POS

Dry-run by default; --apply writes lexicon_seed.json with a backup.
"""
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")
BACKUP_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.pre_phase4a.json")


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


# Map of word -> new sense object to APPEND to existing entry's senses[] array.
# Matches by lowercase word + part_of_speech.
APPEND_SENSES = {
    ("bat", "noun"): sense(
        "A long wooden or metal stick used to hit a ball in baseball, cricket, or similar games.",
        ["sports", "baseball", "equipment"],
        {"sports": 10, "baseball": 10, "equipment": 9},
    ),
    ("fan", "noun"): sense(
        "A person who really likes a sport, team, performer, or activity.",
        ["people", "support", "sports"],
        {"people": 10, "support": 9, "sports": 7},
    ),
    ("iron", "noun"): sense(
        "A heated tool used to press wrinkles out of clothes.",
        ["home", "appliance", "clothing"],
        {"home": 10, "appliance": 10, "clothing": 8},
    ),
    ("jam", "noun"): sense(
        "A traffic backup where cars are stuck and cannot move forward.",
        ["traffic", "transportation", "problem"],
        {"traffic": 10, "transportation": 9, "problem": 7},
    ),
    ("leaf", "noun"): sense(
        "A single page of a book, including the front and back together.",
        ["books", "reading", "paper"],
        {"books": 10, "reading": 9, "paper": 8},
    ),
}

# New stand-alone entries for the different-POS second meanings.
NEW_ENTRIES = [
    E("bark", "verb", "K", 1,
      "To make the loud, sharp sound that a dog or seal makes.",
      ["animals", "sound", "action"],
      {"animals": 10, "sound": 10, "action": 9},
      "Old English", "beorcan", "Old English era",
      "From Old English 'beorcan' meaning to bark, related to other Germanic words for sharp animal cries.",
      synonyms=["yelp", "yap"], antonyms=[],
      families=["Actions", "Sound", "Animals"],
      related=["dog", "yelp", "howl", "growl"]),

    E("kind", "noun", "K", 1,
      "A type or group of something — for example, an apple is a kind of fruit.",
      ["categories", "classification", "learning"],
      {"categories": 10, "classification": 9, "learning": 7},
      "Old English", "gecynd", "Old English era",
      "From Old English 'gecynd' meaning nature or family — the same root as 'kin'. The 'type' sense came from the idea of things sharing a common nature.",
      synonyms=["type", "sort", "variety"], antonyms=[],
      families=["Categories", "Learning"],
      related=["type", "group", "sort", "category"]),

    E("ring", "verb", "K", 1,
      "To make a clear bell-like sound, or to call someone using a phone.",
      ["sound", "communication", "action"],
      {"sound": 10, "communication": 9, "action": 8},
      "Old English", "hringan", "Old English era",
      "From Old English 'hringan' meaning to sound a bell, possibly imitative of the bell's clear tone.",
      synonyms=["chime", "peal", "call"], antonyms=[],
      families=["Actions", "Sound", "Communication"],
      related=["bell", "phone", "chime", "sound"]),

    E("watch", "verb", "preK", 1,
      "To look carefully at someone or something for a stretch of time.",
      ["action", "senses", "observation"],
      {"action": 10, "senses": 9, "observation": 10},
      "Old English", "wæccan", "Old English era",
      "From Old English 'wæccan' meaning to be awake or keep guard, related to 'wake'. The meaning shifted to careful looking over time.",
      synonyms=["observe", "look", "view"], antonyms=["ignore"],
      families=["Actions", "Senses"],
      related=["see", "look", "observe", "guard"]),

    E("wave", "verb", "preK", 1,
      "To move your hand up and down or side to side to say hello or goodbye.",
      ["action", "greeting", "body"],
      {"action": 10, "greeting": 10, "body": 7},
      "Old English", "wafian", "Old English era",
      "From Old English 'wafian' meaning to move to and fro, related to the up-and-down motion of waves on water.",
      synonyms=["gesture", "signal"], antonyms=[],
      families=["Actions", "Greetings"],
      related=["hand", "hello", "goodbye", "greet"]),
]


def main(apply_changes=False):
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        lex = json.load(f)
    before = len(lex)

    # Resolve appends
    appends = []  # (idx, word, pos, new_sense)
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

    # Sanity-check that new POS entries don't already exist with that POS
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
    print("PHASE 4 / BATCH A — MULTI-SENSE EXPANSION")
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
    sense_added = sum(1 for _ in appends)
    print(f"\nLexicon: {before} → {after} entries (+{len(new_to_add)} new; {sense_added} entries gain a 2nd sense)")

    if not apply_changes:
        print(f"\nDry run. Apply with: python3 {os.path.basename(__file__)} --apply")
        return

    # Apply
    print(f"\nBacking up to {os.path.basename(BACKUP_PATH)} …")
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)

    # Append senses
    for idx, _, _, new_sense in appends:
        lex[idx]["senses"].append(new_sense)
    # Add new entries
    lex.extend(new_to_add)

    with open(LEXICON_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(lex)} entries to {os.path.basename(LEXICON_PATH)}")


if __name__ == "__main__":
    main(apply_changes="--apply" in sys.argv)
