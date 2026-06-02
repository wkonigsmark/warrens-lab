import { useState } from 'react'
import Banner from './components/Banner'
import AngleStage from './components/AngleStage'
import AngleReadout from './components/AngleReadout'
import AngleControls from './components/AngleControls'
import QuizMode from './components/quiz/QuizMode'

// Topic tabs — Angles is built; the rest are the roadmap (triangles, polygons
// & area, circles & Pi, volume). They render a friendly placeholder for now.
const TOPICS = [
  { id: 'angles', label: 'Angles', emoji: '📐', ready: true },
  { id: 'triangles', label: 'Triangles', emoji: '🔺', ready: false },
  { id: 'area', label: 'Area & Polygons', emoji: '⬛', ready: false },
  { id: 'circles', label: 'Circles & Pi', emoji: '⭕', ready: false },
]

export default function App() {
  const [mode, setMode] = useState('explore') // 'explore' | 'quiz' | 'worksheet'
  const [topic, setTopic] = useState('angles')
  const [angle, setAngle] = useState(45)
  const [snap, setSnap] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-indigo-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Mode switch */}
        <div className="mb-5 flex flex-wrap justify-center gap-2">
          {[
            { id: 'explore', label: '🧭 Explore', grad: 'from-indigo-500 to-purple-600' },
            { id: 'quiz', label: '📚 Quiz', grad: 'from-green-500 to-emerald-600' },
            { id: 'worksheet', label: '🖨 Worksheets', grad: 'from-amber-500 to-orange-600' },
          ].map((m) => (
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

        {/* Topic tabs — only relevant while exploring */}
        {mode === 'explore' && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                topic === t.id
                  ? 'bg-white shadow text-indigo-600'
                  : 'bg-white/50 text-gray-500 hover:bg-white/80'
              }`}
            >
              {t.emoji} {t.label}
              {!t.ready && <span className="ml-1 text-[10px] text-gray-300">soon</span>}
            </button>
          ))}
        </div>
        )}

        {mode === 'explore' && topic === 'angles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Angle Explorer</h2>
              <p className="text-sm text-gray-400 mb-4">Drag the handle — or tap anywhere — to open and close the angle.</p>
              <AngleStage angle={angle} onAngleChange={setAngle} snap={snap} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-4">
              <AngleReadout angle={angle} />
              <AngleControls angle={angle} onAngleChange={setAngle} snap={snap} onSnapChange={setSnap} />
            </div>
          </div>
        )}

        {mode === 'explore' && topic !== 'angles' && <Placeholder topic={topic} />}

        {mode === 'quiz' && <QuizMode />}

        {mode === 'worksheet' && (
          <ComingSoon
            title="Worksheets"
            body="Printable angle-practice sheets, generated fresh each time — same print pipeline as Ants & Axes."
          />
        )}
      </div>
    </div>
  )
}

function Placeholder({ topic }) {
  const t = TOPICS.find((x) => x.id === topic)
  return (
    <ComingSoon
      title={`${t.emoji} ${t.label}`}
      body="This topic is on the roadmap. Angles is the working playground today — the same drag-to-explore engine will power this next."
    />
  )
}

function ComingSoon({ title, body }) {
  return (
    <div className="bg-white/70 rounded-2xl shadow p-10 text-center max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500">{body}</p>
    </div>
  )
}
