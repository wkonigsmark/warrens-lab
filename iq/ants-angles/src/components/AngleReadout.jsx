import { motion } from 'framer-motion'
import { classifyAngle, complementOf, supplementOf } from '../lib/angles'

// Live, color-coded facts about the current angle — the "instant gratification"
// payoff panel. Recomputes on every drag frame.
export default function AngleReadout({ angle }) {
  const deg = Math.round(angle)
  const cls = classifyAngle(angle)
  const comp = complementOf(angle)
  const supp = supplementOf(angle)

  const Stat = ({ label, value, hint, accent }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent || '#1f2937' }}>{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-0.5">{hint}</div>}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        key={cls.name}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-xl p-4 text-white font-bold text-lg text-center shadow"
        style={{ backgroundColor: cls.color }}
      >
        {cls.name}
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Measure" value={`${deg}°`} accent={cls.color} />
        <Stat
          label="Turn"
          value={`${(deg / 360 * 100).toFixed(0)}%`}
          hint="of a full turn"
        />
        <Stat
          label="Complement"
          value={comp !== null ? `${Math.round(comp)}°` : '—'}
          hint={comp !== null ? `${deg}° + ${Math.round(comp)}° = 90°` : 'needs an acute angle'}
          accent={comp !== null ? '#22c55e' : '#cbd5e1'}
        />
        <Stat
          label="Supplement"
          value={supp !== null ? `${Math.round(supp)}°` : '—'}
          hint={supp !== null ? `${deg}° + ${Math.round(supp)}° = 180°` : 'needs angle < 180°'}
          accent={supp !== null ? '#8b5cf6' : '#cbd5e1'}
        />
      </div>
    </div>
  )
}
