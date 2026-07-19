// The progression architecture for Ants & Exponents — the scaled "lesson plan".
//
// units × tiers, built with the shared buildTieredLevels() (same as Ants &
// Fractions / 0 → 1). Each UNIT has a generate(tierIndex) whose difficulty scales
// across four tiers (Intro → Practice → Competent → Master). buildTieredLevels
// turns topics × tiers into a flat LEVELS bank with composite ids
// ('squares-intro', …) that the Quiz + My Progress track per level.
//
// Question shape (rendered by the exponents QuizShell — the prompt is the math
// itself, written with unicode superscripts, so no figure component is needed):
//   { prompt, sub, choices:[...], answer, explain, format? }
import { buildTieredLevels } from '../../../_shared/quizLevels.js'

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const sup = (n) => String(n).split('').map((d) => SUP[d] ?? d).join('')
const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1])

// A 4-way multiple choice: the answer plus the best distinct wrong guesses.
function choices(answer, distractors) {
  const seen = new Set([String(answer)])
  const out = [answer]
  for (const d of distractors) {
    if (out.length >= 4) break
    if (d == null) continue
    const key = String(d)
    if (!seen.has(key)) { seen.add(key); out.push(d) }
  }
  let pad = answer
  while (out.length < 4 && typeof answer === 'number') {
    pad += 1
    if (!seen.has(String(pad))) { seen.add(String(pad)); out.push(pad) }
  }
  return shuffle(out)
}

// ── Difficulty tiers (shared shape with the family) ─────────────────────────
export const TIER_DEFS = [
  { id: 'intro', label: 'Intro', passBar: 4 },
  { id: 'practice', label: 'Practice', passBar: 4 },
  { id: 'competent', label: 'Competent', passBar: 5 },
  { id: 'master', label: 'Master', passBar: 5 },
]
export const COUNT = 5

// ── Unit 1 — Squares (b²) ───────────────────────────────────────────────────
const SQ_BASE = [[2, 4], [2, 7], [2, 10], [2, 12]]
function genSquares(tier) {
  const [lo, hi] = SQ_BASE[tier]
  const b = rint(lo, hi)
  const ans = b * b
  return {
    prompt: `${b}${sup(2)} = ?`,
    sub: `${b} squared`,
    choices: choices(ans, [b + b, b * 2, b + 2, ans + b]),
    answer: ans,
    explain: `${b}${sup(2)} means ${b} × ${b} = ${ans}. (Not ${b} + ${b}!)`,
  }
}

// ── Unit 2 — Cubes & powers (bᵉ) ────────────────────────────────────────────
function genCubes(tier) {
  let b, e
  if (tier === 0) { b = rint(2, 3); e = 3 }
  else if (tier === 1) { b = rint(2, 5); e = 3 }
  else if (tier === 2) { b = rint(2, 4); e = rint(2, 3) }
  else { b = rint(2, 5); e = rint(2, 4) }
  const ans = b ** e
  const chain = Array.from({ length: e }, () => b).join(' × ')
  return {
    prompt: `${b}${sup(e)} = ?`,
    sub: chain,
    choices: choices(ans, [b * e, b + e, ans + b, b ** (e - 1)]),
    answer: ans,
    explain: `${b}${sup(e)} means ${chain} = ${ans}.`,
  }
}

// ── Unit 3 — Write it as a power (chain → bᵉ) ───────────────────────────────
const WP_RANGE = [[3, 3, 2, 3], [2, 4, 2, 3], [2, 5, 2, 4], [2, 6, 2, 5]] // [bLo,bHi,eLo,eHi]
function genWritePower(tier) {
  const [bLo, bHi, eLo, eHi] = WP_RANGE[tier]
  const b = rint(bLo, bHi)
  const e = rint(eLo, eHi)
  const chain = Array.from({ length: e }, () => b).join(' × ')
  const answer = `${b}${sup(e)}`
  return {
    prompt: chain,
    sub: 'Write this as a power',
    choices: choices(answer, [`${b}×${e}`, `${e}${sup(b)}`, `${b * e}`, `${b}${sup(e + 1)}`]),
    answer,
    explain: `We used ${b} a total of ${e} times → ${b}${sup(e)} (base ${b}, exponent ${e}).`,
  }
}

// ── Unit 4 — Powers of 10 (10ᵉ) ─────────────────────────────────────────────
const P10_E = [[2, 3], [2, 4], [2, 6], [3, 8]]
function genPow10(tier) {
  const [lo, hi] = P10_E[tier]
  const e = rint(lo, hi)
  const ans = 10 ** e
  return {
    prompt: `10${sup(e)} = ?`,
    sub: 'a power of ten',
    choices: choices(ans, [10 ** (e - 1), 10 ** (e + 1), 10 * e]),
    answer: ans,
    explain: `The exponent ${e} = the number of zeros: 10${sup(e)} = ${ans.toLocaleString()}.`,
    format: (v) => (typeof v === 'number' ? v.toLocaleString() : v),
  }
}

// ── Unit 5 — Power of 0 and 1 ───────────────────────────────────────────────
function genZeroOne(tier) {
  const b = rint(2, tier < 2 ? 6 : 12)
  // Intro: only ⁰. Later: mix ⁰ and ¹.
  const e = tier === 0 ? 0 : pick([0, 1])
  if (e === 0) {
    return {
      prompt: `${b}${sup(0)} = ?`,
      sub: 'anything to the power 0',
      choices: choices(1, [0, b, b * b]),
      answer: 1,
      explain: `Any number to the power 0 is 1. So ${b}${sup(0)} = 1.`,
    }
  }
  return {
    prompt: `${b}${sup(1)} = ?`,
    sub: 'anything to the power 1',
    choices: choices(b, [1, 0, b * b]),
    answer: b,
    explain: `Any number to the power 1 is itself. So ${b}${sup(1)} = ${b}.`,
  }
}

