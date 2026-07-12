import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import QuestionFigure from '../QuestionFigure'
import { isCorrect } from '../../lib/angleQuiz'
import { generateWhole } from '../../lib/wholeNumbers'
import { playCorrect, playWrong, playLevelUp } from '../../lib/sound'
import { makeChoices } from '../../lib/choices'
import { saveSession } from '../../lib/sessions'
import { winsorize } from '../../lib/winsorize'

const CORRECT_DELAY = 620
const WRONG_DELAY   = 1300

// ── Confetti burst ────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#22c55e', '#86efac', '#fbbf24', '#34d399', '#a3e635', '#6ee7b7', '#f472b6']
function ConfettiPuff({ n = 16 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: n }, (_, i) => {
        const angle = (360 / n) * i
        const dist  = 48 + (i % 3) * 20
        const size  = 6 + (i % 3) * 4
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

// ── Main component ────────────────────────────────────────────────────────
export default function QuizShell({ user, level, onBack, onAdvance, nextLevelTitle, wholeOnly = false }) {
  const [seed, setSeed]        = useState(0)
  const [index, setIndex]      = useState(0)
  const [phase, setPhase]      = useState('asking')
  const [answers, setAnswers]  = useState([])
  const [lastCorrect, setLast] = useState(false)
  const timerRef               = useRef(null)
  const startRef               = useRef(Date.now())
  // Hint events for the current question — ref so submit() can read synchronously.
  const hintEventsRef          = useRef([])

  const COUNT = level.count

  const questions = useMemo(
    () => Array.from({ length: COUNT }, () => (wholeOnly ? generateWhole(level.generate) : level.generate())),
    [level, seed, wholeOnly, COUNT]
  )
  const q      = questions[index]
  const isLast = index === COUNT - 1
  const score  = answers.filter(a => a.correct).length

  const choices = useMemo(() => {
    if (!q || q.type !== 'number') return null
    return makeChoices(q.answer, { count: 4, min: 0, max: 999 })
  }, [q])

  useEffect(() => {
    startRef.current = Date.now()
    hintEventsRef.current = []  // reset hint tracking on each new question
  }, [index])

  // Save session when quiz completes.
  useEffect(() => {
    if (phase !== 'done') return
    const rawTimes = answers.map(a => a.ms)
    const wTimes   = winsorize(rawTimes)
    const avgMs    = rawTimes.length ? Math.round(wTimes.reduce((s, t) => s + t, 0) / wTimes.length) : 0
    const avgMsRaw = rawTimes.length ? Math.round(rawTimes.reduce((s, t) => s + t, 0) / rawTimes.length) : 0
    const speedOk  = !level.speedMs || avgMs <= level.speedMs
    const fullPass = score >= level.passBar && speedOk
    const hintTotal   = answers.reduce((s, a) => s + (a.hintCount || 0), 0)
    const hintTotalMs = answers.reduce((s, a) => s + (a.hintMs   || 0), 0)

    if (fullPass) playLevelUp()
    saveSession({
      id: Date.now(),
      ts: new Date().toISOString(),
      toolId: 'ants-angles',
      userId: user,
      levelId: level.id,
      levelTitle: level.title,
      topicId: level.topicId ?? null,
      tierId: level.tierId ?? null,
      tierLabel: level.tierLabel ?? null,
      category: level.category ?? 'Angles',
      score,
      count: COUNT,
      passed: fullPass,
      wholeOnly,
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

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const reset = () => {
    clearTimeout(timerRef.current)
    hintEventsRef.current = []
    setSeed(s => s + 1); setIndex(0); setPhase('asking'); setAnswers([])
  }

  // Hint callbacks — update the ref synchronously so submit() can read them.
  const handleHintOpen = () => {
    hintEventsRef.current = [...hintEventsRef.current, { openAt: Date.now() }]
  }
  const handleHintClose = () => {
    const now = Date.now()
    hintEventsRef.current = hintEventsRef.current.map((e, i) =>
      i === hintEventsRef.current.length - 1 && !e.closeAt
        ? { ...e, closeAt: now }
        : e
    )
  }

  const submit = (guess) => {
    if (phase !== 'asking') return
    const correct = isCorrect(q, guess)
    const now = Date.now()
    const ms  = now - startRef.current

    // Close any still-open hint and capture duration.
    const closedEvents = hintEventsRef.current.map(e =>
      e.closeAt ? e : { ...e, closeAt: now }
    )
    hintEventsRef.current = []
    const hintCount = closedEvents.length
    const hintMs    = closedEvents.reduce((s, e) => s + (e.closeAt - e.openAt), 0)

    setLast(correct)
    setAnswers(a => [...a, { guess, correct, ms, hintCount, hintMs }])
    setPhase('feedback')
    if (correct) playCorrect(); else playWrong()
    timerRef.current = setTimeout(() => {
      if (isLast) setPhase('done')
      else { setIndex(i => i + 1); setPhase('asking') }
    }, correct ? CORRECT_DELAY : WRONG_DELAY)
  }

  // ── Results screens ─────────────────────────────────────────────────────
  if (phase === 'done') {
    const rawTimes = answers.map(a => a.ms)
    const wTimes   = winsorize(rawTimes)
    const avgMs    = rawTimes.length ? Math.round(wTimes.reduce((s, t) => s + t, 0) / wTimes.length) : 0
    const avgMsRaw = rawTimes.length ? Math.round(rawTimes.reduce((s, t) => s + t, 0) / rawTimes.length) : 0
    const speedOk   = !level.speedMs || avgMs <= level.speedMs
    const fullPass  = score >= level.passBar && speedOk
    const isMaster  = level.tierId === 'master'
    const anyWinsorized = wTimes.some((t, i) => t !== rawTimes[i])
    const hintTotal = answers.reduce((s, a) => s + (a.hintCount || 0), 0)

    // ── Level Up / Topic Mastered ──────────────────────────────────────
    if (fullPass && onAdvance) {
      return (
        <div className="max-w-xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          >
            <ConfettiPuff n={24} />
            <div className="text-6xl mb-2">{isMaster ? '🏆' : '🎉'}</div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
              {isMaster ? 'Topic Mastered!' : 'Level Up!'}
            </h1>
            <div className="text-7xl font-extrabold my-3" style={{ color: level.accent }}>
              {score}/{COUNT}
            </div>
            <p className="text-sm text-gray-400 mb-4">
              avg {(avgMs / 1000).toFixed(1)}s per question
              {anyWinsorized && <span className="ml-1 text-amber-400" title="One or more outlier times were adjusted">⚡</span>}
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
              Replay this level
            </button>
          </motion.div>
        </div>
      )
    }

    // ── All mastered — no next level ───────────────────────────────────
    if (fullPass && !onAdvance) {
      return (
        <div className="max-w-xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          >
            <ConfettiPuff n={32} />
            <div className="text-6xl mb-2">🌟</div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Complete Mastery!</h1>
            <div className="text-7xl font-extrabold my-3" style={{ color: level.accent }}>{score}/{COUNT}</div>
            <p className="text-gray-500 mb-6">Every level cleared. Come back to keep sharp!</p>
            <button onClick={reset} className="w-full text-white font-bold py-4 rounded-xl text-lg"
              style={{ backgroundColor: level.accent }}>
              Play Again
            </button>
            <button onClick={onBack} className="mt-3 text-sm text-gray-400 hover:text-gray-600 block w-full">
              ⚙ Change Level
            </button>
          </motion.div>
        </div>
      )
    }

    // ── Speed gate failed (score fine, avg too slow) ────────────────────
    if (score >= level.passBar && !speedOk) {
      const avgSec   = (avgMs / 1000).toFixed(1)
      const rawSec   = (avgMsRaw / 1000).toFixed(1)
      const limitSec = (level.speedMs / 1000).toFixed(0)
      return (
        <div className="max-w-xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-5xl mb-2">⚡</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Almost — Too Slow!</h1>
            <div className="text-6xl font-extrabold my-3" style={{ color: level.accent }}>{score}/{COUNT}</div>
            <p className="text-gray-600 mb-1">Great accuracy! Master needs faster reflexes.</p>
            <p className="text-sm text-gray-400 mb-1">
              Your avg:{' '}
              <span className="font-bold text-red-400">{avgSec}s</span>
              {anyWinsorized && <span className="text-gray-300 text-xs ml-1">(raw: {rawSec}s, outliers adjusted ⚡)</span>}
              {' '}— need under <span className="font-bold text-gray-700">{limitSec}s</span>
            </p>
            {hintTotal > 0 && (
              <p className="text-xs text-amber-500 mb-4">💡 Used hints {hintTotal}× this round</p>
            )}
            <ResultGrid questions={questions} answers={answers} wTimes={wTimes} />
            <div className="space-y-3 mt-6">
              <button onClick={reset} className="w-full text-white font-bold py-3 rounded-xl hover:shadow-lg"
                style={{ backgroundColor: level.accent }}>
                Try Again
              </button>
              <button onClick={onBack} className="w-full text-gray-400 text-sm py-1 hover:text-gray-600">
                ⚙ Change Level
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    // ── Keep practicing ────────────────────────────────────────────────
    const pct     = score / COUNT
    const msg     = pct === 1 ? 'Perfect! 🌟' : pct >= 0.8 ? 'Almost there! 🚀' : pct >= 0.6 ? 'Good work! 👍' : pct >= 0.4 ? 'Nice try! 🙂' : 'Keep practicing! 💪'
    const avgSec  = (avgMs / 1000).toFixed(1)
    const rawSec  = (avgMsRaw / 1000).toFixed(1)
    const needBar = `${level.passBar}/${COUNT}`
    return (
      <div className="max-w-xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Quiz Complete</h1>
          <div className="text-6xl font-extrabold my-3" style={{ color: level.accent }}>{score}/{COUNT}</div>
          <p className="text-gray-600 mb-1">{msg}</p>
          <p className="text-sm text-gray-400 mb-1">
            Need {needBar} to pass · avg {avgSec}s
            {anyWinsorized && <span className="text-amber-400 ml-1" title={`Raw avg: ${rawSec}s — outlier times adjusted`}>⚡</span>}
          </p>
          {hintTotal > 0 && (
            <p className="text-xs text-amber-500 mb-3">💡 Used hints {hintTotal}× this round</p>
          )}

          <ResultGrid questions={questions} answers={answers} wTimes={wTimes} />

          <div className="space-y-3 mt-6">
            <button onClick={reset} className="w-full text-white font-bold py-3 rounded-xl hover:shadow-lg transition-shadow"
              style={{ backgroundColor: level.accent }}>
              Try Again
            </button>
            {onAdvance && (
              <button onClick={() => { clearTimeout(timerRef.current); onAdvance() }}
                className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                Skip to {nextLevelTitle || 'Next'} →
              </button>
            )}
            <button onClick={onBack} className="w-full text-gray-400 text-sm py-1 hover:text-gray-600">
              ⚙ Change Level
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Question screen ─────────────────────────────────────────────────────
  const questionChoices = q.type === 'choice' ? q.choices : (choices ?? [])
  const tierChip = level.tierLabel
    ? <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-2 text-white"
        style={{ backgroundColor: level.accent }}>{level.tierLabel}</span>
    : null

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            {level.title}{tierChip}
          </h1>
          <span className="text-white px-3 py-1.5 rounded-lg font-bold text-sm" style={{ backgroundColor: level.accent }}>
            {index + 1} / {COUNT}
          </span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2">
          <div className="h-2 rounded-full transition-all duration-300" style={{
            width: `${((index + (phase === 'feedback' ? 1 : 0)) / COUNT) * 100}%`,
            backgroundColor: level.accent,
          }} />
        </div>
        {level.speedMs && (
          <p className="text-xs text-gray-400 mt-1 text-right">
            Master: 10/10 in under {level.speedMs / 1000}s avg
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Figure */}
        <motion.div
          key={`fig-${index}`}
          className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center min-h-[300px]"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        >
          <QuestionFigure q={q} reveal={phase === 'feedback'} />
        </motion.div>

        {/* Answer card */}
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

          <div className={`grid gap-3 ${questionChoices.length === 5 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {questionChoices.map((c) => {
              const isAns   = q.type === 'choice' ? c === q.answer : Math.abs(Number(c) - q.answer) <= (q.tolerance ?? 0)
              const isGuess = phase === 'feedback' && (
                q.type === 'choice' ? answers[index]?.guess === c : Math.abs(Number(answers[index]?.guess) - Number(c)) <= (q.tolerance ?? 0)
              )
              let style = 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 cursor-pointer'
              if (phase === 'feedback') {
                if (isAns)                        style = 'bg-green-500 text-white shadow-md'
                else if (isGuess && !lastCorrect) style = 'bg-red-400 text-white'
                else                              style = 'bg-gray-100 text-gray-400 cursor-default'
              }
              const label = q.type === 'number' ? q.formatGuess(c) : c
              return (
                <button
                  key={c}
                  disabled={phase === 'feedback'}
                  onClick={() => submit(q.type === 'number' ? Number(c) : c)}
                  className={`py-3.5 px-4 rounded-xl font-bold text-lg transition-all ${style}`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {phase === 'feedback' && (
            <p className={`text-sm font-bold ${lastCorrect ? 'text-green-600' : 'text-red-500'}`}>
              {lastCorrect ? '✓ Correct!' : `✗ Answer: ${q.formatAnswer}`}
            </p>
          )}

          {q.hint && phase === 'asking' && (
            <HintBox text={q.hint} onOpen={handleHintOpen} onClose={handleHintClose} />
          )}

          <button
            onClick={() => { clearTimeout(timerRef.current); onBack() }}
            className="text-xs text-gray-300 hover:text-gray-500 mt-auto self-start transition-colors"
          >
            ⚙ Change Level
          </button>

          {phase === 'feedback' && (
            <CountdownBar ms={lastCorrect ? CORRECT_DELAY : WRONG_DELAY} color={lastCorrect ? 'bg-green-400' : 'bg-red-400'} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ── Result grid (shown on all non-pass screens) ───────────────────────────
function ResultGrid({ questions, answers, wTimes }) {
  return (
    <div className="space-y-2 text-left mt-4">
      {questions.map((qq, i) => {
        const a         = answers[i]
        const rawMs     = a?.ms ?? 0
        const winMs     = wTimes?.[i] ?? rawMs
        const winsorized = winMs !== rawMs
        return (
          <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border-2 text-sm
            ${a?.correct ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              {a?.correct ? '✓' : '✗'} Q{i + 1}
              {(a?.hintCount || 0) > 0 && (
                <span className="text-amber-400 text-xs" title={`Hint open for ${(a.hintMs / 1000).toFixed(1)}s`}>💡</span>
              )}
            </span>
            <span className="text-gray-600 flex items-center gap-2">
              {!a?.correct && <span className="text-red-500">{qq.formatGuess(a?.guess)}</span>}
              <span className="font-bold text-gray-800">{qq.formatAnswer}</span>
              {winsorized ? (
                <span className="flex items-center gap-1">
                  <span className="line-through text-gray-300 text-xs">{(rawMs / 1000).toFixed(1)}s</span>
                  <span className="text-amber-400 text-xs" title="Outlier adjusted">{(winMs / 1000).toFixed(1)}s ⚡</span>
                </span>
              ) : (
                <span className="text-gray-400">{(rawMs / 1000).toFixed(1)}s</span>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Hint box with open/close tracking ────────────────────────────────────
function HintBox({ text, onOpen, onClose }) {
  const [open, setOpen] = useState(false)

  const openHint = () => { setOpen(true); onOpen?.() }
  const closeHint = () => { setOpen(false); onClose?.() }

  if (!open) {
    return (
      <button onClick={openHint} className="self-start text-xs font-semibold text-amber-400 hover:text-amber-600">
        💡 Hint
      </button>
    )
  }
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-amber-800 font-semibold text-sm flex items-start gap-2">
      <span className="flex-1">{text}</span>
      <button onClick={closeHint} className="text-amber-300 hover:text-amber-500 flex-shrink-0 leading-none text-base">
        ✕
      </button>
    </div>
  )
}
