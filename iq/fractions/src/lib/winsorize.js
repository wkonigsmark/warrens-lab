// Winsorize question response times to remove distraction outliers.
//
// A kid stepping away mid-question inflates the average. We cap any value that
// is more than 3× the median of the set, with a hard floor of 20 s so that
// genuine slow answers are never artificially suppressed.
//
// Example: [8 000, 6 000, 48 000, 9 000, 15 000] ms
//   median = 9 000  →  cap = max(20 000, 27 000) = 27 000
//   48 000 → 27 000  (flagged); others unchanged
//   winsorized avg ≈ 13 000 ms  vs raw avg ≈ 17 200 ms
//
// With fewer than 3 data points the set is too small to detect outliers reliably
// so values are returned as-is.

const FLOOR_MS  = 20_000   // never winsorize values below 20 s
const K_MEDIAN  = 3        // cap = K × median  (min FLOOR_MS)

export function winsorize(timesMs) {
  if (timesMs.length < 3) return [...timesMs]
  const sorted = [...timesMs].sort((a, b) => a - b)
  const mid    = Math.floor(sorted.length / 2)
  const median = sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
  const cap = Math.max(FLOOR_MS, median * K_MEDIAN)
  return timesMs.map(t => Math.min(t, cap))
}

export function winsorizedAvg(timesMs) {
  if (!timesMs.length) return 0
  const wins = winsorize(timesMs)
  return Math.round(wins.reduce((s, t) => s + t, 0) / wins.length)
}
