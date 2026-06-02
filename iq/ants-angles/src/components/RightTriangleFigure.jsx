// Right triangle with side labels (one may be "?"). Used by the Pythagorean
// quiz levels and worksheets. `a` = horizontal leg, `b` = vertical leg (drawn to
// scale); labels are passed separately so the unknown side can read "?".
const W = 280, H = 240, AX = 46, AY = 192, LEGPX = 150

export default function RightTriangleFigure({ a, b, labelA, labelB, labelC, bw = false }) {
  const HL = bw ? '#000' : '#6366f1'
  const INK = bw ? '#000' : '#1f2937'
  const scale = LEGPX / Math.max(a, b)
  const wpx = a * scale, hpx = b * scale
  const A = { x: AX, y: AY }
  const C = { x: AX + wpx, y: AY }      // end of horizontal leg
  const B = { x: AX, y: AY - hpx }      // end of vertical leg
  const m = 15

  const Lab = ({ x, y, text }) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="bold" fill={text === '?' ? HL : INK}>{text}</text>
  )

  // Hypotenuse label, nudged outward (away from the right-angle corner).
  const mid = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 }
  const ox = mid.x - A.x, oy = mid.y - A.y
  const oL = Math.hypot(ox, oy) || 1
  const hLab = { x: mid.x + (ox / oL) * 20, y: mid.y + (oy / oL) * 20 }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-[300px] mx-auto">
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill={bw ? '#fff' : '#eef2ff'} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {/* Right-angle marker at A */}
      <path d={`M ${A.x + m} ${A.y} L ${A.x + m} ${A.y - m} L ${A.x} ${A.y - m}`} fill="none" stroke={INK} strokeWidth="2" />

      <Lab x={(A.x + C.x) / 2} y={A.y + 18} text={labelA} />
      <Lab x={A.x - 16} y={(A.y + B.y) / 2} text={labelB} />
      <Lab x={hLab.x} y={hLab.y} text={labelC} />
    </svg>
  )
}
