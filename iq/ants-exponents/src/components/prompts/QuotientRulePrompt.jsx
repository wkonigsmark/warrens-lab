import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Discover the quotient rule by CANCELING, not by being told. We show a power
// divided by a power of the same base, written out the long way as a fraction,
// with the matched factors crossed off. The child counts what's left on top, then
// we reveal the shortcut: same base → subtract the exponents. Sibling to
// ProductRulePrompt; same guided-nudge style. Assumes a > c (positive result).
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const sup = (n) => String(n).split('').map((d) => SUP[d]).join('')

// A row of bases; the first `crossed` of them are struck through (canceled).
function Row({ base, n, crossed = 0 }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 font-black">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="inline-flex items-baseline">
          {i > 0 && <span className="text-gray-300 mr-1.5">×</span>}
          <span className={i < crossed ? 'text-gray-300 line-through' : 'text-indigo-600'}>{base}</span>
        </span>
      ))}
    </span>
  )
}

export default function QuotientRulePrompt({ base = 2, a = 5, c = 2 }) {
  const left = a - c
  const [step, setStep] = useState(0) // 0 = count, 1 = done
  const [wrong, setWrong] = useState(false)

  const pick = (v) => {
    if (v === left) { setStep(1); setWrong(false) } else setWrong(true)
  }
  const reset = () => { setStep(0); setWrong(false) }

  const choices = [left - 1, left, left + 1].filter((v) => v > 0)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! 👆</p>
      <p className="text-gray-500 mb-5">
        Now let's <strong>divide</strong> two powers of{' '}
        <span className="font-black text-indigo-600">{base}</span>. Cross off the matching ones!
      </p>

      {/* base^a ÷ base^c shown as a cancelling fraction */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="leading-none inline-flex items-start font-black text-2xl sm:text-3xl">
          <span className="text-indigo-600">{base}</span>
          <span className="text-violet-600 text-base -mt-0.5">{a}</span>
          <span className="text-gray-400 mx-2">÷</span>
          <span className="text-indigo-600">{base}</span>
          <span className="text-violet-600 text-base -mt-0.5">{c}</span>
        </span>
        <span className="text-gray-400 font-black text-2xl">=</span>
        <span className="inline-flex flex-col items-center text-xl sm:text-2xl">
          <Row base={base} n={a} crossed={c} />
          <span className="block w-full h-0.5 bg-gray-700 my-1.5" />
          <Row base={base} n={c} crossed={c} />
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="q" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <p className="text-gray-600 font-semibold mb-4">
              After crossing off, how many <span className="text-indigo-600 font-black">{base}</span>s are left on top?
            </p>
            <div className="flex justify-center gap-3">
              {choices.map((v) => (
                <button
                  key={v}
                  onClick={() => pick(v)}
                  className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 text-2xl font-black hover:bg-indigo-200 active:scale-95 transition"
                >
                  {v}
                </button>
              ))}
            </div>
            {wrong && (
              <p className="mt-4 text-violet-600 font-semibold">
                Count the ones NOT crossed off — or just subtract: {a} − {c}.
              </p>
            )}
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-green-600 font-bold text-lg mb-3">
              Yes — {left} left, so it's {base}{sup(left)}! 🎉
            </p>
            <p className="text-gray-600 text-lg">
              The shortcut: when you <strong>divide</strong> with the same base, the exponents{' '}
              <strong>subtract</strong>.
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-700 mt-3">
              {base}{sup(a)} ÷ {base}{sup(c)} = {base}<span className="text-violet-600">{sup(a)}⁻{sup(c)}</span> = {base}{sup(left)}
            </p>
            <p className="text-indigo-700 font-bold mt-4">Same base? Subtract when dividing! ⚡</p>
            <button onClick={reset} className="mt-4 text-sm text-gray-400 underline">try it again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
