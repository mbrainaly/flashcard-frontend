import { useState } from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import TabSelector from '@/components/ai/inputs/TabSelector'
import TextInput from '@/components/ai/inputs/TextInput'
import DocumentUpload from '@/components/ai/inputs/DocumentUpload'
import URLInput from '@/components/ai/inputs/URLInput'
import type { InputTab } from '@/components/ai/inputs/TabSelector'

interface QuizInputSelectorProps {
  onAnalysisComplete: (analysis: {
    content: string
    keyConcepts: string[]
    suggestedTopics: string[]
    recommendedDifficulty: string
    estimatedQuestions: number
  }) => void
}

export default function QuizInputSelector({ onAnalysisComplete }: QuizInputSelectorProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<InputTab>('text')
  const [content, setContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeContent = async (content: string) => {
    try {
      setIsAnalyzing(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-quiz-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Failed to analyze content: ${response.status} ${response.statusText}`
        );
      }

      const analysis = await response.json()
      onAnalysisComplete({
        content,
        ...analysis,
      })
    } catch (error) {
      console.error('Error analyzing content:', error)
      setError('Failed to analyze content. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTextSubmit = (text: string) => {
    setContent(text)
    if (text.trim()) {
      analyzeContent(text)
    }
  }

  const handleDocumentSubmit = async (file: File) => {
    try {
      setIsAnalyzing(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message || 
          `Failed to analyze document: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      if (!data.success || typeof data.content !== 'string') {
        throw new Error('Invalid response format from server')
      }

      setContent(data.content)
      await analyzeContent(data.content)
    } catch (error) {
      console.error('Error processing document:', error)
      setError(error instanceof Error ? error.message : 'Failed to process document')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleURLSubmit = async (url: string) => {
    try {
      setIsAnalyzing(true)
      setError(null)

      // First get the transcript from the notes API
      const transcriptResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ content: url, type: 'video' }),
      })

      // Get the response text first
      const responseText = await transcriptResponse.text()
      console.log('Raw response:', responseText)

      // Try to parse as JSON
      let transcriptData
      try {
        transcriptData = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        throw new Error('Invalid response format from server')
      }

      // Check for error response
      if (!transcriptResponse.ok) {
        throw new Error(
          transcriptData?.message || 
          'Failed to fetch video transcript. Please ensure the video has subtitles enabled.'
        )
      }

      // Validate the success response format
      if (!transcriptData.success || typeof transcriptData.notes !== 'string') {
        console.error('Unexpected response format:', transcriptData)
        throw new Error('Invalid response format from server')
      }

      // Now analyze the transcript content
      setContent(transcriptData.notes)
      await analyzeContent(transcriptData.notes)
    } catch (error) {
      console.error('Error processing YouTube URL:', error)
      setError(error instanceof Error ? error.message : 'Failed to process YouTube URL')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
        {activeTab === 'text' && (
          <TextInput onChange={handleTextSubmit} />
        )}

        {activeTab === 'document' && (
          <DocumentUpload onDocumentSubmit={handleDocumentSubmit} />
        )}

        {activeTab === 'url' && (
          <URLInput onSubmit={handleURLSubmit} />
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.div>
      )}

      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-accent-silver"
        >
          <SparklesIcon className="h-5 w-5 animate-pulse" />
          <span>Analyzing content...</span>
        </motion.div>
      )}
    </div>
  )
} 