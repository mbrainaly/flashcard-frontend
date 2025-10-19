import { useState } from 'react'
import { motion } from 'framer-motion'
import { ICard } from '@/types/card'
import { useSession } from 'next-auth/react'
import { fetchWithAuth } from '@/utils/fetchWithAuth'
import {
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface ExamModeProps {
  card: ICard
  onNext: () => void
  onReview: (quality: number) => void
  currentCardIndex?: number
  totalCards?: number
  showProgress?: boolean
}

interface FeedbackType {
  score: number
  explanation: string
  suggestions: string[]
}

export default function ExamMode({ 
  card, 
  onNext, 
  onReview,
  currentCardIndex = 0,
  totalCards = 1,
  showProgress = true,
}: ExamModeProps) {
  const { data: session } = useSession()
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (!session?.user?.accessToken) {
        console.error('No access token found:', session?.user)
        throw new Error('Authentication token not found')
      }

      const requestData = {
        cardId: card._id,
        answer,
        correctAnswer: card.back,
      }
      console.log('Submitting answer with data:', requestData)
      console.log('Using token:', session.user.accessToken)

      const response = await fetchWithAuth('/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        throw new Error(`Failed to evaluate answer: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      console.log('Full evaluation response:', data)

      // Set feedback directly from the response
      setFeedback(data)
      // Don't call onReview here - wait for user to click Next
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setError(error instanceof Error ? error.message : 'Failed to evaluate answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    // Call onReview with the score when user clicks Next
    if (feedback) {
      onReview(feedback.score)
    }
    setAnswer('')
    setFeedback(null)
    onNext()
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Question Card */}
      <div className="rounded-2xl bg-glass backdrop-blur-sm p-8 ring-1 ring-accent-silver/10">
        <h3 className="text-xl font-medium text-white mb-4">Question</h3>
        <p className="text-lg text-accent-silver mb-8">{card.front}</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Answer Section */}
        <div className="space-y-4">
          <label htmlFor="answer" className="block text-sm font-medium text-accent-silver">
            Your Answer
          </label>
          <textarea
            id="answer"
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!feedback}
            className="w-full rounded-lg bg-white/5 border border-accent-silver/10 px-4 py-3 text-white placeholder-accent-silver/50 focus:border-accent-neon focus:outline-none focus:ring-1 focus:ring-accent-neon disabled:opacity-50"
            placeholder="Type your answer here..."
          />
        </div>

        {/* Submit Button */}
        {!feedback && (
          <motion.button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-neon px-8 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Evaluating...
              </>
            ) : (
              'Submit Answer'
            )}
          </motion.button>
        )}

        {/* Debug Info - Remove in production */}
        

        {/* Feedback Section */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <div className="rounded-lg bg-white/5 p-6">
              {/* Score */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`rounded-full p-2 ${feedback.score >= 4 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {feedback.score >= 4 ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : (
                    <XMarkIcon className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-white">Score: {feedback.score}/5</h4>
                </div>
              </div>

              {/* Your Answer */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-accent-silver mb-2">Your Answer:</h4>
                <p className="text-white bg-white/5 rounded-lg p-4 whitespace-pre-wrap">{answer}</p>
              </div>

              {/* Correct Answer */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-accent-silver mb-2">Correct Answer:</h4>
                <p className="text-white bg-white/5 rounded-lg p-4 whitespace-pre-wrap">{card.back}</p>
              </div>

              {/* Explanation */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-accent-silver mb-2">Feedback:</h4>
                <p className="text-white bg-white/5 rounded-lg p-4 whitespace-pre-wrap">{feedback.explanation}</p>
              </div>

              {/* Suggestions */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-accent-silver mb-2">Suggestions for Improvement:</h4>
                  <ul className="list-disc list-inside space-y-2 bg-white/5 rounded-lg p-4">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-white">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Button */}
            <motion.button
              onClick={handleNext}
              className="w-full rounded-full bg-accent-neon px-8 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next Question
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
} 