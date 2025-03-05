import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import AIFlashcardGenerator from './AIFlashcardGenerator'
import { CreateDeckInput } from '@/types/deck'

interface AIGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  deckId: string
  token: string
  onSuccess: () => void
  createNewDeck?: boolean
}

export default function AIGeneratorModal({
  isOpen,
  onClose,
  deckId,
  token,
  onSuccess,
  createNewDeck = false,
}: AIGeneratorModalProps) {
  const [newDeckId, setNewDeckId] = useState<string>('')
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)

  const createDeck = async (title: string): Promise<string> => {
    try {
      setIsCreatingDeck(true)
      const newDeck: CreateDeckInput = {
        title,
        description: 'AI-generated flashcard deck',
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDeck),
      })

      if (!response.ok) {
        throw new Error('Failed to create deck')
      }

      const createdDeck = await response.json()
      return createdDeck._id
    } catch (error) {
      console.error('Error creating deck:', error)
      throw error
    } finally {
      setIsCreatingDeck(false)
    }
  }

  const handleSuccess = async () => {
    onSuccess()
    onClose()
  }

  const handleGenerationStart = async (topic: string): Promise<string> => {
    if (createNewDeck) {
      const newId = await createDeck(topic)
      setNewDeckId(newId)
      return newId
    }
    return deckId
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Flashcard Generator"
    >
      <div className="mt-4">
        <p className="text-accent-silver text-sm">
          Let AI help you create flashcards! Enter a topic or paste your study material,
          and we'll generate well-structured flashcards for you.
        </p>
        <div className="mt-6">
          <AIFlashcardGenerator
            deckId={newDeckId || deckId}
            token={token}
            onSuccess={handleSuccess}
            onGenerationStart={handleGenerationStart}
            isCreatingDeck={isCreatingDeck}
          />
        </div>
      </div>
    </Modal>
  )
} 