// ── Visuals ────────────────────────────────────────────────────────────

// The classic knotted-rope trick: a 3-4-5 triangle marked with 12 equally
// spaced knots, corners pinned by pegs.
function RopeTriangle() {
  // 3-4-5 in display units
  const A = { x: 60,  y: 170 }
  const B = { x: 60,  y: 50  }  // vertical leg = 3
  const C = { x: 220, y: 170 }  // horizontal leg = 4, hyp = 5
  const scale = 40 // px per unit

  // Knot positions along each side (12 total: 4 on leg-3, 5 on leg-4, 3 gaps on hyp = 12 segments, 12 knots)
  const pts = []
  const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })
  for (let i = 0; i <= 3; i++) pts.push(lerp(A, B, i / 3))
  for (let i = 1; i <= 4; i++) pts.push(lerp(B, C, i / 4))
  for (let i = 1; i < 5; i++) pts.push(lerp(C, A, i / 5))

  return (
    <div className="text-center">
      <svg viewBox="0 0 310 220" className="w-full h-auto max-w-[310px] mx-auto">
        {/* Rope */}
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="none" stroke="#92400e" strokeWidth="4" strokeLinejoin="round" />
        {/* Knots */}
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" fill="#d97706" />)}
        {/* Pegs at corners */}
        {[A, B, C].map((p, i) => <circle key={`peg${i}`} cx={p.x} cy={p.y} r="8" fill="#1f2937" />)}
        {/* Side labels */}
        <text x="36"  y="118" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#22c55e">3</text>
        <text x="142" y="195" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#6366f1">4</text>
        <text x="160" y="100" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f59e0b">5</text>
        <text x="155" y="215" textAnchor="middle" fontSize="12" fill="#6b7280">12 knots · 3 pegs · a right angle!</text>
      </svg>
      <div className="text-xs text-gray-400 mt-1">Egyptian rope-stretchers made right angles this way on building sites</div>
    </div>
  )
}

// The squares-on-sides proof — the two small squares visually fill the big one.
function SquaresProof() {
  const A = { x: 90,  y: 200 }
  const B = { x: 90,  y: 80  }  // leg b = 3 units * 30px
  const C = { x: 210, y: 200 }  // leg a = 4 units * 30px
  const U = 30
  const GREEN  = '#22c55e'
  const INDIGO = '#6366f1'
  const AMBER  = '#f59e0b'

  // Square on leg AB (vertical, 3 units) — to the left
  const sqB = [B, A, { x: A.x - 3*U, y: A.y }, { x: B.x - 3*U, y: B.y }]
  // Square on leg AC (horizontal, 4 units) — below
  const sqA = [A, C, { x: C.x, y: C.y + 4*U }, { x: A.x, y: A.y + 4*U }]
  // Square on hypotenuse BC (5 units) — rotated outward
  const dx = C.x - B.x, dy = C.y - B.y
  const nx = -dy / 5, ny = dx / 5 // outward normal, 1 unit length
  const H1 = { x: B.x + nx*5*U/30, y: B.y + ny*5*U/30 }
  const H2 = { x: C.x + nx*5*U/30, y: C.y + ny*5*U/30 }
  // Rescale hyp square — hyp = 5 units so 150px; perp offset = 150px
  const scale = Math.hypot(dx, dy)
  const nx2 = -dy / scale, ny2 = dx / scale
  const hyp = [
    B,
    C,
    { x: C.x + nx2 * scale, y: C.y + ny2 * scale },
    { x: B.x + nx2 * scale, y: B.y + ny2 * scale },
  ]
  const fmt = (pts) => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const cen = (pts) => ({ x: pts.reduce((s,p)=>s+p.x,0)/pts.length, y: pts.reduce((s,p)=>s+p.y,0)/pts.length })

  const cA = cen(sqA), cB = cen(sqB), cH = cen(hyp)

  return (
    <div className="text-center">
      <svg viewBox="0 0 340 340" className="w-full h-auto max-w-[280px] mx-auto">
        <polygon points={fmt(sqB)} fill={GREEN}  fillOpacity="0.25" stroke={GREEN}  strokeWidth="2" />
        <polygon points={fmt(sqA)} fill={INDIGO} fillOpacity="0.25" stroke={INDIGO} strokeWidth="2" />
        <polygon points={fmt(hyp)} fill={AMBER}  fillOpacity="0.25" stroke={AMBER}  strokeWidth="2" />
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#eef2ff" stroke="#1f2937" strokeWidth="3" />
        {/* right-angle marker */}
        <path d={`M ${A.x+12} ${A.y} L ${A.x+12} ${A.y-12} L ${A.x} ${A.y-12}`} fill="none" stroke="#1f2937" strokeWidth="2" />
        <text x={cB.x} y={cB.y} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="bold" fill={GREEN}>9</text>
        <text x={cA.x} y={cA.y} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="bold" fill={INDIGO}>16</text>
        <text x={cH.x} y={cH.y} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="bold" fill={AMBER}>25</text>
      </svg>
      <div className="text-xs text-gray-400 mt-1">the two small squares (9 + 16) always equal the big one (25)</div>
    </div>
  )
}

