export default function FrogCard({ card, locked = false, small = false }) {
  if (locked) {
    return (
      <div className="glass rounded-2xl p-3 text-center opacity-40 grayscale">
        <div className={small ? 'text-3xl' : 'text-5xl'}>❓</div>
        <div className="mt-1.5 font-heading text-xs font-bold text-indigo-100">???</div>
      </div>
    )
  }
  return (
    <div
      className="rounded-2xl p-3 text-center"
      style={{
        background: 'linear-gradient(160deg, rgba(230,194,90,0.16), rgba(230,194,90,0.05))',
        border: '1.5px solid rgba(230,194,90,0.55)',
        boxShadow: '0 0 18px rgba(230,194,90,0.12)',
      }}
    >
      <div className={`${small ? 'text-3xl' : 'text-6xl'} drop-shadow`}>{card.emoji}</div>
      <div className="gold-text mt-1.5 font-heading text-sm font-bold leading-tight">{card.name}</div>
      <div className="mt-1 text-[11px] leading-snug text-indigo-100/85">{card.line}</div>
    </div>
  )
}
