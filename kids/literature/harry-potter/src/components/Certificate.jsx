import { FROG_CARDS } from '../data/frogCards.js'
import { HOUSES } from '../data/houses.js'

// Print-only certificate (hidden on screen; @media print in index.css reveals it).
// The "Awarded to" line is left blank on purpose — kids write their own name in.
export default function Certificate({ game }) {
  const house = game.house ? HOUSES[game.house] : null
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div className="print-cert">
      <div className="print-cert-frame">
        <div style={{ fontSize: 40 }}>⚡</div>
        <div className="print-cert-script">Special Award for Services to Hogwarts</div>
        <h1>Master Collector</h1>
        <p className="print-cert-sub">of Chocolate Frog Cards</p>
        <p className="print-cert-line">Awarded to</p>
        <div className="print-cert-name" />
        <p className="print-cert-body">
          {house ? `of House ${house.name}, ` : ''}for answering {game.totalCorrect} questions about
          Harry Potter and the Sorcerer’s Stone and Harry Potter and the Chamber of Secrets,
          and collecting all {FROG_CARDS.length} Chocolate Frog Cards — {game.points} house points earned.
        </p>
        <div className="print-cert-cards">
          {FROG_CARDS.map(c => <span key={c.id}>{c.emoji}</span>)}
        </div>
        <div className="print-cert-foot">
          <div>
            <div className="print-cert-sig" />
            <p>Headmaster</p>
          </div>
          <div style={{ fontSize: 34 }}>🏆</div>
          <div>
            <div className="print-cert-sig">{date}</div>
            <p>Date</p>
          </div>
        </div>
      </div>
    </div>
  )
}
