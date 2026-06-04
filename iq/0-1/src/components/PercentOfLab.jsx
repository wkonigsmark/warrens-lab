import { useState } from 'react'
import GroupDots from './GroupDots'

// "Try it" toy for Lesson 3: pick a percent, see it taken out of a group of 20.
// 20 is the magic total — every friendly percent gives a clean whole number
// (10%→2, 25%→5, 50%→10, 75%→15, 100%→20).
const TOTAL = 20

// Each friendly percent → how to split the group, plus its fraction name.
const MAP = {
  0: { groups: 1, taken: 0, frac: 'none' },
  10: { groups: 10, taken: 1, frac: 'one tenth' },
  25: { groups: 4, taken: 1, frac: 'one quarter' },
  50: { groups: 2, taken: 1, frac: 'one half' },
  75: { groups: 4, taken: 3, frac: 'three quarters' },
  100: { groups: 1, taken: 1, frac: 'all of it' },
}
const PRESETS = [0, 10, 25, 50, 75, 100]

export default function PercentOfLab() {
  const [pct, setPct] = useState(50)
  const m = MAP[pct]
  const answer = Math.round((pct / 100) * TOTAL)

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-center text-gray-500 mb-4 text-lg">
        Tap a percent. See how much of <strong>{TOTAL}</strong> dots you take! 🎚️
      </p>

      <div className="flex justify-center mb-5 min-h-[120px] items-center">
        <GroupDots total={TOTAL} groups={m.groups} takenGroups={m.taken} />
      </div>

      <div className="text-center mb-5">
        <div className="text-3xl sm:text-4xl font-black text-gray-800">
          {pct}% of {TOTAL} = <span className="text-cyan-600">{answer}</span>
        </div>
        <div className="mt-1 h-6 text-cyan-700 font-semibold">
          {m.frac !== 'none' && `that's ${m.frac} of ${TOTAL}`}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setPct(p)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              pct === p ? 'bg-cyan-500 text-white shadow' : 'bg-white text-cyan-600 border border-cyan-200 hover:bg-cyan-50'
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
    </div>
  )
}
