'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useRouter } from 'next/navigation'

interface Note {
  _id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

export default function NotesListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      if (!session?.user?.accessToken) return

      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch notes')
      }
      
      console.log('Notes fetched successfully:', data)
      setNotes(data.notes)
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch notes when session is ready (only once)
  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchNotes()
    }
  }, [session?.user?.accessToken]) // Only depend on accessToken, not entire session object

  // Add event listeners for page visibility (less aggressive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user?.accessToken) {
        fetchNotes()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session?.user?.accessToken]) // Add dependency to avoid stale closure

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-obsidian py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center">
          <LoadingSpinner />
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Notes</h1>
            <Link href="/notes">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="h-5 w-5" />
                Create Notes
              </motion.button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {notes.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-accent-silver/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Notes Yet</h3>
              <p className="text-accent-silver mb-8">
                Create your first note to get started with AI-powered note-taking.
              </p>
              <Link href="/notes">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-accent-neon text-black rounded-xl hover:bg-accent-neon/90 transition-colors mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlusIcon className="h-5 w-5" />
                  Create Your First Note
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <Link key={note._id} href={`/notes/${note._id}`}>
                  <motion.div
                    className="p-6 rounded-xl bg-glass backdrop-blur-sm ring-1 ring-accent-silver/10 hover:ring-accent-neon/30 transition-all h-full flex flex-col"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{note.title}</h3>
                    <div className="text-sm text-accent-silver mb-4 line-clamp-3 flex-grow">
                      {stripHtml(note.content)}
                    </div>
                    <div className="text-xs text-accent-silver">
                      Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 