'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  UserGroupIcon, 
  RocketLaunchIcon, 
  LightBulbIcon,
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

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
  sections?: Array<{
    id: string
    title: string
    content: string
    image?: string
    order: number
    _id: string
  }>
  teamMembers?: Array<{
    id: string
    name: string
    role: string
    bio: string
    image?: string
    socialLinks?: {
      linkedin?: string
      twitter?: string
      github?: string
    }
  }>
  companyInfo?: {
    founded: string
    mission: string
    vision: string
    values: string[]
  }
}

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

// Function to extract stats from Our Impact section
const extractStatsFromContent = (content: string): Array<{id: number, name: string, value: string, icon: any}> => {
  const sections = parseContentSections(content)
  const impactContent = sections['ourimpact']
  
  if (!impactContent) return []
  
  const stats: Array<{id: number, name: string, value: string, icon: any}> = []
  
  // Extract bullet points with stats
  const bulletPoints = impactContent.match(/- ([^\n]+)/g) || []
  
  bulletPoints.forEach((bullet, index) => {
    const text = bullet.replace('- ', '')
    
    // Extract numbers and context
    const patterns = [
      { pattern: /(\d+[,\d]*\+?)\s*students?/i, name: 'Students helped', icon: UserGroupIcon },
      { pattern: /(\d+[,\d]*\+?)\s*universities?/i, name: 'Universities', icon: AcademicCapIcon },
      { pattern: /(\d+[,\d]*[MK]?\+?)\s*flashcards?/i, name: 'Flashcards created', icon: SparklesIcon },
      { pattern: /(\d+\.?\d*%)\s*success/i, name: 'Success rate', icon: RocketLaunchIcon }
    ]
    
    patterns.forEach((pattern, patternIndex) => {
      const match = text.match(pattern.pattern)
      if (match) {
        stats.push({
          id: stats.length + 1,
          name: pattern.name,
          value: match[1],
          icon: pattern.icon
        })
      }
    })
  })
  
  return stats
}

