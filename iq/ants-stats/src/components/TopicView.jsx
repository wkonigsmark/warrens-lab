import { useState } from 'react'
import ConceptIntro from './ConceptIntro'
import WorkedExamples from './WorkedExamples'
import PracticeSet from './PracticeSet'

// The ungated "Learn" path for a topic: concept intro → worked examples →
// untracked practice. It's the reading/warm-up track; the gated tier ladder
// (the tracked part) lives on the home base camp. Finishing practice drops the
// student back to base camp to start climbing.
export default function TopicView({ topic, onExit }) {
  const [stage, setStage] = useState('intro')

  if (stage === 'intro')
    return <ConceptIntro topic={topic} onExit={onExit} onNext={() => setStage('examples')} />
  if (stage === 'examples')
    return <WorkedExamples topic={topic} onBack={() => setStage('intro')} onNext={() => setStage('practice')} />
  return <PracticeSet topic={topic} onBack={() => setStage('examples')} onNext={onExit} />
}
