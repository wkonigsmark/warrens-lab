import { useState } from 'react'
import { motion } from 'framer-motion'
import GroupSet from '../GroupSet'

// Free-play "fraction of a number": choose how many things, how many equal
// groups to split them into, then tap groups to take them — the count updates
// live. Only group counts that divide evenly are offered, so it always works.
const TOTALS = [4, 6, 8, 9, 10, 12]

const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)

export default function GroupTool() {
  const [total, setTotal] = useState(12)
  const [den, setDen] = useState(3)
  const [selected, setSelected] = useState([0])

  const dens = divisors(total)
  const groupSize = total / den
  const k = selected.length
  const answer = k * groupSize

  const changeTotal = (t) => {
    setTotal(t)
    const ds = divisors(t)
    const nextDen = ds.includes(den) ? den : ds.find((d) => d > 1) || 1
    setDen(nextDen)
    setSelected([])
  }
  const changeDen = (d) => { setDen(d); setSelected([]) }
  const toggle = (i) => setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stage */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Fraction of a Group</h2>
        <p className="text-sm text-gray-400 mb-4">Split the cookies into equal groups, then tap groups to take them.</p>

        <div className="flex justify-center items-center min-h-[240px] mb-6">
          <GroupSet total={total} den={den} selected={selected} onToggleGroup={toggle} cell={38} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-semibold text-gray-500 mr-1">How many:</span>
            {TOTALS.map((t) => (
              <button key={t} onClick={() => changeTotal(t)} className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${total === t ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-semibold text-gray-500 mr-1">Groups:</span>
            {dens.map((d) => (
              <button key={d} onClick={() => changeDen(d)} className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${den === d ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Readout */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">You took</div>
          <div className="text-4xl font-black text-gray-800">
            {k}/{den} <span className="text-gray-400 text-2xl">of</span> {total}
          </div>
          <motion.div key={answer} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-black text-amber-500 my-3">
            {answer}
          </motion.div>
          <p className="text-gray-500">
            {k === 0
              ? `${den} groups of ${groupSize}. Tap a group! 🍪`
              : `${k} group${k > 1 ? 's' : ''} of ${groupSize} = ${answer}`}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setSelected([])} className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors">Clear</button>
          <button onClick={() => setSelected(Array.from({ length: den }, (_, i) => i))} className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors">Take all</button>
        </div>
      </div>
    </div>
  )
}
