// Lightweight inline SVG charts for question prompts — dotplots, histograms,
// boxplots and scatterplots. Deliberately clean and small: this game leans on
// reading and reasoning, so the graphics are supporting evidence, not toys.

const AXIS = '#cbd5e1'
const INK = '#334155'

function niceTicks(lo, hi, n = 5) {
  const step = Math.max(1, Math.ceil((hi - lo) / n))
  const ticks = []
  for (let v = Math.floor(lo); v <= Math.ceil(hi); v += step) ticks.push(v)
  return ticks
}

// ── Dotplot ──────────────────────────────────────────────────────────────────
function Dotplot({ values, unit, color = '#0ea5e9', width = 360, domainMin, domainMax }) {
  const min = domainMin ?? Math.min(...values)
  const max = domainMax ?? Math.max(...values)
  const counts = {}
  values.forEach((v) => { counts[v] = (counts[v] || 0) + 1 })
  const maxStack = Math.max(...Object.values(counts))
  const padL = 24, padR = 16, padB = 34, dot = 9, gap = 2
  const plotW = width - padL - padR
  const x = (v) => (max === min ? padL + plotW / 2 : padL + ((v - min) / (max - min)) * plotW)
  const baseY = 12 + maxStack * (dot + gap)
  const height = baseY + padB

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto" role="img">
      <line x1={padL - 8} y1={baseY + 6} x2={width - padR + 4} y2={baseY + 6} stroke={AXIS} strokeWidth="1.5" />
      {Object.entries(counts).map(([v, c]) =>
        Array.from({ length: c }, (_, i) => (
          <circle key={`${v}-${i}`} cx={x(+v)} cy={baseY - i * (dot + gap)} r={dot / 2} fill={color} opacity="0.9" />
        ))
      )}
      {niceTicks(min, max).map((t) => (
        <text key={t} x={x(t)} y={baseY + 22} textAnchor="middle" fontSize="11" fill={INK}>{t}</text>
      ))}
      {unit && <text x={width / 2} y={height - 2} textAnchor="middle" fontSize="10" fill="#94a3b8">{unit}</text>}
    </svg>
  )
}

function DotplotGroups({ groups, unit }) {
  const all = groups.flatMap((g) => g.values)
  const min = Math.min(...all), max = Math.max(...all)
  return (
    <div className="flex flex-col gap-1">
      {groups.map((g, i) => (
        <div key={i}>
          <div className="text-xs font-semibold text-gray-500 mb-0.5">{g.label}</div>
          <Dotplot values={g.values} domainMin={min} domainMax={max}
            unit={i === groups.length - 1 ? unit : null}
            color={i === 0 ? '#0ea5e9' : '#8b5cf6'} />
        </div>
      ))}
    </div>
  )
}

