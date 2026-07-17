import { useState } from 'react'
import { motion } from 'framer-motion'
import { COMPETENCIES } from '../lib/competencies'
import CalibrationPanel from './CalibrationPanel'

// Pick which skills to check, then start. Default: everything ticked — a full
// check-up. Tap any card to leave it out for a quicker, focused session.
export default function StartScreen({ onStart, config, onConfigChange }) {
  const [selected, setSelected] = useState(() => new Set(COMPETENCIES.map((c) => c.id)))
  const [showCalibrate, setShowCalibrate] = useState(false)

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const chosen = COMPETENCIES.filter((c) => selected.has(c.id))
  const minQ = chosen.length * config.minQuestions
  const maxQ = chosen.length * config.maxQuestions

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-800">What should we check today? 🔎</h1>
        <p className="text-gray-500 mt-1">
          Tap a topic to switch it on or off. Each topic adapts — it finds the right level for the student.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={() => setShowCalibrate((s) => !s)}
            className="text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-full"
          >
            🔧 {showCalibrate ? 'Hide' : 'Calibrate'}
          </button>
          <button
            onClick={() => window.open(window.location.pathname + '?journey', '_blank')}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full"
          >
            🗺️ Curriculum Journey
          </button>
        </div>
      </motion.div>

      {showCalibrate && <CalibrationPanel config={config} onChange={onConfigChange} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COMPETENCIES.map((c, i) => {
          const on = selected.has(c.id)
          return (
            <motion.button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left border-2 transition-all ${
                on ? 'bg-white shadow-lg' : 'bg-white/40 opacity-60'
              }`}
              style={{ borderColor: on ? c.accent : 'transparent' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="flex-1">
                <span className="block font-bold text-gray-800">{c.label}</span>
                <span className="block text-xs text-gray-500">{c.blurb}</span>
              </span>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-black"
                style={{ backgroundColor: on ? c.accent : '#cbd5e1' }}
              >
                {on ? '✓' : ''}
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-7 text-center">
        <button
          onClick={() => onStart(chosen.map((c) => c.id))}
          disabled={chosen.length === 0}
          className="px-10 py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-500 to-cyan-600 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start the check-up →
        </button>
        <p className="text-xs text-gray-400 mt-2">
          {chosen.length === 0 ? 'Pick at least one topic' : `~${minQ}–${maxQ} questions · adapts to the student`}
        </p>
      </div>
    </div>
  )
}
