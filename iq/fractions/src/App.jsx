import { useState } from 'react'
import Banner from './components/Banner'
import Lesson from './components/Lesson'
import Lesson2 from './components/Lesson2'
import Lesson3 from './components/Lesson3'
import QuizMode from './components/quiz/QuizMode'
import WorksheetMode from './components/worksheet/WorksheetMode'
import PlayMode from './components/play/PlayMode'

// Same shell as the rest of the Ants & ___ family — all four modes built.
const MODES = [
  { id: 'learn', label: '📖 Learn', grad: 'from-amber-500 to-orange-600', ready: true },
  { id: 'play', label: '🧭 Play', grad: 'from-pink-500 to-rose-600', ready: true },
  { id: 'quiz', label: '📚 Quiz', grad: 'from-green-500 to-emerald-600', ready: true },
  { id: 'worksheet', label: '🖨 Worksheets', grad: 'from-indigo-500 to-purple-600', ready: true },
]

export default function App() {
  const [mode, setMode] = useState('learn')

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="no-print mb-4 flex flex-wrap justify-center gap-2">
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

        {mode === 'learn' && <LearnMode />}
        {mode === 'play' && <PlayMode />}
        {mode === 'quiz' && <QuizMode />}
        {mode === 'worksheet' && <WorksheetMode />}
      </div>
    </div>
  )
}

// The Learn mode holds the growing set of scroll-down lessons.
const LESSONS = [
  { id: 1, label: 'Lesson 1 · What is a fraction?', Cmp: Lesson },
  { id: 2, label: 'Lesson 2 · Equal fractions & adding', Cmp: Lesson2 },
  { id: 3, label: 'Lesson 3 · Adding different bottoms', Cmp: Lesson3 },
]

function LearnMode() {
  const [lesson, setLesson] = useState(1)
  const Active = LESSONS.find((l) => l.id === lesson).Cmp
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {LESSONS.map((l) => (
          <button
            key={l.id}
            onClick={() => { setLesson(l.id); window.scrollTo({ top: 0 }) }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              lesson === l.id ? 'bg-white shadow text-amber-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  )
}
