import { useState, useMemo } from 'react'
import WorksheetChart from './WorksheetChart'

const MAX_VALUE = 12

// ----- Problem generators per level -----

function generateLevel1Problems() {
  const problems = []
  let attempts = 0
  while (problems.length < 4 && attempts < 200) {
    const p1 = {
      x: Math.floor(Math.random() * (MAX_VALUE + 1)),
      y: Math.floor(Math.random() * (MAX_VALUE + 1)),
    }
    const p2 = {
      x: Math.floor(Math.random() * (MAX_VALUE + 1)),
      y: Math.floor(Math.random() * (MAX_VALUE + 1)),
    }
    // Avoid identical points within a problem
    if (p1.x === p2.x && p1.y === p2.y) {
      attempts++
      continue
    }
    // Avoid duplicate problems on the same worksheet
    const dup = problems.some(
      (q) =>
        (q.p1.x === p1.x && q.p1.y === p1.y && q.p2.x === p2.x && q.p2.y === p2.y) ||
        (q.p1.x === p2.x && q.p1.y === p2.y && q.p2.x === p1.x && q.p2.y === p1.y)
    )
    if (!dup) problems.push({ p1, p2 })
    attempts++
  }
  return problems
}

function generateSlopeProblem({ allowNegative }) {
  // 1) Pick slope first (uniform across allowed range)
  let slope
  if (allowNegative) {
    // -3..3 excluding 0
    slope = -3 + Math.floor(Math.random() * 7)
    if (slope === 0) slope = 1
  } else {
    slope = 1 + Math.floor(Math.random() * 5) // 1..5
  }

  // 2) Pick dx so |dy| = |slope * dx| fits on the grid (dy <= MAX_VALUE)
  const maxDxBySlope = Math.floor(MAX_VALUE / Math.abs(slope))
  const maxDx = Math.min(4, maxDxBySlope)
  const dx = 1 + Math.floor(Math.random() * maxDx)
  const dy = slope * dx

  // 3) Position the line anywhere on the grid such that both points stay in bounds
  //    x1 in [0, MAX_VALUE - dx]
  //    y1 in [max(0, -dy), min(MAX_VALUE, MAX_VALUE - dy)]
  const x1 = Math.floor(Math.random() * (MAX_VALUE - dx + 1))
  const minY1 = Math.max(0, -dy)
  const maxY1 = Math.min(MAX_VALUE, MAX_VALUE - dy)
  const y1 = minY1 + Math.floor(Math.random() * (maxY1 - minY1 + 1))

  return {
    p1: { x: x1, y: y1 },
    p2: { x: x1 + dx, y: y1 + dy },
    slope,
  }
}

function generateLevel2Problems(allowNegative) {
  const problems = []
  let attempts = 0
  while (problems.length < 4 && attempts < 200) {
    const q = generateSlopeProblem({ allowNegative })
    if (q) {
      const dup = problems.some(
        (r) =>
          r.p1.x === q.p1.x && r.p1.y === q.p1.y && r.p2.x === q.p2.x && r.p2.y === q.p2.y
      )
      if (!dup) problems.push(q)
    }
    attempts++
  }
  return problems
}

function generateLevel3Problems() {
  const problems = []
  let attempts = 0
  while (problems.length < 4 && attempts < 200) {
    const yIntercept = 1 + Math.floor(Math.random() * (MAX_VALUE - 2)) // 1-10
    let slope = -2 + Math.floor(Math.random() * 5) // -2 to 2
    if (slope === 0) slope = 1
    const dx = 1 + Math.floor(Math.random() * 2)
    const x1 = 1 + Math.floor(Math.random() * (MAX_VALUE - 3))
    const y1 = Math.round(slope * x1 + yIntercept)
    const x2 = x1 + dx
    const y2 = Math.round(slope * x2 + yIntercept)
    if (y1 >= 0 && y1 <= MAX_VALUE && y2 >= 0 && y2 <= MAX_VALUE) {
      const q = { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 }, slope, yIntercept }
      const dup = problems.some(
        (r) =>
          r.p1.x === q.p1.x && r.p1.y === q.p1.y && r.p2.x === q.p2.x && r.p2.y === q.p2.y
      )
      if (!dup) problems.push(q)
    }
    attempts++
  }
  return problems
}

