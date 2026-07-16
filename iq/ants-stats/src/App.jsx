import { useState } from 'react'
import Banner from './components/Banner'
import UserPicker from './components/UserPicker'
import PinGate from './components/PinGate'
import StatsHome from './components/StatsHome'
import VocabLab from './components/VocabLab'
import ConceptCheck from './components/ConceptCheck'
import TopicView from './components/TopicView'
import TierRun from './components/TierRun'
import Checkpoint from './components/Checkpoint'
import StatsAdminView from './components/StatsAdminView'
import { getTopic, getCheckpoint } from './lib/topics/index'
import { TIER_DEFS } from './lib/statsEngine'
import { getStoredUser, storeUser, clearStoredUser } from './lib/users'
import { getSessions } from './lib/sessions'
import { signOut } from '../../_shared/progress/index.js'

const isAdmin = new URLSearchParams(window.location.search).has('admin')

export default function App() {
  if (isAdmin) return <StatsAdminView />
  return <AppShell />
}

function AppShell() {
  const [user, setUser] = useState(() => getStoredUser())
  const selectUser = (id) => { storeUser(id); setUser(id) }
  const switchUser = () => { clearStoredUser(); signOut(); setUser(null) }

  if (!user) return <UserPicker onSelect={selectUser} />

  return (
    <PinGate key={user} user={user} onCancel={switchUser}>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
        <Banner user={user} onSwitchUser={switchUser} />
        <div className="px-4 py-6">
          <StatsRouter key={user} user={user} />
        </div>
      </div>
    </PinGate>
  )
}

// The first tier a student hasn't cleared for a unit (gated entry point).
function currentTierFor(user, topicId) {
  const passed = new Set(getSessions(user).filter((s) => s.passed && s.topicId === topicId && s.tier >= 1).map((s) => s.tier))
  return TIER_DEFS.find((t) => !passed.has(t.tier))?.tier ?? TIER_DEFS[TIER_DEFS.length - 1].tier
}

function StatsRouter({ user }) {
  const [view, setView] = useState({ type: 'home' })
  const [refreshKey, setRefreshKey] = useState(0)
  const [runKey, setRunKey] = useState(0)

  const home = () => { setRefreshKey((k) => k + 1); setView({ type: 'home' }) }
  const climb = (topicId, tier) => {
    setRunKey((k) => k + 1)
    setView({ type: 'climb', topicId, tier: tier ?? currentTierFor(user, topicId) })
  }

  if (view.type === 'vocab') {
    return <VocabLab user={user} onExit={home} />
  }
  if (view.type === 'concept') {
    return (
      <ConceptCheck
        user={user}
        topic={getTopic(view.topicId)}
        onExit={home}
        onDone={() => climb(view.topicId)}
      />
    )
  }
  if (view.type === 'learn') {
    return <TopicView topic={getTopic(view.topicId)} onExit={home} />
  }
  if (view.type === 'climb') {
    return (
      <TierRun
        key={`${view.topicId}-${view.tier}-${runKey}`}
        user={user}
        unit={getTopic(view.topicId)}
        tier={view.tier}
        onExit={home}
        onDone={(nextTier) => climb(view.topicId, nextTier)}
      />
    )
  }
  if (view.type === 'checkpoint') {
    return <Checkpoint user={user} checkpoint={getCheckpoint(view.id)} onExit={home} />
  }
  return (
    <StatsHome
      user={user}
      refreshKey={refreshKey}
      onClimb={climb}
      onVocab={() => setView({ type: 'vocab' })}
      onConcept={(topicId) => setView({ type: 'concept', topicId })}
      onLearn={(topicId) => setView({ type: 'learn', topicId })}
      onCheckpoint={(id) => setView({ type: 'checkpoint', id })}
    />
  )
}
