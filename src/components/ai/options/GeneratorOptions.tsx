import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  DocumentTextIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'

export interface GeneratorConfig {
  numberOfCards: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  includeHints: boolean
  includeExamples: boolean
}

interface GeneratorOptionsProps {
  config: GeneratorConfig
  onChange: (config: GeneratorConfig) => void
}

export default function GeneratorOptions({ config, onChange }: GeneratorOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (key: keyof GeneratorConfig, value: any) => {
    onChange({ ...config, [key]: value })
  }

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', icon: AcademicCapIcon },
    { value: 'intermediate', label: 'Intermediate', icon: BeakerIcon },
    { value: 'advanced', label: 'Advanced', icon: LightBulbIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Number of Cards */}
      <div>
        <label className="block text-sm font-medium text-accent-silver mb-2">
          Number of Cards
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={config.numberOfCards}
            onChange={(e) => handleChange('numberOfCards', parseInt(e.target.value))}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-neon"
            aria-label="Number of cards to generate"
          />
          <span className="text-white font-medium w-12 text-center">
            {config.numberOfCards}
          </span>
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-accent-silver mb-2">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map((option) => {
            const Icon = option.icon
            const isSelected = config.difficulty === option.value
            
            return (
              <motion.button
                key={option.value}
                onClick={() => handleChange('difficulty', option.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? 'border-accent-neon bg-accent-neon/10 text-accent-neon' 
                    : 'border-accent-silver/10 text-accent-silver hover:border-accent-neon/30'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-accent-silver hover:text-accent-neon transition-colors"
        >
          <DocumentTextIcon className="h-5 w-5" />
          Advanced Options
        </button>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.includeHints}
                onChange={(e) => handleChange('includeHints', e.target.checked)}
                className="h-4 w-4 rounded border-accent-silver/30 bg-white/5 text-accent-neon focus:ring-accent-neon"
              />
              <span className="text-sm text-accent-silver">Include hints for complex concepts</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.includeExamples}
                onChange={(e) => handleChange('includeExamples', e.target.checked)}
                className="h-4 w-4 rounded border-accent-silver/30 bg-white/5 text-accent-neon focus:ring-accent-neon"
              />
              <span className="text-sm text-accent-silver">Add relevant examples</span>
            </label>
          </motion.div>
        )}
      </div>
    </div>
  )
} 