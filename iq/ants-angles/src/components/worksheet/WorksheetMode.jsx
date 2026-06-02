import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TOPICS, getTopic } from '../../lib/angleWorksheet'
import { visibleItems } from '../../lib/wholeNumbers'
import WholeNumbersToggle from '../quiz/WholeNumbersToggle'
import Worksheet from './Worksheet'

// Topic picker → mode picker (master / mentor) → printable worksheet.
export default function WorksheetMode({ wholeOnly, onWholeChange, focusTopicId, onFocusConsumed }) {
  const [topicId, setTopicId] = useState(null)
  const [mode, setMode] = useState(null)
  const focusRef = useRef({})

  // Scroll to + briefly highlight the focused topic button on arrival from a story.
  useEffect(() => {
    if (!focusTopicId) return
    const timer = setTimeout(() => {
      const el = focusRef.current[focusTopicId]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2')
        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2'), 1800)
      }
      onFocusConsumed?.()
    }, 150)
    return () => clearTimeout(timer)
  }, [focusTopicId]) // eslint-disable-line react-hooks/exhaustive-deps

  const shown = visibleItems(TOPICS, wholeOnly)
  const hiddenCount = TOPICS.length - shown.length

  if (topicId && mode) {
    return <Worksheet topic={getTopic(topicId)} mode={mode} wholeOnly={wholeOnly} onBack={() => { setTopicId(null); setMode(null) }} />
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
        <p className="text-gray-500 mt-1">Generate a fresh sheet to print and practice on paper.</p>
      </motion.div>

      <WholeNumbersToggle wholeOnly={wholeOnly} onChange={onWholeChange} hiddenCount={hiddenCount} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shown.map((t, i) => (
          <motion.button
            key={t.id}
            ref={el => { focusRef.current[t.id] = el }}
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
