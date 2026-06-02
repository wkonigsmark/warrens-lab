import { motion } from 'framer-motion'

// Format a number cleanly: integer if whole, else 1 decimal (good for midpoints)
function fmtMid(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1)
}

export default function Calculations({ points }) {
  if (points.length !== 2) {
    return null
  }

  const [p1, p2] = points
  const x1 = p1.x
  const y1 = p1.y
  const x2 = p2.x
  const y2 = p2.y

  // Calculate rise and run
  const rise = y2 - y1
  const run = x2 - x1
  const isVertical = run === 0

  // Distance: √(Δx² + Δy²) — works for vertical lines too
  const distanceSq = run * run + rise * rise
  const distance = Math.sqrt(distanceSq)

  // Midpoint: average of coordinates — works for vertical lines too
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  // Slope / intercept only if non-vertical
  const slope = isVertical ? null : rise / run
  const yIntercept = isVertical ? null : y1 - slope * x1

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Calculations</h2>

      {/* Points */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Points</h3>
        <div className="bg-blue-50 p-4 rounded-lg mb-2">
          <p className="text-gray-800">Point 1: <span className="font-mono font-bold">({x1}, {y1})</span></p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-gray-800">Point 2: <span className="font-mono font-bold">({x2}, {y2})</span></p>
        </div>
      </div>

      {/* Rise and Run */}
      <div className="mb-8 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Rise & Run</h3>
        <div className="space-y-2 font-mono text-gray-800">
          <p>∆y (Rise) = y₂ − y₁ = {y2} − ({y1}) = <span className="font-bold">{rise}</span></p>
          <p>∆x (Run) = x₂ − x₁ = {x2} − ({x1}) = <span className="font-bold">{run}</span></p>
        </div>
      </div>

      {/* Distance */}
      <div className="mb-8 p-4 bg-pink-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Distance</h3>
        <div className="space-y-2 font-mono text-gray-800">
          <p>d = √(∆x² + ∆y²)</p>
          <p>d = √(({run})² + ({rise})²) = √({run * run} + {rise * rise}) = √{distanceSq}</p>
          <p>d = <span className="font-bold">{distance.toFixed(3)}</span></p>
        </div>
      </div>

      {/* Midpoint */}
      <div className="mb-8 p-4 bg-teal-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Midpoint</h3>
        <div className="space-y-2 font-mono text-gray-800">
          <p>M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2)</p>
          <p>M = (({x1} + {x2}) ÷ 2, ({y1} + {y2}) ÷ 2)</p>
          <p>M = ({x1 + x2} ÷ 2, {y1 + y2} ÷ 2)</p>
          <p>M = <span className="font-bold">({fmtMid(midX)}, {fmtMid(midY)})</span></p>
        </div>
      </div>

      {/* Vertical-line short-circuit for slope/intercept/equation */}
      {isVertical ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-gray-700">
            These points form a <strong>vertical line</strong>. Slope is undefined and the line has no y-intercept (unless x = 0).
          </p>
          <p className="text-sm text-gray-600 mt-2">Both points have x-coordinate: {x1}</p>
        </div>
      ) : (
        <>
          {/* Slope */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Slope</h3>
            <div className="space-y-2 font-mono text-gray-800">
              <p>m = Rise ÷ Run = ∆y ÷ ∆x</p>
              <p>m = {rise} ÷ {run} = <span className="font-bold">{slope.toFixed(3)}</span></p>
            </div>
          </div>

          {/* Y-Intercept */}
          <div className="mb-8 p-4 bg-orange-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Y-Intercept</h3>
            <div className="space-y-2 font-mono text-sm text-gray-800">
              <p>Using point 1: b = y₁ − m(x₁)</p>
              <p>b = {y1} − {slope.toFixed(3)} × {x1}</p>
              <p>b = {y1} − ({(slope * x1).toFixed(3)})</p>
              <p>b = <span className="font-bold">{yIntercept.toFixed(3)}</span></p>
            </div>
          </div>

          {/* Equation of Line */}
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Equation of the Line</h3>
            <div className="space-y-3">
              <p className="font-mono text-lg text-gray-800">
                y = mx + b
              </p>
              <p className="font-mono text-lg text-gray-800">
                y = {slope.toFixed(3)}x + {yIntercept.toFixed(3)}
              </p>
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Verification:</p>
                <p className="text-sm text-gray-600">
                  Point 1: y = {slope.toFixed(3)}({x1}) + {yIntercept.toFixed(3)} = {(slope * x1 + yIntercept).toFixed(3)} ✓
                </p>
                <p className="text-sm text-gray-600">
                  Point 2: y = {slope.toFixed(3)}({x2}) + {yIntercept.toFixed(3)} = {(slope * x2 + yIntercept).toFixed(3)} ✓
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
