import { getUser } from '../lib/users'

// Full-color hero banner (matches the rest of the Ants & ___ family). Shows the
// signed-in kid + a switch link so progress is attributed to the right user.
export default function Banner({ user, onSwitchUser }) {
  const person = user ? getUser(user) : null
  return (
    <div className="no-print w-full bg-white shadow-md py-4 relative">
      {person && (
        <div className="absolute top-3 right-4 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600 bg-gray-100 rounded-full pl-2 pr-3 py-1 flex items-center gap-1.5">
            <span className="text-lg">{person.emoji}</span> {person.name}
          </span>
          {onSwitchUser && (
            <button onClick={onSwitchUser} className="text-xs font-semibold text-gray-400 underline hover:text-gray-600">
              Switch
            </button>
          )}
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4">
        <img
          src="/banner-ants-exponents.png"
          alt="Ants & Exponents — the fast way to multiply"
          className="h-36 w-auto object-contain mx-auto rounded-xl"
        />
      </div>
    </div>
  )
}
