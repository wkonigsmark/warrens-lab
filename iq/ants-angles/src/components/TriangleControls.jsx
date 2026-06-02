// Preset triangles (grid coords, y points down) + snap toggle. Lets a kid jump
// straight to "show me a right triangle" the way the Angle Explorer has presets.
export const PRESETS = {
  Right: [{ x: 4, y: 9 }, { x: 4, y: 6 }, { x: 8, y: 9 }], // classic 3-4-5
  Equilateral: [{ x: 2, y: 10 }, { x: 6, y: 3.07 }, { x: 10, y: 10 }],
  Isosceles: [{ x: 2, y: 10 }, { x: 6, y: 3 }, { x: 10, y: 10 }],
  Obtuse: [{ x: 1, y: 8 }, { x: 8, y: 5 }, { x: 11, y: 8 }],
}

export const DEFAULT_TRIANGLE = [{ x: 2, y: 9 }, { x: 5, y: 3 }, { x: 10, y: 7 }]

export default function TriangleControls({ onPreset, snap, onSnapChange, showSquares, onSquaresChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4">
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Show me a…</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => onPreset(PRESETS[name])}
              className="rounded-lg py-2 text-sm font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-semibold text-gray-700">Show squares (a² + b² = c²)</span>
        <input type="checkbox" checked={showSquares} onChange={(e) => onSquaresChange(e.target.checked)} className="w-5 h-5 accent-indigo-500" />
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-semibold text-gray-700">Snap to grid</span>
        <input type="checkbox" checked={snap} onChange={(e) => onSnapChange(e.target.checked)} className="w-5 h-5 accent-indigo-500" />
      </label>
    </div>
  )
}
