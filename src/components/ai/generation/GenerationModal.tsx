import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Modal from '@/components/ui/Modal'
import GenerationProgress from './GenerationProgress'
import useGeneration from './useGeneration'
import { GeneratorConfig } from '../options/GeneratorOptions'

interface GenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (cards: any[]) => void
  deckId: string
  token: string
  content: string
  config: GeneratorConfig
}

export default function GenerationModal({
  isOpen,
  onClose,
  onComplete,
  deckId,
  token,
  content,
  config,
}: GenerationModalProps) {
  const {
    state: { step, error, cards },
    analyzeContent,
    generateCards,
    reset,
  } = useGeneration({ deckId, token })

  useEffect(() => {
    if (isOpen && content) {
      startGeneration()
    }
  }, [isOpen, content])

  useEffect(() => {
    if (step === 'complete' && cards.length > 0) {
      onComplete(cards)
    }
  }, [step, cards, onComplete])

  const startGeneration = async () => {
    try {
      // First analyze the content
      await analyzeContent(content)
      
      // Then generate the cards
      await generateCards(content, config)
    } catch (error) {
      console.error('Generation error:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generating Flashcards"
    >
      <div className="mt-6 space-y-8">
        {/* Progress indicator */}
        <GenerationProgress
          currentStep={step}
          error={error}
        />

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <motion.button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-accent-silver hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>

          {step === 'complete' && (
            <motion.button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Cards
            </motion.button>
          )}
        </div>
      </div>
    </Modal>
  )
} 