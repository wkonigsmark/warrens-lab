import { useState } from 'react'
import Banner from './components/Banner'
import StartScreen from './components/StartScreen'
import AdaptiveRunner from './components/adaptive/AdaptiveRunner'
import AdaptiveResults from './components/adaptive/AdaptiveResults'
import { loadConfig, saveConfig } from './lib/config'

// Three-stage flow: pick topics → run the adaptive ladder → see the report.
// Config (the calibration knobs) lives here so the start screen can tune it and
// the runner consumes it; it's persisted to localStorage on every change.
export default function App() {
  const [stage, setStage] = useState('start') // 'start' | 'running' | 'results'
  const [competencyIds, setCompetencyIds] = useState([])
  const [session, setSession] = useState([])
  const [config, setConfig] = useState(loadConfig)

  const updateConfig = (cfg) => {
    setConfig(cfg)
    saveConfig(cfg)
  }

  const start = (ids) => {
    setCompetencyIds(ids)
    setSession([])
    setStage('running')
    window.scrollTo({ top: 0 })
  }

  const finish = (finishedLearners) => {
    setSession(finishedLearners)
    setStage('results')
    window.scrollTo({ top: 0 })
  }

  const restart = () => {
    setStage('start')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-100">
      <Banner />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {stage === 'start' && (
          <StartScreen onStart={start} config={config} onConfigChange={updateConfig} />
        )}
        {stage === 'running' && (
          <AdaptiveRunner competencyIds={competencyIds} config={config} onFinish={finish} />
        )}
        {stage === 'results' && (
          <AdaptiveResults session={session} config={config} onRestart={restart} />
        )}
      </div>
    </div>
  )
}
