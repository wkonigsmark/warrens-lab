import AngleStage from './AngleStage'
import LinePairFigure from './LinePairFigure'
import { PointFigure, CrossFigure, TriangleFigure } from './quiz/Figures'

// One place that maps a question object → its figure. Shared by Quiz Mode
// (color, on-screen) and Worksheet Mode (black & white, printable).
export default function QuestionFigure({ q, reveal = false, bw = false }) {
  switch (q.figure) {
    case 'linePair':
      return <LinePairFigure known={q.known} bw={bw} />
    case 'pointSum':
      return <PointFigure sectors={q.sectors} bw={bw} />
    case 'vertical':
      return <CrossFigure given={q.given} variant={q.variant} bw={bw} />
    case 'triangle':
      return <TriangleFigure angles={q.angles} unknownIndex={q.unknownIndex} bw={bw} />
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
