import { useState } from 'react'
import { motion } from 'framer-motion'
import { LinkIcon } from '@heroicons/react/24/outline'
import FeatureGate from '@/components/features/FeatureGate'

interface URLInputProps {
  onSubmit: (url: string) => void
}

export default function URLInput({ onSubmit }: URLInputProps) {
  const [url, setUrl] = useState('')
  const [isValid, setIsValid] = useState(true)

  const validateURL = (input: string) => {
    try {
      // Clean up the URL first
      const cleanUrl = input.trim().replace(/^@/, '').trim();
      
      // Check if it's a YouTube URL
      const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/i;
      const match = cleanUrl.match(youtubeRegex);
      
      if (match && match[1]) {
        // Valid YouTube URL
        return true;
      }
      
      // For other URLs, try to create a URL object
      new URL(cleanUrl);
      return true;
    } catch {
      return false;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateURL(url)) {
      // Clean up the URL if it's a YouTube URL
      const cleanUrl = url.trim().replace(/^@/, '').trim();
      const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/i;
      const match = cleanUrl.match(youtubeRegex);
      
      if (match && match[1]) {
        // Construct a clean YouTube URL
        const finalUrl = `https://www.youtube.com/watch?v=${match[1]}`;
        onSubmit(finalUrl);
      } else {
        onSubmit(cleanUrl);
      }
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }

  return (
    <FeatureGate featureKey="youtube_analysis">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="relative flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL to analyze"
          className={`w-full h-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-accent-silver/50 
            border-2 ${isValid ? 'border-accent-silver/30 focus:border-accent-neon' : 'border-red-500'} 
            outline-none transition-colors`}
          aria-label="URL input"
        />
        <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-silver" />
      </div>
      {!isValid && (
        <p className="mt-2 text-xs text-red-500">
          Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)
        </p>
      )}
      <motion.button
        type="submit"
        className="mt-4 w-full px-4 py-2 bg-accent-neon text-black font-medium rounded-xl
          hover:bg-accent-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!url}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Analyze URL
      </motion.button>
      </form>
    </FeatureGate>
  )
} 