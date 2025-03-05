import { useState } from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { PencilIcon, TrashIcon, PlusIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { IQuizQuestion, DifficultyLevel } from '@/types/quiz'
import { validateQuiz, QuizValidationError } from '@/utils/quizValidation'

interface QuizReviewFormProps {
  questions: IQuizQuestion[]
  onQuestionsUpdate: (questions: IQuizQuestion[]) => void
  onSave: () => void
}

export default function QuizReviewForm({
  questions: initialQuestions,
  onQuestionsUpdate,
  onSave,
}: QuizReviewFormProps) {
  const [questions, setQuestions] = useState<IQuizQuestion[]>(initialQuestions)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<QuizValidationError[]>([])

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setQuestions(items)
    onQuestionsUpdate(items)
  }

  // Handle question edit
  const handleQuestionEdit = (index: number, updates: Partial<IQuizQuestion>) => {
    const updatedQuestions = questions.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    )
    setQuestions(updatedQuestions)
    onQuestionsUpdate(updatedQuestions)
    // Clear validation errors for this question
    setValidationErrors(prev => prev.filter(error => error.index !== index))
  }

  // Handle question deletion
  const handleQuestionDelete = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    setQuestions(updatedQuestions)
    onQuestionsUpdate(updatedQuestions)
    // Clear validation errors for this question
    setValidationErrors(prev => prev.filter(error => error.index !== index))
  }

  // Handle adding a new question
  const handleAddQuestion = () => {
    const newQuestion: IQuizQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      type: 'multiple-choice',
      difficulty: 'intermediate',
    }
    setQuestions([...questions, newQuestion])
    setEditingIndex(questions.length)
  }

  // Handle save with validation
  const handleSave = () => {
    const errors = validateQuiz(questions)
    setValidationErrors(errors)

    if (errors.length === 0) {
      onSave()
    } else {
      // Scroll to the first error
      const firstErrorIndex = errors.find(e => e.index !== undefined)?.index
      if (firstErrorIndex !== undefined) {
        document.getElementById(`question-${firstErrorIndex}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }

  // Get errors for a specific question
  const getQuestionErrors = (index: number) => {
    return validationErrors.filter(error => error.index === index)
  }

  // Get general errors
  const getGeneralErrors = () => {
    return validationErrors.filter(error => error.type === 'general')
  }

  return (
    <div className="space-y-6">
      {getGeneralErrors().map((error, index) => (
        <div key={index} className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          {error.message}
        </div>
      ))}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {questions.map((question, index) => {
                const questionErrors = getQuestionErrors(index)
                return (
                  <Draggable
                    key={index}
                    draggableId={`question-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        id={`question-${index}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ${
                          questionErrors.length > 0 
                            ? 'ring-red-500/50' 
                            : 'ring-accent-silver/10'
                        }`}
                      >
                        {questionErrors.length > 0 && (
                          <div className="mb-4 text-red-500 text-sm">
                            {questionErrors.map((error, errorIndex) => (
                              <div key={errorIndex} className="flex items-center gap-2">
                                <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
                                {error.message}
                              </div>
                            ))}
                          </div>
                        )}

                        {editingIndex === index ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => handleQuestionEdit(index, { question: e.target.value })}
                              className="w-full bg-white/5 rounded-lg px-4 py-2 text-white"
                              placeholder="Enter question"
                            />
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={question.correctOptionIndex === optionIndex}
                                    onChange={() => handleQuestionEdit(index, { correctOptionIndex: optionIndex })}
                                    className="text-accent-neon"
                                    aria-label={`Set as correct answer for option ${optionIndex + 1}`}
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...question.options]
                                      newOptions[optionIndex] = e.target.value
                                      handleQuestionEdit(index, { options: newOptions })
                                    }}
                                    className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-white"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    aria-label={`Option ${optionIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <select
                              value={question.difficulty}
                              onChange={(e) => handleQuestionEdit(index, { 
                                difficulty: e.target.value as DifficultyLevel 
                              })}
                              className="bg-white/5 rounded-lg px-4 py-2 text-white"
                              aria-label="Question difficulty"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                            <div className="flex justify-end">
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="text-accent-neon hover:text-accent-neon/80"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-medium text-white">
                                {question.question || 'Untitled Question'}
                              </h3>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingIndex(index)}
                                  className="p-1 text-accent-silver hover:text-accent-neon"
                                  aria-label="Edit question"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleQuestionDelete(index)}
                                  className="p-1 text-accent-silver hover:text-red-500"
                                  aria-label="Delete question"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-lg ${
                                    question.correctOptionIndex === optionIndex
                                      ? 'bg-accent-neon/20 text-accent-neon'
                                      : 'bg-white/5 text-accent-silver'
                                  }`}
                                >
                                  {option || `Option ${optionIndex + 1}`}
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-sm text-accent-silver">
                              <span className="capitalize">{question.difficulty}</span>
                              <span className="capitalize">{question.type}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-between">
        <motion.button
          onClick={handleAddQuestion}
          className="flex items-center gap-2 px-4 py-2 text-accent-neon hover:text-accent-neon/80"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusIcon className="h-5 w-5" />
          Add Question
        </motion.button>

        <motion.button
          onClick={handleSave}
          className="px-6 py-2 bg-accent-neon text-black rounded-full font-medium hover:bg-accent-neon/90"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save Changes
        </motion.button>
      </div>
    </div>
  )
} 