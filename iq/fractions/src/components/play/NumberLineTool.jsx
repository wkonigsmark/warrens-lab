import { useState } from 'react'
import NumberLine from '../NumberLine'
import Pie from '../Pie'
import FractionLabel from '../FractionLabel'
import { simplify } from '../../lib/fractions'

// See a fraction as a point on the 0–1 number line, with a matching pie beside
// it so the two pictures click together.
const MIN = 1
const MAX = 12
const PRESETS = [2, 3, 4, 6, 8]

export default function NumberLineTool() {
  const [den, setDen] = useState(4)
  const [marker, setMarker] = useState(1)

  const setPieces = (n) => {
    const next = Math.max(MIN, Math.min(MAX, n))
    setDen(next)
    setMarker((m) => Math.min(m, next))
  }

  const simp = simplify(marker, den)
  const reduced = marker > 0 && marker < den && (simp.den !== den)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Number Line</h2>
      <p className="text-sm text-gray-400 mb-6">Tap the line to move the dot. The pie shows the same fraction.</p>

      <div className="flex flex-col items-center gap-2 mb-6">
        <NumberLine den={den} marker={marker} onMark={setMarker} width={520} />
        <div className="text-sm text-gray-400">
          {marker === 0 ? 'at the start (0)' : marker === den ? 'all the way to 1 — one whole!' : `${marker} steps of ${den}`}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8">
        <Pie parts={den} shaded={Array.from({ length: marker }, (_, i) => i)} size={170} />
        <div className="text-center">
          <FractionLabel num={marker} den={den} big />
          {reduced && <p className="mt-3 text-amber-600 font-semibold">= {simp.num}/{simp.den}</p>}
        </div>
      </div>

      {/* Pieces control */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">Pieces:</span>
          <button onClick={() => setPieces(den - 1)} className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 text-2xl font-black hover:bg-amber-200 active:scale-95 transition">−</button>
          <span className="w-10 text-center text-2xl font-black text-gray-800">{den}</span>
          <button onClick={() => setPieces(den + 1)} className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 text-2xl font-black hover:bg-amber-200 active:scale-95 transition">+</button>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {PRESETS.map((n) => (
            <button key={n} onClick={() => setPieces(n)} className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${den === n ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
