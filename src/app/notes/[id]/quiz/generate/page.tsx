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
  const [numQuestions, setNumQuestions] = useState(10)

  const handleGenerateQuiz = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      if (!session?.user?.accessToken) {
        throw new Error('Not authenticated')
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

      console.log('Quiz generated successfully:', data.quiz)
      
      // Add a small delay before redirecting to ensure the quiz is saved
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push(`/notes/${id}/quiz`)
    } catch (err) {
      console.error('Error generating quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value > 0 && value <= 100) {
      setNumQuestions(value)
    }
  }

  return (
    <div className="min-h-screen bg-accent-obsidian">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              onClick={() => router.back()}
              className="p-2 text-accent-silver hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </motion.button>
            <h1 className="text-3xl font-bold text-white">Generate Quiz</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <div className="bg-glass backdrop-blur-sm rounded-xl p-8 text-center">
            {isGenerating ? (
              <div className="space-y-4">
                <LoadingSpinner />
                <h2 className="text-xl font-semibold text-white">Generating Quiz</h2>
                <p className="text-accent-silver">
                  Please wait while our AI analyzes your notes and creates challenging questions...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-16 w-16 bg-accent-neon/20 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="h-8 w-8 text-accent-neon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Ready to Generate Quiz?</h2>
                <p className="text-accent-silver max-w-md mx-auto">
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
                    className="w-full px-4 py-2 bg-white/5 rounded-lg text-white text-center
                      border-2 border-accent-silver/30 focus:border-accent-neon
                      focus:outline-none transition-colors"
                  />
                </div>

                <motion.button
                  onClick={handleGenerateQuiz}
                  className="px-6 py-3 bg-accent-neon text-black rounded-xl hover:bg-accent-neon/90 transition-colors mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Generate Quiz
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 