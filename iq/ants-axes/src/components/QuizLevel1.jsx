import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Chart from './Chart'

const GRID_SIZE = 480
const CELL_SIZE = 40
const MAX_VALUE = 12
const TOP_PADDING = 25

export default function QuizLevel1({ mode = 'master', onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [inputX, setInputX] = useState('')
  const [inputY, setInputY] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [quizSeed, setQuizSeed] = useState(0)
  const xInputRef = useRef(null)
  const blockEnterRef = useRef(false)

  // Auto-focus X input when question changes
  useEffect(() => {
    if (xInputRef.current && !showResults) {
      setTimeout(() => xInputRef.current?.focus(), 0)
    }
  }, [currentQuestion, showResults])

  // Handle Enter key on results screen to trigger Try Again
  useEffect(() => {
    if (!showResults) return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        blockEnterRef.current = true
        setCurrentQuestion(0)
        setAnswers([])
        setInputX('')
        setInputY('')
        setShowResults(false)
        setQuizSeed((s) => s + 1)
        setTimeout(() => { blockEnterRef.current = false }, 100)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults])

  // Handle Enter key to trigger submit button on quiz screens
  useEffect(() => {
    if (showResults) return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !showResults && !blockEnterRef.current) {
        e.preventDefault()
        handleSubmitAnswer()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, inputX, inputY])

  // Generate 3 random, non-duplicate questions with whole number coordinates
  const questions = useMemo(() => {
    const generateQuestion = () => {
      const x = Math.floor(Math.random() * (MAX_VALUE + 1))
      const y = Math.floor(Math.random() * (MAX_VALUE + 1))
      return { x, y }
    }

    const result = []
    let attempts = 0
    while (result.length < 3 && attempts < 100) {
      const q = generateQuestion()
      if (!result.some((r) => r.x === q.x && r.y === q.y)) {
        result.push(q)
      }
      attempts++
    }
    return result
  }, [quizSeed])

  const currentPoint = questions[currentQuestion]
  const isLastQuestion = currentQuestion === 2

  const handleSubmitAnswer = () => {
    if (blockEnterRef.current) return

    const xVal = parseInt(inputX)
    const yVal = parseInt(inputY)

    if (isNaN(xVal) || isNaN(yVal)) {
      setError('Please enter both X and Y coordinates')
      return
    }

    if (xVal < 0 || xVal > MAX_VALUE || yVal < 0 || yVal > MAX_VALUE) {
      setError(`Coordinates must be 0-${MAX_VALUE}`)
      return
    }

    setError('')
    const isCorrect = xVal === currentPoint.x && yVal === currentPoint.y
    setAnswers([...answers, { x: xVal, y: yVal, correct: isCorrect }])

    if (isLastQuestion) {
      setShowResults(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setInputX('')
      setInputY('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (blockEnterRef.current) {
        e.preventDefault()
      } else {
        e.preventDefault()
        handleSubmitAnswer()
      }
    }
  }

  const score = answers.filter((a) => a.correct).length

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-white rounded-lg shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Complete! 🎉</h1>

            <div className="text-6xl font-bold text-blue-600 mb-4">
              {score}/3
            </div>

            <p className="text-xl text-gray-600 mb-8">
              {score === 3 && "Perfect! You got them all right!"}
              {score === 2 && "Great job! You got 2 out of 3."}
              {score === 1 && "Good effort! You got 1 out of 3. Keep practicing!"}
              {score === 0 && "Don't worry! Review the coordinates and try again."}
            </p>

            {/* Answer Review */}
            <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    answers[idx]?.correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <p className="font-semibold text-gray-800">Question {idx + 1}</p>
                  <p className="text-sm text-gray-600">
                    Correct answer: <span className="font-bold">({q.x}, {q.y})</span>
                  </p>
                  {answers[idx] && (
                    <p className="text-sm text-gray-600">
                      Your answer: <span className="font-bold">({answers[idx].x}, {answers[idx].y})</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers([])
                  setInputX('')
                  setInputY('')
                  setShowResults(false)
                  setQuizSeed((s) => s + 1)
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
              <motion.button
                onClick={onBack}
                className="w-full bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Levels
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Level 1: Read Coordinates</h1>
            <span className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
              Question {currentQuestion + 1}/3
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / 3) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Quiz Container - Chart left, input right on desktop; stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Chart */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-600 text-sm mb-4 font-semibold">Look at the blue point:</p>
            <Chart points={[currentPoint]} onPointClick={() => {}} showCoordinates={false} />
          </motion.div>

          {/* Input */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">Coordinates?</h2>

            {/* X and Y inputs stacked vertically */}
            <div className="space-y-2 mb-3">
              <input
                ref={xInputRef}
                type="number"
                min="0"
                max="12"
                value={inputX}
                onChange={(e) => setInputX(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="X (0-12)"
                className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              />

              <input
                type="number"
                min="0"
                max="12"
                value={inputY}
                onChange={(e) => setInputY(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Y (0-12)"
                className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 rounded mb-3 text-xs"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Buttons */}
            <div className="space-y-1.5">
              <motion.button
                onClick={handleSubmitAnswer}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-1.5 rounded hover:shadow-lg transition-shadow text-xs"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLastQuestion ? '✓ Finish' : '→ Next'}
              </motion.button>

              <motion.button
                onClick={onBack}
                className="w-full bg-gray-300 text-gray-700 font-semibold py-1.5 rounded hover:bg-gray-400 transition-colors text-xs"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
