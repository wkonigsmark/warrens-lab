import { useState } from 'react'
import PercentLab from '../PercentLab'
import DecimalLab from '../DecimalLab'

// Free-play toys, switched with a little toolbar like the rest of the family.
// No right answers — just poke and discover.
const TOOLS = [
  { id: 'grid', label: '🔲 Percent Grid', Cmp: PercentLab },
  { id: 'line', label: '📏 Number Line', Cmp: DecimalLab },
]

export default function PlayMode() {
  const [tool, setTool] = useState('grid')
  const Active = TOOLS.find((t) => t.id === tool).Cmp

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tool === t.id ? 'bg-white shadow text-cyan-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white/60 rounded-3xl shadow-sm p-6">
        <Active />
      </div>
    </div>
  )
}