// Function to extract values from What Makes Us Different section
const extractValuesFromContent = (content: string): Array<{name: string, icon: any, description: string}> => {
  const sections = parseContentSections(content)
  const valuesContent = sections['whatmakesusdifferent']
  
  if (!valuesContent) return []
  
  const values: Array<{name: string, icon: any, description: string}> = []
  
  // Extract subsections (### headers)
  const subsections = valuesContent.split(/^### /gm).filter(section => section.trim())
  
  // Icon mapping
  const iconMap: { [key: string]: any } = {
    'science': AcademicCapIcon,
    'user': HeartIcon,
    'community': UserGroupIcon,
    'innovation': BeakerIcon,
    'excellence': SparklesIcon,
    'accessibility': GlobeAltIcon,
    'technology': RocketLaunchIcon,
    'learning': LightBulbIcon
  }
  
  subsections.forEach(section => {
    const lines = section.trim().split('\n')
    const name = lines[0]
    const description = lines.slice(1).join(' ').trim()
    
    if (name && description) {
      // Match icon based on keywords
      const nameKey = name.toLowerCase()
      let icon = BeakerIcon
      
      for (const [key, iconComponent] of Object.entries(iconMap)) {
        if (nameKey.includes(key)) {
          icon = iconComponent
          break
        }
      }
      
      values.push({ name, icon, description })
    }
  })
  
  return values
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
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

export default function AboutPage() {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages/about`)
        
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
  }, [])

  if (loading) {
    return (
      <div className="bg-accent-obsidian min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-neon"></div>
      </div>
    )
  }

  if (error || !pageData) {
    return (
      <div className="bg-accent-obsidian min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Page</h1>
          <p className="text-accent-silver mb-4">{error || 'Page not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-neon hover:bg-accent-neon/90 text-black font-medium px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-accent-obsidian">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 sm:pb-16 lg:flex lg:px-8 lg:py-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
          >
            <div className="flex items-center gap-x-3">
              <div className="h-10 w-10 rounded-full bg-accent-neon/10 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-accent-neon" />
              </div>
              <h2 className="text-base font-semibold leading-7 text-accent-neon">
                {pageData.sections?.find(s => s.id === 'hero')?.title || "Our Story"}
              </h2>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-6xl">
              {pageData.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              {pageData.sections?.find(s => s.id === 'hero')?.content || 
               parseContentSections(pageData.content)['ourstory'] || 
               pageData.companyInfo?.mission || 
               pageData.seo?.description || ""}
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/auth/register"
                className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
              >
                Join us
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
              >
                Contact us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-16 lg:max-w-none lg:flex-none xl:ml-32"
          >
            {pageData.sections?.find(s => s.id === 'hero')?.image && (
              <div className="max-w-xl flex-none sm:max-w-2xl lg:max-w-xl">
                <div className="relative">
                  <div className="absolute -inset-y-4 -inset-x-4 z-0 scale-95 bg-gradient-to-r from-accent-neon/10 to-accent-gold/10 opacity-20 blur-2xl transform-gpu rotate-3 rounded-2xl"></div>
                  <img
                    src={pageData.sections.find(s => s.id === 'hero')?.image}
                    alt="Hero section image"
                    width={600}
                    height={450}
                    className="relative z-10 w-full h-96 object-cover rounded-xl bg-glass shadow-premium ring-1 ring-accent-silver/10 backdrop-blur-sm animate-float"
                    style={{ animationDelay: '1s' }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Stats section - only show if we have stats */}
      {extractStatsFromContent(pageData.content).length > 0 && (
        <div className="relative py-12 sm:py-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
            <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4"
            >
              {extractStatsFromContent(pageData.content).map((stat) => (
              <motion.div 
                key={stat.id} 
                variants={fadeIn}
                className="mx-auto flex max-w-xs flex-col gap-y-4 group"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-accent-neon/10 flex items-center justify-center group-hover:bg-accent-neon/20 transition-colors duration-300">
                  <stat.icon className="h-8 w-8 text-accent-neon" />
                </div>
                <dt className="text-base leading-7 text-accent-silver">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-5xl">
                  {stat.value}
                </dd>
              </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Mission section */}
      <div className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 sm:pb-16 lg:flex lg:px-8 lg:py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
          >
            <div className="flex items-center gap-x-3">
              <div className="h-10 w-10 rounded-full bg-accent-neon/10 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-accent-neon" />
              </div>
              <h2 className="text-base font-semibold leading-7 text-accent-neon">
                Our Mission
              </h2>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-6xl">
              {pageData.sections?.find(s => s.id === 'mission')?.title || "Transforming education through AI"}
            </h1>
            <div className="mt-6 text-lg leading-8 text-accent-silver prose prose-invert max-w-none">
              {(() => {
                // Priority: structured sections > content sections > company info
                const missionSection = pageData.sections?.find(s => s.id === 'mission')
                const contentSections = parseContentSections(pageData.content)
                
                if (missionSection) {
                  return <p>{missionSection.content}</p>
                } else if (contentSections['ourmission']) {
                  return <p>{contentSections['ourmission']}</p>
                } else {
                  return (
                    <>
                      {pageData.companyInfo?.mission && <p>{pageData.companyInfo.mission}</p>}
                      {pageData.companyInfo?.vision && <p className="mt-6">{pageData.companyInfo.vision}</p>}
                    </>
                  )
                }
              })()}
            </div>
          </motion.div>
          
          {/* Right side mission image */}
          {pageData.sections?.find(s => s.id === 'mission')?.image && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-16 lg:max-w-none lg:flex-none xl:ml-32"
            >
              <div className="max-w-xl flex-none sm:max-w-2xl lg:max-w-xl">
                <div className="relative">
                  <div className="absolute -inset-y-4 -inset-x-4 z-0 scale-95 bg-gradient-to-r from-accent-gold/10 to-accent-neon/10 opacity-20 blur-2xl transform-gpu -rotate-3 rounded-2xl"></div>
                  <img
                    src={pageData.sections.find(s => s.id === 'mission')?.image}
                    alt="Mission section image"
                    width={600}
                    height={450}
                    className="relative z-10 w-full h-96 object-cover rounded-xl bg-glass shadow-premium ring-1 ring-accent-silver/10 backdrop-blur-sm animate-float"
                    style={{ animationDelay: '1.5s' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Values section - only show if we have values */}
      {(() => {
        const contentValues = extractValuesFromContent(pageData.content)
        const settingsValues = pageData.companyInfo?.values
        return (contentValues.length > 0 || (settingsValues && settingsValues.length > 0))
      })() && (
        <div className="relative isolate overflow-hidden">
          {/* Values Background Image */}
          {pageData.sections?.find(s => s.id === 'values')?.image && (
            <div className="absolute inset-0">
              <img
                src={pageData.sections.find(s => s.id === 'values')?.image}
                alt="Values background"
                className="w-full h-full object-cover opacity-10"
              />
              <div className="absolute inset-0 bg-accent-obsidian/80" />
            </div>
          )}
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl lg:mx-0"
            >
              <h2 className="text-base font-semibold leading-7 text-accent-neon">Our values</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
                What drives us
              </p>
              <p className="mt-6 text-lg leading-8 text-accent-silver">
                Our values shape everything we do, from how we build our product to how we interact with our users.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
            >
            {(() => {
              const contentValues = extractValuesFromContent(pageData.content)
              const settingsValues = pageData.companyInfo?.values
              
              // If we have content values, use them
              if (contentValues.length > 0) {
                return contentValues
              }
              
              // If we have settings values (object array with name, icon, description), use them
              if (settingsValues && settingsValues.length > 0) {
                // Icon mapping
                const iconMap: { [key: string]: any } = {
                  'science': AcademicCapIcon,
                  'user': HeartIcon,
                  'community': UserGroupIcon,
                  'innovation': BeakerIcon,
                  'excellence': SparklesIcon,
                  'accessibility': GlobeAltIcon,
                  'technology': RocketLaunchIcon,
                  'learning': LightBulbIcon
                }
                
                return settingsValues.map((value, index) => {
                  // Handle both old string format and new object format
                  if (typeof value === 'string') {
                    return {
                      name: `Value ${index + 1}`,
                      icon: BeakerIcon,
                      description: value
                    }
                  } else {
                    return {
                      name: value.name || `Value ${index + 1}`,
                      icon: iconMap[value.icon] || BeakerIcon,
                      description: value.description || ''
                    }
                  }
                })
              }
              
              // No values available
              return []
            })().map((valueData, index) => (
              <motion.div 
                key={valueData.name} 
                variants={fadeIn}
                className="relative group bg-glass backdrop-blur-sm rounded-xl p-8 ring-1 ring-accent-silver/10 transition-all duration-300 hover:ring-accent-neon/30 hover:shadow-lg hover:shadow-accent-neon/5"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-neon/10 group-hover:bg-accent-neon/20 transition-colors duration-300">
                  <valueData.icon className="h-6 w-6 text-accent-neon" aria-hidden="true" />
                </div>
                <dt className="font-semibold text-white">{valueData.name}</dt>
                <dd className="mt-4 text-accent-silver">{valueData.description}</dd>
              </motion.div>
            ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Team section - only show if we have team members */}
      {(pageData.teamMembers && pageData.teamMembers.length > 0) && (
        <div className="relative py-24 sm:py-32 bg-gradient-to-b from-accent-obsidian to-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-base font-semibold leading-7 text-accent-neon">Our team</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              Meet the minds behind AIFlash
            </p>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              We're a diverse team of educators, engineers, and designers passionate about transforming education.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {(pageData.teamMembers || []).map((person, index) => (
              <motion.div 
                key={person.name} 
                variants={fadeIn}
                className="relative group"
              >
                <div className="relative h-64 overflow-hidden rounded-xl bg-glass backdrop-blur-sm ring-1 ring-accent-silver/10 group-hover:ring-accent-neon/30 transition-all duration-300">
                  <img
                    src={person.image || '/authors/default-avatar.jpg'}
                    alt={person.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-obsidian via-transparent to-transparent"></div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                  <p className="text-sm text-accent-neon">{person.role}</p>
                  <p className="mt-2 text-sm text-accent-silver">{person.bio}</p>
                  
                  {/* Social Links */}
                  {person.socialLinks && Object.keys(person.socialLinks).length > 0 && (
                    <div className="mt-3 flex space-x-3">
                      {person.socialLinks.linkedin && (
                        <a 
                          href={person.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent-silver hover:text-accent-neon transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                      {person.socialLinks.twitter && (
                        <a 
                          href={person.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent-silver hover:text-accent-neon transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                          </svg>
                        </a>
                      )}
                      {person.socialLinks.github && (
                        <a 
                          href={person.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent-silver hover:text-accent-neon transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        </div>
      )}

      {/* Looking Forward section - only show if we have this content */}
      {(() => {
        const contentSections = parseContentSections(pageData.content)
        return contentSections['lookingforward']
      })() && (
        <div className="relative py-24 sm:py-32">
          {/* Future Section Background Image */}
          {pageData.sections?.find(s => s.id === 'future')?.image && (
            <div className="absolute inset-0">
              <img
                src={pageData.sections.find(s => s.id === 'future')?.image}
                alt="Future section background"
                className="w-full h-full object-cover opacity-15"
              />
              <div className="absolute inset-0 bg-accent-obsidian/70" />
            </div>
          )}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-accent-neon/10 flex items-center justify-center">
                  <RocketLaunchIcon className="h-6 w-6 text-accent-neon" />
                </div>
              </div>
              <h2 className="text-base font-semibold leading-7 text-accent-neon">The Future</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
                Looking Forward
              </p>
              <div className="mt-6 text-lg leading-8 text-accent-silver prose prose-invert max-w-none">
                <p>{parseContentSections(pageData.content)['lookingforward']}</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* CTA section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-accent-neon/10 flex items-center justify-center mb-8">
            <RocketLaunchIcon className="h-8 w-8 text-accent-neon" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            Join us in revolutionizing education
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-accent-silver">
            Be part of the future of learning. Start your journey with AIFlash today and experience the
            difference intelligent flashcards can make.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
            >
              Get started
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 