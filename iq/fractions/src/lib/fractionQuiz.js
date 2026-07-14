// Pure question generators for Quiz Mode. Each level's generate() returns a
// plain question object the QuizShell knows how to render + grade. Framework-
// free on purpose, so the worksheet builder can reuse the same primitives.
//
// Question shape (fields used depend on `type`):
//   type:    'choice' | 'number' | 'fraction'
//   fig:     data for <FractionFigure> ({ kind:'pie'|'compare'|'add', ... })
//   choices, answer, formatAnswer, formatGuess, promptTitle, promptText, hint, unit
//
// Levels are topics × tiers (Intro/Practice/Competent/Master), built via the
// shared buildTieredLevels() helper — see _shared/quizLevels.js. Each topic's
// generate(tierIndex) decides what scales per tier (denominator range,
// whether sums can cross a whole, unit vs. non-unit fractions, etc).
import { buildTieredLevels } from '../../../_shared/quizLevels.js'

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const range = (n) => Array.from({ length: n }, (_, i) => i)

// Kid-friendly denominators (avoid 7 — hard to read, hard to draw evenly).
const DENS = [2, 3, 4, 5, 6, 8]

export const TIER_DEFS = [
  { id: 'intro', label: 'Intro', passBar: 4 },
  { id: 'practice', label: 'Practice', passBar: 4 },
  { id: 'competent', label: 'Competent', passBar: 5 },
  { id: 'master', label: 'Master', passBar: 5 },
]
export const COUNT = 5

// ── Topic 1 — Name the Fraction (look at a shaded pie, pick the fraction) ──
const NAME_DENS = [[2, 3, 4], [2, 3, 4, 5, 6], [4, 5, 6, 8], [6, 8, 10, 12]]
function genName(tier) {
  const den = pick(NAME_DENS[tier])
  const num = randInt(1, den - 1)
  const answer = `${num}/${den}`

  const cands = new Set([answer])
  if (num + 1 <= den) cands.add(`${num + 1}/${den}`)
  if (num - 1 >= 1) cands.add(`${num - 1}/${den}`)
  cands.add(`${den - num}/${den}`)       // counted the empty pieces
  cands.add(`${num}/${den + 1}`)         // miscounted total
  cands.add(`${den}/${num}`)             // flipped it

  const choices = shuffle([answer, ...[...cands].filter((c) => c !== answer)].slice(0, 4))
  return {
    type: 'choice',
    fig: { kind: 'pie', parts: den, shaded: num },
    promptTitle: 'What fraction is shaded?',
    promptText: 'Count the shaded pieces, then count all the pieces.',
    choices,
    answer,
    formatAnswer: answer,
    formatGuess: (g) => g ?? '—',
  }
}

// ── Topic 2 — Build the Fraction (type the top and bottom numbers) ────────
function genBuild(tier) {
  const den = pick(NAME_DENS[tier])
  const num = randInt(1, den - 1)
  return {
    type: 'fraction',
    fig: { kind: 'pie', parts: den, shaded: num },
    promptTitle: 'Write the fraction that is shaded.',
    promptText: 'Top = shaded pieces. Bottom = pieces in all.',
    hint: 'How many golden slices? How many slices in the whole pie?',
    answer: { num, den },
    formatAnswer: `${num}/${den}`,
    formatGuess: (g) => (g && g.num !== '' ? `${g.num}/${g.den}` : '—'),
  }
}

// ── Topic 3 — Which is Bigger? (compare two pies) ──────────────────────────
const CROSS_PAIRS = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 8], [5, 8]]
function genCompare(tier) {
  const variant =
    tier === 0 ? 'sameDen' :
    tier === 1 ? pick(['sameDen', 'unit']) :
    tier === 2 ? pick(['unit', 'cross']) :
    pick(['cross', 'cross', 'unit'])

  let a, b
  if (variant === 'sameDen') {
    const den = pick([3, 4, 5, 6, 8])
    let n1 = randInt(1, den - 1)
    let n2 = randInt(1, den - 1)
    while (n2 === n1) n2 = randInt(1, den - 1)
    a = { num: n1, den }
    b = { num: n2, den }
  } else if (variant === 'unit') {
    const ds = shuffle([...DENS]).slice(0, 2)
    a = { num: 1, den: ds[0] }
    b = { num: 1, den: ds[1] }
  } else {
    const [d1, d2] = pick(CROSS_PAIRS)
    a = { num: randInt(1, d1 - 1), den: d1 }
    b = { num: randInt(1, d2 - 1), den: d2 }
    let guard = 0
    while (a.num / a.den === b.num / b.den && guard++ < 20) b = { num: randInt(1, d2 - 1), den: d2 }
  }
  const va = a.num / a.den
  const vb = b.num / b.den
  const bigger = va > vb ? a : b
  const answer = `${bigger.num}/${bigger.den}`
  return {
    type: 'choice',
    fig: { kind: 'compare', a, b },
    promptTitle: 'Which fraction is bigger?',
    promptText:
      variant === 'unit'
        ? 'More pieces in the whole means each piece is smaller.'
        : 'Look carefully — the pieces are different sizes.',
    choices: shuffle([`${a.num}/${a.den}`, `${b.num}/${b.den}`]),
    answer,
    formatAnswer: answer,
    formatGuess: (g) => g ?? '—',
  }
}

