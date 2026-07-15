import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { startAutoFlush, backfillFromLocal } from '../../_shared/progress/index.js'
import { loadRoster, TRACKED_USERS } from './lib/users'
import { getSessions } from './lib/sessions'
import { TOOL_ID } from './lib/sessions'

async function boot() {
  await loadRoster() // populates TRACKED_USERS before anything renders

  startAutoFlush()
  backfillFromLocal(TOOL_ID, TRACKED_USERS.map((u) => u.id), getSessions)

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

boot()
