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

export default function ContactPage() {
  const { pageData, loading, error } = usePageData('contact') as { pageData: ContactPageData | null, loading: boolean, error: string | null }
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
              {pageData.seo?.description || contentSections['contactaiflash'] || "Get in touch with our support team and find answers to your questions."}
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

              {pageData.contactInfo?.phone && (
                <div className="flex gap-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-accent-neon/10 flex items-center justify-center">
                      <PhoneIcon className="h-5 w-5 text-accent-neon" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <a 
                      href={`tel:${pageData.contactInfo.phone}`}
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      {pageData.contactInfo.phone}
                    </a>
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
                    <a 
                      href={`mailto:${pageData.contactInfo.email}`}
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      {pageData.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Business Hours */}
            {pageData.contactInfo?.businessHours && (
              <motion.div variants={fadeIn} className="bg-accent-silver/5 rounded-xl p-6 border border-accent-silver/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                    <ClockIcon className="h-4 w-4 text-accent-gold" />
                  </div>
                  <h3 className="text-white font-semibold">Business Hours</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(pageData.contactInfo.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-accent-silver">{day}</span>
                      <span className="text-white">{hours}</span>
                    </div>
                  ))}
                </div>
                <p className="text-accent-silver/70 text-sm mt-4">
                  {contentSections['supporthours'] || "Our support team is available during business hours to help you with any questions or issues you may have."}
                </p>
              </motion.div>
            )}

            {/* Social Media */}
            {pageData.contactInfo?.socialMedia && Object.keys(pageData.contactInfo.socialMedia).length > 0 && (
              <motion.div variants={fadeIn}>
                <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {pageData.contactInfo.socialMedia.twitter && (
                    <a 
                      href={pageData.contactInfo.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                      </svg>
                    </a>
                  )}
                  {pageData.contactInfo.socialMedia.facebook && (
                    <a 
                      href={pageData.contactInfo.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                      </svg>
                    </a>
                  )}
                  {pageData.contactInfo.socialMedia.linkedin && (
                    <a 
                      href={pageData.contactInfo.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  {pageData.contactInfo.socialMedia.instagram && (
                    <a 
                      href={pageData.contactInfo.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-silver hover:text-accent-neon transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875zm-4.262 1.018c-1.297 0-2.345 1.048-2.345 2.345s1.048 2.345 2.345 2.345 2.345-1.048 2.345-2.345-1.048-2.345-2.345-2.345z" clipRule="evenodd"/>
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="bg-accent-silver/5 rounded-xl p-8 border border-accent-silver/10"
          >
            <motion.div variants={fadeIn} className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Send us a message</h2>
              <p className="text-accent-silver">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </motion.div>

            <motion.form variants={fadeIn} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold leading-6 text-white mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-0 bg-accent-silver/5 px-4 py-3 text-white placeholder-accent-silver/50 ring-1 ring-inset ring-accent-silver/20 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm transition-all duration-300"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold leading-6 text-white mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-0 bg-accent-silver/5 px-4 py-3 text-white placeholder-accent-silver/50 ring-1 ring-inset ring-accent-silver/20 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm transition-all duration-300"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-lg border-0 bg-accent-silver/5 px-4 py-3 text-white placeholder-accent-silver/50 ring-1 ring-inset ring-accent-silver/20 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm transition-all duration-300"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-white mb-2">
                  Phone number <span className="text-accent-silver/60">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-0 bg-accent-silver/5 px-4 py-3 text-white placeholder-accent-silver/50 ring-1 ring-inset ring-accent-silver/20 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm transition-all duration-300"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-white mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-lg border-0 bg-accent-silver/5 px-4 py-3 text-white placeholder-accent-silver/50 ring-1 ring-inset ring-accent-silver/20 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm transition-all duration-300 resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg bg-accent-neon px-6 py-3 text-sm font-semibold text-accent-obsidian shadow-lg hover:bg-accent-neon/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-neon transition-all duration-300"
                >
                  Send message
                </motion.button>
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-green-500/10 p-4 border border-green-500/20"
                >
                  <p className="text-sm text-green-400 text-center">
                    Thank you for your message! We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              )}
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}