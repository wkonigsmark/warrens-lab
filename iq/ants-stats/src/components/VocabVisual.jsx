import { mean, median, modeValue } from '../lib/vocab'

// Draws a word's dotplot with ONE pulsing visual cue — no text labels, so the
// picture itself (not a caption) teaches the association. Deliberately big and
// simple. `size` scales the whole thing for cards vs. quiz option tiles.
export default function VocabVisual({ term, size = 'md' }) {
  const W = 300
  const values = term.values
  const min = Math.min(...values)
  const max = Math.max(...values)
  const counts = {}
  values.forEach((v) => (counts[v] = (counts[v] || 0) + 1))
  const maxStack = Math.max(...Object.values(counts))

  const padL = 26, padR = 26, dot = 11, gap = 3, topPad = 26
  const plotW = W - padL - padR
  const x = (v) => (max === min ? padL + plotW / 2 : padL + ((v - min) / (max - min)) * plotW)
  const baseY = topPad + maxStack * (dot + gap)
  const bottomPad = 30
  const H = baseY + bottomPad
  const c = term.color

  // A dot's screen position (i = 0 is the bottom of its stack).
  const dotY = (i) => baseY - i * (dot + gap)

  // Which dots get the accent color for this viz.
  const tailThreshold = term.viz === 'skew' ? [...new Set(values)].sort((a, b) => a - b).slice(-2) : []
  const outlierVal = term.viz === 'outlier' ? max : null
  const dataHighlight = term.viz === 'data' ? { v: values[values.length - 2], i: 0 } : null

  const dots = []
  Object.entries(counts).forEach(([vStr, count]) => {
    const v = +vStr
    for (let i = 0; i < count; i++) {
      let fill = '#cbd5e1', pulse = false
      if (term.viz === 'skew' && tailThreshold.includes(v)) { fill = c; pulse = true }
      else if (term.viz === 'outlier' && v === outlierVal) { fill = c; pulse = true }
      else if (term.viz === 'data' && v === dataHighlight.v && i === dataHighlight.i) { fill = c; pulse = true }
      else if (term.viz === 'peak' && count === maxStack) { fill = c }
      dots.push(
        <circle key={`${v}-${i}`} cx={x(v)} cy={dotY(i)} r={dot / 2} fill={fill}
          className={pulse ? 'vocab-pulse' : ''} />
      )
    }
  })

  const overlay = () => {
    switch (term.viz) {
      case 'distribution': {
        const pts = Object.entries(counts).map(([v, n]) => `${x(+v)},${baseY - (n - 0.4) * (dot + gap)}`)
        return (
          <>
            <rect x={padL - 14} y={topPad - 12} width={plotW + 28} height={baseY - topPad + 22}
              rx="14" fill="none" stroke={c} strokeWidth="2.5" className="vocab-pulse-soft" opacity="0.8" />
            <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" opacity="0.35" />
          </>
        )
      }
      case 'peak': {
        const peakV = modeValue(values)
        return <rect x={x(peakV) - dot} y={dotY(maxStack - 1) - dot} width={dot * 2} height={maxStack * (dot + gap) + dot}
          rx="8" fill={c} opacity="0.16" className="vocab-pulse-soft" />
      }
      case 'mean': {
        const m = mean(values)
        return (
          <>
            <rect x={padL - 10} y={baseY + 7} width={plotW + 20} height="4" rx="2" fill="#94a3b8" />
            <polygon points={`${x(m)},${baseY + 6} ${x(m) - 12},${baseY + 24} ${x(m) + 12},${baseY + 24}`}
              fill={c} className="vocab-pulse" />
          </>
        )
      }
      case 'median': {
        const md = median(values)
        return (
          <>
            <line x1={x(md)} y1={topPad - 10} x2={x(md)} y2={baseY + 10} stroke={c} strokeWidth="3"
              strokeDasharray="5 4" className="vocab-pulse-soft" />
            <circle cx={x(md)} cy={dotY(0)} r={dot / 2 + 5} fill="none" stroke={c} strokeWidth="3" className="vocab-pulse" />
          </>
        )
      }
      case 'skew': {
        const tailX = x(max)
        return <g className="vocab-pulse">
          <line x1={x(median(values))} y1={topPad - 4} x2={tailX + 8} y2={topPad - 4} stroke={c} strokeWidth="3" />
          <polygon points={`${tailX + 16},${topPad - 4} ${tailX + 4},${topPad - 10} ${tailX + 4},${topPad + 2}`} fill={c} />
        </g>
      }
      case 'outlier': {
        return (
          <>
            <circle cx={x(max)} cy={dotY(0)} r={dot / 2 + 6} fill="none" stroke={c} strokeWidth="3" className="vocab-pulse" />
            <line x1={x(max) - 22} y1={baseY + 14} x2={x(max) - 6} y2={baseY + 14} stroke={c} strokeWidth="2.5" strokeDasharray="3 3" />
          </>
        )
      }
      case 'spread': {
        const y = baseY + 15
        return <g className="vocab-pulse-soft">
          <line x1={x(min)} y1={y} x2={x(max)} y2={y} stroke={c} strokeWidth="3" />
          <polygon points={`${x(min)},${y} ${x(min) + 10},${y - 6} ${x(min) + 10},${y + 6}`} fill={c} />
          <polygon points={`${x(max)},${y} ${x(max) - 10},${y - 6} ${x(max) - 10},${y + 6}`} fill={c} />
        </g>
      }
      case 'data': {
        const d = dataHighlight
        return <circle cx={x(d.v)} cy={dotY(d.i)} r={dot / 2 + 5} fill="none" stroke={c} strokeWidth="3" className="vocab-pulse" />
      }
      default: return null
    }
  }

  const cls = size === 'sm' ? 'w-full max-w-[150px]' : 'w-full max-w-[300px]'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`${cls} mx-auto`} role="img" aria-label={term.word}>
      <line x1={padL - 12} y1={baseY + 5} x2={W - padR + 12} y2={baseY + 5} stroke="#e2e8f0" strokeWidth="2" />
      {term.viz === 'distribution' && overlay()}
      {dots}
      {term.viz !== 'distribution' && overlay()}
    </svg>
  )
}
