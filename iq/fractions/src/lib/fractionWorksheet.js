// Printable worksheet topics. These build on the same ideas as Quiz Mode but
// return print-friendly problem objects (a figure + a clean prompt + an answer).
// Every build is freshly randomized, so a reprinted sheet is never the same.

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const DENS = [2, 3, 4, 5, 6, 8]

// layout: 'figcard'  → a picture + "Answer: ___"
//         'shade'    → a fraction to read + a blank pie to color in
//         'equation' → two little pies and  a/d + b/d = ___

// "Write the fraction shown by each picture."
function genName() {
  const den = pick(DENS)
  const num = randInt(1, den - 1)
  return {
    layout: 'figcard',
    fig: { kind: 'pie', parts: den, shaded: num },
    prompt: 'What fraction is shaded?',
    answer: `${num}/${den}`,
    formatAnswer: `${num}/${den}`,
  }
}

// "Color each pie to show the fraction."
function genShade() {
  const den = pick(DENS)
  const num = randInt(1, den - 1)
  return {
    layout: 'shade',
    fig: { kind: 'pieBlank', parts: den },
    target: `${num}/${den}`,
    prompt: `Color ${num}/${den}`,
    answer: `shade ${num} of ${den}`,
    formatAnswer: `${num} shaded`,
  }
}

// "How many more pieces fill the whole pie?"
function genFillWhole() {
  const den = pick(DENS)
  const num = randInt(1, den - 1)
  return {
    layout: 'figcard',
    fig: { kind: 'pie', parts: den, shaded: num },
    prompt: 'How many more pieces fill the whole pie?',
    answer: `${den - num}`,
    formatAnswer: `${den - num}`,
  }
}

// "Add the fractions." Sum kept within one whole.
function genAdd() {
  const den = pick([3, 4, 5, 6, 8])
  const a = randInt(1, den - 2)
  const b = randInt(1, den - a)
  return {
    layout: 'equation',
    fig: { kind: 'add', a: { num: a, den }, b: { num: b, den }, den },
    a, b, den,
    prompt: `${a}/${den} + ${b}/${den} =`,
    answer: `${a + b}/${den}`,
    formatAnswer: `${a + b}/${den}`,
  }
}

// "Subtract the fractions." Positive result.
function genSubtract() {
  const den = pick([3, 4, 5, 6, 8])
  const a = randInt(2, den)
  const b = randInt(1, a - 1)
  return {
    layout: 'equation',
    fig: { kind: 'add', op: '−', a: { num: a, den }, b: { num: b, den }, den },
    a, b, den,
    prompt: `${a}/${den} − ${b}/${den} =`,
    answer: `${a - b}/${den}`,
    formatAnswer: `${a - b}/${den}`,
  }
}

// "What is num/den of total?" — a fraction of a number, with a group picture.
const GROUP_TOTALS = [4, 6, 8, 9, 10, 12]
const divisorsInRange = (n) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((d) => d > 1 && d <= 6 && n % d === 0)

function genFractionOf() {
  const total = pick(GROUP_TOTALS)
  const den = pick(divisorsInRange(total))
  const num = randInt(1, den)
  return {
    layout: 'group',
    fig: { kind: 'group', total, den, num },
    prompt: `What is ${num}/${den} of ${total}?`,
    answer: `${(num * total) / den}`,
    formatAnswer: `${(num * total) / den}`,
  }
}

// Improper fraction ↔ mixed number, shown as a stack of pies.
function genMixedNumber() {
  const dir = Math.random() < 0.5 ? 'toMixed' : 'toImproper'
  const den = dir === 'toMixed' ? pick([3, 4, 5, 6]) : pick([2, 3, 4, 5, 6])
  const whole = pick([1, 2])
  const rem = randInt(1, den - 1)
  const num = whole * den + rem
  if (dir === 'toMixed') {
    return {
      layout: 'group',
      fig: { kind: 'stack', num, den },
      prompt: 'Write this as a mixed number:',
      answer: `${whole} ${rem}/${den}`,
      formatAnswer: `${whole} ${rem}/${den}`,
    }
  }
  return {
    layout: 'group',
    fig: { kind: 'stack', num, den },
    prompt: `Write ${whole} ${rem}/${den} as one fraction:`,
    answer: `${num}/${den}`,
    formatAnswer: `${num}/${den}`,
  }
}

// "Fill in the missing top number" to make equal fractions.
function genEquivalent() {
  const den = pick([2, 3, 4])
  const num = randInt(1, den - 1)
  const f = pick([2, 3])
  return {
    layout: 'figcard',
    fig: { kind: 'pie', parts: den, shaded: num },
    prompt: `Fill in the missing top number:  ${num}/${den} = ___/${den * f}`,
    answer: `${num * f}`,
    formatAnswer: `${num * f}`,
  }
}

export const TOPICS = [
  {
    id: 'name',
    title: 'Name the Fraction',
    instructions: 'Write the fraction shown by each shaded pie.',
    rules: 'Top number = shaded pieces.  Bottom number = pieces in the whole.',
    count: 6,
    gen: genName,
  },
  {
    id: 'shade',
    title: 'Color the Fraction',
    instructions: 'Color each pie to show the fraction.',
    rules: 'Shade the top number of pieces, out of the bottom number in all.',
    count: 6,
    gen: genShade,
  },
  {
    id: 'fill',
    title: 'Fill the Whole',
    instructions: 'Write how many more pieces fill the whole pie.',
    rules: 'A whole pie is every piece shaded — the bottom number of pieces.',
    count: 6,
    gen: genFillWhole,
  },
  {
    id: 'add',
    title: 'Add Fractions (same bottom)',
    instructions: 'Add the fractions. Use the pictures to help.',
    rules: 'Add the top numbers. The bottom number stays the same.',
    count: 6,
    gen: genAdd,
  },
  {
    id: 'subtract',
    title: 'Subtract Fractions (same bottom)',
    instructions: 'Subtract the fractions. Use the pictures to help.',
    rules: 'Subtract the top numbers. The bottom number stays the same.',
    count: 6,
    gen: genSubtract,
  },
  {
    id: 'equivalent',
    title: 'Equivalent Fractions',
    instructions: 'Fill in the missing number to make equal fractions.',
    rules: 'Equal fractions show the same amount — like 1/2 = 2/4 = 4/8.',
    count: 6,
    gen: genEquivalent,
  },
  {
    id: 'fraction-of',
    title: 'Fraction of a Number',
    instructions: 'Find the fraction of each group of objects.',
    rules: 'Bottom number = how many equal groups. Top number = how many groups to take.',
    count: 6,
    gen: genFractionOf,
  },
  {
    id: 'mixed-numbers',
    title: 'Improper & Mixed Numbers',
    instructions: 'Swap between improper fractions and mixed numbers.',
    rules: 'Improper = top bigger than bottom. Mixed = a whole number and a fraction. Same amount!',
    count: 6,
    gen: genMixedNumber,
  },
  {
    id: 'mixed',
    title: 'Mixed Review',
    instructions: 'A mix of every kind of fraction problem.',
    rules: 'Name it · color it · fill the whole · add or subtract · fraction of a number.',
    count: 6,
    gen: () => pick([genName, genShade, genFillWhole, genAdd, genSubtract, genEquivalent, genFractionOf, genMixedNumber])(),
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
    const key = JSON.stringify([q.layout, q.prompt, q.target, q.answer, q.fig])
    if (!out.some((p) => p._key === key)) out.push({ ...q, _key: key })
    attempts++
  }
  return out
}
