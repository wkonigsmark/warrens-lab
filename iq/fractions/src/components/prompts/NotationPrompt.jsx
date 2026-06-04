import { useState } from 'react'
import { motion } from 'framer-motion'
import FractionLabel from '../FractionLabel'
import Frac from '../Frac'

// A few quick reps to cement "stacked and slash are the same fraction." Each
// round goes one direction (stacked→slash or slash→stacked); the wrong choice
// is usually the flipped fraction, so order-matters gets reinforced gently.
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeRound() {
  const den = randInt(2, 6)
  const num = randInt(1, den - 1)
  const dir = Math.random() < 0.5 ? 'toSlash' : 'toStacked'
  const answer = `${num}/${den}`
  const set = new Set([answer, `${den}/${num}`]) // flipped is the key distractor
  if (num + 1 <= den) set.add(`${num + 1}/${den}`)
  if (num - 1 >= 1) set.add(`${num - 1}/${den}`)
  return { num, den, dir, answer, choices: shuffle([...set].slice(0, 3)) }
}

const ROUNDS = 3

export default function NotationPrompt() {
  const [rounds] = useState(() => Array.from({ length: ROUNDS }, makeRound))
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState('ask') // 'ask' | 'good' | 'done'
  const [wrong, setWrong] = useState(false)

  const r = rounds[i]
  const toSlash = r.dir === 'toSlash'

  const pick = (c) => {
    if (phase !== 'ask') return
    if (c === r.answer) { setPhase('good'); setWrong(false) } else setWrong(true)
  }
  const next = () => {
    if (i + 1 >= ROUNDS) { setPhase('done'); return }
    setI(i + 1); setPhase('ask'); setWrong(false)
  }
  const restart = () => { setI(0); setPhase('ask'); setWrong(false) }

  if (phase === 'done') {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
        <motion.p initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-green-600 font-bold text-xl">
          You've got it! Stacked or slash — same fraction. 🎉
        </motion.p>
        <button onClick={restart} className="mt-4 text-sm text-gray-400 underline">go again</button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <div className="flex justify-center gap-1.5 mb-4">
        {rounds.map((_, idx) => (
          <span key={idx} className={`w-2.5 h-2.5 rounded-full ${idx < i || (idx === i && phase === 'good') ? 'bg-green-400' : idx === i ? 'bg-amber-400' : 'bg-gray-200'}`} />
        ))}
      </div>

      <p className="text-lg font-extrabold text-gray-700 mb-1">Quick check 👆</p>
      <p className="text-gray-500 mb-4">Same fraction, written {toSlash ? 'with a slash' : 'stacked'} — which one?</p>

      {/* The given fraction */}
      <div className="flex justify-center mb-5">
        {toSlash ? (
          <FractionLabel num={r.num} den={r.den} big />
        ) : (
          <span className="text-7xl font-black">
            <span className="text-amber-500">{r.num}</span>
            <span className="text-gray-400">/</span>
            <span className="text-amber-800">{r.den}</span>
          </span>
        )}
      </div>

      {/* Choices in the OTHER notation */}
      <div className="flex justify-center gap-3 flex-wrap">
        {r.choices.map((c) => {
          const isAns = c === r.answer
          const picked = phase === 'good' && isAns
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              disabled={phase === 'good'}
              className={`min-w-[68px] h-16 px-3 rounded-2xl text-2xl font-black flex items-center justify-center transition ${
                picked ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200 active:scale-95'
              }`}
            >
              {toSlash ? c : <Frac value={c} />}
            </button>
          )
        })}
      </div>

      {phase === 'good' ? (
        <div className="mt-5">
          <p className="text-green-600 font-bold">✓ Same fraction!</p>
          <button onClick={next} className="mt-2 text-white font-bold px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 transition-colors">
            {i + 1 >= ROUNDS ? 'Finish →' : 'Next →'}
          </button>
        </div>
      ) : (
        wrong && (
          <p className="mt-5 text-amber-600 font-semibold">
            Careful — keep the <span className="text-amber-500 font-bold">top</span> on top and the{' '}
            <span className="text-amber-800 font-bold">bottom</span> on the bottom. The number before the
            slash is the top.
          </p>
        )
      )}
    </div>
  )
}
