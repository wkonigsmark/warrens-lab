import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cube3D from '../Cube3D'

// Read a power OFF a 3-D cube (the cube cousin of ReadPowerPrompt). Three guided
// steps: count the edge → realize it's "edge to the power 3" → count all the
// blocks. Same inline-Question structure as ReadPowerPrompt (the shape that
// reliably handles clicks).
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const sup = (n) => String(n).split('').map((d) => SUP[d]).join('')

export default function ReadCubePrompt({ n = 3 }) {
  const [step, setStep] = useState(0)
  const [wrong, setWrong] = useState(false)
  const advance = (ok) => { if (ok) { setStep((s) => s + 1); setWrong(false) } else setWrong(true) }
  const total = n ** 3

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-5">What power is this cube? 🧊</p>

      <div className="flex justify-center mb-6">
        <Cube3D n={n} size={200} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Question
            key="q0"
            prompt="How many blocks along one edge?"
            choices={around(n, 2, n + 2).map((v) => ({ label: String(v), correct: v === n }))}
            onPick={advance}
            wrong={wrong}
            nudge="Count one edge — straight along the top, not the whole face."
          />
        )}
        {step === 1 && (
          <Question
            key="q1"
            prompt={`It's ${n} wide, ${n} deep AND ${n} tall. What power is that?`}
            choices={[`${n}${sup(2)}`, `${n}${sup(3)}`, `${n}×3`].map((l) => ({ label: l, correct: l === `${n}${sup(3)}` }))}
            onPick={advance}
            wrong={wrong}
            nudge="The base is used 3 times (wide × deep × tall), so the little number is 3."
          />
        )}
        {step === 2 && (
          <Question
            key="q2"
            prompt={`So how many little blocks in all? (${n} × ${n} × ${n})`}
            choices={around(total, total - 3, total + 4).filter((v) => v > 0).map((v) => ({ label: String(v), correct: v === total }))}
            onPick={advance}
            wrong={wrong}
            nudge={`Count ${n} layers of a ${n}×${n} square: ${n * n} + ${n * n}${n > 2 ? ' + …' : ''}.`}
          />
        )}
        {step === 3 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-green-600 font-bold text-lg mb-2">You read the cube! 🎉</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-700">
              <span className="text-indigo-600">{n}</span>
              <sup className="text-violet-600">3</sup> ={' '}
              {n} × {n} × {n} = <span className="text-emerald-600">{total}</span>
            </p>
            <button onClick={() => { setStep(0); setWrong(false) }} className="mt-4 text-sm text-gray-400 underline">
              try it again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Question({ prompt, choices, onPick, wrong, nudge }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <p className="text-gray-600 font-semibold mb-4">{prompt}</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {choices.map((c) => (
          <button
            key={c.label}
            onClick={() => onPick(c.correct)}
            className="min-w-[3.5rem] h-14 px-3 rounded-2xl bg-indigo-100 text-indigo-800 text-2xl font-black hover:bg-indigo-200 active:scale-95 transition"
          >
            {c.label}
          </button>
        ))}
      </div>
      {wrong && <p className="mt-4 text-violet-600 font-semibold">{nudge}</p>}
    </motion.div>
  )
}

// three sorted, in-range numbers that always include the answer
function around(answer, min, max) {
  const set = new Set([answer])
  let lo = answer - 1
  let hi = answer + 1
  while (set.size < 3) {
    if (lo >= min) set.add(lo)
    if (set.size < 3 && hi <= max) set.add(hi)
    lo--; hi++
    if (lo < min && hi > max) break
  }
  return [...set].sort((a, b) => a - b)
}