// ── Topic 4 — Fill the Whole (how many more pieces to make 1 whole?) ──────
function genFillWhole(tier) {
  const den = pick(NAME_DENS[tier])
  const num = randInt(1, den - 1)
  const missing = den - num
  return {
    type: 'number',
    fig: { kind: 'pie', parts: den, shaded: num },
    promptTitle: 'How many more pieces fill the whole pie?',
    promptText: 'A whole pie needs every piece shaded.',
    hint: `${num}/${den} + ?/${den} = ${den}/${den} (one whole)`,
    unit: 'pieces',
    answer: missing,
    formatAnswer: `${missing} (${num}/${den} + ${missing}/${den} = ${den}/${den})`,
    formatGuess: (g) => `${g}`,
  }
}

// ── Topic 5 — Add Fractions, same bottom number ────────────────────────────
const ADD_SUB_DENS = [[3, 4, 5], [3, 4, 5, 6, 8], [4, 5, 6, 8], [6, 8, 10, 12]]
function genAddSame(tier) {
  const den = pick(ADD_SUB_DENS[tier])
  const allowOverflow = tier >= 2 // higher tiers: sum can exceed the denominator
  const a = randInt(1, den - 1)
  const b = allowOverflow ? randInt(1, den - 1) : randInt(1, Math.max(1, den - a))
  return {
    type: 'number',
    fig: { kind: 'add', a: { num: a, den }, b: { num: b, den }, den },
    promptTitle: `Add: ${a}/${den} + ${b}/${den}`,
    promptText: 'Add the top numbers. The bottom number stays the same.',
    hint: `${a} + ${b} = ?  →  put it over ${den}`,
    unit: `/ ${den}`,
    answer: a + b,
    formatAnswer: `${a + b}/${den}`,
    formatGuess: (g) => `${g}/${den}`,
  }
}

// ── Topic 6 — Equivalent Fractions (same amount, different numbers) ───────
const EQUIV_SPEC = [
  { dens: [2, 3, 4], fs: [2] },
  { dens: [2, 3, 4, 5], fs: [2, 3] },
  { dens: [3, 4, 5, 6], fs: [2, 3, 4] },
  { dens: [4, 5, 6, 8], fs: [2, 3, 4] },
]
function genEquivalent(tier) {
  const spec = EQUIV_SPEC[tier]
  const den = pick(spec.dens)
  const num = randInt(1, den - 1)
  const f = pick(spec.fs)
  const eqNum = num * f
  const eqDen = den * f
  const reduceDirection = tier >= 2 && Math.random() < 0.4

  if (reduceDirection) {
    const answer = `${num}/${den}`
    const cands = new Set([answer, `${eqNum}/${eqDen}`])
    if (num + 1 <= den) cands.add(`${num + 1}/${den}`)
    if (num - 1 >= 1) cands.add(`${num - 1}/${den}`)
    const choices = shuffle([answer, ...[...cands].filter((c) => c !== answer)].slice(0, 3))
    return {
      type: 'choice',
      fig: { kind: 'pie', parts: eqDen, shaded: eqNum },
      promptTitle: `Which fraction is the SIMPLEST form of ${eqNum}/${eqDen}?`,
      promptText: 'Equivalent fractions cover the same amount of pie.',
      choices,
      answer,
      formatAnswer: `${answer} ( = ${eqNum}/${eqDen})`,
      formatGuess: (g) => g ?? '—',
    }
  }

  const answer = `${eqNum}/${eqDen}`
  const cands = new Set([answer])
  if (eqNum + 1 <= eqDen) cands.add(`${eqNum + 1}/${eqDen}`)
  if (eqNum - 1 >= 1) cands.add(`${eqNum - 1}/${eqDen}`)
  cands.add(`${num}/${eqDen}`)
  const choices = shuffle([answer, ...[...cands].filter((c) => c !== answer)].slice(0, 3))

  return {
    type: 'choice',
    fig: { kind: 'pie', parts: den, shaded: num },
    promptTitle: `Which fraction is the SAME amount as ${num}/${den}?`,
    promptText: 'Equivalent fractions cover the same amount of pie.',
    choices,
    answer,
    formatAnswer: `${answer} ( = ${num}/${den})`,
    formatGuess: (g) => g ?? '—',
  }
}

