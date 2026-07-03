import { motion, AnimatePresence } from 'framer-motion'

const SPARKS = ['✨', '⭐', '🌟', '💫', '⚡']

// A radial sparkle burst, re-fired whenever triggerKey changes.
export default function Burst({ triggerKey }) {
  if (!triggerKey) return null
  const parts = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 + (triggerKey % 7) * 0.31
    return {
      id: `${triggerKey}-${i}`,
      x: Math.cos(angle) * (90 + (i % 3) * 45),
      y: Math.sin(angle) * (90 + (i % 3) * 45),
      emoji: SPARKS[i % SPARKS.length],
      delay: (i % 4) * 0.04,
    }
  })
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      <AnimatePresence>
        {parts.map(p => (
          <motion.span
            key={p.id}
            className="absolute left-1/2 top-1/3 text-2xl"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: p.x, y: p.y, scale: [0, 1.3, 0.9], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
