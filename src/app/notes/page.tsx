'use client'

import { useState, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import NotesInputSelector from '@/components/notes/NotesInputSelector'
import { fetchWithAuth } from '@/utils/fetchWithAuth'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Dynamically import the NotesEditor component to prevent server-side rendering issues
const NotesEditor = lazy(() => import('@/components/notes/NotesEditor'))

export default function NotesGeneratorPage() {
  const { data: session } = useSession()
  const [step, setStep] = useState<'input' | 'writing' | 'editing'>('input')
  const [generatedNotes, setGeneratedNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleContentSubmit = async (content: string, type: 'prompt' | 'content' | 'video') => {
    try {
      setStep('writing')
      setError(null)

      if (!session?.user?.accessToken) {
        throw new Error('Not authenticated')
      }

      // Clean up URL if it's a video type
      let processedContent = content;
      if (type === 'video') {
        processedContent = content.trim().replace(/^@/, '');
      }

      console.log('Submitting content:', { type, content: processedContent });

      const response = await fetchWithAuth('/api/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: processedContent, type }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // First try to get the response as text
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      // If the response is not ok, try to parse it as JSON for error details
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Try to parse the success response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.error('Invalid JSON:', responseText);
        throw new Error('Server returned invalid JSON response');
      }

      console.log('Parsed response:', data);

      if (!data.success || !data.notes) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Basic HTML validation
      if (!data.notes.includes('<')) {
        console.error('Invalid notes format:', data.notes);
        throw new Error('Generated content is not in the expected HTML format');
      }

      setGeneratedNotes(data.notes);
      setStep('editing');
    } catch (err) {
      console.error('Error generating notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
      setStep('input');
    }
  }

  const handleSave = async (content: string, title: string) => {
    try {
      if (!session?.user?.accessToken) {
        throw new Error('Not authenticated')
      }

      const response = await fetchWithAuth('/api/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save notes')
      }
    } catch (err) {
      console.error('Error saving notes:', err)
      throw err // Re-throw to be handled by the NotesEditor component
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-8">AI Notes Generator</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                {error}
              </div>
            )}

            {step === 'input' && (
              <NotesInputSelector onSubmit={handleContentSubmit} />
            )}

            {step === 'writing' && (
              <div className="text-center py-12">
                <LoadingSpinner />
                <h3 className="text-xl font-semibold text-white mb-2">Generating Your Notes</h3>
                <p className="text-accent-silver">
                  Please wait while our AI analyzes your content and generates detailed notes...
                </p>
              </div>
            )}

            {step === 'editing' && (
              <Suspense fallback={
                <div className="text-center py-12">
                  <LoadingSpinner />
                  <h3 className="text-xl font-semibold text-white mb-2">Loading Editor</h3>
                  <p className="text-accent-silver">
                    Please wait while we prepare the editor...
                  </p>
                </div>
              }>
                <NotesEditor
                  content={generatedNotes}
                  onSave={handleSave}
                />
              </Suspense>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 