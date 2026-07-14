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

// ── Classic Mode — traditional problems, no scale (scale: null) ─────────────
// The four tiers retrace the ORIGINAL Ants & Algebra game's modes:
//   Intro     — one-step add/sub equations (original "Solve x" + / −)
//   Practice  — all four ops one-step (original "Solve x" full)
//   Competent — Chains: multi-term arithmetic, find the result
//   Master    — Chains & X: x hiding inside a chain
// Questions with no `x` end in "= ?" and the answer is the chain result.

function genClassic(tier) {
  if (tier === 0) {
    if (Math.random() < 0.5) {
      const a = rand(1, 9), x = rand(1, 9)
      return {
        equation: `${a} + x = ${a + x}`, scale: null, transformed: null,
        answer: x, ...makeChoices(x, [a + x + a]),
      }
    }
    const x = rand(1, 9), b = rand(1, 9)
    return {
      equation: `${x + b} − x = ${b}`, scale: null, transformed: null,
      answer: x, ...makeChoices(x, [x + b + b]),
    }
  }

  if (tier === 1) {
    const form = pick(['add', 'sub', 'mul', 'div'])
    if (form === 'add') {
      const a = rand(2, 12), x = rand(2, 12)
      return { equation: `${a} + x = ${a + x}`, scale: null, transformed: null, answer: x, ...makeChoices(x, [a + x + a]) }
    }
    if (form === 'sub') {
      const x = rand(2, 10), b = rand(2, 10)
      return { equation: `${x + b} − x = ${b}`, scale: null, transformed: null, answer: x, ...makeChoices(x, [x + 2 * b]) }
    }
    if (form === 'mul') {
      const a = rand(2, 6), x = rand(2, 9)
      return { equation: `${a}x = ${a * x}`, scale: null, transformed: null, answer: x, ...makeChoices(x, [a * x - a, a]) }
    }
    const x = rand(2, 6), b = rand(2, 6)
    return { equation: `${b * x} ÷ x = ${b}`, scale: null, transformed: null, answer: x, ...makeChoices(x, [b, b * x - b]) }
  }

  if (tier === 2) {
    // Chains: 3–4 terms, + and −, kept non-negative at every step
    const len = pick([3, 3, 4])
    let result = rand(2, 10)
    let eq = String(result)
    for (let i = 1; i < len; i++) {
      const plus = Math.random() < 0.55
      let term = rand(1, 8)
      if (!plus && term >= result) term = Math.max(1, Math.floor(result / 2))
      result += plus ? term : -term
      eq += ` ${plus ? '+' : '−'} ${term}`
    }
    return {
      equation: `${eq} = ?`, scale: null, transformed: null,
      answer: result, ...makeChoices(result),
    }
  }

  // Master — Chains & X: a op1 x op2 b = result
  for (let tries = 0; tries < 40; tries++) {
    const o1 = pick(['+', '−']), o2 = pick(['+', '−'])
    const a = rand(5, 14), b = rand(1, 8), x = rand(1, 8)
    const v1 = o1 === '+' ? a + x : a - x
    const result = o2 === '+' ? v1 + b : v1 - b
    if (v1 < 0 || result < 0) continue
    return {
      equation: `${a} ${o1} x ${o2} ${b} = ${result}`, scale: null, transformed: null,
      answer: x, ...makeChoices(x, [], true),
    }
  }
  return genClassic(0) // safety fallback
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
  {
    id: 'classic-mix',
    title: 'Classic Mode',
    blurb: 'Old-school problems on the chalkboard — solve x, chains, and chains & x',
    accent: '#10b981',
    emoji: '🧮',
    generate: (tier) => genClassic(tier),
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
