import DeckFormModal from './DeckFormModal'
import { CreateDeckInput } from '@/types/deck'

interface CreateDeckModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateDeckInput) => Promise<void>
}

export default function CreateDeckModal({ isOpen, onClose, onSubmit }: CreateDeckModalProps) {
  return (
    <DeckFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
} 