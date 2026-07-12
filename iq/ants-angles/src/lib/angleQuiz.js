// Pure question generators for Quiz Mode.
// Each topic has 4 generators (one per tier) — Intro through Master —
// with genuinely increasing difficulty, not just more of the same.
import { classifyAngle } from './angles'
import { TRIANGLE_LEVELS } from './triangleQuiz'
import { CIRCLE_LEVELS } from './circleQuiz'

// ── Helpers ──────────────────────────────────────────────────────────────
const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick     = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randStep = (min, max, step) => randInt(Math.ceil(min / step), Math.floor(max / step)) * step

const TYPE_CHOICES = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex']

function angleOfType(type) {
  switch (type) {
    case 'Acute':    return randStep(15, 80, 5)
    case 'Right':    return 90
    case 'Obtuse':   return randStep(95, 170, 5)
    case 'Straight': return 180
    case 'Reflex':   return randStep(190, 330, 5)
    default:         return 45
  }
}

function nameQ(type, angle) {
  return {
    type: 'choice', figure: 'protractor', angle, showLabel: false,
    promptTitle: 'What kind of angle is this?',
    promptText:  'Look at how far the angle opens.',
    choices: TYPE_CHOICES,
    answer: type,
    formatAnswer: `${type} angle (${angle}°)`,
    formatGuess:  (g) => `${g} angle`,
  }
}

function readQ(angle) {
  return {
    type: 'number', figure: 'protractor', angle, showLabel: false, tolerance: 3,
    promptTitle: 'How many degrees is this angle?',
    promptText:  'Read it off the protractor.',
    unit: '°', answer: angle,
    formatAnswer: `${angle}°`, formatGuess: (g) => `${g}°`,
  }
}

function complementQ(angle) {
  return {
    type: 'number', figure: 'protractor', angle, showLabel: true, tolerance: 0,
    promptTitle: `Find the COMPLEMENT of this ${angle}° angle.`,
    promptText:  'Two angles are complementary when they add up to 90°.',
    unit: '°', hint: `${angle}° + ? = 90°`,
    answer: 90 - angle,
    formatAnswer: `${90 - angle}°`, formatGuess: (g) => `${g}°`,
  }
}

function supplementQ(angle) {
  return {
    type: 'number', figure: 'protractor', angle, showLabel: true, tolerance: 0,
    promptTitle: `Find the SUPPLEMENT of this ${angle}° angle.`,
    promptText:  'Two angles are supplementary when they add up to 180°.',
    unit: '°', hint: `${angle}° + ? = 180°`,
    answer: 180 - angle,
    formatAnswer: `${180 - angle}°`, formatGuess: (g) => `${g}°`,
  }
}

function straightLineQ(known) {
  return {
    type: 'number', figure: 'linePair', known, tolerance: 0,
    promptTitle: 'Find the missing angle.',
    promptText:  'Angles on a straight line always add up to 180°.',
    unit: '°', hint: `${known}° + ? = 180°`,
    answer: 180 - known,
    formatAnswer: `${180 - known}°`, formatGuess: (g) => `${g}°`,
  }
}

function verticalQ(given, variant) {
  const isVert = variant === 'vertical'
  return {
    type: 'number', figure: 'vertical', given, variant, tolerance: 0,
    promptTitle: 'Find the missing angle.',
    promptText:  isVert ? 'Vertical (opposite) angles are equal.' : 'Angles on a straight line add up to 180°.',
    unit: '°', hint: isVert ? `equal to ${given}°` : `${given}° + ? = 180°`,
    answer: isVert ? given : 180 - given,
    formatAnswer: `${isVert ? given : 180 - given}°`, formatGuess: (g) => `${g}°`,
  }
}

function triangleQ(angles) {
  const unknownIndex = randInt(0, 2)
  const answer = angles[unknownIndex]
  const known  = angles.filter((_, i) => i !== unknownIndex)
  return {
    type: 'number', figure: 'triangle', angles, unknownIndex, tolerance: 0,
    promptTitle: 'Find the missing angle in the triangle.',
    promptText:  'The three angles inside a triangle add up to 180°.',
    unit: '°', hint: `${known[0]}° + ${known[1]}° + ? = 180°`,
    answer,
    formatAnswer: `${answer}°`, formatGuess: (g) => `${g}°`,
  }
}

