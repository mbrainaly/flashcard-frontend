import { motion } from 'framer-motion'
import { ClockIcon, BeakerIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export type StudyMode = 'standard' | 'spaced' | 'exam' | 'quiz'

interface StudyModeProps {
  selectedMode: StudyMode
  onChange: (mode: StudyMode) => void
}

const modes = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Classic flashcard review',
    icon: ClockIcon,
  },
  {
    id: 'spaced',
    name: 'Spaced Repetition',
    description: 'Optimized learning intervals based on performance',
    icon: BeakerIcon,
  },
  {
    id: 'exam',
    name: 'Exam Mode',
    description: 'Free-form answers with AI evaluation',
    icon: QuestionMarkCircleIcon,
  },
  {
    id: 'quiz',
    name: 'Quiz Mode',
    description: 'Multiple choice questions generated from your cards',
    icon: QuestionMarkCircleIcon,
  },
]

export default function StudyModeSelector({ selectedMode, onChange }: StudyModeProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isSelected = selectedMode === mode.id

        return (
          <motion.button
            key={mode.id}
            onClick={() => onChange(mode.id as StudyMode)}
            className={`flex items-start gap-4 rounded-xl p-4 text-left transition-all duration-300 ${
              isSelected
                ? 'bg-accent-neon text-black ring-2 ring-accent-neon'
                : 'bg-glass text-white hover:bg-white/5 ring-1 ring-accent-silver/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className={`h-6 w-6 ${isSelected ? 'text-black' : 'text-accent-neon'}`} />
            <div>
              <h3 className="font-medium">{mode.name}</h3>
              <p className={`mt-1 text-sm ${isSelected ? 'text-black/70' : 'text-accent-silver'}`}>
                {mode.description}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
} 