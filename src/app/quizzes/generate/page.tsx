'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import QuizGenerator from '@/components/quiz/QuizGenerator'
import QuizConfigForm, { QuizConfig } from '@/components/quiz/QuizConfigForm'

type GenerationStep = 'input' | 'config' | 'generating'

interface ContentAnalysis {
  content: string
  keyConcepts: string[]
  suggestedTopics: string[]
  recommendedDifficulty: string
  estimatedQuestions: number
}

export default function QuizGenerationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<GenerationStep>('input')
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalysisComplete = (results: ContentAnalysis) => {
    setAnalysis(results)
    setStep('config')
  }

  const handleConfigSubmit = async (config: QuizConfig) => {
    if (!analysis) return

    try {
      setStep('generating')
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          ...config,
          content: analysis.content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create quiz')
      }

      const quiz = await response.json()
      router.push(`/quizzes/${quiz._id}`)
    } catch (error) {
      console.error('Error creating quiz:', error)
      setError('Failed to create quiz. Please try again.')
      setStep('config')
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {step === 'input' && 'Generate a Quiz'}
            {step === 'config' && 'Configure Your Quiz'}
            {step === 'generating' && 'Creating Your Quiz'}
          </h1>
          <p className="mt-4 text-lg text-accent-silver">
            {step === 'input' && 
              'Upload content or paste text to automatically generate an AI-powered quiz.'
            }
            {step === 'config' && 
              'Customize your quiz settings to match your needs.'
            }
            {step === 'generating' && 
              'Please wait while we generate your quiz...'
            }
          </p>
        </motion.div>

        {step === 'input' && (
          <QuizGenerator onAnalysisComplete={handleAnalysisComplete} />
        )}

        {step === 'config' && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
          >
            <QuizConfigForm
              suggestedQuestions={analysis.estimatedQuestions}
              suggestedDifficulty={analysis.recommendedDifficulty}
              suggestedTopics={analysis.suggestedTopics}
              onSubmit={handleConfigSubmit}
            />
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-4 py-12"
          >
            <div className="w-16 h-16 border-4 border-accent-neon border-t-transparent rounded-full animate-spin" />
            <p className="text-accent-silver">Generating your quiz with AI...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-red-500 text-center"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  )
} 