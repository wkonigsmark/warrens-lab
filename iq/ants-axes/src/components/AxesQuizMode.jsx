import { useState } from 'react'
import { motion } from 'framer-motion'
import { TOPICS } from '../lib/axesQuiz'
import AxesQuizSession from './AxesQuizSession'

export default function AxesQuizMode({ user }) {
  const [topic, setTopic] = useState(null)

  if (topic) {
    return (
      <AxesQuizSession
        user={user}
        topic={topic}
        onBack={() => setTopic(null)}
        onDone={() => setTopic({ ...topic })}  // remount same topic for "play again"
      />
    )
  }

  return (
    <div className="max-w-sm mx-auto px-2 pt-2">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-gray-800">📚 Pick a Topic</h1>
        <p className="text-gray-400 text-sm mt-1">5 questions · tap to answer</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {TOPICS.map((t, i) => (
          <motion.button
            key={t.id}
            onClick={() => setTopic(t)}
            className="flex items-center gap-4 w-full bg-white rounded-2xl shadow-md p-5 text-left border-l-8 hover:shadow-lg active:scale-[0.98] transition-all"
            style={{ borderColor: t.accent }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-3xl flex-shrink-0">{t.emoji}</span>
            <div className="min-w-0">
              <h3 className="font-extrabold text-gray-800 text-base leading-tight">{t.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{t.blurb}</p>
            </div>
            <span
              className="ml-auto flex-shrink-0 text-xs font-bold text-white px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: t.accent }}
            >
              Play →
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