// Pythagorean triples (positive, fit in 0-12 grid) — keeps distance whole-number
// for the worksheet so kids can verify clean answers.
const PYTH_TRIPLES = [
  [3, 4],
  [4, 3],
  [6, 8],
  [8, 6],
  [5, 12],
  [12, 5],
  [9, 12],
  [12, 9],
]

function generateMidpointProblem() {
  const [absDx, absDy] = PYTH_TRIPLES[Math.floor(Math.random() * PYTH_TRIPLES.length)]
  const dx = Math.random() < 0.5 ? absDx : -absDx
  const dy = Math.random() < 0.5 ? absDy : -absDy
  // Position so both points fit in [0, MAX_VALUE]
  const minX1 = Math.max(0, -dx)
  const maxX1 = Math.min(MAX_VALUE, MAX_VALUE - dx)
  const minY1 = Math.max(0, -dy)
  const maxY1 = Math.min(MAX_VALUE, MAX_VALUE - dy)
  const x1 = minX1 + Math.floor(Math.random() * (maxX1 - minX1 + 1))
  const y1 = minY1 + Math.floor(Math.random() * (maxY1 - minY1 + 1))
  const x2 = x1 + dx
  const y2 = y1 + dy
  const distance = Math.sqrt(dx * dx + dy * dy)
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  return {
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
    distance,
    midX,
    midY,
  }
}

function generateMidpointProblems() {
  const problems = []
  let attempts = 0
  while (problems.length < 4 && attempts < 200) {
    const q = generateMidpointProblem()
    const dup = problems.some(
      (r) => r.p1.x === q.p1.x && r.p1.y === q.p1.y && r.p2.x === q.p2.x && r.p2.y === q.p2.y
    )
    if (!dup) problems.push(q)
    attempts++
  }
  return problems
}

function generateProblems(level) {
  if (level === 1) return generateLevel1Problems()
  if (level === '2a') return generateLevel2Problems(false)
  if (level === '2b') return generateLevel2Problems(true)
  if (level === 3) return generateLevel3Problems()
  if (level === 'mp') return generateMidpointProblems()
  return []
}

// ----- Helpers -----

const LEVEL_TITLES = {
  1: 'Level 1: Read Coordinates',
  '2a': 'Level 2A: Calculate Slope (Positive)',
  '2b': 'Level 2B: Calculate Slope (Positive or Negative)',
  3: 'Level 3: Find the Y-Intercept',
  mp: 'Distance & Midpoint',
}

function FormulaKey({ level }) {
  if (level === 1) {
    return (
      <div className="border-2 border-gray-800 rounded p-2 text-sm bg-gray-50 print:bg-white">
        <span className="font-bold mr-2">Key:</span>
        A coordinate is written as (X, Y).
        <span className="mx-2">•</span>
        <span className="font-semibold">X</span> = how far across
        <span className="mx-2">•</span>
        <span className="font-semibold">Y</span> = how far up
      </div>
    )
  }
  if (level === '2a' || level === '2b') {
    return (
      <div className="border-2 border-gray-800 rounded p-2 text-sm bg-gray-50 print:bg-white">
        <span className="font-bold mr-2">Key:</span>
        Rise = y₂ − y₁
        <span className="mx-3">•</span>
        Run = x₂ − x₁
        <span className="mx-3">•</span>
        Slope (m) = Rise ÷ Run = (y₂ − y₁) / (x₂ − x₁)
      </div>
    )
  }
  if (level === 3) {
    return (
      <div className="border-2 border-gray-800 rounded p-2 text-sm bg-gray-50 print:bg-white">
        <span className="font-bold mr-2">Key:</span>
        Rise = y₂ − y₁
        <span className="mx-3">•</span>
        Run = x₂ − x₁
        <span className="mx-3">•</span>
        m = Rise ÷ Run
        <span className="mx-3">•</span>
        y = mx + b → <span className="font-semibold">b = y − m·x</span>
      </div>
    )
  }
  if (level === 'mp') {
    return (
      <div className="border-2 border-gray-800 rounded p-2 text-sm bg-gray-50 print:bg-white">
        <span className="font-bold mr-2">Key:</span>
        Distance d = √((x₂ − x₁)² + (y₂ − y₁)²)
        <span className="mx-3">•</span>
        Midpoint M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2)
      </div>
    )
  }
  return null
}

