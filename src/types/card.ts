export type CardStatus = 'new' | 'learning' | 'mastered'

export interface ICard {
  _id: string
  deckId: string
  front: string
  back: string
  image?: string
  hints?: string[]
  examples?: string[]
  tags?: string[]
  status: CardStatus
  nextReview: string
  lastReviewed?: string
  interval: number
  easeFactor: number
  repetitions: number
  createdAt: string
  updatedAt: string
}

export interface CreateCardInput {
  front: string
  back: string
  hints?: string[]
  examples?: string[]
  tags?: string[]
  image?: File
}

export interface UpdateCardInput {
  front?: string
  back?: string
  hints?: string[]
  examples?: string[]
  tags?: string[]
  image?: File
}

export interface ReviewCardInput {
  quality: number // 0-5 rating based on SuperMemo 2 algorithm
} 