// Pure question generators for Quiz Mode. Each level's generate() returns a
// plain question object the QuizShell knows how to render + grade. Framework-
// free on purpose, so the worksheet builder reuses the exact same problems.
//
// Question shape (fields used depend on `type`):
//   type:    'choice' | 'number' | 'fraction'
//   fig:     data for <FractionFigure> ({ kind:'pie'|'compare'|'add', ... })
//   choices, answer, formatAnswer, formatGuess, promptTitle, promptText, hint, unit

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const range = (n) => Array.from({ length: n }, (_, i) => i)

// Kid-friendly denominators (avoid 7 — hard to read, hard to draw evenly).
const DENS = [2, 3, 4, 5, 6, 8]

// Level 1 — Name the Fraction (look at a shaded pie, pick the fraction) -----
function genName() {
  const den = pick(DENS)
  const num = randInt(1, den - 1)
  const answer = `${num}/${den}`

  // Distractors: same pie, believable misreads.
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

// Level 2 — Build the Fraction (type the top and bottom numbers) -----------
function genBuild() {
  const den = pick(DENS)
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

// Level 3 — Which is Bigger? (compare two pies) ----------------------------
function genCompare() {
  const variant = pick(['sameDen', 'sameDen', 'unit'])
  let a, b
  if (variant === 'sameDen') {
    const den = pick([3, 4, 5, 6, 8])
    let n1 = randInt(1, den - 1)
    let n2 = randInt(1, den - 1)
    while (n2 === n1) n2 = randInt(1, den - 1)
    a = { num: n1, den }
    b = { num: n2, den }
  } else {
    // Unit fractions: 1/d — the smaller bottom number is the bigger piece.
    const ds = shuffle([...DENS]).slice(0, 2)
    a = { num: 1, den: ds[0] }
    b = { num: 1, den: ds[1] }
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
        : 'Same size pieces — so more shaded pieces is more pie.',
    choices: shuffle([`${a.num}/${a.den}`, `${b.num}/${b.den}`]),
    answer,
    formatAnswer: answer,
    formatGuess: (g) => g ?? '—',
  }
}

// Level 4 — Fill the Whole (how many more pieces to make 1 whole?) ---------
function genFillWhole() {
  const den = pick(DENS)
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

// Level 5 — Add Fractions, same bottom number ------------------------------
function genAddSame() {
  const den = pick([3, 4, 5, 6, 8])
  const a = randInt(1, den - 2)
  const b = randInt(1, den - a) // keep the sum ≤ den (stay within one pie)
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

// Level 6 — Equivalent Fractions (same amount, different numbers) ----------
function genEquivalent() {
  const den = pick([2, 3, 4])
  const num = randInt(1, den - 1)
  const f = pick([2, 3])
  const eqNum = num * f
  const eqDen = den * f
  const answer = `${eqNum}/${eqDen}`

  // Distractors share the bigger bottom number but shade the wrong amount.
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

// Level 7 — Subtract Fractions, same bottom number -------------------------
function genSubtractSame() {
  const den = pick([3, 4, 5, 6, 8])
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

// Level 8 — Fraction of a Number (split a group, take some) ----------------
const GROUP_TOTALS = [4, 6, 8, 9, 10, 12]
const divisorsInRange = (n) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((d) => d > 1 && d <= 6 && n % d === 0)

function genFractionOf() {
  const total = pick(GROUP_TOTALS)
  const dens = divisorsInRange(total)
  const den = pick(dens)
  const num = randInt(1, den)
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

// Level 9 — Improper & Mixed Numbers (both directions) ---------------------
const mixedStr = (w, r, d) => `${w} ${r}/${d}`

function genImproperMixed() {
  const dir = Math.random() < 0.5 ? 'toMixed' : 'toImproper'
  const den = dir === 'toMixed' ? pick([3, 4, 5, 6]) : pick([2, 3, 4, 5, 6])
  const whole = pick([1, 2])
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

// Level registry -----------------------------------------------------------
export const LEVELS = [
  { id: 1, title: 'Name the Fraction', blurb: 'Look at the shaded pie and pick the fraction.', accent: '#22c55e', generate: genName },
  { id: 2, title: 'Build the Fraction', blurb: 'Write the top and bottom numbers yourself.', accent: '#3b82f6', generate: genBuild },
  { id: 3, title: 'Which is Bigger?', blurb: 'Compare two pies and choose the larger fraction.', accent: '#8b5cf6', generate: genCompare },
  { id: 4, title: 'Fill the Whole', blurb: 'How many more pieces make one whole pie?', accent: '#f59e0b', generate: genFillWhole },
  { id: 5, title: 'Add Fractions', blurb: 'Add two fractions with the same bottom number.', accent: '#0ea5e9', generate: genAddSame },
  { id: 6, title: 'Equivalent Fractions', blurb: 'Spot the fraction that shows the same amount.', accent: '#ec4899', generate: genEquivalent },
  { id: 7, title: 'Subtract Fractions', blurb: 'Subtract two fractions with the same bottom number.', accent: '#14b8a6', generate: genSubtractSame },
  { id: 8, title: 'Fraction of a Number', blurb: 'Split a group into equal parts and take some.', accent: '#f97316', generate: genFractionOf },
  { id: 9, title: 'Improper & Mixed Numbers', blurb: 'Swap between improper fractions and mixed numbers.', accent: '#6366f1', generate: genImproperMixed },
]

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id)
}

// Generators keyed for reuse by the worksheet builder.
export const GENERATORS = {
  name: genName,
  build: genBuild,
  compare: genCompare,
  fillWhole: genFillWhole,
  addSame: genAddSame,
  equivalent: genEquivalent,
  subtractSame: genSubtractSame,
  fractionOf: genFractionOf,
  improperMixed: genImproperMixed,
}

// Grade a single answer for any level type.
export function isCorrect(q, value) {
  if (q.type === 'choice') return value === q.answer
  if (q.type === 'number') return Number(value) === q.answer
  if (q.type === 'fraction') {
    return Number(value?.num) === q.answer.num && Number(value?.den) === q.answer.den
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
