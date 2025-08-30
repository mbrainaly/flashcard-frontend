import { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface TextInputProps {
  onChange: (text: string) => void
  value?: string
  onAnalyze?: () => void
  analyzeDisabled?: boolean
}

export default function TextInput({ onChange, value, onAnalyze, analyzeDisabled }: TextInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative h-full">
      <textarea
        className="w-full h-full min-h-[200px] bg-transparent text-white placeholder-accent-silver/50 resize-none focus:outline-none"
        placeholder="Paste your notes or content to analyze for quiz generation."
        onChange={handleChange}
        value={value}
      />
      
      {/* Analysis Button */}
      <motion.button
        type="button"
        className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-accent-neon px-4 py-2 text-sm font-semibold text-accent-obsidian shadow-neon transition-colors hover:bg-accent-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAnalyze}
        disabled={!!analyzeDisabled}
      >
        <SparklesIcon className="h-4 w-4" />
        Analyze
      </motion.button>
    </div>
  )
} 