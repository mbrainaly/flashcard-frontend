'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'
import DeckGrid from '@/components/deck/DeckGrid'
import CreateDeckModal from '@/components/deck/CreateDeckModal'
import AIGeneratorModal from '@/components/ai/AIGeneratorModal'
import { IDeck, CreateDeckInput } from '@/types/deck'

export default function FlashcardsPage() {
  const { data: session } = useSession()
  const [decks, setDecks] = useState<IDeck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false)
  const token = session?.user?.accessToken || ''

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchDecks()
    }
  }, [session?.user?.accessToken])

  const fetchDecks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch decks')
      }

      const data = await response.json()
      setDecks(data)
    } catch (err) {
      setError('Failed to load decks. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDeck = async (data: CreateDeckInput) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/decks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create deck')
      }

      const newDeck = await response.json()
      setDecks([...decks, newDeck])
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Error creating deck:', err)
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full border-4 border-accent-silver/10 border-t-accent-neon h-12 w-12" />
          <p className="mt-4 text-accent-silver">Loading your decks...</p>
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
              <h1 className="text-2xl font-bold text-white">Your Flashcard Decks</h1>
              <p className="mt-2 text-accent-silver">
                Create, study, and master your knowledge
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAIGeneratorOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent-neon px-4 py-2 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
              >
                <SparklesIcon className="h-5 w-5" />
                Generate Your Flashcards
              </motion.button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-8 rounded-lg bg-red-500/10 p-4 text-red-500">
              {error}
            </div>
          )}

          {/* Decks grid */}
          <div className="mt-8">
            <DeckGrid
              decks={decks}
              onCreateDeck={() => setIsCreateModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDeck}
      />

      {/* AI Generator Modal */}
      {token && (
        <AIGeneratorModal
          isOpen={isAIGeneratorOpen}
          onClose={() => setIsAIGeneratorOpen(false)}
          deckId=""
          token={token}
          onSuccess={fetchDecks}
          createNewDeck={true}
        />
      )}
    </div>
  )
} 