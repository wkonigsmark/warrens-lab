// Worksheet topics reuse the Quiz Mode generators (single source of truth for
// problem data) and add a printable rules reminder for "mentor" mode.
import { GENERATORS } from './angleQuiz'
import { CIRCLE_GENERATORS } from './circleQuiz'
import { TRIANGLE_GENERATORS } from './triangleQuiz'
import { generateWhole } from './wholeNumbers'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randMultiple = (min, max, step) =>
  (Math.floor(Math.random() * (Math.floor(max / step) - Math.ceil(min / step) + 1)) + Math.ceil(min / step)) * step

// Arithmetic "number bonds" in the zone of an angle total. A problem is a row
// of tokens with one blank (null); the kid fills the blank. The 9/18/36 set is
// the 90/180/360 set scaled down by 10 — a warm-up for the angle arithmetic.
function makeBondGenerator(targets, step) {
  return () => {
    const target = pick(targets)
    const a = randMultiple(step, target - step, step)
    const b = target - a
    const form = pick(['missingAddend', 'missingAddend', 'subtraction', 'subtraction', 'sum'])
    if (form === 'missingAddend') {
      return { kind: 'arithmetic', tokens: [a, '+', null, '=', target], answer: b, formatAnswer: `${b}` }
    }
    if (form === 'subtraction') {
      return { kind: 'arithmetic', tokens: [target, '−', a, '=', null], answer: b, formatAnswer: `${b}` }
    }
    return { kind: 'arithmetic', tokens: [a, '+', b, '=', null], answer: target, formatAnswer: `${target}` }
  }
}

// Gentle, curated bonds for very young / emerging students: bonds-to-9 dominate
// (single digit), with friendly round splits for 18 & 36. Mostly addition, and
// subtraction only in its easy "big − part" form so the answer stays small.
const SIMPLE_POOL = {
  9: [1, 2, 3, 4, 5, 6, 7, 8],
  18: [9, 10, 8, 12, 6, 14, 4, 15, 3, 16, 2],
  36: [18, 30, 6, 20, 16, 10, 26, 12, 24, 33, 3],
}
const SIMPLE_TARGETS = [9, 9, 9, 18, 18, 36] // weighted toward the single-digit total

function genBondsSimple() {
  const target = pick(SIMPLE_TARGETS)
  const a = pick(SIMPLE_POOL[target])
  const b = target - a
  const form = pick(['missingAddend', 'missingAddend', 'sum', 'subtraction'])
  if (form === 'missingAddend') {
    return { kind: 'arithmetic', tokens: [a, '+', null, '=', target], answer: b, formatAnswer: `${b}` }
  }
  if (form === 'sum') {
    return { kind: 'arithmetic', tokens: [a, '+', b, '=', null], answer: target, formatAnswer: `${target}` }
  }
  // Subtract the larger part so the result is the smaller, simpler number.
  const big = Math.max(a, b)
  const small = Math.min(a, b)
  return { kind: 'arithmetic', tokens: [target, '−', big, '=', null], answer: small, formatAnswer: `${small}` }
}

const genBondsAngle = makeBondGenerator([90, 180, 360], 5)

