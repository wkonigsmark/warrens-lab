import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Discover the product rule by COUNTING, not by being told. We show two powers
// of the same base multiplied, written out the long way, and ask "how many
// bases in all?" Once the child counts a+c, we reveal the shortcut: same base →
// add the exponents. Guided nudges, never a buzzer (matches the other prompts).
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const sup = (n) => String(n).split('').map((d) => SUP[d]).join('')

function Chain({ base, n, color }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 font-black">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="inline-flex items-baseline">
          {i > 0 && <span className="text-gray-300 mr-1.5">×</span>}
          <span className={color}>{base}</span>
        </span>
      ))}
    </span>
  )
}

export default function ProductRulePrompt({ base = 2, a = 2, c = 3 }) {
  const total = a + c
  const [step, setStep] = useState(0) // 0 = count, 1 = done
  const [wrong, setWrong] = useState(false)

  const pick = (v) => {
    if (v === total) { setStep(1); setWrong(false) } else setWrong(true)
  }
  const reset = () => { setStep(0); setWrong(false) }

  // choices around the answer
  const choices = [total - 1, total, total + 1].filter((v) => v > 0)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! 👆</p>
      <p className="text-gray-500 mb-5">
        Here are two powers of <span className="font-black text-indigo-600">{base}</span> multiplied together.
      </p>

      {/* the two powers, written out the long way */}
      <div className="text-2xl sm:text-3xl mb-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
        <span className="leading-none inline-flex items-start font-black">
          <span className="text-indigo-600">{base}</span>
          <span className="text-violet-600 text-base -mt-0.5">{a}</span>
        </span>
        <span className="text-gray-400 font-black">×</span>
        <span className="leading-none inline-flex items-start font-black">
          <span className="text-indigo-600">{base}</span>
          <span className="text-violet-600 text-base -mt-0.5">{c}</span>
        </span>
      </div>
      <div className="text-xl sm:text-2xl mb-6 text-gray-600">
        = (<Chain base={base} n={a} color="text-indigo-600" />) × (<Chain base={base} n={c} color="text-indigo-600" />)
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="q" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <p className="text-gray-600 font-semibold mb-4">
              Count them all — how many <span className="text-indigo-600 font-black">{base}</span>s are multiplied in total?
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
                Count every {base}, or just add the little numbers: {a} + {c}.
              </p>
            )}
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-green-600 font-bold text-lg mb-3">
              Yes — {total} of them, so it's {base}{sup(total)}! 🎉
            </p>
            <p className="text-gray-600 text-lg">
              Here's the shortcut: the exponents <span className="font-black text-violet-600">{a}</span> and{' '}
              <span className="font-black text-violet-600">{c}</span> just <strong>add up</strong>.
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-700 mt-3">
              {base}{sup(a)} × {base}{sup(c)} = {base}<span className="text-violet-600">{sup(a)}⁺{sup(c)}</span> = {base}{sup(total)}
            </p>
            <p className="text-indigo-700 font-bold mt-4">Same base? Add the exponents! ⚡</p>
            <button onClick={reset} className="mt-4 text-sm text-gray-400 underline">try it again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
