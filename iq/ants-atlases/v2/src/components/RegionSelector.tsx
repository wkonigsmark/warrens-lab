import React from 'react'
import statesData from '../data/states.json'

interface Region {
  id: string
  name: string
  icon: string
  description: string
}

interface RegionSelectorProps {
  onSelectRegion: (regionId: string) => void
  onOpenMap: () => void
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ onSelectRegion, onOpenMap }) => {
  const regions: Region[] = statesData.regions.map((r: any) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    description: r.description,
  }))

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📍 Ants Atlases</h1>
          <p className="text-gray-600 mb-6">Learn US geography, state by state</p>
          <button
            onClick={onOpenMap}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition text-lg mb-8"
          >
            🗺️ Explore by Map
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => onSelectRegion(region.id)}
              className="bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-lg p-6 text-left transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-4xl">{region.icon}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600">
                {region.name}
              </h2>
              <p className="text-sm text-gray-600">{region.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RegionSelector
