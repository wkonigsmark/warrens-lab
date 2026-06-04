// Pure question generators for Quiz Mode. Each level's generate() returns a
// plain question object the QuizShell knows how to render + grade. Framework-
// free on purpose, and friendly whole numbers throughout.
//
// Question shape (fields used depend on `type`):
//   type:    'choice' | 'number'
//   fig:     { kind:'grid', value } | { kind:'compare', a, b } | null
//   choices, answer, formatAnswer, promptTitle, promptText, hint, unit
import { FRIENDLY, rand } from './percents'

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = rand

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

// Fraction ↔ percent pairs the lessons cover.
const PAIRS = [
  { frac: '1/2', pct: 50 },
  { frac: '1/4', pct: 25 },
  { frac: '3/4', pct: 75 },
  { frac: '1', pct: 100 },
]

// Level 1 — Read the Grid (pick the percent shown) -------------------------
function genRead() {
  const value = pick(FRIENDLY)
  const choices = shuffle([value, ...sample(FRIENDLY, 2, [value])]).map((v) => `${v}%`)
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

// Level 2 — Type the Percent (type the number the grid shows) ---------------
function genType() {
  const value = pick(FRIENDLY)
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

// Level 3 — Percents & Fractions (both directions) -------------------------
function genFracPercent() {
  const p = pick(PAIRS)
  if (Math.random() < 0.5) {
    const choices = shuffle([`${p.pct}%`, ...sample(FRIENDLY, 2, [p.pct]).map((v) => `${v}%`)])
    return {
      type: 'choice',
      fig: { kind: 'grid', value: p.pct },
      promptTitle: `What percent is the same as ${p.frac}?`,
      promptText: 'Remember: ½=50%, ¼=25%, ¾=75%, whole=100%.',
      choices,
      answer: `${p.pct}%`,
      formatAnswer: `${p.pct}%`,
    }
  }
  const others = PAIRS.filter((x) => x.frac !== p.frac).map((x) => x.frac)
  const choices = shuffle([p.frac, ...sample(others, 2)])
  return {
    type: 'choice',
    fig: { kind: 'grid', value: p.pct },
    promptTitle: `Which fraction is the same as ${p.pct}%?`,
    promptText: 'Remember: 50%=½, 25%=¼, 75%=¾, 100%=whole.',
    choices,
    answer: p.frac,
    formatAnswer: p.frac,
  }
}

// Level 4 — Which is More? (compare two percents) --------------------------
function genCompare() {
  const a = pick(FRIENDLY)
  let b = pick(FRIENDLY)
  while (b === a) b = pick(FRIENDLY)
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

// Level 5 — Percent of a Number (friendly, whole-number answers) -----------
const HINTS = {
  10: (t) => `10% is one tenth of ${t}.`,
  25: (t) => `25% is one quarter of ${t}.`,
  50: (t) => `50% is half of ${t}.`,
  75: (t) => `75% is three quarters of ${t}.`,
  100: (t) => `100% is all of ${t}.`,
}

function genPercentOf() {
  const p = pick([10, 25, 50, 75, 100])
  let total
  if (p === 50) total = pick([4, 6, 8, 10, 12, 14, 16, 18, 20])
  else if (p === 25 || p === 75) total = pick([4, 8, 12, 16, 20])
  else if (p === 10) total = pick([10, 20, 30, 40, 50])
  else total = pick([5, 6, 8, 10, 12, 15, 20])
  const answer = Math.round((p / 100) * total)
  return {
    type: 'number',
    fig: null,
    promptTitle: `What is ${p}% of ${total}?`,
    promptText: `Find ${p}% of ${total} things.`,
    hint: HINTS[p](total),
    unit: '',
    answer,
    formatAnswer: `${answer}`,
  }
}

// Level registry -----------------------------------------------------------
export const LEVELS = [
  { id: 1, title: 'Read the Grid', blurb: 'Look at the grid and pick the percent.', accent: '#06b6d4', generate: genRead },
  { id: 2, title: 'Type the Percent', blurb: 'Write the percent the grid shows.', accent: '#3b82f6', generate: genType },
  { id: 3, title: 'Percents & Fractions', blurb: 'Match percents with ½, ¼, ¾ and a whole.', accent: '#ec4899', generate: genFracPercent },
  { id: 4, title: 'Which is More?', blurb: 'Compare two percents and pick the bigger one.', accent: '#8b5cf6', generate: genCompare },
  { id: 5, title: 'Percent of a Number', blurb: 'Find 50% of 10, 25% of 8, and more.', accent: '#f97316', generate: genPercentOf },
]

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id)
}

export const GENERATORS = {
  read: genRead,
  type: genType,
  fracPercent: genFracPercent,
  compare: genCompare,
  percentOf: genPercentOf,
}

export function isCorrect(q, value) {
  if (q.type === 'choice') return value === q.answer
  if (q.type === 'number') return Number(value) === q.answer
  return false
}
