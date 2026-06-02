import { degreesToVector, arcBetween } from '../../lib/angles'

const palette = (bw) => ({
  KNOWN: bw ? '#000' : '#f59e0b',
  UNKNOWN: bw ? '#000' : '#6366f1',
  INK: '#1f2937',
  FILL: bw ? '#fff' : '#eef2ff',
})

// ── Angles around a point (sum = 360°) ────────────────────────────────
// `sectors`: [{ deg, label }] laid end-to-end CCW around the vertex.
export function PointFigure({ sectors, bw = false }) {
  const { KNOWN, UNKNOWN, INK } = palette(bw)
  const W = 440, H = 300, CX = 220, CY = 150, R = 110
  let cursor = 90 // start at the top for a balanced look
  const rays = []
  const arcs = []
  sectors.forEach((s, i) => {
    const a = cursor
    const b = cursor + s.deg
    const known = s.label !== '?'
    const tip = degreesToVector(a, R)
    rays.push(<line key={`r${i}`} x1={CX} y1={CY} x2={CX + tip.x} y2={CY + tip.y} stroke={INK} strokeWidth="3.5" strokeLinecap="round" />)
    const lab = degreesToVector((a + b) / 2, 66)
    arcs.push(
      <g key={`a${i}`}>
        <path d={arcBetween(CX, CY, 46 + (i % 2) * 8, a, b)} fill="none" stroke={known ? KNOWN : UNKNOWN} strokeWidth="3.5" strokeDasharray={known ? '0' : '6 5'} />
        <text x={CX + lab.x} y={CY + lab.y} textAnchor="middle" dominantBaseline="middle" fontSize={known ? 19 : 24} fontWeight="bold" fill={known ? KNOWN : UNKNOWN}>{s.label}</text>
      </g>
    )
    cursor = b
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-[460px] mx-auto">
      {rays}{arcs}
      <circle cx={CX} cy={CY} r="5" fill={INK} />
    </svg>
  )
}

// ── Vertical angles (two crossing straight lines) ─────────────────────
// `given` is the marked known angle; `variant` selects which sector the "?" is.
export function CrossFigure({ given, variant, bw = false }) {
  const { KNOWN, UNKNOWN, INK } = palette(bw)
  const W = 440, H = 280, CX = 220, CY = 140, R = 150
  const lineA = degreesToVector(0, R)     // horizontal line (0–180)
  const lineB = degreesToVector(given, R) // tilted line (given – given+180)

  const knownMid = degreesToVector(given / 2, 70)
  const targetStart = variant === 'vertical' ? 180 : given
  const targetEnd = variant === 'vertical' ? 180 + given : 180
  const targetMid = degreesToVector((targetStart + targetEnd) / 2, variant === 'vertical' ? 70 : 60)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-[460px] mx-auto">
      <line x1={CX - lineA.x} y1={CY - lineA.y} x2={CX + lineA.x} y2={CY + lineA.y} stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <line x1={CX - lineB.x} y1={CY - lineB.y} x2={CX + lineB.x} y2={CY + lineB.y} stroke={INK} strokeWidth="4" strokeLinecap="round" />

      {/* Known angle */}
      <path d={arcBetween(CX, CY, 48, 0, given)} fill="none" stroke={KNOWN} strokeWidth="3.5" />
      <text x={CX + knownMid.x} y={CY + knownMid.y} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold" fill={KNOWN}>{given}°</text>

      {/* Unknown angle */}
      <path d={arcBetween(CX, CY, 40, targetStart, targetEnd)} fill="none" stroke={UNKNOWN} strokeWidth="3.5" strokeDasharray="6 5" />
      <text x={CX + targetMid.x} y={CY + targetMid.y} textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill={UNKNOWN}>?</text>

      <circle cx={CX} cy={CY} r="5" fill={INK} />
    </svg>
  )
}

// ── Triangle (interior angles sum = 180°) ─────────────────────────────
// Constructs an exact triangle from the three angles, then scales to fit.
export function TriangleFigure({ angles, unknownIndex, bw = false }) {
  const { KNOWN, UNKNOWN, INK, FILL } = palette(bw)
  const [A, B, C] = angles.map((d) => (d * Math.PI) / 180)
  // Build in math coords with base A=(0,0) B=(1,0); C from the two base angles.
  const t = 1 / (Math.cos(A) + (Math.sin(A) * Math.cos(B)) / Math.sin(B))
  const pts = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: t * Math.cos(A), y: t * Math.sin(A) },
  ].map((p) => ({ x: p.x, y: -p.y })) // flip to screen-y

  // Fit into a padded box.
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const boxW = 320, boxH = 220, padX = 60, padY = 50
  const scale = Math.min(boxW / (maxX - minX), boxH / (maxY - minY))
  const fit = pts.map((p) => ({
    x: padX + (p.x - minX) * scale,
    y: padY + (p.y - minY) * scale,
  }))
  const cx = (fit[0].x + fit[1].x + fit[2].x) / 3
  const cy = (fit[0].y + fit[1].y + fit[2].y) / 3
  const labelPos = (p) => {
    const dx = cx - p.x, dy = cy - p.y
    const len = Math.hypot(dx, dy) || 1
    return { x: p.x + (dx / len) * 34, y: p.y + (dy / len) * 34 }
  }

  return (
    <svg viewBox="0 0 440 300" className="w-full h-auto max-w-[460px] mx-auto">
      <polygon points={fit.map((p) => `${p.x},${p.y}`).join(' ')} fill={FILL} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {fit.map((p, i) => {
        const lp = labelPos(p)
        const known = i !== unknownIndex
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={known ? 20 : 24} fontWeight="bold" fill={known ? KNOWN : UNKNOWN}>
            {known ? `${angles[i]}°` : '?'}
          </text>
        )
      })}
    </svg>
  )
}
