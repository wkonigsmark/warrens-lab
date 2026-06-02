import { PI } from '../lib/circles'

// Shows the circumference "unrolled" into a straight strip, marked off in
// diameter-lengths: it always takes ~3.14 of them. A scale-free proof of π.
const W = 480
const H = 100
const X0 = 22
const BAR = 416
const BAR_Y = 40
const BAR_H = 20

export default function UnrollStrip({ radius }) {
  const seg = BAR / PI // one diameter as a fraction of the circumference bar
  const fulls = Math.floor(PI) // 3 whole diameters
  const leftover = PI - fulls // ~0.14
  const ticks = []
  for (let k = 1; k <= fulls; k++) ticks.push(k * seg)
  const lastStart = X0 + fulls * seg
  const lastCenter = X0 + (fulls + leftover / 2) * seg

  return (
    <div className="mt-4 bg-indigo-50 rounded-xl p-4">
      <div className="text-sm font-bold text-gray-700 mb-1">Unroll the circumference…</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* The circumference bar */}
        <rect x={X0} y={BAR_Y} width={BAR} height={BAR_H} rx="4" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        {/* Emphasize the leftover 0.14 sliver */}
        <rect x={lastStart} y={BAR_Y} width={X0 + BAR - lastStart} height={BAR_H} fill="#818cf8" />

        {/* Diameter segments */}
        {[0, ...ticks, BAR].map((x, i) => (
          <line key={i} x1={X0 + x} y1={BAR_Y - 6} x2={X0 + x} y2={BAR_Y + BAR_H + 6} stroke="#4f46e5" strokeWidth="2" />
        ))}

        {/* Three full "d" labels inside their wide segments */}
        {[...Array(fulls)].map((_, i) => (
          <text key={i} x={X0 + (i + 0.5) * seg} y={BAR_Y + BAR_H / 2} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="bold" fill="#3730a3">d</text>
        ))}

        {/* Leftover 0.14 label, lifted above the narrow sliver with a connector */}
        <line x1={lastCenter} y1={20} x2={lastCenter} y2={BAR_Y - 6} stroke="#6366f1" strokeWidth="1.5" />
        <text x={lastCenter} y={13} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#3730a3">0.14</text>

        <text x={W / 2} y={90} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4338ca">
          Circumference = π × diameter ≈ 3.14 diameters
        </text>
      </svg>
    </div>
  )
}
