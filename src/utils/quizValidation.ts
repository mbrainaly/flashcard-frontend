import { IQuizQuestion } from '@/types/quiz'

export interface QuizValidationError {
  type: 'question' | 'option' | 'general'
  message: string
  index?: number
}

export function validateQuiz(questions: IQuizQuestion[]): QuizValidationError[] {
  const errors: QuizValidationError[] = []

  // Check if there are any questions
  if (questions.length === 0) {
    errors.push({
      type: 'general',
      message: 'Quiz must have at least one question',
    })
    return errors
  }

  questions.forEach((question, index) => {
    // Validate question text
    if (!question.question.trim()) {
      errors.push({
        type: 'question',
        message: 'Question text cannot be empty',
        index,
      })
    }

    // Validate options
    const nonEmptyOptions = question.options.filter(opt => opt.trim())
    if (nonEmptyOptions.length < 2) {
      errors.push({
        type: 'option',
        message: 'Each question must have at least 2 non-empty options',
        index,
      })
    }

    // Check for duplicate options
    const uniqueOptions = new Set(question.options.map(opt => opt.trim()))
    if (uniqueOptions.size !== nonEmptyOptions.length) {
      errors.push({
        type: 'option',
        message: 'Options must be unique',
        index,
      })
    }

    // Validate correct option
    if (question.correctOptionIndex >= question.options.length || 
        !question.options[question.correctOptionIndex]?.trim()) {
      errors.push({
        type: 'option',
        message: 'Selected correct answer must be a non-empty option',
        index,
      })
    }

    // Validate difficulty
    if (!['beginner', 'intermediate', 'advanced'].includes(question.difficulty)) {
      errors.push({
        type: 'question',
        message: 'Invalid difficulty level',
        index,
      })
    }
  })

  return errors
} 