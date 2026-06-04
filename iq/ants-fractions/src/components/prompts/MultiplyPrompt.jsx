import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AreaModel from '../AreaModel'
import Frac from '../Frac'
import { simplify } from '../../lib/fractions'

// Guided multiply via the area model: count the little boxes in the whole square
// (den1·den2), then the double-shaded ones (num1·num2) — that's the product.
export default function MultiplyPrompt({ num1, den1, num2, den2 }) {
  const total = den1 * den2
  const prod = num1 * num2
  const simp = simplify(prod, total)
  const reduces = simp.den !== total

  const [step, setStep] = useState(0) // 0 total, 1 overlap, 99 done
  const [wrong, setWrong] = useState(false)

  const answer = (ok, last) => {
    if (!ok) { setWrong(true); return }
    setWrong(false)
    setStep(last ? 99 : step + 1)
  }
  const restart = () => { setStep(0); setWrong(false) }

  const Choices = ({ ans, min, max, onPick }) => (
    <div className="flex justify-center gap-3 flex-wrap">
      {choicesAround(ans, min, max).map((v) => (
        <button key={v} onClick={() => onPick(v)} className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 text-2xl font-black hover:bg-amber-200 active:scale-95 transition">
          {v}
        </button>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! ✖️</p>
      <p className="text-gray-500 mb-5 flex items-center justify-center gap-2">
        <Frac num={num1} den={den1} className="text-lg font-black text-amber-600" />
        <span className="font-black">×</span>
        <Frac num={num2} den={den2} className="text-lg font-black text-amber-600" />
        <span>= ?</span>
      </p>

      <div className="flex justify-center mb-6"><AreaModel num1={num1} den1={den1} num2={num2} den2={den2} size={200} /></div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Q key="t" prompt="How many little boxes are in the whole square?" wrong={wrong} nudge={`${den1} columns × ${den2} rows.`}>
            <Choices ans={total} min={2} max={total + 3} onPick={(v) => answer(v === total, false)} />
          </Q>
        )}
        {step === 1 && (
          <Q key="o" prompt="How many boxes are shaded BOTH ways (the green overlap)?" wrong={wrong} nudge={`${num1} columns × ${num2} rows of overlap.`}>
            <Choices ans={prod} min={1} max={total} onPick={(v) => answer(v === prod, true)} />
          </Q>
        )}
        {step === 99 && (
          <motion.div key="d" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-green-600 font-bold text-lg flex items-center justify-center gap-2 flex-wrap">
              <Frac num={num1} den={den1} /> <span>×</span> <Frac num={num2} den={den2} /> <span>=</span>
              <Frac num={prod} den={total} className="text-2xl" />
              {reduces && <span className="text-amber-600">= <Frac num={simp.num} den={simp.den} className="text-2xl" /></span>}
              <span>🎉</span>
            </p>
            <button onClick={restart} className="mt-3 text-sm text-gray-400 underline">try it again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Q({ prompt, children, wrong, nudge }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <p className="text-gray-600 font-semibold mb-4">{prompt}</p>
      {children}
      {wrong && <p className="mt-4 text-amber-600 font-semibold">{nudge}</p>}
    </motion.div>
  )
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
  return [...set].sort((a, b) => a - b)
}
