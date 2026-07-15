import { motion } from 'framer-motion'
import MiniChart from './MiniChart'
import { SKILLS } from '../lib/statsEngine'

// Renders one question: a skill/tier badge, the (possibly multi-sentence)
// prompt, an optional chart, and tappable choice rows. Feedback + explanation
// appear inline after an answer. Presentation only — the parent owns state.
//
//   phase: 'asking' | 'answered'
//   picked: index the user tapped (or null)
//   showHint    — render the 💡 scaffold (faded out at higher tiers)
//   showExplain — render the full explanation box (off during timed tier runs,
//                 which flash a quick correct/wrong then auto-advance)
export default function QuestionCard({ q, phase, picked, onPick, accent = '#0ea5e9', showHint = true, showExplain = true }) {
  const skill = SKILLS[q.skill]
  const answered = phase === 'answered'

  return (
    <motion.div
      key={q._key}
      className={`bg-white rounded-2xl shadow-lg p-5 ${answered && picked !== q.correctIndex ? 'quiz-shake' : ''}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: skill.color }}>
          {skill.emoji} {skill.label}
        </span>
        <span className="text-[11px] font-semibold text-gray-400">Tier {q.tier}</span>
      </div>

      <p className="text-gray-800 font-medium whitespace-pre-line leading-relaxed">{q.prompt}</p>

      {q.chart && <MiniChart spec={q.chart} />}

      {q.hint && showHint && !answered && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          💡 {q.hint}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {q.choices.map((c, i) => {
          const isCorrect = i === q.correctIndex
          const isPicked = i === picked
          let cls = 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100 active:scale-[0.99]'
          if (answered && isCorrect) cls = 'bg-green-500 border-green-500 text-white'
          else if (answered && isPicked && !isCorrect) cls = 'bg-red-50 border-red-300 text-red-500 line-through'
          else if (answered) cls = 'bg-slate-50 border-slate-200 text-gray-400'
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => onPick(i)}
              className={`text-left px-4 py-3 rounded-xl font-medium border-2 transition-all text-[15px] whitespace-pre-line ${cls}`}
            >
              {c}
            </button>
          )
        })}
      </div>

      {answered && showExplain && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl text-sm"
          style={{ backgroundColor: picked === q.correctIndex ? '#f0fdf4' : '#fef2f2' }}
        >
          <span className="font-bold" style={{ color: picked === q.correctIndex ? '#16a34a' : '#dc2626' }}>
            {picked === q.correctIndex ? '✓ Correct — ' : '✗ Not quite — '}
          </span>
          <span className="text-gray-600">{q.explain}</span>
        </motion.div>
      )}

      {answered && !showExplain && (
        <div className="mt-3 text-center text-sm font-bold" style={{ color: picked === q.correctIndex ? '#16a34a' : '#dc2626' }}>
          {picked === q.correctIndex ? '✓ Correct!' : `✗ Answer: ${q.choices[q.correctIndex]}`}
        </div>
      )}
    </motion.div>
  )
}
