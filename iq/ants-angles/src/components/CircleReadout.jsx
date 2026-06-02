import { diameter, circumference, area } from '../lib/circles'

// Live circle measures + the headline idea: C ÷ d is always π (≈ 3.14).
export default function CircleReadout({ radius }) {
  const d = diameter(radius)
  const C = circumference(radius)
  const A = area(radius)

  return (
    <div className="flex flex-col gap-4">
      {/* π headline */}
      <div className="rounded-2xl p-4 text-white text-center shadow bg-indigo-500">
        <div className="text-xs uppercase tracking-wide opacity-80 font-semibold">The big idea</div>
        <div className="text-2xl font-extrabold mt-1">C ÷ d = π ≈ 3.14</div>
        <div className="text-xs opacity-80 mt-1">Every circle, no matter the size!</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Radius" value={radius} hint="center → edge" accent="#6366f1" />
        <Stat label="Diameter" value={d} hint="= 2 × radius" accent="#6366f1" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4">
        <Row label="Circumference" formula="2 × π × r" value={C.toFixed(1)} />
        <div className="h-px bg-gray-100 my-3" />
        <Row label="Area" formula="π × r × r" value={A.toFixed(1)} unit="sq units" />
      </div>
    </div>
  )
}

function Stat({ label, value, hint, accent }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent || '#1f2937' }}>{value}</div>
      <div className="text-xs text-gray-400">{hint}</div>
    </div>
  )
}

function Row({ label, formula, value, unit = 'units' }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-gray-700">{label}</div>
        <div className="text-xs text-gray-400">{formula}</div>
      </div>
      <div className="text-2xl font-extrabold text-indigo-600">
        {value}<span className="text-sm text-gray-400 font-bold"> {unit}</span>
      </div>
    </div>
  )
}
