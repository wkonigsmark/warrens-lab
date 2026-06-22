import React, { useState, useEffect } from 'react'
import statesData from '../data/states.json'

interface State {
  id: string
  name: string
  capital: string
  emoji: string
  abbr: string
  fun_fact: string
}

interface Question {
  id: string
  type: 'capital' | 'state'
  question: string
  correct: string
  options: string[]
}

interface QuizProps {
  regionId: string
  onBack: () => void
  onGoToMap: () => void
}

const Quiz: React.FC<QuizProps> = ({ regionId, onBack, onGoToMap }) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    generateQuestions()
  }, [regionId])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && answered && !complete) {
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [answered, complete, currentIndex, questions.length])

  const generateQuestions = () => {
    const region = statesData.regions.find((r: any) => r.id === regionId)
    if (!region) return

    const states: State[] = region.states
    const newQuestions: Question[] = []

    states.forEach((state) => {
      const otherStates = states.filter((s) => s.id !== state.id)
      const wrongOptions = otherStates
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => s.capital)

      newQuestions.push({
        id: `${state.id}-capital`,
        type: 'capital',
        question: `What is the capital of ${state.name}?`,
        correct: state.capital,
        options: [state.capital, ...wrongOptions].sort(() => Math.random() - 0.5),
      })
    })

    states.forEach((state) => {
      const otherStates = states.filter((s) => s.id !== state.id)
      const wrongOptions = otherStates
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => s.name)

      newQuestions.push({
        id: `${state.id}-state`,
        type: 'state',
        question: `${state.capital} is the capital of which state?`,
        correct: state.name,
        options: [state.name, ...wrongOptions].sort(() => Math.random() - 0.5),
      })
    })

    setQuestions(newQuestions.sort(() => Math.random() - 0.5))
  }

  const handleAnswer = (option: string) => {
    if (answered) return

    setSelectedAnswer(option)
    setAnswered(true)

    if (option === questions[currentIndex].correct) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswered(false)
      setSelectedAnswer(null)
    } else {
      setComplete(true)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setScore(0)
    setAnswered(false)
    setSelectedAnswer(null)
    setComplete(false)
    generateQuestions()
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (complete) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">
            {percentage === 100 ? '🎉' : percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <p className="text-lg text-gray-700 mb-6">
            You scored <span className="font-bold text-blue-600">{score}</span> out of{' '}
            <span className="font-bold">{questions.length}</span> ({percentage}%)
          </p>
          <div className="space-y-2">
            <button
              onClick={handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Back to Regions
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded transition"
              >
                ← Menu
              </button>
              <button
                onClick={onGoToMap}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded transition"
              >
                🗺️ Map
              </button>
            </div>
            <span className="text-sm font-semibold text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-blue-600">Score: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correct
              const isSelected = option === selectedAnswer
              const showResult = answered && (isCorrect || isSelected)

              let bgColor = 'bg-gray-50 hover:bg-gray-100'
              let borderColor = 'border-gray-200'
              let textColor = 'text-gray-900'

              if (showResult) {
                if (isCorrect) {
                  bgColor = 'bg-green-50'
                  borderColor = 'border-green-400'
                  textColor = 'text-green-900'
                } else if (isSelected) {
                  bgColor = 'bg-red-50'
                  borderColor = 'border-red-400'
                  textColor = 'text-red-900'
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={`w-full p-4 rounded-lg border-2 text-left font-medium transition ${bgColor} ${borderColor} ${textColor} ${
                    answered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && (isCorrect ? <span>✓</span> : <span>✗</span>)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {currentIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz
