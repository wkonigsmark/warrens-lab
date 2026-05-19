import { useState } from 'react'
import Chart from './components/Chart'
import Controls from './components/Controls'
import Banner from './components/Banner'
import QuizMode from './components/QuizMode'
import Calculations from './components/Calculations'

export default function App() {
  const [mode, setMode] = useState('dashboard') // 'dashboard' or 'quiz'
  const [points, setPoints] = useState([])

  const addPoint = (x, y) => {
    if (points.length < 2) {
      setPoints([...points, { x, y }])
    }
  }

  const drawLineWithTwoPoints = (x1, y1, x2, y2) => {
    setPoints([{ x: x1, y: y1 }, { x: x2, y: y2 }])
  }

  const clearPoints = () => {
    setPoints([])
  }

  if (mode === 'quiz') {
    return <QuizMode onExit={() => setMode('dashboard')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quiz Mode Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setMode('quiz')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg transition-shadow"
          >
            📚 Quiz Mode
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Chart points={points} onPointClick={addPoint} />
            </div>

            {/* Calculations Panel */}
            {points.length === 2 && (
              <Calculations points={points} />
            )}
          </div>

          {/* Controls */}
          <div className="lg:col-span-1">
            <Controls
              points={points}
              onAddPoint={addPoint}
              onDrawLine={drawLineWithTwoPoints}
              onClear={clearPoints}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
