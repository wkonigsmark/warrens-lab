// Dynasty Soccer — adaptive quiz scheduling.
//
// A Leitner-style box system. Every question sits in a box 1–5; answering correctly
// promotes it and pushes it further into the future, answering wrongly drops it to
// box 1 so it comes back within a few questions. "Due" is measured in questions
// answered, not wall-clock time, so a session behaves the same however long it runs.

export const STAGES = ['sideline', 'playing', 'club', 'referee', 'hs'];
export const stageRank = k => STAGES.indexOf(k);

// How many further questions before a card in each box comes round again.
const INTERVAL = { 1: 3, 2: 7, 3: 14, 4: 26, 5: 45 };
const MASTERED_BOX = 4;

export function newState(startStage) {
  return { stage: startStage, unlocked: stageRank(startStage) + 1, answered: 0, cards: {}, recent: [] };
}

const cardOf = (state, id) => state.cards[id] || (state.cards[id] = { box: 0, due: 0, right: 0, wrong: 0 });

/** Questions the learner is currently allowed to see. */
export function inScope(questions, state) {
  return questions.filter(q => stageRank(q.stage) < state.unlocked);
}

// Keep roughly this many questions in active circulation. Without a cap, cards in
// box 1 come due so often that brand-new questions never get introduced.
const WORKING_SET = 9;

/**
 * Pick the next question. Keeps a small working set moving: introduce new material
 * while there is room, otherwise revisit whatever is most overdue. Never repeats
 * the question just answered.
 */
export function nextQuestion(questions, state, lastId = null) {
  const pool = inScope(questions, state).filter(q => q.id !== lastId);
  if (!pool.length) return null;

  const unseen = pool.filter(q => !state.cards[q.id]);
  const active = pool.filter(q => { const c = state.cards[q.id]; return c && c.box < MASTERED_BOX; }).length;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  if (unseen.length && active < WORKING_SET) return pick(unseen);

  const due = pool.filter(q => state.cards[q.id] && state.cards[q.id].due <= state.answered);
  if (due.length) {
    due.sort((a, b) => state.cards[a.id].due - state.cards[b.id].due || state.cards[a.id].box - state.cards[b.id].box);
    return due[0];
  }
  if (unseen.length) return pick(unseen);
  return pool.slice().sort((a, b) => state.cards[a.id].due - state.cards[b.id].due)[0];
}

/** Record an answer and reschedule the card. Returns { correct, card }. */
export function record(state, question, chosenIndex) {
  const correct = chosenIndex === question.answer;
  const c = cardOf(state, question.id);
  if (correct) { c.box = Math.min(c.box + 1, 5); c.right++; }
  else { c.box = 1; c.wrong++; }
  state.answered++;
  c.due = state.answered + INTERVAL[c.box];
  state.recent.push(correct ? 1 : 0);
  if (state.recent.length > 12) state.recent.shift();
  return { correct, card: c };
}

export function stats(questions, state) {
  const scope = inScope(questions, state);
  const mastered = scope.filter(q => (state.cards[q.id]?.box || 0) >= MASTERED_BOX).length;
  const seen = scope.filter(q => state.cards[q.id]).length;
  const recent = state.recent;
  const streak = (() => { let n = 0; for (let i = recent.length - 1; i >= 0 && recent[i]; i--) n++; return n; })();
  return {
    inScope: scope.length, seen, mastered,
    accuracy: recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length * 100) : null,
    streak,
  };
}

/**
 * Graduate when the current band is genuinely under control: every question seen,
 * most of them mastered, and recent answers strong. Returns the newly unlocked
 * stage key, or null.
 */
export function maybeGraduate(questions, state) {
  if (state.unlocked >= STAGES.length) return null;
  const s = stats(questions, state);
  const enough = state.recent.length >= 8;
  const strong = s.accuracy !== null && s.accuracy >= 80;
  const covered = s.seen === s.inScope && s.mastered >= Math.ceil(s.inScope * 0.6);
  if (enough && strong && covered) {
    state.unlocked++;
    state.recent = [];
    return STAGES[state.unlocked - 1];
  }
  return null;
}
