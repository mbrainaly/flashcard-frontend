'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  LightBulbIcon,
  ArrowPathIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

interface Subject {
  id: string
  name: string
  icon: typeof BookOpenIcon
}

const subjects: Subject[] = [
  { id: 'math', name: 'Mathematics', icon: AcademicCapIcon },
  { id: 'science', name: 'Science', icon: LightBulbIcon },
  { id: 'history', name: 'History', icon: BookOpenIcon },
  { id: 'literature', name: 'Literature', icon: BookOpenIcon },
  { id: 'computer', name: 'Computer Science', icon: LightBulbIcon },
]

export default function ConceptExplanations() {
  const { data: session } = useSession()
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [concept, setConcept] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExplainConcept = async () => {
    if (!concept.trim()) {
      setError('Please enter a concept to explain')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetchWithAuth('/api/ai/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, subject: selectedSubject }),
      })

      if (!response.ok) {
        throw new Error('Failed to get explanation')
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (err) {
      console.error('Error getting explanation:', err)
      setError(err instanceof Error ? err.message : 'Failed to get explanation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Subject selector */}
      <div>
        <label className="block text-sm font-medium text-accent-silver mb-4">
          Select Subject Area
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {subjects.map((subject) => {
            const SubjectIcon = subject.icon
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`p-4 rounded-xl backdrop-blur-sm ring-1 transition-all flex flex-col items-center gap-2
                  ${selectedSubject === subject.id 
                    ? 'bg-accent-neon/10 ring-accent-neon text-white' 
                    : 'bg-glass ring-accent-silver/10 text-accent-silver hover:ring-accent-neon/30 hover:text-white'
                  }`}
              >
                <SubjectIcon className="h-6 w-6" />
                <span className="text-sm font-medium">{subject.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Concept input */}
      <div>
        <label htmlFor="concept" className="block text-sm font-medium text-accent-silver mb-2">
          Enter Concept to Explain
        </label>
        <div className="relative">
          <input
            type="text"
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Enter a concept or topic you'd like to understand better..."
            className="w-full bg-white/5 border border-accent-silver/20 rounded-lg pl-4 pr-12 py-2 text-white
              focus:ring-2 focus:ring-accent-neon focus:border-transparent"
          />
          <button
            onClick={handleExplainConcept}
            disabled={isLoading || !concept.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent-silver
              hover:text-accent-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <LightBulbIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Explanation display */}
      {explanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6 border border-accent-silver/20 shadow-lg"
        >
          <h3 className="text-lg font-medium text-accent-neon mb-4 flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5" />
            Explanation
          </h3>
          <div 
            className="prose prose-invert max-w-none space-y-4"
            dangerouslySetInnerHTML={{ __html: explanation }}
          />
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty state */}
      {!explanation && !isLoading && (
        <div className="text-center py-12">
          <LightBulbIcon className="h-12 w-12 text-accent-silver/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Ready to Learn</h3>
          <p className="text-accent-silver">
            Select a subject and enter a concept to get a detailed explanation.
          </p>
        </div>
      )}
    </div>
  )
} 