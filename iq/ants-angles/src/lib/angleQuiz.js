// Pure question generators for Quiz Mode. Each level exposes generate(rng) ->
// a question object the QuizShell knows how to render and grade. Keeping these
// framework-free means the worksheet generator can reuse them later.
import { classifyAngle } from './angles'
import { TRIANGLE_LEVELS } from './triangleQuiz'
import { CIRCLE_LEVELS } from './circleQuiz'

// Small helpers ----------------------------------------------------------
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
// Random multiple of `step` in [min, max] (inclusive-ish to the step grid).
const randStep = (min, max, step) => randInt(Math.ceil(min / step), Math.floor(max / step)) * step

const TYPE_CHOICES = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex']

// Generate an angle that belongs to a named class.
function angleOfType(type) {
  switch (type) {
    case 'Acute': return randStep(15, 80, 5)
    case 'Right': return 90
    case 'Obtuse': return randStep(95, 170, 5)
    case 'Straight': return 180
    case 'Reflex': return randStep(190, 330, 5)
    default: return 45
  }
}

// Level 1 — Name the Angle (visual multiple choice) ----------------------
function genName() {
  // Weight toward the everyday three; still include straight/reflex sometimes.
  const type = pick(['Acute', 'Acute', 'Right', 'Obtuse', 'Obtuse', 'Straight', 'Reflex'])
  const angle = angleOfType(type)
  return {
    type: 'choice',
    figure: 'protractor',
    angle,
    showLabel: false,
    promptTitle: 'What kind of angle is this?',
    promptText: 'Look at how far the angle opens.',
    choices: TYPE_CHOICES,
    answer: type,
    formatAnswer: `${type} angle (${angle}°)`,
    formatGuess: (g) => `${g} angle`,
  }
}

// Level 2 — Read the Angle (read the protractor, type degrees) -----------
function genRead() {
  const angle = randStep(10, 170, 10)
  return {
    type: 'number',
    figure: 'protractor',
    angle,
    showLabel: false,
    tolerance: 3, // forgiving — they're reading a scale
    promptTitle: 'How many degrees is this angle?',
    promptText: 'Read it off the protractor.',
    unit: '°',
    answer: angle,
    formatAnswer: `${angle}°`,
    formatGuess: (g) => `${g}°`,
  }
}

// Level 3 — Complement & Supplement --------------------------------------
function genPartner() {
  const kind = pick(['complement', 'supplement'])
  if (kind === 'complement') {
    const angle = randStep(10, 80, 5)
    return {
      type: 'number',
      figure: 'protractor',
      angle,
      showLabel: true,
      tolerance: 0,
      promptTitle: `Find the COMPLEMENT of this ${angle}° angle.`,
      promptText: 'Two angles are complementary when they add up to 90°.',
      unit: '°',
      hint: `${angle}° + ? = 90°`,
      answer: 90 - angle,
      formatAnswer: `${90 - angle}°`,
      formatGuess: (g) => `${g}°`,
    }
  }
  const angle = randStep(15, 165, 5)
  return {
    type: 'number',
    figure: 'protractor',
    angle,
    showLabel: true,
    tolerance: 0,
    promptTitle: `Find the SUPPLEMENT of this ${angle}° angle.`,
    promptText: 'Two angles are supplementary when they add up to 180°.',
    unit: '°',
    hint: `${angle}° + ? = 180°`,
    answer: 180 - angle,
    formatAnswer: `${180 - angle}°`,
    formatGuess: (g) => `${g}°`,
  }
}

// Level 4 — Missing Angle on a Straight Line -----------------------------
function genStraightLine() {
  const known = randStep(20, 160, 5)
  return {
    type: 'number',
    figure: 'linePair',
    known,
    tolerance: 0,
    promptTitle: 'Find the missing angle.',
    promptText: 'Angles on a straight line always add up to 180°.',
    unit: '°',
    hint: `${known}° + ? = 180°`,
    answer: 180 - known,
    formatAnswer: `${180 - known}°`,
    formatGuess: (g) => `${g}°`,
  }
}

