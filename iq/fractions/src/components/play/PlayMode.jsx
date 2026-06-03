import { useState } from 'react'
import { motion } from 'framer-motion'
import Pie from '../Pie'
import FractionLabel from '../FractionLabel'
import { simplify } from '../../lib/fractions'

// Free-play playground: choose how many pieces to cut the pie into, tap slices
// to shade them, and watch the fraction (and its simplest form) update live.
// The drag-to-explore member of the family — no right answer, just discovery.
const MIN = 1
const MAX = 12
const PRESETS = [2, 3, 4, 5, 6, 8]

export default function PlayMode() {
  const [den, setDen] = useState(4)
  const [shaded, setShaded] = useState([])

  const setPieces = (n) => {
    const next = Math.max(MIN, Math.min(MAX, n))
    setDen(next)
    setShaded((s) => s.filter((i) => i < next)) // drop slices that no longer exist
  }
  const toggle = (i) => setShaded((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))

  const k = shaded.length
  const simp = simplify(k, den)
  const reduced = k > 0 && (simp.den !== den || simp.num !== k)
  const isWhole = k === den && den > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stage */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Pie Playground</h2>
        <p className="text-sm text-gray-400 mb-4">Pick how many pieces, then tap the pie to shade slices.</p>

        <div className="flex justify-center mb-6">
          <Pie parts={den} shaded={shaded} onToggle={toggle} size={300} />
        </div>

        {/* Pieces control */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500">Pieces:</span>
            <button onClick={() => setPieces(den - 1)} className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 text-2xl font-black hover:bg-amber-200 active:scale-95 transition">−</button>
            <span className="w-10 text-center text-2xl font-black text-gray-800">{den}</span>
            <button onClick={() => setPieces(den + 1)} className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 text-2xl font-black hover:bg-amber-200 active:scale-95 transition">+</button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((n) => (
              <button
                key={n}
                onClick={() => setPieces(n)}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${den === n ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Readout */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">You shaded</div>
          <div className="flex justify-center">
            <FractionLabel num={k} den={den} big />
          </div>
          <p className="text-gray-500 mt-4">
            {k === 0
              ? 'Nothing yet — tap the pie! 🥧'
              : `${k} out of ${den} ${den === 1 ? 'piece' : 'pieces'} shaded.`}
          </p>
        </div>

        {isWhole && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-500 text-white rounded-2xl shadow p-4 text-center font-bold">
            That's the whole pie! {k}/{den} = 1 🎉
          </motion.div>
        )}

        {reduced && !isWhole && (
          <motion.div key={`${k}/${den}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-amber-800 font-semibold">
              That's the same as <span className="text-xl font-black">{simp.num}/{simp.den}</span>
            </p>
            <p className="text-xs text-amber-500 mt-1">an equivalent fraction</p>
          </motion.div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setShaded([])} className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors">Clear</button>
          <button onClick={() => setShaded(Array.from({ length: den }, (_, i) => i))} className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors">Shade all</button>
        </div>
      </div>
    </div>
  )
}