// ── Histogram ────────────────────────────────────────────────────────────────
function Histogram({ bins, color = '#8b5cf6', width = 360 }) {
  const maxCount = Math.max(...bins.map((b) => b.count))
  const padL = 24, padR = 16, padB = 30, padT = 10
  const plotW = width - padL - padR
  const barGap = 3
  const barW = plotW / bins.length - barGap
  const plotH = 120
  const height = plotH + padB + padT

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto" role="img">
      <line x1={padL - 4} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke={AXIS} strokeWidth="1.5" />
      {bins.map((b, i) => {
        const h = maxCount ? (b.count / maxCount) * plotH : 0
        const bx = padL + i * (barW + barGap)
        return (
          <g key={i}>
            <rect x={bx} y={padT + plotH - h} width={barW} height={h} rx="2" fill={color} opacity="0.85" />
            <text x={bx + barW / 2} y={padT + plotH + 16} textAnchor="middle" fontSize="11" fill={INK}>{b.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Boxplot(s) ───────────────────────────────────────────────────────────────
function Boxes({ boxes, width = 360 }) {
  const all = boxes.flatMap((b) => [b.min, b.max])
  const lo = Math.min(...all), hi = Math.max(...all)
  const pad = (hi - lo) * 0.08 || 1
  const dLo = lo - pad, dHi = hi + pad
  const padL = 20, padR = 16, padB = 26
  const plotW = width - padL - padR
  const x = (v) => padL + ((v - dLo) / (dHi - dLo)) * plotW
  const rowH = 52
  const height = boxes.length * rowH + padB
  const colors = ['#0ea5e9', '#8b5cf6']

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto" role="img">
      {boxes.map((b, i) => {
        const cy = i * rowH + rowH / 2 - 6
        const c = colors[i % colors.length]
        return (
          <g key={i}>
            {b.label && <text x={padL} y={i * rowH + 12} fontSize="11" fontWeight="600" fill={INK}>{b.label}</text>}
            <line x1={x(b.min)} y1={cy} x2={x(b.q1)} y2={cy} stroke={c} strokeWidth="1.5" />
            <line x1={x(b.q3)} y1={cy} x2={x(b.max)} y2={cy} stroke={c} strokeWidth="1.5" />
            <line x1={x(b.min)} y1={cy - 7} x2={x(b.min)} y2={cy + 7} stroke={c} strokeWidth="1.5" />
            <line x1={x(b.max)} y1={cy - 7} x2={x(b.max)} y2={cy + 7} stroke={c} strokeWidth="1.5" />
            <rect x={x(b.q1)} y={cy - 12} width={x(b.q3) - x(b.q1)} height={24} rx="2" fill={c} opacity="0.18" stroke={c} strokeWidth="1.5" />
            <line x1={x(b.median)} y1={cy - 12} x2={x(b.median)} y2={cy + 12} stroke={c} strokeWidth="2.5" />
          </g>
        )
      })}
      <line x1={padL} y1={height - 18} x2={width - padR} y2={height - 18} stroke={AXIS} strokeWidth="1" />
      {niceTicks(lo, hi).map((t) => (
        <text key={t} x={x(t)} y={height - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">{t}</text>
      ))}
    </svg>
  )
}

// ── Scatter ──────────────────────────────────────────────────────────────────
function Scatter({ points, color = '#f59e0b', width = 340 }) {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1])
  const xLo = Math.min(...xs), xHi = Math.max(...xs)
  const yLo = Math.min(...ys), yHi = Math.max(...ys)
  const padL = 26, padR = 12, padT = 10, padB = 24
  const plotW = width - padL - padR, plotH = 150
  const height = plotH + padT + padB
  const sx = (v) => padL + (xHi === xLo ? 0.5 : (v - xLo) / (xHi - xLo)) * plotW
  const sy = (v) => padT + plotH - (yHi === yLo ? 0.5 : (v - yLo) / (yHi - yLo)) * plotH

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto" role="img">
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={AXIS} strokeWidth="1.5" />
      <line x1={padL} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke={AXIS} strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="4" fill={color} opacity="0.85" />
      ))}
      <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">x</text>
      <text x={8} y={padT + plotH / 2} textAnchor="middle" fontSize="10" fill="#94a3b8" transform={`rotate(-90 8 ${padT + plotH / 2})`}>y</text>
    </svg>
  )
}

export default function MiniChart({ spec }) {
  if (!spec) return null
  return (
    <div className="my-3 bg-slate-50 rounded-xl py-3 px-2 border border-slate-100">
      {spec.type === 'dotplot' && <Dotplot values={spec.values} unit={spec.unit} />}
      {spec.type === 'dotplots' && <DotplotGroups groups={spec.groups} unit={spec.unit} />}
      {spec.type === 'histogram' && <Histogram bins={spec.bins} />}
      {spec.type === 'boxplot' && <Boxes boxes={[spec]} />}
      {spec.type === 'boxplots' && <Boxes boxes={spec.groups} />}
      {spec.type === 'scatter' && <Scatter points={spec.points} />}
    </div>
  )
}
