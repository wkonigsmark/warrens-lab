import { useState } from 'react'
import NumberLine from './NumberLine'
import PercentGrid from './PercentGrid'

// The decimals "trio" toy: drag the 0→1 line (snaps to tenths) and watch the
// SAME amount shown four ways — decimal, tenths, percent, and the grid filling
// up. The friendly fraction lights up at 0, ½, and 1. Used in Lesson 4 and Play.

// Decimals that have a tidy fraction name kids already know.
const FRAC = { 0: '0', 0.5: '½', 1: '1 whole' }

export default function DecimalLab({ compact = false }) {
  const [v, setV] = useState(0.5)
  const tenths = Math.round(v * 10)
  const pct = Math.round(v * 100)
  const frac = FRAC[v]
  const gridSize = compact ? 150 : 180

  return (
    <div className="max-w-xl mx-auto">
      {!compact && (
        <p className="text-center text-gray-500 mb-4 text-lg">
          Drag the dot along the line — it snaps to tenths. Watch all the numbers change! 🎚️
        </p>
      )}

      <div className="text-center mb-2">
        <div className="text-6xl font-black text-cyan-600 tabular-nums">{v.toFixed(1)}</div>
      </div>

      <div className="px-2 mb-4 flex justify-center">
        <NumberLine value={v} onSet={setV} />
      </div>

      {/* Same amount, four ways */}
      <div className="flex flex-wrap justify-center gap-2 mb-5">
        <Chip>{tenths} {tenths === 1 ? 'tenth' : 'tenths'}</Chip>
        <Chip>= {pct}%</Chip>
        {frac && <Chip highlight>= {frac}</Chip>}
      </div>

      <div className="flex justify-center mb-5">
        <PercentGrid value={pct} size={gridSize} />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {[0, 0.5, 1].map((p) => (
          <button
            key={p}
            onClick={() => setV(p)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              v === p ? 'bg-cyan-500 text-white shadow' : 'bg-white text-cyan-600 border border-cyan-200 hover:bg-cyan-50'
            }`}
          >
            {p.toFixed(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Chip({ children, highlight = false }) {
  return (
    <span className={`px-3 py-1.5 rounded-full font-bold text-base ${highlight ? 'bg-cyan-500 text-white' : 'bg-cyan-50 text-cyan-700'}`}>
      {children}
    </span>
  )
}
