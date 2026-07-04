import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BOOK1 } from '../data/book1.js'
import { BOOK2 } from '../data/book2.js'
import { CATS, HOUSES } from '../data/houses.js'
import { FROG_CARDS } from '../data/frogCards.js'
import { buildDeck, presentOptions, pointsFor, qKey, shuffle } from '../lib/game.js'
import FrogCard from '../components/FrogCard.jsx'
import Burst from '../components/Burst.jsx'

export default function Quiz({ game, setGame, book, onHome }) {
  const bank = book === 1 ? BOOK1 : book === 2 ? BOOK2 : [...BOOK1, ...BOOK2]
  const [deck, setDeck] = useState(() => buildDeck(bank, game.seen))
  const [i, setI] = useState(0)
  const [streak, setStreak] = useState(0)
  const [solved, setSolved] = useState(false)   // current question answered correctly
  const [earned, setEarned] = useState(0)
  const [newCard, setNewCard] = useState(null)  // frog card just unlocked
  const [champion, setChampion] = useState(false) // all-22 ceremony showing
  const [burstKey, setBurstKey] = useState(0)
  const [lap, setLap] = useState(0)             // how many times the deck has been reshuffled

  const q = deck[i]
  const houseName = game.house ? HOUSES[game.house].name : null

  function handleCorrect(misses) {
    const pts = pointsFor(q, misses)
    const nextStreak = misses === 0 ? streak + 1 : 0
    setEarned(pts)
    setStreak(nextStreak)
    setSolved(true)
    setBurstKey(k => k + 1)

    const totalCorrect = game.totalCorrect + 1
    let cards = game.cards
    if (Math.floor(totalCorrect / 5) > game.cards && game.cards < FROG_CARDS.length) {
      cards = game.cards + 1
      const unlockedCard = FROG_CARDS[game.cards]
      // reveal the card after the sparkles land
      setTimeout(() => setNewCard(unlockedCard), 650)
    }
    const seen = game.seen.includes(qKey(q)) ? game.seen : [...game.seen, qKey(q)]
    setGame({
      ...game,
      points: game.points + pts,
      totalCorrect,
      cards,
      seen,
      bestStreak: Math.max(game.bestStreak, nextStreak),
    })
  }

  function collectCard() {
    setNewCard(null)
    // Collecting the 22nd card starts the completion ceremony (once ever).
    if (game.cards === FROG_CARDS.length && !game.celebrated) {
      setGame({ ...game, celebrated: true })
      setChampion(true)
    }
  }

  function next() {
    setSolved(false)
    setEarned(0)
    if (i + 1 < deck.length) {
      setI(i + 1)
    } else {
      setDeck(buildDeck(bank, game.seen))
      setI(0)
      setLap(l => l + 1)
    }
  }

  // Enter/Return advances: ceremony → frog card → next question, in that order.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Enter' || e.repeat) return
      if (champion) {
        e.preventDefault()
        setChampion(false)
      } else if (newCard) {
        e.preventDefault()
        collectCard()
      } else if (solved) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const cat = CATS[q.cat]

  return (
    <div className="safe-pad mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-4 pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onHome} className="glass rounded-xl px-3.5 py-2 text-sm font-bold text-indigo-100 active:scale-95">
          ← Castle
        </button>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="glass rounded-xl px-3 py-2 text-sm font-black text-orange-300"
              >
                🔥 {streak}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="glass rounded-xl px-3.5 py-2 text-sm font-black" style={{ color: 'var(--trim)' }}>
            {game.points} pts
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="relative mt-4 flex-1">
        <Burst triggerKey={burstKey} />
        <AnimatePresence mode="wait">
          <motion.div
            key={`${lap}-${i}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
          >
            {/* category chip */}
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide"
                style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}55` }}
              >
                {cat.emoji} {cat.label}
              </span>
              {book === 'mix' && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-200">
                  Book {q.book ?? (BOOK1.includes(q) ? 'I' : 'II')}
                </span>
              )}
            </div>

            <QuestionBody key={`${lap}-${i}-body`} q={q} solved={solved} onCorrect={handleCorrect} />

            {/* Fun fact + next */}
            <AnimatePresence>
              {solved && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className="parchment rounded-2xl px-4 py-3.5">
                    <div className="text-sm font-black">
                      ✨ +{earned} points{houseName ? ` to ${houseName}!` : '!'}
                      {streak > 0 && streak % 5 === 0 && <span> 🔥 {streak} in a row!</span>}
                    </div>
                    <div className="mt-1 text-[13.5px] font-semibold leading-snug">{q.fact}</div>
                  </div>
                  <button
                    onClick={next}
                    className="mt-3 w-full rounded-2xl py-4 font-heading text-lg font-bold text-night-900 shadow-lg transition active:scale-[0.98]"
                    style={{ background: 'linear-gradient(180deg, #ffe9a8, #e6c25a)' }}
                  >
                    Next question →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* New frog card celebration */}
      <AnimatePresence>
        {newCard && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-8 backdrop-blur-sm"
            onClick={collectCard}
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-full max-w-xs"
              onClick={e => e.stopPropagation()}
            >
              <div className="gold-text text-center font-magic text-2xl font-black drop-shadow">
                New Frog Card!
              </div>
              <div className="mt-4">
                <FrogCard card={newCard} />
              </div>
              <button
                onClick={collectCard}
                className="mt-5 w-full rounded-2xl py-3.5 font-heading font-bold text-night-900"
                style={{ background: 'linear-gradient(180deg, #ffe9a8, #e6c25a)' }}
              >
                Collect! 🍫
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All-22 completion ceremony */}
      <AnimatePresence>
        {champion && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/85 px-6 py-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.3, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.45 }}
              className="relative w-full max-w-sm text-center"
            >
              <Burst triggerKey={1} />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                className="text-7xl drop-shadow-lg"
              >
                🏆
              </motion.div>
              <h2 className="gold-text mt-3 font-magic text-3xl font-black leading-tight drop-shadow">
                Master Collector!
              </h2>
              <p className="mt-3 text-sm font-bold leading-relaxed text-indigo-100">
                All <span style={{ color: 'var(--trim)' }}>22 Chocolate Frog Cards</span> collected!
                {houseName ? ` ${HOUSES[game.house].emoji} ` : ' '}
                You are hereby granted a
              </p>
              <div
                className="mx-auto mt-4 rounded-2xl px-5 py-4"
                style={{
                  background: 'linear-gradient(160deg, rgba(230,194,90,0.2), rgba(230,194,90,0.06))',
                  border: '1.5px solid rgba(230,194,90,0.65)',
                  boxShadow: '0 0 28px rgba(230,194,90,0.2)',
                }}
              >
                <div className="text-3xl">🛡️</div>
                <div className="gold-text mt-1 font-heading text-lg font-bold leading-tight">
                  Special Award for Services to Hogwarts
                </div>
                <div className="mt-1.5 text-xs font-semibold leading-snug text-indigo-100/85">
                  Unlike a certain T. M. Riddle, you earned yours honestly — {game.totalCorrect} questions answered true.
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="mt-5 w-full rounded-2xl py-3.5 font-heading font-bold text-night-900"
                style={{ background: 'linear-gradient(180deg, #ffe9a8, #e6c25a)' }}
              >
                🖨 Print your certificate
              </button>
              <button
                onClick={() => setChampion(false)}
                className="glass mt-2.5 w-full rounded-2xl py-3 font-heading font-bold text-indigo-100"
              >
                Keep playing ✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- question bodies ---------- */

