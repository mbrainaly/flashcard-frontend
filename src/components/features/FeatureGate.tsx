'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LockClosedIcon, StarIcon } from '@heroicons/react/24/outline'
import { useFeatureGate } from '@/contexts/FeatureAccessContext'
import Link from 'next/link'

interface FeatureGateProps {
  featureKey: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

export default function FeatureGate({ 
  featureKey, 
  children, 
  fallback, 
  showUpgradePrompt = true,
  className = ''
}: FeatureGateProps) {
  const { hasAccess, isLoading, requiresUpgrade } = useFeatureGate(featureKey)

  // Show loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-accent-silver/10 rounded-lg h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // User has access - show the feature
  if (hasAccess) {
    return <>{children}</>
  }

  // User doesn't have access - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>
  }

  // Default upgrade prompt
  if (showUpgradePrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative bg-gradient-to-br from-accent-silver/5 to-accent-silver/10 rounded-xl border border-accent-silver/20 p-6 text-center ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-neon/5 to-transparent rounded-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <LockClosedIcon className="w-8 h-8 text-accent-silver/60" />
              <StarIcon className="w-4 h-4 text-accent-neon absolute -top-1 -right-1" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            Premium Feature
          </h3>
          
          <p className="text-accent-silver/70 mb-4 text-sm">
            This feature requires a subscription plan that includes advanced capabilities.
          </p>
          
          <Link
            href="/billing"
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            <StarIcon className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Link>
        </div>
      </motion.div>
    )
  }

  // Don't render anything if no upgrade prompt
  return null
}

// Specialized component for inline feature gates (like buttons)
export function InlineFeatureGate({ 
  featureKey, 
  children, 
  className = '' 
}: Omit<FeatureGateProps, 'fallback' | 'showUpgradePrompt'>) {
  const { hasAccess, isLoading } = useFeatureGate(featureKey)

  if (isLoading) {
    return (
      <div className={`opacity-50 pointer-events-none ${className}`}>
        {children}
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <LockClosedIcon className="w-4 h-4 text-accent-silver/60" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for programmatic feature checking with user feedback
export function useFeatureCheck() {
  const { hasFeature, subscription } = useFeatureGate('')
  
  const checkFeature = (featureKey: string, showAlert = true) => {
    const hasAccess = hasFeature(featureKey)
    
    if (!hasAccess && showAlert) {
      // You could integrate with a toast system here
      console.warn(`Feature '${featureKey}' requires a subscription upgrade`)
    }
    
    return hasAccess
  }
  
  return {
    checkFeature,
    subscription
  }
}
