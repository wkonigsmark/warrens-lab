import React, { useState } from 'react'
import Quiz from './components/Quiz'
import RegionSelector from './components/RegionSelector'

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId)
  }

  const handleBack = () => {
    setSelectedRegion(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {selectedRegion ? (
        <Quiz regionId={selectedRegion} onBack={handleBack} />
      ) : (
        <RegionSelector onSelectRegion={handleSelectRegion} />
      )}
    </div>
  )
}

export default App
