// axesQuiz.js — 4 topic generators for Ants & Axes (all multiple-choice)

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

// Build 4 distinct choices with correct one included, shuffled.
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
  return {
    choices: all,
    correctIndex: all.findIndex(c => JSON.stringify(c) === key),
  }
}

// ── Read a Point ─────────────────────────────────────────────────────────────

export function genReadPoint() {
  const x = rnd(-6, 6), y = rnd(-6, 6)

  const distractors = [[y, x], [-x, y], [x, -y], [-x, -y], [x + 1, y], [x, y + 1]]
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

export function genSlope() {
  const SLOPES = [-3, -2, -1, 1, 2, 3]
  let slope, x1, y1, x2, y2, attempts = 0
  do {
    slope = pick(SLOPES)
    x1 = rnd(-4, 2); y1 = rnd(-4, 2)
    const dx = rnd(1, 3)
    x2 = x1 + dx; y2 = y1 + slope * dx
    attempts++
  } while ((Math.abs(y2) > 6 || Math.abs(x2) > 6) && attempts < 50)

  const distractors = [-slope, slope + 1, slope - 1, -slope + 1, -slope - 1, 2 * slope]
    .filter(d => d !== slope)
  const { choices, correctIndex } = makeChoices(slope, distractors)

  return {
    type: 'slope',
    points: [
      { x: x1, y: y1, color: '#6366f1', label: 'A' },
      { x: x2, y: y2, color: '#ec4899', label: 'B' },
    ],
    drawLine: true,
    prompt: 'What is the slope of the line through A and B?',
    choices: choices.map(String),
    correctIndex,
  }
}

// ── Y-Intercept ───────────────────────────────────────────────────────────────

export function genYIntercept() {
  let b, slope, y1, y2, attempts = 0
  do {
    b = rnd(-4, 4)
    slope = pick([-2, -1, 1, 2])
    y1 = slope * -2 + b
    y2 = slope * 2 + b
    attempts++
  } while ((Math.abs(y1) > 6 || Math.abs(y2) > 6) && attempts < 50)

  const distractors = [b + 1, b - 1, b + 2, b - 2, -b, b + 3].filter(d => d !== b)
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

export function genMidpoint() {
  let mx, my, dx, dy, x1, y1, x2, y2, attempts = 0
  do {
    mx = rnd(-3, 3); my = rnd(-3, 3)
    dx = rnd(1, 3); dy = rnd(-2, 2)
    x1 = mx - dx; y1 = my - dy
    x2 = mx + dx; y2 = my + dy
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

// ── Topic Definitions ─────────────────────────────────────────────────────────

export const TOPICS = [
  {
    id: 'read-point',
    title: 'Read a Point',
    blurb: 'Name the coordinates of a point on the grid',
    accent: '#6366f1',
    emoji: '📍',
    generate: genReadPoint,
  },
  {
    id: 'slope',
    title: 'Find the Slope',
    blurb: 'Calculate the slope between two points',
    accent: '#ec4899',
    emoji: '📈',
    generate: genSlope,
  },
  {
    id: 'y-intercept',
    title: 'Y-Intercept',
    blurb: 'Find where a line crosses the y-axis',
    accent: '#f59e0b',
    emoji: '✂️',
    generate: genYIntercept,
  },
  {
    id: 'midpoint',
    title: 'Midpoint',
    blurb: 'Find the midpoint between two points',
    accent: '#10b981',
    emoji: '⚖️',
    generate: genMidpoint,
  },
]

export const SESSION_COUNT = 5  // questions per session
