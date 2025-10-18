'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { usePageData } from '@/hooks/usePageData'

// Function to parse markdown content into structured sections
const parseContentSections = (content: string) => {
  const sections: { [key: string]: string } = {}
  
  // Split content by ## headers
  const parts = content.split(/^## /gm).filter(part => part.trim())
  
  parts.forEach(part => {
    const lines = part.trim().split('\n')
    const title = lines[0]
    const content = lines.slice(1).join('\n').trim()
    
    if (title && content) {
      sections[title.toLowerCase().replace(/[^a-z0-9]/g, '')] = content
    }
  })
  
  return sections
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface ContactPageData {
  _id: string
  title: string
  slug: string
  content: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  contactInfo?: {
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    businessHours: {
      [key: string]: string
    }
    socialMedia?: {
      twitter?: string
      facebook?: string
      linkedin?: string
      instagram?: string
    }
  }
}

export default function ContactPageClient() {
  const { pageData, loading, error } = usePageData('contact') as { pageData: ContactPageData | null, loading: boolean, error: string | null }
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Client-side validation
  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.firstName.trim()) {
      errors.push('First name is required')
    } else if (formData.firstName.trim().length > 100) {
      errors.push('First name must be less than 100 characters')
    }
    
    if (!formData.lastName.trim()) {
      errors.push('Last name is required')
    } else if (formData.lastName.trim().length > 100) {
      errors.push('Last name must be less than 100 characters')
    }
    
    if (!formData.email.trim()) {
      errors.push('Email is required')
    } else if (!formData.email.includes('@')) {
      errors.push('Please enter a valid email address')
    }
    
    if (formData.phone && formData.phone.trim().length > 20) {
      errors.push('Phone number must be less than 20 characters')
    }
    
    if (!formData.message.trim()) {
      errors.push('Message is required')
    } else if (formData.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long')
    } else if (formData.message.trim().length > 5000) {
      errors.push('Message must be less than 5000 characters')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Client-side validation
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setSubmitError(validationErrors.join('. '))
      return
    }

    setSubmitting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: '',
        })
      } else {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          setSubmitError(data.errors.join('. '))
        } else {
          setSubmitError(data.message || 'Failed to submit form. Please try again.')
        }
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitError('Failed to submit form. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    
    // Clear error when user starts typing
    if (submitError) {
      setSubmitError(null)
    }
  }

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
          <h1 className="text-2xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-accent-silver">Unable to load contact information.</p>
        </div>
      </div>
    )
  }

  const contentSections = parseContentSections(pageData.content)

  return (
    <div className="min-h-screen bg-accent-obsidian">
      {/* Hero Section */}
      <div className="relative py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div variants={fadeIn} className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-accent-neon/10 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-accent-neon" />
              </div>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-6xl"
            >
              {pageData.title}
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="mt-6 text-lg leading-8 text-accent-silver"
            >
              {pageData.content || "Get in touch with our support team and find answers to your questions."}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 px-6 lg:px-8 pb-24">
          
          {/* Contact Information */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              <p className="text-accent-silver leading-relaxed mb-8">
                {contentSections['getintouch'] || "Whether you're a student looking for help with your studies, an educator interested in our platform, or a business looking to partner with us, we'd love to hear from you."}
              </p>
            </motion.div>

            {/* Contact Details */}
            <motion.div variants={fadeIn} className="space-y-6">
              {pageData.contactInfo?.address && (
                <div className="flex gap-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-accent-neon/10 flex items-center justify-center">
                      <BuildingOffice2Icon className="h-5 w-5 text-accent-neon" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Address</h3>
                    <p className="text-accent-silver">
                      {pageData.contactInfo.address.street}<br />
                      {pageData.contactInfo.address.city}, {pageData.contactInfo.address.state} {pageData.contactInfo.address.zipCode}<br />
                      {pageData.contactInfo.address.country}
                    </p>
                  </div>
                </div>
              )}

              {pageData.contactInfo?.email && (
                <div className="flex gap-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-accent-neon/10 flex items-center justify-center">
                      <EnvelopeIcon className="h-5 w-5 text-accent-neon" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <Link 
                      href={`mailto:${pageData.contactInfo.email}`}
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      {pageData.contactInfo.email}
                    </Link>
                  </div>
                </div>
              )}

              {pageData.contactInfo?.phone && (
                <div className="flex gap-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-accent-neon/10 flex items-center justify-center">
                      <PhoneIcon className="h-5 w-5 text-accent-neon" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <Link 
                      href={`tel:${pageData.contactInfo.phone}`}
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      {pageData.contactInfo.phone}
                    </Link>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {pageData.contactInfo?.businessHours && (
                <div className="flex gap-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-accent-neon/10 flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-accent-neon" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-3">Business Hours</h3>
                    <div className="space-y-1">
                      {Object.entries(pageData.contactInfo.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-accent-silver capitalize">{day}:</span>
                          <span className="text-white">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Links */}
              {pageData.contactInfo?.socialMedia && (
                <div className="flex gap-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-accent-neon/10 flex items-center justify-center">
                      <QuestionMarkCircleIcon className="h-5 w-5 text-accent-neon" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                      {pageData.contactInfo.socialMedia.twitter && (
                        <Link 
                          href={pageData.contactInfo.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-silver hover:text-accent-neon transition-colors"
                        >
                          Twitter
                        </Link>
                      )}
                      {pageData.contactInfo.socialMedia.facebook && (
                        <Link 
                          href={pageData.contactInfo.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-silver hover:text-accent-neon transition-colors"
                        >
                          Facebook
                        </Link>
                      )}
                      {pageData.contactInfo.socialMedia.linkedin && (
                        <Link 
                          href={pageData.contactInfo.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-silver hover:text-accent-neon transition-colors"
                        >
                          LinkedIn
                        </Link>
                      )}
                      {pageData.contactInfo.socialMedia.instagram && (
                        <Link 
                          href={pageData.contactInfo.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-silver hover:text-accent-neon transition-colors"
                        >
                          Instagram
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="bg-glass backdrop-blur-sm rounded-2xl p-8 ring-1 ring-accent-silver/10"
          >
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
              
              {submitError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-red-400 text-sm font-medium">Please fix the following errors:</p>
                      <p className="text-red-300 text-sm mt-1">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {submitted ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-accent-silver">Thank you for your message. We'll get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-accent-neon hover:text-accent-neon/80 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                        First name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-transparent transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-transparent transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-transparent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-transparent transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="w-full bg-accent-neon hover:bg-accent-neon/90 disabled:bg-accent-neon/50 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
