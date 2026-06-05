import { useState } from 'react'
import { motion } from 'framer-motion'
import { byId } from '../../lib/competencies'
import { createLearner, nextDifficulty, record } from '../../lib/adaptive'

const FEEDBACK_MS = 950

// One question, tagged with the difficulty the engine asked for (so we can feed
// it back into record() and show it for calibration).
function genFor(compId, learner) {
  const d = nextDifficulty(learner)
  return { ...byId(compId).generate(d), _difficulty: d }
}

// Drives the adaptive loop: for each chosen competency in turn, spin up a fresh
// learner and keep serving questions at the engine's chosen difficulty until it
// settles, capturing how long each answer took. Hands a list of finished
// learners (full traces intact) to onFinish.
export default function AdaptiveRunner({ competencyIds, config, onFinish }) {
  const order = competencyIds
  const [ci, setCi] = useState(0)
  const [learner, setLearner] = useState(() => createLearner(config))
  const [q, setQ] = useState(() => genFor(order[0], createLearner(config)))
  const [shownAt, setShownAt] = useState(() => performance.now())
  const [picked, setPicked] = useState(null)
  const [finished, setFinished] = useState([])

  const comp = byId(order[ci])
  const answered = picked !== null
  const isCorrect = answered && picked === q.answer

  const choose = (choice) => {
    if (answered) return
    const timeMs = Math.round(performance.now() - shownAt)
    setPicked(choice)
    const updated = record(learner, { difficulty: q._difficulty, correct: choice === q.answer, timeMs })

    setTimeout(() => {
      if (updated.done) {
        const nextFinished = [...finished, { compId: order[ci], learner: updated }]
        if (ci + 1 >= order.length) {
          onFinish(nextFinished)
          return
        }
        const ni = ci + 1
        const fresh = createLearner(config)
        setFinished(nextFinished)
        setCi(ni)
        setLearner(fresh)
        setQ(genFor(order[ni], fresh))
      } else {
        setLearner(updated)
        setQ(genFor(order[ci], updated))
      }
      setShownAt(performance.now())
      setPicked(null)
    }, FEEDBACK_MS)
  }

  const inTopic = learner.history.length + 1
  // Soft overall progress: finished topics + how far the current topic has gone.
  const topicFrac = Math.min(1, learner.history.length / config.maxQuestions)
  const overall = Math.round(((ci + topicFrac) / order.length) * 100)

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>Topic {ci + 1} of {order.length} · Q{inTopic}</span>
          <span className="flex items-center gap-1" style={{ color: comp.accent }}>
            {comp.emoji} {comp.label}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: comp.accent }}
            animate={{ width: `${overall}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Enter-only animation (no exit gating) so a backgrounded tab with
          throttled rAF can never wedge the transition mid-question. */}
      <motion.div
        key={`${ci}-${learner.history.length}`}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl shadow-xl p-7"
      >
          <p className="text-xs uppercase tracking-wide font-bold text-gray-400 mb-3">
            Difficulty {q._difficulty} / 10
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

          <div className="h-7 mt-4 text-center font-bold">
            {answered && isCorrect && <span className="text-emerald-600">Nice! 🎉</span>}
            {answered && !isCorrect && (
              <span className="text-gray-500">Good try — the answer was {q.answer}. 👍</span>
            )}
          </div>
      </motion.div>
    </div>
  )
}