// A reusable inline blank (for filling in).
// Uses absolute inch dimensions so the printed size is consistent
// regardless of font scaling differences between screen and print.
function Blank({ width = '0.8in', height = '0.45in' }) {
  return (
    <span
      className="inline-block border-b-2 border-gray-800 align-baseline"
      style={{ width, height, minWidth: width }}
    />
  )
}

function ProblemBlanks({ level, index }) {
  return (
    <div className="leading-relaxed" style={{ fontSize: '14pt' }}>
      <p className="font-bold mb-3" style={{ fontSize: '18pt' }}>
        #{index + 1}
      </p>
      <p className="mb-4">
        P₁ = ( <Blank /> , <Blank /> )
      </p>
      <p className="mb-4">
        P₂ = ( <Blank /> , <Blank /> )
      </p>
      {(level === '2a' || level === '2b' || level === 3) && (
        <p className="mb-4">
          m = <Blank width="1in" />
        </p>
      )}
      {level === 3 && (
        <p>
          b = <Blank width="1in" />
        </p>
      )}
      {level === 'mp' && (
        <>
          <p className="mb-4">
            d = <Blank width="1in" />
          </p>
          <p>
            M = ( <Blank /> , <Blank /> )
          </p>
        </>
      )}
    </div>
  )
}

// ----- Main Worksheet -----

export default function Worksheet({ level, mode, onBack }) {
  const [seed, setSeed] = useState(0)
  const problems = useMemo(() => generateProblems(level), [level, seed])

  const handlePrint = () => window.print()
  const handleRegenerate = () => setSeed((s) => s + 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 print:bg-white">
      {/* Top toolbar (hidden on print) */}
      <div className="no-print bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <button
          onClick={onBack}
          className="bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded hover:bg-gray-400"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg"
          >
            ↻ New Worksheet
          </button>
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* Worksheet page (printable) */}
      <div className="flex justify-center p-6 print:p-0">
        <div
          className="worksheet-page bg-white shadow-lg p-8 print:shadow-none print:p-0"
          style={{ width: '11in', maxWidth: '100%', minHeight: '8.5in' }}
        >
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-2 mb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/text_logo_ants_axes.png"
                alt="Ants & Axes"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold leading-tight">{LEVEL_TITLES[level]}</h1>
                <p className="text-sm text-gray-700 leading-tight">
                  {level === 1 && 'Write the coordinates of each labeled point.'}
                  {(level === '2a' || level === '2b') &&
                    'Identify the two points, then calculate the slope (m).'}
                  {level === 3 &&
                    'Identify the points, calculate the slope, then find the y-intercept (b).'}
                  {level === 'mp' &&
                    'Identify the points, then find the distance (d) and midpoint (M).'}
                </p>
              </div>
            </div>
            <div className="text-sm flex gap-4 items-center flex-shrink-0">
              <span>
                Name: <Blank width="7em" />
              </span>
              <span>
                Date: <Blank width="5em" />
              </span>
              <span>
                Score: <Blank width="2em" /> / 4
              </span>
            </div>
          </div>

          {/* Formula key (Mentor mode only) */}
          {mode === 'mentor' && (
            <div className="mb-3">
              <FormulaKey level={level} />
            </div>
          )}

          {/* 2×2 problem grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {problems.map((problem, idx) => (
              <div
                key={idx}
                className="worksheet-problem border border-gray-400 rounded p-2 flex gap-2 items-center"
              >
                <div className="flex-1 min-w-0">
                  <WorksheetChart points={[problem.p1, problem.p2]} />
                </div>
                <div className="flex-shrink-0" style={{ width: '52%' }}>
                  <ProblemBlanks level={level} index={idx} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
