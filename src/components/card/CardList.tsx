import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ICard } from '@/types/card'

interface CardListProps {
  cards: ICard[]
  onEditCard: (card: ICard) => void
  onDeleteCard: (cardId: string) => void
}

export default function CardList({ cards, onEditCard, onDeleteCard }: CardListProps) {
  const getStatusColor = (status: ICard['status']) => {
    switch (status) {
      case 'mastered':
        return 'text-accent-neon'
      case 'learning':
        return 'text-accent-gold'
      default:
        return 'text-white'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <motion.div
          key={card._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-glass p-6 backdrop-blur-sm ring-1 ring-accent-silver/10 transition-all duration-300 hover:ring-accent-neon/30"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-white">{card.front}</h3>
                <span className={`text-sm font-medium ${getStatusColor(card.status)} capitalize`}>
                  {card.status}
                </span>
              </div>
              {card.image && (
                <div className="mt-4">
                  <img 
                    src={card.image} 
                    alt="Card illustration" 
                    className="rounded-lg max-h-48 object-contain"
                  />
                </div>
              )}
              <p className="mt-2 text-accent-silver">{card.back}</p>
              
              {/* Hints and examples */}
              {(card.hints?.length > 0 || card.examples?.length > 0) && (
                <div className="mt-4 space-y-2">
                  {card.hints?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-accent-neon">Hints:</p>
                      <ul className="mt-1 list-disc list-inside text-sm text-accent-silver">
                        {card.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {card.examples?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-accent-gold">Examples:</p>
                      <ul className="mt-1 list-disc list-inside text-sm text-accent-silver">
                        {card.examples.map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {card.tags && card.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-accent-silver"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Study info */}
              <div className="mt-4 flex items-center gap-4 text-xs text-accent-silver">
                <p>Next review: {formatDate(card.nextReview)}</p>
                {card.lastReviewed && (
                  <p>Last reviewed: {formatDate(card.lastReviewed)}</p>
                )}
                <p>Repetitions: {card.repetitions}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="ml-4 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEditCard(card)}
                className="rounded-full p-2 text-accent-silver hover:text-accent-neon transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDeleteCard(card._id)}
                className="rounded-full p-2 text-accent-silver hover:text-red-500 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}

      {cards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-accent-silver">No cards in this deck yet. Click "Add Card" to create your first card.</p>
        </div>
      )}
    </div>
  )
} 