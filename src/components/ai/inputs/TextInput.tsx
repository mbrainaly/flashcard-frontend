import { ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface TextInputProps {
  onChange: (text: string) => void
}

export default function TextInput({ onChange }: TextInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative h-full">
      <textarea
        className="w-full h-full min-h-[200px] bg-transparent text-white placeholder-accent-silver/50 resize-none focus:outline-none"
        placeholder="Upload a document, paste your notes, or select a video to automatically generate flashcards with AI."
        onChange={handleChange}
      />
      
      {/* Analysis Button */}
      <motion.button
        type="button"
        className="absolute top-2 right-2 flex items-center gap-2 rounded-full bg-accent-neon/20 px-4 py-2 text-sm font-medium text-accent-neon hover:bg-accent-neon/30 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <SparklesIcon className="h-4 w-4" />
        Analyze
      </motion.button>
    </div>
  )
} 