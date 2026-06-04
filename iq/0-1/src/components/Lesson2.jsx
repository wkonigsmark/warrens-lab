import Scene, { Words } from './Scene'
import PercentGrid from './PercentGrid'

// Lesson 2 — "Percents are fraction buddies"
// Ties the new percent idea straight back to the fractions the child already
// knows: ½ = 50%, ¼ = 25%, ¾ = 75%, whole = 100%.

// One labelled friendly amount: grid + fraction + percent, side by side.
function Buddy({ value, frac, word }) {
  return (
    <div className="flex items-center justify-center gap-5 bg-white rounded-2xl shadow p-4">
      <PercentGrid value={value} size={120} />
      <div className="text-left">
        <div className="text-3xl font-black text-gray-700">{frac}</div>
        <div className="text-gray-400 font-semibold">{word}</div>
        <div className="text-2xl font-black text-cyan-600 mt-1">{value}%</div>
      </div>
    </div>
  )
}

export default function Lesson2() {
  return (
    <div className="pb-24">
      {/* 1 — intro */}
      <Scene>
        <Words title="Percents are fraction buddies">
          You already know <strong>fractions</strong> — pieces of a whole. Percents are just another
          way to say the <strong>same thing</strong>. Let's meet the friendly ones. 🤝
        </Words>
      </Scene>

      {/* 2 — half */}
      <Scene>
        <Words title="Half is 50%">
          Cut something in <strong>2</strong> equal pieces and take one. That's <strong>1/2</strong> —
          and it fills <strong>50</strong> of the 100 squares. So <strong>1/2 = 50%</strong>.
        </Words>
        <Buddy value={50} frac="1/2" word="one half" />
      </Scene>

      {/* 3 — quarter */}
      <Scene>
        <Words title="A quarter is 25%">
          Cut into <strong>4</strong> equal pieces and take one: <strong>1/4</strong>. That fills{' '}
          <strong>25</strong> squares. So <strong>1/4 = 25%</strong>.
        </Words>
        <Buddy value={25} frac="1/4" word="one quarter" />
      </Scene>

      {/* 4 — three quarters */}
      <Scene>
        <Words title="Three quarters is 75%">
          Take <strong>3</strong> of those 4 pieces: <strong>3/4</strong>. That fills{' '}
          <strong>75</strong> squares. So <strong>3/4 = 75%</strong>.
        </Words>
        <Buddy value={75} frac="3/4" word="three quarters" />
      </Scene>

      {/* 5 — whole */}
      <Scene>
        <Words title="A whole is 100%">
          All the pieces together make <strong>1 whole</strong> — and that fills all{' '}
          <strong>100</strong> squares. So <strong>1 whole = 100%</strong>.
        </Words>
        <Buddy value={100} frac="1" word="one whole" />
      </Scene>

      {/* 6 — the family together */}
      <Scene>
        <Words title="The friendly family">
          Here they are all together. These four are worth remembering — you'll see them everywhere!
        </Words>
        <div className="grid gap-3">
          <Buddy value={25} frac="1/4" word="one quarter" />
          <Buddy value={50} frac="1/2" word="one half" />
          <Buddy value={75} frac="3/4" word="three quarters" />
          <Buddy value={100} frac="1" word="one whole" />
        </div>
      </Scene>

      {/* 7 — recap + tease decimals */}
      <Scene>
        <Words title="You did it! 🎉">
          A percent and a fraction can mean the <strong>same amount</strong> — just written a different
          way. <strong>1/2 = 50%</strong>, <strong>1/4 = 25%</strong>, <strong>1 whole = 100%</strong>.
        </Words>
        <p className="text-center text-gray-400 mt-4">
          Coming next: <strong>decimals</strong> — one more way to write these same amounts (like 0.5).
        </p>
      </Scene>
    </div>
  )
}
