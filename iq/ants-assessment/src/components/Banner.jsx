import { getUser } from '../lib/users'

// Text hero for the assessment hub. Shows who's signed in (with a switch link)
// so results get attributed to the right kid.
export default function Banner({ user, onSwitchUser }) {
  const person = user ? getUser(user) : null
  return (
    <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-md py-7 relative">
      {person && (
        <div className="absolute top-3 right-4 flex items-center gap-2 text-white">
          <span className="text-sm font-bold bg-white/20 rounded-full pl-2 pr-3 py-1 flex items-center gap-1.5">
            <span className="text-lg">{person.emoji}</span> {person.name}
          </span>
          {onSwitchUser && (
            <button onClick={onSwitchUser} className="text-xs font-semibold text-white/80 underline hover:text-white">
              Switch
            </button>
          )}
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 text-center text-white">
        <div className="text-4xl sm:text-5xl font-black tracking-tight">
          Ants &amp; Assessment <span className="opacity-80">🐜📋</span>
        </div>
        <p className="mt-1 text-sm sm:text-base font-semibold text-white/90">
          A friendly check-up — let's see what you've got! 🌟
        </p>
      </div>
    </div>
  )
}
