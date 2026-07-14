import { useState } from 'react'
import Banner from './components/Banner'
import UserPicker from './components/UserPicker'
import PinGate from './components/PinGate'
import AlgebraQuizMode from './components/AlgebraQuizMode'
import AlgebraAdminView from './components/AlgebraAdminView'
import { getStoredUser, storeUser, clearStoredUser } from './lib/users'
import { signOut } from '../../_shared/progress/index.js'

const isAdmin = new URLSearchParams(window.location.search).has('admin')

export default function App() {
  if (isAdmin) return <AlgebraAdminView />
  return <AppShell />
}

function AppShell() {
  const [user, setUser] = useState(() => getStoredUser())
  const selectUser = (id) => { storeUser(id); setUser(id) }
  const switchUser = () => { clearStoredUser(); signOut(); setUser(null) }

  if (!user) return <UserPicker onSelect={selectUser} />

  return (
    <PinGate key={user} user={user} onCancel={switchUser}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-indigo-100">
        <Banner user={user} onSwitchUser={switchUser} />
        <div className="px-4 py-6">
          <AlgebraQuizMode key={user} user={user} />
        </div>
      </div>
    </PinGate>
  )
}
