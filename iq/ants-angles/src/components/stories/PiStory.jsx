import { PI_ERAS, PI_CLOSER } from '../../lib/piHistory'

// Archimedes' squeeze: a circle trapped between inside & outside polygons.
function PolygonSqueeze() {
  const cx = 110, cy = 95, R = 62, n = 8
  const poly = (radius, offset) =>
    Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + offset + (i * 2 * Math.PI) / n
      return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`
    }).join(' ')
  const Ro = R / Math.cos(Math.PI / n)
  return (
    <div className="text-center">
      <svg viewBox="0 0 220 180" className="w-full h-auto max-w-[240px] mx-auto">
        <polygon points={poly(Ro, Math.PI / n)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r={R} fill="#fff7ed" stroke="#1f2937" strokeWidth="2.5" />
        <polygon points={poly(R, 0)} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
      </svg>
      <div className="text-xs text-gray-400 mt-1">inside &amp; outside polygons squeeze π</div>
    </div>
  )
}

function SeriesViz() {
  return (
    <div className="text-center py-3">
      <div className="text-xl font-bold text-gray-800">π/4 = 1 − ⅓ + ⅕ − ⅐ + ⅑ − ⋯</div>
      <div className="text-xs text-gray-400 mt-2">an endless sum that creeps toward π</div>
    </div>
  )
}

function SymbolViz() {
  return (
    <div className="text-center py-2">
      <div className="text-6xl font-extrabold text-violet-500 leading-none">π</div>
      <div className="text-sm font-bold text-gray-600 mt-1">= 3.14159265…</div>
    </div>
  )
}

function DigitsViz() {
  return (
    <div className="text-center py-2">
      <div className="font-mono text-sm text-gray-700 break-all leading-snug">
        3.14159265358979323846264338327950288419716939937510582097…
      </div>
      <div className="text-xs text-gray-400 mt-2">…and 100,000,000,000,000+ more</div>
    </div>
  )
}

export const piStory = {
  title: 'The Story of π',
  subtitle: 'Over 4,000 years of chasing one number.',
  sections: PI_ERAS,
  closer: PI_CLOSER,
  visuals: { polygons: PolygonSqueeze, series: SeriesViz, symbol: SymbolViz, digits: DigitsViz },
}
