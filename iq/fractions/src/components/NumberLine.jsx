// A 0–1 number line cut into `den` equal steps — a second way to "see" a
// fraction beyond pies/bars. Tap a tick (or anywhere along the line) to move
// the marker; `marker` is the step index 0..den.
export default function NumberLine({ den = 4, marker = 0, onMark, width = 480, bw = false }) {
  const pad = 28
  const innerW = width - pad * 2
  const y = 48
  const ink = bw ? '#000000' : '#b45309'
  const dot = bw ? '#cbd5e1' : '#fbbf24'
  const x = (i) => pad + (i / den) * innerW
  const interactive = typeof onMark === 'function'
  const step = innerW / den

  return (
    <svg viewBox={`0 0 ${width} 96`} width={width} className="max-w-full h-auto">
      {/* main line */}
      <line x1={pad} y1={y} x2={width - pad} y2={y} stroke={ink} strokeWidth="3" />

      {/* ticks + the 0 and 1 labels */}
      {Array.from({ length: den + 1 }).map((_, i) => {
        const big = i === 0 || i === den
        return (
          <g key={i}>
            <line x1={x(i)} y1={y - (big ? 14 : 9)} x2={x(i)} y2={y + (big ? 14 : 9)} stroke={ink} strokeWidth={big ? 3 : 2} />
            {big && (
              <text x={x(i)} y={y + 34} textAnchor="middle" fontSize="18" fontWeight="700" fill={bw ? '#000' : '#374151'}>
                {i === 0 ? '0' : '1'}
              </text>
            )}
          </g>
        )
      })}

      {/* wide transparent tap targets over each tick */}
      {interactive &&
        Array.from({ length: den + 1 }).map((_, i) => (
          <rect key={`h${i}`} x={x(i) - step / 2} y={y - 22} width={step} height={44} fill="transparent" onClick={() => onMark(i)} style={{ cursor: 'pointer' }} />
        ))}

      {/* marker (pointer-events off so taps reach the targets underneath) */}
      <circle cx={x(marker)} cy={y} r="9" fill={dot} stroke={ink} strokeWidth="3" style={{ pointerEvents: 'none' }} />
    </svg>
  )
}
