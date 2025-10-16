'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon, 
  AcademicCapIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { InlineFeatureGate } from '@/components/features/FeatureGate'
import html2pdf from 'html2pdf.js'

interface Note {
  _id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function NoteViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = useParams()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  useEffect(() => {
    const fetchNote = async () => {
      try {
        if (!session?.user?.accessToken) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch note')
        }

        const data = await response.json()
        setNote(data.note)
        setEditedTitle(data.note.title)
      } catch (err) {
        console.error('Error fetching note:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch note')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()
  }, [session, id])

  const handleSaveTitle = async () => {
    try {
      if (!session?.user?.accessToken || !note) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          title: editedTitle,
          content: note.content
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update note title')
      }

      const data = await response.json()
      setNote(data.note)
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating note title:', err)
      setError(err instanceof Error ? err.message : 'Failed to update note title')
    }
  }

  const handleDownloadPDF = async () => {
    if (!note) return

    try {
      const element = document.createElement('div')
      element.innerHTML = note.content
      element.className = 'prose prose-invert max-w-none'
      
      const opt = {
        margin: 1,
        filename: `${note.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }
      
      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('Error downloading PDF:', err)
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    }
  }

  const handleGenerateQuiz = () => {
    router.push(`/notes/${id}/quiz/generate`)
  }

  const handleTakeQuiz = () => {
    router.push(`/notes/${id}/quiz`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-obsidian py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-accent-obsidian py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Note not found</h2>
            <motion.button
              onClick={() => router.push('/notes/list')}
              className="flex items-center gap-2 px-4 py-2 bg-accent-neon text-black rounded-lg mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Notes
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push('/notes/list')}
                className="p-2 text-accent-silver hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </motion.button>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-3xl font-bold text-white bg-transparent border-b-2 border-accent-neon focus:outline-none"
                    autoFocus
                    aria-label="Note title"
                    placeholder="Enter note title"
                  />
                  <motion.button
                    onClick={handleSaveTitle}
                    className="p-1 text-accent-neon hover:text-accent-neon/80"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Save title"
                  >
                    <CheckIcon className="h-6 w-6" />
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedTitle(note.title)
                    }}
                    className="p-1 text-red-500 hover:text-red-400"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Cancel editing"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-white">{note.title}</h1>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-silver/20 text-accent-silver rounded-lg hover:bg-accent-silver/30 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PencilSquareIcon className="h-5 w-5" />
                Edit
              </motion.button>
              <motion.button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-accent-silver/20 text-accent-silver rounded-lg hover:bg-accent-silver/30 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download
              </motion.button>
              <InlineFeatureGate featureKey="ai_quiz_generation">
                <motion.button
                  onClick={handleGenerateQuiz}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AcademicCapIcon className="h-5 w-5" />
                  Generate Quiz
                </motion.button>
              </InlineFeatureGate>
              <motion.button
                onClick={handleTakeQuiz}
                className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-accent-gold/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
                Take Quiz
              </motion.button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {/* Note Content */}
          <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
            <style jsx global>{`
              .prose h1 {
                color: #ffffff;
                font-size: 2em;
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                font-weight: 700;
              }
              .prose h2 {
                color: #ffffff;
                font-size: 1.5em;
                margin-top: 1.2em;
                margin-bottom: 0.4em;
                font-weight: 600;
              }
              .prose strong {
                color: #50E3C2;
                font-weight: 600;
              }
              .prose ul {
                list-style-type: disc;
                padding-left: 1.5em;
                margin: 1em 0;
              }
              .prose li {
                color: #B4B4B4;
                margin: 0.5em 0;
              }
              .prose p {
                color: #B4B4B4;
                margin: 1em 0;
                line-height: 1.6;
              }
              .prose table {
                width: 100%;
                border-collapse: collapse;
                margin: 1em 0;
              }
              .prose td, .prose th {
                border: 1px solid #333;
                padding: 0.5em;
                color: #B4B4B4;
              }
            `}</style>
          </div>

          {/* Last Updated */}
          <div className="mt-4 text-sm text-accent-silver">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
} 