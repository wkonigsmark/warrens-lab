import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MiniGrid from './MiniGrid'
import { SESSION_COUNT } from '../lib/axesQuiz'
import { saveSession } from '../lib/sessions'

const FEEDBACK_MS = 1100

export default function AxesQuizSession({ user, level, onBack, onDone }) {
  const questions = useMemo(() => {
    const qs = []
    const seen = new Set()
    let tries = 0
    while (qs.length < SESSION_COUNT && tries < 200) {
      const q = level.generate()
      const key = JSON.stringify(q.choices) + q.correctIndex
      if (!seen.has(key)) { seen.add(key); qs.push(q) }
      tries++
    }
    return qs
  }, [level])

  const [qi, setQi]          = useState(0)
  const [answers, setAnswers] = useState([])
  const [picked, setPicked]   = useState(null)
  const [phase, setPhase]     = useState('asking') // 'asking' | 'feedback' | 'done'

  const q = questions[qi]

  const handlePick = (choiceIdx) => {
    if (phase !== 'asking') return
    setPicked(choiceIdx)
    setPhase('feedback')

    const correct = choiceIdx === q.correctIndex
    const next = [...answers, { correct, picked: choiceIdx }]
    setAnswers(next)

    setTimeout(() => {
      if (qi + 1 < SESSION_COUNT) {
        setQi(qi + 1)
        setPicked(null)
        setPhase('asking')
      } else {
        const score = next.filter(a => a.correct).length
        saveSession({
          id: Date.now(),
          ts: new Date().toISOString(),
          toolId: 'ants-axes',
          userId: user,
          levelId: level.id,
          levelTitle: level.title,
          tierLabel: level.tierLabel,
          topicId: level.topicId,
          score,
          count: SESSION_COUNT,
          passed: score >= level.passBar,
        }, user)
        setPhase('done')
      }
    }, FEEDBACK_MS)
  }

  if (phase === 'done') {
    const score = answers.filter(a => a.correct).length
    const passed = score >= level.passBar
    const pct = Math.round((score / SESSION_COUNT) * 100)
    const perfect = score === SESSION_COUNT

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center"
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-5xl mb-3">{perfect ? '🏆' : passed ? '🌟' : score >= 3 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
            {perfect ? 'Perfect!' : passed ? 'Passed!' : score >= 3 ? 'Good effort!' : 'Keep going!'}
          </h2>
          <p className="text-sm text-gray-400 mb-1">{level.emoji} {level.title}</p>
          <p className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: level.accent }}>
            {level.tierLabel}
          </p>

          <div className="flex items-end justify-center gap-1 mb-3">
            <span className="text-5xl font-extrabold text-gray-800">{score}</span>
            <span className="text-2xl text-gray-300 mb-1">/ {SESSION_COUNT}</span>
          </div>

          {passed && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              ✓ Tier cleared — next tier unlocked!
            </div>
          )}

          <div className="w-full bg-gray-100 rounded-full h-3 mb-5 overflow-hidden">
            <motion.div
              className="h-3 rounded-full"
              style={{ backgroundColor: level.accent }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%`, transition: { duration: 0.6, ease: 'easeOut' } }}
            />
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {answers.map((a, i) => (
              <div key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${a.correct ? 'bg-emerald-400' : 'bg-red-400'}`}
              >
                {a.correct ? '✓' : '✗'}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onDone}
              className="w-full py-3 rounded-xl font-bold text-white text-lg hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: level.accent }}
            >
              {passed ? 'Next Tier →' : 'Try Again'}
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              ← View Progress
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const isYIntercept = q.type === 'y-intercept'

  return (
    <div className="flex flex-col max-w-sm mx-auto px-2 pt-2 pb-6 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 font-bold text-sm px-2 py-1 hover:text-gray-600">
          ← Back
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-gray-600">{level.title}</span>
          <span className="mx-1.5 text-gray-200">·</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: level.accent }}>
            {level.tierLabel}
          </span>
        </div>
        <span
          className="text-xs font-extrabold text-white px-2.5 py-1 rounded-full"
          style={{ backgroundColor: level.accent }}
        >
          {qi + 1} / {SESSION_COUNT}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(qi / SESSION_COUNT) * 100}%`, backgroundColor: level.accent }}
        />
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qi}
          className="bg-white rounded-2xl shadow-md p-3"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          <MiniGrid
            points={q.points}
            drawLine={q.drawLine}
            highlightYAxis={isYIntercept}
          />
        </motion.div>
      </AnimatePresence>

      {/* Prompt */}
      <p className="text-center text-sm font-semibold text-gray-700 px-2">{q.prompt}</p>

      {/* Choices — 2×2 grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {q.choices.map((choice, ci) => {
          const isCorrect = ci === q.correctIndex
          const isPicked  = ci === picked

          let bg = 'bg-white border-2 border-gray-200 text-gray-700'
          if (phase === 'feedback') {
            if (isCorrect)     bg = 'bg-emerald-400 border-emerald-400 text-white'
            else if (isPicked) bg = 'bg-red-400 border-red-400 text-white'
            else               bg = 'bg-white border-2 border-gray-100 text-gray-300'
          }

          return (
            <motion.button
              key={ci}
              onClick={() => handlePick(ci)}
              className={`py-4 rounded-2xl font-extrabold text-base shadow-sm transition-colors ${bg}`}
              whileTap={phase === 'asking' ? { scale: 0.95 } : {}}
              disabled={phase !== 'asking'}
            >
              {isPicked && phase === 'feedback' && !isCorrect ? '✗ ' : ''}
              {isCorrect && phase === 'feedback' ? '✓ ' : ''}
              {choice}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
