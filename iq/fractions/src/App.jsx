import { useState } from 'react'
import Banner from './components/Banner'
import Lesson from './components/Lesson'

// Same three-mode shell as the rest of the Ants & ___ family. "Learn" is the
// scroll-down lesson and is built; Play (drag-to-explore) and Quiz are on the
// roadmap and show a friendly placeholder for now.
const MODES = [
  { id: 'learn', label: '📖 Learn', grad: 'from-amber-500 to-orange-600', ready: true },
  { id: 'play', label: '🧭 Play', grad: 'from-indigo-500 to-purple-600' },
  { id: 'quiz', label: '📚 Quiz', grad: 'from-green-500 to-emerald-600' },
]

export default function App() {
  const [mode, setMode] = useState('learn')

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-2 flex flex-wrap justify-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-5 py-2.5 rounded-lg font-bold text-white transition-shadow bg-gradient-to-r ${m.grad} ${
                mode === m.id ? 'shadow-lg ring-2 ring-offset-2 ring-amber-300' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {m.label}
              {!m.ready && <span className="ml-1 text-[10px] font-normal opacity-80">soon</span>}
            </button>
          ))}
        </div>

        {mode === 'learn' && <Lesson />}
        {mode !== 'learn' && <ComingSoon mode={mode} />}
      </div>
    </div>
  )
}

function ComingSoon({ mode }) {
  const copy =
    mode === 'play'
      ? 'A drag-to-explore playground — cut a pie into any number of slices and shade them yourself.'
      : 'Leveled fraction questions with instant feedback, just like Ants & Angles.'
  return (
    <div className="bg-white/70 rounded-2xl shadow p-10 text-center max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Coming soon</h2>
      <p className="text-gray-500">{copy} For now, start with <strong>📖 Learn</strong>.</p>
    </div>
  )
}
