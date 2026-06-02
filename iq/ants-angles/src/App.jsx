import { useState } from 'react'
import Banner from './components/Banner'
import AngleStage from './components/AngleStage'
import AngleReadout from './components/AngleReadout'
import AngleControls from './components/AngleControls'
import QuizMode from './components/quiz/QuizMode'
import WorksheetMode from './components/worksheet/WorksheetMode'
import TriangleStage from './components/TriangleStage'
import TriangleReadout from './components/TriangleReadout'
import TriangleControls, { DEFAULT_TRIANGLE } from './components/TriangleControls'
import PolygonStage from './components/PolygonStage'
import PolygonReadout from './components/PolygonReadout'
import PolygonControls, { DEFAULT_POLYGON } from './components/PolygonControls'
import Glossary from './components/Glossary'

// Topic tabs — Angles & Triangles are built; the rest are the roadmap
// (polygons & area, circles & Pi, volume). Unbuilt ones show a placeholder.
const TOPICS = [
  { id: 'angles', label: 'Angles', emoji: '📐', ready: true },
  { id: 'triangles', label: 'Triangles', emoji: '🔺', ready: true },
  { id: 'area', label: 'Area & Polygons', emoji: '⬛', ready: true },
  { id: 'circles', label: 'Circles & Pi', emoji: '⭕', ready: false },
]

export default function App() {
  const [mode, setMode] = useState('explore') // 'explore' | 'quiz' | 'worksheet'
  const [topic, setTopic] = useState('angles')
  const [angle, setAngle] = useState(45)
  const [snap, setSnap] = useState(0)
  const [triangle, setTriangle] = useState(DEFAULT_TRIANGLE)
  const [triSnap, setTriSnap] = useState(true)
  const [polygon, setPolygon] = useState(DEFAULT_POLYGON)
  const [polySnap, setPolySnap] = useState(true)
  const [polySquares, setPolySquares] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-indigo-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Mode switch */}
        <div className="no-print mb-5 flex flex-wrap justify-center gap-2">
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

        {mode === 'explore' && topic === 'triangles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Triangle Explorer</h2>
              <p className="text-sm text-gray-400 mb-4">Drag any corner (A, B, C) — watch the three angles always add up to 180°.</p>
              <TriangleStage vertices={triangle} onChange={setTriangle} snap={triSnap} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-4">
              <TriangleReadout vertices={triangle} />
              <TriangleControls onPreset={setTriangle} snap={triSnap} onSnapChange={setTriSnap} />
            </div>
          </div>
        )}

        {mode === 'explore' && topic === 'area' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Polygon Explorer</h2>
              <p className="text-sm text-gray-400 mb-4">Drag the corners to reshape. Turn on unit squares to <em>see</em> the area.</p>
              <PolygonStage vertices={polygon} onChange={setPolygon} snap={polySnap} showSquares={polySquares} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-4">
              <PolygonReadout vertices={polygon} />
              <PolygonControls
                onPreset={setPolygon}
                snap={polySnap}
                onSnapChange={setPolySnap}
                showSquares={polySquares}
                onSquaresChange={setPolySquares}
              />
            </div>
          </div>
        )}

        {mode === 'explore' && ['angles', 'triangles', 'area'].includes(topic) && (
          <div className="mt-6">
            <Glossary topic={topic} />
          </div>
        )}

        {mode === 'explore' && !['angles', 'triangles', 'area'].includes(topic) && <Placeholder topic={topic} />}

        {mode === 'quiz' && <QuizMode />}

        {mode === 'worksheet' && <WorksheetMode />}
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
