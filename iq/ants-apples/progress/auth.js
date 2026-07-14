// Vendored copy of iq/_shared/progress/auth.js — see config.js for why.
import { SESSION_IDLE_MINUTES } from './config.js'
import { isConfigured, rpc } from './client.js'

const SESSION_KEY = 'iq-progress-session'
const PIN_CACHE_KEY = 'iq-progress-pin-cache'
const GUEST_ID = 'guest'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export function getVerifiedUser() {
  const s = readJSON(SESSION_KEY, null)
  if (!s?.userId) return null
  if (Date.now() - s.lastActive > SESSION_IDLE_MINUTES * 60_000) return null
  return s.userId
}

export function touchSession() {
  const s = readJSON(SESSION_KEY, null)
  if (s?.userId) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, lastActive: Date.now() }))
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

export async function verifyPin(userId, pin) {
  const start = (offline) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      userId, lastActive: Date.now(), offline,
    }))
    return { ok: true, offline }
  }

  if (userId === GUEST_ID) return start(false)

  const hash = await sha256(`${userId}:${pin}`)
  const cache = readJSON(PIN_CACHE_KEY, {})

  if (isConfigured() && navigator.onLine) {
    try {
      const ok = await rpc('verify_pin', { p_student_id: userId, p_pin: String(pin) })
      if (!ok) return { ok: false, offline: false }
      localStorage.setItem(PIN_CACHE_KEY, JSON.stringify({ ...cache, [userId]: hash }))
      return start(false)
    } catch {
      // fall through to offline path
    }
  }
  if (cache[userId] && cache[userId] === hash) return start(true)
  return { ok: false, offline: true }
}

export function isOfflineSession() {
  return readJSON(SESSION_KEY, null)?.offline === true
}
