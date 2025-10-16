'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BoltIcon,
  SparklesIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ClockIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { usePageData } from '@/hooks/usePageData'

// Icon mapping
const iconMap: { [key: string]: any } = {
  'SparklesIcon': SparklesIcon,
  'BoltIcon': BoltIcon,
  'ChartBarIcon': ChartBarIcon,
  'DevicePhoneMobileIcon': DevicePhoneMobileIcon,
  'UserGroupIcon': UserGroupIcon,
  'ClockIcon': ClockIcon,
  'ScaleIcon': ScaleIcon,
  'ChatBubbleLeftRightIcon': ChatBubbleLeftRightIcon,
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

interface Feature {
  id: string
  title: string
  description: string
  icon: string
  category: string
  isPremium: boolean
  order: number
  _id: string
}

interface FeaturesPageData {
  _id: string
  title: string
  slug: string
  content: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  features: Feature[]
}

export default function FeaturesPage() {
  const { pageData, loading, error } = usePageData('features') as { pageData: FeaturesPageData | null, loading: boolean, error: string | null }

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
          <h1 className="text-2xl font-bold text-white mb-4">Features</h1>
          <p className="text-accent-silver">Unable to load features content.</p>
        </div>
      </div>
    )
  }

  const contentSections = parseContentSections(pageData.content)
  const coreFeatures = pageData.features?.filter(f => f.category === 'Core').sort((a, b) => a.order - b.order) || []
  const advancedFeatures = pageData.features?.filter(f => f.category === 'Advanced').sort((a, b) => a.order - b.order) || []

  return (
    <div className="min-h-screen bg-accent-obsidian">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-2xl text-center"
          >
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
              {pageData.seo?.description || contentSections['featuresthatmakelearningeasier'] || "Discover how AIFlash combines artificial intelligence with proven learning techniques."}
            </motion.p>
            <motion.div 
              variants={fadeIn}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link
                href="/auth/register"
                className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
              >
                Get started
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
              >
                View pricing <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Core Features section */}
      {coreFeatures.length > 0 && (
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2 variants={fadeIn} className="text-base font-semibold leading-7 text-accent-neon">
              Everything you need
            </motion.h2>
            <motion.p variants={fadeIn} className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              Core Features
            </motion.p>
            <motion.p variants={fadeIn} className="mt-6 text-lg leading-8 text-accent-silver">
              {contentSections['corefeatures'] || "Our core features are designed to make your learning experience more efficient and effective."}
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto mt-16 max-w-7xl sm:mt-20"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
              {coreFeatures.map((feature, index) => {
                const IconComponent = iconMap[feature.icon] || SparklesIcon
                return (
                  <motion.div 
                    key={feature.id}
                    variants={fadeIn}
                    className="group relative bg-glass backdrop-blur-sm rounded-xl p-6 sm:p-8 ring-1 ring-accent-silver/10 transition-all duration-300 hover:ring-accent-neon/30"
                  >
                    <div className="text-base font-semibold leading-7 text-white">
                      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-neon group-hover:shadow-neon transition-all duration-300">
                        <IconComponent className="h-6 w-6 text-accent-obsidian" aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-2">
                        {feature.title}
                        {!feature.isPremium && (
                          <CheckIcon className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                    </div>
                    <div className="mt-1 flex flex-auto flex-col text-base leading-7 text-accent-silver">
                      <p className="flex-auto">{feature.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Advanced Features section */}
      {advancedFeatures.length > 0 && (
        <div className="w-full bg-[#111111] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mx-auto max-w-2xl text-center mb-12"
            >
              <motion.h2 variants={fadeIn} className="text-base font-semibold leading-7 text-accent-neon">
                Advanced capabilities
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
                Premium Features
              </motion.p>
              <motion.p variants={fadeIn} className="mt-6 text-lg leading-8 text-accent-silver">
                {contentSections['advancedfeatures'] || "Take your learning to the next level with our advanced features designed for serious learners."}
              </motion.p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
            >
              {advancedFeatures.map((feature, index) => {
                const IconComponent = iconMap[feature.icon] || UserGroupIcon
                return (
                  <motion.div 
                    key={feature.id}
                    variants={fadeIn}
                    className="bg-[#1a1a1a] rounded-xl p-6 ring-1 ring-accent-silver/10 hover:ring-accent-neon/30 transition-all duration-300"
                  >
                    <div className="mb-5 h-12 w-12 rounded-lg bg-[#222222] flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-accent-neon" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold leading-7 text-white mb-2 flex items-center gap-2">
                      {feature.title}
                      {feature.isPremium && (
                        <StarIcon className="h-4 w-4 text-accent-gold" />
                      )}
                    </h3>
                    <p className="text-sm leading-6 text-accent-silver mb-3">
                      {feature.description}
                    </p>
                    {feature.isPremium && (
                      <span className="inline-flex items-center rounded-full bg-accent-gold/10 px-2 py-1 text-xs font-medium text-accent-gold">
                        Premium
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      )}

      {/* CTA section */}
      <div className="relative isolate mt-16 px-6 py-32 sm:py-40 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            {contentSections['readytotransformyourlearning']?.split('\n')[0] || "Ready to transform your learning?"}
          </motion.h2>
          <motion.p variants={fadeIn} className="mx-auto mt-6 max-w-xl text-lg leading-8 text-accent-silver">
            {contentSections['readytotransformyourlearning']?.split('\n').slice(1).join(' ') || "Join thousands of students who are already using AIFlash to achieve their learning goals faster and more effectively."}
          </motion.p>
          <motion.div variants={fadeIn} className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
            >
              Start for free
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
            >
              Contact us <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}