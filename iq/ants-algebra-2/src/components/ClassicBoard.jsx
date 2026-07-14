import { motion } from 'framer-motion'

// Classic Mode's stage: a chalkboard instead of the balance scale.
// The unknown slot ('x', or the trailing '?' in a chain) renders as a boxed
// blank; a tapped guess fills it, and the reveal fills it in green.
export default function ClassicBoard({ equation, guess, reveal }) {
  const filled = guess ?? reveal ?? null
  const isReveal = reveal != null

  // Split the equation on its unknown token — 'x' if present, else the '?'.
  const token = equation.includes('x') ? 'x' : '?'
  const parts = equation.split(token)

  return (
    <div className="max-w-md mx-auto my-2">
      <div className="bg-emerald-900 rounded-2xl border-8 border-amber-700/80 px-6 py-10 shadow-inner relative">
        {/* chalk tray */}
        <div className="absolute -bottom-2 left-10 right-10 h-2 rounded bg-amber-800/80" />
        <motion.div
          key={equation + String(filled)}
          initial={{ opacity: 0.6, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center font-mono font-extrabold text-white tracking-wide"
          style={{ fontSize: equation.length > 16 ? '1.9rem' : '2.5rem', textShadow: '0 0 6px rgba(255,255,255,0.25)' }}
        >
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <span
                  className={`inline-flex items-center justify-center align-middle rounded-lg mx-1 px-2 ${
                    isReveal ? 'text-emerald-900 bg-green-300 border-2 border-green-200'
                    : filled != null ? 'text-emerald-900 bg-amber-300 border-2 border-amber-200'
                    : 'text-amber-300 border-2 border-dashed border-amber-300/70'
                  }`}
                  style={{ minWidth: '1.5em', fontSize: '0.9em' }}
                >
                  {filled != null ? filled : token}
                </span>
              )}
            </span>
          ))}
        </motion.div>
        <div className="text-center text-emerald-200/50 text-xs mt-4 font-semibold tracking-widest uppercase">
          🐜 Ant Academy Chalkboard
        </div>
      </div>
    </div>
  )
}