// ── Unit 6 — Which is bigger? (compare two powers) ──────────────────────────
function genCompare(tier) {
  const eHi = tier < 2 ? 3 : 4
  let a, b, av, bv, guard = 0
  do {
    a = { base: rint(2, 5), exp: rint(2, eHi) }
    b = { base: rint(2, 5), exp: rint(2, eHi) }
    av = a.base ** a.exp
    bv = b.base ** b.exp
  } while ((av === bv || (tier === 0 && Math.abs(av - bv) < 8)) && guard++ < 60)
  const A = `${a.base}${sup(a.exp)}`
  const B = `${b.base}${sup(b.exp)}`
  const bigger = av > bv ? A : B
  return {
    prompt: 'Which is bigger?',
    sub: 'compare the two powers',
    choices: shuffle([A, B]),
    answer: bigger,
    explain: `${A} = ${av} and ${B} = ${bv}, so ${bigger} is bigger.`,
  }
}

// ── Unit 7 — Product rule (aˣ · aʸ) ─────────────────────────────────────────
const PR_XY = [[1, 3], [1, 4], [1, 5], [1, 6]]
function genProduct(tier) {
  const b = rint(2, tier < 2 ? 4 : 6)
  const [lo, hi] = PR_XY[tier]
  let x, y, guard = 0
  do { x = rint(lo, hi); y = rint(lo, hi) } while (x + y === x * y && guard++ < 40)
  const ans = x + y
  return {
    prompt: `${b}${sup(x)} × ${b}${sup(y)} = ${b}▢`,
    sub: 'same base → ADD the exponents (▢ = ?)',
    choices: choices(ans, [x * y, x, y, ans + 1]),
    answer: ans,
    explain: `Same base, so add: ${x} + ${y} = ${ans} (don't multiply!). ${b}${sup(x)} × ${b}${sup(y)} = ${b}${sup(ans)}.`,
  }
}

// ── Unit 8 — Quotient rule (aˣ ÷ aʸ) ────────────────────────────────────────
const QR_XHI = [4, 5, 7, 8]
function genQuotient(tier) {
  const b = rint(2, tier < 2 ? 4 : 6)
  const x = rint(3, QR_XHI[tier])
  const y = rint(1, x - 1)
  const ans = x - y
  const dists = [x + y, x, y, ans + 1]
  if (x % y === 0 && x / y !== ans) dists.splice(1, 0, x / y)
  return {
    prompt: `${b}${sup(x)} ÷ ${b}${sup(y)} = ${b}▢`,
    sub: 'same base → SUBTRACT the exponents (▢ = ?)',
    choices: choices(ans, dists),
    answer: ans,
    explain: `Same base, so subtract: ${x} − ${y} = ${ans} (don't add!). ${b}${sup(x)} ÷ ${b}${sup(y)} = ${b}${sup(ans)}.`,
  }
}

// ── Unit 9 — Negative exponents (b⁻ᵉ = 1/bᵉ) ────────────────────────────────
function genNegative(tier) {
  let b, e
  if (tier === 0) { b = rint(2, 5); e = 1 }
  else if (tier === 1) { b = rint(2, 9); e = 1 }
  else if (tier === 2) { b = rint(2, 5); e = 2 }
  else { b = rint(2, 5); e = pick([1, 2, 3]) }
  const denom = b ** e
  const answer = `1/${denom}`
  const dists = [`-${b}`, `${denom}`, e > 1 ? `1/${b}` : '0', `${b * e}`]
  return {
    prompt: `${b}${sup(-e)} = ?`,
    sub: 'a negative exponent means 1 over',
    choices: choices(answer, dists),
    answer,
    explain: `${b}${sup(-e)} = 1 ÷ ${b}${sup(e)} = 1/${denom}.`,
  }
}

// ── The units, in progression order ─────────────────────────────────────────
export const TOPICS = [
  { id: 'squares', title: 'Squares', blurb: 'b² — a number times itself.', emoji: '🟦', accent: '#6366f1', generate: genSquares },
  { id: 'cubes', title: 'Cubes & Powers', blurb: 'b³ and beyond — repeated multiplying.', emoji: '🧊', accent: '#8b5cf6', generate: genCubes },
  { id: 'write-power', title: 'Write it as a Power', blurb: 'Turn 2 × 2 × 2 into a power.', emoji: '✍️', accent: '#a855f7', generate: genWritePower },
  { id: 'powers-of-10', title: 'Powers of 10', blurb: 'The exponent counts the zeros.', emoji: '🔟', accent: '#0ea5e9', generate: genPow10 },
  { id: 'zero-one', title: 'Power of 0 & 1', blurb: 'Anything⁰ = 1, anything¹ = itself.', emoji: '0️⃣', accent: '#14b8a6', generate: genZeroOne },
  { id: 'compare', title: 'Which is Bigger?', blurb: 'Compare two powers.', emoji: '⚖️', accent: '#f59e0b', generate: genCompare },
  { id: 'product-rule', title: 'Product Rule', blurb: 'Same base? Add the exponents.', emoji: '✖️', accent: '#ec4899', generate: genProduct },
  { id: 'quotient-rule', title: 'Quotient Rule', blurb: 'Same base? Subtract the exponents.', emoji: '➗', accent: '#f43f5e', generate: genQuotient },
  { id: 'negative', title: 'Negative Exponents', blurb: 'b⁻ⁿ means 1 over bⁿ.', emoji: '➖', accent: '#ef4444', generate: genNegative },
]

export const LEVELS = buildTieredLevels(TOPICS, TIER_DEFS)

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id)
}

export function isCorrect(q, guess) {
  return String(guess) === String(q.answer)
}
