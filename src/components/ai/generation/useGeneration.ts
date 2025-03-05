import { useState } from 'react'
import { GeneratorConfig } from '../options/GeneratorOptions'
import { GenerationStep } from './GenerationProgress'
import { ICard } from '@/types/card'

interface GenerationState {
  step: GenerationStep
  error: string | null
  cards: ICard[]
  analysis: {
    keyConcepts: string[]
    suggestedTopics: string[]
    recommendedDifficulty: string
    estimatedCards: number
  } | null
}

interface UseGenerationProps {
  deckId: string
  token: string
}

export default function useGeneration({ deckId, token }: UseGenerationProps) {
  const [state, setState] = useState<GenerationState>({
    step: 'analyzing',
    error: null,
    cards: [],
    analysis: null,
  })

  const analyzeContent = async (content: string) => {
    try {
      setState(prev => ({ ...prev, step: 'analyzing', error: null }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze content')
      }

      const analysis = await response.json()
      setState(prev => ({ ...prev, analysis }))

      return analysis
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze content',
      }))
      throw error
    }
  }

  const generateCards = async (content: string, config: GeneratorConfig) => {
    try {
      setState(prev => ({ ...prev, step: 'generating', error: null }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          deckId,
          content,
          ...config,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      setState(prev => ({ ...prev, step: 'formatting' }))
      const cards = await response.json()

      setState(prev => ({
        ...prev,
        step: 'complete',
        cards,
      }))

      return cards
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards',
      }))
      throw error
    }
  }

  const reset = () => {
    setState({
      step: 'analyzing',
      error: null,
      cards: [],
      analysis: null,
    })
  }

  return {
    state,
    analyzeContent,
    generateCards,
    reset,
  }
} 