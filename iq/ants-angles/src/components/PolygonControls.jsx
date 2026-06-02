import { regularPolygon } from '../lib/polygons'

// Shape presets (grid coords, y points down) + the unit-square and snap toggles.
export const PRESETS = {
  Triangle: [{ x: 2, y: 10 }, { x: 6, y: 3 }, { x: 10, y: 10 }],
  Square: [{ x: 3, y: 3 }, { x: 9, y: 3 }, { x: 9, y: 9 }, { x: 3, y: 9 }],
  Rectangle: [{ x: 2, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 8 }, { x: 2, y: 8 }],
  Pentagon: regularPolygon(5, 6, 6, 4.5),
  Hexagon: regularPolygon(6, 6, 6, 4.5),
}

export const DEFAULT_POLYGON = PRESETS.Rectangle

export default function PolygonControls({ onPreset, snap, onSnapChange, showSquares, onSquaresChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4">
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Show me a…</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => onPreset(PRESETS[name].map((p) => ({ ...p })))}
              className="rounded-lg py-2 text-sm font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-semibold text-gray-700">Fill with unit squares</span>
        <input type="checkbox" checked={showSquares} onChange={(e) => onSquaresChange(e.target.checked)} className="w-5 h-5 accent-indigo-500" />
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-semibold text-gray-700">Snap to grid</span>
        <input type="checkbox" checked={snap} onChange={(e) => onSnapChange(e.target.checked)} className="w-5 h-5 accent-indigo-500" />
      </label>
    </div>
  )
}
