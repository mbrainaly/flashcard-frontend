import { motion } from 'framer-motion'
import { 
  LightBulbIcon, 
  BookOpenIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { GeneratorConfig } from './GeneratorOptions'

interface GeneratorPreviewProps {
  config: GeneratorConfig
  topic?: string
  isLoading?: boolean
  onRefresh?: () => void
}

export default function GeneratorPreview({ 
  config, 
  topic = 'Your Topic',
  isLoading,
  onRefresh,
}: GeneratorPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-accent-silver">Preview</h3>
        {onRefresh && (
          <motion.button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-accent-silver hover:text-accent-neon disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        )}
      </div>

      <div className="relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-accent-obsidian/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
            <div className="text-accent-neon animate-pulse">Generating preview...</div>
          </div>
        )}

        {/* Preview cards */}
        <div className="relative space-y-3">
          {/* Sample card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-4 ring-1 ring-accent-silver/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium">Key Concept from {topic}</h4>
                <p className="mt-1 text-sm text-accent-silver">
                  This is where the explanation would go...
                </p>
                
                {config.includeHints && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-accent-neon">
                    <LightBulbIcon className="h-4 w-4" />
                    <span>Helpful hint about the concept</span>
                  </div>
                )}
                
                {config.includeExamples && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-accent-gold">
                    <BookOpenIcon className="h-4 w-4" />
                    <span>Practical example of usage</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sample card 2 (dimmed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-4 ring-1 ring-accent-silver/10 transform scale-95 -translate-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium">Another Concept</h4>
                <p className="mt-1 text-sm text-accent-silver">
                  More content would go here...
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sample card 3 (more dimmed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.2, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-4 ring-1 ring-accent-silver/10 transform scale-90 -translate-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium">More to Come</h4>
                <p className="mt-1 text-sm text-accent-silver">
                  {config.numberOfCards - 3} more cards will be generated...
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Configuration summary */}
      <div className="mt-4 flex items-center justify-between text-xs text-accent-silver">
        <span>{config.numberOfCards} cards</span>
        <span className="capitalize">{config.difficulty} difficulty</span>
        <span>
          {[
            config.includeHints && 'Hints',
            config.includeExamples && 'Examples'
          ].filter(Boolean).join(' & ') || 'Basic cards'}
        </span>
      </div>
    </div>
  )
} 