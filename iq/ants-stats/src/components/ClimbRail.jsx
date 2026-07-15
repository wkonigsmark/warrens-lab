import { motion } from 'framer-motion'
import { RUNGS, SKILLS } from '../lib/statsEngine'

// The climb rail for one tier run: RUNGS rungs + the summit flag, plus the
// remaining miss budget as hearts (💎 when zero misses are allowed). Same
// visual language as the younger Ants games' ladder — light, no clutter.
export default function ClimbRail({ rung, misses, missBudget, accent = '#0ea5e9', skill }) {
  const hearts = Math.max(0, missBudget - misses)
  const s = skill ? SKILLS[skill] : null
  return (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg px-3 py-4 w-24 flex-shrink-0">
      <div className="text-2xl mb-1">🚩</div>
      <div className="flex flex-col-reverse gap-1.5 flex-1 w-full items-stretch">
        {Array.from({ length: RUNGS }, (_, i) => {
          const climbed = i < rung
          const current = i === rung
          return (
            <div
              key={i}
              className="relative h-5 rounded-md transition-colors flex items-center justify-center"
              style={{ backgroundColor: climbed ? accent : '#f3f4f6', opacity: climbed ? 0.85 : 1 }}
            >
              {current && (
                <motion.span layoutId="stats-climber" className="text-base leading-none"
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  🐜
                </motion.span>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 text-sm tracking-tight min-h-[20px]">
        {missBudget === 0
          ? <span title="No misses allowed!">💎</span>
          : Array.from({ length: hearts }, (_, i) => <span key={i}>❤️</span>)}
      </div>
      {s && (
        <div className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: s.color }}>
          {s.emoji} {s.short}
        </div>
      )}
      <div className="text-[10px] text-gray-400 mt-1 text-center leading-tight">{rung} / {RUNGS}</div>
    </div>
  )
}
