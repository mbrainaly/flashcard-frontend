import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ClockIcon, 
  GlobeAltIcon, 
  LockClosedIcon,
  QuestionMarkCircleIcon,
  AdjustmentsHorizontalIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import QuizPreview from './QuizPreview'

export interface QuizConfig {
  title: string
  description: string
  numberOfQuestions: number
  questionTypes: ('multiple-choice' | 'true-false' | 'short-answer')[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeLimit: number | null // in minutes
  isPublic: boolean
}

interface QuizConfigFormProps {
  initialConfig?: Partial<QuizConfig>
  suggestedQuestions?: number
  suggestedDifficulty?: string
  suggestedTopics?: string[]
  onSubmit: (config: QuizConfig) => void
}

const defaultConfig: QuizConfig = {
  title: '',
  description: '',
  numberOfQuestions: 10,
  questionTypes: ['multiple-choice'],
  difficulty: 'intermediate',
  timeLimit: null,
  isPublic: false,
}

interface ValidationErrors {
  title?: string
  questionTypes?: string
  numberOfQuestions?: string
  timeLimit?: string
}

export default function QuizConfigForm({
  initialConfig,
  suggestedQuestions,
  suggestedDifficulty,
  suggestedTopics,
  onSubmit,
}: QuizConfigFormProps) {
  const [config, setConfig] = useState<QuizConfig>({
    ...defaultConfig,
    ...initialConfig,
    numberOfQuestions: suggestedQuestions || defaultConfig.numberOfQuestions,
    difficulty: (suggestedDifficulty as QuizConfig['difficulty']) || defaultConfig.difficulty,
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showPreview, setShowPreview] = useState(false)

  const validateConfig = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Title validation
    if (!config.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (config.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    // Question types validation
    if (config.questionTypes.length === 0) {
      newErrors.questionTypes = 'Select at least one question type'
    }

    // Number of questions validation
    if (config.numberOfQuestions < 5) {
      newErrors.numberOfQuestions = 'Minimum 5 questions required'
    } else if (config.numberOfQuestions > (suggestedQuestions || 20)) {
      newErrors.numberOfQuestions = `Maximum ${suggestedQuestions || 20} questions allowed`
    }

    // Time limit validation
    if (config.timeLimit !== null) {
      if (config.timeLimit < 1) {
        newErrors.timeLimit = 'Time limit must be at least 1 minute'
      } else if (config.timeLimit > 180) {
        newErrors.timeLimit = 'Time limit cannot exceed 180 minutes'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (key: keyof QuizConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    // Clear error for the field being changed
    if (errors[key as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  const handleQuestionTypeToggle = (type: QuizConfig['questionTypes'][0]) => {
    setConfig(prev => {
      const newTypes = prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
      
      // Clear question types error if at least one type is selected
      if (newTypes.length > 0 && errors.questionTypes) {
        setErrors(prev => ({ ...prev, questionTypes: undefined }))
      }

      return { ...prev, questionTypes: newTypes }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateConfig()) {
      onSubmit(config)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Quiz Title"
              className={`w-full px-4 py-2 bg-white/5 rounded-lg text-white placeholder-accent-silver/50 
                border-2 transition-colors ${
                  errors.title
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-accent-silver/10 focus:border-accent-neon'
                }`}
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>
          
          <textarea
            value={config.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Quiz Description"
            className="w-full h-24 px-4 py-2 bg-white/5 rounded-lg text-white placeholder-accent-silver/50 
              border-2 border-accent-silver/10 focus:border-accent-neon outline-none transition-colors resize-none"
          />
        </div>

        {/* Question Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-accent-silver">
              Number of Questions
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max={suggestedQuestions || 20}
                value={config.numberOfQuestions}
                onChange={(e) => handleChange('numberOfQuestions', parseInt(e.target.value))}
                className="flex-1"
                aria-label="Number of questions"
              />
              <span className="text-white font-medium w-12 text-center">
                {config.numberOfQuestions}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-accent-silver">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleChange('difficulty', level)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg capitalize
                    ${config.difficulty === level
                      ? 'bg-accent-neon text-black'
                      : 'bg-white/5 text-accent-silver hover:bg-white/10'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-accent-silver">
            Question Types
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'multiple-choice', label: 'Multiple Choice' },
              { id: 'true-false', label: 'True/False' },
              { id: 'short-answer', label: 'Short Answer' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleQuestionTypeToggle(type.id as QuizConfig['questionTypes'][0])}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  ${config.questionTypes.includes(type.id as QuizConfig['questionTypes'][0])
                    ? 'bg-accent-neon/20 text-accent-neon'
                    : 'bg-white/5 text-accent-silver hover:bg-white/10'
                  }`}
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-accent-silver">
              Time Limit (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="180"
                value={config.timeLimit || ''}
                onChange={(e) => handleChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Minutes"
                className="w-24 px-3 py-2 bg-white/5 rounded-lg text-white placeholder-accent-silver/50 
                  border-2 border-accent-silver/10 focus:border-accent-neon outline-none transition-colors"
              />
              <ClockIcon className="h-5 w-5 text-accent-silver" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-accent-silver">
              Visibility
            </label>
            <button
              type="button"
              onClick={() => handleChange('isPublic', !config.isPublic)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                bg-white/5 hover:bg-white/10 transition-colors"
            >
              {config.isPublic ? (
                <>
                  <GlobeAltIcon className="h-5 w-5 text-accent-neon" />
                  <span className="text-accent-neon">Public</span>
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-5 w-5 text-accent-silver" />
                  <span className="text-accent-silver">Private</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message for question types */}
        {errors.questionTypes && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <ExclamationCircleIcon className="h-4 w-4" />
            {errors.questionTypes}
          </p>
        )}

        {/* Preview Toggle */}
        <div className="flex items-center justify-between">
          <motion.button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-neon 
              text-black rounded-xl font-medium hover:bg-accent-neon/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Configure Quiz
          </motion.button>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-accent-silver hover:text-white transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 border-t border-accent-silver/10 pt-8"
        >
          <QuizPreview config={config} suggestedTopics={suggestedTopics} />
        </motion.div>
      )}
    </div>
  )
} 