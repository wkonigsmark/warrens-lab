import { useState } from 'react'
import { motion } from 'framer-motion'
import Pie from '../Pie'
import { range } from '../../lib/fractionQuiz'

// Guided add/subtract of two same-bottom fractions. The child taps the answer's
// top number; wrong taps get a counting nudge, then the result pie reveals.
export default function AddPrompt({ den = 4, a = 1, b = 2, op = '+' }) {
  const result = op === '+' ? a + b : a - b
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)

  const pick = (v) => {
    if (v === result) { setDone(true); setWrong(false) } else setWrong(true)
  }

  // Choices around the true top number, kept inside 0..den.
  const choices = choicesAround(result, 0, den)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-5">
        Your turn! {op === '+' ? 'Add' : 'Subtract'} the pieces.
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap mb-5">
        <Mini den={den} num={a} />
        <Op>{op}</Op>
        <Mini den={den} num={op === '+' ? b : b} />
        <Op>=</Op>
        {done ? <Mini den={den} num={result} highlight /> : <span className="text-4xl font-black text-gray-300">?</span>}
      </div>

      {!done ? (
        <>
          <p className="text-gray-600 font-semibold mb-3">
            The bottom stays <span className="font-black">{den}</span>. What is the top number?
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {choices.map((v) => (
              <button
                key={v}
                onClick={() => pick(v)}
                className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 text-2xl font-black hover:bg-amber-200 active:scale-95 transition"
              >
                {v}
              </button>
            ))}
          </div>
          {wrong && (
            <p className="mt-4 text-amber-600 font-semibold">
              {op === '+' ? `Count all the shaded pieces: ${a} + ${b}.` : `Start with ${a} shaded, take away ${b}.`}
            </p>
          )}
        </>
      ) : (
        <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-green-600 font-bold text-lg">
          Yes! {a}/{den} {op} {b}/{den} = <span className="text-2xl">{result}/{den}</span> 🎉
        </motion.p>
      )}

      {done && (
        <button onClick={() => { setDone(false); setWrong(false) }} className="mt-4 text-sm text-gray-400 underline">
          try it again
        </button>
      )}
    </div>
  )
}

function Mini({ den, num, highlight }) {
  return (
    <div className="text-center">
      <Pie parts={den} shaded={range(num)} size={92} />
      <div className={`font-bold mt-1 ${highlight ? 'text-green-600' : 'text-gray-600'}`}>{num}/{den}</div>
    </div>
  )
}

function Op({ children }) {
  return <span className="text-3xl font-black text-gray-400">{children}</span>
}

function choicesAround(answer, min, max) {
  const set = new Set([answer])
  let lo = answer - 1
  let hi = answer + 1
  while (set.size < 3) {
    if (lo >= min) set.add(lo)
    if (set.size < 3 && hi <= max) set.add(hi)
    lo--; hi++
    if (lo < min && hi > max) break
  }
  return [...set].sort((x, y) => x - y)
}