// ── Topic 1: Name the Angle ───────────────────────────────────────────────
// Intro    — only Acute / Right / Obtuse, canonical angles (30°, 45°, 60°, 90°, 120°, 135°, 150°)
// Practice — all 5 types, any valid angle
// Competent — heavier Straight + Reflex, any valid angle
// Master   — near-boundary angles that require careful visual discrimination

function genNameIntro() {
  const type = pick(['Acute', 'Acute', 'Acute', 'Right', 'Obtuse', 'Obtuse', 'Obtuse'])
  const angle = type === 'Acute'  ? pick([30, 45, 60])
              : type === 'Right'  ? 90
              :                     pick([120, 135, 150])
  return nameQ(type, angle)
}

function genNamePractice() {
  const type  = pick(['Acute', 'Acute', 'Right', 'Obtuse', 'Obtuse', 'Straight', 'Reflex'])
  const angle = angleOfType(type)
  return nameQ(type, angle)
}

function genNameCompetent() {
  const type  = pick(['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Reflex'])
  const angle = angleOfType(type)
  return nameQ(type, angle)
}

function genNameMaster() {
  // Near-boundary angles — a few degrees either side of 90°, 180°, 0°/360°
  const cases = [
    { type: 'Acute',    angle: pick([82, 85, 87, 88]) },
    { type: 'Obtuse',   angle: pick([92, 95, 98, 100]) },
    { type: 'Obtuse',   angle: pick([170, 172, 175, 178]) },
    { type: 'Straight', angle: 180 },
    { type: 'Reflex',   angle: pick([182, 185, 190, 200]) },
    { type: 'Reflex',   angle: pick([260, 270, 300, 315]) },
    { type: 'Acute',    angle: pick([10, 12, 15, 18]) },  // very shallow — easy to misread
  ]
  const { type, angle } = pick(cases)
  return nameQ(type, angle)
}

// ── Topic 2: Read the Angle ───────────────────────────────────────────────
// Intro    — only the 5 "clock" angles (30, 60, 90, 120, 150)
// Practice — multiples of 15°
// Competent — multiples of 10°
// Master   — multiples of 5° (full protractor precision)

function genReadIntro()     { return readQ(pick([30, 60, 90, 120, 150])) }
function genReadPractice()  { return readQ(randStep(15, 165, 15)) }
function genReadCompetent() { return readQ(randStep(10, 170, 10)) }
function genReadMaster()    { return readQ(randStep(10, 170, 5)) }

// ── Topic 3: Complement & Supplement ─────────────────────────────────────
// Intro    — complement only, round-10° angles (easy arithmetic)
// Practice — both, multiples of 10°
// Competent — both, any multiple of 5°
// Master   — both, non-round multiples of 5° that force real mental arithmetic
//            (e.g. complement of 37° = 53°; supplement of 143° = 37°)

function genPartnerIntro() {
  return complementQ(pick([10, 20, 30, 40, 50, 60, 70, 80]))
}

function genPartnerPractice() {
  const kind = pick(['complement', 'supplement'])
  return kind === 'complement'
    ? complementQ(randStep(10, 80, 10))
    : supplementQ(randStep(20, 160, 20))
}

function genPartnerCompetent() {
  const kind = pick(['complement', 'supplement'])
  return kind === 'complement'
    ? complementQ(randStep(10, 80, 5))
    : supplementQ(randStep(15, 165, 5))
}

function genPartnerMaster() {
  // Avoid multiples of 10 → forces genuine arithmetic instead of pattern recognition
  const kind = pick(['complement', 'supplement', 'supplement'])
  if (kind === 'complement') {
    const angle = pick([15, 25, 35, 45, 55, 65, 75])
    return complementQ(angle)
  }
  // Supplement — include near-boundary inputs (answers are small and surprising)
  const angle = pick([15, 25, 35, 55, 65, 95, 105, 115, 125, 145, 155, 165])
  return supplementQ(angle)
}

