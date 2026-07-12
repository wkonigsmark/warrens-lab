import { USERS, GUEST } from '../lib/users'

export default function UserPicker({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-indigo-100 flex flex-col items-center justify-center gap-8 px-6">
      <img
        src="/banner-ants-angles.png"
        alt="Ants & Angles"
        className="w-64 rounded-2xl shadow-lg"
      />

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">Who's playing?</h1>
        <p className="text-gray-400 mt-1 text-sm">Tap your name to start</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u.id)}
            className="flex items-center gap-4 w-full text-white font-extrabold text-2xl py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
            style={{ backgroundColor: u.color }}
          >
            <span className="text-4xl">{u.emoji}</span>
            {u.name}
          </button>
        ))}

        <button
          onClick={() => onSelect(GUEST.id)}
          className="flex items-center justify-center gap-3 w-full font-bold text-lg py-4 px-8 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 bg-white/60 hover:bg-white hover:border-gray-400 active:scale-95 transition-all"
        >
          <span className="text-2xl">{GUEST.emoji}</span>
          Play as Guest
        </button>
      </div>
    </div>
  )
}
