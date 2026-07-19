import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { startAutoFlush, backfillFromLocal } from '../../_shared/progress/index.js'
import { loadRoster, TRACKED_USERS } from './lib/users'
import { getSessions } from './lib/sessions'

async function boot() {
  await loadRoster() // populate TRACKED_USERS before anything renders

  startAutoFlush()
  backfillFromLocal('ants-exponents', TRACKED_USERS.map((u) => u.id), getSessions)

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

boot()
