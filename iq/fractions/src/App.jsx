import { useState } from 'react'
import Banner from './components/Banner'
import Lesson from './components/Lesson'
import Lesson2 from './components/Lesson2'
import Lesson3 from './components/Lesson3'
import Lesson4 from './components/Lesson4'
import Lesson5 from './components/Lesson5'
import Lesson6 from './components/Lesson6'
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

        {mode === 'learn' && <LearnMode onGoToMode={setMode} />}
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
  { id: 4, label: 'Lesson 4 · Fraction of a number', Cmp: Lesson4 },
  { id: 5, label: 'Lesson 5 · Improper & mixed numbers', Cmp: Lesson5 },
  { id: 6, label: 'Lesson 6 · Multiplying fractions', Cmp: Lesson6 },
]

function LearnMode({ onGoToMode }) {
  const [lesson, setLesson] = useState(1)
  const Active = LESSONS.find((l) => l.id === lesson).Cmp

  const pickLesson = (id) => { setLesson(id); window.scrollTo({ top: 0 }) }
  const goToMode = (m) => { onGoToMode(m); window.scrollTo({ top: 0 }) }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {LESSONS.map((l) => (
          <button
            key={l.id}
            onClick={() => pickLesson(l.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              lesson === l.id ? 'bg-white shadow text-amber-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <Active />
      <LessonFooter lessonId={lesson} onPickLesson={pickLesson} onGoToMode={goToMode} />
    </div>
  )
}

// "What next?" footer shown at the bottom of every lesson: continue to the next
// lesson (if there is one), or jump straight into Play / Quiz / Worksheets.
function LessonFooter({ lessonId, onPickLesson, onGoToMode }) {
  const next = LESSONS.find((l) => l.id === lessonId + 1)
  return (
    <div className="max-w-2xl mx-auto mt-2 mb-14 bg-white rounded-2xl shadow-lg p-6 text-center">
      <h3 className="text-lg font-black text-gray-800 mb-4">What next? 🎯</h3>

      {next && (
        <button
          onClick={() => onPickLesson(next.id)}
          className="w-full mb-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-shadow"
        >
          Next → {next.label}
        </button>
      )}

      <p className="text-sm text-gray-400 mb-3">
        {next ? 'Or practice what you learned:' : "🏆 You've finished the lessons! Time to practice:"}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onGoToMode('play')} className="bg-pink-50 text-pink-600 font-bold py-3 rounded-xl hover:bg-pink-100 transition-colors">🧭 Play</button>
        <button onClick={() => onGoToMode('quiz')} className="bg-green-50 text-green-600 font-bold py-3 rounded-xl hover:bg-green-100 transition-colors">📚 Quiz</button>
        <button onClick={() => onGoToMode('worksheet')} className="bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-colors">🖨 Worksheets</button>
      </div>
    </div>
  )
}
