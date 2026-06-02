import { useState } from 'react'
import { motion } from 'framer-motion'
import { TOPICS, getTopic } from '../../lib/angleWorksheet'
import Worksheet from './Worksheet'

// Topic picker → mode picker (master / mentor) → printable worksheet.
export default function WorksheetMode() {
  const [topicId, setTopicId] = useState(null)
  const [mode, setMode] = useState(null)

  if (topicId && mode) {
    return <Worksheet topic={getTopic(topicId)} mode={mode} onBack={() => { setTopicId(null); setMode(null) }} />
  }

  if (topicId && !mode) {
    const topic = getTopic(topicId)
    return (
      <div className="max-w-xl mx-auto">
        <motion.div className="bg-white rounded-2xl shadow-lg p-10 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Choose Mode</h1>
          <p className="text-gray-500 mb-6">{topic.title}</p>
          <div className="space-y-3">
            <button onClick={() => setMode('master')} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg">
              Master Mode
              <span className="block text-sm font-normal text-indigo-100 mt-1">Just the problems — solve from memory</span>
            </button>
            <button onClick={() => setMode('mentor')} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:shadow-lg">
              Mentor Mode
              <span className="block text-sm font-normal text-green-100 mt-1">Adds a rules reminder at the top</span>
            </button>
            <button onClick={() => setTopicId(null)} className="w-full bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-300">← Back</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">🖨 Printable Worksheets</h1>
        <p className="text-gray-500 mt-1">Generate a fresh 6-problem sheet to print and practice on paper.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOPICS.map((t, i) => (
          <motion.button
            key={t.id}
            onClick={() => setTopicId(t.id)}
            className="bg-white rounded-2xl shadow-lg p-5 text-left hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
          >
            <h2 className="text-lg font-bold text-gray-800">{t.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.instructions}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
