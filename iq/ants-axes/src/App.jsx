import { useState } from 'react'
import Banner from './components/Banner'
import UserPicker from './components/UserPicker'
import AxesQuizMode from './components/AxesQuizMode'
import AxesAdminView from './components/AxesAdminView'
import WorksheetMode from './components/WorksheetMode'
import Chart from './components/Chart'
import Controls from './components/Controls'
import Calculations from './components/Calculations'
import { getStoredUser, storeUser, clearStoredUser } from './lib/users'

const isAdmin = new URLSearchParams(window.location.search).has('admin')

export default function App() {
  if (isAdmin) return <AxesAdminView />
  return <AppShell />
}

function AppShell() {
  const [user, setUser] = useState(() => getStoredUser())
  const selectUser = (id) => { storeUser(id); setUser(id) }
  const switchUser  = ()  => { clearStoredUser(); setUser(null) }

  if (!user) return <UserPicker onSelect={selectUser} />
  return <AppContent key={user} user={user} onSwitchUser={switchUser} />
}

function AppContent({ user, onSwitchUser }) {
  const [mode, setMode]   = useState('quiz')
  const [points, setPoints] = useState([])

  const addPoint = (x, y) => {
    if (points.length < 2) setPoints([...points, { x, y }])
  }
  const drawLine = (x1, y1, x2, y2) => setPoints([{ x: x1, y: y1 }, { x: x2, y: y2 }])
  const clear    = () => setPoints([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Banner user={user} onSwitchUser={onSwitchUser} />

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Tab bar */}
        <div className="no-print mb-5 flex flex-wrap justify-center gap-2">
          {[
            { id: 'quiz',      label: '📊 Progress',   grad: 'from-green-500 to-emerald-600' },
            { id: 'explore',   label: '🧭 Explore',    grad: 'from-indigo-500 to-purple-600' },
            { id: 'worksheet', label: '🖨 Worksheets', grad: 'from-amber-500 to-orange-600' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-5 py-2.5 rounded-lg font-bold text-white transition-shadow bg-gradient-to-r ${m.grad} ${
                mode === m.id ? 'shadow-lg ring-2 ring-offset-2 ring-indigo-300' : 'opacity-75 hover:opacity-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'quiz' && <AxesQuizMode user={user} />}

        {mode === 'explore' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Coordinate Explorer</h2>
              <p className="text-sm text-gray-400 mb-3">Click the chart to plot points. Add two points to see slope, distance, and midpoint.</p>
              <Chart points={points} onPointClick={addPoint} showMidpoint />
              {points.length === 2 && <Calculations points={points} />}
            </div>
            <div className="lg:col-span-1">
              <Controls points={points} onAddPoint={addPoint} onDrawLine={drawLine} onClear={clear} />
            </div>
          </div>
        )}

        {mode === 'worksheet' && <WorksheetMode onExit={() => setMode('quiz')} />}
      </div>
    </div>
  )
}
