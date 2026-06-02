// ── Visuals ────────────────────────────────────────────────────────────
function Base60() {
  return (
    <div className="text-center">
      <div className="inline-grid grid-cols-12 gap-1">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-2">60 — counted on 12 finger-knuckles × 5 fingers</div>
    </div>
  )
}

const DIV360 = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180, 360]
function Divisors() {
  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-1">
        {DIV360.map((d) => (
          <span key={d} className="text-xs font-bold bg-violet-100 text-violet-700 rounded px-1.5 py-0.5">{d}</span>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-2">360 divides evenly by all 24 of these. A "rounder" 100 has only 9.</div>
    </div>
  )
}

function SunYear() {
  const cx = 110, cy = 100, R = 66
  return (
    <div className="text-center">
      <svg viewBox="0 0 220 200" className="w-full h-auto max-w-[260px] mx-auto">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="2 7" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 36
          return <line key={i} x1={cx + (R - 4) * Math.cos(a)} y1={cy + (R - 4) * Math.sin(a)} x2={cx + (R + 4) * Math.cos(a)} y2={cy + (R + 4) * Math.sin(a)} stroke="#bae6fd" strokeWidth="1.5" />
        })}
        <circle cx={cx} cy={cy - R} r="8" fill="#f59e0b" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="bold" fill="#0ea5e9">~1° / day</text>
      </svg>
      <div className="text-xs text-gray-400 mt-1">the sun steps about 1° a day — roughly 360 days to circle the sky</div>
    </div>
  )
}

function Protractor() {
  const cx = 110, cy = 118, R = 84
  const arc = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`
  return (
    <div className="text-center">
      <svg viewBox="0 0 220 160" className="w-full h-auto max-w-[280px] mx-auto">
        <path d={arc} fill="#eef2ff" stroke="#6366f1" strokeWidth="2" />
        {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
          const a = Math.PI - (deg * Math.PI) / 180
          const isEnd = deg === 0 || deg === 180
          const lx = cx + (R - (isEnd ? 12 : 20)) * Math.cos(a)
          const ly = isEnd ? cy + 15 : cy - (R - 20) * Math.sin(a)
          return (
            <g key={deg}>
              <line x1={cx + (R - 7) * Math.cos(a)} y1={cy - (R - 7) * Math.sin(a)} x2={cx + R * Math.cos(a)} y2={cy - R * Math.sin(a)} stroke="#6366f1" strokeWidth="1.5" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#6366f1">{deg}</text>
            </g>
          )
        })}
      </svg>
      <div className="text-xs text-gray-400 mt-1">still printed on every protractor today</div>
    </div>
  )
}

export const degreesStory = {
  title: 'Why 360°?',
  subtitle: 'How a full turn ended up with 360 degrees.',
  visuals: { base60: Base60, divisors: Divisors, sunYear: SunYear, protractor: Protractor },
  sections: [
    {
      title: 'The Babylonians', tag: '~3000 BCE', color: '#f59e0b',
      entries: [
        {
          tag: 'Base 60', title: 'Counting in sixties', badge: '60',
          text: 'The Babylonians counted in base 60, not base 10. They tallied the 12 knuckles on one hand with the 5 fingers of the other to reach 60 — which is why we still split an hour into 60 minutes and a minute into 60 seconds.',
          visual: 'base60',
        },
        {
          tag: '6 × 60', title: 'A circle of sixties', badge: '360°',
          text: 'When they divided up a circle, six groups of sixty gave a natural 360 — a number already baked into the way they counted everything.',
        },
      ],
    },
    {
      title: 'Watching the Sky', tag: 'Ancient astronomy', color: '#0ea5e9',
      entries: [
        {
          tag: '≈360 days', title: 'A year of daily steps', badge: '~1° / day',
          text: 'Sky-watchers noticed the sun drifts about one step against the stars each day, going all the way around in roughly 360 days. A full circle came to mean a full year — one degree for each day.',
          visual: 'sunYear',
        },
      ],
    },
    {
      title: 'A Number That Divides', tag: 'Why it stuck', color: '#8b5cf6',
      entries: [
        {
          tag: '24 divisors', title: '360 splits beautifully', badge: '÷ 2,3,4,5,6…',
          text: 'You can split 360 evenly into halves, thirds, quarters, fifths, sixths and far more — 24 whole-number divisors in all. So a third of a turn (120°) or a sixth (60°) is always a tidy whole number. A round-looking 100 would have only nine divisors.',
          visual: 'divisors',
        },
      ],
    },
    {
      title: '4,000 Years Later', tag: 'Greece → today', color: '#6366f1',
      entries: [
        {
          tag: '~150 BCE', title: 'Greek astronomers', badge: '360°',
          text: 'Hipparchus and later Ptolemy built their star charts on the Babylonian 360° circle, and the convention spread across the whole world.',
        },
        {
          tag: 'Today', title: 'On every protractor', badge: '0–360°',
          text: 'The same 360 is printed on the protractor and compass in your pencil case — a 4,000-year-old idea you use in math class.',
          visual: 'protractor',
        },
      ],
    },
  ],
  closer:
    'We could have picked any number for a full turn — people have even tried 400 "gradians." But 360 won because it grew out of how the Babylonians counted, matched the days in a year, and divides more cleanly than almost any other number near it.',
  links: { quizCategory: 'Angles', worksheetId: 'partner' },
}
