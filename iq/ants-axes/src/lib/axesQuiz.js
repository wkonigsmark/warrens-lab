// axesQuiz.js — 4 topic generators, 4 difficulty tiers each

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeChoices(correct, distractors) {
  const key = JSON.stringify(correct)
  const seen = new Set([key])
  const pool = []
  for (const d of distractors) {
    const k = JSON.stringify(d)
    if (!seen.has(k)) { seen.add(k); pool.push(d) }
    if (pool.length === 3) break
  }
  const all = shuffle([correct, ...pool.slice(0, 3)])
  return { choices: all, correctIndex: all.findIndex(c => JSON.stringify(c) === key) }
}

// ── Tier Definitions ──────────────────────────────────────────────────────────

export const TIER_DEFS = [
  { id: 'intro',     label: 'Intro',     passBar: 4 },
  { id: 'practice',  label: 'Practice',  passBar: 4 },
  { id: 'competent', label: 'Competent', passBar: 5 },
  { id: 'master',    label: 'Master',    passBar: 5 },
]

export const SESSION_COUNT = 5

// ── Read a Point ─────────────────────────────────────────────────────────────
// Intro:     Q1 only (x,y ≥ 1)
// Practice:  all quadrants, range ±4, easier distractors
// Competent: all quadrants, range ±6
// Master:    all quadrants incl. axis points, tight distractors (±1)

export function genReadPoint(tier = 2) {
  let x, y
  if (tier === 0) {
    x = rnd(1, 5); y = rnd(1, 5)
  } else if (tier === 1) {
    x = rnd(-4, 4); y = rnd(-4, 4)
  } else if (tier === 2) {
    x = rnd(-6, 6); y = rnd(-6, 6)
  } else {
    const onAxis = Math.random() < 0.3
    x = onAxis ? 0 : rnd(-6, 6)
    y = onAxis && x === 0 ? (Math.random() < 0.5 ? rnd(-5, -1) : rnd(1, 5)) : rnd(-6, 6)
  }

  const distractors = tier >= 3
    ? [[y, x], [x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1], [-x, y], [x, -y]]
    : [[y, x], [-x, y], [x, -y], [-x, -y], [x + 1, y], [x, y + 1]]
  const { choices, correctIndex } = makeChoices([x, y], distractors)

  return {
    type: 'read-point',
    points: [{ x, y, color: '#6366f1' }],
    drawLine: false,
    prompt: 'What are the coordinates of the blue point?',
    choices: choices.map(([cx, cy]) => `(${cx}, ${cy})`),
    correctIndex,
  }
}

// ── Find the Slope ────────────────────────────────────────────────────────────
// Intro:     slopes {1,2}, Q1 only
// Practice:  slopes {-2,-1,1,2}, multi-quadrant
// Competent: slopes {-3,-2,-1,1,2,3}, full grid
// Master:    same + slope 0 (horizontal), tighter distractors

export function genSlope(tier = 2) {
  const POOLS = [
    [1, 2],
    [-2, -1, 1, 2],
    [-3, -2, -1, 1, 2, 3],
    [-3, -2, -1, 0, 1, 2, 3],
  ]
  const slopes = POOLS[Math.min(tier, 3)]

  let slope, x1, y1, x2, y2, attempts = 0
  do {
    slope = pick(slopes)
    x1 = tier === 0 ? rnd(0, 2) : rnd(-4, 2)
    y1 = tier === 0 ? rnd(0, 2) : rnd(-4, 2)
    const dx = rnd(1, 3)
    x2 = x1 + dx; y2 = y1 + slope * dx
    attempts++
  } while ((Math.abs(y2) > 6 || Math.abs(x2) > 6) && attempts < 50)

  const distractors = tier >= 3
    ? [slope + 1, slope - 1, -slope, slope + 2].filter(d => d !== slope)
    : [-slope, slope + 1, slope - 1, -slope + 1, 2 * slope].filter(d => d !== slope)
  const { choices, correctIndex } = makeChoices(slope, distractors)

  return {
    type: 'slope',
    points: [
      { x: x1, y: y1, color: '#6366f1', label: 'A' },
      { x: x2, y: y2, color: '#ec4899', label: 'B' },
    ],
    drawLine: true,
    prompt: slope === 0
      ? 'What is the slope of this horizontal line?'
      : 'What is the slope of the line through A and B?',
    choices: choices.map(String),
    correctIndex,
  }
}

// ── Y-Intercept ───────────────────────────────────────────────────────────────
// Intro:     b in 1–4, slopes {1,2}
// Practice:  b in -4..4, slopes {-2,-1,1,2}
// Competent: b in -5..5, all slopes
// Master:    same incl. b=0, tighter distractors

