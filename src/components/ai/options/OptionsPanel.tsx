import { motion } from 'framer-motion'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import GeneratorOptions from './GeneratorOptions'
import GeneratorPreview from './GeneratorPreview'
import useGeneratorOptions from './useGeneratorOptions'

interface OptionsPanelProps {
  topic?: string
  isLoading?: boolean
  onRefresh?: () => void
}

export default function OptionsPanel({ topic, isLoading, onRefresh }: OptionsPanelProps) {
  const { config, updateConfig, resetConfig } = useGeneratorOptions()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Generation Options</h2>
        <motion.button
          onClick={resetConfig}
          className="flex items-center gap-2 text-sm text-accent-silver hover:text-accent-neon transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowPathIcon className="h-4 w-4" />
          Reset to Defaults
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Options */}
        <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
          <GeneratorOptions
            config={config}
            onChange={updateConfig}
          />
        </div>

        {/* Preview */}
        <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
          <GeneratorPreview
            config={config}
            topic={topic}
            isLoading={isLoading}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </div>
  )
} 