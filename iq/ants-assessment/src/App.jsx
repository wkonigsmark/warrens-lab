import { useState } from 'react'
import Banner from './components/Banner'
import StartScreen from './components/StartScreen'
import AdaptiveRunner from './components/adaptive/AdaptiveRunner'
import AdaptiveResults from './components/adaptive/AdaptiveResults'
import ProgressAdminView from './components/admin/ProgressAdminView'
import CurriculumJourney from './components/curriculum/CurriculumJourney'
import UserPicker from './components/UserPicker'
import PinGate from './components/PinGate'
import { getStoredUser, storeUser, clearStoredUser } from './lib/users'
import { recordRun } from './lib/sessions'
import { signOut } from '../../_shared/progress/index.js'
import { loadConfig, saveConfig } from './lib/config'

const params = new URLSearchParams(window.location.search)
const isAdmin = params.has('admin')
const isJourney = params.has('journey')

export default function App() {
  if (isAdmin) return <ProgressAdminView />
  if (isJourney) return <CurriculumJourney />
  return <Gate />
}

// Roster gate: pick a profile, verify PIN, then the check-up runs attributed to
// that kid. Switching user always re-prompts (signOut clears the PIN session).
function Gate() {
  const [user, setUser] = useState(() => getStoredUser())
  const selectUser = (id) => { storeUser(id); setUser(id) }
  const switchUser = () => { clearStoredUser(); signOut(); setUser(null) }

  if (!user) return <UserPicker onSelect={selectUser} />
  return (
    <PinGate key={user} user={user} onCancel={switchUser}>
      <AppShell user={user} onSwitchUser={switchUser} />
    </PinGate>
  )
}

// Three-stage flow: pick topics → run the adaptive ladder → see the report.
// Config (the calibration knobs) lives here so the start screen can tune it and
// the runner consumes it; it's persisted to localStorage on every change.
// Mounted fresh per user (key={user} isn't needed since Gate re-mounts on switch).
function AppShell({ user, onSwitchUser }) {
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
    // Record the run for this user — local-first, then synced per competency.
    recordRun(user, finishedLearners, config)
    setStage('results')
    window.scrollTo({ top: 0 })
  }

  const restart = () => {
    setStage('start')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-100">
      <Banner user={user} onSwitchUser={onSwitchUser} />
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
