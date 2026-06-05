import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { byId } from '../lib/competencies'

// Builds the question plan once: for each chosen competency, a 3-rung ladder
// (level 1 → 2 → 3). Grouped by competency so the child stays in one topic at a
// time, and each level fed to generate() fresh so nothing can be memorized.
function buildPlan(ids) {
  const plan = []
  for (const id of ids) {
    const c = byId(id)
    for (let level = 1; level <= 3; level++) {
      plan.push({ compId: id, level, ...c.generate(level) })
    }
  }
  return plan
}

export default function AssessmentRunner({ competencyIds, onFinish }) {
  const plan = useMemo(() => buildPlan(competencyIds), [competencyIds])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null) // the choice the child tapped
  const [results, setResults] = useState([]) // [{compId, correct}]

  const q = plan[idx]
  const comp = byId(q.compId)
  const answered = picked !== null
  const isCorrect = answered && picked === q.answer

  const choose = (choice) => {
    if (answered) return
    setPicked(choice)
    const next = [...results, { compId: q.compId, correct: choice === q.answer }]
    setResults(next)
    // Brief beat to show feedback, then advance (or finish).
    setTimeout(() => {
      if (idx + 1 >= plan.length) {
        onFinish(next)
      } else {
        setIdx(idx + 1)
        setPicked(null)
      }
    }, 950)
  }

  const progress = Math.round((idx / plan.length) * 100)

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>Question {idx + 1} of {plan.length}</span>
          <span className="flex items-center gap-1" style={{ color: comp.accent }}>
            {comp.emoji} {comp.label}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: comp.accent }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="bg-white rounded-3xl shadow-xl p-7"
        >
          <p className="text-xs uppercase tracking-wide font-bold text-gray-400 mb-3">
            Level {q.level}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-6 leading-snug">
            {q.prompt}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {q.choices.map((choice) => {
              const showCorrect = answered && choice === q.answer
              const showWrong = answered && choice === picked && !isCorrect
              return (
                <button
                  key={choice}
                  onClick={() => choose(choice)}
                  disabled={answered}
                  className={`py-5 rounded-2xl text-2xl font-black border-2 transition-colors ${
                    showCorrect
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : showWrong
                      ? 'bg-red-100 border-red-300 text-red-500 shake'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {choice}
                </button>
              )
            })}
          </div>

          {/* Forgiving feedback — celebrate wins, stay warm on misses. */}
          <div className="h-7 mt-4 text-center font-bold">
            {answered && isCorrect && <span className="text-emerald-600">Nice! 🎉</span>}
            {answered && !isCorrect && (
              <span className="text-gray-500">Good try — the answer was {q.answer}. 👍</span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
