import AngleStage from './AngleStage'
import LinePairFigure from './LinePairFigure'
import CircleFigure from './CircleFigure'
import RightTriangleFigure from './RightTriangleFigure'
import { PointFigure, CrossFigure, TriangleFigure } from './quiz/Figures'

// Big-type equation for Number Bonds questions. The '?' renders as a boxed
// blank; on reveal it fills with the answer.
function BondsFigure({ tokens, answer, reveal = false, bw = false }) {
  return (
    <div
      className="flex items-center justify-center gap-3 select-none"
      style={{ fontSize: bw ? '20pt' : '2.75rem', fontWeight: 800, color: bw ? '#000' : '#1f2937' }}
    >
      {tokens.map((tok, i) =>
        tok === '?' ? (
          <span
            key={i}
            className="inline-flex items-center justify-center rounded-xl"
            style={{
              minWidth: bw ? '0.9in' : '1.6em',
              height: bw ? '0.55in' : '1.5em',
              border: bw ? '2px solid #000' : '3px dashed #f97316',
              color: reveal ? '#16a34a' : '#f97316',
              background: bw ? 'transparent' : '#fff7ed',
            }}
          >
            {reveal ? answer : '?'}
          </span>
        ) : (
          <span key={i}>{tok}</span>
        )
      )}
    </div>
  )
}

// One place that maps a question object → its figure. Shared by Quiz Mode
// (color, on-screen) and Worksheet Mode (black & white, printable).
export default function QuestionFigure({ q, reveal = false, bw = false }) {
  switch (q.figure) {
    case 'bonds':
      return <BondsFigure tokens={q.tokens} answer={q.answer} reveal={reveal} bw={bw} />
    case 'linePair':
      return <LinePairFigure known={q.known} bw={bw} />
    case 'pointSum':
      return <PointFigure sectors={q.sectors} bw={bw} />
    case 'vertical':
      return <CrossFigure given={q.given} variant={q.variant} bw={bw} />
    case 'triangle':
      return <TriangleFigure angles={q.angles} unknownIndex={q.unknownIndex} bw={bw} />
    case 'circle':
      return <CircleFigure mark={q.mark} label={q.markLabel} bw={bw} />
    case 'rightTriangle':
      return <RightTriangleFigure a={q.a} b={q.b} labelA={q.labelA} labelB={q.labelB} labelC={q.labelC} bw={bw} />
    default:
      // 'protractor' — on worksheets we hide the tick scale for a cleaner figure.
      return (
        <AngleStage
          angle={q.angle}
          interactive={false}
          showProtractor={!bw}
          showLabel={q.showLabel || reveal}
          bw={bw}
        />
      )
  }
}
