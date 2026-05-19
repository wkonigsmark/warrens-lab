import { useState } from 'react'
import { motion } from 'framer-motion'
import QuizLevel1 from './QuizLevel1'
import QuizLevel2A from './QuizLevel2A'
import QuizLevel2B from './QuizLevel2B'
import QuizLevel3 from './QuizLevel3'

export default function QuizMode({ onExit }) {
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)

  // Mode selection screen
  if (selectedLevel && !selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-white rounded-lg shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Mode</h1>
            <p className="text-gray-600 mb-8">Level {selectedLevel === '2a' ? '2A' : selectedLevel === '2b' ? '2B' : selectedLevel}</p>

            <div className="space-y-4">
              <motion.button
                onClick={() => setSelectedMode('master')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-shadow text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Master Mode
                <p className="text-sm font-normal text-blue-100 mt-2">Answer the question directly</p>
              </motion.button>

              <motion.button
                onClick={() => setSelectedMode('mentor')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-shadow text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Mentor Mode
                <p className="text-sm font-normal text-green-100 mt-2">Step-by-step guided learning</p>
              </motion.button>

              <motion.button
                onClick={() => setSelectedLevel(null)}
                className="w-full bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (selectedLevel === 1 && selectedMode) {
    return <QuizLevel1 mode={selectedMode} onBack={() => { setSelectedLevel(null); setSelectedMode(null) }} />
  }

  if (selectedLevel === '2a' && selectedMode) {
    return <QuizLevel2A mode={selectedMode} onBack={() => { setSelectedLevel(null); setSelectedMode(null) }} />
  }

  if (selectedLevel === '2b' && selectedMode) {
    return <QuizLevel2B mode={selectedMode} onBack={() => { setSelectedLevel(null); setSelectedMode(null) }} />
  }

  if (selectedLevel === 3 && selectedMode) {
    return <QuizLevel3 mode={selectedMode} onBack={() => { setSelectedLevel(null); setSelectedMode(null) }} />
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

          {/* Level 2A - Enabled */}
          <motion.button
            onClick={() => setSelectedLevel('2a')}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-green-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Level 2A</h2>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Available</span>
              </div>
              <p className="text-gray-600">Calculate Slope (Positive Only)</p>
              <p className="text-sm text-gray-500 mt-2">Find the slope between two points. Results will always be positive whole numbers.</p>
            </div>
          </motion.button>

          {/* Level 2B - Enabled */}
          <motion.button
            onClick={() => setSelectedLevel('2b')}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-green-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Level 2B</h2>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Available</span>
              </div>
              <p className="text-gray-600">Calculate Slope (With Negatives)</p>
              <p className="text-sm text-gray-500 mt-2">Find the slope between two points. Results can be positive or negative whole numbers.</p>
            </div>
          </motion.button>

          {/* Level 3 - Enabled */}
          <motion.button
            onClick={() => setSelectedLevel(3)}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-green-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3 } }}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Level 3</h2>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Available</span>
              </div>
              <p className="text-gray-600">Find Y-Intercept</p>
              <p className="text-sm text-gray-500 mt-2">Identify where a line crosses the Y-axis. Results will always be whole numbers.</p>
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
