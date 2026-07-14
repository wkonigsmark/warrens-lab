import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import BalanceScale from './BalanceScale'
import ClassicBoard from './ClassicBoard'
import Climb from './Climb'
import { RUNGS } from '../lib/algebraQuiz'
import { saveSession } from '../lib/sessions'
import { playCorrect, playWrong, playClimb, playSummit } from '../lib/sound'

const CONFETTI_COLORS = ['#22c55e', '#86efac', '#fbbf24', '#34d399', '#a3e635', '#6ee7b7', '#f472b6']
function ConfettiPuff({ n = 18 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: n }, (_, i) => {
        const angle = (360 / n) * i
        const dist = 52 + (i % 3) * 22
        const size = 6 + (i % 3) * 4
        return (
          <span key={i} style={{
            position: 'absolute', left: '50%', top: '40%',
            width: size, height: size, borderRadius: '50%',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confettiDot 0.65s ease-out ${(i % 5) * 0.03}s both`,
            '--dx': `${Math.cos((angle * Math.PI) / 180) * dist}px`,
            '--dy': `${Math.sin((angle * Math.PI) / 180) * dist}px`,
          }} />
        )
      })}
    </div>
  )
}

// One run up the anthill. Two-guess rule per question:
//   1st wrong tap → the scale tips and TELLS you which way you're off; retry.
//   2nd wrong tap → reveal (a miss). Miss more than the tier budget = run over.
export default function ClimbSession({ user, level, onBack, onDone }) {
  const [rung, setRung] = useState(0)
  const [misses, setMisses] = useState(0)
  const [wobbles, setWobbles] = useState(0)
  const [qSeed, setQSeed] = useState(0)
  const [guess, setGuess] = useState(null)         // last tapped value
  const [phase, setPhase] = useState('asking')     // asking | tipped | correct | reveal | summit | fell
  const [wrongTaps, setWrongTaps] = useState([])   // disabled choice values this question
  const [qCount, setQCount] = useState(1)
  const [answers, setAnswers] = useState([])       // per-question timing/outcome
  const timerRef = useRef(null)
  const startRef = useRef(Date.now())
  const qStartRef = useRef(Date.now())             // when the current question first appeared

  const q = useMemo(() => level.generate(), [level, qSeed])
  useEffect(() => () => clearTimeout(timerRef.current), [])
  useEffect(() => { qStartRef.current = Date.now() }, [qSeed])

  const finishRun = (summited, finalRung, finalMisses, finalWobbles, questions, finalAnswers) => {
    const avgMs = finalAnswers.length
      ? Math.round(finalAnswers.reduce((sum, a) => sum + a.ms, 0) / finalAnswers.length)
      : null
    saveSession({
      id: Date.now(),
      ts: new Date().toISOString(),
      toolId: 'ants-algebra',
      userId: user,
      levelId: level.id,
      levelTitle: level.title,
      tierLabel: level.tierLabel,
      topicId: level.topicId,
      rungs: finalRung,
      misses: finalMisses,
      wobbles: finalWobbles,
      count: questions,
      score: finalRung,
      passed: summited,
      ms: Date.now() - startRef.current,
      avgMs,
      answers: finalAnswers,
    }, user)
  }

  const nextQuestion = () => {
    setGuess(null)
    setWrongTaps([])
    setPhase('asking')
    setQCount(c => c + 1)
    setQSeed(s => s + 1)
  }

  const tap = (value) => {
    if (phase !== 'asking' && phase !== 'tipped') return
    setGuess(value)

    if (value === q.answer) {
      const newRung = rung + 1
      const wobbled = wrongTaps.length > 0
      const ms = Date.now() - qStartRef.current
      const newAnswers = [...answers, { q: qCount, correct: true, wobbled, ms }]
      setAnswers(newAnswers)
      if (wobbled) setWobbles(w => w + 1)
      setPhase('correct')
      if (newRung >= RUNGS) {
        playSummit()
        setRung(newRung)
        timerRef.current = setTimeout(() => {
          finishRun(true, newRung, misses, wobbles + (wobbled ? 1 : 0), qCount, newAnswers)
          setPhase('summit')
        }, 900)
      } else {
        playCorrect()
        timerRef.current = setTimeout(() => {
          playClimb()
          setRung(newRung)
          timerRef.current = setTimeout(nextQuestion, 550)
        }, 850)
      }
      return
    }

    // Wrong tap
    playWrong()
    if (wrongTaps.length === 0) {
      setWrongTaps([value])
      setPhase('tipped')
      return
    }

    // Second wrong tap → miss
    const newMisses = misses + 1
    const ms = Date.now() - qStartRef.current
    const newAnswers = [...answers, { q: qCount, correct: false, wobbled: true, ms }]
    setAnswers(newAnswers)
    setWrongTaps(t => [...t, value])
    setMisses(newMisses)
    setPhase('reveal')
    if (newMisses > level.missBudget) {
      timerRef.current = setTimeout(() => {
        finishRun(false, rung, newMisses, wobbles, qCount, newAnswers)
        setPhase('fell')
      }, 1500)
    } else {
      timerRef.current = setTimeout(nextQuestion, 1600)
    }
  }

  // ── End screens ────────────────────────────────────────────────────────────
  if (phase === 'summit') {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-10 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
        >
          <ConfettiPuff n={26} />
          <div className="text-6xl mb-2">👑</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Summit!</h1>
          <p className="text-gray-500 mb-1">
            {level.title} · <span className="font-bold" style={{ color: level.accent }}>{level.tierLabel} cleared</span>
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {RUNGS} rungs · {misses} {misses === 1 ? 'miss' : 'misses'}
            {wobbles > 0 && ` · ${wobbles} close ${wobbles === 1 ? 'call' : 'calls'}`}
          </p>
          <button
            onClick={() => onDone()}
            className="w-full text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-shadow"
            style={{ backgroundColor: level.accent }}
          >
            Next Tier →
          </button>
          <button onClick={onBack} className="mt-3 text-sm text-gray-400 hover:text-gray-600">
            ← Back to Base Camp
          </button>
        </motion.div>
      </div>
    )
  }

  if (phase === 'fell') {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-2">🍂</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Slid down the hill!</h1>
          <p className="text-gray-500 mb-1">You climbed <span className="font-bold">{rung}</span> of {RUNGS} rungs.</p>
          <p className="text-sm text-gray-400 mb-6">
            {level.tierLabel} allows {level.missBudget} {level.missBudget === 1 ? 'miss' : 'misses'} — you had {misses}.
          </p>
          <button
            onClick={() => onDone(true)}
            className="w-full text-white font-bold py-3 rounded-xl hover:shadow-lg"
            style={{ backgroundColor: level.accent }}
          >
            Climb Again
          </button>
          <button onClick={onBack} className="mt-3 text-sm text-gray-400 hover:text-gray-600 block w-full">
            ← Back to Base Camp
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Question screen ────────────────────────────────────────────────────────
  const isClassic = q.scale == null
  const unknownLabel = q.equation.includes('x') ? 'x' : '?'
  const guessTooBig = guess != null && (
    isClassic ? guess > q.answer : q.scale.constant + q.scale.xCount * guess > q.scale.total
  )
  const caption =
    phase === 'correct' ? { text: isClassic ? '✏️ Nailed it! Climb on, little ant!' : '⚖️ Balanced! Climb on, little ant!', cls: 'text-green-600' }
    : phase === 'reveal' ? { text: `The answer was ${unknownLabel} = ${q.answer}`, cls: 'text-red-500' }
    : phase === 'tipped' ? (
        guessTooBig
          ? { text: isClassic ? '🔽 Too big — try a smaller number' : '⬇️ Too heavy — try a smaller number', cls: 'text-amber-600' }
          : { text: isClassic ? '🔼 Too small — try a bigger number' : '⬆️ Too light — try a bigger number', cls: 'text-amber-600' }
      )
    : isClassic
      ? { text: 'What number goes in the box?', cls: 'text-gray-400' }
    : q.transformed
      ? { text: `Same scale, rebalanced: ${q.transformed}`, cls: 'text-gray-400' }
      : { text: 'Which weight balances the scale?', cls: 'text-gray-400' }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {level.emoji} {level.title}
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: level.accent }}>
            {level.tierLabel}
          </span>
        </h1>
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600">⚙ Quit run</button>
      </div>

      <div className="flex gap-4 items-stretch">
        {/* Game card */}
        <motion.div
          key={qSeed}
          className={`flex-1 bg-white rounded-2xl shadow-lg p-5 relative overflow-hidden ${phase === 'reveal' ? 'quiz-shake' : ''}`}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
        >
          {phase === 'correct' && <ConfettiPuff />}

          {!isClassic && (
            <div className="text-center text-3xl font-extrabold text-gray-800 mb-1 font-mono">
              {q.equation.split('x').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span style={{ color: '#b45309' }}>x</span>}
                </span>
              ))}
            </div>
          )}
          <p className={`text-center text-sm font-semibold mb-2 min-h-[20px] ${caption.cls}`}>{caption.text}</p>

          {isClassic ? (
            <ClassicBoard
              equation={q.equation}
              guess={phase === 'reveal' ? null : guess}
              reveal={phase === 'reveal' ? q.answer : null}
            />
          ) : (
            <BalanceScale
              scale={q.scale}
              guess={phase === 'reveal' ? null : guess}
              reveal={phase === 'reveal' ? q.answer : null}
            />
          )}

          {/* Choice tiles */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {q.choices.map((c) => {
              const wrong = wrongTaps.includes(c)
              const isAnswer = phase === 'reveal' && c === q.answer
              return (
                <button
                  key={c}
                  disabled={wrong || phase === 'correct' || phase === 'reveal'}
                  onClick={() => tap(c)}
                  className={`py-3 rounded-xl font-extrabold text-xl transition-all border-2
                    ${isAnswer ? 'bg-green-500 border-green-500 text-white' :
                      wrong ? 'bg-red-50 border-red-200 text-red-300 line-through' :
                      phase === 'correct' && c === q.answer ? 'bg-green-500 border-green-500 text-white' :
                      'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 active:scale-95'}`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Climb rail */}
        <Climb rung={rung} misses={misses} missBudget={level.missBudget} accent={level.accent} />
      </div>
    </div>
  )
}
