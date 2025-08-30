import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import QuizInputSelector from './QuizInputSelector'
import QuizConfigForm from './QuizConfigForm'
import QuizReviewForm from './QuizReviewForm'
import { AnalysisResult, QuizConfig, IQuizQuestion } from '@/types/quiz'

type Step = 'input' | 'config' | 'review' | 'generating'

function normalizeDifficulty(d?: string): 'beginner' | 'intermediate' | 'advanced' {
  const s = (d || '').toString().toLowerCase().trim()
  if (s === 'beginner' || s === 'intermediate' || s === 'advanced') return s
  if (s === 'easy') return 'beginner'
  if (s === 'medium' || s === 'moderate' || s === 'normal') return 'intermediate'
  if (s === 'hard' || s === 'difficult') return 'advanced'
  return 'intermediate'
}

function normalizeType(t?: string): 'multiple-choice' | 'true-false' | 'short-answer' {
  const s = (t || '').toString().toLowerCase().trim().replace(/_/g, '-').replace(/\s+/g, '-').replace('true/false', 'true-false')
  if (s === 'multiple-choice' || s === 'true-false' || s === 'short-answer') return s as any
  if (s === 'mcq' || s === 'multiplechoice') return 'multiple-choice'
  if (s === 'truefalse') return 'true-false'
  if (s === 'shortanswer' || s === 'open-ended' || s === 'open-ended-question') return 'short-answer'
  return 'multiple-choice'
}

export default function QuizGenerator() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState<Step>('input')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [selectedConfig, setSelectedConfig] = useState<QuizConfig | null>(null)
  const [questions, setQuestions] = useState<IQuizQuestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysis(result)
    setStep('config')
  }

  const handleConfigSubmit = async (config: QuizConfig) => {
    try {
      setError(null)
      setSelectedConfig(config)
      setStep('generating')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-quiz-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          content: analysis?.content,
          numberOfQuestions: config.numberOfQuestions,
          difficulty: config.difficulty,
          questionTypes: config.questionTypes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const quiz = await response.json()
      const normalized: IQuizQuestion[] = (quiz.questions || []).map((q: any) => ({
        question: q.question || '',
        options: Array.isArray(q.options) ? q.options : [],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        type: normalizeType(q.type),
        difficulty: normalizeDifficulty(q.difficulty),
      }))
      setQuestions(normalized)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStep('config')
    }
  }

  const handleQuestionsUpdate = (updatedQuestions: IQuizQuestion[]) => {
    setQuestions(updatedQuestions)
  }

  const handleSaveQuiz = async () => {
    try {
      setError(null);
      setIsSaving(true);

      const titleFromConfig = selectedConfig?.title?.trim()
      const descriptionFromConfig = selectedConfig?.description?.trim()

      const quizData = {
        title: titleFromConfig || analysis?.suggestedTopics[0] || 'Untitled Quiz',
        description: descriptionFromConfig || `Quiz generated from content analysis covering ${analysis?.keyConcepts.join(', ')}`,
        questions: questions.map(q => ({
          ...q,
          type: normalizeType(q.type),
          difficulty: normalizeDifficulty(q.difficulty),
        })),
        isPublic: false,
        tags: analysis?.keyConcepts || [],
        difficulty: normalizeDifficulty(selectedConfig?.difficulty || analysis?.recommendedDifficulty || 'intermediate'),
        passingScore: 70,
        timeLimit: selectedConfig?.timeLimit ?? null,
        analytics: {
          totalAttempts: 0,
          averageScore: 0,
          averageTimeSpent: 0,
          completionRate: 0,
          questionStats: questions.map((_, index) => ({
            questionIndex: index,
            correctAnswers: 0,
            totalAttempts: 0,
            averageTimeSpent: 0
          })),
          lastUpdated: new Date()
        },
        attempts: []
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save quiz');
      }

      const savedQuiz = await response.json();
      
      if (!savedQuiz.data?._id) {
        throw new Error('Invalid response: missing quiz ID');
      }

      router.push(`/quizzes/${savedQuiz.data._id}`);
    } catch (err) {
      console.error('Error saving quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step === 'input' && (
          <QuizInputSelector onAnalysisComplete={handleAnalysisComplete} />
        )}

        {step === 'config' && analysis && (
          <QuizConfigForm
            analysis={analysis}
            onSubmit={handleConfigSubmit}
            error={error}
          />
        )}

        {step === 'review' && (
          <QuizReviewForm
            questions={questions}
            onQuestionsUpdate={handleQuestionsUpdate}
            onSave={handleSaveQuiz}
          />
        )}

        {step === 'generating' && !isSaving && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Generating Your Quiz</h3>
            <p className="text-gray-600">
              Please wait while we create your questions...
            </p>
          </div>
        )}

        {isSaving && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Saving Your Quiz</h3>
            <p className="text-gray-600">
              Please wait while we save your quiz...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </motion.div>
    </div>
  )
} 