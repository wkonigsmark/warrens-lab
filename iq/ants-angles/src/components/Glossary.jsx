import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GLOSSARY, ALL_TERMS, TOPIC_LABELS } from '../lib/glossary'

// Wrap the matched part of `text` in a highlight.
function Highlight({ text, query }) {
  if (!query) return text
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${safe})`, 'ig'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-amber-200 rounded px-0.5">{part}</mark>
      : <span key={i}>{part}</span>
  )
}

function TermRow({ entry, query, showTopic }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color || '#cbd5e1' }} />
      <div>
        <dt className="font-bold text-gray-800 text-sm flex items-center gap-2 flex-wrap">
          <Highlight text={entry.term} query={query} />
          {showTopic && (
            <span className="text-[10px] uppercase tracking-wide font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
              {TOPIC_LABELS[entry.topic]}
            </span>
          )}
        </dt>
        <dd className="text-sm text-gray-500 leading-snug"><Highlight text={entry.def} query={query} /></dd>
      </div>
    </div>
  )
}

// Contextual glossary for the current Explore topic, with a master search that
// spans EVERY topic's terms. Color dots match the figures' classification badges.
export default function Glossary({ topic }) {
  const [open, setOpen] = useState(true)
  const [query, setQuery] = useState('')
  const groups = GLOSSARY[topic]
  if (!groups) return null

  const q = query.trim()
  const searching = q.length > 0
  const results = searching
    ? ALL_TERMS.filter((t) => t.term.toLowerCase().includes(q.toLowerCase()) || t.def.toLowerCase().includes(q.toLowerCase()))
    : []
  const showContent = open || searching

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header: title + master search + collapse */}
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="text-lg font-bold text-gray-800 flex-shrink-0">📖 Glossary</span>
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔎</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all terms…"
            className="w-full pl-8 pr-8 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>
        {!searching && (
          <button onClick={() => setOpen((o) => !o)} className="text-gray-400 text-sm font-semibold flex-shrink-0 hover:text-gray-600">
            {open ? 'Hide ▲' : 'Show ▼'}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {showContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {searching ? (
              <div className="px-6 pb-6">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-3">
                  {results.length} {results.length === 1 ? 'match' : 'matches'} for “{q}”
                </p>
                {results.length === 0 ? (
                  <p className="text-sm text-gray-400">No terms match — try another word.</p>
                ) : (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {results.map((entry) => (
                      <TermRow key={`${entry.topic}-${entry.term}`} entry={entry} query={q} showTopic />
                    ))}
                  </dl>
                )}
              </div>
            ) : (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                {groups.map((group) => (
                  <div key={group.heading}>
                    <h3 className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-2">{group.heading}</h3>
                    <dl className="space-y-3">
                      {group.terms.map((t) => (
                        <TermRow key={t.term} entry={t} query="" showTopic={false} />
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
