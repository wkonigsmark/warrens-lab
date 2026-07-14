// Plain-DOM equivalent of the other tools' UserPicker.jsx + PinGate.jsx,
// since Ants & Apples has no React/build step. Same behavior: pick a name,
// enter a PIN (Guest skips silently), re-prompt if the idle window lapses.
import { TRACKED_USERS, GUEST, getStoredUser, storeUser, clearStoredUser, getUser } from './progress/roster.js'
import { getVerifiedUser, verifyPin, signOut } from './progress/auth.js'
import { isConfigured } from './progress/client.js'

const RECHECK_MS = 15_000

export function initProgressGate({ onReady, onExpire }) {
  const overlay = document.createElement('div')
  overlay.id = 'ants-progress-gate'
  document.body.appendChild(overlay)

  let currentUserId = null

  function showPicker() {
    overlay.innerHTML = `
      <div id="ants-gate-card">
        <div id="ants-gate-title">Who's playing?</div>
        <div id="ants-gate-subtitle">Tap your name to start</div>
        <div id="ants-gate-grid">
          ${TRACKED_USERS.filter((u) => u.id !== GUEST.id).map((u) => `
            <button class="ants-gate-user-btn" data-id="${u.id}" style="background:${u.color}">
              <span class="ants-gate-emoji">${u.emoji}</span>${u.name}
            </button>
          `).join('')}
        </div>
        <button id="ants-gate-guest-btn">${GUEST.emoji} Play as Guest</button>
      </div>
    `
    overlay.querySelectorAll('.ants-gate-user-btn').forEach((btn) => {
      btn.addEventListener('click', () => selectUser(btn.dataset.id))
    })
    overlay.querySelector('#ants-gate-guest-btn').addEventListener('click', () => selectUser(GUEST.id))
  }

  function selectUser(id) {
    storeUser(id)
    showPinForm(id)
  }

  function showPinForm(id) {
    if (!isConfigured()) { resolveReady(id); return }

    const person = getUser(id)

    if (id === GUEST.id) {
      overlay.innerHTML = `<div id="ants-gate-card"><div class="ants-gate-emoji-big">${GUEST.emoji}</div><div id="ants-gate-title">Entering as Guest…</div></div>`
      verifyPin(id, '').then(({ ok }) => { if (ok) resolveReady(id) })
      return
    }

    overlay.innerHTML = `
      <div id="ants-gate-card">
        <div class="ants-gate-emoji-big">${person?.emoji ?? ''}</div>
        <div id="ants-gate-title">Hi ${person?.name ?? ''}!</div>
        <div id="ants-gate-subtitle">Enter your PIN to continue</div>
        <input id="ants-gate-pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" />
        <div id="ants-gate-error"></div>
        <button id="ants-gate-go-btn">Go!</button>
        <button id="ants-gate-not-you-btn">Not ${person?.name ?? 'you'}?</button>
      </div>
    `
    const input = overlay.querySelector('#ants-gate-pin-input')
    const err = overlay.querySelector('#ants-gate-error')
    const goBtn = overlay.querySelector('#ants-gate-go-btn')
    input.focus()

    const submit = async () => {
      const pin = input.value
      if (!pin) return
      goBtn.disabled = true
      goBtn.textContent = 'Checking…'
      const { ok } = await verifyPin(id, pin)
      goBtn.disabled = false
      goBtn.textContent = 'Go!'
      if (ok) {
        resolveReady(id)
      } else {
        err.textContent = 'Wrong PIN — try again'
        input.value = ''
        input.focus()
      }
    }

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '')
      err.textContent = ''
    })
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
    goBtn.addEventListener('click', submit)
    overlay.querySelector('#ants-gate-not-you-btn').addEventListener('click', () => {
      clearStoredUser()
      signOut()
      showPicker()
    })
  }

  function resolveReady(id) {
    currentUserId = id
    overlay.style.display = 'none'
    onReady(id)
  }

  // Re-checks periodically so a lapsed idle window re-prompts mid-session,
  // not just on next launch.
  setInterval(() => {
    if (!currentUserId || !isConfigured()) return
    if (getVerifiedUser() !== currentUserId) {
      onExpire?.()
      overlay.style.display = 'flex'
      showPinForm(currentUserId)
    }
  }, RECHECK_MS)

  const stored = getStoredUser()
  if (stored && (!isConfigured() || getVerifiedUser() === stored)) {
    resolveReady(stored)
  } else if (stored) {
    showPinForm(stored)
  } else {
    showPicker()
  }

  return { getCurrentUserId: () => currentUserId }
}
