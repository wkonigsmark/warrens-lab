import { selectRoster } from './client.js'

const CACHE_KEY = 'iq-progress-roster-cache'

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || [] } catch { return [] }
}
function writeCache(roster) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(roster)) } catch {}
}

const FETCH_TIMEOUT_MS = 4000

// Live roster from Supabase (id/name/emoji/color), cached to localStorage so
// a tool's user picker still renders the last-known list if the network is
// down. Add a row to `students` in Supabase and it shows up here — in every
// tool's picker and in the motherbrain — with no code change. Races against
// a timeout so a stalled connection can't block the app from booting.
export async function fetchRoster() {
  try {
    const roster = await Promise.race([
      selectRoster(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('roster fetch timed out')), FETCH_TIMEOUT_MS)),
    ])
    if (roster?.length) writeCache(roster)
    return roster?.length ? roster : readCache()
  } catch {
    return readCache()
  }
}