export function genYIntercept(tier = 2) {
  const bRanges = [[1, 4], [-4, 4], [-5, 5], [-5, 5]]
  const slopeSets = [[1, 2], [-2, -1, 1, 2], [-2, -1, 1, 2], [-3, -2, -1, 1, 2, 3]]

  let b, slope, y1, y2, attempts = 0
  do {
    b = rnd(...bRanges[Math.min(tier, 3)])
    if (tier === 3 && Math.random() < 0.2) b = 0
    slope = pick(slopeSets[Math.min(tier, 3)])
    y1 = slope * -2 + b
    y2 = slope * 2 + b
    attempts++
  } while ((Math.abs(y1) > 6 || Math.abs(y2) > 6) && attempts < 50)

  const distractors = tier >= 3
    ? [b + 1, b - 1, b + 2, b - 2, -b].filter(d => d !== b)
    : [b + 1, b - 1, b + 2, b - 2, -b, b + 3].filter(d => d !== b)
  const { choices, correctIndex } = makeChoices(b, distractors)

  return {
    type: 'y-intercept',
    points: [
      { x: -2, y: y1, color: '#6366f1' },
      { x: 2,  y: y2, color: '#6366f1' },
    ],
    drawLine: true,
    prompt: 'Where does the line cross the y-axis?',
    choices: choices.map(v => `y = ${v}`),
    correctIndex,
  }
}

// ── Midpoint ──────────────────────────────────────────────────────────────────
// Intro:     both points in Q1, horizontal segments only (dy=0)
// Practice:  points in Q1+Q2, dy ∈ {-1,0,1}
// Competent: all quadrants, full dy range
// Master:    all quadrants + axis-point endpoints

export function genMidpoint(tier = 2) {
  let mx, my, x1, y1, x2, y2, attempts = 0
  do {
    if (tier === 0) {
      mx = rnd(2, 5); my = rnd(1, 5)
      const dx = rnd(1, 2)
      x1 = mx - dx; y1 = my; x2 = mx + dx; y2 = my
    } else if (tier === 1) {
      mx = rnd(-2, 4); my = rnd(0, 4)
      const dx = rnd(1, 3); const dy = pick([-1, 0, 1])
      x1 = mx - dx; y1 = my - dy; x2 = mx + dx; y2 = my + dy
    } else {
      mx = rnd(-3, 3); my = rnd(-3, 3)
      const dx = rnd(1, 3); const dy = rnd(-2, 2)
      x1 = mx - dx; y1 = my - dy; x2 = mx + dx; y2 = my + dy
    }
    attempts++
  } while (
    (Math.abs(x1) > 6 || Math.abs(y1) > 6 || Math.abs(x2) > 6 || Math.abs(y2) > 6)
    && attempts < 50
  )

  const distractors = [
    [mx + 1, my], [mx, my + 1], [mx - 1, my], [mx, my - 1],
    [mx + 1, my + 1], [-mx, -my], [x1, y1], [x2, y2],
  ]
  const { choices, correctIndex } = makeChoices([mx, my], distractors)

  return {
    type: 'midpoint',
    points: [
      { x: x1, y: y1, color: '#6366f1', label: 'A' },
      { x: x2, y: y2, color: '#ec4899', label: 'B' },
    ],
    drawLine: true,
    prompt: 'What is the midpoint of A and B?',
    choices: choices.map(([cx, cy]) => `(${cx}, ${cy})`),
    correctIndex,
  }
}

// ── Topic + Level Definitions ─────────────────────────────────────────────────

export const TOPICS = [
  {
    id: 'read-point',
    title: 'Read a Point',
    blurb: 'Name the coordinates of a point on the grid',
    accent: '#6366f1',
    emoji: '📍',
    generate: (tier) => genReadPoint(tier),
  },
  {
    id: 'slope',
    title: 'Find the Slope',
    blurb: 'Calculate the slope between two points',
    accent: '#ec4899',
    emoji: '📈',
    generate: (tier) => genSlope(tier),
  },
  {
    id: 'y-intercept',
    title: 'Y-Intercept',
    blurb: 'Find where a line crosses the y-axis',
    accent: '#f59e0b',
    emoji: '✂️',
    generate: (tier) => genYIntercept(tier),
  },
  {
    id: 'midpoint',
    title: 'Midpoint',
    blurb: 'Find the midpoint between two points',
    accent: '#10b981',
    emoji: '⚖️',
    generate: (tier) => genMidpoint(tier),
  },
]

// LEVELS: 4 topics × 4 tiers = 16 levels
export const LEVELS = TOPICS.flatMap((topic) =>
  TIER_DEFS.map((tier, ti) => ({
    id: `${topic.id}-${tier.id}`,
    topicId: topic.id,
    tierId: tier.id,
    tierIndex: ti,
    title: topic.title,
    tierLabel: tier.label,
    passBar: tier.passBar,
    accent: topic.accent,
    emoji: topic.emoji,
    blurb: topic.blurb,
    generate: () => topic.generate(ti),
  }))
)
