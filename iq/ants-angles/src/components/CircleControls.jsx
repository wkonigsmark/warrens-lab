const PRESETS = [1, 2, 3, 4, 5]

export default function CircleControls({ radius, onRadiusChange, unroll, onUnrollChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4">
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Set the radius</div>
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((r) => (
            <button
              key={r}
              onClick={() => onRadiusChange(r)}
              className={`rounded-lg py-2 text-sm font-bold transition-colors ${
                radius === r ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-semibold text-gray-700">Unroll circumference</span>
        <input type="checkbox" checked={unroll} onChange={(e) => onUnrollChange(e.target.checked)} className="w-5 h-5 accent-indigo-500" />
      </label>
    </div>
  )
}
