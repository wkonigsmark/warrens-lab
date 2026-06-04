import { useEffect, useState } from 'react'
import PercentGrid from '../PercentGrid'
import { FRAC_WORDS } from '../../lib/percents'

// "Make it 50%!" — the child drags the grid or slides the bar to hit a target.
// We're generous: as soon as they're within a couple of squares it snaps to the
// exact target and celebrates, so it always feels like a clean win.
const TOL = 2

// Start somewhere clearly away from the target so there's a real (but easy) move.
const startValue = (target) =>
  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].filter((c) => Math.abs(c - target) >= 25)[
    Math.floor(Math.random() * 6)
  ] ?? 0

export default function MakeItQuestion({ question, frozen, onCorrect }) {
  const { target, useFrac } = question
  const [value, setValue] = useState(() => startValue(target))
  const [solved, setSolved] = useState(false)
  const locked = solved || frozen

  useEffect(() => {
    if (!solved && Math.abs(value - target) <= TOL) {
      setValue(target) // click it into place
      setSolved(true)
      onCorrect()
    }
  }, [value, target, solved, onCorrect])

  const setSafe = (v) => { if (!locked) setValue(v) }
  const prompt = useFrac ? `Make ${FRAC_WORDS[target]}!` : `Make it ${target}%!`

  return (
    <div className="text-center">
      <div className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-2">Make it 🎯</div>
      <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-1">{prompt}</h3>
      <p className="text-gray-400 mb-4">Drag the squares or slide the bar to match.</p>

      <div className={`text-5xl font-black mb-3 tabular-nums ${solved ? 'text-green-500' : 'text-cyan-600'}`}>
        {value}%
      </div>

      <div className="flex justify-center mb-5">
        <PercentGrid value={value} size={260} onSet={setSafe} />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={locked}
        onChange={(e) => setSafe(Number(e.target.value))}
        className="w-full accent-cyan-500 cursor-pointer disabled:opacity-60"
        aria-label="make the percent"
      />
    </div>
  )
}
