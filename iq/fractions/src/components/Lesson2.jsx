import Scene from './Scene'
import Pie from './Pie'
import FractionLabel from './FractionLabel'
import ShadePrompt from './prompts/ShadePrompt'
import AddPrompt from './prompts/AddPrompt'

const range = (n) => Array.from({ length: n }, (_, i) => i)

function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

// Lesson 2 — equivalent fractions + adding and subtracting with the same
// bottom number. Still very concrete: every rule is shown with pies first.
export default function Lesson2() {
  return (
    <div className="pb-24">
      {/* 1 — recap */}
      <Scene>
        <Words title="Lesson 2: A little trickier">
          You already know a fraction is <strong>pieces of a whole</strong>. Now let's discover two cool
          things: fractions that look different but are the <strong>same</strong>, and how to{' '}
          <strong>add</strong> and <strong>subtract</strong> them. 🐜
        </Words>
        <div className="flex justify-center">
          <Pie parts={4} shaded={[0, 1]} size={220} />
        </div>
      </Scene>

      {/* 2 — equivalent fractions: 2/4 = 1/2 */}
      <Scene>
        <Words title="Same amount, different numbers">
          Look carefully. <strong>2 out of 4</strong> pieces covers exactly as much pie as{' '}
          <strong>1 out of 2</strong>. They are the <strong>same amount</strong>!
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="text-center">
            <Pie parts={4} shaded={[0, 1]} size={170} />
            <div className="mt-2 flex justify-center"><FractionLabel num={2} den={4} /></div>
          </div>
          <span className="text-4xl font-black text-amber-500">=</span>
          <div className="text-center">
            <Pie parts={2} shaded={[0]} size={170} />
            <div className="mt-2 flex justify-center"><FractionLabel num={1} den={2} /></div>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          Fractions that show the same amount are called <strong>equivalent fractions</strong>.
        </p>
      </Scene>

      {/* 3 — a family of equal fractions */}
      <Scene>
        <Words title="A whole family of halves">
          Here is one half, shown three ways. The pieces get smaller and there are more of them — but the
          shaded amount never changes.
        </Words>
        <div className="flex flex-wrap items-end justify-center gap-8">
          {[[2, 1], [4, 2], [8, 4]].map(([d, n]) => (
            <div key={d} className="text-center">
              <Pie parts={d} shaded={range(n)} size={140} />
              <div className="mt-3 flex justify-center"><FractionLabel num={n} den={d} /></div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          <strong>1/2 = 2/4 = 4/8</strong>. All one half! 🥧
        </p>
      </Scene>

      {/* 4 — try it: shade one half of a quartered pie */}
      <Scene>
        <ShadePrompt den={4} target={2} />
        <p className="text-center text-gray-400 mt-5">
          You just shaded <strong>2/4</strong> — which is the same as <strong>1/2</strong>. 😊
        </p>
      </Scene>

      {/* 5 — adding same denominator */}
      <Scene>
        <Words title="Adding fractions">
          When the bottom numbers are the <strong>same</strong>, adding is easy: just{' '}
          <strong>add the top numbers</strong> and keep the bottom the same.
        </Words>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Pie parts={4} shaded={[0]} size={120} />
          <span className="text-3xl font-black text-gray-400">+</span>
          <Pie parts={4} shaded={[0, 1]} size={120} />
          <span className="text-3xl font-black text-gray-400">=</span>
          <Pie parts={4} shaded={[0, 1, 2]} size={120} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">
          1/4 + 2/4 = 3/4
        </p>
        <p className="text-center text-gray-500 mt-2">
          One piece plus two pieces makes three pieces — all quarters.
        </p>
      </Scene>

      {/* 6 — try it: add */}
      <Scene>
        <AddPrompt den={5} a={2} b={2} op="+" />
      </Scene>

      {/* 7 — subtracting same denominator */}
      <Scene>
        <Words title="Subtracting fractions">
          Subtracting works the same way: the bottoms match, so just{' '}
          <strong>take away the top numbers</strong>. Here we start with 3 pieces and eat 1.
        </Words>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Pie parts={4} shaded={[0, 1, 2]} size={120} />
          <span className="text-3xl font-black text-gray-400">−</span>
          <Pie parts={4} shaded={[0]} size={120} />
          <span className="text-3xl font-black text-gray-400">=</span>
          <Pie parts={4} shaded={[0, 1]} size={120} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">
          3/4 − 1/4 = 2/4
        </p>
      </Scene>

      {/* 8 — try it: subtract */}
      <Scene>
        <AddPrompt den={6} a={5} b={2} op="−" />
      </Scene>

      {/* 9 — why bottoms must match (teaser) */}
      <Scene>
        <Words title="One important rule">
          We can only add or subtract pieces that are the <strong>same size</strong>. That's why the
          bottom numbers have to match.
        </Words>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Pie parts={2} shaded={[0]} size={130} />
          <span className="text-3xl font-black text-gray-400">+</span>
          <Pie parts={4} shaded={[0]} size={130} />
          <span className="text-3xl font-black text-gray-400">= ?</span>
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          A half and a quarter are <strong>different sizes</strong>, so we can't just add the tops. First we
          make the pieces match — remember, <strong>1/2 is the same as 2/4</strong>! Then it's easy:
          2/4 + 1/4 = 3/4. We'll practice that next time.
        </p>
      </Scene>

      {/* 10 — celebrate */}
      <Scene>
        <Words title="You're getting good at this! 🎉">
          You learned <strong>equivalent fractions</strong> (1/2 = 2/4 = 4/8), and how to{' '}
          <strong>add and subtract</strong> fractions when the bottoms match. Try the{' '}
          <strong>📚 Quiz</strong> and a <strong>🖨 Worksheet</strong> to practice!
        </Words>
        <div className="flex justify-center">
          <Pie parts={8} shaded={range(8)} size={200} />
        </div>
      </Scene>
    </div>
  )
}