// Level 5 — Angles around a Point (sum 360°) -----------------------------
function genAroundPoint() {
  let known
  for (;;) {
    const n = pick([2, 2, 3])
    known = Array.from({ length: n }, () => randStep(40, 140, 10))
    const sum = known.reduce((a, b) => a + b, 0)
    const missing = 360 - sum
    if (missing >= 30 && missing <= 160) {
      const sectors = [
        ...known.map((deg) => ({ deg, label: `${deg}°` })),
        { deg: missing, label: '?' },
      ]
      return {
        type: 'number',
        figure: 'pointSum',
        sectors,
        tolerance: 0,
        promptTitle: 'Find the missing angle.',
        promptText: 'Angles around a point add up to 360°.',
        unit: '°',
        hint: `${known.join('° + ')}° + ? = 360°`,
        answer: missing,
        formatAnswer: `${missing}°`,
        formatGuess: (g) => `${g}°`,
      }
    }
  }
}

// Level 6 — Vertical Angles ----------------------------------------------
function genVertical() {
  const given = randStep(35, 145, 5)
  const variant = pick(['vertical', 'adjacent'])
  const isVert = variant === 'vertical'
  return {
    type: 'number',
    figure: 'vertical',
    given,
    variant,
    tolerance: 0,
    promptTitle: 'Find the missing angle.',
    promptText: isVert
      ? 'Vertical (opposite) angles are equal.'
      : 'Angles on a straight line add up to 180°.',
    unit: '°',
    hint: isVert ? `equal to ${given}°` : `${given}° + ? = 180°`,
    answer: isVert ? given : 180 - given,
    formatAnswer: `${isVert ? given : 180 - given}°`,
    formatGuess: (g) => `${g}°`,
  }
}

// Level 7 — Missing Angle in a Triangle (sum 180°) -----------------------
function genTriangle() {
  let a, b, c
  do {
    a = randStep(35, 90, 5)
    b = randStep(35, 90, 5)
    c = 180 - a - b
  } while (c < 30 || c > 110)
  const angles = [a, b, c]
  const unknownIndex = randInt(0, 2)
  const answer = angles[unknownIndex]
  const known = angles.filter((_, i) => i !== unknownIndex)
  return {
    type: 'number',
    figure: 'triangle',
    angles,
    unknownIndex,
    tolerance: 0,
    promptTitle: 'Find the missing angle in the triangle.',
    promptText: 'The three angles inside a triangle add up to 180°.',
    unit: '°',
    hint: `${known[0]}° + ${known[1]}° + ? = 180°`,
    answer,
    formatAnswer: `${answer}°`,
    formatGuess: (g) => `${g}°`,
  }
}

// Level registry ---------------------------------------------------------
const ANGLE_LEVELS = [
  {
    id: 1,
    title: 'Name the Angle',
    blurb: 'Acute, right, obtuse, straight or reflex? Spot the type by sight.',
    accent: '#22c55e',
    generate: genName,
  },
  {
    id: 2,
    title: 'Read the Angle',
    blurb: 'Read the protractor and type the measure in degrees.',
    accent: '#3b82f6',
    generate: genRead,
  },
  {
    id: 3,
    title: 'Complement & Supplement',
    blurb: 'Find the partner angle that completes 90° or 180°.',
    accent: '#8b5cf6',
    generate: genPartner,
  },
  {
    id: 4,
    title: 'Missing Angle on a Line',
    blurb: 'Angles on a straight line add to 180° — find the gap.',
    accent: '#f59e0b',
    generate: genStraightLine,
  },
  {
    id: 5,
    title: 'Angles Around a Point',
    blurb: 'All the angles around a point add up to 360°.',
    accent: '#14b8a6',
    generate: genAroundPoint,
  },
  {
    id: 6,
    title: 'Vertical Angles',
    blurb: 'Two crossing lines: spot equal angles and linear pairs.',
    accent: '#ec4899',
    generate: genVertical,
  },
  {
    id: 7,
    title: 'Angles in a Triangle',
    blurb: 'The three angles inside any triangle sum to 180°.',
    accent: '#0ea5e9',
    generate: genTriangle,
  },
]

// Grouped in the picker by category, in this order.
export const LEVELS = [
  ...ANGLE_LEVELS.map((l) => ({ ...l, category: 'Angles' })),
  ...TRIANGLE_LEVELS,
  ...CIRCLE_LEVELS,
]

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id)
}

// Generators keyed for reuse by the worksheet builder.
export const GENERATORS = {
  partner: genPartner,
  line: genStraightLine,
  point: genAroundPoint,
  vertical: genVertical,
  triangle: genTriangle,
}

// Grade a single answer for any level type.
export function isCorrect(q, value) {
  if (q.type === 'choice') return value === q.answer
  if (q.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return false
    return Math.abs(n - q.answer) <= (q.tolerance || 0)
  }
  return false
}

export { classifyAngle }
