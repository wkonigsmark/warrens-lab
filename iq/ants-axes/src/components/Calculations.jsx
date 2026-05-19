import { motion } from 'framer-motion'

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

  // Avoid division by zero
  if (run === 0) {
    return (
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Calculations</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-gray-700">
            These points form a <strong>vertical line</strong> (undefined slope).
          </p>
          <p className="text-sm text-gray-600 mt-2">Both points have x-coordinate: {x1}</p>
        </div>
      </motion.div>
    )
  }

  // Calculate slope
  const slope = rise / run

  // Calculate y-intercept: b = y - mx
  const yIntercept = y1 - slope * x1

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
          <p>∆y (Rise) = y₂ - y₁ = {y2} - ({y1}) = <span className="font-bold">{rise}</span></p>
          <p>∆x (Run) = x₂ - x₁ = {x2} - ({x1}) = <span className="font-bold">{run}</span></p>
        </div>
      </div>

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
          <p>Using point 1: b = y₁ - m(x₁)</p>
          <p>b = {y1} - {slope.toFixed(3)} × {x1}</p>
          <p>b = {y1} - ({(slope * x1).toFixed(3)})</p>
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
          {/* Verification */}
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
    </motion.div>
  )
}