// ── Topic: Number Bonds — the arithmetic engine behind every angle rule ──
// Same families as the worksheet warm-ups (9·18·36 and 90·180·360).
// Intro    — bonds of 9 & 18 (single-digit facts)
// Practice — bonds of 36 & 90 (round tens)
// Competent — bonds of 90 & 180 (multiples of 5)
// Master   — bonds of 180 & 360, non-round values (forces real column subtraction)

function bondQ(target, known, form) {
  const answer = target - known
  const tokens = form === 'subtract'
    ? [target, '−', known, '=', '?']
    : [known, '+', '?', '=', target]
  return {
    type: 'number', figure: 'bonds', tokens, tolerance: 0,
    promptTitle: 'Find the missing number.',
    promptText:  `Number bonds of ${target}.`,
    hint: form === 'subtract' ? `${known} + ? = ${target}` : `${target} − ${known} = ?`,
    answer,
    formatAnswer: `${answer}`, formatGuess: (g) => `${g}`,
  }
}

function genBondsIntro() {
  const target = pick([9, 9, 18])
  const known  = target === 9 ? randInt(1, 8) : randStep(2, 16, 2)
  return bondQ(target, known, pick(['missing-addend', 'subtract']))
}

function genBondsPractice() {
  const target = pick([36, 90, 90])
  const known  = target === 36 ? randStep(2, 34, 2) : randStep(10, 80, 10)
  return bondQ(target, known, pick(['missing-addend', 'subtract']))
}

function genBondsCompetent() {
  const target = pick([90, 180, 180])
  const known  = target === 90 ? randStep(5, 85, 5) : randStep(5, 175, 5)
  return bondQ(target, known, pick(['missing-addend', 'subtract']))
}

function genBondsMaster() {
  const target = pick([180, 360, 360])
  let known
  do { known = randInt(21, target - 21) } while (known % 10 === 0)
  return bondQ(target, known, pick(['missing-addend', 'subtract', 'subtract']))
}

// ── Topic 4: Missing Angle on a Line ─────────────────────────────────────
// Intro    — the six "landmark" values (30, 45, 60, 90, 120, 150)
// Practice — multiples of 10°
// Competent — multiples of 5°
// Master   — odd multiples of 5 that avoid round answers (forces real subtraction)

function genStraightLineIntro()     { return straightLineQ(pick([30, 45, 60, 90, 120, 135, 150])) }
function genStraightLinePractice()  { return straightLineQ(randStep(20, 160, 10)) }
function genStraightLineCompetent() { return straightLineQ(randStep(20, 160, 5)) }
function genStraightLineMaster() {
  // Non-multiples-of-10 so subtraction from 180 isn't trivial
  return straightLineQ(pick([25, 35, 55, 65, 75, 85, 95, 105, 115, 125, 145, 155]))
}

// ── Topic 5: Angles Around a Point ───────────────────────────────────────
// Intro    — 2 known angles, multiples of 90° (easy: 90+90+?=360 → 180)
// Practice — 2 known angles, multiples of 30°
// Competent — 2–3 known angles, multiples of 10°
// Master   — 3 known angles, multiples of 5°, larger sums to compute

function aroundPointQ(known) {
  const sum     = known.reduce((a, b) => a + b, 0)
  const missing = 360 - sum
  const sectors = [
    ...known.map((deg) => ({ deg, label: `${deg}°` })),
    { deg: missing, label: '?' },
  ]
  return {
    type: 'number', figure: 'pointSum', sectors, tolerance: 0,
    promptTitle: 'Find the missing angle.',
    promptText:  'Angles around a point add up to 360°.',
    unit: '°', hint: `${known.join('° + ')}° + ? = 360°`,
    answer: missing,
    formatAnswer: `${missing}°`, formatGuess: (g) => `${g}°`,
  }
}

function genAroundPointIntro() {
  let known
  for (;;) {
    known = [pick([60, 90, 120]), pick([60, 90, 120])]
    const missing = 360 - known.reduce((a, b) => a + b, 0)
    if (missing >= 60 && missing <= 180) return aroundPointQ(known)
  }
}

function genAroundPointPractice() {
  let known
  for (;;) {
    known = [randStep(30, 150, 30), randStep(30, 150, 30)]
    const missing = 360 - known.reduce((a, b) => a + b, 0)
    if (missing >= 30 && missing <= 180) return aroundPointQ(known)
  }
}

