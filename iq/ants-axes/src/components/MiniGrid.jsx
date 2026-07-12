// Compact 4-quadrant coordinate grid for quiz questions.
// Renders as a square SVG that scales to its container (max 300px).

const RANGE  = 6    // -6 to 6
const CELL   = 20   // px per unit
const PAD_L  = 32   // left padding (y-axis labels)
const PAD_T  = 8    // top padding
const PAD_R  = 8    // right padding
const PAD_B  = 24   // bottom padding (x-axis labels)
const SIZE   = RANGE * 2 * CELL  // 240px grid
const SVG_W  = PAD_L + SIZE + PAD_R   // 280
const SVG_H  = PAD_T + SIZE + PAD_B   // 272

function toSvg(gx, gy) {
  return {
    x: PAD_L + (gx + RANGE) * CELL,
    y: PAD_T + (RANGE - gy) * CELL,
  }
}

export default function MiniGrid({ points = [], drawLine = false, highlightYAxis = false }) {
  const gridLeft  = PAD_L
  const gridRight = PAD_L + SIZE
  const gridTop   = PAD_T
  const gridBot   = PAD_T + SIZE

  // Grid lines
  const lines = []
  for (let i = -RANGE; i <= RANGE; i++) {
    const isAxis = i === 0
    const stroke = isAxis ? '#374151' : '#e5e7eb'
    const width  = isAxis ? 1.5 : 0.5

    const { x: vx } = toSvg(i, 0)
    const { y: hy } = toSvg(0, i)

    lines.push(
      <line key={`v${i}`} x1={vx} y1={gridTop} x2={vx} y2={gridBot}
        stroke={stroke} strokeWidth={width} />,
      <line key={`h${i}`} x1={gridLeft} y1={hy} x2={gridRight} y2={hy}
        stroke={stroke} strokeWidth={width} />
    )
  }

  // Axis labels every 2 units (skip 0)
  const labels = []
  for (let i = -RANGE; i <= RANGE; i += 2) {
    if (i === 0) continue
    const xpos = toSvg(i, 0)
    const ypos = toSvg(0, i)
    labels.push(
      <text key={`lx${i}`} x={xpos.x} y={gridBot + 14}
        textAnchor="middle" fontSize="9" fill="#9ca3af">{i}</text>,
      <text key={`ly${i}`} x={gridLeft - 4} y={ypos.y + 3}
        textAnchor="end" fontSize="9" fill="#9ca3af">{i}</text>
    )
  }

  // Axis label "0" at origin
  labels.push(
    <text key="l0" x={gridLeft - 4} y={gridBot + 14}
      textAnchor="end" fontSize="9" fill="#9ca3af">0</text>
  )

  // Extended line through two points (clipped to grid)
  let extendedLine = null
  if (drawLine && points.length >= 2) {
    const p1 = toSvg(points[0].x, points[0].y)
    const p2 = toSvg(points[1].x, points[1].y)
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const ext = 5
    extendedLine = (
      <>
        <defs>
          <clipPath id="grid-clip">
            <rect x={gridLeft} y={gridTop} width={SIZE} height={SIZE} />
          </clipPath>
        </defs>
        <line
          x1={p1.x - dx * ext} y1={p1.y - dy * ext}
          x2={p2.x + dx * ext} y2={p2.y + dy * ext}
          stroke="#818cf8" strokeWidth="1.5"
          clipPath="url(#grid-clip)"
        />
      </>
    )
  }

  // Y-axis highlight (for y-intercept questions)
  let yAxisHighlight = null
  if (highlightYAxis && points.length >= 2) {
    // Find y-intercept from first two points
    const [a, b] = points
    const slope = (b.y - a.y) / (b.x - a.x)
    const intercept = a.y - slope * a.x
    if (Math.abs(intercept) <= RANGE) {
      const { x: hx, y: hy } = toSvg(0, intercept)
      yAxisHighlight = (
        <>
          <circle cx={hx} cy={hy} r={7} fill="none" stroke="#f59e0b" strokeWidth="2" />
          <line x1={hx - 10} y1={hy} x2={hx + 10} y2={hy} stroke="#f59e0b" strokeWidth="1.5" />
          <line x1={hx} y1={hy - 10} x2={hx} y2={hy + 10} stroke="#f59e0b" strokeWidth="1.5" />
        </>
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full max-w-xs mx-auto block"
      style={{ maxHeight: '260px' }}
    >
      {/* Grid background */}
      <rect x={gridLeft} y={gridTop} width={SIZE} height={SIZE} fill="#fafafa" />

      {lines}
      {labels}
      {extendedLine}
      {yAxisHighlight}

      {/* Segment between first two points */}
      {!drawLine && points.length >= 2 && (() => {
        const p1 = toSvg(points[0].x, points[0].y)
        const p2 = toSvg(points[1].x, points[1].y)
        return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="4 3" />
      })()}

      {/* Points */}
      {points.map((pt, i) => {
        const { x, y } = toSvg(pt.x, pt.y)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill={pt.color ?? '#6366f1'}
              stroke="white" strokeWidth="1.5" />
            {pt.label && (
              <text x={x + 8} y={y - 6} fontSize="10" fill={pt.color ?? '#6366f1'}
                fontWeight="bold">{pt.label}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
