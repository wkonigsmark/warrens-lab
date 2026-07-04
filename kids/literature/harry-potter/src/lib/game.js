const KEY = 'hp-quiz-v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaultState(), ...JSON.parse(raw) }
  } catch { /* fresh start */ }
  return defaultState()
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode */ }
}

function defaultState() {
  return {
    house: null,        // 'gryffindor' | ...
    points: 0,
    totalCorrect: 0,
    bestStreak: 0,
    cards: 0,           // number of frog cards unlocked (index into FROG_CARDS)
    seen: [],           // keys of questions already answered correctly
    celebrated: false,  // completion ceremony shown once
  }
}

// Stable identity for a question (survives bank reordering/growth).
export function qKey(q) {
  return (q.quote || q.q).slice(0, 60)
}

// Fisher–Yates
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build an endless deck: questions never answered correctly come first, so
// nothing repeats until the whole bank is cleared. Within each half the order
// is shuffled, but never two superfan questions in a row and never the same
// type twice in a row (keeps the stream feeling varied).
export function buildDeck(questions, seen = []) {
  const seenSet = new Set(seen)
  const fresh = vary(shuffle(questions.filter(q => !seenSet.has(qKey(q)))))
  const replays = vary(shuffle(questions.filter(q => seenSet.has(qKey(q)))))
  return [...fresh, ...replays]
}

// Smooth a segment so the same type (and back-to-back superfans) don't cluster.
// Swaps stay inside the segment, preserving the fresh-before-replays guarantee.
function vary(deck) {
  for (let i = 1; i < deck.length; i++) {
    if (deck[i].type === deck[i - 1].type || (deck[i].cat === 'superfan' && deck[i - 1].cat === 'superfan')) {
      const j = deck.findIndex((q, k) => k > i && q.type !== deck[i - 1].type)
      if (j > -1) [deck[i], deck[j]] = [deck[j], deck[i]]
    }
  }
  return deck
}

// Shuffle a question's options, tracking where the answer lands.
export function presentOptions(question) {
  const idx = question.options.map((_, i) => i)
  const order = shuffle(idx)
  return {
    options: order.map(i => question.options[i]),
    answer: order.indexOf(question.answer),
  }
}

// Full points on the first try, halved for each miss, never below 2 —
// e.g. a 10-pointer pays 10 / 5 / 3 / 2, a superfan 20-pointer 20 / 10 / 5 / 3 / 2.
export function pointsFor(q, misses) {
  const base = q.cat === 'superfan' ? 20 : q.type === 'order' ? 15 : 10
  return Math.max(2, Math.ceil(base * Math.pow(0.5, misses)))
}
