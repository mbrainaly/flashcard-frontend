import { useState, useEffect } from 'react'

interface FooterLink {
  id: string
  title: string
  url: string
  order: number
}

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  order: number
}

interface FooterData {
  _id: string
  links: FooterLink[]
  socialLinks: SocialLink[]
  bottomText: string
}

export const useFooterData = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const response = await fetch(`${apiUrl}/api/footer`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          setFooterData(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch footer data')
        }
      } catch (error) {
        console.error('Error fetching footer data:', error)
        setError('Failed to load footer data')
        // Set fallback data
        setFooterData({
          _id: 'fallback',
          links: [
            { id: 'about', title: 'About Us', url: '/about', order: 0 },
            { id: 'features', title: 'Features', url: '/features', order: 1 },
            { id: 'pricing', title: 'Pricing', url: '/pricing', order: 2 },
            { id: 'contact', title: 'Contact Us', url: '/contact', order: 3 },
            { id: 'blog', title: 'Blog', url: '/blog', order: 4 }
          ],
          socialLinks: [],
          bottomText: `© ${new Date().getFullYear()} FlashCard App. All rights reserved.`
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  return { footerData, loading, error }
}
