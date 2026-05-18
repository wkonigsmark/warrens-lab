#!/usr/bin/env python3
"""Phase 3 — Adverb cleanup.

1. Delete 18 adverb entries (7 with existing roots + 11 reviewed).
2. Add 10 new root-adjective entries (the missing roots for the 11 reviewed).
   'gentle' already exists in the lexicon — no new entry needed.

Dry-run by default. Pass --apply to write. Backup written to
lexicon_seed.pre_phase3.json.
"""
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")
BACKUP_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.pre_phase3.json")

# Every adverb in the lexicon being removed in this phase.
ADVERBS_TO_DELETE = {
    # 7 with existing roots
    "calmly", "doggedly", "kindly", "safely", "softly", "steadily", "wisely",
    # 11 reviewed
    "cleanly", "deftly", "deliberately", "eventually", "frequently", "gently",
    "gradually", "neatly", "precisely", "reluctantly", "unerringly",
}


def E(word, pos, grade, diff, defn, tags, root_lang, root_word, emergence,
      etym, synonyms=None, antonyms=None, families=None, related=None):
    return {
        "word": word,
        "part_of_speech": pos,
        "grade_level": grade,
        "difficulty": diff,
        "senses": [{
            "definition": defn,
            "tags": list(tags.keys()),
            "relevance": dict(tags),
        }],
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


NEW_ROOTS = [
    E("clean", "adj", "K", 1,
      "Free from dirt, marks, or stains.",
      {"hygiene": 10, "order": 8, "appearance": 7},
      "Old English", "clǣne", "Old English era",
      "From Old English 'clǣne' meaning pure or unmixed, a core Germanic adjective for the absence of dirt.",
      synonyms=["spotless", "pure", "tidy"], antonyms=["dirty", "messy"],
      families=["Hygiene", "Order"], related=["wash", "soap", "tidy", "neat"]),

    E("deft", "adj", "Adult", 4,
      "Skillful and quick in movement or action.",
      {"skill": 10, "ability": 9, "movement": 7},
      "Middle English", "defte", "13th Century",
      "From Middle English 'defte' meaning gentle or skillful, a doublet of 'daft' that diverged in meaning over time.",
      synonyms=["skillful", "nimble", "adroit"], antonyms=["clumsy", "awkward"],
      families=["Skill", "Ability"], related=["skill", "agile", "graceful", "expert"]),

    E("deliberate", "adj", "Adult", 4,
      "Done on purpose, with careful thought.",
      {"intention": 10, "thinking": 9, "behavior": 8},
      "Latin", "deliberatus", "15th Century",
      "From Latin 'deliberatus', past participle of 'deliberare' (to weigh carefully), from 'de-' + 'librare' (to balance).",
      synonyms=["intentional", "planned", "purposeful"], antonyms=["accidental", "careless"],
      families=["Intention", "Behavior"], related=["intent", "purposeful", "careful", "plan"]),

    E("eventual", "adj", "5+", 3,
      "Happening at the end of a process or after some time.",
      {"time": 10, "outcome": 9, "process": 7},
      "Latin", "eventus", "16th Century",
      "From Latin 'eventus' meaning outcome or result, from 'evenire' (to come out).",
      synonyms=["final", "ultimate", "ensuing"], antonyms=["immediate", "initial"],
      families=["Time", "Outcome"], related=["end", "future", "result", "outcome"]),

    E("frequent", "adj", "4", 3,
      "Happening often or many times.",
      {"time": 9, "repetition": 10, "behavior": 7},
      "Latin", "frequens", "15th Century",
      "From Latin 'frequens' meaning crowded or repeated, used to describe things that recur often.",
      synonyms=["common", "recurring", "regular"], antonyms=["rare", "occasional", "infrequent"],
      families=["Time", "Repetition"], related=["often", "regular", "repeat", "common"]),

    E("gradual", "adj", "5+", 3,
      "Happening slowly and little by little, not all at once.",
      {"time": 10, "change": 9, "process": 8},
      "Latin", "gradualis", "16th Century",
      "From Medieval Latin 'gradualis', from Latin 'gradus' meaning step. Things that happen step by step.",
      synonyms=["slow", "steady", "incremental"], antonyms=["sudden", "abrupt", "immediate"],
      families=["Time", "Change"], related=["slow", "step", "process", "change"]),

    E("neat", "adj", "K", 1,
      "Tidy and well-organized.",
      {"order": 10, "appearance": 9, "hygiene": 7},
      "Latin", "nitidus", "16th Century",
      "From Latin 'nitidus' meaning shining or polished, through Old French 'net' meaning clean.",
      synonyms=["tidy", "orderly", "clean"], antonyms=["messy", "sloppy", "untidy"],
      families=["Order", "Appearance"], related=["tidy", "clean", "organized", "orderly"]),

    E("precise", "adj", "5+", 3,
      "Exact and accurate; carefully detailed.",
      {"accuracy": 10, "knowledge": 8, "detail": 9},
      "Latin", "praecisus", "16th Century",
      "From Latin 'praecisus' meaning cut short or sharply defined, from 'praecidere' (to cut off in front).",
      synonyms=["exact", "accurate", "specific"], antonyms=["vague", "approximate", "rough"],
      families=["Accuracy", "Knowledge"], related=["exact", "accurate", "careful", "detail"]),

    E("reluctant", "adj", "5+", 3,
      "Unwilling, or doing something only hesitantly.",
      {"emotion": 9, "behavior": 10, "willingness": 10},
      "Latin", "reluctans", "17th Century",
      "From Latin 'reluctans', present participle of 'reluctari' meaning to struggle against.",
      synonyms=["hesitant", "unwilling", "loath"], antonyms=["eager", "willing", "ready"],
      families=["Emotions", "Behavior"], related=["hesitant", "unwilling", "doubt", "shy"]),

    E("unerring", "adj", "Adult", 5,
      "Always accurate; never making mistakes.",
      {"accuracy": 10, "skill": 9, "perfection": 8},
      "English", "unerring", "17th Century",
      "From English negation 'un-' + 'erring', the present participle of 'err' (to wander or stray), from Latin 'errare'.",
      synonyms=["accurate", "infallible", "precise"], antonyms=["mistaken", "fallible", "inaccurate"],
      families=["Accuracy", "Skill"], related=["accurate", "perfect", "exact", "skill"]),
]


def main(apply_changes=False):
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        lex = json.load(f)
    before = len(lex)

    # Find adverbs to delete (case-insensitive)
    to_delete = []
    for i, w in enumerate(lex):
        if w["word"].strip().lower() in ADVERBS_TO_DELETE and w.get("part_of_speech") == "adv":
            to_delete.append((i, w["word"]))

    # Sanity: make sure each new root doesn't already exist
    existing = {w["word"].strip().lower() for w in lex}
    new_to_add = []
    skipped_existing = []
    for entry in NEW_ROOTS:
        if entry["word"].lower() in existing:
            skipped_existing.append(entry["word"])
        else:
            new_to_add.append(entry)

    print("=" * 70)
    print("PHASE 3 — ADVERB CLEANUP")
    print("=" * 70)
    print(f"\nAdverbs to delete ({len(to_delete)}):")
    for idx, word in to_delete:
        print(f"  [{idx:>4}] {word}")
    print(f"\nNew root adjectives to add ({len(new_to_add)}):")
    for entry in new_to_add:
        print(f"  + {entry['word']:<14} ({entry['grade_level']}, diff {entry['difficulty']}) {entry['senses'][0]['definition']}")
    if skipped_existing:
        print(f"\nSkipped (already in lexicon): {skipped_existing}")

    after = before - len(to_delete) + len(new_to_add)
    print(f"\nBefore: {before} | Deletes: {len(to_delete)} | Adds: {len(new_to_add)} | After: {after}")

    if not apply_changes:
        print(f"\nDry run. Apply with: python3 {os.path.basename(__file__)} --apply")
        return

    # Apply
    print(f"\nBacking up to {os.path.basename(BACKUP_PATH)} …")
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)

    drop_set = {i for i, _ in to_delete}
    cleaned = [e for i, e in enumerate(lex) if i not in drop_set]
    cleaned.extend(new_to_add)
    with open(LEXICON_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(cleaned)} entries to {os.path.basename(LEXICON_PATH)}")


if __name__ == "__main__":
    main(apply_changes="--apply" in sys.argv)
