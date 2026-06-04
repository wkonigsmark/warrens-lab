import { useState } from 'react'
import Banner from './components/Banner'
import Lesson1 from './components/Lesson1'
import Lesson2 from './components/Lesson2'
import Lesson3 from './components/Lesson3'
import Lesson4 from './components/Lesson4'
import Lesson5 from './components/Lesson5'
import PlayMode from './components/play/PlayMode'
import ChallengeMode from './components/challenge/ChallengeMode'
import QuizMode from './components/quiz/QuizMode'
import WorksheetMode from './components/worksheet/WorksheetMode'

// The full Ants-family shell: Learn / Play / Challenge / Quiz / Worksheets.
const MODES = [
  { id: 'learn', label: '📖 Learn', grad: 'from-cyan-500 to-sky-600' },
  { id: 'play', label: '🧭 Play', grad: 'from-sky-500 to-indigo-600' },
  { id: 'challenge', label: '🎯 Challenge', grad: 'from-violet-500 to-fuchsia-600' },
  { id: 'quiz', label: '📚 Quiz', grad: 'from-green-500 to-emerald-600' },
  { id: 'worksheet', label: '🖨 Worksheets', grad: 'from-indigo-500 to-purple-600' },
]

export default function App() {
  const [mode, setMode] = useState('learn')

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-indigo-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="no-print mb-4 flex flex-wrap justify-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-5 py-2.5 rounded-lg font-bold text-white transition-shadow bg-gradient-to-r ${m.grad} ${
                mode === m.id ? 'shadow-lg ring-2 ring-offset-2 ring-cyan-300' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'learn' && <LearnMode onGoToMode={setMode} />}
        {mode === 'play' && <PlayMode />}
        {mode === 'challenge' && <ChallengeMode onGoToMode={setMode} />}
        {mode === 'quiz' && <QuizMode />}
        {mode === 'worksheet' && <WorksheetMode />}
      </div>
    </div>
  )
}

// Learn holds the growing set of scroll-down lessons (percents first).
const LESSONS = [
  { id: 1, label: 'Lesson 1 · What is a percent?', Cmp: Lesson1 },
  { id: 2, label: 'Lesson 2 · Percents & fractions', Cmp: Lesson2 },
  { id: 3, label: 'Lesson 3 · Percent of a number', Cmp: Lesson3 },
  { id: 4, label: 'Lesson 4 · Meet decimals', Cmp: Lesson4 },
  { id: 5, label: 'Lesson 5 · Three ways: ½ = 0.5 = 50%', Cmp: Lesson5 },
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
              lesson === l.id ? 'bg-white shadow text-cyan-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'
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

// "What next?" footer at the bottom of every lesson: continue to the next
// lesson, or jump into Play.
function LessonFooter({ lessonId, onPickLesson, onGoToMode }) {
  const next = LESSONS.find((l) => l.id === lessonId + 1)
  return (
    <div className="max-w-2xl mx-auto mt-2 mb-14 bg-white rounded-2xl shadow-lg p-6 text-center">
      <h3 className="text-lg font-black text-gray-800 mb-4">What next? 🎯</h3>

      {next && (
        <button
          onClick={() => onPickLesson(next.id)}
          className="w-full mb-5 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-shadow"
        >
          Next → {next.label}
        </button>
      )}

      <p className="text-sm text-gray-400 mb-3">
        {next ? 'Or try it yourself:' : "🏆 You've finished the lessons! Now try it:"}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onGoToMode('play')}
          className="bg-sky-50 text-sky-600 font-bold py-3 rounded-xl hover:bg-sky-100 transition-colors"
        >
          🧭 Play
        </button>
        <button
          onClick={() => onGoToMode('challenge')}
          className="bg-violet-50 text-violet-600 font-bold py-3 rounded-xl hover:bg-violet-100 transition-colors"
        >
          🎯 Challenge
        </button>
        <button
          onClick={() => onGoToMode('quiz')}
          className="bg-green-50 text-green-600 font-bold py-3 rounded-xl hover:bg-green-100 transition-colors"
        >
          📚 Quiz
        </button>
      </div>
    </div>
  )
}
