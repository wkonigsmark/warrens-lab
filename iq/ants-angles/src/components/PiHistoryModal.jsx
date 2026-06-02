import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PI_ERAS, PI_CLOSER } from '../lib/piHistory'

// ── Visuals ────────────────────────────────────────────────────────────
// Archimedes' squeeze: a circle trapped between inside & outside polygons.
function PolygonSqueeze() {
  const cx = 110, cy = 95, R = 62, n = 8
  const poly = (radius, offset) =>
    Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + offset + (i * 2 * Math.PI) / n
      return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`
    }).join(' ')
  const Ro = R / Math.cos(Math.PI / n)
  return (
    <svg viewBox="0 0 220 190" className="w-full h-auto">
      <polygon points={poly(Ro, Math.PI / n)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={R} fill="#fff7ed" stroke="#1f2937" strokeWidth="2.5" />
      <polygon points={poly(R, 0)} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
      <text x={cx} y={182} textAnchor="middle" fontSize="12" fill="#6b7280">inside &amp; outside polygons squeeze π</text>
    </svg>
  )
}

function SeriesViz() {
  return (
    <div className="text-center py-3">
      <div className="text-xl font-bold text-gray-800">π/4 = 1 − ⅓ + ⅕ − ⅐ + ⅑ − ⋯</div>
      <div className="text-xs text-gray-400 mt-2">an endless sum that creeps toward π</div>
    </div>
  )
}

function SymbolViz() {
  return (
    <div className="text-center py-2">
      <div className="text-6xl font-extrabold text-violet-500 leading-none">π</div>
      <div className="text-sm font-bold text-gray-600 mt-1">= 3.14159265…</div>
    </div>
  )
}

function DigitsViz() {
  return (
    <div className="text-center py-2">
      <div className="font-mono text-sm text-gray-700 break-all leading-snug">
        3.14159265358979323846264338327950288419716939937510582097…
      </div>
      <div className="text-xs text-gray-400 mt-2">…and 100,000,000,000,000+ more</div>
    </div>
  )
}

const VISUALS = { polygons: PolygonSqueeze, series: SeriesViz, symbol: SymbolViz, digits: DigitsViz }

function Visual({ name }) {
  const Cmp = VISUALS[name]
  if (!Cmp) return null
  return (
    <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
      <Cmp />
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────
export default function PiHistoryModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/50 overflow-y-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4"
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">The Story of π</h2>
                <p className="text-sm text-gray-400">Over 4,000 years of chasing one number.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none w-9 h-9 rounded-full hover:bg-gray-100">×</button>
            </div>

            {/* Timeline */}
            <div className="px-6 py-5 space-y-8">
              {PI_ERAS.map((era) => (
                <section key={era.id}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-lg font-bold" style={{ color: era.color }}>{era.title}</h3>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{era.range}</span>
                  </div>

                  <div className="border-l-2 pl-4 space-y-5" style={{ borderColor: era.color }}>
                    {era.entries.map((e, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full ring-2 ring-white" style={{ backgroundColor: era.color }} />
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: era.color }}>{e.year}</span>
                          <span className="font-bold text-gray-800">{e.who}</span>
                          {e.value && <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded px-2 py-0.5">{e.value}</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{e.text}</p>
                        {e.visual && <Visual name={e.visual} />}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {/* Closer */}
              <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-900 leading-relaxed">
                <span className="font-bold">Why it matters: </span>{PI_CLOSER}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
