import { useRef } from 'react'

// A 0→1 number line split into tenths. Optionally draggable (pass `onSet`):
// clicking/dragging snaps the marker to the nearest tenth. This is the home
// base for decimals — every tenth is one step from 0 to 1.
export default function NumberLine({ value = 0, onSet, width = 520, accent = '#06b6d4', showLabels = true, marker = true }) {
  const pad = 28
  const innerW = width - pad * 2
  const height = showLabels ? 86 : 54
  const y = 28
  const dragging = useRef(false)
  const svgRef = useRef(null)
  const interactive = typeof onSet === 'function'

  const v = Math.max(0, Math.min(1, value))
  const xFor = (t) => pad + t * innerW

  const setFromClientX = (clientX) => {
    const rect = svgRef.current.getBoundingClientRect()
    const rel = ((clientX - rect.left) / rect.width) * width
    const t = Math.round(((rel - pad) / innerW) * 10) / 10
    onSet(Math.max(0, Math.min(1, t)))
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-xl no-select"
      style={{ touchAction: 'none', cursor: interactive ? 'pointer' : 'default' }}
      onPointerDown={interactive ? (e) => { dragging.current = true; setFromClientX(e.clientX); try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* no active pointer */ } } : undefined}
      onPointerMove={interactive ? (e) => { if (dragging.current) setFromClientX(e.clientX) } : undefined}
      onPointerUp={() => (dragging.current = false)}
    >
      {/* base line */}
      <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      {/* filled portion up to the value */}
      <line x1={pad} y1={y} x2={xFor(v)} y2={y} stroke={accent} strokeWidth="6" strokeLinecap="round" />

      {/* tenth ticks + labels */}
      {Array.from({ length: 11 }, (_, i) => {
        const t = i / 10
        const x = xFor(t)
        const big = i === 0 || i === 5 || i === 10
        return (
          <g key={i}>
            <line x1={x} y1={y - (big ? 11 : 7)} x2={x} y2={y + (big ? 11 : 7)} stroke="#94a3b8" strokeWidth={big ? 2.5 : 1.5} />
            {showLabels && (
              <text x={x} y={y + 30} textAnchor="middle" fontSize="12" fontWeight={big ? 800 : 600} fill={big ? '#475569' : '#94a3b8'}>
                {t.toFixed(1)}
              </text>
            )}
          </g>
        )
      })}

      {/* marker */}
      {marker && <circle cx={xFor(v)} cy={y} r="9" fill={accent} stroke="white" strokeWidth="3" />}
    </svg>
  )
}
