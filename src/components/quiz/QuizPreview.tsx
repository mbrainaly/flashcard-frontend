import { motion } from 'framer-motion'
import { 
  ClockIcon, 
  QuestionMarkCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import type { QuizConfig } from './QuizConfigForm'

interface QuizPreviewProps {
  config: QuizConfig
  suggestedTopics?: string[]
}

export default function QuizPreview({ config, suggestedTopics }: QuizPreviewProps) {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return 'Multiple Choice'
      case 'true-false':
        return 'True/False'
      case 'short-answer':
        return 'Short Answer'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Quiz Preview</h3>
        <div className="flex items-center gap-2 text-sm text-accent-silver">
          <DocumentTextIcon className="h-5 w-5" />
          <span>Preview Mode</span>
        </div>
      </div>

      {/* Quiz Header */}
      <div className="space-y-2">
        <h4 className="text-xl font-semibold text-white">
          {config.title || 'Untitled Quiz'}
        </h4>
        {config.description && (
          <p className="text-accent-silver">
            {config.description}
          </p>
        )}
      </div>

      {/* Quiz Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-3 space-y-1">
          <p className="text-sm text-accent-silver">Questions</p>
          <p className="text-lg font-medium text-white">{config.numberOfQuestions}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3 space-y-1">
          <p className="text-sm text-accent-silver">Difficulty</p>
          <p className="text-lg font-medium text-white capitalize">{config.difficulty}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3 space-y-1">
          <p className="text-sm text-accent-silver">Time Limit</p>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-accent-neon" />
            <p className="text-lg font-medium text-white">
              {config.timeLimit ? `${config.timeLimit}m` : 'None'}
            </p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 space-y-1">
          <p className="text-sm text-accent-silver">Visibility</p>
          <p className="text-lg font-medium text-white capitalize">
            {config.isPublic ? 'Public' : 'Private'}
          </p>
        </div>
      </div>

      {/* Question Types */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-accent-silver">Question Types</h4>
        <div className="flex flex-wrap gap-2">
          {config.questionTypes.map((type) => (
            <div
              key={type}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent-neon/10 text-accent-neon rounded-full text-sm"
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              {getQuestionTypeLabel(type)}
            </div>
          ))}
        </div>
      </div>

      {/* Topics */}
      {suggestedTopics && suggestedTopics.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-accent-silver">Topics Covered</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-white/5 text-accent-silver rounded-full text-sm"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Question */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-accent-silver">Sample Question Format</h4>
        <motion.div
          initial={false}
          animate={{ height: 'auto' }}
          className="bg-white/5 rounded-lg p-4 space-y-4"
        >
          {config.questionTypes[0] === 'multiple-choice' && (
            <>
              <p className="text-white">What is the correct answer to this question?</p>
              <div className="space-y-2">
                {['Option A', 'Option B', 'Option C', 'Option D'].map((option, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-accent-silver 
                      bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center 
                      border-2 border-accent-silver/30 rounded-full text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {config.questionTypes[0] === 'true-false' && (
            <>
              <p className="text-white">Is this statement correct?</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-2 text-accent-silver bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  True
                </button>
                <button className="px-4 py-2 text-accent-silver bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  False
                </button>
              </div>
            </>
          )}

          {config.questionTypes[0] === 'short-answer' && (
            <>
              <p className="text-white">Explain your answer to this question:</p>
              <textarea
                placeholder="Type your answer here..."
                className="w-full h-24 px-4 py-2 bg-white/5 rounded-lg text-accent-silver 
                  placeholder-accent-silver/50 border-2 border-accent-silver/10 outline-none resize-none"
                disabled
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
} 