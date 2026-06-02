import { motion } from 'framer-motion'
import { area, perimeter, polygonName, isRegular, asRectangle, isDegenerate } from '../lib/polygons'

// Live polygon facts: name, sides, perimeter, area (+ width×height when it's a
// clean rectangle, so "area = length × width" is right there).
export default function PolygonReadout({ vertices }) {
  if (isDegenerate(vertices)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 text-center text-gray-400 font-semibold">
        The corners are squished into a line — drag one out to open up the shape.
      </div>
    )
  }

  const n = vertices.length
  const name = polygonName(n)
  const regular = isRegular(vertices)
  const rect = asRectangle(vertices)
  const A = area(vertices)
  const P = perimeter(vertices)

  return (
    <div className="flex flex-col gap-4">
      {/* Name + regular/irregular */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div key={name} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl p-3 text-white text-center font-bold shadow bg-indigo-500">
          {name}
          <span className="block text-xs font-normal opacity-90">{n} sides</span>
        </motion.div>
        <motion.div key={String(regular)} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl p-3 text-white text-center font-bold shadow" style={{ backgroundColor: regular ? '#8b5cf6' : '#94a3b8' }}>
          {regular ? 'Regular' : 'Irregular'}
          <span className="block text-xs font-normal opacity-90">{regular ? 'all sides & angles equal' : 'sides or angles differ'}</span>
        </motion.div>
      </div>

      {/* Area headline */}
      <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
        <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Area</div>
        <div className="text-3xl font-extrabold text-indigo-600">{A.toFixed(1)}<span className="text-lg text-gray-400 font-bold"> sq units</span></div>
        {rect && (
          <div className="text-sm text-gray-500 mt-1">
            length × width = <span className="font-bold text-gray-700">{rect.w} × {rect.h}</span>
          </div>
        )}
      </div>

      {/* Perimeter + sides */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Perimeter" value={P.toFixed(1)} hint="units around" />
        <Stat label="Sides" value={n} hint="straight edges" />
      </div>
    </div>
  )
}

function Stat({ label, value, hint }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400">{hint}</div>
    </div>
  )
}
