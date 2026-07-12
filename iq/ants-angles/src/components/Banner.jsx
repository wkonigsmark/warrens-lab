import { useState, useEffect } from 'react'
import { initMusic, setMusic } from '../lib/sound'
import { getUser } from '../lib/users'

export default function Banner({ user, onSwitchUser }) {
  const [musicOn, setMusicOn] = useState(false)
  const userObj = user ? getUser(user) : null

  useEffect(() => { initMusic() }, [])

  const toggleMusic = () => {
    const next = !musicOn
    setMusicOn(next)
    setMusic(next)
  }

  return (
    <div className="no-print w-full bg-white shadow-md py-4">
      <div className="max-w-3xl mx-auto px-4 relative flex items-center justify-center">
        {/* Switch user — left side */}
        {userObj && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xl">{userObj.emoji}</span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-gray-700">{userObj.name}</div>
              <button
                onClick={onSwitchUser}
                className="text-[11px] text-gray-400 hover:text-indigo-500 transition-colors"
              >
                switch user
              </button>
            </div>
          </div>
        )}

        <img
          src="/banner-ants-angles.png"
          alt="Ants & Angles — explore shapes, angles & the geometry of turning"
          className="h-36 w-auto object-contain rounded-xl"
        />

        {/* Music toggle + admin link — right side */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1.5">
          <button
            onClick={toggleMusic}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              musicOn
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {musicOn ? '🎵 Music: On' : '🎵 Music: Off'}
          </button>
          <a
            href="/?admin"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-gray-400 hover:text-indigo-500 transition-colors"
          >
            📊 Admin
          </a>
        </div>
      </div>
    </div>
  )
}
