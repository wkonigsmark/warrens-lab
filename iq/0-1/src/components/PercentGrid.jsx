// A 10×10 grid of 100 little squares — the whole picture for "out of 100".
// `value` (0–100) squares are filled, the rest are empty. Filling reads
// left-to-right, top-to-bottom, so it grows like a loading bar.
//
// If `onSet` is given, clicking/dragging a square fills up to that square,
// which makes the whole thing feel like a fun thing to poke at.
//
// `bw` draws a print-friendly black-and-white version (gray fill, white empty,
// crisp gridlines, no shadow) for the worksheets.
import { useRef } from 'react'

export default function PercentGrid({ value = 0, size = 280, onSet, bw = false }) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  const dragging = useRef(false)
  const cell = size / 10
  const interactive = typeof onSet === 'function'

  // Square index 0..99 → the count that should be filled when you tap it.
  const fillTo = (i) => onSet(i + 1 === v ? i : i + 1)

  return (
    <div
      className={`no-select inline-grid rounded-2xl overflow-hidden ${bw ? '' : 'shadow-md'}`}
      style={{
        gridTemplateColumns: `repeat(10, ${cell}px)`,
        gridTemplateRows: `repeat(10, ${cell}px)`,
        background: bw ? '#6b7280' : '#e2e8f0',
        gap: bw ? 1 : 2,
        padding: bw ? 1 : 2,
        cursor: interactive ? 'pointer' : 'default',
        touchAction: 'none',
      }}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
    >
      {Array.from({ length: 100 }, (_, i) => {
        const filled = i < v
        const fill = bw ? (filled ? '#374151' : '#ffffff') : filled ? '#06b6d4' : '#f8fafc'
        return (
          <div
            key={i}
            onMouseDown={interactive ? () => { dragging.current = true; fillTo(i) } : undefined}
            onMouseEnter={interactive ? () => { if (dragging.current) fillTo(i) } : undefined}
            style={{
              width: cell,
              height: cell,
              borderRadius: bw ? 0 : Math.max(2, cell * 0.14),
              background: fill,
              transition: bw ? 'none' : 'background 120ms ease',
            }}
          />
        )
      })}
    </div>
  )
}
