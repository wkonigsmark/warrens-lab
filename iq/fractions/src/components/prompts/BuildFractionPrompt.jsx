import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Pie from '../Pie'
import FractionLabel from '../FractionLabel'

// Reading a fraction OFF a picture (the reverse of ShadePrompt). A pie is shown
// already shaded; the child counts to discover the two numbers, one at a time.
// Wrong taps get a counting nudge, not a buzzer.
export default function BuildFractionPrompt({ den = 6, num = 3 }) {
  const shaded = Array.from({ length: num }, (_, i) => i)
  const [step, setStep] = useState(0) // 0 = total?, 1 = shaded?, 2 = done
  const [wrong, setWrong] = useState(false)

  const pickTotal = (v) => {
    if (v === den) { setStep(1); setWrong(false) } else setWrong(true)
  }
  const pickShaded = (v) => {
    if (v === num) { setStep(2); setWrong(false) } else setWrong(true)
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-5">What fraction is shaded? 🤔</p>

      <div className="flex justify-center mb-6">
        <Pie parts={den} shaded={shaded} size={240} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Question
            key="q0"
            prompt="How many equal pieces is the WHOLE pie cut into?"
            choices={choicesAround(den, 2, den + 2)}
            onPick={pickTotal}
            wrong={wrong}
            nudge="Count the slices all the way around the pie."
          />
        )}
        {step === 1 && (
          <Question
            key="q1"
            prompt="Now — how many pieces are shaded (the golden ones)?"
            choices={choicesAround(num, 1, den)}
            onPick={pickShaded}
            wrong={wrong}
            nudge="Count just the golden slices."
          />
        )}
        {step === 2 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-green-600 font-bold text-lg mb-4">You read the fraction! 🎉</p>
            <div className="flex justify-center mb-4">
              <FractionLabel num={num} den={den} captions big={false} />
            </div>
            <button
              onClick={() => { setStep(0); setWrong(false) }}
              className="text-sm text-gray-400 underline"
            >
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
        {choices.map((v) => (
          <button
            key={v}
            onClick={() => onPick(v)}
            className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 text-2xl font-black hover:bg-amber-200 active:scale-95 transition"
          >
            {v}
          </button>
        ))}
      </div>
      {wrong && <p className="mt-4 text-amber-600 font-semibold">{nudge}</p>}
    </motion.div>
  )
}

// Three sorted, in-range choices that always include the answer.
function choicesAround(answer, min, max) {
  const set = new Set([answer])
  let lo = answer - 1
  let hi = answer + 1
  while (set.size < 3) {
    if (lo >= min) set.add(lo)
    if (set.size < 3 && hi <= max) set.add(hi)
    lo--
    hi++
    if (lo < min && hi > max) break
  }
  return [...set].sort((a, b) => a - b)
}