function genAroundPointCompetent() {
  let known
  for (;;) {
    const n = pick([2, 2, 3])
    known = Array.from({ length: n }, () => randStep(40, 140, 10))
    const missing = 360 - known.reduce((a, b) => a + b, 0)
    if (missing >= 30 && missing <= 160) return aroundPointQ(known)
  }
}

function genAroundPointMaster() {
  let known
  for (;;) {
    // 3 known angles, multiples of 5 — sum gets larger, harder to compute
    known = [randStep(40, 120, 5), randStep(40, 120, 5), randStep(40, 120, 5)]
    const missing = 360 - known.reduce((a, b) => a + b, 0)
    if (missing >= 25 && missing <= 120) return aroundPointQ(known)
  }
}

// ── Topic 6: Vertical Angles ──────────────────────────────────────────────
// Intro    — vertical only (equal, trivial)
// Practice — 50/50 vertical and adjacent
// Competent — 70% adjacent (harder: must subtract from 180°)
// Master   — adjacent only, non-round angles (real subtraction required)

function genVerticalIntro()     { return verticalQ(randStep(30, 150, 10), 'vertical') }
function genVerticalPractice()  { return verticalQ(randStep(35, 145, 5), pick(['vertical', 'adjacent'])) }
function genVerticalCompetent() { return verticalQ(randStep(35, 145, 5), pick(['adjacent', 'adjacent', 'vertical'])) }
function genVerticalMaster() {
  // Adjacent only, non-round angles
  return verticalQ(pick([35, 40, 55, 65, 70, 80, 100, 110, 115, 125, 140, 145]), 'adjacent')
}

// ── Topic 7: Angles in a Triangle ────────────────────────────────────────
// Intro    — always a right triangle (90 + a + b = 180 is easier to reason)
// Practice — one angle is a "landmark" (30, 45, 60, 90) to anchor thinking
// Competent — any valid triangle (current behavior)
// Master   — all 3 angles between 25–85° (no easy anchor, harder sum)

function genTriangleIntro() {
  let b, c
  do { b = randStep(25, 65, 5); c = 90 - b } while (c < 20)
  return triangleQ([90, b, c])
}

function genTrianglePractice() {
  const a = pick([30, 45, 60, 90])
  let b, c
  do { b = randStep(20, 90, 5); c = 180 - a - b } while (c < 20 || c > 120)
  return triangleQ([a, b, c])
}

function genTriangleCompetent() {
  let a, b, c
  do { a = randStep(35, 90, 5); b = randStep(35, 90, 5); c = 180 - a - b } while (c < 30 || c > 110)
  return triangleQ([a, b, c])
}

function genTriangleMaster() {
  // No angle over 85° — removes the "obvious right angle" shortcut
  let a, b, c
  do { a = randStep(25, 85, 5); b = randStep(25, 85, 5); c = 180 - a - b } while (c < 25 || c > 85)
  return triangleQ([a, b, c])
}

// ── Tier definitions ──────────────────────────────────────────────────────

// ── MASTERY BAR — the tuning knobs ────────────────────────────────────────
// A session passes only if ALL THREE gates clear:
//   passBar — correct answers required
//   speedMs — winsorized avg ms per question must be under this (null = no gate)
//   maxHints — hints allowed per session before the pass is void (null = unlimited)
// Deliberately brutal right now: we're probing for the difficulty inflection
// point. Tune these four rows to move the bar; everything downstream
// (quiz gates, result screens, cockpit, tier tracks) follows automatically.
export const TIER_DEFS = [
  { id: 'intro',     label: 'Intro',     count: 5,  passBar: 4,  speedMs: null,  maxHints: null },
  { id: 'practice',  label: 'Practice',  count: 8,  passBar: 7,  speedMs: 10000, maxHints: 2 },
  { id: 'competent', label: 'Competent', count: 10, passBar: 9,  speedMs: 7000,  maxHints: 1 },
  { id: 'master',    label: 'Master',    count: 10, passBar: 10, speedMs: 4000,  maxHints: 0 },
]

// ── Topic definitions — one entry per concept, 4 generators per tier ──────

