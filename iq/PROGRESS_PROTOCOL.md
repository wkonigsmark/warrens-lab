# /iq Progress Tracking Protocol

A shared standard for session data across all math tools in this suite.
The goal: consistent enough to query together, flexible enough for each game's unique mechanics.

---

## Principles

- Every quiz attempt is saved — wins, losses, partial scores.
- Data lives in `localStorage` today; Supabase later. The schema is the same either way.
- Game-specific fields go in an `ext` object — never pollute the core schema.
- Users are shared across tools (same `users.js`, same picker UX).
- Raw timing is always stored; winsorized timing is also stored for display/gating.

---

## Storage Convention

```
localStorage key:  {toolId}-sessions-{userId}
```

| Tool | toolId |
|------|--------|
| Ants & Angles | `ants-angles` |
| Ants & Axes | `ants-axes` |
| Ants & Fractions | `ants-fractions` |
| Ants & Exponents | `ants-exponents` |
| 0 → 1 (Percents) | `zero-to-one` |
| Ants & Assessment | `ants-assessment` |
| *(new tool)* | `ants-{name}` |

---

## Core Session Schema

Every session object **must** include these fields:

```jsonc
{
  // ── Identity ──────────────────────────────────────────────────────────
  "id":        1720720800000,          // Date.now() at quiz completion
  "ts":        "2026-07-11T18:00:00Z", // ISO 8601
  "toolId":    "ants-angles",          // which game
  "userId":    "ballard",              // from users.js

  // ── Level / Tier ──────────────────────────────────────────────────────
  // For tiered tools, levelId is a composite string: "{topicId}-{tierId}"
  // For non-tiered tools, levelId is a stable numeric or string identifier.
  "levelId":   "name-the-angle-intro", // stable across sessions
  "levelTitle": "Name the Angle",      // human topic title

  // Tier fields — null for non-tiered tools
  "topicId":   "name-the-angle",       // slug matching TOPIC_DEFS
  "tierId":    "intro",                // "intro" | "practice" | "competent" | "master"
  "tierLabel": "Intro",                // display label

  "category":  "Angles",              // top-level grouping (Angles, Triangles, etc.)

  // ── Score ─────────────────────────────────────────────────────────────
  "score":     4,                      // correct answers
  "count":     5,                      // total questions (tier-dependent: 5/8/10/10)
  "passed":    true,                   // score >= passBar AND speed gate (if any) passed

  // ── Timing ────────────────────────────────────────────────────────────
  // avgMs uses winsorized times (distraction-robust); avgMsRaw is the true mean.
  // Winsorization caps any value > max(20 000 ms, median × 3) down to the cap.
  // Always store both — raw is for forensics, avgMs is for gate + display.
  "avgMs":     9200,                   // winsorized avg ms/question
  "avgMsRaw":  17200,                  // raw avg ms/question

  // ── Hint usage ────────────────────────────────────────────────────────
  "hintTotal":   2,                    // total hint opens this session
  "hintTotalMs": 6400,                 // total ms hint was visible

  // ── Settings ──────────────────────────────────────────────────────────
  "wholeOnly": true,                   // whole-numbers-only mode was on

  // ── Per-question answers ──────────────────────────────────────────────
  "answers": [
    {
      "q":         1,                  // 1-indexed
      "prompt":    "Name this angle",  // promptTitle
      "correct":   true,
      "ms":        8240,               // raw wall-clock ms (question shown → tap)
      "msW":       8240,               // winsorized ms (= ms if no outlier)
      "hintCount": 1,                  // times hint was opened for this question
      "hintMs":    3200                // total ms hint was visible for this question
    }
  ]
}
```

---

## Tier Definitions (standard ladder)

All tiered Ants tools use the same 4-tier progression:

| tierId | label | Questions | Pass bar | Speed gate |
|--------|-------|-----------|----------|------------|
| `intro` | Intro | 5 | 4 / 5 | none |
| `practice` | Practice | 8 | 6 / 8 | none |
| `competent` | Competent | 10 | 9 / 10 | none |
| `master` | Master | 10 | 10 / 10 | avg < 4 s (winsorized) |

Master requires **both** perfect accuracy **and** speed. The speed gate uses
winsorized avg so one distraction event doesn't void a genuinely fast session.

### Tier-differentiated generators

Each topic must expose **4 separate generators**, one per tier. The difficulty
should be genuinely earned — not just "more questions of the same type":

| Tier | Design principle |
|------|-----------------|
| Intro | One concept at a time, canonical/memorable values, heaviest scaffolding |
| Practice | Both variants introduced, round-number answers, wider range |
| Competent | Full range, any valid value, no scaffolding |
| Master | Near-boundary / confusable cases, non-round mental arithmetic, fast |

