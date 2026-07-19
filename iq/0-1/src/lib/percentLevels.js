// The progression architecture for 0 → 1 (percents & decimals).
//
// This is the units × tiers level bank — the same shape the rest of the family
// uses (Ants & Fractions/Angles/Axes) via the shared buildTieredLevels(). Each
// UNIT (topic) has a generate(tierIndex) whose difficulty scales across four
// tiers (Intro → Practice → Competent → Master). buildTieredLevels turns
// topics × tiers into a flat LEVELS bank with composite ids ('read-grid-intro',
// …) that a Quiz + a ProgressMode can track per level.
//
// Question shape (matches the existing QuizShell / QuizFigure):
//   type: 'choice' | 'number'
//   fig:  { kind:'grid', value } | { kind:'compare', a, b } | null
//   choices, answer, formatAnswer, promptTitle, promptText, hint, unit
//
// Decimals reuse the percent grid figure (a decimal out of 1 is a percent out of
// 100), so no new figure component is needed to render this progression.
import { buildTieredLevels } from '../../../_shared/quizLevels.js'

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

// n distinct items from arr, excluding some values.
function sample(arr, n, exclude = []) {
  const out = []
  for (const x of shuffle(arr.filter((v) => !exclude.includes(v)))) {
    if (out.length >= n) break
    out.push(x)
  }
  return out
}

// n distinct percents near `value`, clamped to 1..99 (for open-ended tiers).
function nearby(value, n) {
  const out = new Set()
  let d = 1
  while (out.size < n && d < 45) {
    if (value - d >= 1) out.add(value - d)
    if (out.size < n && value + d <= 99) out.add(value + d)
    d += randInt(1, 3)
  }
  return [...out].slice(0, n)
}

// A percent out of 100 as a tidy decimal string: 30→"0.3", 25→"0.25", 5→"0.05".
function toDecimal(pct) {
  if (pct % 10 === 0) return `0.${pct / 10}`
  return (pct / 100).toFixed(2)
}

// ── Difficulty tiers (shared shape with the family) ─────────────────────────
export const TIER_DEFS = [
  { id: 'intro', label: 'Intro', passBar: 4 },
  { id: 'practice', label: 'Practice', passBar: 4 },
  { id: 'competent', label: 'Competent', passBar: 5 },
  { id: 'master', label: 'Master', passBar: 5 },
]
export const COUNT = 5 // questions per level

// Percent pools that widen with tier (used by several units).
const QUARTERS = [25, 50, 75, 100]
const TENS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const FIVES = [5, 15, 25, 35, 45, 55, 65, 85, 95, 10, 20, 30, 40, 50, 60, 70, 80, 90]
const READ_POOLS = [QUARTERS, TENS, FIVES, 'any']

function poolValue(tier) {
  const pool = READ_POOLS[tier]
  return pool === 'any' ? randInt(1, 99) : pick(pool)
}
function poolWrongs(tier, value, n) {
  const pool = READ_POOLS[tier]
  return pool === 'any' ? nearby(value, n) : sample(pool, n, [value])
}

// ── Unit 1 — Read the Grid (pick the percent shaded) ────────────────────────
function genReadGrid(tier) {
  const value = poolValue(tier)
  const wrongs = poolWrongs(tier, value, tier < 2 ? 2 : 3)
  const choices = shuffle([value, ...wrongs]).map((v) => `${v}%`)
  return {
    type: 'choice',
    fig: { kind: 'grid', value },
    promptTitle: 'What percent is shaded?',
    promptText: 'Count the filled squares — out of 100.',
    choices,
    answer: `${value}%`,
    formatAnswer: `${value}%`,
  }
}

// ── Unit 2 — Type the Percent (type the number shaded) ──────────────────────
function genTypePercent(tier) {
  const value = poolValue(tier)
  return {
    type: 'number',
    fig: { kind: 'grid', value },
    promptTitle: 'What percent is shaded?',
    promptText: 'Type the number of filled squares out of 100.',
    hint: 'Each full row is 10 squares = 10%.',
    unit: '%',
    answer: value,
    formatAnswer: `${value}%`,
  }
}

