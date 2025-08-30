'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function GenerateQuizPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = useParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numQuestions, setNumQuestions] = useState<number | ''>('')

  const isValidCount = typeof numQuestions === 'number' && numQuestions >= 1 && numQuestions <= 100

  const handleGenerateQuiz = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      if (!session?.user?.accessToken) {
        throw new Error('Not authenticated')
      }

      if (!isValidCount) {
        throw new Error('Please enter a number between 1 and 100')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/notes/${id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ numQuestions }),
      })

      const data = await response.json()
      console.log('Quiz generation response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate quiz')
      }

      if (!data.success || !data.quiz) {
        throw new Error('Invalid quiz data received')
      }

      // Small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/notes/${id}/quiz`)
    } catch (err) {
      console.error('Error generating quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setNumQuestions('')
      return
    }
    const n = Number(value)
    if (Number.isFinite(n)) {
      setNumQuestions(Math.min(100, Math.max(1, Math.floor(n))))
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-accent-silver hover:text-white">
          <ArrowLeftIcon className="h-5 w-5" /> Back
        </button>

        <div className="mt-8 bg-glass backdrop-blur-sm rounded-xl ring-1 ring-accent-silver/10 p-8">
          <div className="text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-accent-neon/10 text-accent-neon grid place-items-center mx-auto">
              <span className="text-2xl">💡</span>
            </div>
            <h1 className="text-2xl font-semibold text-white">Ready to Generate Quiz?</h1>
            <p className="text-accent-silver max-w-xl mx-auto">
              Our AI will analyze your notes and create a comprehensive quiz to test your understanding.
              The quiz will include multiple-choice questions with explanations for each answer.
            </p>
            
            <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
              <label htmlFor="numQuestions" className="text-accent-silver">
                Number of Questions (1-100):
              </label>
              <input
                id="numQuestions"
                type="number"
                min="1"
                max="100"
                value={numQuestions}
                onChange={handleNumQuestionsChange}
                placeholder="Enter a number"
                className="w-full px-4 py-2 bg-white/5 rounded-lg text-white text-center
                  border-2 border-accent-silver/30 focus:border-accent-neon
                  focus:outline-none transition-colors"
              />
            </div>

            <motion.button
              onClick={handleGenerateQuiz}
              className="px-6 py-3 bg-accent-neon text-black rounded-xl hover:bg-accent-neon/90 transition-colors mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isValidCount || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Quiz'}
            </motion.button>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 