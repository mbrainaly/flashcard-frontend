import { motion } from 'framer-motion'
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface QuizAnalysisResultsProps {
  analysis: {
    content: string
    keyConcepts: string[]
    suggestedTopics: string[]
    recommendedDifficulty: string
    estimatedQuestions: number
  }
  onProceed: () => void
  onRestart: () => void
}

export default function QuizAnalysisResults({
  analysis,
  onProceed,
  onRestart,
}: QuizAnalysisResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-center gap-2 text-accent-neon">
        <CheckCircleIcon className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Content Analysis Complete</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
          <h3 className="text-lg font-medium text-white">Key Concepts</h3>
          <ul className="mt-4 space-y-2">
            {analysis.keyConcepts.map((concept, index) => (
              <li key={index} className="flex items-center gap-2 text-accent-silver">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-neon" />
                {concept}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
          <h3 className="text-lg font-medium text-white">Suggested Topics</h3>
          <ul className="mt-4 space-y-2">
            {analysis.suggestedTopics.map((topic, index) => (
              <li key={index} className="flex items-center gap-2 text-accent-silver">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-accent-silver">Recommended Difficulty</h3>
            <p className="mt-1 text-lg font-medium text-white capitalize">
              {analysis.recommendedDifficulty}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-accent-silver">Estimated Questions</h3>
            <p className="mt-1 text-lg font-medium text-white">
              {analysis.estimatedQuestions} questions
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <motion.button
          onClick={onRestart}
          className="px-4 py-2 text-sm font-medium text-accent-silver hover:text-white transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Over
        </motion.button>

        <motion.button
          onClick={onProceed}
          className="flex items-center gap-2 px-6 py-2 bg-accent-neon text-black rounded-full font-medium hover:bg-accent-neon/90 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SparklesIcon className="h-5 w-5" />
          Generate Quiz
        </motion.button>
      </div>
    </motion.div>
  )
} 