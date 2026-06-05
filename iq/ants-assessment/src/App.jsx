import { useState } from 'react'
import Banner from './components/Banner'
import StartScreen from './components/StartScreen'
import AssessmentRunner from './components/AssessmentRunner'
import Results from './components/Results'

// Three-stage flow: pick topics → run the ladder → see the report.
// (Long-term home for richer history/tracking; v1 is a single check-up.)
export default function App() {
  const [stage, setStage] = useState('start') // 'start' | 'running' | 'results'
  const [competencyIds, setCompetencyIds] = useState([])
  const [results, setResults] = useState([])

  const start = (ids) => {
    setCompetencyIds(ids)
    setResults([])
    setStage('running')
    window.scrollTo({ top: 0 })
  }

  const finish = (res) => {
    setResults(res)
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
        {stage === 'start' && <StartScreen onStart={start} />}
        {stage === 'running' && <AssessmentRunner competencyIds={competencyIds} onFinish={finish} />}
        {stage === 'results' && <Results results={results} onRestart={restart} />}
      </div>
    </div>
  )
}
