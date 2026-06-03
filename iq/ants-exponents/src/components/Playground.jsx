import { useState } from 'react'
import { motion } from 'framer-motion'
import DotArray from './DotArray'
import PowerLabel from './PowerLabel'
import GrowthChain from './GrowthChain'

// 🧭 Play — the drag-to-explore mode. The child sets the base and the exponent
// with big + / − steppers and everything updates live: the power, the worked-out
// answer, a matching picture (a real square at exponent 2, stacked "layers" at
// exponent 3), the growth staircase, and a little "look how much faster this
// grows than plain multiplying" surprise. Curiosity-pipeline: poke a number,
// see the whole world change.

const BASE_MIN = 2
const BASE_MAX = 10
const EXP_MIN = 1
const EXP_MAX = 6

// Keep the literal square / cube pictures only while they're small enough to
// actually count. Past that we celebrate that it's "too big to draw" — which is
// the whole point of exponents.
const DRAWABLE_BASE = 6

export default function Playground() {
  const [base, setBase] = useState(3)
  const [exp, setExp] = useState(2)

  const value = base ** exp
  const timesedUp = base * exp // what plain "adding the base exp times" would give

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-6">
      {/* the two dials */}
      <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-14">
          <Stepper
            label="Base"
            sub="the number we multiply"
            color="text-indigo-600"
            value={base}
            min={BASE_MIN}
            max={BASE_MAX}
            onChange={setBase}
          />
          <Stepper
            label="Exponent"
            sub="how many times we use it"
            color="text-violet-600"
            value={exp}
            min={EXP_MIN}
            max={EXP_MAX}
            onChange={setExp}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <PowerLabel base={base} exp={exp} expand value big />
        </div>

        <p className="text-center text-gray-500 mt-6 text-lg">
          We say <em>“{reading(base, exp)}.”</em>
        </p>
      </div>

      {/* the matching picture */}
      <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
        <Picture base={base} exp={exp} value={value} />
      </div>

      {/* climbing staircase for this base */}
      <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
        <p className="text-center font-extrabold text-gray-700 mb-1">
          Powers of {base}, climbing up to {base}<sup>{exp}</sup>
        </p>
        <p className="text-center text-gray-400 text-sm mb-5">each step multiplies by {base} again</p>
        <GrowthChain key={base} base={base} upto={exp} />
      </div>

      {/* the "grows faster" surprise */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
        <p className="font-extrabold text-lg mb-3">⚡ Fast multiplying vs. plain multiplying</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xl font-bold">
          <span className="opacity-90">
            {base} × {exp} = <span className="font-black">{timesedUp}</span>
          </span>
          <span className="opacity-70 text-sm">but</span>
          <span>
            {base}<sup>{exp}</sup> = <span className="font-black text-2xl">{value.toLocaleString()}</span>
          </span>
        </div>
        <p className="mt-4 text-white/90">
          {exp === 1
            ? `Using the base just once, they're the same: ${value}.`
            : value === timesedUp
            ? `Here they happen to match — try changing a number!`
            : `Same two numbers — but the exponent makes it ${Math.round(value / timesedUp) >= 2 ? `about ${Math.round(value / timesedUp)}× bigger` : 'bigger'}. That's why exponents grow so fast! 🚀`}
        </p>
      </div>
    </div>
  )
}

function Picture({ base, exp, value }) {
  if (base > DRAWABLE_BASE || exp > 3) {
    return (
      <div>
        <p className="text-2xl font-black text-gray-700 mb-2">Too big to draw! 😮</p>
        <p className="text-gray-500">
          {base}<sup>{exp}</sup> is <strong>{value.toLocaleString()}</strong> little squares — way too many
          to fit on the screen. That's the power of exponents: small numbers, huge results.
        </p>
      </div>
    )
  }

  if (exp === 1) {
    return (
      <div>
        <p className="text-gray-500 mb-4">
          The base used <strong>once</strong> — just a row of {base}.
        </p>
        <div className="flex justify-center">
          <DotArray rows={1} cols={base} />
        </div>
      </div>
    )
  }

  if (exp === 2) {
    return (
      <div>
        <p className="text-gray-500 mb-4">
          Exponent 2 makes a <strong>perfect square</strong> — {base} across and {base} down.
        </p>
        <div className="flex justify-center">
          <DotArray rows={base} cols={base} cell={26} gap={6} />
        </div>
      </div>
    )
  }

  // exp === 3 → "base" layers of a base×base square = a cube
  return (
    <div>
      <p className="text-gray-500 mb-4">
        Exponent 3 stacks <strong>{base}</strong> squares — like the layers of a cube.
      </p>
      <div className="flex flex-wrap justify-center items-center gap-3">
        {Array.from({ length: base }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && <span className="text-2xl font-black text-gray-300">+</span>}
            <DotArray rows={base} cols={base} cell={18} gap={4} />
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-4">
        {base} layers × {base * base} per square = <strong>{value}</strong>.
      </p>
    </div>
  )
}

function Stepper({ label, sub, color, value, min, max, onChange }) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))
  return (
    <div className="text-center">
      <div className={`font-black ${color}`}>{label}</div>
      <div className="text-xs text-gray-400 mb-2">{sub}</div>
      <div className="flex items-center justify-center gap-3">
        <RoundButton onClick={dec} disabled={value <= min} label="−" />
        <motion.div
          key={value}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`w-16 text-5xl font-black ${color}`}
        >
          {value}
        </motion.div>
        <RoundButton onClick={inc} disabled={value >= max} label="+" />
      </div>
    </div>
  )
}

function RoundButton({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-11 h-11 rounded-full bg-gray-100 text-gray-700 text-2xl font-black flex items-center justify-center hover:bg-gray-200 active:scale-90 transition disabled:opacity-30"
    >
      {label}
    </button>
  )
}

function numberWord(n) {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  return words[n] ?? String(n)
}

// How a child would read the power out loud, with the friendly nicknames.
function reading(base, exp) {
  const b = numberWord(base)
  if (exp === 1) return `${b} to the power of one — just ${b}`
  if (exp === 2) return `${b} to the power of two, or ${b} squared`
  if (exp === 3) return `${b} to the power of three, or ${b} cubed`
  return `${b} to the power of ${numberWord(exp)}`
}
