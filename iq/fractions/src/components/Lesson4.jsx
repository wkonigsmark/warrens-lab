import Scene from './Scene'
import GroupSet from './GroupSet'
import GroupPrompt from './prompts/GroupPrompt'

const range = (n) => Array.from({ length: n }, (_, i) => i)

function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

// Lesson 4 — a fraction of a NUMBER (a group of things). The big idea: the
// bottom number says how many equal groups to split into; the top number says
// how many groups to take. Concrete with cookies the whole way.
export default function Lesson4() {
  return (
    <div className="pb-24">
      {/* 1 — the question */}
      <Scene>
        <Words title="Lesson 4: A fraction of a number">
          Fractions don't only cut up <em>one</em> pie — they can also share out a <strong>group</strong> of
          things. Say we have <strong>6 cookies</strong>. What is <strong>1/2 of 6</strong>? 🍪
        </Words>
        <div className="flex justify-center">
          <GroupSet total={6} den={1} selected={[0]} cell={40} />
        </div>
        <p className="text-center text-gray-400 mt-4">6 cookies.</p>
      </Scene>

      {/* 2 — split into 2 groups, take 1 */}
      <Scene>
        <Words title="Split into equal groups">
          The bottom number is <strong>2</strong>, so we split the 6 cookies into <strong>2 equal groups</strong>.
          Each group has 3. We take <strong>1</strong> group (the top number) — that's <strong>3 cookies</strong>.
        </Words>
        <div className="flex justify-center">
          <GroupSet total={6} den={2} selected={[0]} cell={40} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">1/2 of 6 = 3</p>
      </Scene>

      {/* 3 — the rule */}
      <Scene>
        <Words title="The rule">
          To find a fraction of a number: the <span className="font-bold text-amber-800">bottom</span> number
          tells how many <strong>equal groups</strong> to split into, and the{' '}
          <span className="font-bold text-amber-500">top</span> number tells how many groups to{' '}
          <strong>take</strong>.
        </Words>
      </Scene>

      {/* 4 — another example: 1/3 of 12 */}
      <Scene>
        <Words title="Let's try 1/3 of 12">
          Split <strong>12</strong> into <strong>3</strong> equal groups — that's 4 in each group. Take{' '}
          <strong>1</strong> group: <strong>4</strong>.
        </Words>
        <div className="flex justify-center">
          <GroupSet total={12} den={3} selected={[0]} cell={36} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">1/3 of 12 = 4</p>
      </Scene>

      {/* 5 — try it */}
      <Scene>
        <GroupPrompt total={8} den={4} num={1} />
      </Scene>

      {/* 6 — taking more than one group */}
      <Scene>
        <Words title="Taking more than one group">
          What about <strong>2/3 of 12</strong>? Same 3 groups of 4 — but now we take <strong>2</strong> of
          them. That's <strong>8</strong>.
        </Words>
        <div className="flex justify-center">
          <GroupSet total={12} den={3} selected={[0, 1]} cell={36} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">2/3 of 12 = 8</p>
      </Scene>

      {/* 7 — try it */}
      <Scene>
        <GroupPrompt total={10} den={5} num={2} />
      </Scene>

      {/* 8 — celebrate */}
      <Scene>
        <Words title="Now you can share anything! 🎉">
          A fraction of a number means <strong>split into equal groups</strong> (the bottom number) and{' '}
          <strong>take some groups</strong> (the top number). Try your own in <strong>🧭 Play</strong>, and
          practice in the <strong>📚 Quiz</strong>.
        </Words>
        <div className="flex justify-center">
          <GroupSet total={12} den={4} selected={range(3)} cell={36} />
        </div>
        <p className="text-center text-gray-500 mt-4 text-lg">3/4 of 12 = 9</p>
      </Scene>
    </div>
  )
}
