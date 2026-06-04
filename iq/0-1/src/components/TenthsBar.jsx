// A bar split into 10 equal pieces — fill the first `value*10` of them. This is
// the "tenths" picture: 0.3 = 3 out of 10 pieces filled. (It's literally one row
// of the 100-square percent grid.)
export default function TenthsBar({ value = 0, width = 420 }) {
  const k = Math.max(0, Math.min(10, Math.round(value * 10)))
  const cell = width / 10
  return (
    <div
      className="no-select inline-grid rounded-xl overflow-hidden shadow-md"
      style={{ gridTemplateColumns: `repeat(10, ${cell}px)`, background: '#e2e8f0', gap: 2, padding: 2 }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{ height: cell, background: i < k ? '#06b6d4' : '#f8fafc', transition: 'background 120ms ease' }}
        />
      ))}
    </div>
  )
}
