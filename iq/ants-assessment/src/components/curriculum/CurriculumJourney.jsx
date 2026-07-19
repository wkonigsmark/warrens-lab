import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MATH_LADDER, STATUS_META, VETTING_STAGES, ARRANGEMENTS, arrange,
  stageOf, nextStage, loadVetting, saveVetting,
} from '../../lib/curriculum'

// The Curriculum Journey — a compact macro map of the Math tools. It's a link
// tree (tiles open the tool), a dev board (build-status dots), and — the real
// value tracker — a VETTING board: tap a tile's corner to log how far each
// lesson plan has gotten through the kid-testing litmus test (⚪ to test → 🧪
// testing → ✅ vetted). The "Arrange by" control re-buckets the same tiles
// (Path / Strand / Status / Vetting); they animate via framer-motion layout.
export default function CurriculumJourney() {
  const [vetting, setVetting] = useState(loadVetting)
  const [mode, setMode] = useState('path')

  const cycle = (id) => {
    setVetting((prev) => {
      const next = { ...prev, [id]: nextStage(prev[id] || 'untested') }
      saveVetting(next)
      return next
    })
  }

  const groups = arrange(mode, { vetting })
  const stepOf = new Map(MATH_LADDER.map((t, i) => [t.id, i + 1]))

  // Only built tools can be vetted. Track the kid-testing pipeline over those.
  const buildable = MATH_LADDER.filter((t) => t.status !== 'planned')
  const plannedCount = MATH_LADDER.length - buildable.length
  const stageId = (t) => vetting[t.id] || 'untested'
  const vetted = buildable.filter((t) => stageId(t) === 'vetted').length
  const testing = buildable.filter((t) => stageId(t) === 'testing').length
  const pct = Math.round((vetted / buildable.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-cyan-50 to-emerald-50">
      {/* Compact header */}
      <div className="bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-500 text-white shadow">
        <div className="max-w-4xl mx-auto px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-lg sm:text-xl font-black tracking-tight">Math Curriculum Journey 🗺️</h1>

          {/* Vetting progress — the real litmus test, not just "built" */}
          <div className="flex items-center gap-2 text-xs font-bold text-white/90">
            <div className="w-24 h-2 rounded-full bg-white/25 overflow-hidden">
              <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
            </div>
            <span>✅ {vetted}/{buildable.length} vetted{testing ? ` · 🧪 ${testing}` : ''}</span>
          </div>

          {/* arrange control */}
          <div className="ml-auto flex items-center gap-1 bg-white/15 rounded-full p-0.5">
            <span className="text-[11px] font-bold text-white/70 px-2 hidden sm:inline">Arrange by</span>
            {ARRANGEMENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setMode(a.id)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                  mode === a.id ? 'bg-white text-indigo-700' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The map */}
      <div className="max-w-4xl mx-auto px-5 py-6">
        {groups.map((group) => (
          <div key={group.key} className="mb-5">
            {group.meta && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${group.meta.color}22`, color: group.meta.color }}
                >
                  {group.meta.emoji} {group.meta.label}
                </span>
                <span className="text-[11px] text-gray-400 font-semibold">{group.tools.length}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {group.tools.map((tool) => (
                <Tile
                  key={tool.id}
                  tool={tool}
                  step={mode === 'path' ? stepOf.get(tool.id) : null}
                  stage={stageOf(vetting[tool.id])}
                  onCycle={() => cycle(tool.id)}
                />
              ))}
            </div>
          </div>
        ))}

        <p className="text-center text-[11px] text-gray-400 mt-2">
          Tap a tile to open the tool · tap the corner to log kid-testing
          <span className="font-semibold"> (⚪ to test → 🧪 testing → ✅ vetted)</span> ·
          <span className="text-slate-400 font-semibold"> dashed = {plannedCount} planned, not built</span>.
        </p>
      </div>
    </div>
  )
}

// A small tile. Built tools (live/dev) are a link that opens the tool, with a
// corner control that cycles the VETTING stage (the kid-testing litmus test).
// Planned modules render greyed-out with a dashed outline and no link/control.
function Tile({ tool, step, stage, onCycle }) {
  const status = STATUS_META[tool.status]
  const planned = tool.status === 'planned'

  const inner = (
    <>
      <div className="flex items-center justify-between">
        {step != null ? (
          <span className="text-[10px] font-black text-gray-300">{step}</span>
        ) : (
          <span className="text-[10px]" />
        )}
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} title={`Build: ${status.label}`} />
      </div>
      <div className={`text-3xl leading-none mt-1 ${planned ? 'opacity-70 grayscale' : ''}`}>{tool.emoji}</div>
      <div className={`mt-1.5 font-bold text-sm leading-tight ${planned ? 'text-slate-400' : 'text-gray-800'}`}>{tool.name}</div>
      <div className="text-[11px] font-semibold leading-tight" style={{ color: planned ? '#94a3b8' : tool.accent }}>{tool.subject}</div>
      {planned ? (
        <div className="mt-1.5 inline-block text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
          Planned
        </div>
      ) : (
        stage.id !== 'untested' && (
          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${stage.color}22`, color: stage.color }}>
            {stage.emoji} {stage.short}
          </div>
        )
      )}
    </>
  )

  if (planned) {
    return (
      <motion.div layout transition={{ type: 'spring', stiffness: 320, damping: 30 }} className="relative">
        <div className="h-full rounded-xl bg-white/40 p-3 border-2 border-dashed border-slate-300 cursor-default select-none" title={`${tool.name} — planned, not built yet`}>
          {inner}
        </div>
      </motion.div>
    )
  }

  const ring = stage.id === 'vetted' ? 'ring-2 ring-emerald-300' : stage.id === 'testing' ? 'ring-2 ring-amber-300' : ''
  const cornerGlyph = stage.id === 'vetted' ? '✓' : stage.id === 'testing' ? '🧪' : '○'

  return (
    <motion.div layout transition={{ type: 'spring', stiffness: 320, damping: 30 }} className="relative">
      <a
        href={tool.url}
        target="_blank"
        rel="noreferrer"
        className={`block h-full rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-3 border-t-4 ${ring}`}
        style={{ borderColor: tool.accent }}
        title={`Open ${tool.name}`}
      >
        {inner}
      </a>

      {/* vetting-stage cycler — corner, stops the link */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCycle() }}
        title={`Vetting: ${stage.label} — tap to advance`}
        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shadow border-2 border-white transition-colors"
        style={{ backgroundColor: stage.id === 'untested' ? '#e2e8f0' : stage.color, color: stage.id === 'untested' ? '#94a3b8' : 'white' }}
      >
        {cornerGlyph}
      </button>
    </motion.div>
  )
}
