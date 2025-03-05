'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { IDeck, UpdateDeckInput } from '@/types/deck'
import { ICard, CreateCardInput } from '@/types/card'
import FlashcardEditor from '@/components/editor/FlashcardEditor'

interface DeckEditPageProps {
  params: {
    id: string
  }
}

export default function DeckEditPage({ params }: DeckEditPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [deck, setDeck] = useState<IDeck | null>(null)
  const [cards, setCards] = useState<ICard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch deck and cards
  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch deck
        const deckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks/${params.id}`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        })

        if (!deckResponse.ok) {
          throw new Error('Failed to fetch deck')
        }

        const deckData = await deckResponse.json()
        setDeck(deckData)

        // Fetch cards
        const cardsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/decks/${params.id}/cards`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        )

        if (!cardsResponse.ok) {
          throw new Error('Failed to fetch cards')
        }

        const cardsData = await cardsResponse.json()
        setCards(cardsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.accessToken) {
      fetchDeckAndCards()
    }
  }, [params.id, session?.user?.accessToken])

  // Handle card navigation
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
    } else if (direction === 'next' && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  // Handle card updates
  const handleCardUpdate = async (cardId: string, updates: Partial<ICard>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update card')
      }

      const updatedCard = await response.json()
      setCards(cards.map(card => card._id === cardId ? updatedCard : card))
    } catch (err) {
      throw err
    }
  }

  // Handle adding new card
  const handleAddCard = async () => {
    try {
      const newCard: CreateCardInput = {
        front: '',
        back: '',
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/decks/${params.id}/cards`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(newCard),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create card')
      }

      const createdCard = await response.json()
      setCards([...cards, createdCard])
      setCurrentCardIndex(cards.length) // Switch to new card
    } catch (err) {
      console.error('Error creating card:', err)
    }
  }

  // Handle deleting card
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete card')
      }

      setCards(cards.filter(card => card._id !== cardId))
      if (currentCardIndex >= cards.length - 1) {
        setCurrentCardIndex(Math.max(0, cards.length - 2))
      }
    } catch (err) {
      console.error('Error deleting card:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full border-4 border-accent-silver/10 border-t-accent-neon h-12 w-12" />
          <p className="mt-4 text-accent-silver">Loading deck...</p>
        </div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || 'Deck not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-accent-silver hover:text-white"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => router.back()}
              className="p-2 text-accent-silver hover:text-white rounded-lg hover:bg-white/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </motion.button>
            <h1 className="text-2xl font-bold text-white">
              Editing: {deck.title}
            </h1>
          </div>
          <p className="mt-2 text-accent-silver">
            {cards.length} cards in deck
          </p>
        </div>

        {/* Editor */}
        {cards.length > 0 ? (
          <FlashcardEditor
            cards={cards}
            currentIndex={currentCardIndex}
            onCardUpdate={handleCardUpdate}
            onNavigate={handleNavigate}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-accent-silver">No cards in this deck yet.</p>
            <motion.button
              onClick={handleAddCard}
              className="mt-4 px-4 py-2 bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Your First Card
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
} 