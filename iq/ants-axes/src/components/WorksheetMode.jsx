import { useState } from 'react'
import { motion } from 'framer-motion'
import Worksheet from './Worksheet'

const LEVELS = [
  {
    id: 1,
    title: 'Level 1',
    subtitle: 'Read Coordinates',
    description: 'Identify the (x, y) coordinates of each plotted point.',
  },
  {
    id: '2a',
    title: 'Level 2A',
    subtitle: 'Calculate Slope (Positive)',
    description: 'Find the slope between two points. Results are positive whole numbers.',
  },
  {
    id: '2b',
    title: 'Level 2B',
    subtitle: 'Calculate Slope (With Negatives)',
    description: 'Find the slope between two points. Results can be positive or negative.',
  },
  {
    id: 3,
    title: 'Level 3',
    subtitle: 'Find Y-Intercept',
    description: 'Calculate the slope, then use it to find where the line crosses the Y-axis.',
  },
  {
    id: 'mp',
    title: 'Distance & Midpoint',
    subtitle: 'Find the distance and midpoint of two points',
    description: 'Use the distance formula d = √(∆x² + ∆y²) and find the midpoint M = ((x₁+x₂)/2, (y₁+y₂)/2).',
  },
]

export default function WorksheetMode({ onExit }) {
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)

  // Active worksheet view
  if (selectedLevel !== null && selectedMode) {
    return (
      <Worksheet
        level={selectedLevel}
        mode={selectedMode}
        onBack={() => {
          setSelectedLevel(null)
          setSelectedMode(null)
        }}
      />
    )
  }

  // Mode selection screen (after level chosen)
  if (selectedLevel !== null && !selectedMode) {
    const level = LEVELS.find((l) => l.id === selectedLevel)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-white rounded-lg shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Mode</h1>
            <p className="text-gray-600 mb-8">{level.title}</p>

            <div className="space-y-4">
              <motion.button
                onClick={() => setSelectedMode('master')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-lg hover:shadow-lg text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Master Mode
                <p className="text-sm font-normal text-blue-100 mt-2">
                  No formula key — students solve from memory
                </p>
              </motion.button>

              <motion.button
                onClick={() => setSelectedMode('mentor')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-lg hover:shadow-lg text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Mentor Mode
                <p className="text-sm font-normal text-green-100 mt-2">
                  Includes a formula key at the top of the worksheet
                </p>
              </motion.button>

              <motion.button
                onClick={() => setSelectedLevel(null)}
                className="w-full bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400"
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

  // Level selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🖨 Printable Worksheets</h1>
          <p className="text-gray-600 text-lg">
            Generate a 6-problem worksheet to print and practice on paper.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {LEVELS.map((level, i) => (
            <motion.button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl border-2 border-blue-500 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: i * 0.05 } }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">{level.title}</h2>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Available
                </span>
              </div>
              <p className="text-gray-600">{level.subtitle}</p>
              <p className="text-sm text-gray-500 mt-2">{level.description}</p>
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={onExit}
          className="w-full bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back to Dashboard
        </motion.button>
      </div>
    </div>
  )
}
