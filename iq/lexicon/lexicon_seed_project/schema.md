# Lexicon Engine Data Schema v2.0 (Relational Graph Model)

Each entry is a node designed for semantic discovery and etymological tracking.

## 🏗 Schema Definition

### 1. Root Identity
- `word`: string (Unique identifier)
- `part_of_speech`: noun | verb | adj | adv | combo
- `grade_level`: preK | K | 1 | 2 | 3 | 4 | 5+
- `difficulty`: 1 (Basic) to 5 (Master)

### 2. Semantic Senses (Array for Homonyms)
- `senses`: [
  - {
    - `definition`: "Kid-friendly clear explanation",
    - `tags`: ["soccer", "motion", "action"],
    - `relevance`: { "soccer": 10, "action": 5 } (Weighted scores for search ranking)
  }
]

### 3. Historical DNA
- `history`: {
  - `root_language`: "Latin", "Greek", "Old English", "Old Norse", etc.
  - `root_word`: "The original ancestor spelling/morpheme"
  - `emergence`: "General timeframe (e.g., 14th Century, Old English era)"
  - `etymology_note`: "Brief story of the word's journey"
}

### 4. Associations & Clusters
- `associations`: {
  - `synonyms`: ["word1", "word2"],
  - `antonyms`: ["word1"],
  - `families`: ["Thematic grouping, e.g., 'Ball Sports', 'Flora'"],
  - `related_concepts`: ["words that aren't synonyms but sharing context"]
}

---

## 🔍 Search Logic (The "Soccer" Example)
A query for "Soccer" will:
1. Scan all `senses.tags` for "soccer".
2. Calculate a ranking based on `relevance["soccer"]`.
3. Pull associated `families` to identify clusters (e.g., "Field Sports").
4. Return results:
   - *Primary:* Goal, Ball, Kick
   - *Secondary:* Referee, Pitch, Header
   - *Implicit:* Run, Grass, Fast