// ── Topic 7 — Subtract Fractions, same bottom number ──────────────────────
function genSubtractSame(tier) {
  const den = pick(ADD_SUB_DENS[tier])
  const a = randInt(2, den)
  const b = randInt(1, a - 1)
  return {
    type: 'number',
    fig: { kind: 'add', op: '−', a: { num: a, den }, b: { num: b, den }, den },
    promptTitle: `Subtract: ${a}/${den} − ${b}/${den}`,
    promptText: 'Subtract the top numbers. The bottom number stays the same.',
    hint: `${a} − ${b} = ?  →  put it over ${den}`,
    unit: `/ ${den}`,
    answer: a - b,
    formatAnswer: `${a - b}/${den}`,
    formatGuess: (g) => `${g}/${den}`,
  }
}

// ── Topic 8 — Fraction of a Number (split a group, take some) ─────────────
const GROUP_TOTALS_BY_TIER = [[4, 6, 8], [6, 8, 10, 12], [8, 10, 12, 15], [10, 12, 15, 18, 20]]
const divisorsInRange = (n, maxD) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((d) => d > 1 && d <= maxD && n % d === 0)

function genFractionOf(tier) {
  const total = pick(GROUP_TOTALS_BY_TIER[tier])
  const dens = divisorsInRange(total, tier === 3 ? 8 : 6)
  const den = pick(dens.length ? dens : [2])
  const forceUnit = tier <= 1
  const num = forceUnit ? 1 : randInt(1, den)
  const groupSize = total / den
  return {
    type: 'number',
    fig: { kind: 'group', total, den, num },
    promptTitle: `What is ${num}/${den} of ${total}?`,
    promptText: `Split ${total} into ${den} equal groups, then take ${num}.`,
    hint: `${den} groups of ${total} = ${groupSize} each, then take ${num} group${num > 1 ? 's' : ''}.`,
    unit: '',
    answer: num * groupSize,
    formatAnswer: `${num * groupSize}`,
    formatGuess: (g) => `${g}`,
  }
}

// Simplify helper (reuse from fractions.js logic inline to avoid circular deps)
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const simplify = (n, d) => {
  const g = gcd(n, d)
  return { num: n / g, den: d / g }
}

// ── Topic 9 — Improper & Mixed Numbers (both directions) ──────────────────
const mixedStr = (w, r, d) => `${w} ${r}/${d}`
const MIXED_WHOLES = [[1], [1, 2], [2, 3], [3, 4]]
const MIXED_DENS = [[3, 4], [3, 4, 5, 6], [4, 5, 6, 8], [6, 8, 10]]

function genImproperMixed(tier) {
  const dir = Math.random() < 0.5 ? 'toMixed' : 'toImproper'
  const den = pick(MIXED_DENS[tier])
  const whole = pick(MIXED_WHOLES[tier])
  const rem = randInt(1, den - 1)
  const num = whole * den + rem

  if (dir === 'toMixed') {
    const answer = mixedStr(whole, rem, den)
    const r2 = rem + 1 < den ? rem + 1 : rem - 1
    const set = new Set([
      answer,
      mixedStr(whole + 1, rem, den),
      mixedStr(whole, r2, den),
      mixedStr(whole > 1 ? whole - 1 : whole + 2, rem, den),
    ])
    return {
      type: 'choice',
      fig: { kind: 'stack', num, den },
      promptTitle: 'Write this as a mixed number.',
      promptText: 'How many whole pies, and how many pieces left over?',
      choices: shuffle([...set].slice(0, 4)),
      answer,
      formatAnswer: answer,
      formatGuess: (g) => g ?? '—',
    }
  }

  return {
    type: 'fraction',
    fig: { kind: 'stack', num, den },
    promptTitle: `Write ${whole} ${rem}/${den} as one fraction.`,
    promptText: `Count every piece — the bottom number stays ${den}.`,
    hint: `${whole} whole = ${whole * den} pieces, plus ${rem} more.`,
    answer: { num, den },
    formatAnswer: `${num}/${den}`,
    formatGuess: (g) => (g && g.num !== '' ? `${g.num}/${g.den}` : '—'),
  }
}

