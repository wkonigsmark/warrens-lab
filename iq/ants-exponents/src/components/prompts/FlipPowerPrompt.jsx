import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Discover what a NEGATIVE exponent means, in two gentle steps: first that the
// minus sign "flips" the power under a 1 (so the bottom exponent is just the
// positive version), then what that power equals. Reveals base⁻ⁿ = 1 / baseⁿ.
// Structured exactly like ReadPowerPrompt (the pattern that works cleanly).
// Assumes n ≥ 1.
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const sup = (n) => String(n).split('').map((d) => SUP[d]).join('')

export default function FlipPowerPrompt({ base = 2, n = 2 }) {
  const power = base ** n
  const [step, setStep] = useState(0) // 0 = bottom exponent?, 1 = its value?, 2 = done
  const [wrong, setWrong] = useState(false)

  const advance = (ok) => {
    if (ok) { setStep((s) => s + 1); setWrong(false) } else setWrong(true)
  }

  // distinct value choices, always including the real answer
  const valChoices = (() => {
    const out = [power]
    for (const d of [base * n, base + n, power + base, power + 1, power - 1]) {
      if (out.length >= 3) break
      if (d > 0 && !out.includes(d)) out.push(d)
    }
    return out.sort((a, b) => a - b)
  })()
  const expChoices = [n - 1, n, n + 1].filter((v) => v > 0)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! 👆</p>
      <p className="text-gray-500 mb-5">
        A minus sign <strong>flips</strong> the power underneath a 1. Let's work out{' '}
        <span className="font-black text-2xl">
          <span className="text-indigo-600">{base}</span>
          <sup className="text-violet-600">−{n}</sup>
        </span>.
      </p>

      {/* base^-n = 1 / base^?  (= 1/power once solved) */}
      <div className="text-3xl sm:text-4xl mb-6 flex items-center justify-center gap-3">
        <span className="font-black text-2xl sm:text-3xl">
          <span className="text-indigo-600">{base}</span>
          <sup className="text-violet-600">−{n}</sup>
        </span>
        <span className="text-gray-400 font-black">=</span>
        <span className="inline-flex flex-col items-center">
          <span className="font-black text-gray-700">1</span>
          <span className="block w-14 h-0.5 bg-gray-700 my-1" />
          <span className="font-black">
            {step >= 1 ? (
              <span><span className="text-indigo-600">{base}</span><sup className="text-violet-600">{n}</sup></span>
            ) : (
              <span className="text-gray-300">{base}<sup>?</sup></span>
            )}
          </span>
        </span>
        {step >= 2 && (
          <>
            <span className="text-gray-400 font-black">=</span>
            <span className="inline-flex flex-col items-center text-emerald-600">
              <span className="font-black">1</span>
              <span className="block w-10 h-0.5 bg-emerald-600 my-1" />
              <span className="font-black">{power}</span>
            </span>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Question
            key="q0"
            prompt="Flip it under a 1 — what exponent goes on the bottom? (just drop the minus sign)"
            choices={expChoices.map((v) => ({ label: `${base}${sup(v)}`, correct: v === n }))}
            onPick={advance}
            wrong={wrong}
            nudge={`The bottom is the same power without the minus: ${base}${sup(n)}.`}
          />
        )}
        {step === 1 && (
          <Question
            key="q1"
            prompt={`Now — what is ${base}${sup(n)}?`}
            choices={valChoices.map((v) => ({ label: String(v), correct: v === power }))}
            onPick={advance}
            wrong={wrong}
            nudge={`Count it out: ${Array.from({ length: n }, () => base).join(' × ')}.`}
          />
        )}
        {step === 2 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-green-600 font-bold text-lg mb-2">
              Yes! {base}<sup>−{n}</sup> = 1 over {base}{sup(n)} = <strong>1/{power}</strong>. 🎉
            </p>
            <p className="text-indigo-700 font-bold mt-2">A negative exponent makes a tiny fraction! ⚡</p>
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
