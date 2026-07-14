// Vendored copy of iq/_shared/progress/client.js — see config.js for why.
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js'

export function isConfigured() {
  return SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('YOUR-')
}

async function req(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const rpc = (fn, args) =>
  req(`/rest/v1/rpc/${fn}`, { method: 'POST', body: args })

// Duplicate rows (same student/tool/client_id) are silently skipped,
// which is what makes retrying a half-synced outbox safe.
export const insertSessions = (rows) =>
  req('/rest/v1/progress_sessions?on_conflict=student_id,tool_id,client_id', {
    method: 'POST',
    body: rows,
    headers: { Prefer: 'resolution=ignore-duplicates' },
  })

export const selectSessions = (query = 'order=ts.desc&limit=200') =>
  req(`/rest/v1/progress_sessions?${query}`)

// Live roster (id/name/emoji/color) from the `student_roster` view — never
// the pin column. Add a row to `students` in Supabase and it shows up here.
export const selectRoster = () =>
  req('/rest/v1/student_roster?select=*&order=name.asc')
