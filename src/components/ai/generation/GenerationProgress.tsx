import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  LightBulbIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export type GenerationStep = 
  | 'analyzing'
  | 'generating'
  | 'formatting'
  | 'complete'

interface GenerationProgressProps {
  currentStep: GenerationStep
  error?: string
}

const steps = [
  {
    id: 'analyzing',
    label: 'Analyzing Content',
    description: 'Identifying key concepts and topics...',
    icon: DocumentTextIcon,
  },
  {
    id: 'generating',
    label: 'Generating Cards',
    description: 'Creating flashcards with AI...',
    icon: SparklesIcon,
  },
  {
    id: 'formatting',
    label: 'Formatting',
    description: 'Applying hints and examples...',
    icon: LightBulbIcon,
  },
  {
    id: 'complete',
    label: 'Complete',
    description: 'Ready for review!',
    icon: CheckCircleIcon,
  },
]

export default function GenerationProgress({ currentStep, error }: GenerationProgressProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep)
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="h-0.5 w-full bg-accent-silver/10" />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const currentIndex = getCurrentStepIndex()
            const isComplete = index <= currentIndex
            const isCurrent = index === currentIndex
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 
                    ${isComplete 
                      ? 'border-accent-neon bg-accent-neon/10' 
                      : 'border-accent-silver/30 bg-accent-obsidian'
                    }`}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Icon 
                    className={`h-4 w-4 ${
                      isComplete ? 'text-accent-neon' : 'text-accent-silver/50'
                    }`} 
                  />
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent-neon"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </motion.div>
                <div className="mt-2 flex flex-col items-center">
                  <span className={`text-sm font-medium ${
                    isComplete ? 'text-white' : 'text-accent-silver/50'
                  }`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-accent-silver"
                    >
                      {step.description}
                    </motion.span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
} 