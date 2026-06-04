// A group of dots split into equal groups, with some groups "taken" (filled in).
// This is the picture for "a percent OF a number": split the whole into equal
// groups, then take a few. e.g. 50% of 10 → 2 groups of 5, take 1.
export default function GroupDots({ total, groups = 1, takenGroups = 0, size = 20 }) {
  const per = Math.max(1, Math.round(total / groups))
  const cols = Math.min(per, 5)

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {Array.from({ length: groups }, (_, g) => {
        const taken = g < takenGroups
        return (
          <div
            key={g}
            className={`rounded-xl border-2 p-2 ${taken ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200 bg-white'}`}
          >
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: 6 }}>
              {Array.from({ length: per }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: taken ? '#06b6d4' : '#e5e7eb',
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
