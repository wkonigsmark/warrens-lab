import { useState } from 'react'
import PercentGrid from './PercentGrid'

// The one Play toy for v1: a 100-square grid you fill by dragging, sliding, or
// tapping a friendly preset. The big number and the "X out of 100" line update
// live, and friendly amounts (¼, ½, ¾, whole) light up their fraction so the
// link back to fractions is always visible.
//
// Used full-size in Play, and in a `compact` form inside the lessons.

// Percents that have a tidy fraction name kids already know from Ants & Fractions.
const FRIENDS = {
  0: { frac: '0', word: 'none' },
  25: { frac: '1/4', word: 'one quarter' },
  50: { frac: '1/2', word: 'one half' },
  75: { frac: '3/4', word: 'three quarters' },
  100: { frac: '1', word: 'one whole' },
}

const PRESETS = [0, 25, 50, 75, 100]

export default function PercentLab({ compact = false }) {
  const [value, setValue] = useState(compact ? 50 : 25)
  const friend = FRIENDS[value]
  const gridSize = compact ? 230 : 300

  return (
    <div className="max-w-xl mx-auto">
      {!compact && (
        <p className="text-center text-gray-500 mb-5 text-lg">
          Drag across the squares, slide the bar, or tap a button. Watch the percent change! 🎚️
        </p>
      )}

      {/* Big live readout */}
      <div className="text-center mb-5">
        <div className="text-6xl sm:text-7xl font-black text-cyan-600 tabular-nums">{value}%</div>
        <div className="text-gray-500 mt-1 text-lg">
          <span className="font-bold text-cyan-600 tabular-nums">{value}</span> out of 100 squares
        </div>
        <div className="mt-2 h-7">
          {friend && (
            <span className="inline-block bg-cyan-50 text-cyan-700 font-bold px-3 py-1 rounded-full text-sm">
              that's {friend.word} = {friend.frac}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <PercentGrid value={value} size={gridSize} onSet={setValue} />
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-cyan-500 mb-5 cursor-pointer"
        aria-label="percent"
      />

      {/* Friendly presets */}
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setValue(p)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              value === p
                ? 'bg-cyan-500 text-white shadow'
                : 'bg-white text-cyan-600 border border-cyan-200 hover:bg-cyan-50'
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
    </div>
  )
}