// Ancient proofs — a wordless "look and see" rearrangement hint.
function RearrangeHint() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-4 py-3">
        <div className="flex flex-col items-center gap-1">
          {[...Array(3)].map((_,j) => (
            <div key={j} className="flex gap-1">
              {[...Array(3)].map((_,i) => <div key={i} className="w-4 h-4 bg-green-400 rounded-sm"/>)}
            </div>
          ))}
          <div className="text-xs font-bold text-green-600 mt-1">a² = 9</div>
        </div>
        <div className="text-2xl font-bold text-gray-400">+</div>
        <div className="flex flex-col items-center gap-1">
          {[...Array(4)].map((_,j) => (
            <div key={j} className="flex gap-1">
              {[...Array(4)].map((_,i) => <div key={i} className="w-4 h-4 bg-indigo-400 rounded-sm"/>)}
            </div>
          ))}
          <div className="text-xs font-bold text-indigo-600 mt-1">b² = 16</div>
        </div>
        <div className="text-2xl font-bold text-gray-400">=</div>
        <div className="flex flex-col items-center gap-1">
          {[...Array(5)].map((_,j) => (
            <div key={j} className="flex gap-1">
              {[...Array(5)].map((_,i) => <div key={i} className="w-4 h-4 bg-amber-400 rounded-sm"/>)}
            </div>
          ))}
          <div className="text-xs font-bold text-amber-600 mt-1">c² = 25</div>
        </div>
      </div>
      <div className="text-xs text-gray-400">the square tiles make it literally countable</div>
    </div>
  )
}

export const pythagorasStory = {
  title: 'Pythagoras & the Theorem',
  subtitle: 'Why a² + b² = c² — and who figured it out.',
  visuals: { rope: RopeTriangle, squares: SquaresProof, tiles: RearrangeHint },
  sections: [
    {
      title: 'Before Pythagoras', tag: '~2000–500 BCE', color: '#f59e0b',
      entries: [
        {
          tag: '~2000 BCE', title: 'Babylonian tablets', badge: 'clay tablets',
          text: 'Babylonian scribes listed sets of numbers like (3, 4, 5), (5, 12, 13) and (8, 15, 17) — what we now call Pythagorean triples. They clearly knew these made right angles, even if they didn\'t write a proof.',
        },
        {
          tag: '~1500 BCE', title: 'Egyptian rope-stretchers', badge: '12-knot rope',
          text: 'Egyptian builders knotted a rope at 12 equal intervals, then pinned it into a 3-4-5 triangle. The corner between the "3" and "4" is always a perfect right angle — practical proof on every pyramid and temple.',
          visual: 'rope',
        },
      ],
    },
    {
      title: 'Pythagoras of Samos', tag: '~570–495 BCE', color: '#8b5cf6',
      entries: [
        {
          tag: '~530 BCE', title: 'The Brotherhood', badge: 'Croton, Italy',
          text: 'Pythagoras founded a secretive school in southern Italy. His followers believed whole numbers were the foundation of all things — which made what they discovered about right triangles both thrilling and, for them, unsettling.',
        },
        {
          tag: 'The theorem', title: 'a² + b² = c²', badge: 'for every right triangle',
          text: 'In any right triangle, the squares built on the two shorter sides (legs) have a combined area exactly equal to the square on the longest side (hypotenuse). Not approximately — exactly, always, for every right triangle ever drawn.',
          visual: 'squares',
        },
        {
          tag: 'The proof', title: 'Why it\'s always true', badge: '400+ known proofs',
          text: 'The Pythagoreans found one of the earliest proofs using rearrangement — you can cut and shuffle the two small squares to perfectly tile the big one. Today over 400 different proofs exist, including one by US President James Garfield.',
          visual: 'tiles',
        },
      ],
    },
    {
      title: 'The Unsettling Discovery', tag: '~500 BCE', color: '#ef4444',
      entries: [
        {
          tag: 'Crisis', title: 'The √2 problem', badge: 'irrational!',
          text: 'A right triangle with two legs of length 1 has a hypotenuse of √2. The Pythagoreans tried desperately to express √2 as a fraction — and proved they couldn\'t. Their student Hippasus reportedly revealed this publicly and, legend has it, was drowned for it. It shook their belief that all numbers were "rational."',
        },
      ],
    },
    {
      title: 'A Theorem For Everyone', tag: 'Ancient → today', color: '#6366f1',
      entries: [
        {
          tag: '~300 BCE', title: 'Euclid\'s proof', badge: 'Elements, Book I',
          text: 'Euclid included a rigorous proof of the theorem in his legendary textbook, the Elements — one of the most read books in history. His version is the one generations of school students have learned.',
        },
        {
          tag: 'China ~200 BCE', title: 'The Zhoubi Suanjing', badge: 'independent',
          text: 'Chinese mathematicians independently proved the same theorem (called the "Gougu theorem") centuries before Euclid\'s work reached China. The theorem belongs to no single culture.',
        },
        {
          tag: 'Today', title: 'Everywhere', badge: 'GPS · architecture · games',
          text: 'Every time your phone calculates how far away something is, or a game engine figures out if two objects have collided, it\'s doing a²+b²=c². The theorem is baked into the foundations of geometry, trigonometry, physics, and computer science.',
        },
      ],
    },
  ],
  closer:
    'Pythagoras\' name is on the theorem, but the insight spans Egypt, Babylon, Greece, India, and China — all independently. It\'s the most-proved theorem in mathematics, and it still unlocks new doors every time you draw a right angle.',
  links: { quizCategory: 'Right Triangles', worksheetId: 'pyth-hyp' },
}
