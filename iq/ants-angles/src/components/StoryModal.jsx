import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Generic "story" modal: a scrollable timeline of sections, each with entries on
// a colored rail and optional inline visuals. Driven entirely by a `story`
// object — see PiStory.jsx / DegreesStory.jsx. Field names are flexible so the
// existing π data (year/who/value) works unchanged (tag/title/badge are aliases).
export default function StoryModal({ open, story, onClose }) {
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

  const Visual = ({ name }) => {
    const Cmp = story?.visuals?.[name]
    if (!Cmp) return null
    return (
      <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
        <Cmp />
      </div>
    )
  }

  return (
    <AnimatePresence>
      {open && story && (
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
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">{story.title}</h2>
                {story.subtitle && <p className="text-sm text-gray-400">{story.subtitle}</p>}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none w-9 h-9 rounded-full hover:bg-gray-100">×</button>
            </div>

            <div className="px-6 py-5 space-y-8">
              {story.sections.map((section, si) => (
                <section key={si}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-lg font-bold" style={{ color: section.color }}>{section.title}</h3>
                    {(section.tag || section.range) && (
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{section.tag || section.range}</span>
                    )}
                  </div>

                  <div className="border-l-2 pl-4 space-y-5" style={{ borderColor: section.color }}>
                    {section.entries.map((e, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full ring-2 ring-white" style={{ backgroundColor: section.color }} />
                        <div className="flex flex-wrap items-center gap-2">
                          {(e.tag || e.year) && <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: section.color }}>{e.tag || e.year}</span>}
                          <span className="font-bold text-gray-800">{e.title || e.who}</span>
                          {(e.badge || e.value) && <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded px-2 py-0.5">{e.badge || e.value}</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{e.text}</p>
                        {e.visual && <Visual name={e.visual} />}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {story.closer && (
                <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-900 leading-relaxed">
                  <span className="font-bold">Why it matters: </span>{story.closer}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
