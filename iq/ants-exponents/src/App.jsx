import { useState } from 'react'
import Banner from './components/Banner'
import UserPicker from './components/UserPicker'
import PinGate from './components/PinGate'
import Lesson from './components/Lesson'
import Lesson2 from './components/Lesson2'
import Lesson3 from './components/Lesson3'
import Playground from './components/Playground'
import QuizMode from './components/quiz/QuizMode'
import ProgressMode from './components/progress/ProgressMode'
import Worksheets from './components/Worksheets'
import { getStoredUser, storeUser, clearStoredUser } from './lib/users'
import { signOut } from '../../_shared/progress/index.js'

// Same shell as the rest of the Ants & ___ family — now behind the shared roster
// gate, with a My Progress hub as the home tab.
const MODES = [
  { id: 'learn', label: '📖 Learn', grad: 'from-indigo-500 to-violet-600' },
  { id: 'play', label: '🧭 Play', grad: 'from-sky-500 to-cyan-600' },
  { id: 'quiz', label: '📚 Quiz', grad: 'from-green-500 to-emerald-600' },
  { id: 'progress', label: '🏅 My Progress', grad: 'from-violet-500 to-purple-600' },
  { id: 'worksheets', label: '🖨 Worksheets', grad: 'from-rose-500 to-pink-600' },
]

export default function App() {
  return <UserShell />
}

function UserShell() {
  const [user, setUser] = useState(() => getStoredUser())
  const selectUser = (id) => { storeUser(id); setUser(id) }
  const switchUser = () => { clearStoredUser(); signOut(); setUser(null) }

  if (!user) return <UserPicker onSelect={selectUser} />
  return (
    <PinGate key={user} user={user} onCancel={switchUser}>
      <AppContent user={user} onSwitchUser={switchUser} />
    </PinGate>
  )
}

function AppContent({ user, onSwitchUser }) {
  // Land in the progress hub by default — see where you are and pick the next
  // unit. Learn/Play/Quiz are one tap away.
  const [mode, setMode] = useState('progress')
  const [quizStartLevel, setQuizStartLevel] = useState(null)
  const [quizJumpCount, setQuizJumpCount] = useState(0)

  // "Play →" from My Progress jumps straight into that tier in Quiz.
  const playFromProgress = (levelId) => {
    setQuizStartLevel(levelId)
    setQuizJumpCount((c) => c + 1)
    setMode('quiz')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100">
      <Banner user={user} onSwitchUser={onSwitchUser} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="no-print mb-2 flex flex-wrap justify-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-5 py-2.5 rounded-lg font-bold text-white transition-shadow bg-gradient-to-r ${m.grad} ${
                mode === m.id ? 'shadow-lg ring-2 ring-offset-2 ring-indigo-300' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'learn' && <LearnMode onGoToMode={setMode} />}
        {mode === 'play' && <Playground />}
        {mode === 'quiz' && <QuizMode key={quizJumpCount} user={user} startLevel={quizStartLevel} />}
        {mode === 'progress' && <ProgressMode user={user} onPlay={playFromProgress} />}
        {mode === 'worksheets' && <Worksheets />}
      </div>
    </div>
  )
}

// The Learn mode holds the growing set of scroll-down lessons.
const LESSONS = [
  { id: 1, label: 'Lesson 1 · What is an exponent?', Cmp: Lesson },
  { id: 2, label: 'Lesson 2 · Cubes & 3-D', Cmp: Lesson2 },
  { id: 3, label: 'Lesson 3 · Negative exponents', Cmp: Lesson3 },
]

function LearnMode({ onGoToMode }) {
  const [lesson, setLesson] = useState(1)
  const Active = LESSONS.find((l) => l.id === lesson).Cmp

  const pickLesson = (id) => { setLesson(id); window.scrollTo({ top: 0 }) }
  const goToMode = (m) => { onGoToMode(m); window.scrollTo({ top: 0 }) }

  return (
    <div>
      <div className="no-print flex flex-wrap justify-center gap-2 mb-2">
        {LESSONS.map((l) => (
          <button
            key={l.id}
            onClick={() => pickLesson(l.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              lesson === l.id ? 'bg-white shadow text-indigo-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'
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
    <div className="no-print max-w-2xl mx-auto mt-2 mb-14 bg-white rounded-2xl shadow-lg p-6 text-center">
      <h3 className="text-lg font-black text-gray-800 mb-4">What next? 🎯</h3>

      {next && (
        <button
          onClick={() => onPickLesson(next.id)}
          className="w-full mb-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-shadow"
        >
          Next → {next.label}
        </button>
      )}

      <p className="text-sm text-gray-400 mb-3">
        {next ? 'Or practice what you learned:' : "🏆 You've finished the lessons! Time to practice:"}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onGoToMode('play')} className="bg-sky-50 text-sky-600 font-bold py-3 rounded-xl hover:bg-sky-100 transition-colors">🧭 Play</button>
        <button onClick={() => onGoToMode('quiz')} className="bg-green-50 text-green-600 font-bold py-3 rounded-xl hover:bg-green-100 transition-colors">📚 Quiz</button>
        <button onClick={() => onGoToMode('worksheets')} className="bg-rose-50 text-rose-600 font-bold py-3 rounded-xl hover:bg-rose-100 transition-colors">🖨 Worksheets</button>
      </div>
    </div>
  )
}
