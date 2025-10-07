'use client'

import { useState, useEffect, useMemo } from 'react'

interface UseSmartSearchOptions<T> {
  data: T[]
  searchFields: (keyof T | string)[] // Support nested fields like 'user.name'
  filters?: Record<string, any>
  itemsPerPage?: number
}

interface UseSmartSearchResult<T> {
  // Search state
  searchTerm: string
  setSearchTerm: (term: string) => void
  
  // Filtered data
  filteredData: T[]
  paginatedData: T[]
  
  // Pagination
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  itemsPerPage: number
  setItemsPerPage: (items: number) => void
  
  // Stats
  totalItems: number
  filteredCount: number
  
  // Utility functions
  getHighlightData: (text: string) => {
    parts: { text: string; isHighlight: boolean; key: number }[]
    hasHighlight: boolean
  }
  resetSearch: () => void
}

// Helper function to get nested property value
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : ''
  }, obj) || ''
}

export function useSmartSearch<T>({
  data,
  searchFields,
  filters = {},
  itemsPerPage: initialItemsPerPage = 10
}: UseSmartSearchOptions<T>): UseSmartSearchResult<T> {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  // Filter data based on search term and additional filters
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(item => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field as string)
          return String(value).toLowerCase().includes(searchLower)
        })
      })
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        filtered = filtered.filter(item => {
          const itemValue = getNestedValue(item, key)
          if (Array.isArray(value)) {
            return value.includes(itemValue)
          }
          return itemValue === value
        })
      }
    })

    return filtered
  }, [data, searchTerm, searchFields, filters])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, itemsPerPage])

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const totalItems = data.length
  const filteredCount = filteredData.length

  // Reset to first page when search or filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [filteredData.length, itemsPerPage, currentPage, totalPages])

  // Create highlight data for search terms
  const getHighlightData = (text: string) => {
    if (!searchTerm.trim() || !text) return { parts: [text], hasHighlight: false }
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = String(text).split(regex)
    const hasHighlight = parts.some(part => regex.test(part))
    
    return {
      parts: parts.map((part, index) => ({
        text: part,
        isHighlight: regex.test(part),
        key: index
      })),
      hasHighlight
    }
  }

  // Reset search and pagination
  const resetSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    
    // Filtered data
    filteredData,
    paginatedData,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    
    // Stats
    totalItems,
    filteredCount,
    
    // Utility functions
    getHighlightData,
    resetSearch
  }
}
