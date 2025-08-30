'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon, 
  PaperClipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

interface Note {
  _id: string
  title: string
  content: string
}

export default function NotesQA() {
  const { data: session } = useSession()
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<string>('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (!session?.user?.accessToken) return

        const response = await fetchWithAuth('/api/notes')

        if (!response.ok) {
          throw new Error('Failed to fetch notes')
        }

        const data = await response.json()
        if (data.success) {
          setNotes(data.notes)
        }
      } catch (err) {
        console.error('Error fetching notes:', err)
        setError('Failed to fetch your notes')
      }
    }

    fetchNotes()
  }, [session])

  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedNote) {
      setError('Please select a note and enter your question')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const selectedNoteContent = notes.find(note => note._id === selectedNote)?.content
      if (!selectedNoteContent) {
        throw new Error('Selected note not found')
      }

      const response = await fetchWithAuth('/api/ai/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: selectedNoteContent }),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      setAnswer(data.answer)
    } catch (err) {
      console.error('Error getting answer:', err)
      setError(err instanceof Error ? err.message : 'Failed to get answer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Note selector */}
      <div>
        <label htmlFor="note-select" className="block text-sm font-medium text-accent-silver mb-2">
          Select Notes
        </label>
        <select
          id="note-select"
          value={selectedNote}
          onChange={(e) => setSelectedNote(e.target.value)}
          className="w-full bg-white/5 border border-accent-silver/20 rounded-lg px-4 py-2 text-white
            focus:ring-2 focus:ring-accent-neon focus:border-transparent"
        >
          <option value="">Choose a note</option>
          {notes.map((note) => (
            <option key={note._id} value={note._id}>
              {note.title}
            </option>
          ))}
        </select>
      </div>

      {/* Question input */}
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-accent-silver mb-2">
          Your Question
        </label>
        <div className="relative">
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your notes..."
            className="w-full bg-white/5 border border-accent-silver/20 rounded-lg pl-4 pr-12 py-2 text-white
              focus:ring-2 focus:ring-accent-neon focus:border-transparent"
          />
          <button
            onClick={handleAskQuestion}
            disabled={isLoading || !question.trim() || !selectedNote}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent-silver
              hover:text-accent-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
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

      {/* Answer display */}
      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6 border border-accent-silver/20 shadow-lg"
        >
          <h3 className="text-lg font-medium text-accent-neon mb-4 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Answer
          </h3>
          <div 
            className="prose prose-invert max-w-none space-y-4"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
          <style jsx global>{`
            .prose h1 {
              color: #ffffff;
              font-size: 1.5em;
              margin-top: 1em;
              margin-bottom: 0.5em;
              font-weight: 700;
            }
            .prose h2 {
              color: #50E3C2;
              font-size: 1.25em;
              margin-top: 1em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            .prose p {
              color: #B4B4B4;
              margin: 0.75em 0;
              line-height: 1.6;
            }
            .prose strong {
              color: #ffffff;
              font-weight: 600;
            }
            .prose ul {
              list-style-type: disc;
              padding-left: 1.5em;
              margin: 0.75em 0;
            }
            .prose li {
              color: #B4B4B4;
              margin: 0.5em 0;
            }
            .prose blockquote {
              border-left: 3px solid #50E3C2;
              padding-left: 1em;
              margin: 1em 0;
              font-style: italic;
              color: #ffffff;
              background: rgba(80, 227, 194, 0.1);
              padding: 1em;
              border-radius: 0.5em;
            }
            .prose code {
              background: rgba(255, 255, 255, 0.1);
              padding: 0.2em 0.4em;
              border-radius: 0.3em;
              font-size: 0.9em;
              color: #50E3C2;
            }
            .prose table {
              width: 100%;
              border-collapse: collapse;
              margin: 1em 0;
            }
            .prose th, .prose td {
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 0.5em;
              color: #B4B4B4;
            }
            .prose th {
              background: rgba(255, 255, 255, 0.05);
              color: #ffffff;
              font-weight: 600;
            }
            .prose tr:nth-child(even) {
              background: rgba(255, 255, 255, 0.02);
            }
          `}</style>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty state */}
      {!notes.length && !isLoading && (
        <div className="text-center py-12">
          <PaperClipIcon className="h-12 w-12 text-accent-silver/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Notes Found</h3>
          <p className="text-accent-silver">
            Create some notes first to start asking questions.
          </p>
        </div>
      )}
    </div>
  )
} 