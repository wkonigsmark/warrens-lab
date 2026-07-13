import { motion } from 'framer-motion'

// The signature manipulative: an SVG seesaw scale.
// Left pan = constant tile + N crates of x · right pan = the total.
// The whole beam assembly rotates around the fulcrum (max ±8°), so a wrong
// guess physically tips the scale: left-down = too heavy (guess too big),
// left-up = too light (guess too small).
//
// Props:
//   scale  — { constant, xCount, total }
//   guess  — number | null (fills the crates and resolves the tilt)
//   reveal — number | null (answer shown after a double miss — crates green)

const CX = 180
const CY = 112
const HALF = 118
const MAX_DEG = 8

function Tile({ x, y, w, h, value, kind }) {
  // kind: 'num' | 'x-empty' | 'x-filled' | 'x-reveal'
  const fill   = kind === 'num' ? '#dbeafe' : kind === 'x-reveal' ? '#dcfce7' : '#fef3c7'
  const stroke = kind === 'num' ? '#3b82f6' : kind === 'x-reveal' ? '#22c55e' : '#f59e0b'
  const text   = kind === 'num' ? '#1d4ed8' : kind === 'x-reveal' ? '#15803d' : '#b45309'
  return (
    <g>
      <rect
        x={x - w / 2} y={y - h} width={w} height={h} rx={4}
        fill={fill} stroke={stroke} strokeWidth={1.8}
        strokeDasharray={kind === 'x-empty' ? '4 3' : 'none'}
      />
      <text
        x={x} y={y - h / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.min(15, w * 0.55)} fontWeight="800" fill={text}
      >
        {value}
      </text>
    </g>
  )
}

function PanContents({ cx, panY, tiles }) {
  const n = tiles.length
  const w = Math.min(34, 96 / n)
  const h = Math.min(28, w * 0.9)
  const totalW = n * w + (n - 1) * 3
  return (
    <g>
      {tiles.map((tile, i) => (
        <Tile
          key={i}
          x={cx - totalW / 2 + w / 2 + i * (w + 3)}
          y={panY - 3}
          w={w} h={h}
          value={tile.value}
          kind={tile.kind}
        />
      ))}
      {/* Pan */}
      <path
        d={`M ${cx - 42} ${panY} Q ${cx} ${panY + 16} ${cx + 42} ${panY}`}
        fill="none" stroke="#5f5e5a" strokeWidth={3} strokeLinecap="round"
      />
      <line x1={cx - 42} y1={panY} x2={cx} y2={panY - 14} stroke="#b4b2a9" strokeWidth={1.2} />
      <line x1={cx + 42} y1={panY} x2={cx} y2={panY - 14} stroke="#b4b2a9" strokeWidth={1.2} />
    </g>
  )
}

export default function BalanceScale({ scale, guess, reveal }) {
  const { constant, xCount, total } = scale
  const filled = guess ?? reveal ?? null

  const leftWeight = constant + (filled == null ? 0 : xCount * filled)
  const diff = leftWeight - total
  const tilt = filled == null
    ? -0.55 // crates empty → left side light → floats up
    : Math.max(-1, Math.min(1, diff / Math.max(3, total * 0.35)))
  const angle = tilt * MAX_DEG

  const crateKind = reveal != null ? 'x-reveal' : filled != null ? 'x-filled' : 'x-empty'
  const crateValue = filled != null ? filled : 'x?'

  const leftTiles = [
    ...(constant > 0 ? [{ value: constant, kind: 'num' }] : []),
    ...Array.from({ length: xCount }, () => ({ value: crateValue, kind: crateKind })),
  ]
  const rightTiles = [{ value: total, kind: 'num' }]

  return (
    <svg viewBox="0 0 360 178" className="w-full max-w-md mx-auto block select-none">
      {/* Base + post (static) */}
      <path d={`M ${CX - 26} 170 L ${CX + 26} 170 L ${CX + 16} 154 L ${CX - 16} 154 Z`} fill="#b4b2a9" />
      <line x1={CX} y1={CY} x2={CX} y2={154} stroke="#888780" strokeWidth={6} strokeLinecap="round" />

      {/* Rotating beam assembly */}
      <motion.g
        style={{ transformBox: 'view-box', transformOrigin: `${CX}px ${CY}px` }}
        animate={{ rotate: angle }}
        transition={{ type: 'spring', stiffness: 120, damping: 11 }}
      >
        <line x1={CX - HALF} y1={CY} x2={CX + HALF} y2={CY} stroke="#5f5e5a" strokeWidth={4.5} strokeLinecap="round" />
        {/* Hangers */}
        <line x1={CX - HALF} y1={CY} x2={CX - HALF} y2={CY + 26} stroke="#888780" strokeWidth={2} />
        <line x1={CX + HALF} y1={CY} x2={CX + HALF} y2={CY + 26} stroke="#888780" strokeWidth={2} />
        <PanContents cx={CX - HALF} panY={CY + 40} tiles={leftTiles} />
        <PanContents cx={CX + HALF} panY={CY + 40} tiles={rightTiles} />
      </motion.g>

      {/* Fulcrum pin on top */}
      <circle cx={CX} cy={CY} r={5} fill="#44403c" />
    </svg>
  )
}
