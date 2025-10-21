import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { QuizSubmissionResult, IQuiz } from '@/types/quiz'

interface QuizResultsProps {
  result: QuizSubmissionResult
  quiz?: IQuiz // Add quiz data to show actual questions and answers
  shortAnswerTexts?: string[] // Add short answer texts for display
  onRetry?: () => void
  onExit: () => void
}

export default function QuizResults({ result, quiz, shortAnswerTexts, onRetry, onExit }: QuizResultsProps) {
  const scorePercentage = (result.score).toFixed(1)
  const passedQuiz = result.passed

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className={`inline-flex p-4 rounded-full ${
          passedQuiz ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {passedQuiz ? (
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          ) : (
            <XCircleIcon className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-white">
          {passedQuiz ? 'Congratulations!' : 'Quiz Completed'}
        </h1>
        <p className="text-lg text-white/80">
          {passedQuiz
            ? 'You have successfully passed the quiz!'
            : 'Keep practicing to improve your score.'}
        </p>
      </motion.div>

      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <p className="text-accent-silver">Score</p>
            <p className="text-4xl font-bold text-white">{scorePercentage}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-accent-silver">Correct Answers</p>
            <p className="text-4xl font-bold text-white">
              {result.detailedAnswers?.filter(a => a.isCorrect).length || 0}/{result.totalQuestions}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-accent-silver">Time Spent</p>
            <p className="text-4xl font-bold text-white flex items-center justify-center gap-2">
              <ClockIcon className="h-6 w-6" />
              {result.detailedAnswers?.reduce((sum, ans) => sum + (ans.timeTaken || 0), 0) || 0}s
            </p>
          </div>
        </div>
      </motion.div>

      {/* Detailed Results */}
      {result.detailedAnswers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-white">Question Details</h2>
          <div className="space-y-6">
            {result.detailedAnswers.map((answer, index) => {
              const question = quiz?.questions[index];
              return (
                <div
                  key={index}
                  className={`p-6 rounded-lg ${
                    answer.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      answer.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {answer.isCorrect ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-2">
                        Question {index + 1}: {question?.question || 'Question not available'}
                      </h3>
                      
                      {/* Show answers based on question type */}
                      {question && (
                        <div className="space-y-3 mb-4">
                          {question.type === 'short-answer' ? (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <p className="text-sm text-accent-silver">Your Answer:</p>
                                <div className={`p-3 rounded-lg ${
                                  answer.isCorrect
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-red-500/20 text-red-500'
                                }`}>
                                  {shortAnswerTexts?.[index] || 'No answer provided'}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm text-accent-silver">Correct Answer:</p>
                                <div className="p-3 rounded-lg bg-accent-neon/20 text-accent-neon">
                                  {question.options[0] || 'No correct answer available'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg ${
                                  optionIndex === question.correctOptionIndex
                                    ? 'bg-green-500/20 text-green-500'
                                    : optionIndex === answer.selectedOption
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'bg-white/5 text-accent-silver'
                                }`}
                              >
                                {option}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-accent-silver">
                        <span>Time spent: {Math.round(answer.timeTaken || 0)} seconds</span>
                        {answer.isCorrect ? (
                          <span className="text-green-500">✓ Correct</span>
                        ) : (
                          <span className="text-red-500">✗ Incorrect</span>
                        )}
                      </div>
                      
                      {answer.explanation && (
                        <div className="mt-3 p-3 bg-accent-silver/5 rounded-lg">
                          <p className="text-sm text-accent-silver">
                            <strong className="text-accent-neon">Explanation:</strong> {answer.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-4 pt-6"
      >
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Try Again
          </button>
        )}
        <button
          onClick={onExit}
          className="px-6 py-2 bg-accent-neon text-black rounded-full font-medium hover:bg-accent-neon/90"
        >
          Finish
        </button>
      </motion.div>
    </div>
  )
} 