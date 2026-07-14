import { getUser } from '../lib/users'

// Full-color hero banner (matches the rest of the Ants & ___ family).
export default function Banner({ user, onSwitchUser }) {
  const userObj = user ? getUser(user) : null

  return (
    <div className="no-print w-full bg-white shadow-md py-4">
      <div className="max-w-4xl mx-auto px-4 relative flex items-center justify-center">
        {userObj && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xl">{userObj.emoji}</span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-gray-700">{userObj.name}</div>
              <button
                onClick={onSwitchUser}
                className="text-[11px] text-gray-400 hover:text-amber-600 transition-colors"
              >
                switch user
              </button>
            </div>
          </div>
        )}

        <img
          src="/banner-fractions.png"
          alt="Ants & Fractions — pies, pizzas and pieces of a whole"
          className="h-44 w-auto object-contain mx-auto rounded-2xl shadow-sm"
        />
      </div>
    </div>
  )
}
