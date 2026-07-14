// iq-progress — shared Supabase progress tracking for the /iq suite.
//
// Wiring a tool takes two touches:
//   1. In src/lib/sessions.js:
//        import { enqueueSession } from '../../../../_shared/progress/index.js'
//        // inside saveSession(session, user):
//        enqueueSession(TOOL_ID, user, session)
//   2. At app startup (main.jsx):
//        startAutoFlush()
//        backfillFromLocal(TOOL_ID, TRACKED_USERS.map(u => u.id), getSessions)
//   Plus a PIN gate after the user picker (see README).
export { isConfigured, selectSessions, selectRoster } from './client.js'
export { verifyPin, getVerifiedUser, touchSession, signOut, isOfflineSession } from './auth.js'
export { enqueueSession, flush, startAutoFlush, backfillFromLocal } from './queue.js'
export { TOOL_CATALOG, getToolInfo, describeSession } from './toolCatalog.js'
export { fetchRoster } from './roster.js'
