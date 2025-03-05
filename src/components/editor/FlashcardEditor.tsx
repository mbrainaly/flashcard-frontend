import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowPathIcon, 
  CheckIcon, 
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { ICard } from '@/types/card'
import RichTextEditor from './RichTextEditor'
import EditorToolbar from './EditorToolbar'
import AutoSaveIndicator from './AutoSaveIndicator'

interface FlashcardEditorProps {
  cards: ICard[]
  currentIndex: number
  onCardUpdate: (cardId: string, updates: Partial<ICard>) => Promise<void>
  onNavigate: (direction: 'prev' | 'next') => void
  onAddCard: () => void
  onDeleteCard: (cardId: string) => void
}

export default function FlashcardEditor({
  cards,
  currentIndex,
  onCardUpdate,
  onNavigate,
  onAddCard,
  onDeleteCard,
}: FlashcardEditorProps) {
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const currentCard = cards[currentIndex]

  // Auto-save when content changes
  const handleContentChange = async (content: string) => {
    try {
      setIsSaving(true)
      setSaveError(null)
      
      await onCardUpdate(currentCard._id, {
        [side]: content
      })
      
      setLastSaved(new Date())
    } catch (error) {
      setSaveError('Failed to save changes')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Reset state when card changes
  useEffect(() => {
    setSide('front')
    setSaveError(null)
    setLastSaved(null)
  }, [currentIndex])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">
            Card {currentIndex + 1} of {cards.length}
          </h2>
          <AutoSaveIndicator
            isSaving={isSaving}
            error={saveError}
            lastSaved={lastSaved}
          />
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onNavigate('prev')}
            disabled={currentIndex === 0}
            className="p-2 text-accent-silver hover:text-white disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            onClick={() => onNavigate('next')}
            disabled={currentIndex === cards.length - 1}
            className="p-2 text-accent-silver hover:text-white disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
        {/* Side toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/5 rounded-lg p-1 flex">
            <button
              onClick={() => setSide('front')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${side === 'front' 
                  ? 'bg-accent-neon text-black' 
                  : 'text-accent-silver hover:text-white'
                }`}
            >
              Front
            </button>
            <button
              onClick={() => setSide('back')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${side === 'back' 
                  ? 'bg-accent-neon text-black' 
                  : 'text-accent-silver hover:text-white'
                }`}
            >
              Back
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <EditorToolbar />

        {/* Content */}
        <div className="mt-4">
          <RichTextEditor
            content={currentCard[side]}
            onChange={handleContentChange}
            placeholder={`Enter ${side} content...`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <motion.button
          onClick={() => onDeleteCard(currentCard._id)}
          className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Delete Card
        </motion.button>
        <motion.button
          onClick={onAddCard}
          className="px-4 py-2 text-sm font-medium bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add Card
        </motion.button>
      </div>
    </div>
  )
} 