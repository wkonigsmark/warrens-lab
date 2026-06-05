// The assessment bank. Each competency mirrors one of the sibling /iq math
// tools, so a check-up here points the kid straight at the right place to
// practice. Generators are pure and framework-free; every question is
// multiple-choice (fast taps for little hands) and whole-number friendly.
//
// Question shape:
//   { prompt, choices:[...4], answer, skill }   // answer must be one of choices
//
// Each competency exposes generate(level) for level 1..3 (easy → harder), so
// the assessment can climb until the child stops getting them right and use
// the topping-out point as the proficiency estimate.

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a multiple-choice question from a numeric answer + plausible distractors.
// `near` spreads wrong answers around the truth; we dedupe and never go below 0.
function choiceQ(prompt, answer, { near = 3, skill = '' } = {}) {
  const wrongs = new Set()
  let guard = 0
  while (wrongs.size < 3 && guard++ < 50) {
    const delta = randInt(-near, near) || near
    const w = answer + delta
    if (w !== answer && w >= 0) wrongs.add(w)
  }
  const choices = shuffle([answer, ...wrongs].map(String))
  return { prompt, choices, answer: String(answer), skill }
}

// Pick a question from explicit {prompt, answer, choices} options list.
function fromOptions(prompt, answer, options, skill = '') {
  return { prompt, choices: shuffle(options.map(String)), answer: String(answer), skill }
}

// ── Arithmetic → Ants & Apples ──────────────────────────────────────────────
const arithmetic = {
  id: 'arithmetic',
  label: 'Arithmetic',
  emoji: '🍎',
  accent: '#ef4444',
  blurb: 'Adding, subtracting, times tables',
  tool: { name: 'Ants & Apples', url: 'https://warrens-lab.vercel.app/iq/ants-apples/' },
  generate(level) {
    if (level === 1) {
      const a = randInt(1, 9), b = randInt(1, 9)
      return Math.random() < 0.5
        ? choiceQ(`${a} + ${b} = ?`, a + b, { near: 2 })
        : choiceQ(`${Math.max(a, b)} − ${Math.min(a, b)} = ?`, Math.abs(a - b), { near: 2 })
    }
    if (level === 2) {
      const a = randInt(11, 49), b = randInt(11, 49)
      return Math.random() < 0.5
        ? choiceQ(`${a} + ${b} = ?`, a + b, { near: 5 })
        : choiceQ(`${a + b} − ${b} = ?`, a, { near: 5 })
    }
    // level 3 — times tables & division
    const a = randInt(3, 9), b = randInt(3, 9)
    return Math.random() < 0.5
      ? choiceQ(`${a} × ${b} = ?`, a * b, { near: 6 })
      : choiceQ(`${a * b} ÷ ${b} = ?`, a, { near: 3 })
  },
}

// ── Fractions → Ants & Fractions ────────────────────────────────────────────
const fractions = {
  id: 'fractions',
  label: 'Fractions',
  emoji: '🥧',
  accent: '#f59e0b',
  blurb: 'Pieces of a whole, comparing & equivalence',
  tool: { name: 'Ants & Fractions', url: 'https://ants-fractions.vercel.app/' },
  generate(level) {
    if (level === 1) {
      // which fraction is bigger (same numerator, friendly halves/quarters)
      const pairs = [['1/2', '1/4', '1/2'], ['1/2', '1/3', '1/2'], ['3/4', '1/4', '3/4'], ['1/3', '1/4', '1/3']]
      const [a, b, bigger] = pick(pairs)
      return fromOptions(`Which is bigger: ${a} or ${b}?`, bigger, [a, b], 'compare')
    }
    if (level === 2) {
      // equivalent fraction to 1/2
      const equivs = [['2/4', '1/2'], ['3/6', '1/2'], ['4/8', '1/2'], ['5/10', '1/2']]
      const [eq] = pick(equivs)
      return fromOptions(`Which fraction is the same as 1/2?`, eq, [eq, '2/3', '1/3', '3/4'], 'equivalence')
    }
    // level 3 — fraction of a number
    const denom = pick([2, 3, 4, 5])
    const whole = denom * randInt(2, 6)
    return choiceQ(`What is 1/${denom} of ${whole}?`, whole / denom, { near: 3, skill: 'fraction-of' })
  },
}

