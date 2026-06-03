import { useState } from 'react'
import Banner from './components/Banner'
import Lesson from './components/Lesson'
import Playground from './components/Playground'
import Quiz from './components/Quiz'

// Same three-mode shell as the rest of the Ants & ___ family — all three live:
// Learn (scroll-down lesson), Play (drag-to-explore), Quiz (leveled questions).
const MODES = [
  { id: 'learn', label: '📖 Learn', grad: 'from-indigo-500 to-violet-600', ready: true },
  { id: 'play', label: '🧭 Play', grad: 'from-sky-500 to-cyan-600', ready: true },
  { id: 'quiz', label: '📚 Quiz', grad: 'from-green-500 to-emerald-600', ready: true },
]

export default function App() {
  const [mode, setMode] = useState('learn')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-2 flex flex-wrap justify-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-5 py-2.5 rounded-lg font-bold text-white transition-shadow bg-gradient-to-r ${m.grad} ${
                mode === m.id ? 'shadow-lg ring-2 ring-offset-2 ring-indigo-300' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {m.label}
              {!m.ready && <span className="ml-1 text-[10px] font-normal opacity-80">soon</span>}
            </button>
          ))}
        </div>

        {mode === 'learn' && <Lesson />}
        {mode === 'play' && <Playground />}
        {mode === 'quiz' && <Quiz />}
      </div>
    </div>
  )
}
