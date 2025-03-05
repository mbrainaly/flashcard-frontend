export interface StudyProgress {
  mastered: number
  learning: number
  new: number
}

export interface IDeck {
  _id: string
  title: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
  lastStudied?: string
  studyProgress: StudyProgress
  totalCards: number
  tags?: string[]
}

export interface CreateDeckInput {
  title: string
  description?: string
}

export interface UpdateDeckInput {
  title?: string
  description?: string
} 