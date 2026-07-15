import { getUser } from '../lib/users'

export default function Banner({ user, onSwitchUser }) {
  const userObj = getUser(user)
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{userObj?.emoji}</span>
          <div>
            <div className="font-bold text-gray-800 text-sm leading-tight">{userObj?.name}</div>
            <button onClick={onSwitchUser} className="text-xs text-gray-400 hover:text-gray-600 underline">
              switch user
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-extrabold text-gray-700">
          <span className="text-xl">📊</span>
          <span className="hidden sm:inline">Ants &amp; Statistics</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-300 font-semibold">AP Stats prep</div>
          <a href="/?admin" className="text-[10px] text-gray-300 hover:text-gray-500">📊 Admin</a>
        </div>
      </div>
    </div>
  )
}