In `TOPIC_DEFS`, the `generates` field is an array of 4 functions indexed by
`tierIndex` (0 = Intro, 3 = Master). The tier expansion in the level builder
assigns `level.generate = topic.generates[tierIndex]`.

---

## Game-Specific Extensions

Add a top-level `ext` object for anything unique to that game.

**Ants & Angles**
```jsonc
"ext": {
  "questionType": "choice" | "number",
  "angleDegrees": 135
}
```

**Ants & Axes**
```jsonc
"ext": {
  "questionType": "plot" | "read" | "slope" | "midpoint",
  "quadrant": 1 | 2 | 3 | 4 | null
}
```

Per-answer extensions go inside each answer object under `ext`:
```jsonc
"answers": [
  {
    "q": 1, "prompt": "Plot (3, -2)", "correct": false,
    "ms": 4100, "msW": 4100, "hintCount": 0, "hintMs": 0,
    "ext": { "expected": [3, -2], "guessed": [3, 2] }
  }
]
```

---

## Users Module (shared)

All tools use identical `src/lib/users.js`, `sessions.js`, and `winsorize.js`.
Copy from `ants-angles/src/lib/` when scaffolding a new tool.

```
users.js     — USERS array, getStoredUser(), storeUser(), clearStoredUser()
sessions.js  — saveSession(session, userId), getSessions(userId), clearSessions(userId)
winsorize.js — winsorize(timesMs[]), winsorizedAvg(timesMs[])
```

---

## Admin View (shared pattern)

Each tool gets its own `/?admin` PIN-gated dashboard (PIN: 2019).
Standard sections:
1. **Summary cards** — total sessions, levels tried, pass rate (uses `s.passed`)
2. **By Level table** — attempts, avg score, pass %, avg time (winsorized, ⚡ if adjusted), hints/session
3. **Session log** — date, level · tier, score/count, avg time, hint count, result badge, per-Q dot grid

---

## Student Progress View (shared pattern)

Each tool includes a student-facing progress screen (no PIN, always visible).
Shows the student their own tier ladder, topic by topic:

- **Topic track**: 4 nodes (Intro → Practice → Competent → Master) connected by a line
  - ✓ filled = tier passed (accent color)
  - ◉ ring = current tier (accent + pulsing ring)
  - ○ = not yet reached (gray)
- **Overall bar**: "X / N tiers mastered"
- **Play button** per topic → goes directly into the quiz at the current tier

The progress view reads `getSessions(userId)` and checks `s.passed` per `levelId`.

---

## Future Supabase Shape

```sql
CREATE TABLE sessions (
  id            BIGINT PRIMARY KEY,         -- Date.now()
  ts            TIMESTAMPTZ,
  tool_id       TEXT,
  user_id       TEXT,
  level_id      TEXT,                       -- string composite for tiered tools
  level_title   TEXT,
  topic_id      TEXT,                       -- null for non-tiered
  tier_id       TEXT,                       -- "intro"|"practice"|"competent"|"master"|null
  tier_label    TEXT,
  category      TEXT,
  score         INT,
  count         INT,
  passed        BOOLEAN,
  avg_ms        INT,                        -- winsorized
  avg_ms_raw    INT,
  hint_total    INT,
  hint_total_ms INT,
  whole_only    BOOLEAN,
  ext           JSONB,
  answers       JSONB                       -- array: ms, msW, hintCount, hintMs, ext
);

CREATE INDEX sessions_user_tool  ON sessions (user_id, tool_id, ts DESC);
CREATE INDEX sessions_topic_tier ON sessions (user_id, tool_id, topic_id, tier_id, ts DESC);
```

---

## Implementation Checklist (per tool)

- [ ] Copy `src/lib/users.js`, `sessions.js`, `winsorize.js`
- [ ] Add `UserPicker` splash screen
- [ ] Wrap App in `AppShell` / `AppContent` (hooks-order safety)
- [ ] Add `user` + `onSwitchUser` to Banner; add `📊 Admin` link
- [ ] Define `TIER_DEFS` + `TOPIC_DEFS` with 4 tier-differentiated `generates[]` per topic
- [ ] Build tier-aware `QuizShell`: dynamic `level.count` / `level.passBar` / `level.speedMs`
- [ ] Save session with all core fields; winsorized avg; `passed` respects speed gate
- [ ] Add `/?admin` → PIN 2019 → `AdminView` with hint + winsorization columns
- [ ] Add student `ProgressMode` with topic tier tracks
- [ ] Smart level landing: first unmastered tier across all topics in order

---

## Ants & Axes — Next Steps

Four topic candidates: **Plot a Point, Read a Point, Slope, Midpoint**
Each needs 4 tier-differentiated generators and a tap-to-answer rapid-fire shell
(4 coordinate choices — no keyboard). Apply the full checklist above.
