// Circle figure for Quiz (color) and Worksheet (bw). `mark` highlights the
// radius, diameter, or circumference; `label` (optional) shows its measure.
const W = 300, H = 250, CX = 150, CY = 125, R = 88

export default function CircleFigure({ mark = 'radius', label = null, bw = false }) {
  const HL = bw ? '#000' : '#6366f1'
  const INK = bw ? '#000' : '#1f2937'
  const circ = mark === 'circumference'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-[320px] mx-auto">
      {/* Circle outline (highlighted when the question is about circumference) */}
      <circle cx={CX} cy={CY} r={R} fill={bw ? '#fff' : '#f8fafc'} stroke={circ ? HL : INK} strokeWidth={circ ? 5 : 2.5} />

      {/* Diameter */}
      {mark === 'diameter' && (
        <>
          <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={HL} strokeWidth="4" />
          <circle cx={CX - R} cy={CY} r="4" fill={HL} />
          <circle cx={CX + R} cy={CY} r="4" fill={HL} />
        </>
      )}

      {/* Radius */}
      {mark === 'radius' && (
        <line x1={CX} y1={CY} x2={CX + R} y2={CY} stroke={HL} strokeWidth="4" />
      )}

      {/* Center dot (not for pure circumference questions) */}
      {mark !== 'circumference' && <circle cx={CX} cy={CY} r="4.5" fill={INK} />}

      {/* Measure label */}
      {label != null && (
        <text
          x={mark === 'diameter' ? CX : (CX + R / 2)}
          y={CY - 12}
          textAnchor="middle" fontSize="18" fontWeight="bold" fill={HL}
        >
          {label}
        </text>
      )}
      {circ && (
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="bold" fill={HL}>
          ?
        </text>
      )}
    </svg>
  )
}
