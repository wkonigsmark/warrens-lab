import { useState } from 'react'
import { motion } from 'framer-motion'
import QuizLevel1 from './QuizLevel1'

export default function QuizMode({ onExit }) {
  const [selectedLevel, setSelectedLevel] = useState(null)

  if (selectedLevel === 1) {
    return <QuizLevel1 onBack={() => setSelectedLevel(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 Quiz Mode</h1>
          <p className="text-gray-600 text-lg">Test your knowledge of coordinates and graphing!</p>
        </motion.div>

        {/* Level Selection */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {/* Level 1 - Enabled */}
          <motion.button
            onClick={() => setSelectedLevel(1)}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-green-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Level 1</h2>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Available</span>
              </div>
              <p className="text-gray-600">Read Coordinates</p>
              <p className="text-sm text-gray-500 mt-2">A point is plotted on the chart. Enter the X and Y coordinates.</p>
            </div>
          </motion.button>

          {/* Level 2A - Locked */}
          <motion.button
            disabled
            className="bg-gray-100 rounded-lg shadow p-8 opacity-60 cursor-not-allowed border-2 border-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-400">Level 2A</h2>
                <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-semibold">Coming Soon</span>
              </div>
              <p className="text-gray-400">Calculate Slope (Positive Only)</p>
              <p className="text-sm text-gray-400 mt-2">Find the slope between two points. Results will always be positive whole numbers.</p>
            </div>
          </motion.button>

          {/* Level 2B - Locked */}
          <motion.button
            disabled
            className="bg-gray-100 rounded-lg shadow p-8 opacity-60 cursor-not-allowed border-2 border-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-400">Level 2B</h2>
                <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-semibold">Coming Soon</span>
              </div>
              <p className="text-gray-400">Calculate Slope (With Negatives)</p>
              <p className="text-sm text-gray-400 mt-2">Find the slope between two points. Results can be positive or negative whole numbers.</p>
            </div>
          </motion.button>

          {/* Level 3 - Locked */}
          <motion.button
            disabled
            className="bg-gray-100 rounded-lg shadow p-8 opacity-60 cursor-not-allowed border-2 border-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3 } }}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-400">Level 3</h2>
                <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-semibold">Coming Soon</span>
              </div>
              <p className="text-gray-400">Find Y-Intercept</p>
              <p className="text-sm text-gray-400 mt-2">Identify where a line crosses the Y-axis. Results will always be whole numbers.</p>
            </div>
          </motion.button>
        </div>

        {/* Exit Button */}
        <motion.button
          onClick={onExit}
          className="w-full bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back to Dashboard
        </motion.button>
      </div>
    </div>
  )
}
