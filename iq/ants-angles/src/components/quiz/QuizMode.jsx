import { useState } from 'react'
import { motion } from 'framer-motion'
import { LEVELS, getLevel } from '../../lib/angleQuiz'
import QuizShell from './QuizShell'

// Levels grouped by their topic category, in registry order.
const CATEGORIES = LEVELS.reduce((acc, lvl) => {
  const cat = lvl.category || 'Other'
  ;(acc[cat] ||= []).push(lvl)
  return acc
}, {})

// Level picker → routes into the shared QuizShell for the chosen level.
export default function QuizMode() {
  const [levelId, setLevelId] = useState(null)

  if (levelId) {
    return <QuizShell level={getLevel(levelId)} onBack={() => setLevelId(null)} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">📚 Geometry Quiz</h1>
        <p className="text-gray-500 mt-1">Pick a level — they get trickier as you go.</p>
      </motion.div>

      {Object.entries(CATEGORIES).map(([category, levels]) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3 px-1">{category}</h2>
          <div className="grid grid-cols-1 gap-4">
            {levels.map((lvl, i) => (
              <motion.button
                key={lvl.id}
                onClick={() => setLevelId(lvl.id)}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-l-8"
                style={{ borderColor: lvl.accent }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Level {lvl.id}: {lvl.title}</h3>
                  <span className="text-white text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: lvl.accent }}>Play</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{lvl.blurb}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
