import { USERS, GUEST } from '../lib/users'

// "Who's checking in?" — the roster gate before a check-up. Mirrors the other
// /iq tools' pickers (live roster from Supabase); Guest is always available and
// PIN-free.
export default function UserPicker({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-100 flex flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <div className="text-5xl mb-2">🐜📋</div>
        <h1 className="text-3xl font-extrabold text-gray-800">Who's checking in?</h1>
        <p className="text-gray-400 mt-1 text-sm">Tap your name to start your check-up</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u.id)}
            className="flex items-center gap-3 w-full text-white font-extrabold text-lg py-4 px-5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
            style={{ backgroundColor: u.color }}
          >
            <span className="text-3xl">{u.emoji}</span>
            {u.name}
          </button>
        ))}

        <button
          onClick={() => onSelect(GUEST.id)}
          className="col-span-2 flex items-center justify-center gap-3 w-full font-bold text-lg py-4 px-8 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 bg-white/60 hover:bg-white hover:border-gray-400 active:scale-95 transition-all"
        >
          <span className="text-2xl">{GUEST.emoji}</span>
          Continue as Guest
        </button>
      </div>

      {USERS.length === 0 && (
        <p className="text-xs text-gray-400 -mt-4">
          (Roster unavailable — you can still continue as Guest.)
        </p>
      )}
    </div>
  )
}
