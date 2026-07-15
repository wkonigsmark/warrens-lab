import { motion } from 'framer-motion'

// The reading-heavy opener: real explanation + a real-world hook. No tracking,
// no pressure — just orient the student before any question is asked.
export default function ConceptIntro({ topic, onNext, onExit }) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onExit} className="text-xs text-gray-400 hover:text-gray-600 mb-3">← All topics</button>

      <div className="text-center mb-5">
        <div className="text-5xl mb-1">{topic.emoji}</div>
        <h1 className="text-2xl font-extrabold text-gray-800">{topic.title}</h1>
        <p className="text-sm font-medium mt-1" style={{ color: topic.accent }}>{topic.hook}</p>
      </div>

      <div className="stat-prose flex flex-col gap-4">
        {topic.intro.map((sec, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-2xl shadow p-5 border-l-4"
            style={{ borderColor: topic.accent }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
          >
            <h3 className="font-bold text-gray-800 mb-1">{sec.h}</h3>
            <p className="text-gray-600 text-[15px]">{sec.body}</p>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full mt-6 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-shadow"
        style={{ backgroundColor: topic.accent }}
      >
        See worked examples →
      </button>
    </div>
  )
}
