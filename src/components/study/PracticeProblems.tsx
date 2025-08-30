'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  PencilSquareIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

interface Problem {
  id: string
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  topic: string
}

interface PracticeResponse {
  isCorrect: boolean
  explanation: string
  nextSteps?: string[]
}

export default function PracticeProblems() {
  const { data: session } = useSession()
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [numProblems, setNumProblems] = useState(5)
  const [problems, setProblems] = useState<Problem[]>([])
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [response, setResponse] = useState<PracticeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateProblems = async () => {
    try {
      if (!session?.user?.accessToken) return
      if (!subject || !topic) {
        setError('Please enter both subject and topic')
        return
      }

      setIsLoading(true)
      setError(null)
      setProblems([])
      setCurrentProblemIndex(0)
      setResponse(null)

      const response = await fetchWithAuth('/api/ai/generate-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, difficulty, numProblems }),
      })

      const data = await response.json()
      setProblems(data.problems)
    } catch (err) {
      console.error('Error generating problems:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate problems')
    } finally {
      setIsLoading(false)
    }
  }

  const checkAnswer = async () => {
    try {
      if (!session?.user?.accessToken || !userAnswer) return
      
      setIsLoading(true)
      setError(null)

      const response = await fetchWithAuth('/api/ai/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problems[currentProblemIndex].id,
          userAnswer,
          correctAnswer: problems[currentProblemIndex].correctAnswer
        }),
      })

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      console.error('Error checking answer:', err)
      setError(err instanceof Error ? err.message : 'Failed to check answer')
    } finally {
      setIsLoading(false)
    }
  }

  const nextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1)
      setUserAnswer('')
      setResponse(null)
    }
  }

  const currentProblem = problems[currentProblemIndex]

  return (
    <div className="space-y-6">
      {/* Problem Generation Form */}
      <div className="bg-white/5 rounded-xl p-6 border border-accent-silver/20">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <PencilSquareIcon className="h-5 w-5 text-accent-neon" />
          Generate Practice Problems
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-accent-silver mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white/5 border border-accent-silver/20 rounded-lg px-4 py-2 text-white
                focus:ring-2 focus:ring-accent-neon focus:border-transparent"
              placeholder="Enter subject (e.g., Mathematics)"
            />
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-accent-silver mb-2">
              Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-accent-silver/20 rounded-lg px-4 py-2 text-white
                focus:ring-2 focus:ring-accent-neon focus:border-transparent"
              placeholder="Enter specific topic"
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-accent-silver mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full bg-white/5 border border-accent-silver/20 rounded-lg px-4 py-2 text-white
                focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="numProblems" className="block text-sm font-medium text-accent-silver mb-2">
              Number of Problems
            </label>
            <input
              type="number"
              id="numProblems"
              value={numProblems}
              onChange={(e) => setNumProblems(Math.max(1, Math.min(10, parseInt(e.target.value))))}
              className="w-full bg-white/5 border border-accent-silver/20 rounded-lg px-4 py-2 text-white
                focus:ring-2 focus:ring-accent-neon focus:border-transparent"
              min="1"
              max="10"
            />
          </div>
        </div>
        <motion.button
          onClick={generateProblems}
          disabled={isLoading || !subject || !topic}
          className="mt-4 w-full px-4 py-2 bg-accent-neon text-black font-medium rounded-lg
            hover:bg-accent-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            'Generate Problems'
          )}
        </motion.button>
      </div>

      {/* Problem Display */}
      {problems.length > 0 && currentProblem && (
        <div className="bg-white/5 rounded-xl p-6 border border-accent-silver/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">
              Problem {currentProblemIndex + 1} of {problems.length}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
              difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {difficulty}
            </span>
          </div>

          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-lg text-accent-silver">{currentProblem.question}</p>
          </div>

          {currentProblem.options ? (
            <div className="space-y-2 mb-6">
              {currentProblem.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => setUserAnswer(option)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    userAnswer === option
                      ? 'bg-accent-neon/10 border-accent-neon text-white'
                      : 'bg-white/5 border-accent-silver/20 text-accent-silver hover:border-accent-neon/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full h-32 bg-white/5 border border-accent-silver/20 rounded-lg px-4 py-2 text-white
                  focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                placeholder="Enter your answer..."
              />
            </div>
          )}

          <div className="flex gap-4">
            <motion.button
              onClick={checkAnswer}
              disabled={isLoading || !userAnswer}
              className="flex-1 px-4 py-2 bg-accent-neon text-black font-medium rounded-lg
                hover:bg-accent-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Check Answer
            </motion.button>
            {response && (
              <motion.button
                onClick={nextProblem}
                disabled={currentProblemIndex === problems.length - 1}
                className="flex-1 px-4 py-2 bg-accent-neon/20 text-accent-neon font-medium rounded-lg
                  hover:bg-accent-neon/30 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next Problem
              </motion.button>
            )}
          </div>

          {/* Answer Response */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg border ${
                response.isCorrect
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {response.isCorrect ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
                <span className={response.isCorrect ? 'text-green-500' : 'text-red-500'}>
                  {response.isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className="text-accent-silver mb-4">{response.explanation}</p>
              {response.nextSteps && response.nextSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <LightBulbIcon className="h-4 w-4 text-accent-neon" />
                    Next Steps
                  </h4>
                  <ul className="list-disc list-inside text-accent-silver">
                    {response.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && !problems.length && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty state */}
      {!problems.length && !isLoading && (
        <div className="text-center py-12">
          <PencilSquareIcon className="h-12 w-12 text-accent-silver/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Problems Generated</h3>
          <p className="text-accent-silver">
            Enter a subject and topic to generate practice problems.
          </p>
        </div>
      )}
    </div>
  )
} 