// ── Topic 10 — Multiplying Fractions (area model visual) ──────────────────
const MULT_DENS = [[2, 3], [2, 3, 4], [2, 3, 4], [3, 4, 6]]
function genMultiply(tier) {
  const denPool = MULT_DENS[tier]
  const forceUnit1 = tier === 0
  const forceUnit2 = tier <= 1
  const den1 = pick(denPool)
  const den2 = pick(denPool)
  const num1 = forceUnit1 ? 1 : randInt(1, den1 - 1)
  const num2 = forceUnit2 ? 1 : randInt(1, den2 - 1)

  const prodNum = num1 * num2
  const prodDen = den1 * den2
  const { num: simpNum, den: simpDen } = simplify(prodNum, prodDen)

  return {
    type: 'fraction',
    fig: { kind: 'area', num1, den1, num2, den2 },
    promptTitle: `Multiply: ${num1}/${den1} × ${num2}/${den2}`,
    promptText: 'Multiply the top numbers. Multiply the bottom numbers. Simplify if you can.',
    hint: `${num1} × ${num2} = ${prodNum}  and  ${den1} × ${den2} = ${prodDen}`,
    answer: { num: simpNum, den: simpDen },
    formatAnswer: `${simpNum}/${simpDen}`,
    formatGuess: (g) => (g && g.num !== '' ? `${g.num}/${g.den}` : '—'),
  }
}

// ── Topic registry + level bank ─────────────────────────────────────────────
export const TOPICS = [
  { id: 'name', title: 'Name the Fraction', blurb: 'Look at the shaded pie and pick the fraction.', accent: '#22c55e', emoji: '🥧', generate: genName },
  { id: 'build', title: 'Build the Fraction', blurb: 'Write the top and bottom numbers yourself.', accent: '#3b82f6', emoji: '✏️', generate: genBuild },
  { id: 'compare', title: 'Which is Bigger?', blurb: 'Compare two pies and choose the larger fraction.', accent: '#8b5cf6', emoji: '⚖️', generate: genCompare },
  { id: 'fill-whole', title: 'Fill the Whole', blurb: 'How many more pieces make one whole pie?', accent: '#f59e0b', emoji: '🍕', generate: genFillWhole },
  { id: 'add-same', title: 'Add Fractions', blurb: 'Add two fractions with the same bottom number.', accent: '#0ea5e9', emoji: '➕', generate: genAddSame },
  { id: 'equivalent', title: 'Equivalent Fractions', blurb: 'Spot the fraction that shows the same amount.', accent: '#ec4899', emoji: '🟰', generate: genEquivalent },
  { id: 'subtract-same', title: 'Subtract Fractions', blurb: 'Subtract two fractions with the same bottom number.', accent: '#14b8a6', emoji: '➖', generate: genSubtractSame },
  { id: 'fraction-of', title: 'Fraction of a Number', blurb: 'Split a group into equal parts and take some.', accent: '#f97316', emoji: '🔢', generate: genFractionOf },
  { id: 'improper-mixed', title: 'Improper & Mixed Numbers', blurb: 'Swap between improper fractions and mixed numbers.', accent: '#6366f1', emoji: '🔄', generate: genImproperMixed },
  { id: 'multiply', title: 'Multiplying Fractions', blurb: 'Multiply two fractions and simplify the answer.', accent: '#d946ef', emoji: '✖️', generate: genMultiply },
]

export const LEVELS = buildTieredLevels(TOPICS, TIER_DEFS)

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id)
}

// Grade a single answer for any level type.
export function isCorrect(q, value) {
  if (q.type === 'choice') return value === q.answer
  if (q.type === 'number') return Number(value) === q.answer
  if (q.type === 'fraction') {
    // Compare simplified forms — so 2/6 and 1/3 are both correct.
    // This rewards the counting process (2/6) and doesn't trap kids before simplification is taught.
    const guessSimp = simplify(Number(value?.num || 0), Number(value?.den || 1))
    const answerSimp = q.answer
    return guessSimp.num === answerSimp.num && guessSimp.den === answerSimp.den
  }
  return false
}

// Fisher–Yates, returns a new array.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export { range }
