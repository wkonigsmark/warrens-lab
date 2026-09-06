import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BOOKS, HOUSES } from '../data/houses.js'
import { FROG_CARDS } from '../data/frogCards.js'
import { READ_UP_TO } from '../data/book3.js'
import FrogCard from '../components/FrogCard.jsx'

export default function Home({ game, setGame, onPlay }) {
  const [showCards, setShowCards] = useState(false)
  const unlocked = FROG_CARDS.slice(0, game.cards)

  return (
    <div className="safe-pad mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-8 pb-6">
      {/* Title */}
      <header className="text-center">
        <div className="floaty text-5xl">🏰</div>
        <h1 className="gold-text mt-2 font-magic text-4xl font-black leading-tight drop-shadow-lg">
          Wizarding<br />Quiz
        </h1>
        <p className="mt-2 text-sm font-semibold text-indigo-200/80">
          How well do you know Harry’s world?
        </p>
      </header>

      {/* Score strip */}
      <div className="glass mt-6 flex items-center justify-around rounded-2xl px-3 py-3 text-center">
        <div>
          <div className="text-xl font-black" style={{ color: 'var(--trim)' }}>{game.points}</div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-200/70">House points</div>
        </div>
        <div className="h-8 w-px bg-white/15" />
        <button onClick={() => setShowCards(true)} className="active:scale-95 transition">
          <div className="text-xl font-black" style={{ color: 'var(--trim)' }}>
            {game.cards >= FROG_CARDS.length ? '🏆 ' : '🍫 '}{game.cards}<span className="text-sm font-bold text-indigo-200/60">/{FROG_CARDS.length}</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-200/70">
            {game.cards >= FROG_CARDS.length ? 'Master collector!' : 'Frog cards · tap!'}
          </div>
        </button>
        <div className="h-8 w-px bg-white/15" />
        <div>
          <div className="text-xl font-black" style={{ color: 'var(--trim)' }}>🔥 {game.bestStreak}</div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-200/70">Best streak</div>
        </div>
      </div>

      {/* House picker */}
      <section className="mt-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-indigo-200/80">
          Your house
        </h2>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {Object.entries(HOUSES).map(([id, h]) => (
            <button
              key={id}
              onClick={() => setGame(g => ({ ...g, house: id }))}
              className={`glass rounded-xl py-2.5 text-center transition-all active:scale-95 ${game.house === id ? '' : 'opacity-70'}`}
              style={game.house === id ? { boxShadow: `0 0 16px ${h.accent}66`, borderColor: h.accent, borderWidth: 2 } : {}}
            >
              <div className="text-2xl">{h.emoji}</div>
              <div className="mt-0.5 text-[10px] font-bold text-indigo-100/90">{h.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Books */}
      <section className="mt-6 flex-1">
        <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-indigo-200/80">
          Choose your book
        </h2>
        <div className="mt-2 space-y-2.5">
          {BOOKS.filter(b => b.unlocked).map(b => (
            <button
              key={b.id}
              onClick={() => onPlay(b.id)}
              className="glass flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]"
              style={{ borderColor: 'var(--accent)' }}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
                   style={{ background: 'var(--accent-soft)' }}>
                {b.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--trim)' }}>
                    Book {b.num}
                  </span>
                  {b.reading && (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-300">
                      📖 Reading now · ch. 1–{READ_UP_TO}
                    </span>
                  )}
                </div>
                <div className="font-heading text-lg font-bold leading-tight">{b.title}</div>
                <div className="truncate text-xs text-indigo-200/70">{b.blurb}</div>
              </div>
              <div className="ml-auto text-xl" style={{ color: 'var(--trim)' }}>▶</div>
            </button>
          ))}

          <button
            onClick={() => onPlay('mix')}
            className="glass flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
                 style={{ background: 'var(--accent-soft)' }}>
              ✨
            </div>
            <div>
              <div className="font-heading text-lg font-bold leading-tight">Grand Mix</div>
              <div className="text-xs text-indigo-200/70">Every unlocked question shuffled together — the full challenge!</div>
            </div>
            <div className="ml-auto text-xl" style={{ color: 'var(--trim)' }}>▶</div>
          </button>

          {/* Locked books */}
          <div className="grid grid-cols-3 gap-2 pt-1.5">
            {BOOKS.filter(b => !b.unlocked).map(b => (
              <div key={b.id} className="glass rounded-xl px-1 py-2.5 text-center opacity-45 grayscale">
                <div className="text-lg">🔒</div>
                <div className="mt-0.5 font-heading text-[10px] font-bold text-indigo-100">Book {b.num}</div>
              </div>
            ))}
          </div>
          <p className="pt-0.5 text-center text-[11px] font-semibold italic text-indigo-200/50">
            Read the next book to unlock its quiz… 📚
          </p>
        </div>
      </section>

      <AnimatePresence>
        {showCards && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCards(false)}
          >
            <div className="safe-pad mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 py-8" onClick={e => e.stopPropagation()}>
              <h2 className="gold-text text-center font-magic text-2xl font-black">Chocolate Frog Cards</h2>
              {game.cards >= FROG_CARDS.length ? (
                <div className="mt-2 text-center">
                  <p className="text-sm font-black text-amber-200">🏆 Master Collector — every card earned!</p>
                  <button
                    onClick={() => window.print()}
                    className="mt-2.5 rounded-xl px-5 py-2.5 font-heading text-sm font-bold text-night-900"
                    style={{ background: 'linear-gradient(180deg, #ffe9a8, #e6c25a)' }}
                  >
                    🖨 Print your certificate
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-center text-xs font-semibold text-indigo-200/80">
                  Answer 5 questions right to earn each card!
                </p>
              )}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {FROG_CARDS.map((card, i) => (
                  <FrogCard key={card.id} card={card} locked={i >= unlocked.length} small />
                ))}
              </div>
              <button
                onClick={() => setShowCards(false)}
                className="glass mt-6 w-full rounded-2xl py-3.5 font-heading font-bold"
                style={{ color: 'var(--trim)' }}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
