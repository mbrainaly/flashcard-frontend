'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentTextIcon, DocumentIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import * as pdfjsLib from 'pdfjs-dist'
import { TextItem } from 'pdfjs-dist/types/src/display/api'
import mammoth from 'mammoth'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface NotesInputSelectorProps {
  onSubmit: (content: string, type: 'prompt' | 'content' | 'video') => void
}

type InputType = 'prompt' | 'content' | 'video'

const inputOptions = [
  {
    id: 'prompt' as InputType,
    title: 'Write a prompt',
    description: 'Describe what you want your notes to be about',
    icon: DocumentTextIcon,
  },
  {
    id: 'content' as InputType,
    title: 'Upload or paste content',
    description: 'Upload your existing content and allow AI to summarize it',
    icon: DocumentIcon,
  },
  {
    id: 'video' as InputType,
    title: 'Choose a video',
    description: 'Paste a link to a YouTube video to summarize it with AI',
    icon: VideoCameraIcon,
  },
]

export default function NotesInputSelector({ onSubmit }: NotesInputSelectorProps) {
  const [selectedType, setSelectedType] = useState<InputType | null>(null)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('Please enter some content')
      return
    }

    // Additional validation for video URLs
    if (selectedType === 'video') {
      try {
        // Clean up the URL first
        const cleanUrl = content.trim().replace(/^@/, '').trim();
        console.log('Processing URL:', cleanUrl);

        // Simple regex to extract video ID
        const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/i;
        const match = cleanUrl.match(youtubeRegex);
        
        if (!match || !match[1]) {
          console.error('No video ID found in URL');
          alert('Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)')
          return
        }

        const videoId = match[1];
        console.log('Extracted video ID:', videoId);

        // Construct a clean YouTube URL
        const finalUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.log('Final URL:', finalUrl);
        
        onSubmit(finalUrl, selectedType);
      } catch (err) {
        console.error('Error processing YouTube URL:', err);
        alert('Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)')
        return
      }
    } else {
      onSubmit(content.trim(), selectedType || 'prompt');
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)

      if (file.type === 'application/pdf') {
        // Handle PDF file
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item) => (item as TextItem).str || '')
            .join(' ')
          fullText += pageText + '\n\n'
        }
        
        setContent(fullText.trim())
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle DOCX file
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        setContent(result.value.trim())
      } else if (file.type === 'text/plain') {
        // Handle TXT file
        const text = await file.text()
        setContent(text.trim())
      } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')
      }
    } catch (err) {
      console.error('Error processing file:', err)
      setError(err instanceof Error ? err.message : 'Failed to process file')
      setContent('')
    } finally {
      setIsLoading(false)
    }
  }

  const renderInputForm = () => {
    if (!selectedType) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          {inputOptions.find(opt => opt.id === selectedType)?.title}
        </h2>
        
        {selectedType === 'prompt' && (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt..."
              className="w-full h-40 px-4 py-3 bg-white/5 rounded-xl text-white placeholder-accent-silver/50 
                border-2 border-accent-silver/30 focus:border-accent-neon outline-none transition-colors"
            />
            <div className="text-sm text-accent-silver">
              {content.length} of 5,000 characters
            </div>
          </div>
        )}

        {selectedType === 'content' && (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here..."
              className="w-full h-40 px-4 py-3 bg-white/5 rounded-xl text-white placeholder-accent-silver/50 
                border-2 border-accent-silver/30 focus:border-accent-neon outline-none transition-colors"
            />
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                aria-label="Upload file"
                title="Choose a file to upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                }}
                className="block w-full text-sm text-accent-silver
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-accent-neon file:text-black
                  hover:file:bg-accent-neon/90"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <LoadingSpinner />
                </div>
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
        )}

        {selectedType === 'video' && (
          <div className="space-y-4">
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste YouTube video URL..."
              className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-accent-silver/50 
                border-2 border-accent-silver/30 focus:border-accent-neon outline-none transition-colors"
            />
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <motion.button
            onClick={() => setSelectedType(null)}
            className="px-6 py-2 text-accent-silver hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
          
          <motion.button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-accent-neon text-black rounded-xl hover:bg-accent-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Generate
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      {!selectedType ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inputOptions.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => setSelectedType(option.id)}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-glass backdrop-blur-sm
                ring-1 ring-accent-silver/10 hover:ring-accent-neon/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option.icon className="h-12 w-12 text-accent-neon mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
              <p className="text-sm text-accent-silver">{option.description}</p>
            </motion.button>
          ))}
        </div>
      ) : (
        renderInputForm()
      )}
    </div>
  )
} 