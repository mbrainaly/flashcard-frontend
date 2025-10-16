import { useState, useEffect } from 'react'

interface PageData {
  _id: string
  title: string
  slug: string
  content: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  [key: string]: any // Allow additional fields for different page types
}

export const usePageData = (slug: string) => {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages/${slug}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch page data')
        }

        const data = await response.json()
        
        if (data.success) {
          setPageData(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch page data')
        }
      } catch (error) {
        console.error('Error fetching page data:', error)
        setError('Failed to load page content')
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [slug])

  return { pageData, loading, error }
}
