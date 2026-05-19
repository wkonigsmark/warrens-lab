import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Controls({ points, onAddPoint, onClear }) {
  const [x1, setX1] = useState('')
  const [y1, setY1] = useState('')
  const [x2, setX2] = useState('')
  const [y2, setY2] = useState('')

  const handleAddPoints = () => {
    const x1Val = parseInt(x1)
    const y1Val = parseInt(y1)
    const x2Val = parseInt(x2)
    const y2Val = parseInt(y2)

    if (!isNaN(x1Val) && !isNaN(y1Val)) {
      onAddPoint(x1Val, y1Val)
    }
    if (!isNaN(x2Val) && !isNaN(y2Val)) {
      onAddPoint(x2Val, y2Val)
    }

    // Clear inputs
    setX1('')
    setY1('')
    setX2('')
    setY2('')
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Input Values</h2>

      <div className="space-y-4">
        {/* Point 1 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">Point 1</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="10"
              value={x1}
              onChange={(e) => setX1(e.target.value)}
              placeholder="X"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              min="0"
              max="10"
              value={y1}
              onChange={(e) => setY1(e.target.value)}
              placeholder="Y"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Point 2 */}
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">Point 2</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="10"
              value={x2}
              onChange={(e) => setX2(e.target.value)}
              placeholder="X"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              min="0"
              max="10"
              value={y2}
              onChange={(e) => setY2(e.target.value)}
              placeholder="Y"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex flex-col gap-2">
          <motion.button
            onClick={handleAddPoints}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Draw Line
          </motion.button>

          <motion.button
            onClick={onClear}
            className="w-full bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Clear
          </motion.button>
        </div>
      </div>

      {/* Points display */}
      {points.length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">Current Points:</p>
          {points.map((point, idx) => (
            <p key={idx} className="text-sm text-gray-600">
              Point {idx + 1}: ({point.x}, {point.y})
            </p>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
