import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ICard } from '@/types/card'
import { useSession } from 'next-auth/react'
import { fetchWithAuth } from '@/utils/fetchWithAuth'
import {
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'

interface QuizModeProps {
  card: ICard
  onNext: () => void
  onReview: (quality: number) => void
}

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

const defaultQuestion: QuizQuestion = {
  question: '',
  options: [],
  correctIndex: 0
}

const validateQuizData = (data: any): QuizQuestion => {
  if (!data || typeof data !== 'object') {
    return defaultQuestion
  }

  const question = typeof data.question === 'string' ? data.question : ''
  const options = Array.isArray(data.options) ? data.options.map(opt => String(opt)) : []
  const correctIndex = typeof data.correctIndex === 'number' && !isNaN(data.correctIndex) && data.correctIndex >= 0
    ? Math.min(Math.floor(data.correctIndex), options.length - 1)
    : 0

  return {
    question,
    options,
    correctIndex: options.length > 0 ? correctIndex : 0
  }
}

export default function QuizMode({ card, onNext, onReview }: QuizModeProps) {
  const { data: session } = useSession()
  const [question, setQuestion] = useState<QuizQuestion>(defaultQuestion)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [key, setKey] = useState(card._id)

  // Reset state when card changes
  useEffect(() => {
    if (card._id !== key) {
      setKey(card._id)
      setQuestion(defaultQuestion)
      setSelectedOption(null)
      setIsLoading(true)
      setError('')
      generateQuestion()
    }
  }, [card._id])

  // Initial question generation
  useEffect(() => {
    if (card?._id) {
      generateQuestion()
    }
  }, [])

  const generateQuestion = async () => {
    if (!card?._id || !session?.user?.accessToken) {
      setQuestion(defaultQuestion)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setSelectedOption(null)
    
    try {
      const response = await fetchWithAuth('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card._id, front: card.front, back: card.back }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz question')
      }

      const rawData = await response.json()
      const validatedQuestion = validateQuizData(rawData)
      
      if (card._id === key) { // Only update if we're still on the same card
        setQuestion(validatedQuestion)
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      setError('Failed to generate quiz question')
      setQuestion(defaultQuestion)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || !Number.isInteger(index) || index < 0) return
    setSelectedOption(index)

    const quality = index === question.correctIndex ? 5 : 1
    onReview(quality)
  }

  const handleNext = () => {
    setSelectedOption(null)
    onNext()
  }

  if (error) {
    return (
      <div className="mt-8 max-w-2xl mx-auto text-center">
        <p className="text-red-500">{error}</p>
        <motion.button
          onClick={generateQuestion}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-neon px-6 py-2 text-sm font-semibold text-accent-obsidian"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Try Again
        </motion.button>
      </div>
    )
  }

  if (isLoading || !question.options.length) {
    return (
      <div className="mt-8 max-w-2xl mx-auto text-center">
        <ArrowPathIcon className="h-8 w-8 text-accent-silver animate-spin mx-auto" />
        <p className="mt-4 text-accent-silver">Generating quiz question...</p>
      </div>
    )
  }

  const isCorrect = selectedOption === question.correctIndex

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      {/* Question */}
      <div className="rounded-2xl bg-glass backdrop-blur-sm p-8 ring-1 ring-accent-silver/10">
        <h3 className="text-lg font-medium text-white">Question</h3>
        <p className="mt-2 text-accent-silver">{question.question}</p>

        {/* Options */}
        <div className="mt-6 space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index
            const isCorrect = question.correctIndex === index
            const showResult = selectedOption !== null

            return (
              <motion.button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
                className={`w-full text-left rounded-xl p-4 transition-all ${
                  isSelected
                    ? isCorrect
                      ? 'bg-accent-neon/20 text-accent-neon ring-2 ring-accent-neon'
                      : 'bg-red-500/20 text-red-500 ring-2 ring-red-500'
                    : showResult && isCorrect
                    ? 'bg-accent-neon/20 text-accent-neon ring-2 ring-accent-neon'
                    : 'bg-white/5 text-white hover:bg-white/10 ring-1 ring-accent-silver/10'
                }`}
                whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                whileTap={selectedOption === null ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option}</span>
                  {showResult && (isSelected || isCorrect) && (
                    <span className="ml-2">
                      {isCorrect ? (
                        <CheckIcon className="h-5 w-5 text-accent-neon" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-red-500" />
                      )}
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Result Feedback */}
        {selectedOption !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl ${
              isCorrect ? 'bg-accent-neon/10' : 'bg-red-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckIcon className="h-6 w-6 text-accent-neon" />
              ) : (
                <XMarkIcon className="h-6 w-6 text-red-500" />
              )}
              <h4 className={`font-medium ${
                isCorrect ? 'text-accent-neon' : 'text-red-500'
              }`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h4>
            </div>
            <div className="mt-3 flex items-start gap-2">
              <LightBulbIcon className="h-5 w-5 text-accent-silver mt-0.5 flex-shrink-0" />
              <p className="text-sm text-accent-silver">
                {isCorrect
                  ? "Great job! You've mastered this concept."
                  : question.options[question.correctIndex] 
                    ? `The correct answer was: ${question.options[question.correctIndex]}. Review the card again to reinforce your understanding.`
                    : 'Review the card again to reinforce your understanding.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Next button */}
      {selectedOption !== null && (
        <motion.button
          onClick={handleNext}
          className="mt-6 w-full rounded-full bg-accent-neon px-6 py-2 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Next Question
        </motion.button>
      )}
    </div>
  )
}