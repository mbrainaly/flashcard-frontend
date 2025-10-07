'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  UsersIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { showToast } from '@/components/ui/Toast'
import Link from 'next/link'
import { FeatureDefinition, FeatureCategory, getFeaturesByCategory } from '@/config/features'

interface SubscriptionPlan {
  _id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  limits: {
    decks: number | 'unlimited'
    cards: number | 'unlimited'
    storage: string
    support: string
  }
  selectedFeatures?: string[]
  isActive: boolean
  isPopular: boolean
  stripePriceId?: string
  subscriberCount: number
  createdAt: string
  updatedAt: string
}

interface PlanFormData {
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: {
    maxDecks: number
    maxCards: number
    maxAiGenerations: number
    maxStorage: number // in MB
  }
  limits: {
    dailyAiGenerations: number
    monthlyAiGenerations: number
    concurrentSessions: number
    fileUploadSize: number // in MB
  }
  trial: {
    enabled: boolean
    durationDays: number
  }
  selectedFeatures: string[]
  isActive: boolean
  isPopular: boolean
}

export default function PlanManagementPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [availableFeatures, setAvailableFeatures] = useState<FeatureDefinition[]>([])
  const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>([])
  const [featuresLoading, setFeaturesLoading] = useState(true)
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: {
      monthly: 0,
      yearly: 0
    },
    features: {
      maxDecks: 10,
      maxCards: 100,
      maxAiGenerations: 50,
      maxStorage: 1024 // 1GB in MB
    },
    limits: {
      dailyAiGenerations: 5,
      monthlyAiGenerations: 50,
      concurrentSessions: 1,
      fileUploadSize: 5 // 5MB
    },
    trial: {
      enabled: false,
      durationDays: 7
    },
    selectedFeatures: [],
    isActive: true,
    isPopular: false
  })

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await adminApi.get('/api/admin/plans')
      
      if (response.success) {
        setPlans(response.data || [])
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to fetch subscription plans'
        })
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch subscription plans'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch available features from API
  const fetchAvailableFeatures = async () => {
    try {
      setFeaturesLoading(true)
      const response = await adminApi.get('/api/admin/features')
      
      if (response.success) {
        setAvailableFeatures(response.data.features || [])
        setFeatureCategories(response.data.categories || [])
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to fetch available features'
        })
      }
    } catch (error) {
      console.error('Error fetching features:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch available features'
      })
    } finally {
      setFeaturesLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchAvailableFeatures()
  }, [])

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      if (editingPlan) {
        // Update existing plan
        const response = await adminApi.put(`/api/admin/plans/${editingPlan._id}`, formData)
        
        if (response.success) {
          showToast({
            type: 'success',
            title: 'Success',
            message: 'Plan updated successfully'
          })
          fetchPlans() // Refresh the list
          setShowModal(false)
        } else {
          showToast({
            type: 'error',
            title: 'Error',
            message: response.error || 'Failed to update plan'
          })
        }
      } else {
        // Create new plan
        const response = await adminApi.post('/api/admin/plans', formData)
        
        if (response.success) {
          showToast({
            type: 'success',
            title: 'Success',
            message: 'Plan created successfully'
          })
          fetchPlans() // Refresh the list
          setShowModal(false)
        } else {
          showToast({
            type: 'error',
            title: 'Error',
            message: response.error || 'Failed to create plan'
          })
        }
      }
    } catch (error) {
      console.error('Error submitting plan:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save plan'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle plan deletion
  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return
    }

    try {
      const response = await adminApi.delete(`/api/admin/plans/${planId}`)
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Plan deleted successfully'
        })
        fetchPlans() // Refresh the list
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to delete plan'
        })
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete plan'
      })
    }
  }

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: {
        maxDecks: 10,
        maxCards: 100,
        maxAiGenerations: 50,
        maxStorage: 1024 // 1GB in MB
      },
      limits: {
        dailyAiGenerations: 5,
        monthlyAiGenerations: 50,
        concurrentSessions: 1,
        fileUploadSize: 5 // 5MB
      },
      trial: {
        enabled: false,
        durationDays: 7
      },
      isActive: true,
      isPopular: false
    })
    setShowModal(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    // Transform backend data to frontend form structure
    setFormData({
      name: plan.name,
      description: plan.description,
      price: {
        monthly: typeof plan.price === 'number' ? plan.price : 0,
        yearly: typeof plan.price === 'number' ? plan.price * 12 : 0
      },
      features: {
        maxDecks: plan.limits?.decks === 'unlimited' ? 999999 : (typeof plan.limits?.decks === 'number' ? plan.limits.decks : 10),
        maxCards: plan.limits?.cards === 'unlimited' ? 999999 : (typeof plan.limits?.cards === 'number' ? plan.limits.cards : 100),
        maxAiGenerations: 50, // Default value
        maxStorage: parseStorageToMB(plan.limits?.storage || '1GB')
      },
      limits: {
        dailyAiGenerations: 5, // Default value
        monthlyAiGenerations: 50, // Default value
        concurrentSessions: 1, // Default value
        fileUploadSize: 5 // Default value
      },
      trial: {
        enabled: false, // Default value
        durationDays: 7 // Default value
      },
      selectedFeatures: plan.selectedFeatures || [],
      isActive: plan.isActive,
      isPopular: plan.isPopular
    })
    setShowModal(true)
  }

  // Helper function to parse storage strings to MB
  const parseStorageToMB = (storage: string): number => {
    const match = storage.match(/^(\d+(?:\.\d+)?)(GB|MB)$/i)
    if (!match) return 1024 // Default to 1GB
    
    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    
    return unit === 'GB' ? value * 1024 : value
  }


  if (!hasPermission('subscriptions.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-accent-silver">You don't have permission to view subscription plans.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/dashboard/subscriptions"
            className="text-accent-silver hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
            <p className="text-accent-silver/70">Manage subscription plans and pricing</p>
          </div>
        </div>
        {hasPermission('subscriptions.write') && (
          <button
            onClick={handleCreatePlan}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Plan
          </button>
        )}
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-accent-obsidian rounded-xl p-6 border border-gray-200 dark:border-accent-silver/10 animate-pulse">
              <div className="h-6 bg-accent-silver/20 rounded mb-4"></div>
              <div className="h-4 bg-accent-silver/20 rounded mb-6"></div>
              <div className="space-y-2 mb-6">
                <div className="h-3 bg-accent-silver/20 rounded"></div>
                <div className="h-3 bg-accent-silver/20 rounded"></div>
                <div className="h-3 bg-accent-silver/20 rounded"></div>
              </div>
              <div className="h-10 bg-accent-silver/20 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-accent-obsidian rounded-xl p-6 border transition-all hover:shadow-lg ${
                plan.isPopular
                  ? 'border-accent-neon shadow-lg ring-2 ring-accent-neon/20'
                  : 'border-gray-200 dark:border-accent-silver/10'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent-neon text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-center space-x-1">
                    {plan.isActive ? (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    ) : (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-accent-silver/70 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                    <span className="text-gray-600 dark:text-accent-silver/70 ml-1">/{plan.interval}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-accent-silver/70">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-sm text-gray-500 dark:text-accent-silver/50">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 dark:bg-accent-silver/5 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white">{plan.subscriberCount}</div>
                    <div className="text-gray-600 dark:text-accent-silver/70">Subscribers</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-accent-silver/5 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {typeof plan.limits.decks === 'number' ? plan.limits.decks : '∞'}
                    </div>
                    <div className="text-gray-600 dark:text-accent-silver/70">Decks</div>
                  </div>
                </div>
              </div>

              {hasPermission('subscriptions.write') && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-accent-silver/20">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 text-sm font-medium"
                  >
                    <PencilIcon className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <div className="w-px h-4 bg-gray-200 dark:bg-accent-silver/20 mx-3"></div>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="flex-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
                  >
                    <TrashIcon className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-accent-silver mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                      placeholder="e.g., Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent-silver mb-2">
                      Monthly Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-silver">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price.monthly}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          price: { ...prev.price, monthly: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full pl-8 pr-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="19.99"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-accent-silver mb-2">
                      Yearly Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-silver">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price.yearly}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          price: { ...prev.price, yearly: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full pl-8 pr-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="199.99"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 pt-7">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-accent-silver">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="rounded border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-accent-silver">Popular</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                    placeholder="Brief description of the plan..."
                  />
                </div>

                {/* Plan Limits */}
                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-3">
                    Plan Limits
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Max Decks</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.features.maxDecks}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, maxDecks: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="10 (999999 for unlimited)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Max Cards</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.features.maxCards}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, maxCards: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="100 (999999 for unlimited)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Max AI Generations</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.features.maxAiGenerations}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, maxAiGenerations: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="50 (999999 for unlimited)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Storage (MB)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.features.maxStorage}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, maxStorage: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="1024 (1GB = 1024MB)"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Generation Limits */}
                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-3">
                    AI Generation Limits
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Daily AI Generations</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.limits.dailyAiGenerations}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, dailyAiGenerations: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Monthly AI Generations</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.limits.monthlyAiGenerations}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, monthlyAiGenerations: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Concurrent Sessions</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.limits.concurrentSessions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, concurrentSessions: parseInt(e.target.value) || 1 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">File Upload Size (MB)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.limits.fileUploadSize}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, fileUploadSize: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>


                {/* Trial Settings */}
                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-3">
                    Trial Settings
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.trial.enabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          trial: { ...prev.trial, enabled: e.target.checked }
                        }))}
                        className="rounded border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-accent-silver">Enable Trial</span>
                    </label>
                    <div>
                      <label className="block text-xs text-accent-silver/70 mb-1">Trial Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.trial.durationDays}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          trial: { ...prev.trial, durationDays: parseInt(e.target.value) || 7 }
                        }))}
                        className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="7"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Selection */}
                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-3">
                    Plan Features
                  </label>
                  <div className="space-y-4">
                    {featuresLoading ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-8 bg-accent-silver/10 rounded"></div>
                        ))}
                      </div>
                    ) : (
                      featureCategories.map(category => {
                        const categoryFeatures = getFeaturesByCategory(availableFeatures, category.key)
                        if (categoryFeatures.length === 0) return null
                        
                        return (
                          <div key={category.key} className="bg-accent-silver/5 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-white mb-2">
                              {category.name}
                            </h4>
                            <p className="text-xs text-accent-silver/70 mb-3">
                              {category.description}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {categoryFeatures.map(feature => (
                                <label key={feature.key} className="flex items-start space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.selectedFeatures.includes(feature.key)}
                                    onChange={(e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedFeatures: e.target.checked
                                          ? [...prev.selectedFeatures, feature.key]
                                          : prev.selectedFeatures.filter(f => f !== feature.key)
                                      }))
                                    }}
                                    className="mt-0.5 rounded border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm text-white block">
                                      {feature.name}
                                    </span>
                                    <span className="text-xs text-accent-silver/60 block">
                                      {feature.description}
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="mt-2 text-xs text-accent-silver/60">
                    Selected features: {formData.selectedFeatures.length}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-accent-silver/20">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}