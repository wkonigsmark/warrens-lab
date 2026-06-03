import { useState } from 'react'
import { motion } from 'framer-motion'
import Pie from '../Pie'
import { simplify } from '../../lib/fractions'

// Two pies, side by side. Set the pieces and shade each one, then see live which
// fraction is bigger — and when two different fractions are the *same* amount.
const MIN = 1
const MAX = 12

function usePieState(initialDen, initialShaded) {
  const [den, setDen] = useState(initialDen)
  const [shaded, setShaded] = useState(initialShaded)
  const setPieces = (n) => {
    const next = Math.max(MIN, Math.min(MAX, n))
    setDen(next)
    setShaded((s) => s.filter((i) => i < next))
  }
  const toggle = (i) => setShaded((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
  return { den, shaded, setPieces, toggle, k: shaded.length }
}

export default function CompareTool() {
  const a = usePieState(2, [0])
  const b = usePieState(4, [0])

  const va = a.k / a.den
  const vb = b.k / b.den
  const symbol = va > vb ? '>' : va < vb ? '<' : '='
  const equalAmount = va === vb
  const sameFraction = a.k === b.k && a.den === b.den

  let verdict
  if (a.k === 0 && b.k === 0) verdict = 'Shade some pieces on each pie! 👆'
  else if (equalAmount && !sameFraction) verdict = `Same amount! ${a.k}/${a.den} and ${b.k}/${b.den} are equivalent. 🎉`
  else if (equalAmount) verdict = 'Exactly the same.'
  else verdict = `${va > vb ? `${a.k}/${a.den}` : `${b.k}/${b.den}`} is bigger.`

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <PieCard label="Pie A" pie={a} />
        <PieCard label="Pie B" pie={b} />
      </div>

      <motion.div
        key={`${a.k}/${a.den}-${b.k}/${b.den}`}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-6 bg-white rounded-2xl shadow-lg p-6 text-center max-w-xl mx-auto"
      >
        <div className="flex items-center justify-center gap-4 text-3xl font-black text-gray-800">
          <span>{a.k}/{a.den}</span>
          <span className="text-amber-500 text-4xl">{symbol}</span>
          <span>{b.k}/{b.den}</span>
        </div>
        <p className={`mt-3 font-bold ${equalAmount && (a.k > 0 || b.k > 0) ? 'text-green-600' : 'text-gray-500'}`}>{verdict}</p>
      </motion.div>
    </div>
  )
}

function PieCard({ label, pie }) {
  const simp = simplify(pie.k, pie.den)
  const reduced = pie.k > 0 && (simp.den !== pie.den || simp.num !== pie.k)
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
      <h3 className="text-lg font-bold text-gray-700 mb-3">{label}</h3>
      <Pie parts={pie.den} shaded={pie.shaded} onToggle={pie.toggle} size={220} />
      <div className="mt-3 text-2xl font-black text-gray-800">
        {pie.k}/{pie.den}
        {reduced && <span className="text-sm font-semibold text-amber-500 ml-2">= {simp.num}/{simp.den}</span>}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm font-semibold text-gray-500">Pieces:</span>
        <button onClick={() => pie.setPieces(pie.den - 1)} className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 text-xl font-black hover:bg-amber-200 active:scale-95 transition">−</button>
        <span className="w-8 text-center text-xl font-black text-gray-800">{pie.den}</span>
        <button onClick={() => pie.setPieces(pie.den + 1)} className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 text-xl font-black hover:bg-amber-200 active:scale-95 transition">+</button>
      </div>
    </div>
  )
}
