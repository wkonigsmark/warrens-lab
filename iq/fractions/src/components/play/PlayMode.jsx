import { useState } from 'react'
import ExploreTool from './ExploreTool'
import CompareTool from './CompareTool'
import NumberLineTool from './NumberLineTool'
import GroupTool from './GroupTool'

// The drag-to-explore member of the family. A small toolbar switches between
// the free-play tools — no right answers, just discovery.
const TOOLS = [
  { id: 'explore', label: '🥧 One Pie', Cmp: ExploreTool },
  { id: 'compare', label: '⚖️ Compare', Cmp: CompareTool },
  { id: 'line', label: '📏 Number Line', Cmp: NumberLineTool },
  { id: 'group', label: '🍪 Fraction of a Group', Cmp: GroupTool },
]

export default function PlayMode() {
  const [tool, setTool] = useState('explore')
  const Active = TOOLS.find((t) => t.id === tool).Cmp

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tool === t.id ? 'bg-white shadow text-pink-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  )
}
