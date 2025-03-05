import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline'

const generatorSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  content: z.string().optional(),
  numberOfCards: z.number().min(1).max(20).default(5),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
})

type GeneratorFormData = z.infer<typeof generatorSchema>

interface AIFlashcardGeneratorProps {
  deckId: string
  token: string
  onSuccess: () => void
  onGenerationStart?: (topic: string) => Promise<string>
  isCreatingDeck?: boolean
}

export default function AIFlashcardGenerator({
  deckId,
  token,
  onSuccess,
  onGenerationStart,
  isCreatingDeck = false,
}: AIFlashcardGeneratorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>({
    keyConcepts: [],
    suggestedTopics: [],
    recommendedDifficulty: '',
    estimatedCards: 0
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      numberOfCards: 5,
      difficulty: 'intermediate',
    },
  })

  const content = watch('content')

  const analyzeContent = async () => {
    if (!content) return
    
    setIsAnalyzing(true)
    setError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze content')
      }

      const data = await response.json()
      setAnalysis(data)
      
      // Auto-fill some fields based on analysis
      if (data.suggestedTopic) {
        setValue('topic', data.suggestedTopic)
      }
      if (data.recommendedDifficulty) {
        setValue('difficulty', data.recommendedDifficulty)
      }
      if (data.estimatedCards) {
        setValue('numberOfCards', Math.min(20, data.estimatedCards))
      }
    } catch (error) {
      setError('Failed to analyze content. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onSubmit = async (data: GeneratorFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // If we need to create a new deck first
      let targetDeckId = deckId
      if (onGenerationStart) {
        targetDeckId = await onGenerationStart(data.topic)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-flashcards`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deckId: targetDeckId,
            topic: data.topic,
            content: data.content,
            numberOfCards: data.numberOfCards,
            difficulty: data.difficulty,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-accent-silver">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            className="mt-1 block w-full rounded-lg bg-white/5 border border-accent-silver/10 px-3 py-2 text-white placeholder-accent-silver/50 focus:border-accent-neon focus:outline-none focus:ring-1 focus:ring-accent-neon"
            placeholder="Enter the topic for flashcards"
            {...register('topic')}
          />
          {errors.topic && (
            <p className="mt-1 text-sm text-red-500">{errors.topic.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-accent-silver">
            Content (Optional)
          </label>
          <div className="mt-1 relative">
            <textarea
              id="content"
              rows={5}
              className="block w-full rounded-lg bg-white/5 border border-accent-silver/10 px-3 py-2 text-white placeholder-accent-silver/50 focus:border-accent-neon focus:outline-none focus:ring-1 focus:ring-accent-neon"
              placeholder="Paste your content here for analysis"
              {...register('content')}
            />
            {content && (
              <motion.button
                type="button"
                onClick={analyzeContent}
                disabled={isAnalyzing}
                className="absolute right-2 top-2 rounded-lg bg-accent-neon/20 px-3 py-1.5 text-xs font-medium text-accent-neon hover:bg-accent-neon/30 focus:outline-none transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </motion.button>
            )}
          </div>
        </div>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-white/5 p-4 border border-accent-silver/10"
          >
            <h4 className="text-sm font-medium text-accent-neon">Content Analysis</h4>
            <div className="mt-2 space-y-2 text-sm text-accent-silver">
              <p>Key concepts: {Array.isArray(analysis.keyConcepts) ? analysis.keyConcepts.join(', ') : 'None'}</p>
              <p>Suggested topics: {Array.isArray(analysis.suggestedTopics) ? analysis.suggestedTopics.join(', ') : 'None'}</p>
              <p>Recommended difficulty: {analysis.recommendedDifficulty || 'Not specified'}</p>
              <p>Estimated cards: {analysis.estimatedCards || 0}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="numberOfCards" className="block text-sm font-medium text-accent-silver">
              Number of Cards
            </label>
            <input
              type="number"
              id="numberOfCards"
              min={1}
              max={20}
              className="mt-1 block w-full rounded-lg bg-white/5 border border-accent-silver/10 px-3 py-2 text-white focus:border-accent-neon focus:outline-none focus:ring-1 focus:ring-accent-neon"
              {...register('numberOfCards', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-accent-silver">
              Difficulty
            </label>
            <select
              id="difficulty"
              className="mt-1 block w-full rounded-lg bg-white/5 border border-accent-silver/10 px-3 py-2 text-white focus:border-accent-neon focus:outline-none focus:ring-1 focus:ring-accent-neon"
              {...register('difficulty')}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={isLoading || isCreatingDeck}
            className="inline-flex items-center gap-2 rounded-full bg-accent-neon px-4 py-2 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SparklesIcon className="h-5 w-5" />
            {isLoading ? 'Generating...' : 
             isCreatingDeck ? 'Creating Deck...' : 
             'Generate Flashcards'}
          </motion.button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}
      </form>
    </div>
  )
} 