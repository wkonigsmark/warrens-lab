import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DotArray from '../DotArray'
import PowerLabel from '../PowerLabel'

// Reading a power OFF a picture (the reverse of ExpandPrompt). A square grid is
// shown; the child counts the side, then discovers it's "side squared," then
// the total. Wrong taps get a counting nudge, not a buzzer. Parallels
// BuildFractionPrompt from Ants & Fractions.
export default function ReadPowerPrompt({ n = 4 }) {
  const [step, setStep] = useState(0) // 0 = side?, 1 = which power?, 2 = total?, 3 = done
  const [wrong, setWrong] = useState(false)

  const advance = (ok) => {
    if (ok) { setStep((s) => s + 1); setWrong(false) } else setWrong(true)
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-5">What power is this square? 🤔</p>

      <div className="flex justify-center mb-6">
        <DotArray rows={n} cols={n} cell={28} gap={6} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Question
            key="q0"
            prompt="How many squares are along one side?"
            choices={choicesAround(n, 2, n + 2)}
            answer={n}
            onPick={advance}
            wrong={wrong}
            nudge="Count just one row — across the top."
          />
        )}
        {step === 1 && (
          <Question
            key="q1"
            prompt={`It is ${n} across AND ${n} down. How do we write that as a power?`}
            choices={[`${n}×2`, `${n}${sup(n)}`, `${n}${sup(2)}`]}
            answer={`${n}${sup(2)}`}
            onPick={advance}
            wrong={wrong}
            nudge={`A square is the base used 2 times: ${n} × ${n}. The little number is 2.`}
            wide
          />
        )}
        {step === 2 && (
          <Question
            key="q2"
            prompt={`So how many little squares in all? (${n} × ${n})`}
            choices={choicesAround(n * n, n * n - 2, n * n + 3).filter((v) => v > 0)}
            answer={n * n}
            onPick={advance}
            wrong={wrong}
            nudge={`Count them, or do ${n} rows of ${n}.`}
          />
        )}
        {step === 3 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-green-600 font-bold text-lg mb-4">You read the power! 🎉</p>
            <div className="flex justify-center mb-4">
              <PowerLabel base={n} exp={2} value />
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

function Question({ prompt, choices, answer, onPick, wrong, nudge, wide = false }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <p className="text-gray-600 font-semibold mb-4">{prompt}</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {choices.map((v) => (
          <button
            key={v}
            onClick={() => onPick(v === answer)}
            className={`${wide ? 'px-4 h-14' : 'w-14 h-14'} rounded-2xl bg-indigo-100 text-indigo-800 text-2xl font-black hover:bg-indigo-200 active:scale-95 transition`}
          >
            {v}
          </button>
        ))}
      </div>
      {wrong && <p className="mt-4 text-violet-600 font-semibold">{nudge}</p>}
    </motion.div>
  )
}

// Three sorted, in-range number choices that always include the answer.
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

function sup(n) {
  const map = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  return String(n).split('').map((d) => map[d]).join('')
}