export const ANGLE_TOPIC_DEFS = [
  {
    id: 'name-the-angle', title: 'Name the Angle', category: 'Angles',
    blurb: 'Acute, right, obtuse, straight or reflex? Spot the type by sight.',
    accent: '#22c55e',
    generates: [genNameIntro, genNamePractice, genNameCompetent, genNameMaster],
  },
  {
    id: 'read-the-angle', title: 'Read the Angle', category: 'Angles',
    blurb: 'Read the protractor and find the measure in degrees.',
    accent: '#3b82f6',
    generates: [genReadIntro, genReadPractice, genReadCompetent, genReadMaster],
  },
  {
    id: 'number-bonds', title: 'Number Bonds', category: 'Angles',
    blurb: 'Fast facts for 9·18·36 and 90·180·360 — the engine behind every angle rule.',
    accent: '#f97316',
    generates: [genBondsIntro, genBondsPractice, genBondsCompetent, genBondsMaster],
  },
  {
    id: 'complement-supplement', title: 'Complement & Supplement', category: 'Angles',
    blurb: 'Find the partner angle that completes 90° or 180°.',
    accent: '#8b5cf6',
    generates: [genPartnerIntro, genPartnerPractice, genPartnerCompetent, genPartnerMaster],
  },
  {
    id: 'missing-angle-on-a-line', title: 'Missing Angle on a Line', category: 'Angles',
    blurb: 'Angles on a straight line add to 180° — find the gap.',
    accent: '#f59e0b',
    generates: [genStraightLineIntro, genStraightLinePractice, genStraightLineCompetent, genStraightLineMaster],
  },
  {
    id: 'angles-around-a-point', title: 'Angles Around a Point', category: 'Angles',
    blurb: 'All the angles around a point add up to 360°.',
    accent: '#14b8a6',
    generates: [genAroundPointIntro, genAroundPointPractice, genAroundPointCompetent, genAroundPointMaster],
  },
  {
    id: 'vertical-angles', title: 'Vertical Angles', category: 'Angles',
    blurb: 'Two crossing lines: spot equal angles and linear pairs.',
    accent: '#ec4899',
    generates: [genVerticalIntro, genVerticalPractice, genVerticalCompetent, genVerticalMaster],
  },
  {
    id: 'angles-in-a-triangle', title: 'Angles in a Triangle', category: 'Angles',
    blurb: 'The three angles inside any triangle sum to 180°.',
    accent: '#0ea5e9',
    generates: [genTriangleIntro, genTrianglePractice, genTriangleCompetent, genTriangleMaster],
  },
]

// ── Expand topics into flat level list ────────────────────────────────────

const TIERED_ANGLE_LEVELS = ANGLE_TOPIC_DEFS.flatMap((topic) =>
  TIER_DEFS.map((tier, tierIndex) => ({
    id: `${topic.id}-${tier.id}`,
    topicId: topic.id,
    tierId: tier.id,
    tierIndex,
    tierLabel: tier.label,
    title: topic.title,
    blurb: topic.blurb,
    accent: topic.accent,
    category: topic.category,
    count: tier.count,
    passBar: tier.passBar,
    speedMs: tier.speedMs,
    maxHints: tier.maxHints,
    generate: topic.generates[tierIndex],
    tiered: true,
  }))
)

const TRIANGLE_LEVELS_WRAPPED = TRIANGLE_LEVELS.map((l) => ({
  ...l, count: 5, passBar: 4, speedMs: null, maxHints: null, tiered: false,
}))
const CIRCLE_LEVELS_WRAPPED = CIRCLE_LEVELS.map((l) => ({
  ...l, count: 5, passBar: 4, speedMs: null, maxHints: null, tiered: false,
}))

export const LEVELS = [
  ...TIERED_ANGLE_LEVELS,
  ...TRIANGLE_LEVELS_WRAPPED,
  ...CIRCLE_LEVELS_WRAPPED,
]

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id)
}

// Generators keyed for reuse by the worksheet builder.
export const GENERATORS = {
  partner:    genPartnerCompetent,  // worksheet uses the mid-difficulty variant
  line:       genStraightLineCompetent,
  point:      genAroundPointCompetent,
  vertical:   genVerticalCompetent,
  triangle:   genTriangleCompetent,
}

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
