'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  ArrowLeftIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { showToast } from '@/components/ui/Toast'

interface NoteDetails {
  _id: string
  title: string
  content: string
  summary: string
  author: {
    name: string
    email: string
  }
  source: {
    type: 'pdf' | 'text' | 'url' | 'manual'
    name: string
  }
  category: string
  isActive: boolean
  isPublic: boolean
  wordCount: number
  readingTime: number
  generatedAt?: string
  viewCount: number
  downloadCount: number
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface NoteDetailsSkeleton {
  // Skeleton component for loading state
}

const NoteDetailsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-accent-silver/10 rounded"></div>
        <div className="w-64 h-8 bg-accent-silver/10 rounded"></div>
      </div>
      <div className="flex space-x-2">
        <div className="w-20 h-10 bg-accent-silver/10 rounded"></div>
        <div className="w-20 h-10 bg-accent-silver/10 rounded"></div>
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-accent-silver/5 rounded-xl p-6 border border-accent-silver/10">
          <div className="w-16 h-4 bg-accent-silver/10 rounded mb-2"></div>
          <div className="w-12 h-8 bg-accent-silver/10 rounded"></div>
        </div>
      ))}
    </div>

    {/* Content Skeleton */}
    <div className="bg-accent-silver/5 rounded-xl p-6 border border-accent-silver/10">
      <div className="w-32 h-6 bg-accent-silver/10 rounded mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-full h-4 bg-accent-silver/10 rounded"></div>
        ))}
      </div>
    </div>
  </div>
)

export default function NoteDetailsPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<NoteDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveWordCount, setLiveWordCount] = useState(0)

  const calculateWordCount = (content: string) => {
    if (!content) return 0
    // Remove HTML tags and calculate word count
    const textContent = content.replace(/<[^>]*>/g, ' ')
    const words = textContent.split(/\s+/).filter(word => word.length > 0)
    return words.length
  }

  const fetchNoteDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.get(`/api/admin/content/notes/${noteId}`)
      
      if (response.success && response.data) {
        // Backend returns { note: {...}, associatedQuizzes: [...] }
        const { note: noteData } = response.data
        
        setNote(noteData)
        // Calculate live word count from actual content
        const wordCount = calculateWordCount(noteData.content)
        setLiveWordCount(wordCount)
      } else {
        throw new Error(response.error || 'Failed to fetch note details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch note details')
      console.error('Error fetching note details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (noteId) {
      fetchNoteDetails()
    }
  }, [noteId])

  const handleDelete = async () => {
    if (!note) return
    
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        const response = await adminApi.delete(`/api/admin/content/notes/${note._id}`)
        if (response.success) {
          showToast({
            type: 'success',
            title: 'Note Deleted',
            message: `"${note.title}" has been deleted successfully.`
          })
          // Navigate back to notes list
          router.push('/admin/dashboard/content/notes')
        } else {
          showToast({
            type: 'error',
            title: 'Delete Failed',
            message: response.error || 'Failed to delete note. Please try again.'
          })
        }
      } catch (error) {
        console.error('Error deleting note:', error)
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete note. Please try again.'
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSourceBadge = (source: NoteDetails['source']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (source.type) {
      case 'pdf':
        return `${baseClasses} bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300`
      case 'text':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300`
      case 'url':
        return `${baseClasses} bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300`
      case 'manual':
        return `${baseClasses} bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300`
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <NoteDetailsSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => router.push('/admin/dashboard/content/notes')}
          className="mt-2 text-red-600 dark:text-red-400 hover:underline"
        >
          ← Back to Notes
        </button>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Note not found</h3>
        <button
          onClick={() => router.push('/admin/dashboard/content/notes')}
          className="mt-2 text-accent-neon hover:underline"
        >
          ← Back to Notes
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/dashboard/content/notes')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {note.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Note Details
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {hasPermission('content.delete') && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                Word Count
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {liveWordCount.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                Reading Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.max(1, Math.ceil(liveWordCount / 200))} min
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                Downloads
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {note.downloadCount.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Note Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Note Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-accent-silver mb-2">Author</h4>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
                <span className="text-xs font-medium text-black">
                  {note.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{note.author.name}</p>
                <p className="text-xs text-gray-500 dark:text-accent-silver">{note.author.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-accent-silver mb-2">Category</h4>
            <p className="text-sm text-gray-900 dark:text-white">{note.category}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-accent-silver mb-2">Source</h4>
            <span className={getSourceBadge(note.source)}>
              {note.source.type.toUpperCase()}
            </span>
            {note.source.name && (
              <p className="text-xs text-gray-500 dark:text-accent-silver mt-1">{note.source.name}</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-accent-silver mb-2">Created</h4>
            <div className="flex items-center text-sm text-gray-600 dark:text-accent-silver">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {formatDate(note.createdAt)}
            </div>
            {note.generatedAt && (
              <div className="flex items-center mt-1">
                <SparklesIcon className="w-3 h-3 mr-1 text-purple-500" />
                <span className="text-xs text-purple-600 dark:text-purple-400">AI Generated</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-accent-silver mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Summary */}
      {note.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {note.summary}
          </p>
        </motion.div>
      )}

      {/* Note Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Content
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          <div 
            className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      </motion.div>
    </div>
  )
}
