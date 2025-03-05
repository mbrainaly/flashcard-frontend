export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface IQuizQuestion {
  question: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
  difficulty: DifficultyLevel
  type: QuestionType
}

export interface IQuizAttempt {
  userId: string
  score: number
  completedAt: string
  answers: {
    questionIndex: number
    selectedOption: number
    isCorrect: boolean
    timeTaken?: number
  }[]
}

export interface IQuiz {
  _id: string
  title: string
  description?: string
  owner: string
  deck?: string
  questions: IQuizQuestion[]
  isPublic: boolean
  tags: string[]
  difficulty: DifficultyLevel
  timeLimit?: number
  passingScore: number
  attempts: IQuizAttempt[]
  createdAt: string
  updatedAt: string
}

export interface CreateQuizInput {
  title: string
  description?: string
  deck?: string
  questions: Omit<IQuizQuestion, 'difficulty'>[]
  isPublic?: boolean
  tags?: string[]
  difficulty?: DifficultyLevel
  timeLimit?: number
  passingScore?: number
}

export interface UpdateQuizInput extends Partial<CreateQuizInput> {}

export interface QuizSubmissionInput {
  answers: {
    selectedOption: number
    timeTaken?: number
  }[]
}

export interface QuizSubmissionResult {
  score: number
  correctAnswers: number
  totalQuestions: number
  passed: boolean
  detailedAnswers: {
    questionIndex: number
    selectedOption: number
    isCorrect: boolean
    timeTaken?: number
  }[]
} 