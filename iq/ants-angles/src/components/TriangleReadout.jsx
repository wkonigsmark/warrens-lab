import { motion } from 'framer-motion'
import { roundedAngles, perimeter, area, classifyByAngle, classifyBySide, isDegenerate } from '../lib/triangles'
import { VERTEX_COLORS, VERTEX_NAMES } from './TriangleStage'

// Live triangle facts. Headline is the angle-sum: A + B + C = 180°, always.
export default function TriangleReadout({ vertices }) {
  const [A, B, C] = vertices
  if (isDegenerate(A, B, C)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 text-center text-gray-400 font-semibold">
        The three corners are in a line — drag a vertex to open up the triangle.
      </div>
    )
  }

  const ang = roundedAngles(A, B, C)
  const angArr = [ang.A, ang.B, ang.C]
  const byAngle = classifyByAngle(A, B, C)
  const bySide = classifyBySide(A, B, C)

  return (
    <div className="flex flex-col gap-4">
      {/* Classification badges */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div key={byAngle.name} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl p-3 text-white text-center font-bold shadow" style={{ backgroundColor: byAngle.color }}>
          {byAngle.name}
          <span className="block text-xs font-normal opacity-90">by angles</span>
        </motion.div>
        <motion.div key={bySide.name} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl p-3 text-white text-center font-bold shadow" style={{ backgroundColor: bySide.color }}>
          {bySide.name}
          <span className="block text-xs font-normal opacity-90">by sides</span>
        </motion.div>
      </div>

      {/* Angle sum headline */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Angles always add to 180°</div>
        <div className="flex items-center justify-center gap-1.5 flex-wrap text-lg font-bold">
          {angArr.map((v, i) => (
            <span key={i} className="contents">
              <span className="px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: VERTEX_COLORS[i] }}>{v}°</span>
              {i < 2 && <span className="text-gray-400">+</span>}
            </span>
          ))}
          <span className="text-gray-400">=</span>
          <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-white">180°</span>
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          {VERTEX_NAMES.map((n, i) => (
            <span key={i} className="mx-1"><span style={{ color: VERTEX_COLORS[i] }}>●</span> {n}</span>
          ))}
        </div>
      </div>

      {/* Measurements */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Perimeter" value={`${perimeter(A, B, C).toFixed(1)}`} hint="units" />
        <Stat label="Area" value={`${area(A, B, C).toFixed(1)}`} hint="square units" />
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
