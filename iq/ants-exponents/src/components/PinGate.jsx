import { useEffect, useState } from 'react'
import { getUser } from '../lib/users'
import { isConfigured, getVerifiedUser, verifyPin } from '../../../_shared/progress/index.js'

const RECHECK_MS = 15_000

// Gates `children` behind a PIN check for `user`. Guest verifies silently (no
// PIN). Re-checks periodically so a lapsed idle timeout re-prompts mid-session.
export default function PinGate({ user, onCancel, children }) {
  const [verified, setVerified] = useState(() => !isConfigured() || getVerifiedUser() === user)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  const person = getUser(user)
  const isGuest = user === 'guest'

  useEffect(() => {
    if (verified || !isConfigured() || !isGuest) return
    verifyPin(user, '').then(({ ok }) => ok && setVerified(true))
  }, [verified, isGuest, user])

  useEffect(() => {
    if (!isConfigured()) return
    const id = setInterval(() => {
      if (getVerifiedUser() !== user) setVerified(false)
    }, RECHECK_MS)
    return () => clearInterval(id)
  }, [user])

  if (verified) return children
  if (isGuest) return null

  const submit = async (e) => {
    e.preventDefault()
    setChecking(true)
    const { ok } = await verifyPin(user, pin)
    setChecking(false)
    if (ok) setVerified(true)
    else { setError(true); setPin('') }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center px-6">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xs text-center">
        <div className="text-4xl mb-2">{person?.emoji}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Hi {person?.name}!</h2>
        <p className="text-sm text-gray-400 mb-4">Enter your PIN to continue</p>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(false) }}
          className={`w-full text-center text-2xl tracking-widest border-2 rounded-xl py-3 mb-3 outline-none ${
            error ? 'border-red-400' : 'border-gray-200 focus:border-indigo-400'
          }`}
        />
        {error && <p className="text-red-500 text-sm mb-3">Wrong PIN — try again</p>}
        <button
          type="submit"
          disabled={checking || !pin}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {checking ? 'Checking…' : 'Go!'}
        </button>
        <button type="button" onClick={onCancel} className="mt-3 text-sm text-gray-400 underline">
          Not {person?.name}?
        </button>
      </form>
    </div>
  )
}
