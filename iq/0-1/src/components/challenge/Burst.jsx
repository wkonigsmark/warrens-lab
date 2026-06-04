import { motion } from 'framer-motion'

// A quick emoji confetti burst from the center — fires once when mounted.
// Re-key it (e.g. key={wins}) to play it again.
const EMOJIS = ['🎉', '⭐', '✨', '🎊', '💙', '🌟']

export default function Burst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const dist = 110 + Math.random() * 90
        return (
          <motion.span
            key={i}
            className="absolute text-2xl"
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: 1.3,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {EMOJIS[i % EMOJIS.length]}
          </motion.span>
        )
      })}
    </div>
  )
}
