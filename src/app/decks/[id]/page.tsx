'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PlayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { IDeck, CreateDeckInput, UpdateDeckInput } from '@/types/deck'
import { ICard, CreateCardInput } from '@/types/card'
import CardList from '@/components/card/CardList'
import CardFormModal from '@/components/card/CardFormModal'
import DeckFormModal from '@/components/deck/DeckFormModal'
import AIGeneratorModal from '@/components/ai/AIGeneratorModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DeckDetailPageProps {
  params: {
    id: string
  }
}

export default function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [deck, setDeck] = useState<IDeck | null>(null)
  const [cards, setCards] = useState<ICard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false)
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false)
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false)
  const [isAIGeneratorModalOpen, setIsAIGeneratorModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ICard | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const router = useRouter()
  const token = session?.user?.accessToken || ''

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchDeckAndCards()
    }
  }, [id, session?.user?.accessToken])

  const fetchDeckAndCards = async () => {
    try {
      setIsLoading(true)
      const [deckResponse, cardsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks/${id}`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks/${id}/cards`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }),
      ])

      if (!deckResponse.ok || !cardsResponse.ok) {
        throw new Error('Failed to fetch deck data')
      }

      const [deckData, cardsData] = await Promise.all([
        deckResponse.json(),
        cardsResponse.json(),
      ])

      setDeck(deckData)
      setCards(cardsData)
    } catch (err) {
      setError('Failed to load deck. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCard = (card: ICard) => {
    setSelectedCard(card)
    setIsEditCardModalOpen(true)
    setIsEditDeckModalOpen(false)
    setIsCreateCardModalOpen(false)
    setIsAIGeneratorModalOpen(false)
  }

  const handleCreateCard = () => {
    setIsCreateCardModalOpen(true)
    setIsEditDeckModalOpen(false)
    setIsEditCardModalOpen(false)
    setIsAIGeneratorModalOpen(false)
  }

  const handleCardSubmit = async (data: CreateCardInput) => {
    try {
      const url = selectedCard
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/cards/${selectedCard._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/decks/${id}/cards`
      
      const method = selectedCard ? 'PUT' : 'POST'

      // Create FormData to handle file upload
      const formData = new FormData()
      formData.append('front', data.front)
      formData.append('back', data.back)
      
      if (data.hints?.length) {
        data.hints.forEach((hint, index) => {
          if (hint) formData.append(`hints[${index}]`, hint)
        })
      }
      
      if (data.examples?.length) {
        data.examples.forEach((example, index) => {
          if (example) formData.append(`examples[${index}]`, example)
        })
      }
      
      if (data.tags?.length) {
        data.tags.forEach((tag, index) => {
          if (tag) formData.append(`tags[${index}]`, tag)
        })
      }

      if (data.image) {
        formData.append('image', data.image)
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to save card')
      }

      const savedCard = await response.json()

      if (selectedCard) {
        // Update existing card in state
        setCards((prevCards) =>
          prevCards.map((card) =>
            card._id === selectedCard._id ? savedCard.data : card
          )
        )
      } else {
        // Add new card to state
        setCards((prevCards) => [...prevCards, savedCard.data])
        // Update deck card count
        if (deck) {
          setDeck({
            ...deck,
            totalCards: deck.totalCards + 1,
          })
        }
      }

      // Close the modal after successful save
      setIsCreateCardModalOpen(false)
      setIsEditCardModalOpen(false)
      setSelectedCard(null)
    } catch (err) {
      console.error('Error saving card:', err)
      throw err // Re-throw to be handled by the modal's error handling
    }
  }

  const handleDeleteCard = async (cardId: string) => {
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

      // Remove card from state
      setCards((prevCards) => prevCards.filter((card) => card._id !== cardId))

      // Update deck card count
      if (deck) {
        setDeck({
          ...deck,
          totalCards: deck.totalCards - 1,
        })
      }
    } catch (err) {
      // TODO: Show error toast
      console.error('Error deleting card:', err)
    }
  }

  const handleEditDeck = async (data: UpdateDeckInput) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update deck')
      }

      const updatedDeck = await response.json()
      setDeck(updatedDeck)
    } catch (err) {
      console.error('Error updating deck:', err)
      // TODO: Show error toast
    }
  }

  const handleDeleteDeck = async () => {
    if (!window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete deck')
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Error deleting deck:', err)
      // TODO: Show error toast
    }
  }

  const handleOpenAIGenerator = () => {
    setIsAIGeneratorModalOpen(true)
    setIsEditDeckModalOpen(false)
    setIsEditCardModalOpen(false)
    setIsCreateCardModalOpen(false)
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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-accent-silver mb-8">{error || 'Deck not found'}</p>
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center rounded-full bg-accent-neon px-4 py-1.5 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
          >
            Return to Dashboard
          </motion.a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">{deck.title}</h1>
                <Link
                  href={`/decks/${id}/edit`}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-accent-neon rounded-full ring-1 ring-accent-neon/30 hover:bg-accent-neon/10 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Deck
                </Link>
              </div>
              <p className="mt-2 text-accent-silver">
                {deck.description || 'No description'}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2 sm:gap-3 justify-start sm:justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/decks/${id}/study`)}
                aria-label="Start Study Session"
                className="inline-flex items-center gap-2 rounded-full bg-accent-neon px-5 py-2.5 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-200 hover:bg-accent-neon/90 focus:outline-none focus:ring-2 focus:ring-accent-neon/40"
              >
                <PlayIcon className="h-5 w-5" />
                Start Study Session
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenAIGenerator}
                aria-label="Open AI Generator"
                className="inline-flex items-center gap-2 rounded-full border border-accent-neon/40 bg-accent-neon/10 px-5 py-2.5 text-sm font-semibold text-accent-neon transition-colors duration-200 hover:bg-accent-neon/15 focus:outline-none focus:ring-2 focus:ring-accent-neon/30"
              >
                <SparklesIcon className="h-5 w-5" />
                AI Generate
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteDeck}
                aria-label="Delete Deck"
                className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors duration-200 hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              >
                <TrashIcon className="h-5 w-5" />
                Delete
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-glass p-6 backdrop-blur-sm ring-1 ring-accent-silver/10">
              <p className="text-2xl font-bold text-accent-neon">{deck.totalCards}</p>
              <p className="text-sm text-accent-silver">Total Cards</p>
            </div>
            <div className="rounded-2xl bg-glass p-6 backdrop-blur-sm ring-1 ring-accent-silver/10">
              <p className="text-2xl font-bold text-accent-neon">{deck.studyProgress.mastered}</p>
              <p className="text-sm text-accent-silver">Mastered</p>
            </div>
            <div className="rounded-2xl bg-glass p-6 backdrop-blur-sm ring-1 ring-accent-silver/10">
              <p className="text-2xl font-bold text-accent-gold">{deck.studyProgress.learning}</p>
              <p className="text-sm text-accent-silver">Learning</p>
            </div>
            <div className="rounded-2xl bg-glass p-6 backdrop-blur-sm ring-1 ring-accent-silver/10">
              <p className="text-2xl font-bold text-white">{deck.studyProgress.new}</p>
              <p className="text-sm text-accent-silver">New</p>
            </div>
          </div>

          {/* Cards section */}
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Cards</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateCard}
                className="inline-flex items-center gap-2 rounded-full bg-accent-neon px-4 py-2 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
              >
                <PlusIcon className="h-5 w-5" />
                Add Card
              </motion.button>
            </div>

            <div className="mt-6">
              <CardList
                cards={cards}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Deck Modal */}
      <DeckFormModal
        isOpen={isEditDeckModalOpen}
        onClose={() => setIsEditDeckModalOpen(false)}
        onSubmit={handleEditDeck}
        deck={deck}
      />

      {/* Create/Edit Card Modal */}
      <CardFormModal
        isOpen={isEditCardModalOpen || isCreateCardModalOpen}
        onClose={() => {
          setIsEditCardModalOpen(false)
          setIsCreateCardModalOpen(false)
          setSelectedCard(null)
        }}
        onSubmit={handleCardSubmit}
        card={selectedCard}
        deckId={id}
      />

      {/* AI Generator Modal */}
      {token && (
        <AIGeneratorModal
          isOpen={isAIGeneratorModalOpen}
          onClose={() => setIsAIGeneratorModalOpen(false)}
          deckId={id}
          token={token}
          onSuccess={fetchDeckAndCards}
        />
      )}
    </div>
  )
} 