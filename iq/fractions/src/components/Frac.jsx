// A tiny inline stacked fraction for buttons and sentences, so the quiz matches
// the stacked notation taught in the lessons. Accepts num/den, a "n/d" string
// (e.g. "2/4"), or a mixed number string (e.g. "1 3/4"). Falls back to plain
// text if it isn't a fraction.
export default function Frac({ value, num, den, className = '' }) {
  if (value != null) {
    const s = String(value).trim()

    // Mixed number, e.g. "1 3/4" → whole number + small stacked fraction.
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (mixed) {
      return (
        <span className={`inline-flex items-center gap-1.5 align-middle ${className}`}>
          <span className="font-black">{mixed[1]}</span>
          <Stacked num={mixed[2]} den={mixed[3]} />
        </span>
      )
    }

    if (s.includes('/')) {
      const [a, b] = s.split('/')
      num = a.trim()
      den = b.trim()
    } else {
      return <span className={className}>{s}</span>
    }
  }

  return <Stacked num={num} den={den} className={className} />
}

function Stacked({ num, den, className = '' }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none align-middle ${className}`}>
      <span className="px-1">{num}</span>
      <span className="block w-full h-[2px] bg-current my-0.5" />
      <span className="px-1">{den}</span>
    </span>
  )
}
