import { useCallback, useState } from 'react'
import MakeItQuestion from './MakeItQuestion'
import ReadGridQuestion from './ReadGridQuestion'
import Burst from './Burst'
import { POOL, FRIENDLY, FRAC_WORDS, rand, praise } from '../../lib/percents'

// A short round of quick percent challenges — TOTAL questions, then a finish
// screen. Two question types, mixed:
//   • "Make it"  — drag/slide the grid to a target (reuses the satisfying toy)
//   • "How much" — read a grid, tap the right percent
// Every correct answer pops some confetti; the halfway mark gets a 🏆 cheer.
// Nothing ever "fails" — wrong taps just shake, so every round finishes strong.
const TOTAL = 10

let qid = 0
function makeQuestion() {
  qid += 1
  if (Math.random() < 0.55) {
    const target = rand(POOL)
    const useFrac = Boolean(FRAC_WORDS[target]) && Math.random() < 0.45
    return { id: qid, type: 'make', target, useFrac }
  }
  const value = rand(POOL)
  const others = FRIENDLY.filter((v) => v !== value)
  const picks = []
  while (picks.length < 2) {
    const c = rand(others)
    if (!picks.includes(c)) picks.push(c)
  }
  const choices = [value, ...picks].sort(() => Math.random() - 0.5)
  return { id: qid, type: 'read', value, choices }
}

export default function ChallengeMode({ onGoToMode }) {
  const [question, setQuestion] = useState(makeQuestion)
  const [answered, setAnswered] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  const handleCorrect = useCallback(() => {
    const v = question.type === 'make' ? question.target : question.value
    const n = answered + 1
    setMessage(praise(v))
    setAnswered(n)
    setCelebrating(true)
    setTimeout(() => {
      setCelebrating(false)
      if (n >= TOTAL) {
        setDone(true)
      } else {
        setQuestion(makeQuestion())
      }
    }, 1300)
  }, [question, answered])

  const restart = () => {
    setQuestion(makeQuestion())
    setAnswered(0)
    setCelebrating(false)
    setMessage('')
    setDone(false)
  }

  const goTo = (m) => { onGoToMode(m); window.scrollTo({ top: 0 }) }

  if (done) return <FinishScreen total={TOTAL} onReplay={restart} onGoTo={goTo} />

  // Halfway cheer (don't fire it on the very last answer — that's the finish).
  const milestone = celebrating && answered === Math.ceil(TOTAL / 2) && answered < TOTAL
  const current = Math.min(answered + (celebrating ? 0 : 1), TOTAL)

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress: question count + a row of star pips */}
      <div className="mb-6">
        <div className="text-center font-black text-cyan-600 mb-2">
          Question {current} of {TOTAL}
        </div>
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: TOTAL }, (_, i) => (
            <span key={i} className={`text-lg ${i < answered ? '' : 'opacity-25 grayscale'}`}>
              ⭐
            </span>
          ))}
        </div>
      </div>

      <div className="relative bg-white rounded-3xl shadow-lg p-6 overflow-hidden">
        {question.type === 'make' ? (
          <MakeItQuestion key={question.id} question={question} frozen={celebrating} onCorrect={handleCorrect} />
        ) : (
          <ReadGridQuestion key={question.id} question={question} frozen={celebrating} onCorrect={handleCorrect} />
        )}

        {celebrating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm">
            <Burst key={answered} />
            <div className="text-6xl mb-2">{milestone ? '🏆' : '🎉'}</div>
            <div className="text-2xl font-black text-gray-800 text-center px-6">{message}</div>
            {milestone && (
              <div className="mt-2 text-cyan-600 font-black text-lg">Halfway there — keep going! 🐜</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Shown after the last question: a big well-done, then "what next?"
function FinishScreen({ total, onReplay, onGoTo }) {
  return (
    <div className="relative max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-8 text-center overflow-hidden">
      <Burst />
      <div className="text-7xl mb-3">🏆</div>
      <h3 className="text-3xl font-black text-gray-800 mb-2">You did it!</h3>
      <p className="text-lg text-gray-600 mb-1">
        You finished all <strong>{total}</strong> challenges. ⭐
      </p>
      <div className="flex justify-center gap-1 mb-7 text-xl">
        {Array.from({ length: total }, (_, i) => <span key={i}>⭐</span>)}
      </div>

      <button
        onClick={onReplay}
        className="w-full mb-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-shadow"
      >
        🔁 Play again
      </button>
      <p className="text-sm text-gray-400 mb-3">Or do something else:</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onGoTo('learn')}
          className="bg-cyan-50 text-cyan-600 font-bold py-3 rounded-xl hover:bg-cyan-100 transition-colors"
        >
          📖 Learn
        </button>
        <button
          onClick={() => onGoTo('play')}
          className="bg-sky-50 text-sky-600 font-bold py-3 rounded-xl hover:bg-sky-100 transition-colors"
        >
          🧭 Free Play
        </button>
      </div>
    </div>
  )
}
