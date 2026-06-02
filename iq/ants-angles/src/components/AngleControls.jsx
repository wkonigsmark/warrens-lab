// Controls for the Explore playground: nudge the angle, jump to landmarks,
// and toggle snapping. Designed so a young kid can poke buttons while an older
// kid types exact values.
const PRESETS = [30, 45, 60, 90, 120, 135, 180, 270]

export default function AngleControls({ angle, onAngleChange, snap, onSnapChange }) {
  const set = (d) => onAngleChange(((d % 360) + 360) % 360)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-5">
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Nudge the angle</div>
        <div className="flex items-center gap-2">
          <button onClick={() => set(Math.round(angle) - (snap || 1))} className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 text-xl font-bold">−</button>
          <input
            type="number"
            value={Math.round(angle)}
            onChange={(e) => set(Number(e.target.value) || 0)}
            className="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-1.5"
          />
          <span className="text-xl font-bold text-gray-400">°</span>
          <button onClick={() => set(Math.round(angle) + (snap || 1))} className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 text-xl font-bold">+</button>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Jump to</div>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => set(d)}
              className={`rounded-lg py-2 text-sm font-bold transition-colors ${
                Math.round(angle) === d
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              {d}°
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-semibold text-gray-700">Snap to 5°</span>
        <input
          type="checkbox"
          checked={snap === 5}
          onChange={(e) => onSnapChange(e.target.checked ? 5 : 0)}
          className="w-5 h-5 accent-indigo-500"
        />
      </label>
    </div>
  )
}
