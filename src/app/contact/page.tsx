import { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
    const response = await fetch(`${apiUrl}/api/pages/contact`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        return {
          title: data.data.seo?.title || data.data.title || 'Contact Us',
          description: data.data.seo?.description || 'Get in touch with our support team and find answers to your questions.',
          keywords: data.data.seo?.keywords || []
        }
      }
    }
  } catch (error) {
    console.error('Error generating contact metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Contact Us',
    description: 'Get in touch with our support team and find answers to your questions.'
  }
}

export default function ContactPage() {
  return <ContactPageClient />
}