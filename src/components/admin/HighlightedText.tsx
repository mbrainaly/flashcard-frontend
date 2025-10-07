'use client'

import React from 'react'

interface HighlightedTextProps {
  text: string
  searchTerm: string
  className?: string
}

export default function HighlightedText({ text, searchTerm, className = "" }: HighlightedTextProps) {
  if (!searchTerm.trim() || !text) {
    return <span className={className}>{text}</span>
  }
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = String(text).split(regex)
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="bg-yellow-200 dark:bg-yellow-600/30 text-yellow-900 dark:text-yellow-200 px-1 rounded">
            {part}
          </span>
        ) : part
      )}
    </span>
  )
}
