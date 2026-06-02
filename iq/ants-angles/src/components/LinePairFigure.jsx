import { degreesToVector } from '../lib/angles'

// A straight line with a ray splitting it into two angles: a known angle and
// the unknown ("?"). Used by Quiz Level 4 (angles on a straight line = 180°).
const W = 440
const H = 240
const CX = W / 2
const CY = 150
const RAY = 120

// SVG arc path between two CCW angles (screen-y down, so sweep-flag 0).
function arcBetween(a, b, r) {
  const start = degreesToVector(a, r)
  const end = degreesToVector(b, r)
  const large = Math.abs(b - a) > 180 ? 1 : 0
  return `M ${CX + start.x} ${CY + start.y} A ${r} ${r} 0 ${large} 0 ${CX + end.x} ${CY + end.y}`
}

export default function LinePairFigure({ known, bw = false }) {
  const KNOWN = bw ? '#000' : '#f59e0b'
  const UNKNOWN = bw ? '#000' : '#6366f1'
  const INK = bw ? '#000' : '#1f2937'
  const tip = degreesToVector(known, RAY)
  const rightLabel = degreesToVector(known / 2, 74)
  const leftLabel = degreesToVector((known + 180) / 2, 60)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-[460px] mx-auto">
      {/* The straight line */}
      <line x1={20} y1={CY} x2={W - 20} y2={CY} stroke={INK} strokeWidth="4" strokeLinecap="round" />

      {/* Splitting ray */}
      <line x1={CX} y1={CY} x2={CX + tip.x} y2={CY + tip.y} stroke={INK} strokeWidth="4" strokeLinecap="round" />

      {/* Known angle (right side) */}
      <path d={arcBetween(0, known, 50)} fill="none" stroke={KNOWN} strokeWidth="3.5" />
      <text x={CX + rightLabel.x} y={CY + rightLabel.y} textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="bold" fill={KNOWN}>
        {known}°
      </text>

      {/* Unknown angle (left side) */}
      <path d={arcBetween(known, 180, 40)} fill="none" stroke={UNKNOWN} strokeWidth="3.5" strokeDasharray="6 5" />
      <text x={CX + leftLabel.x} y={CY + leftLabel.y} textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill={UNKNOWN}>
        ?
      </text>

      {/* Vertex */}
      <circle cx={CX} cy={CY} r="5" fill={INK} />
    </svg>
  )
}
