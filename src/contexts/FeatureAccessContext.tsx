'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getSubscription } from '@/services/subscription.service'

interface FeatureAccessContextType {
  userFeatures: string[]
  hasFeature: (featureKey: string) => boolean
  isLoading: boolean
  refreshFeatures: () => Promise<void>
  subscription: any | null
}

const FeatureAccessContext = createContext<FeatureAccessContextType | undefined>(undefined)

interface FeatureAccessProviderProps {
  children: React.ReactNode
}

export function FeatureAccessProvider({ children }: FeatureAccessProviderProps) {
  const { data: session, status } = useSession()
  const [userFeatures, setUserFeatures] = useState<string[]>([])
  const [subscription, setSubscription] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const hasFeature = (featureKey: string): boolean => {
    return userFeatures.includes(featureKey)
  }

  const refreshFeatures = async () => {
    if (status !== 'authenticated' || !session) {
      setUserFeatures([])
      setSubscription(null)
      setIsLoading(false)
      return
    }

    // Check if this is an admin session - skip user API calls for admins
    const isAdminSession = session.user?.email?.includes('@admin') || 
                          (session as any)?.user?.role === 'admin' ||
                          window.location.pathname.startsWith('/admin')
    
    if (isAdminSession) {
      console.log('Admin session detected, skipping user feature loading')
      setUserFeatures([])
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const subscriptionData = await getSubscription()
      setSubscription(subscriptionData)
      
      // Extract features from subscription plan details
      const features = subscriptionData.planDetails?.selectedFeatures || []
      setUserFeatures(features)
      
      console.log('User features loaded:', features)
    } catch (error) {
      console.error('Error fetching user features:', error)
      // Fallback to empty features for unauthenticated users
      setUserFeatures([])
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshFeatures()
  }, [status, session?.user?.accessToken]) // Only depend on status and accessToken, not entire session

  const value: FeatureAccessContextType = {
    userFeatures,
    hasFeature,
    isLoading,
    refreshFeatures,
    subscription
  }

  return (
    <FeatureAccessContext.Provider value={value}>
      {children}
    </FeatureAccessContext.Provider>
  )
}

export function useFeatureAccess(): FeatureAccessContextType {
  const context = useContext(FeatureAccessContext)
  if (context === undefined) {
    throw new Error('useFeatureAccess must be used within a FeatureAccessProvider')
  }
  return context
}

// Convenience hook for checking specific features
export function useHasFeature(featureKey: string): boolean {
  const { hasFeature } = useFeatureAccess()
  return hasFeature(featureKey)
}

// Hook for feature-gated components
export function useFeatureGate(featureKey: string) {
  const { hasFeature, isLoading, subscription } = useFeatureAccess()
  
  return {
    hasAccess: hasFeature(featureKey),
    isLoading,
    subscription,
    requiresUpgrade: !hasFeature(featureKey) && !isLoading
  }
}
