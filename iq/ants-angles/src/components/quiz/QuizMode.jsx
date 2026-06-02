import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LEVELS, getLevel } from '../../lib/angleQuiz'
import { visibleItems } from '../../lib/wholeNumbers'
import WholeNumbersToggle from './WholeNumbersToggle'
import QuizShell from './QuizShell'

// Level picker → routes into the shared QuizShell for the chosen level.
export default function QuizMode({ wholeOnly, onWholeChange }) {
  const [levelId, setLevelId] = useState(null)

  const shown = visibleItems(LEVELS, wholeOnly)
  const hiddenCount = LEVELS.length - shown.length
  const categories = useMemo(() => shown.reduce((acc, lvl) => {
    const cat = lvl.category || 'Other'
    ;(acc[cat] ||= []).push(lvl)
    return acc
  }, {}), [shown])

  if (levelId) {
    return <QuizShell level={getLevel(levelId)} wholeOnly={wholeOnly} onBack={() => setLevelId(null)} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">📚 Geometry Quiz</h1>
        <p className="text-gray-500 mt-1">Pick a level — they get trickier as you go.</p>
      </motion.div>

      <WholeNumbersToggle wholeOnly={wholeOnly} onChange={onWholeChange} hiddenCount={hiddenCount} />

      {Object.entries(categories).map(([category, levels]) => (
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
