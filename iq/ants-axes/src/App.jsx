import { useState } from 'react'
import Chart from './components/Chart'
import Controls from './components/Controls'
import Banner from './components/Banner'

export default function App() {
  const [points, setPoints] = useState([])

  const addPoint = (x, y) => {
    if (points.length < 2) {
      setPoints([...points, { x, y }])
    }
  }

  const clearPoints = () => {
    setPoints([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Banner />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Chart points={points} onPointClick={addPoint} />
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-1">
            <Controls
              points={points}
              onAddPoint={addPoint}
              onClear={clearPoints}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