export const TOPICS = [
  {
    id: 'partner',
    title: 'Complement & Supplement',
    instructions: 'Find the complement or supplement of each angle.',
    rules: 'Complementary angles add up to 90°.  •  Supplementary angles add up to 180°.',
    gen: GENERATORS.partner,
  },
  {
    id: 'line',
    title: 'Missing Angle on a Line',
    instructions: 'Find each missing angle along the straight line.',
    rules: 'Angles on a straight line add up to 180°.',
    gen: GENERATORS.line,
  },
  {
    id: 'point',
    title: 'Angles Around a Point',
    instructions: 'Find each missing angle around the point.',
    rules: 'Angles around a point add up to 360°.',
    gen: GENERATORS.point,
  },
  {
    id: 'vertical',
    title: 'Vertical Angles',
    instructions: 'Find each missing angle where the two lines cross.',
    rules: 'Vertical (opposite) angles are equal.  •  Angles on a straight line add up to 180°.',
    gen: GENERATORS.vertical,
  },
  {
    id: 'triangle',
    title: 'Angles in a Triangle',
    instructions: 'Find the missing angle inside each triangle.',
    rules: 'The three angles inside a triangle add up to 180°.',
    gen: GENERATORS.triangle,
  },
  {
    id: 'mixed',
    title: 'Mixed Review',
    instructions: 'A mix of every kind of angle problem.',
    rules:
      'Complement → 90°  •  Supplement & straight line → 180°  •  Around a point → 360°  •  Vertical angles are equal  •  Triangle → 180°',
    gen: () => pick(Object.values(GENERATORS))(),
  },
  {
    id: 'bonds-small',
    title: 'Number Bonds — 9 · 18 · 36',
    instructions: 'Fill in the missing number in each problem.',
    rules: 'These totals are the angle numbers 90, 180 and 360 scaled down by 10 — same idea, smaller numbers.',
    kind: 'arithmetic',
    count: 8,
    gen: genBondsSimple,
  },
  {
    id: 'bonds-angle',
    title: 'Number Bonds — 90 · 180 · 360',
    instructions: 'Fill in the missing number in each problem.',
    rules: '90 = a right angle  •  180 = a straight line  •  360 = a full turn.',
    kind: 'arithmetic',
    count: 12,
    gen: genBondsAngle,
  },
  {
    id: 'radius-diameter',
    title: 'Radius & Diameter',
    instructions: 'Find the missing radius or diameter for each circle.',
    rules: 'diameter = 2 × radius  •  radius = diameter ÷ 2',
    gen: CIRCLE_GENERATORS.radiusDiameter,
  },
  {
    id: 'circumference',
    title: 'Circumference of a Circle',
    instructions: 'Find the distance around each circle. Use π ≈ 3.14.',
    rules: 'Circumference = π × diameter ≈ 3.14 × diameter',
    gen: CIRCLE_GENERATORS.circumference,
    decimals: true,
  },
  {
    id: 'circle-area',
    title: 'Area of a Circle',
    instructions: 'Find the area inside each circle. Use π ≈ 3.14.',
    rules: 'Area = π × radius × radius ≈ 3.14 × r × r',
    gen: CIRCLE_GENERATORS.circleArea,
    decimals: true,
  },
  {
    id: 'pyth-hyp',
    title: 'Pythagoras — Find the Hypotenuse',
    instructions: 'Find the hypotenuse of each right triangle. Use a² + b² = c².',
    rules: 'a² + b² = c²   (c is the hypotenuse — the longest side)',
    gen: TRIANGLE_GENERATORS.hypotenuse,
  },
  {
    id: 'pyth-leg',
    title: 'Pythagoras — Find a Missing Leg',
    instructions: 'Find the missing leg of each right triangle. Use a² + b² = c².',
    rules: 'a² + b² = c²   →   b² = c² − a²',
    gen: TRIANGLE_GENERATORS.missingLeg,
  },
]

export function getTopic(id) {
  return TOPICS.find((t) => t.id === id)
}

// Build `count` problems for a topic (best-effort de-duplication). When
// `wholeOnly`, every problem is guaranteed a whole-number answer.
export function buildProblems(topic, count = 6, wholeOnly = false) {
  const out = []
  let attempts = 0
  while (out.length < count && attempts < 200) {
    const q = wholeOnly ? generateWhole(topic.gen) : topic.gen()
    const key = JSON.stringify([q.figure, q.answer, q.promptTitle, q.angle, q.known, q.given, q.angles, q.sectors, q.tokens])
    if (!out.some((p) => p._key === key)) out.push({ ...q, _key: key })
    attempts++
  }
  return out
}
