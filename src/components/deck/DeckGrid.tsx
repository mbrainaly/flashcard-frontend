import { PlusIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { IDeck } from '@/types/deck'

interface DeckGridProps {
  decks: IDeck[]
  onCreateDeck: () => void
}

export default function DeckGrid({ decks, onCreateDeck }: DeckGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Create new deck card */}
      <motion.button
        onClick={onCreateDeck}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative flex flex-col items-center justify-center rounded-2xl bg-glass p-6 text-center ring-1 ring-accent-silver/10 backdrop-blur-sm transition-all duration-300 hover:ring-accent-neon/30 aspect-[4/3]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-neon text-accent-obsidian">
          <PlusIcon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Create New Deck</h3>
        <p className="mt-2 text-sm text-accent-silver">Start building your flashcard deck</p>
      </motion.button>

      {/* Deck cards */}
      {decks.map((deck) => (
        <Link
          key={deck._id}
          href={`/decks/${deck._id}`}
          className="group relative"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col rounded-2xl bg-glass p-6 ring-1 ring-accent-silver/10 backdrop-blur-sm transition-all duration-300 group-hover:ring-accent-neon/30 aspect-[4/3]"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-accent-neon transition-colors">
                {deck.title}
              </h3>
              <p className="mt-2 text-sm text-accent-silver line-clamp-2">
                {deck.description || 'No description'}
              </p>
            </div>

            {/* Card Count */}
            <div className="mt-6 text-center">
              <p className="text-2xl font-semibold text-accent-neon">{deck.totalCards || 0}</p>
              <p className="text-sm text-accent-silver">
                {deck.totalCards === 1 ? 'Card' : 'Cards'}
              </p>
            </div>

            {/* Last studied */}
            {deck.lastStudied && (
              <p className="mt-4 text-xs text-accent-silver">
                Last studied: {new Date(deck.lastStudied).toLocaleDateString()}
              </p>
            )}
          </motion.div>
        </Link>
      ))}
    </div>
  )
} 