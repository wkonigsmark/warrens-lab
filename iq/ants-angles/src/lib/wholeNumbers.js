// Universal "whole numbers only" rule for quizzes & worksheets. Default ON.
//
// Two layers:
//  1) Levels/topics that are *inherently* fraction/decimal (e.g. circle
//     circumference & area, because of π) are tagged `decimals: true` and
//     hidden while the mode is on — they can never yield whole answers.
//  2) For everything still shown, `generateWhole` re-rolls until the answer is a
//     whole number — a safety net so no decimal slips through, now or later.

// Is this question's answer a whole number? Multiple-choice (word) answers count.
export function isWhole(q) {
  if (!q) return false
  if (q.type === 'choice') return true
  return Number.isInteger(Number(q.answer))
}

// Re-roll a generator until it yields a whole-number answer (capped).
export function generateWhole(generate, attempts = 40) {
  let last
  for (let i = 0; i < attempts; i++) {
    last = generate()
    if (isWhole(last)) return last
  }
  return last // fallback — shouldn't happen for non-`decimals` content
}

// Hide inherently-decimal items when the mode is on.
export function visibleItems(items, wholeOnly) {
  return wholeOnly ? items.filter((it) => !it.decimals) : items
}
