import { motion } from 'framer-motion'
import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface StudySessionSummaryProps {
  totalCards: number
  correctAnswers: number
  onStudyAgain: () => void
  mode: 'quiz' | 'exam' | 'standard' | 'spaced'
  examAnswers?: Array<{
    question: string
    userAnswer: string
    isCorrect: boolean
    feedback?: string
  }>
}

export default function StudySessionSummary({
  totalCards,
  correctAnswers,
  onStudyAgain,
  mode,
  examAnswers = [],
}: StudySessionSummaryProps) {
  const percentage = Math.round((correctAnswers / totalCards) * 100) || 0
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return 'Excellent work! You\'ve mastered this material!'
    if (percentage >= 80) return 'Great job! Keep up the good work!'
    if (percentage >= 70) return 'Good progress! A bit more practice will help.'
    if (percentage >= 60) return 'You\'re getting there! Keep practicing.'
    return 'Keep studying! You\'ll improve with practice.'
  }

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">
          Study Session Complete!
        </h2>
        <p className="mt-2 text-accent-silver">
          You've reviewed all {totalCards} cards in this session.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-glass p-4 text-center backdrop-blur-sm ring-1 ring-accent-silver/10">
          <div className="text-3xl font-bold text-accent-neon">{totalCards}</div>
          <div className="mt-1 text-sm text-accent-silver">Total Cards</div>
        </div>
        <div className="rounded-xl bg-glass p-4 text-center backdrop-blur-sm ring-1 ring-accent-silver/10">
          <div className="text-3xl font-bold text-accent-gold">{correctAnswers}</div>
          <div className="mt-1 text-sm text-accent-silver">Correct Answers</div>
        </div>
        <div className="rounded-xl bg-glass p-4 text-center backdrop-blur-sm ring-1 ring-accent-silver/10">
          <div className="text-3xl font-bold text-white">{percentage}%</div>
          <div className="mt-1 text-sm text-accent-silver">Accuracy</div>
        </div>
      </div>

      {/* Performance Message */}
      <div className="text-center">
        <p className="text-lg text-accent-silver">{getPerformanceMessage()}</p>
      </div>

      {/* Detailed Results for Quiz/Exam Mode */}
      {(mode === 'quiz' || mode === 'exam') && examAnswers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Detailed Results</h3>
          <div className="space-y-4">
            {examAnswers.map((answer, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 ${
                  answer.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
              >
                <p className="font-medium text-white">{answer.question}</p>
                <p className="mt-2 text-sm text-accent-silver">
                  Your answer: {answer.userAnswer}
                </p>
                {answer.feedback && (
                  <p className="mt-2 text-sm text-accent-neon">{answer.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onStudyAgain}
          className="rounded-full bg-accent-neon px-6 py-2 text-sm font-semibold text-black hover:bg-accent-neon/90 transition-colors"
        >
          Study Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="rounded-full bg-glass px-6 py-2 text-sm font-semibold text-accent-silver hover:text-white transition-colors"
        >
          Back to Deck
        </button>
      </div>
    </div>
  )
} 