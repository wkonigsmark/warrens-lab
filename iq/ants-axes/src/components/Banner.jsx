import { getUser } from '../lib/users'

export default function Banner({ user, onSwitchUser }) {
  const userObj = getUser(user)
  return (
    <div className="w-full bg-white shadow-sm py-3 px-4 no-print">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        {userObj ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{userObj.emoji}</span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-700">{userObj.name}</p>
              <button onClick={onSwitchUser}
                className="text-xs text-gray-400 hover:text-gray-600 underline">
                switch user
              </button>
            </div>
          </div>
        ) : <div />}

        <img
          src="/banner-ants-axes.png"
          alt="Ants & Axes"
          className="h-16 object-contain"
          onError={(e) => {
            e.currentTarget.replaceWith(Object.assign(document.createElement('span'), {
              className: 'text-xl font-extrabold text-indigo-700',
              textContent: 'Ants & Axes',
            }))
          }}
        />

        <div className="text-right">
          <a href="?admin" className="text-xs text-gray-300 hover:text-gray-500">Admin</a>
        </div>
      </div>
    </div>
  )
}
