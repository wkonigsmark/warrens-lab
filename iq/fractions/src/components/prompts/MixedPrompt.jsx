import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PieStack from '../PieStack'
import Frac from '../Frac'

// Guided conversion between an improper fraction and a mixed number, both shown
// as a stack of pies. `mode='toMixed'` walks improper → mixed (count wholes,
// then leftovers); `mode='toImproper'` walks mixed → improper (count all the
// pieces). Wrong taps get a counting nudge, not a buzzer.
export default function MixedPrompt({ num, den, mode = 'toMixed' }) {
  const whole = Math.floor(num / den)
  const rem = num % den

  const [step, setStep] = useState(0)
  const [wrong, setWrong] = useState(false)

  const advance = (ok, last) => {
    if (!ok) { setWrong(true); return }
    setWrong(false)
    setStep(last ? 99 : step + 1)
  }
  const restart = () => { setStep(0); setWrong(false) }

  const Choices = ({ answer, min, max, onPick }) => (
    <div className="flex justify-center gap-3 flex-wrap">
      {choicesAround(answer, min, max).map((v) => (
        <button key={v} onClick={() => onPick(v)} className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 text-2xl font-black hover:bg-amber-200 active:scale-95 transition">
          {v}
        </button>
      ))}
    </div>
  )

  const MixedAnswer = (
    <span className="inline-flex items-center gap-2 text-green-600">
      <span className="text-4xl font-black">{whole}</span>
      <Frac num={rem} den={den} className="text-2xl font-black" />
    </span>
  )

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! 🥧</p>
      <p className="text-gray-500 mb-5">
        {mode === 'toMixed'
          ? <>Write <Frac num={num} den={den} className="text-lg font-black text-amber-600" /> as a mixed number.</>
          : <>Write <span className="font-black text-amber-600 text-lg">{whole}<Frac num={rem} den={den} className="ml-1" /></span> as one fraction.</>}
      </p>

      <div className="flex justify-center mb-6"><PieStack num={num} den={den} size={104} /></div>

      <AnimatePresence mode="wait">
        {/* improper → mixed */}
        {mode === 'toMixed' && step === 0 && (
          <Q key="m0" prompt="How many WHOLE pies are completely filled?" wrong={wrong} nudge={`A whole pie needs all ${den} pieces shaded.`}>
            <Choices answer={whole} min={0} max={whole + 2} onPick={(v) => advance(v === whole, false)} />
          </Q>
        )}
        {mode === 'toMixed' && step === 1 && (
          <Q key="m1" prompt="How many extra pieces are left over?" wrong={wrong} nudge="Count the shaded pieces in the last, not-full pie.">
            <Choices answer={rem} min={0} max={den} onPick={(v) => advance(v === rem, true)} />
          </Q>
        )}

        {/* mixed → improper */}
        {mode === 'toImproper' && step === 0 && (
          <Q key="i0" prompt={`Count every piece. How many ${den}ths are shaded in total?`} wrong={wrong} nudge={`${whole} full ${den === 2 ? 'halves' : `pies of ${den}`} plus ${rem} more.`}>
            <Choices answer={num} min={den} max={num + 2} onPick={(v) => advance(v === num, true)} />
          </Q>
        )}

        {step === 99 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-lg font-bold mb-2">
              {mode === 'toMixed' ? (
                <span className="text-gray-700"><Frac num={num} den={den} className="text-2xl" /> = {MixedAnswer} 🎉</span>
              ) : (
                <span className="text-green-600">{whole}<Frac num={rem} den={den} className="mx-1" /> = <Frac num={num} den={den} className="text-2xl" /> 🎉</span>
              )}
            </p>
            <button onClick={restart} className="mt-1 text-sm text-gray-400 underline">try it again</button>
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
