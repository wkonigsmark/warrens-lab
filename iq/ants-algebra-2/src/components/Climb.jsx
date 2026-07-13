import { motion } from 'framer-motion'
import { RUNGS } from '../lib/algebraQuiz'

// The anthill climb rail: 9 rungs + the crown at the top.
// rung = how many rungs climbed (0..RUNGS). misses/budget shown as hearts.
export default function Climb({ rung, misses, missBudget, accent }) {
  const hearts = Math.max(0, missBudget - misses + 1) // +1: the run ends when budget is EXCEEDED
  return (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg px-3 py-4 w-24 flex-shrink-0">
      <div className="text-2xl mb-1">👑</div>
      <div className="flex flex-col-reverse gap-1.5 flex-1 w-full items-stretch">
        {Array.from({ length: RUNGS }, (_, i) => {
          const climbed = i < rung
          const current = i === rung
          return (
            <div
              key={i}
              className="relative h-5 rounded-md transition-colors flex items-center justify-center"
              style={{
                backgroundColor: climbed ? accent : '#f3f4f6',
                opacity: climbed ? 0.85 : 1,
              }}
            >
              {current && (
                <motion.span
                  layoutId="climber"
                  className="text-base leading-none"
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  🐜
                </motion.span>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 text-sm tracking-tight">
        {missBudget === 0
          ? <span title="No misses allowed!">💎</span>
          : Array.from({ length: hearts }, (_, i) => <span key={i}>❤️</span>)}
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5 text-center leading-tight">
        {rung} / {RUNGS}
      </div>
    </div>
  )
}