// ── Percents & Decimals → 0 → 1 ─────────────────────────────────────────────
const percents = {
  id: 'percents',
  label: 'Percents & Decimals',
  emoji: '💯',
  accent: '#06b6d4',
  blurb: 'Percent of a number, percent ↔ fraction',
  tool: { name: '0 → 1', url: 'https://ants-0-1.vercel.app/' },
  generate(level) {
    if (level === 1) {
      // half / whole as a percent
      const opts = [['50%', '1/2'], ['100%', 'the whole thing'], ['25%', '1/4']]
      const [pct, thing] = pick(opts)
      return fromOptions(`How much is ${thing}, as a percent?`, pct, ['50%', '100%', '25%', '10%'], 'meaning')
    }
    if (level === 2) {
      // 50% / 10% of a number
      const n = pick([10, 20, 40, 60, 80, 100])
      return Math.random() < 0.5
        ? choiceQ(`What is 50% of ${n}?`, n / 2, { near: 5 })
        : choiceQ(`What is 10% of ${n}?`, n / 10, { near: 3 })
    }
    // level 3 — 25% of a number, percent↔fraction
    const n = pick([20, 40, 80, 100])
    return Math.random() < 0.5
      ? choiceQ(`What is 25% of ${n}?`, n / 4, { near: 5 })
      : fromOptions(`What fraction is the same as 0.5?`, '1/2', ['1/2', '1/5', '5/1', '1/10'], 'decimal')
  },
}

// ── Exponents → Ants & Exponents ────────────────────────────────────────────
const exponents = {
  id: 'exponents',
  label: 'Exponents',
  emoji: '⬆️',
  accent: '#8b5cf6',
  blurb: 'Squares, cubes & powers',
  tool: { name: 'Ants & Exponents', url: 'https://ants-exponents.vercel.app/' },
  generate(level) {
    if (level === 1) {
      const b = randInt(2, 6)
      return choiceQ(`What is ${b}² ?  (${b} × ${b})`, b * b, { near: 4 })
    }
    if (level === 2) {
      const b = randInt(2, 4)
      return choiceQ(`What is ${b}³ ?  (${b} × ${b} × ${b})`, b ** 3, { near: 6 })
    }
    // level 3 — powers of ten & product rule
    return Math.random() < 0.5
      ? fromOptions(`What is 10³ ?`, 1000, [1000, 100, 30, 10000], 'powers-of-ten')
      : fromOptions(`2² × 2³ = 2 to what power?`, 5, [5, 6, 4, 23], 'product-rule')
  },
}

// ── Angles & Geometry → Ants & Angles ───────────────────────────────────────
const angles = {
  id: 'angles',
  label: 'Angles & Geometry',
  emoji: '📐',
  accent: '#10b981',
  blurb: 'Angle types, lines & triangles',
  tool: { name: 'Ants & Angles', url: 'https://ants-angles.vercel.app/' },
  generate(level) {
    if (level === 1) {
      return fromOptions(`How many degrees is a right angle?`, 90, [90, 180, 45, 360], 'right-angle')
    }
    if (level === 2) {
      // angles on a straight line sum to 180
      const a = pick([30, 45, 60, 110, 120, 135])
      return choiceQ(`Two angles sit on a straight line. One is ${a}°. What is the other?`, 180 - a, { near: 10, skill: 'straight-line' })
    }
    // level 3 — triangle angle sum
    const a = randInt(40, 80), b = randInt(40, 80)
    return choiceQ(`A triangle has angles ${a}° and ${b}°. What is the third?`, 180 - a - b, { near: 10, skill: 'triangle-sum' })
  },
}

// ── Algebra → Ants & Algebra ────────────────────────────────────────────────
const algebra = {
  id: 'algebra',
  label: 'Algebra',
  emoji: '🧮',
  accent: '#6366f1',
  blurb: 'Solving for the missing number',
  tool: { name: 'Ants & Algebra', url: 'https://warrens-lab.vercel.app/iq/ants-algebra/' },
  generate(level) {
    if (level === 1) {
      const x = randInt(1, 9), b = randInt(1, 9)
      return choiceQ(`x + ${b} = ${x + b}.  What is x?`, x, { near: 3 })
    }
    if (level === 2) {
      const x = randInt(2, 9), a = randInt(2, 5)
      return choiceQ(`${a}x = ${a * x}.  What is x?`, x, { near: 3 })
    }
    // level 3 — two-step
    const x = randInt(2, 9), a = randInt(2, 4), b = randInt(1, 9)
    return choiceQ(`${a}x + ${b} = ${a * x + b}.  What is x?`, x, { near: 3 })
  },
}

export const COMPETENCIES = [arithmetic, fractions, percents, exponents, angles, algebra]

export const byId = (id) => COMPETENCIES.find((c) => c.id === id)

// Proficiency bands from a 0..1 score within a competency.
export function band(score) {
  if (score >= 0.85) return { label: 'Mastered', emoji: '🏆', color: '#10b981' }
  if (score >= 0.6) return { label: 'Solid', emoji: '💪', color: '#06b6d4' }
  if (score >= 0.35) return { label: 'Getting it', emoji: '🌱', color: '#f59e0b' }
  return { label: 'Just starting', emoji: '🐣', color: '#ef4444' }
}
