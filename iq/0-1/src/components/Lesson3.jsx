import Scene, { Words } from './Scene'
import GroupDots from './GroupDots'
import PercentOfLab from './PercentOfLab'

// Lesson 3 — "Percent of a number"
// The last basic-percent lesson. Big idea: a percent OF a number means take that
// percent of a GROUP. Lean on the fractions they know (50% = half, etc.) and the
// split-into-equal-groups move from Ants & Fractions. Friendly whole numbers only.
export default function Lesson3() {
  return (
    <div className="pb-24">
      {/* 1 — the question */}
      <Scene>
        <Words title="Percent of a number">
          Percents don't only fill a grid — they can take a piece of a{' '}
          <strong>group of things</strong>. Say we have <strong>10 cookies</strong>. What is{' '}
          <strong>50% of 10</strong>? 🍪 Let's find out, one little step at a time. 🐜
        </Words>
        <div className="flex justify-center">
          <GroupDots total={10} groups={1} takenGroups={0} />
        </div>
        <p className="text-center text-gray-400 mt-4">10 cookies — none taken yet.</p>
      </Scene>

      {/* 2 — 100% of a number */}
      <Scene>
        <Words title="100% means all of them">
          Remember, <strong>100%</strong> is the <strong>whole</strong> thing. So <strong>100% of 8</strong>{' '}
          is <strong>all 8</strong>. You take every single one!
        </Words>
        <div className="flex justify-center">
          <GroupDots total={8} groups={1} takenGroups={1} />
        </div>
        <p className="text-center text-gray-600 mt-5 text-xl font-bold">100% of 8 = 8</p>
      </Scene>

      {/* 3 — 0% of a number */}
      <Scene>
        <Words title="0% means none">
          And <strong>0%</strong> is <strong>none</strong>. So <strong>0% of 8</strong> is{' '}
          <strong>0</strong> — you take nothing at all.
        </Words>
        <div className="flex justify-center">
          <GroupDots total={8} groups={1} takenGroups={0} />
        </div>
        <p className="text-center text-gray-600 mt-5 text-xl font-bold">0% of 8 = 0</p>
      </Scene>

      {/* 4 — 50% is half: split into 2 groups, take 1 */}
      <Scene>
        <Words title="50% is half">
          <strong>50%</strong> is <strong>half</strong> (remember, 50% = ½). To take half of 10, split the
          10 cookies into <strong>2 equal groups</strong> of 5 — then take <strong>1 group</strong>.
        </Words>
        <div className="flex justify-center">
          <GroupDots total={10} groups={2} takenGroups={1} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">50% of 10 = 5</p>
        <p className="text-center text-gray-400 mt-2">Half of 10 is 5. 🍪</p>
      </Scene>

      {/* 5 — 25% is a quarter: split into 4, take 1 */}
      <Scene>
        <Words title="25% is a quarter">
          <strong>25%</strong> is <strong>one quarter</strong> (25% = ¼). Split <strong>8</strong> into{' '}
          <strong>4 equal groups</strong> of 2, and take <strong>1 group</strong>.
        </Words>
        <div className="flex justify-center">
          <GroupDots total={8} groups={4} takenGroups={1} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">25% of 8 = 2</p>
      </Scene>

      {/* 6 — 10% is one tenth: split into 10, take 1 */}
      <Scene>
        <Words title="10% is one tenth">
          <strong>10%</strong> means <strong>one tenth</strong> — split into <strong>10 equal groups</strong>{' '}
          and take <strong>1</strong>. Split <strong>20</strong> into 10 groups of 2, take one: that's{' '}
          <strong>2</strong>.
        </Words>
        <div className="flex justify-center">
          <GroupDots total={20} groups={10} takenGroups={1} size={16} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">10% of 20 = 2</p>
        <p className="text-center text-gray-400 mt-2">
          Just like one row of the 100-grid is 10%! 🔲
        </p>
      </Scene>

      {/* 7 — the move */}
      <Scene>
        <Words title="The secret move">
          To find a percent <strong>of a number</strong>: think of the <strong>fraction</strong> it is, then
          split the group into equal parts and take some.
        </Words>
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-5 text-center text-lg text-gray-700 space-y-1">
          <p><strong className="text-cyan-600">100%</strong> = all of it</p>
          <p><strong className="text-cyan-600">50%</strong> = half (split in 2, take 1)</p>
          <p><strong className="text-cyan-600">25%</strong> = a quarter (split in 4, take 1)</p>
          <p><strong className="text-cyan-600">10%</strong> = one tenth (split in 10, take 1)</p>
        </div>
      </Scene>

      {/* 8 — your turn */}
      <Scene>
        <Words title="Now you try! 🎉">
          Tap a percent and watch how much you take out of <strong>20</strong> dots. Every answer is a
          nice whole number!
        </Words>
        <PercentOfLab />
      </Scene>

      {/* 9 — recap */}
      <Scene>
        <Words title="You did it! 🏆">
          A percent <strong>of a number</strong> is just taking that much of a group. <strong>50% of 10
          is 5</strong>, <strong>25% of 8 is 2</strong>, <strong>100%</strong> is all of it. You've got the
          basics of percents! 🐜
        </Words>
        <div className="flex justify-center">
          <GroupDots total={10} groups={2} takenGroups={1} />
        </div>
        <p className="text-center text-gray-400 mt-6">
          Next up: <strong>decimals</strong> — one more way to write these same amounts (like 0.5).
        </p>
      </Scene>
    </div>
  )
}
