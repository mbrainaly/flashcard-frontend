'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ICard } from '@/types/card'
import { useSession } from 'next-auth/react'
import StudyModeSelector, { StudyMode } from '@/components/study/StudyModeSelector'
import StudyConfig, { StudyConfig as StudyConfigType } from '@/components/study/StudyConfig'
import ExamMode from '@/components/study/ExamMode'
import QuizMode from '@/components/study/QuizMode'
import StudySessionSummary from '@/components/study/StudySessionSummary'

interface StudySessionPageProps {
  params: {
    id: string
  }
}

const DEFAULT_STUDY_CONFIG: StudyConfigType = {
  cardOrder: 'sequential',
  cardDirection: 'front-to-back',
  dailyLimit: 20,
  showProgress: true,
  enableSharing: false,
}

export default function StudySessionPage({ params }: StudySessionPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const [cards, setCards] = useState<ICard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [studyProgress, setStudyProgress] = useState({
    reviewed: 0,
    remaining: 0,
  })
  const [selectedMode, setSelectedMode] = useState<StudyMode>('standard')
  const [isConfiguring, setIsConfiguring] = useState(true)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [isExplaining, setIsExplaining] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [studyConfig, setStudyConfig] = useState<StudyConfigType>(DEFAULT_STUDY_CONFIG)

  // Load saved config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(`study_config_${id}`)
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setStudyConfig(prev => ({
          ...prev,
          ...parsedConfig
        }))
      } catch (e) {
        console.error('Failed to parse saved config:', e)
      }
    }
  }, [id])

  // Save study config changes to localStorage
  useEffect(() => {
    localStorage.setItem(`study_config_${id}`, JSON.stringify(studyConfig))
  }, [studyConfig, id])

  const handleConfigChange = (updates: Partial<StudyConfigType>) => {
    setStudyConfig(prev => ({
      ...prev,
      ...updates,
    }))
  }

  const fetchDueCards = async () => {
    try {
      if (!session?.user?.accessToken) {
        setError('Please log in to study')
        setIsLoading(false)
        return
      }

      const endpoint = selectedMode === 'spaced' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/decks/${id}/cards/due`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/decks/${id}/cards`

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cards')
      }

      let data = await response.json()

      // Apply card order
      if (studyConfig.cardOrder === 'random') {
        data = data.sort(() => Math.random() - 0.5)
      }

      // Apply daily limit for spaced repetition mode
      if (selectedMode === 'spaced' && data.length > studyConfig.dailyLimit) {
        data = data.slice(0, studyConfig.dailyLimit)
      }

      setCards(data)
      setStudyProgress({
        reviewed: 0,
        remaining: data.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isConfiguring) {
      fetchDueCards()
    }
  }, [id, selectedMode, isConfiguring])

  const handleReview = async (quality: number) => {
    try {
      if (!session?.user?.accessToken) return

      const currentCard = cards[currentCardIndex]
      
      // Track correct answers for all modes
      if (quality >= 4) {
        setCorrectAnswers(prev => prev + 1)
      }
      setTotalAnswered(prev => prev + 1)

      // Update progress
      setStudyProgress((prev) => ({
        reviewed: prev.reviewed + 1,
        remaining: prev.remaining - 1,
      }))

      // Move to next card
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1)
        setIsFlipped(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    }
  }

  const handleStartStudying = () => {
    setIsConfiguring(false)
    fetchDueCards()
  }

  const handleStudyAgain = () => {
    setIsConfiguring(true)
    setCurrentCardIndex(0)
    setCorrectAnswers(0)
    setTotalAnswered(0)
    setIsFlipped(false)
    setStudyProgress({
      reviewed: 0,
      remaining: cards.length,
    })
    setCards([])
    setExplanation('')
  }

  const getExplanation = async (front: string, back: string) => {
    try {
      setIsExplaining(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          front,
          back,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get explanation')
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error) {
      console.error('Error getting explanation:', error)
      setExplanation('Failed to get explanation. Please try again.')
    } finally {
      setIsExplaining(false)
    }
  }

  const renderStudyMode = () => {
    // Show summary when all cards are reviewed
    if (studyProgress.reviewed === cards.length && studyProgress.reviewed > 0) {
      return (
        <div className="min-h-screen bg-accent-obsidian py-12">
          <div className="container mx-auto px-4">
            <StudySessionSummary
              totalCards={studyProgress.reviewed}
              correctAnswers={correctAnswers}
              onStudyAgain={handleStudyAgain}
              mode={selectedMode}
              examAnswers={[]}
            />
          </div>
        </div>
      )
    }

    const currentCard = cards[currentCardIndex]
    if (!currentCard) return null

    // Determine which side to show based on card direction
    const getCardContent = () => {
      if (!currentCard) return ''
      
      switch (studyConfig.cardDirection) {
        case 'back-to-front':
          return isFlipped ? currentCard.front : currentCard.back
        case 'mixed':
          // Randomly decide which side to show for each card
          const showFrontFirst = currentCard._id.charCodeAt(0) % 2 === 0
          return isFlipped 
            ? (showFrontFirst ? currentCard.back : currentCard.front)
            : (showFrontFirst ? currentCard.front : currentCard.back)
        case 'front-to-back':
        default:
          return isFlipped ? currentCard.back : currentCard.front
      }
    }

    switch (selectedMode) {
      case 'exam':
        return (
          <ExamMode
            card={currentCard}
            onNext={() => {
              if (currentCardIndex < cards.length - 1) {
                setCurrentCardIndex((prev) => prev + 1)
              } else {
                setCards([])
              }
            }}
            onReview={handleReview}
            currentCardIndex={currentCardIndex}
            totalCards={cards.length}
            showProgress={studyConfig.showProgress}
          />
        )
      case 'quiz':
        return (
          <QuizMode
            key={currentCard._id}
            card={currentCard}
            onNext={() => {
              if (currentCardIndex < cards.length - 1) {
                setCurrentCardIndex((prev) => prev + 1)
              } else {
                setCards([])
              }
            }}
            onReview={handleReview}
          />
        )
      default:
        const cardContent = getCardContent()
        return (
          <>
            {/* Card */}
            <div className="mt-8 flex justify-center">
              <motion.div
                className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentCard._id}-${isFlipped ? 'back' : 'front'}`}
                    initial={{ rotateY: isFlipped ? -90 : 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: isFlipped ? 90 : -90 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-2xl bg-glass backdrop-blur-sm p-8 flex flex-col ring-1 ring-accent-silver/10"
                  >
                    <div className="flex-1 flex items-center justify-center flex-col">
                      {currentCard.image && !isFlipped && (
                        <div className="mb-4">
                          <img 
                            src={currentCard.image} 
                            alt="Card illustration" 
                            className="rounded-lg max-h-48 object-contain"
                          />
                        </div>
                      )}
                      <p className="text-xl text-white text-center">
                        {cardContent}
                      </p>
                    </div>
                    {isFlipped && currentCard.hints?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-accent-neon">Hints:</p>
                        <ul className="mt-1 list-disc list-inside text-sm text-accent-silver">
                          {currentCard.hints.map((hint, index) => (
                            <li key={index}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isFlipped && currentCard.examples?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-accent-gold">Examples:</p>
                        <ul className="mt-1 list-disc list-inside text-sm text-accent-silver">
                          {currentCard.examples.map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isFlipped && explanation && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-accent-neon">Explanation:</p>
                        <p className="mt-1 text-sm text-accent-silver">{explanation}</p>
                      </div>
                    )}
                    <div className="mt-4 text-center text-sm text-accent-silver">
                      Click to {isFlipped ? 'hide' : 'show'} answer
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Review buttons */}
            <div className="mt-8 flex justify-center gap-4">
              {isFlipped && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    getExplanation(currentCard.front, currentCard.back)
                  }}
                  className="rounded-full bg-accent-gold/10 p-4 text-accent-gold hover:bg-accent-gold/20 transition-colors"
                  disabled={isExplaining}
                >
                  {isExplaining ? (
                    <div className="h-6 w-6 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReview(1)}
                className="rounded-full bg-red-500/10 p-4 text-red-500 hover:bg-red-500/20 transition-colors"
                disabled={!isFlipped}
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReview(3)}
                className="rounded-full bg-accent-gold/10 p-4 text-accent-gold hover:bg-accent-gold/20 transition-colors"
                disabled={!isFlipped}
              >
                <ArrowPathIcon className="h-6 w-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReview(5)}
                className="rounded-full bg-green-500/10 p-4 text-green-500 hover:bg-green-500/20 transition-colors"
                disabled={!isFlipped}
              >
                <CheckIcon className="h-6 w-6" />
              </motion.button>
            </div>
          </>
        )
    }
  }

  if (isLoading && !isConfiguring) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full border-4 border-accent-silver/10 border-t-accent-neon h-12 w-12" />
          <p className="mt-4 text-accent-silver">Loading cards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-accent-silver mb-8">{error}</p>
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center rounded-full bg-accent-neon px-4 py-1.5 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </motion.button>
        </div>
      </div>
    )
  }

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-accent-obsidian py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-2xl font-bold text-white mb-8">Study Settings</h1>
          
          {/* Study Mode Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Select Study Mode</h2>
            <StudyModeSelector
              selectedMode={selectedMode}
              onChange={setSelectedMode}
            />
          </div>

          {/* Study Configuration */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Configure Study Session</h2>
            <StudyConfig
              config={studyConfig}
              onChange={handleConfigChange}
            />
          </div>

          {/* Start Button */}
          <motion.button
            onClick={handleStartStudying}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full bg-accent-neon py-3 text-lg font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
          >
            Start Studying
          </motion.button>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedMode === 'spaced' && !studyProgress.reviewed 
              ? 'No Cards Due for Review'
              : 'Study Session Complete!'}
          </h2>
          <p className="text-accent-silver mb-8">
            {selectedMode === 'spaced' && !studyProgress.reviewed
              ? 'There are no cards due for review right now. Cards become available for review based on your previous performance and spaced repetition intervals.'
              : `You've reviewed all ${studyProgress.reviewed} cards in this session.`}
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={() => {
                setIsConfiguring(true)
                setCurrentCardIndex(0)
                setIsFlipped(false)
                setStudyProgress({
                  reviewed: 0,
                  remaining: 0,
                })
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-full bg-accent-neon px-4 py-2 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Try Another Mode
            </motion.button>
            <motion.button
              onClick={() => router.push(`/decks/${id}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/20"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Deck
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Progress bar */}
        {studyConfig.showProgress && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-accent-silver mb-2">
              <span>Progress</span>
              <span>{studyProgress.reviewed} / {studyProgress.reviewed + studyProgress.remaining} cards</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-neon transition-all duration-300"
                style={{
                  width: `${(studyProgress.reviewed / (studyProgress.reviewed + studyProgress.remaining)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {renderStudyMode()}
      </div>
    </div>
  )
} 