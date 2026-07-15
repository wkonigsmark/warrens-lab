import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import FractionFigure from '../FractionFigure'
import Frac from '../Frac'
import { isCorrect, COUNT } from '../../lib/fractionQuiz'
import { saveSession } from '../../lib/sessions'
import { playCorrect, playWrong } from '../../lib/sound'
import { winsorize } from '../../lib/winsorize'

const CORRECT_DELAY = 620
const WRONG_DELAY = 1300

// ── Confetti burst ──────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#22c55e', '#86efac', '#fbbf24', '#34d399', '#a3e635', '#6ee7b7', '#f472b6']
function ConfettiPuff({ n = 16 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: n }, (_, i) => {
        const angle = (360 / n) * i
        const dist = 48 + (i % 3) * 20
        const size = 6 + (i % 3) * 4
        return (
          <span key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            width: size, height: size, borderRadius: '50%',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confettiDot 0.6s ease-out ${(i % 5) * 0.03}s both`,
            '--dx': `${Math.cos((angle * Math.PI) / 180) * dist}px`,
            '--dy': `${Math.sin((angle * Math.PI) / 180) * dist}px`,
          }} />
        )
      })}
    </div>
  )
}

function CountdownBar({ ms, color = 'bg-green-400' }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-2xl overflow-hidden">
      <div className={`h-full ${color}`} style={{ animation: `shrinkBar ${ms}ms linear both` }} />
    </div>
  )
}

// Drives one quiz level end-to-end: rolls fresh questions on mount, shows the
// figure + answer UI. Every answer (choice tap, or Check for number/fraction
// entry) gives instant sound + visual feedback and auto-advances — no manual
// "Next Question" step, so play stays fast and fluid.
export default function QuizShell({ level, user, onBack, onAdvance, nextLevelTitle }) {
  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('asking') // 'asking' | 'feedback' | 'done'
  const [answers, setAnswers] = useState([])
  const [value, setValue] = useState('')          // number levels
  const [frac, setFrac] = useState({ num: '', den: '' }) // fraction levels
  const [lastCorrect, setLastCorrect] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(null) // which problem to review (or null)
  const timerRef = useRef(null)
  const startRef = useRef(Date.now())
  // Hint open/close events for the current question — ref so submit() can read synchronously.
  const hintEventsRef = useRef([])

  const questions = useMemo(
    () => Array.from({ length: COUNT }, () => level.generate()),
    [level, seed],
  )
  const q = questions[index]
  const isLast = index === COUNT - 1
  const score = answers.filter((a) => a.correct).length

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // Reset the per-question timer + hint tracker whenever a new question appears.
  useEffect(() => {
    startRef.current = Date.now()
    hintEventsRef.current = []
  }, [index, seed])

  // Save the session once the round finishes.
  useEffect(() => {
    if (phase !== 'done' || !user) return
    const finalScore = answers.filter((a) => a.correct).length
    const rawTimes = answers.map((a) => a.ms)
    const wTimes = winsorize(rawTimes)
    const avgMs = rawTimes.length ? Math.round(wTimes.reduce((s, t) => s + t, 0) / wTimes.length) : 0
    const avgMsRaw = rawTimes.length ? Math.round(rawTimes.reduce((s, t) => s + t, 0) / rawTimes.length) : 0
    const hintTotal = answers.reduce((s, a) => s + (a.hintCount || 0), 0)
    const hintTotalMs = answers.reduce((s, a) => s + (a.hintMs || 0), 0)
    saveSession({
      id: Date.now(),
      ts: new Date().toISOString(),
      toolId: 'ants-fractions',
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
      avgMsRaw,
      hintTotal,
      hintTotalMs,
      answers: answers.map((a, i) => ({
        q: i + 1,
        prompt: questions[i]?.promptTitle ?? '',
        correct: a.correct,
        ms: a.ms,
        msW: wTimes[i] ?? a.ms,
        hintCount: a.hintCount || 0,
        hintMs: a.hintMs || 0,
      })),
    }, user)
  }, [phase]) // eslint-disable-line

  const reset = () => {
    clearTimeout(timerRef.current)
    hintEventsRef.current = []
    setIndex(0); setPhase('asking'); setAnswers([]); setValue(''); setFrac({ num: '', den: '' }); setSeed((s) => s + 1)
  }

  // Hint open/close callbacks — update the ref synchronously so submit() can read them.
  const handleHintOpen = () => {
    hintEventsRef.current = [...hintEventsRef.current, { openAt: Date.now() }]
  }
  const handleHintClose = () => {
    const now = Date.now()
    hintEventsRef.current = hintEventsRef.current.map((e, i) =>
      i === hintEventsRef.current.length - 1 && !e.closeAt ? { ...e, closeAt: now } : e
    )
  }

  const submit = (guess) => {
    if (phase !== 'asking') return
    if (q.type === 'number' && (guess === '' || guess === null)) return
    if (q.type === 'fraction' && (guess.num === '' || guess.den === '')) return
    const correct = isCorrect(q, guess)
    const now = Date.now()
    const ms = now - startRef.current

    // Close any still-open hint and capture its duration.
    const closedEvents = hintEventsRef.current.map((e) => (e.closeAt ? e : { ...e, closeAt: now }))
    hintEventsRef.current = []
    const hintCount = closedEvents.length
    const hintMs = closedEvents.reduce((s, e) => s + (e.closeAt - e.openAt), 0)

    setLastCorrect(correct)
    setAnswers((a) => [...a, { guess, correct, ms, hintCount, hintMs }])
    setPhase('feedback')
    if (correct) playCorrect(); else playWrong()

    timerRef.current = setTimeout(() => {
      if (isLast) {
        setPhase('done')
      } else {
        setIndex((i) => i + 1); setValue(''); setFrac({ num: '', den: '' }); setPhase('asking')
      }
    }, correct ? CORRECT_DELAY : WRONG_DELAY)
  }

  // Results screen ------------------------------------------------------
  if (phase === 'done') {
    if (reviewIdx !== null) {
      return <ReviewModal question={questions[reviewIdx]} answer={answers[reviewIdx]} idx={reviewIdx} level={level} onClose={() => setReviewIdx(null)} />
    }

    const passed = score >= level.passBar
    const rawTimes = answers.map((a) => a.ms)
    const wTimes = winsorize(rawTimes)
    const avgMs = rawTimes.length ? Math.round(wTimes.reduce((s, t) => s + t, 0) / wTimes.length) : 0
    const avgSec = (avgMs / 1000).toFixed(1)
    const hintTotal = answers.reduce((s, a) => s + (a.hintCount || 0), 0)

    // ── Tier cleared, next tier available ──────────────────────────────
    if (passed && onAdvance) {
      return (
        <div className="max-w-xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          >
            <ConfettiPuff n={24} />
            <div className="text-6xl mb-2">🎉</div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Tier Cleared!</h1>
            <p className="text-sm text-gray-400 mb-2">
              {level.title} · <span className="font-bold" style={{ color: level.accent }}>{level.tierLabel}</span>
            </p>
            <div className="text-7xl font-extrabold my-3" style={{ color: level.accent }}>{score}/{COUNT}</div>
            <p className="text-sm text-gray-400 mb-4">
              avg {avgSec}s per question
              {hintTotal > 0 && <span className="ml-1 text-amber-500">· 💡 {hintTotal} hint{hintTotal === 1 ? '' : 's'}</span>}
            </p>
            {nextLevelTitle && (
              <p className="text-gray-500 mb-6">
                Next: <span className="font-bold text-gray-700">{nextLevelTitle}</span>
              </p>
            )}
            <button
              onClick={() => { clearTimeout(timerRef.current); onAdvance() }}
              className="w-full text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-shadow mb-3"
              style={{ backgroundColor: level.accent }}
            >
              {nextLevelTitle ? `Play ${nextLevelTitle} →` : 'Next →'}
            </button>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">
              Replay this tier
            </button>
          </motion.div>
        </div>
      )
    }

    // ── Topic fully mastered — no next tier ────────────────────────────
    if (passed && !onAdvance) {
      return (
        <div className="max-w-xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          >
            <ConfettiPuff n={32} />
            <div className="text-6xl mb-2">🏆</div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Topic Mastered!</h1>
            <p className="text-sm text-gray-400 mb-2">{level.title}</p>
            <div className="text-7xl font-extrabold my-3" style={{ color: level.accent }}>{score}/{COUNT}</div>
            <p className="text-sm text-gray-400 mb-1">avg {avgSec}s per question</p>
            <p className="text-gray-500 mb-6">Every tier cleared. Come back to keep sharp!</p>
            <button onClick={reset} className="w-full text-white font-bold py-4 rounded-xl text-lg mb-3" style={{ backgroundColor: level.accent }}>
              Play Again
            </button>
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">
              ← Back to Levels
            </button>
          </motion.div>
        </div>
      )
    }

    // ── Keep practicing ────────────────────────────────────────────────
    const messages = ['Keep practicing! 💪', 'Nice start! 🙂', 'Good work! 👍', 'Great job! 🌟', 'Almost perfect! 🚀', 'Perfect score! 🏆']
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div className="bg-white rounded-2xl shadow-lg p-10 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Quiz Complete!</h1>
          <p className="text-sm text-gray-400 mb-2">
            {level.title} · <span className="font-bold" style={{ color: level.accent }}>{level.tierLabel}</span>
          </p>
          <div className="text-6xl font-extrabold my-4" style={{ color: level.accent }}>{score}/{COUNT}</div>
          <p className="text-lg text-gray-600 mb-1">{messages[score]}</p>
          <p className="text-sm text-gray-400 mb-1">Need {level.passBar}/{COUNT} to clear this tier · avg {avgSec}s</p>
          <p className={`text-xs text-amber-500 ${hintTotal > 0 ? 'mb-4' : 'mb-6'}`}>
            {hintTotal > 0 ? `💡 Used hints ${hintTotal}× this round` : ' '}
          </p>

          <div className="space-y-2 mb-8 text-left">
            {questions.map((qq, i) => (
              <button
                key={i}
                onClick={() => setReviewIdx(i)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${answers[i]?.correct ? 'border-green-400 bg-green-50 hover:bg-green-100' : 'border-red-300 bg-red-50 hover:bg-red-100'}`}
              >
                <span className="font-semibold text-gray-700">{answers[i]?.correct ? '✓' : '✗'} Question {i + 1}</span>
                <span className="text-sm text-gray-600">
                  {!answers[i]?.correct && <span className="mr-2">you: {qq.formatGuess(answers[i]?.guess)}</span>}
                  <span className="font-bold text-gray-800">{qq.formatAnswer}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button onClick={reset} className="w-full text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>Try Again (new questions)</button>
            {onAdvance && (
              <button onClick={() => { clearTimeout(timerRef.current); onAdvance() }} className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                Skip to {nextLevelTitle || 'Next'} →
              </button>
            )}
            <button onClick={onBack} className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">← Back to Levels</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Question screen -----------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {level.title}
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: level.accent }}>
              {level.tierLabel}
            </span>
          </h1>
          <span className="text-white px-3 py-1.5 rounded-lg font-bold text-sm" style={{ backgroundColor: level.accent }}>
            {index + 1} / {COUNT}
          </span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2">
          <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${((index + (phase === 'feedback' ? 1 : 0)) / COUNT) * 100}%`, backgroundColor: level.accent }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Figure */}
        <motion.div key={`fig-${index}`} className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center min-h-[300px]" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <FractionFigure fig={q.fig} />
        </motion.div>

        {/* Question + answer */}
        <motion.div
          key={`q-${index}`}
          className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 relative overflow-hidden
            ${phase === 'feedback' &&  lastCorrect ? 'quiz-puff'  : ''}
            ${phase === 'feedback' && !lastCorrect ? 'quiz-shake' : ''}`}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        >
          {phase === 'feedback' && lastCorrect && <ConfettiPuff />}

          <div>
            <h2 className="text-xl font-bold text-gray-800">{q.promptTitle}</h2>
            {q.promptText && <p className="text-sm text-gray-400 mt-1">{q.promptText}</p>}
          </div>

          {q.type === 'choice' && (
            <div className={`grid gap-3 ${q.choices.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {q.choices.map((c) => {
                const isAns = c === q.answer
                const isGuess = answers[index]?.guess === c
                let style = 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                if (phase === 'feedback') {
                  if (isAns) style = 'bg-green-500 text-white'
                  else if (isGuess) style = 'bg-red-400 text-white'
                  else style = 'bg-gray-100 text-gray-400'
                }
                return (
                  <button key={c} disabled={phase === 'feedback'} onClick={() => submit(c)} className={`py-3 rounded-xl font-black text-2xl transition-colors flex justify-center ${style}`}><Frac value={c} /></button>
                )
              })}
            </div>
          )}

          {q.type === 'number' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={value}
                disabled={phase === 'feedback'}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit(value)}
                placeholder="?"
                className="w-28 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
              />
              <span className="text-xl font-bold text-gray-400">{q.unit}</span>
              {phase === 'asking' && (
                <button onClick={() => submit(value)} className="ml-auto text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>Check</button>
              )}
            </div>
          )}

          {q.type === 'fraction' && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <input
                  type="number" value={frac.num} disabled={phase === 'feedback'}
                  onChange={(e) => setFrac((f) => ({ ...f, num: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && submit(frac)}
                  placeholder="?" aria-label="top number"
                  className="w-20 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
                />
                <div className="w-20 h-1 bg-gray-800 my-1.5 rounded" />
                <input
                  type="number" value={frac.den} disabled={phase === 'feedback'}
                  onChange={(e) => setFrac((f) => ({ ...f, den: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && submit(frac)}
                  placeholder="?" aria-label="bottom number"
                  className="w-20 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
                />
              </div>
              {phase === 'asking' && (
                <button onClick={() => submit(frac)} className="ml-auto text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>Check</button>
              )}
            </div>
          )}

          {q.hint && phase === 'asking' && (
            <HintBox text={q.hint} onOpen={handleHintOpen} onClose={handleHintClose} />
          )}

          {phase === 'feedback' && (
            <p className={`text-sm font-bold ${lastCorrect ? 'text-green-600' : 'text-red-500'}`}>
              {lastCorrect ? '✓ Correct!' : `✗ Answer: ${q.formatAnswer}`}
            </p>
          )}

          <button onClick={() => { clearTimeout(timerRef.current); onBack() }} className="text-sm text-gray-400 hover:text-gray-600 mt-auto self-start">← Back to Levels</button>

          {phase === 'feedback' && (
            <CountdownBar ms={lastCorrect ? CORRECT_DELAY : WRONG_DELAY} color={lastCorrect ? 'bg-green-400' : 'bg-red-400'} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Review a single problem after quiz completes.
function ReviewModal({ question, answer, idx, level, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Question {idx + 1}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Figure */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center min-h-[250px]">
              <FractionFigure fig={question.fig} />
            </div>

            {/* Question */}
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{question.promptTitle}</h3>
              {question.promptText && <p className="text-sm text-gray-500 mb-4">{question.promptText}</p>}

              <div className={`rounded-lg p-4 ${answer.correct ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                <p className="text-sm text-gray-600 mb-1">Your answer:</p>
                <p className={`text-lg font-bold ${answer.correct ? 'text-green-700' : 'text-red-700'}`}>
                  {question.formatGuess(answer.guess)}
                </p>
              </div>

              {!answer.correct && (
                <div className="mt-4 rounded-lg p-4 bg-blue-50 border-2 border-blue-300">
                  <p className="text-sm text-gray-600 mb-1">Correct answer:</p>
                  <p className="text-lg font-bold text-blue-700">{question.formatAnswer}</p>
                </div>
              )}

              {answer.correct && (
                <div className="mt-4 text-center">
                  <p className="text-3xl">✓ Correct!</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow"
              style={{ backgroundColor: level.accent }}
            >
              Back to Results
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// A peekable hint — open/close timing is reported up so it can be tracked per-question.
function HintBox({ text, onOpen, onClose }) {
  const [open, setOpen] = useState(false)
  const openHint = () => { setOpen(true); onOpen?.() }
  const closeHint = () => { setOpen(false); onClose?.() }
  return open ? (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-amber-800 font-semibold flex items-start gap-2">
      <span className="flex-1">{text}</span>
      <button onClick={closeHint} className="text-amber-300 hover:text-amber-500 flex-shrink-0 leading-none text-base">✕</button>
    </div>
  ) : (
    <button onClick={openHint} className="self-start text-sm font-semibold text-amber-500 hover:text-amber-600">💡 Need a hint?</button>
  )
}
