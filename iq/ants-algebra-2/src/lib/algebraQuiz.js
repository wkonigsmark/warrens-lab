// Ants & Algebra — Balance Lab question generators.
//
// Every question carries TWO representations:
//   equation — the math as written (display up top)
//   scale    — the same equation rearranged into canonical "sum = total" form
//              so the balance always works the same way physically:
//              left pan = constant tiles + N crates of x · right pan = total.
// In sum form, x always contributes positively, so a wrong guess tips the
// scale in a direction that ALWAYS means the same thing: left-heavy = guess
// too big, left-light = guess too small. That consistency is the whole point.
//
// scale: { constant, xCount, total }  →  left weight for guess g = constant + xCount·g

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 3 distractors around the answer; `extra` injects form-specific confusions
// (e.g. b+a when the answer is b−a). Tight=true keeps them within ±2.
function makeChoices(answer, extra = [], tight = false) {
  const pool = tight
    ? [answer + 1, answer - 1, answer + 2, answer - 2, ...extra]
    : [...extra, answer + 1, answer - 1, answer + 2, answer - 2, answer + 3]
  const seen = new Set([answer])
  const distractors = []
  for (const d of pool) {
    if (d >= 0 && !seen.has(d)) { seen.add(d); distractors.push(d) }
    if (distractors.length === 3) break
  }
  const choices = shuffle([answer, ...distractors])
  return { choices, correctIndex: choices.indexOf(answer) }
}

// ── Solve x: + and − ─────────────────────────────────────────────────────────

function genAddSub(tier) {
  const maxes = [9, 15, 20, 30]
  const max = maxes[tier]
  const useSub = tier >= 1 && Math.random() < 0.5

  if (!useSub) {
    // a + x = b  (or x + a = b at Master, same scale)
    const a = rand(1, max - 2)
    const x = rand(1, max - a)
    const b = a + x
    const xFirst = tier === 3 && Math.random() < 0.5
    const eq = xFirst ? `x + ${a} = ${b}` : `${a} + x = ${b}`
    return {
      equation: eq,
      scale: { constant: a, xCount: 1, total: b },
      transformed: null,
      answer: x,
      ...makeChoices(x, [b - a + 1, b + a].filter(v => v !== x), tier === 3),
    }
  }

  // a − x = b   ⇔   b + x = a   (scale shows the rebalanced sum form)
  const b = rand(1, max - 2)
  const x = rand(1, max - b)
  const a = b + x
  return {
    equation: `${a} − x = ${b}`,
    scale: { constant: b, xCount: 1, total: a },
    transformed: `${b} + x = ${a}`,
    answer: x,
    ...makeChoices(x, [a + b, a - b + 1].filter(v => v !== x), tier === 3),
  }
}

// ── Solve x: × and ÷ ─────────────────────────────────────────────────────────

function genMulDiv(tier) {
  const useDiv = tier >= 2 && Math.random() < 0.5

  if (!useDiv) {
    // a·x = b — a crates of x on the left pan
    const aRanges = [[2, 3], [2, 4], [2, 5], [2, 5]]
    const xRanges = [[1, 5], [2, 9], [2, 9], [3, 12]]
    const a = rand(...aRanges[tier])
    const x = rand(...xRanges[tier])
    const b = a * x
    return {
      equation: `${a}x = ${b}`,
      scale: { constant: 0, xCount: a, total: b },
      transformed: null,
      answer: x,
      ...makeChoices(x, [b - a, Math.round(b / (a + 1))].filter(v => v > 0 && v !== x), tier === 3),
    }
  }

  // a ÷ x = b   ⇔   b·x = a   (b crates of x balance a)
  const x = rand(2, tier === 3 ? 9 : 6)
  const b = rand(2, tier === 3 ? 8 : 6)
  const a = b * x
  return {
    equation: `${a} ÷ x = ${b}`,
    scale: { constant: 0, xCount: b, total: a },
    transformed: `${b} crates of x = ${a}`,
    answer: x,
    ...makeChoices(x, [b, a - b].filter(v => v > 0 && v !== x), tier === 3),
  }
}

// ── Tiers & topics ───────────────────────────────────────────────────────────

// The Climb: reach the top rung to clear the tier. Each tier allows a shrinking
// budget of misses (a miss = both guesses wrong on one question). These are the
// tuning knobs for difficulty — same philosophy as the Angles mastery bar.
export const RUNGS = 9

export const TIER_DEFS = [
  { id: 'intro',     label: 'Intro',     missBudget: 3 },
  { id: 'practice',  label: 'Practice',  missBudget: 2 },
  { id: 'competent', label: 'Competent', missBudget: 1 },
  { id: 'master',    label: 'Master',    missBudget: 0 },
]

export const TOPICS = [
  {
    id: 'solve-addsub',
    title: 'Solve x: + and −',
    blurb: 'Balance the scale to find the mystery crate',
    accent: '#6366f1',
    emoji: '⚖️',
    generate: (tier) => genAddSub(tier),
  },
  {
    id: 'solve-muldiv',
    title: 'Solve x: × and ÷',
    blurb: 'Crates of x — how heavy is each one?',
    accent: '#ec4899',
    emoji: '📦',
    generate: (tier) => genMulDiv(tier),
  },
]

export const LEVELS = TOPICS.flatMap((topic) =>
  TIER_DEFS.map((tier, ti) => ({
    id: `${topic.id}-${tier.id}`,
    topicId: topic.id,
    tierId: tier.id,
    tierIndex: ti,
    title: topic.title,
    tierLabel: tier.label,
    missBudget: tier.missBudget,
    accent: topic.accent,
    emoji: topic.emoji,
    blurb: topic.blurb,
    generate: () => topic.generate(ti),
  }))
)
