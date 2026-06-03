// A tiny inline stacked fraction for buttons and sentences, so the quiz matches
// the stacked notation taught in the lessons. Accepts num/den, or a "n/d"
// string (e.g. "2/4"). Falls back to plain text if it isn't a fraction.
export default function Frac({ value, num, den, className = '' }) {
  if (value != null) {
    const s = String(value)
    if (s.includes('/')) {
      const [a, b] = s.split('/')
      num = a.trim()
      den = b.trim()
    } else {
      return <span className={className}>{s}</span>
    }
  }

  return (
    <span className={`inline-flex flex-col items-center leading-none align-middle ${className}`}>
      <span className="px-1">{num}</span>
      <span className="block w-full h-[2px] bg-current my-0.5" />
      <span className="px-1">{den}</span>
    </span>
  )
}
