// The Math curriculum ladder — the ordered spine of the Curriculum Journey.
//
// This single array IS the sequence: reorder it and the journey re-sequences.
// It doubles as a link tree (each tool's best URL) and a development board (each
// tool's status). Math only for now; starts at Ants & Apples, ends at Ants &
// Statistics.
//
//   status: 'live' — deployed, opens anywhere
//           'dev'  — in development, opens on its local dev-server port
//
// For 'dev' tools we keep the localhost URL so the link works while Warren is
// running that tool locally; swap to a vercel URL once it deploys (status→'live').
//
// Each tool carries several organizing dimensions so the journey can be arranged
// different ways without touching the tools: the array order = the difficulty
// PATH; `strand` = the math domain; `status` = deployment. Add more keys here to
// unlock more arrangements later.

export const MATH_LADDER = [
  {
    id: 'apples', name: 'Ants & Apples', emoji: '🍎', accent: '#ef4444', strand: 'number',
    subject: 'Arithmetic', blurb: 'Counting, adding, subtracting & times tables — where it all begins.',
    status: 'live', url: 'https://warrens-lab.vercel.app/iq/ants-apples/',
  },
  {
    id: 'fractions', name: 'Ants & Fractions', emoji: '🥧', accent: '#f59e0b', strand: 'number',
    subject: 'Fractions', blurb: 'Pieces of a whole — pies, bars, number lines, comparing & equivalence.',
    status: 'live', url: 'https://ants-fractions.vercel.app/',
  },
  {
    id: 'zero-to-one', name: '0 → 1', emoji: '💯', accent: '#06b6d4', strand: 'number',
    subject: 'Percents & decimals', blurb: 'Everything between none and all — percents and decimals.',
    status: 'live', url: 'https://ants-0-1.vercel.app/',
  },
  {
    id: 'exponents', name: 'Ants & Exponents', emoji: '⬆️', accent: '#8b5cf6', strand: 'number',
    subject: 'Exponents', blurb: 'The fast way to multiply — squares, cubes and powers.',
    status: 'live', url: 'https://ants-exponents.vercel.app/',
  },
  {
    id: 'algebra', name: 'Ants & Algebra', emoji: '🧮', accent: '#6366f1', strand: 'algebra',
    subject: 'Solving for x', blurb: 'Find the missing number — the first taste of algebra.',
    status: 'live', url: 'https://warrens-lab.vercel.app/iq/ants-algebra/',
  },
  {
    id: 'algebra-2', name: 'Ants & Algebra 2', emoji: '⚖️', accent: '#a855f7', strand: 'algebra',
    subject: 'Balance Lab', blurb: 'Keep the scale balanced — multi-step equations, hands-on.',
    status: 'dev', url: 'http://localhost:9024/',
  },
  {
    id: 'angles', name: 'Ants & Angles', emoji: '📐', accent: '#10b981', strand: 'geometry',
    subject: 'Geometry & angles', blurb: 'A playground of angles, lines, shapes and triangles.',
    status: 'live', url: 'https://ants-angles.vercel.app/',
  },
  {
    id: 'axes', name: 'Ants & Axes', emoji: '📊', accent: '#0ea5e9', strand: 'geometry',
    subject: 'Coordinate geometry', blurb: 'Points, grids and slopes — finding your way on the plane.',
    status: 'live', url: 'https://ants-axes.vercel.app/',
  },
  {
    id: 'stats', name: 'Ants & Statistics', emoji: '📈', accent: '#14b8a6', strand: 'data',
    subject: 'Statistics', blurb: 'Reading, charting and reasoning about data — the summit.',
    status: 'dev', url: 'http://localhost:9025/',
  },
]

export const STATUS_META = {
  live: { label: 'Live', emoji: '🟢', color: '#10b981' },
  dev: { label: 'In development', emoji: '🚧', color: '#f59e0b' },
}

// Math domains — an alternate way to organize the same tools.
export const STRAND_META = {
  number: { label: 'Number & Operations', emoji: '🔢', color: '#f59e0b' },
  algebra: { label: 'Algebra', emoji: '🧮', color: '#6366f1' },
  geometry: { label: 'Geometry', emoji: '📐', color: '#10b981' },
  data: { label: 'Data & Statistics', emoji: '📈', color: '#14b8a6' },
}

// How the journey can be arranged. Each returns ordered groups of tools.
// 'path' is one group in ladder order; the others bucket by a dimension.
export const ARRANGEMENTS = [
  { id: 'path', label: 'Path', emoji: '🪜' },
  { id: 'strand', label: 'Strand', emoji: '🧭' },
  { id: 'status', label: 'Status', emoji: '🚦' },
]

export function arrange(mode) {
  if (mode === 'strand') {
    return Object.entries(STRAND_META).map(([key, meta]) => ({
      key, meta, tools: MATH_LADDER.filter((t) => t.strand === key),
    })).filter((g) => g.tools.length)
  }
  if (mode === 'status') {
    return ['live', 'dev'].map((key) => ({
      key, meta: STATUS_META[key], tools: MATH_LADDER.filter((t) => t.status === key),
    })).filter((g) => g.tools.length)
  }
  // path — a single group in difficulty order
  return [{ key: 'path', meta: null, tools: MATH_LADDER }]
}

// ── Checklist state (persisted) ─────────────────────────────────────────────
const KEY = 'ants-assessment.curriculum.v1'

export function loadProgress() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY)) || []) } catch { return new Set() }
}

export function saveProgress(set) {
  try { localStorage.setItem(KEY, JSON.stringify([...set])) } catch {}
}
