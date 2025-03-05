'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'

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

export default function HomeworkHelp() {
  const { data: session } = useSession()
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [question, setQuestion] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleGetHelp = async () => {
    if (!question.trim()) {
      setError('Please enter your question')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('subject', selectedSubject)
      formData.append('question', question)
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/homework-help`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to get help')
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (err) {
      console.error('Error getting help:', err)
      setError(err instanceof Error ? err.message : 'Failed to get help')
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

      {/* Question input */}
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-accent-silver mb-2">
          Your Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Describe your homework question in detail..."
          className="w-full h-32 bg-white/5 border border-accent-silver/20 rounded-lg px-4 py-2 text-white
            focus:ring-2 focus:ring-accent-neon focus:border-transparent"
        />
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-accent-silver mb-2">
          Upload Related Files (Optional)
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            className="w-full flex flex-col items-center px-4 py-6 bg-white/5 text-accent-silver
              rounded-lg border-2 border-accent-silver/20 border-dashed cursor-pointer
              hover:border-accent-neon/30 hover:bg-accent-neon/5"
          >
            <DocumentArrowUpIcon className="h-8 w-8 mb-2" />
            <span className="text-sm">
              {file ? file.name : 'Click to upload or drag and drop'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-accent-silver">
          Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG (max 10MB)
        </p>
      </div>

      {/* Submit button */}
      <motion.button
        onClick={handleGetHelp}
        disabled={isLoading || !question.trim()}
        className="w-full px-4 py-2 bg-accent-neon text-black font-medium rounded-lg
          hover:bg-accent-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          'Get Help'
        )}
      </motion.button>

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

      {/* Answer display */}
      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6 border border-accent-silver/20 shadow-lg"
        >
          <h3 className="text-lg font-medium text-accent-neon mb-4 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Solution
          </h3>
          <div 
            className="prose prose-invert max-w-none space-y-4"
            dangerouslySetInnerHTML={{ __html: answer }}
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
      {!answer && !isLoading && (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-accent-silver/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Need Help?</h3>
          <p className="text-accent-silver">
            Select a subject and ask your question to get started.
          </p>
        </div>
      )}
    </div>
  )
} 