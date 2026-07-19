import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isCorrect, COUNT } from '../../lib/exponentLevels'
import { saveSession } from '../../lib/sessions'

// Drives one quiz level (a unit × tier): rolls fresh questions, shows the big
// expression + choices with a worked-out reason on every answer, tracks score,
// and — once finished — saves a session (passed = score ≥ tier passBar) that
// feeds My Progress + the shared tracker. `onAdvance` unlocks the next tier.
export default function QuizShell({ level, user, onBack, onAdvance, nextLevelTitle }) {
  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('asking') // 'asking' | 'feedback' | 'done'
  const [answers, setAnswers] = useState([])
  const [picked, setPicked] = useState(null)
  const startRef = useRef(Date.now())

  const questions = useMemo(
    () => Array.from({ length: COUNT }, () => level.generate()),
    [level, seed],
  )
  const q = questions[index]
  const isLast = index === COUNT - 1
  const score = answers.filter((a) => a.correct).length
  const fmt = q?.format ?? ((v) => v)

  useEffect(() => { startRef.current = Date.now() }, [index, seed])

  useEffect(() => {
    if (phase !== 'done' || !user) return
    const finalScore = answers.filter((a) => a.correct).length
    const times = answers.map((a) => a.ms).filter((m) => typeof m === 'number')
    const avgMs = times.length ? Math.round(times.reduce((s, t) => s + t, 0) / times.length) : 0
    saveSession({
      id: Date.now(),
      ts: new Date().toISOString(),
      toolId: 'ants-exponents',
      userId: user,
      levelId: level.id,
      levelTitle: level.title,
      topicId: level.topicId,
      tierId: level.tierId,
      tierLabel: level.tierLabel,
      score: finalScore,
      count: COUNT,
      passed: finalScore >= level.passBar,
      avgMs,
      answers: answers.map((a, i) => ({ q: i + 1, prompt: questions[i]?.prompt ?? '', correct: a.correct, ms: a.ms })),
    }, user)
  }, [phase]) // eslint-disable-line

  const reset = () => {
    setIndex(0); setPhase('asking'); setAnswers([]); setPicked(null); setSeed((s) => s + 1)
  }

  const submit = (guess) => {
    if (phase !== 'asking') return
    const correct = isCorrect(q, guess)
    setPicked(guess)
    setAnswers((a) => [...a, { guess, correct, ms: Date.now() - startRef.current }])
    setPhase('feedback')
  }

  const next = () => {
    if (isLast) { setPhase('done'); return }
    setIndex((i) => i + 1); setPicked(null); setPhase('asking')
  }

  // Results screen ------------------------------------------------------
  if (phase === 'done') {
    const passed = score >= level.passBar
    const times = answers.map((a) => a.ms).filter((m) => typeof m === 'number')
    const avgSec = times.length ? (times.reduce((s, t) => s + t, 0) / times.length / 1000).toFixed(1) : '0.0'

    if (passed && onAdvance) {
      return (
        <ResultCard>
          <div className="text-6xl mb-2">🎉</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Tier Cleared!</h1>
          <p className="text-sm text-gray-400 mb-2">{level.title} · <span className="font-bold" style={{ color: level.accent }}>{level.tierLabel}</span></p>
          <Big color={level.accent}>{score}/{COUNT}</Big>
          <p className="text-sm text-gray-400 mb-4">avg {avgSec}s per question</p>
          {nextLevelTitle && <p className="text-gray-500 mb-6">Next: <span className="font-bold text-gray-700">{nextLevelTitle}</span></p>}
          <button onClick={onAdvance} className="w-full text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-shadow mb-3" style={{ backgroundColor: level.accent }}>
            {nextLevelTitle ? `Play ${nextLevelTitle} →` : 'Next →'}
          </button>
          <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">Replay this tier</button>
        </ResultCard>
      )
    }

    if (passed && !onAdvance) {
      return (
        <ResultCard>
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Unit Mastered!</h1>
          <p className="text-sm text-gray-400 mb-2">{level.title}</p>
          <Big color={level.accent}>{score}/{COUNT}</Big>
          <p className="text-sm text-gray-400 mb-1">avg {avgSec}s per question</p>
          <p className="text-gray-500 mb-6">Every tier cleared. Come back to keep sharp!</p>
          <button onClick={reset} className="w-full text-white font-bold py-4 rounded-xl text-lg mb-3" style={{ backgroundColor: level.accent }}>Play Again</button>
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Back to Units</button>
        </ResultCard>
      )
    }

    const messages = ['Keep practicing! 💪', 'Nice start! 🙂', 'Good work! 👍', 'Great job! 🌟', 'Almost perfect! 🚀', 'Perfect score! 🏆']
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div className="bg-white rounded-2xl shadow-lg p-10 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="text-3xl font-black text-gray-800 mb-1">Quiz Complete!</h1>
          <p className="text-sm text-gray-400 mb-2">{level.title} · <span className="font-bold" style={{ color: level.accent }}>{level.tierLabel}</span></p>
          <Big color={level.accent}>{score}/{COUNT}</Big>
          <p className="text-lg text-gray-600 mb-1">{messages[score]}</p>
          <p className="text-sm text-gray-400 mb-6">Need {level.passBar}/{COUNT} to clear this tier · avg {avgSec}s</p>

          <div className="space-y-2 mb-8 text-left">
            {questions.map((qq, i) => {
              const f = qq.format ?? ((v) => v)
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border-2 ${answers[i]?.correct ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <span className="font-semibold text-gray-700">{answers[i]?.correct ? '✓' : '✗'} {qq.prompt}</span>
                  <span className="font-bold text-gray-800">{f(qq.answer)}</span>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            <button onClick={reset} className="w-full text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>Try Again (new questions)</button>
            {onAdvance && (
              <button onClick={onAdvance} className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">Skip to {nextLevelTitle || 'Next'} →</button>
            )}
            <button onClick={onBack} className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">← Back to Units</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Question screen -----------------------------------------------------
  const correct = phase === 'feedback' && String(picked) === String(q.answer)
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
            {level.title}
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: level.accent }}>{level.tierLabel}</span>
          </h1>
          <span className="text-sm font-bold text-gray-500">{index + 1} / {COUNT} · ⭐ {score}</span>
        </div>
        <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${((index + (phase === 'feedback' ? 1 : 0)) / COUNT) * 100}%`, backgroundColor: level.accent }} />
        </div>
      </div>

      <motion.div key={`q-${index}`} className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gray-400 font-semibold mb-1">{q.sub}</p>
        <div className="text-5xl font-black text-gray-800 mb-6">{q.prompt}</div>

        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((c) => {
            const isAns = String(c) === String(q.answer)
            const isPicked = String(c) === String(picked)
            let cls = 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
            if (phase === 'feedback' && isAns) cls = 'bg-green-500 text-white'
            else if (phase === 'feedback' && isPicked) cls = 'bg-rose-400 text-white'
            else if (phase === 'feedback') cls = 'bg-gray-100 text-gray-400'
            return (
              <button key={String(c)} onClick={() => submit(c)} disabled={phase === 'feedback'} className={`h-16 rounded-2xl text-2xl font-black transition active:scale-95 ${cls}`}>
                {fmt(c)}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {phase === 'feedback' && (
            <motion.div key="fb" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
              <p className={`font-bold ${correct ? 'text-green-600' : 'text-violet-600'}`}>{correct ? 'Yes! 🎉' : 'Not quite —'}</p>
              <p className="text-gray-500 mt-1">{q.explain}</p>
              <button onClick={next} className="mt-5 px-6 py-2.5 rounded-xl text-white font-bold hover:shadow-lg active:scale-95 transition" style={{ backgroundColor: level.accent }}>
                {isLast ? 'See Results →' : 'Next →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={onBack} className="mt-6 block mx-auto text-sm text-gray-400 hover:text-gray-600">← Back to Units</button>
      </motion.div>
    </div>
  )
}

function ResultCard({ children }) {
  return (
    <div className="max-w-xl mx-auto">
      <motion.div className="bg-white rounded-2xl shadow-xl p-10 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        {children}
      </motion.div>
    </div>
  )
}

function Big({ children, color }) {
  return <div className="text-7xl font-extrabold my-3" style={{ color }}>{children}</div>
}