// ── Unit 3 — Which is More? (compare two percents) ──────────────────────────
function genCompare(tier) {
  const gap = [40, 20, 10, 5][tier]
  const pool = tier < 2 ? TENS : FIVES
  let a = pick(pool)
  let b = pick(pool)
  let guard = 0
  while ((Math.abs(a - b) < gap || a === b) && guard++ < 60) { a = pick(pool); b = pick(pool) }
  const bigger = Math.max(a, b)
  return {
    type: 'choice',
    fig: { kind: 'compare', a, b },
    promptTitle: 'Which is more?',
    promptText: 'A bigger percent fills more of the 100 squares.',
    choices: shuffle([`${a}%`, `${b}%`]),
    answer: `${bigger}%`,
    formatAnswer: `${bigger}%`,
  }
}

// ── Unit 4 — Percents & Fractions (both directions) ─────────────────────────
const PF_TIERS = [
  [['1/2', 50], ['1/4', 25], ['3/4', 75], ['1', 100]],
  [['1/2', 50], ['1/4', 25], ['3/4', 75], ['1/10', 10], ['1', 100]],
  [['1/2', 50], ['1/4', 25], ['3/4', 75], ['1/10', 10], ['1/5', 20], ['2/5', 40], ['3/5', 60], ['4/5', 80]],
  [['1/2', 50], ['1/4', 25], ['3/4', 75], ['1/10', 10], ['3/10', 30], ['7/10', 70], ['1/5', 20], ['2/5', 40], ['3/5', 60], ['4/5', 80]],
]
function genFracPercent(tier) {
  const pairs = PF_TIERS[tier]
  const [frac, pct] = pick(pairs)
  if (Math.random() < 0.5) {
    const wrongs = sample(pairs.map((p) => p[1]).filter((v) => v !== pct), 2)
    return {
      type: 'choice',
      fig: { kind: 'grid', value: pct },
      promptTitle: `What percent is the same as ${frac}?`,
      promptText: '½=50%, ¼=25%, ¾=75%, whole=100%.',
      choices: shuffle([pct, ...wrongs]).map((v) => `${v}%`),
      answer: `${pct}%`,
      formatAnswer: `${pct}%`,
    }
  }
  const wrongs = sample(pairs.map((p) => p[0]).filter((f) => f !== frac), 2)
  return {
    type: 'choice',
    fig: { kind: 'grid', value: pct },
    promptTitle: `Which fraction is the same as ${pct}%?`,
    promptText: '50%=½, 25%=¼, 75%=¾, 100%=whole.',
    choices: shuffle([frac, ...wrongs]),
    answer: frac,
    formatAnswer: frac,
  }
}

// ── Unit 5 — Percent of a Number (whole-number answers) ─────────────────────
const PO_TIERS = [[50, 100], [50, 100, 25, 10], [50, 100, 25, 10, 75, 20], [10, 20, 25, 50, 75, 5, 15, 30]]
function totalFor(p) {
  switch (p) {
    case 100: return pick([5, 6, 8, 10, 12, 20])
    case 50: return pick([4, 6, 8, 10, 12, 14, 16, 18, 20])
    case 25: case 75: return pick([4, 8, 12, 16, 20])
    case 10: return pick([10, 20, 30, 40, 50])
    case 20: return pick([5, 10, 15, 20, 25])
    case 30: return pick([10, 20, 30, 40])
    case 15: return pick([20, 40, 60])
    case 5: return pick([20, 40, 60, 80, 100])
    default: return pick([10, 20])
  }
}
const PO_HINTS = {
  5: (t) => `5% is a twentieth of ${t}.`,
  10: (t) => `10% is one tenth of ${t}.`,
  15: (t) => `15% is 10% + 5% of ${t}.`,
  20: (t) => `20% is one fifth of ${t}.`,
  25: (t) => `25% is one quarter of ${t}.`,
  30: (t) => `30% is three tenths of ${t}.`,
  50: (t) => `50% is half of ${t}.`,
  75: (t) => `75% is three quarters of ${t}.`,
  100: (t) => `100% is all of ${t}.`,
}
function genPercentOf(tier) {
  const p = pick(PO_TIERS[tier])
  const total = totalFor(p)
  const answer = Math.round((p / 100) * total)
  return {
    type: 'number',
    fig: null,
    promptTitle: `What is ${p}% of ${total}?`,
    promptText: `Find ${p}% of ${total} things.`,
    hint: (PO_HINTS[p] ?? PO_HINTS[50])(total),
    unit: '',
    answer,
    formatAnswer: `${answer}`,
  }
}

