import React, { useState } from 'react'
import Quiz from './components/Quiz'
import RegionSelector from './components/RegionSelector'
import MapViewer from './components/MapViewer'

type ViewType = 'regions' | 'quiz' | 'map'

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('regions')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId)
    setView('quiz')
  }

  const handleOpenMap = () => {
    setView('map')
  }

  const handleBack = () => {
    setSelectedRegion(null)
    setView('regions')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {view === 'quiz' && selectedRegion ? (
        <Quiz regionId={selectedRegion} onBack={handleBack} />
      ) : view === 'map' ? (
        <MapViewer onSelectRegion={handleSelectRegion} onBack={handleBack} />
      ) : (
        <RegionSelector onSelectRegion={handleSelectRegion} onOpenMap={handleOpenMap} />
      )}
    </div>
  )
}

export default App
