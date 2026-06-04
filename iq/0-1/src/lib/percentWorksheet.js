// Printable worksheet topics. Same ideas as Quiz Mode but returning
// print-friendly problem objects (a figure or text + a clean prompt + answer).
// Every build is freshly randomized, so a reprinted sheet is never the same.
import { rand } from './percents'

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = rand

const FRIENDLY = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100]
const PAIRS = [
  { frac: '1/2', pct: 50 },
  { frac: '1/4', pct: 25 },
  { frac: '3/4', pct: 75 },
  { frac: '1 whole', pct: 100 },
]

// layout: 'figcard'  → a grid + "Answer: ___"
//         'shade'    → a percent to read + a blank grid to color in
//         'text'     → a written prompt + "Answer: ___"
//         'compare'  → two grids + a blank for >, <, or =

// "Write the percent shown by each grid."
function genName() {
  const value = pick(FRIENDLY)
  return {
    layout: 'figcard',
    fig: { kind: 'grid', value },
    prompt: 'What percent is shaded?',
    answer: `${value}%`,
    formatAnswer: `${value}%`,
  }
}

// "Color each grid to show the percent."
function genShade() {
  const value = pick(FRIENDLY)
  return {
    layout: 'shade',
    fig: { kind: 'grid', value: 0 },
    target: `${value}%`,
    prompt: `Color ${value}%`,
    answer: `shade ${value}`,
    formatAnswer: `${value} squares`,
  }
}

// Swap between a percent and a friendly fraction.
function genFracPercent() {
  const p = pick(PAIRS)
  if (Math.random() < 0.5) {
    return { layout: 'text', prompt: `Write ${p.frac} as a percent:`, answer: `${p.pct}%`, formatAnswer: `${p.pct}%` }
  }
  return { layout: 'text', prompt: `Write ${p.pct}% as a fraction:`, answer: p.frac, formatAnswer: p.frac }
}

// "Write >, <, or = between the two percents."
function genCompare() {
  const a = pick(FRIENDLY)
  let b = pick(FRIENDLY)
  while (b === a) b = pick(FRIENDLY)
  const sym = a > b ? '>' : '<'
  return {
    layout: 'compare',
    fig: { kind: 'compare', a, b },
    a, b,
    prompt: `${a}%  ◯  ${b}%`,
    answer: sym,
    formatAnswer: sym,
  }
}

// "What is X% of N?" — friendly, whole-number answers.
function genPercentOf() {
  const p = pick([10, 25, 50, 75, 100])
  let total
  if (p === 50) total = pick([4, 6, 8, 10, 12, 14, 16, 18, 20])
  else if (p === 25 || p === 75) total = pick([4, 8, 12, 16, 20])
  else if (p === 10) total = pick([10, 20, 30, 40, 50])
  else total = pick([5, 6, 8, 10, 12, 15, 20])
  const answer = Math.round((p / 100) * total)
  return { layout: 'text', prompt: `What is ${p}% of ${total}?`, answer: `${answer}`, formatAnswer: `${answer}` }
}

export const TOPICS = [
  {
    id: 'name',
    title: 'Name the Percent',
    instructions: 'Write the percent shaded in each grid.',
    rules: 'Percent means "out of 100". Count the filled squares.',
    count: 6,
    gen: genName,
  },
  {
    id: 'color',
    title: 'Color the Percent',
    instructions: 'Color each grid to show the percent.',
    rules: 'Shade that many squares out of 100. A whole row is 10 squares = 10%.',
    count: 4,
    gen: genShade,
  },
  {
    id: 'fractions',
    title: 'Percents & Fractions',
    instructions: 'Swap between percents and fractions.',
    rules: '½ = 50% · ¼ = 25% · ¾ = 75% · whole = 100%.',
    count: 8,
    gen: genFracPercent,
  },
  {
    id: 'compare',
    title: 'Compare Percents',
    instructions: 'Write >, <, or = inside each circle.',
    rules: 'A bigger percent fills more of the 100 squares.',
    count: 8,
    gen: genCompare,
  },
  {
    id: 'percent-of',
    title: 'Percent of a Number',
    instructions: 'Find the percent of each number.',
    rules: '50% is half · 25% is a quarter · 75% is three quarters · 10% is one tenth · 100% is all.',
    count: 8,
    gen: genPercentOf,
  },
  {
    id: 'mixed',
    title: 'Mixed Review',
    instructions: 'A mix of every kind of percent problem.',
    rules: 'Name it · color it · match fractions · compare · percent of a number.',
    count: 6,
    gen: () => pick([genName, genShade, genFracPercent, genCompare, genPercentOf])(),
  },
]

export function getTopic(id) {
  return TOPICS.find((t) => t.id === id)
}

// Build `count` problems for a topic, lightly de-duplicated.
export function buildProblems(topic, count = topic.count || 6) {
  const out = []
  let attempts = 0
  while (out.length < count && attempts < 200) {
    const q = topic.gen()
    const key = JSON.stringify([q.layout, q.prompt, q.target, q.answer])
    if (!out.some((p) => p._key === key)) out.push({ ...q, _key: key })
    attempts++
  }
  return out
}