function QuestionBody({ q, solved, onCorrect }) {
  if (q.type === 'order') return <OrderQuestion q={q} solved={solved} onCorrect={onCorrect} />
  return <OptionsQuestion q={q} solved={solved} onCorrect={onCorrect} />
}

// mc / tf / quote / odd all share "pick the right option" mechanics
function OptionsQuestion({ q, solved, onCorrect }) {
  const presented = useMemo(() => {
    if (q.type === 'tf') return { options: ['True ✔', 'False ✘'], answer: q.answer ? 0 : 1 }
    return presentOptions(q)
  }, [q])
  const [wrong, setWrong] = useState([])

  function pick(idx) {
    if (solved || wrong.includes(idx)) return
    if (idx === presented.answer) {
      onCorrect(wrong.length)
    } else {
      setWrong(w => [...w, idx])
    }
  }

  return (
    <div>
      {q.type === 'quote' ? (
        <div className="parchment mt-3 rounded-2xl px-5 py-5">
          <div className="text-3xl leading-none">❝</div>
          <p className="mt-1 font-heading text-[17px] font-bold italic leading-snug">{q.quote}</p>
          <p className="mt-3 text-right text-sm font-black">— Who said it?</p>
        </div>
      ) : (
        <h2 className="mt-3 text-xl font-black leading-snug">{q.q}</h2>
      )}
      {!solved && wrong.length > 0 && (
        <p className="mt-2 text-sm font-bold text-rose-300">Not quite — have another go! 🪄</p>
      )}
      <div className={`mt-4 space-y-2.5 ${q.type === 'tf' ? 'grid grid-cols-2 gap-2.5 space-y-0' : ''}`}>
        {presented.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => pick(idx)}
            disabled={solved || wrong.includes(idx)}
            className={`option-btn ${q.type === 'tf' ? 'text-center' : ''} ${
              solved && idx === presented.answer ? 'correct' : wrong.includes(idx) ? 'wrong' : ''
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// Order the Events: tap the moments in story order
function OrderQuestion({ q, solved, onCorrect }) {
  const scrambled = useMemo(() => {
    let s = shuffle(q.items)
    while (s.every((item, idx) => item === q.items[idx])) s = shuffle(q.items)
    return s
  }, [q])
  const [placed, setPlaced] = useState([])       // items placed correctly, in order
  const [shakeItem, setShakeItem] = useState(null)
  const misses = useRef(0)

  function pick(item) {
    if (solved || placed.includes(item)) return
    if (item === q.items[placed.length]) {
      const nextPlaced = [...placed, item]
      setPlaced(nextPlaced)
      if (nextPlaced.length === q.items.length) onCorrect(misses.current)
    } else {
      misses.current += 1
      setShakeItem(item)
      setTimeout(() => setShakeItem(null), 400)
    }
  }

  return (
    <div>
      <h2 className="mt-3 text-xl font-black leading-snug">{q.q}</h2>
      <p className="mt-1 text-sm font-bold text-indigo-200/80">Tap what happened <em>first</em>, then next, then next…</p>

      {/* placed sequence */}
      <div className="mt-4 space-y-1.5">
        {q.items.map((_, idx) => {
          const item = placed[idx]
          return (
            <div
              key={idx}
              className={`flex min-h-[44px] items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-bold ${
                item ? 'border-green-400/60 bg-green-400/10' : 'border-dashed border-white/20 bg-white/[0.03] text-indigo-200/40'
              }`}
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black"
                style={{ background: item ? 'var(--accent)' : 'rgba(255,255,255,0.1)', color: item ? '#0b0c22' : 'inherit' }}
              >
                {idx + 1}
              </span>
              {item || '…'}
            </div>
          )
        })}
      </div>

      {/* pool */}
      {!solved && (
        <div className="mt-4 space-y-2.5">
          {scrambled.filter(item => !placed.includes(item)).map(item => (
            <button
              key={item}
              onClick={() => pick(item)}
              className={`option-btn ${shakeItem === item ? 'wrong' : ''}`}
              style={shakeItem === item ? {} : {}}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
