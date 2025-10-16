'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePageData } from '@/hooks/usePageData'

export default function TermsPage() {
  const { pageData, loading, error } = usePageData('terms')

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-obsidian flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
      </div>
    )
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-accent-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-accent-silver">Unable to load terms of service content.</p>
        </div>
      </div>
    )
  }

  // Process content to convert markdown to HTML while preserving exact formatting
  const processContent = (content: string) => {
    // Split content into lines for processing
    const lines = content.split('\n')
    const processedLines: string[] = []
    let inList = false
    let listItems: string[] = []
    
    const flushList = () => {
      if (listItems.length > 0) {
        processedLines.push('<ul class="list-disc list-inside space-y-2 mb-6 ml-4">')
        listItems.forEach(item => {
          processedLines.push(`  <li class="text-accent-silver">${item}</li>`)
        })
        processedLines.push('</ul>')
        listItems = []
      }
      inList = false
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('# ')) {
        flushList()
        processedLines.push(`<h1 class="text-4xl font-bold text-white mb-8">${line.substring(2)}</h1>`)
      } else if (line.startsWith('## ')) {
        flushList()
        processedLines.push(`<h2 class="text-2xl font-bold text-white mt-12 mb-6">${line.substring(3)}</h2>`)
      } else if (line.startsWith('### ')) {
        flushList()
        processedLines.push(`<h3 class="text-xl font-semibold text-white mt-8 mb-4">${line.substring(4)}</h3>`)
      } else if (line.startsWith('- ')) {
        if (!inList) {
          inList = true
        }
        let listItem = line.substring(2)
        // Handle bold text
        listItem = listItem.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        // Handle italic text
        listItem = listItem.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        listItems.push(listItem)
      } else if (line.trim() === '') {
        flushList()
        if (processedLines.length > 0 && !processedLines[processedLines.length - 1].includes('<br>')) {
          processedLines.push('<br>')
        }
      } else {
        flushList()
        let processedLine = line
        // Handle bold text
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        // Handle italic text
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // Handle email links
        processedLine = processedLine.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="text-accent-gold hover:text-accent-neon transition-colors">$1</a>')
        
        processedLines.push(`<p class="text-accent-silver leading-relaxed mb-4">${processedLine}</p>`)
      }
    }
    
    // Flush any remaining list
    flushList()
    
    return processedLines.join('\n')
  }

  return (
    <div className="min-h-screen bg-accent-obsidian">
      <div className="max-w-4xl mx-auto px-6 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div 
            dangerouslySetInnerHTML={{ 
              __html: processContent(pageData.content) 
            }}
            className="space-y-6"
          />
        </motion.div>
      </div>
    </div>
  )
}