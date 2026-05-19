import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Chart from './Chart'

const GRID_SIZE = 480
const CELL_SIZE = 40
const MAX_VALUE = 12
const TOP_PADDING = 25

export default function QuizLevel3({ mode = 'master', onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [inputIntercept, setInputIntercept] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Auto-focus input when question changes
  useEffect(() => {
    if (inputRef.current && !showResults) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [currentQuestion, showResults])

  // Handle Enter key on results screen to trigger Try Again
  useEffect(() => {
    if (!showResults) return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        setCurrentQuestion(0)
        setAnswers([])
        setInputIntercept('')
        setShowResults(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults])

  // Handle Enter key to trigger submit button on quiz screens
  useEffect(() => {
    if (showResults) return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !showResults) {
        e.preventDefault()
        handleSubmitAnswer()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, inputIntercept])

  // Generate 3 random questions with whole number y-intercepts
  const questions = useMemo(() => {
    const generateQuestion = () => {
      let x1, y1, x2, y2, yIntercept, slope
      let attempts = 0

      do {
        yIntercept = 1 + Math.floor(Math.random() * (MAX_VALUE - 2)) // 1-10
        slope = -2 + Math.floor(Math.random() * 5) // slope from -2 to 2
        if (slope === 0) slope = 1

        // Generate two points on the line: y = mx + b
        // where m = slope, b = yIntercept
        const dx = 1 + Math.floor(Math.random() * 2)
        x1 = 1 + Math.floor(Math.random() * (MAX_VALUE - 3))
        y1 = Math.round(slope * x1 + yIntercept)
        x2 = x1 + dx
        y2 = Math.round(slope * x2 + yIntercept)
        attempts++
      } while ((y1 < 0 || y1 > MAX_VALUE || y2 < 0 || y2 > MAX_VALUE) && attempts < 10)

      return { x1, y1, x2, y2, yIntercept }
    }

    return [generateQuestion(), generateQuestion(), generateQuestion()]
  }, [])

  const currentQuestion_ = questions[currentQuestion]
  const isLastQuestion = currentQuestion === 2

  const handleSubmitAnswer = () => {
    const interceptVal = parseInt(inputIntercept)

    if (isNaN(interceptVal)) {
      setError('Please enter the y-intercept')
      return
    }

    if (interceptVal < 0 || interceptVal > 12) {
      setError('Y-intercept must be between 0 and 12')
      return
    }

    setError('')
    const isCorrect = interceptVal === currentQuestion_.yIntercept
    setAnswers([...answers, { intercept: interceptVal, correct: isCorrect }])

    if (isLastQuestion) {
      setShowResults(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setInputIntercept('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer()
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
              {score === 0 && "Don't worry! Review the y-intercepts and try again."}
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
                    Points: ({q.x1}, {q.y1}) and ({q.x2}, {q.y2})
                  </p>
                  <p className="text-sm text-gray-600">
                    Correct y-intercept: <span className="font-bold">{q.yIntercept}</span>
                  </p>
                  {answers[idx] && (
                    <p className="text-sm text-gray-600">
                      Your answer: <span className="font-bold">{answers[idx].intercept}</span>
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
                  setInputIntercept('')
                  setShowResults(false)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Level 3: Find Y-Intercept</h1>
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

        {/* Quiz Container - Single column */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Chart */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-600 text-sm mb-4 font-semibold">Where does this line cross the Y-axis?</p>
            <Chart
              points={[
                { x: currentQuestion_.x1, y: currentQuestion_.y1 },
                { x: currentQuestion_.x2, y: currentQuestion_.y2 }
              ]}
              onPointClick={() => {}}
              showCoordinates={false}
            />
          </motion.div>

          {/* Input */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">Y-Intercept?</h2>

            {/* Intercept input */}
            <div className="mb-3">
              <input
                ref={inputRef}
                type="number"
                min="0"
                max="12"
                value={inputIntercept}
                onChange={(e) => setInputIntercept(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Y value at X=0"
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