// ── Unit 6 — Meet Decimals (read the grid as a decimal out of 1) ────────────
const DEC_TIERS = [
  [10, 20, 30, 40, 50, 60, 70, 80, 90],           // tenths
  [10, 20, 30, 40, 50, 60, 70, 80, 90],           // tenths, wider distractors
  [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90],   // + quarters
  'any',                                           // any hundredth
]
function genDecimal(tier) {
  const pool = DEC_TIERS[tier]
  const value = pool === 'any' ? randInt(1, 99) : pick(pool)
  const wrongs = pool === 'any'
    ? nearby(value, 3)
    : sample([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90], 3, [value])
  return {
    type: 'choice',
    fig: { kind: 'grid', value },
    promptTitle: 'What decimal is shaded?',
    promptText: 'The grid is out of 100 — write it as a decimal out of 1.',
    hint: `${value} out of 100 = ${toDecimal(value)}`,
    choices: shuffle([value, ...wrongs]).map(toDecimal),
    answer: toDecimal(value),
    formatAnswer: toDecimal(value),
  }
}

// ── Unit 7 — Decimals & Percents (convert both directions) ──────────────────
const DP_TIERS = [
  [50, 25, 75, 10],
  [10, 20, 30, 40, 50, 60, 70, 80, 90],
  [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 10, 20, 50],
  'any',
]
function genDecPercent(tier) {
  const pool = DP_TIERS[tier]
  const value = pool === 'any' ? randInt(1, 99) : pick(pool)
  const wrongs = pool === 'any' ? nearby(value, 2) : sample(pool, 2, [value])
  const dec = toDecimal(value)
  if (Math.random() < 0.5) {
    return {
      type: 'choice',
      fig: { kind: 'grid', value },
      promptTitle: `What percent is ${dec}?`,
      promptText: 'A decimal out of 1 is the same as a percent out of 100.',
      choices: shuffle([value, ...wrongs]).map((v) => `${v}%`),
      answer: `${value}%`,
      formatAnswer: `${value}%`,
    }
  }
  return {
    type: 'choice',
    fig: { kind: 'grid', value },
    promptTitle: `Write ${value}% as a decimal.`,
    promptText: 'Percent out of 100 → decimal out of 1.',
    choices: shuffle([value, ...wrongs]).map(toDecimal),
    answer: dec,
    formatAnswer: dec,
  }
}

// ── The units, in progression order ─────────────────────────────────────────
export const TOPICS = [
  { id: 'read-grid', title: 'Read the Grid', blurb: 'Look at the grid and name the percent.', emoji: '🟦', accent: '#06b6d4', generate: genReadGrid },
  { id: 'type-percent', title: 'Type the Percent', blurb: 'Write the percent the grid shows.', emoji: '⌨️', accent: '#3b82f6', generate: genTypePercent },
  { id: 'compare', title: 'Which is More?', blurb: 'Compare two percents and pick the bigger.', emoji: '⚖️', accent: '#8b5cf6', generate: genCompare },
  { id: 'percent-fraction', title: 'Percents & Fractions', blurb: 'Match percents with ½, ¼, ¾ and more.', emoji: '🥧', accent: '#ec4899', generate: genFracPercent },
  { id: 'percent-of', title: 'Percent of a Number', blurb: 'Find 50% of 10, 25% of 8, and more.', emoji: '🎯', accent: '#f97316', generate: genPercentOf },
  { id: 'meet-decimals', title: 'Meet Decimals', blurb: 'Read the grid as a decimal out of 1.', emoji: '📏', accent: '#14b8a6', generate: genDecimal },
  { id: 'decimal-percent', title: 'Decimals & Percents', blurb: 'Turn decimals into percents and back.', emoji: '🔁', accent: '#10b981', generate: genDecPercent },
]

// topics × tiers → the flat level bank (ids like 'read-grid-intro').
export const LEVELS = buildTieredLevels(TOPICS, TIER_DEFS)

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id)
}

export function isCorrect(q, value) {
  if (q.type === 'choice') return value === q.answer
  if (q.type === 'number') return Number(value) === q.answer
  return false
}
