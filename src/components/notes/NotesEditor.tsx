'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { DocumentIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import AutoSaveIndicator from '@/components/editor/AutoSaveIndicator'
import { Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import html2pdf from 'html2pdf.js'

interface NotesEditorProps {
  content: string
  onSave: (content: string, title: string) => Promise<void>
}

export default function NotesEditor({ content: initialContent, onSave }: NotesEditorProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState(() => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `Notes - ${timestamp}`;
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debounce save function
  useEffect(() => {
    const saveTimeout = setTimeout(async () => {
      await handleSave()
    }, 2000)

    return () => clearTimeout(saveTimeout)
  }, [initialContent])

  const handleSave = async () => {
    if (!session?.user?.accessToken) {
      setError('Not authenticated')
      return
    }

    if (!title.trim()) {
      setError('Please enter a title for your notes')
      return
    }

    if (!initialContent.trim()) {
      setError('Notes content cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await onSave(initialContent, title.trim())
      setLastSaved(new Date())
    } catch (err) {
      console.error('Error saving notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveToNotes = async () => {
    if (!session?.user?.accessToken) {
      setError('Not authenticated')
      return
    }

    if (!title.trim()) {
      setError('Please enter a title for your notes')
      return
    }

    if (!initialContent.trim()) {
      setError('Notes content cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: initialContent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save notes')
      }

      setLastSaved(new Date())
      await onSave(initialContent, title.trim())
      
      // Force a router refresh to update the notes list
      router.refresh()
      
      // Navigate to the specific note page instead of the list
      if (data.note?._id) {
        router.push(`/notes/${data.note._id}`)
      } else {
        router.push('/notes/list')
      }
    } catch (err) {
      console.error('Error saving notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setIsSaving(true)
      const element = document.createElement('div')
      element.innerHTML = initialContent
      element.className = 'prose prose-invert max-w-none'
      
      const opt = {
        margin: 1,
        filename: `${title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }
      
      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('Error downloading PDF:', err)
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-transparent text-2xl font-bold text-white border-none focus:outline-none focus:ring-0"
        placeholder="Enter title..."
      />

      {/* Save Status */}
      <div className="flex justify-between items-center">
        <AutoSaveIndicator
          isSaving={isSaving}
          error={error}
          lastSaved={lastSaved}
        />
        
        <Menu as="div" className="relative z-50">
          <Menu.Button
            as={motion.button}
            className="flex items-center gap-2 px-4 py-2 bg-accent-neon text-black rounded-lg
              hover:bg-accent-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSaving}
          >
            <DocumentIcon className="h-5 w-5" />
            Save
          </Menu.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-black/80 backdrop-blur-md rounded-lg shadow-lg ring-1 ring-accent-silver/10 focus:outline-none z-50">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSaveToNotes}
                      className={`${
                        active ? 'bg-accent-neon text-black' : 'text-accent-silver'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                    >
                      <DocumentIcon className="mr-2 h-5 w-5" />
                      Save to Notes
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDownloadPDF}
                      className={`${
                        active ? 'bg-accent-neon text-black' : 'text-accent-silver'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                    >
                      <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                      Download as PDF
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Notes Content */}
      <div className="min-h-[500px] bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: initialContent }}
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
    </div>
  )
} 