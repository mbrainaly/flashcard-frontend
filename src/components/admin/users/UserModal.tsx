'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAdminApi } from '@/hooks/useAdminApi'

interface User {
  _id: string
  name: string
  email: string
  role: 'basic' | 'pro' | 'team'
  isActive: boolean
  lastLogin?: string
  createdAt: string
  subscription?: {
    plan: string
    status: 'active' | 'inactive' | 'cancelled'
    expiresAt?: string
  }
  stats: {
    totalDecks: number
    totalCards: number
    studySessions: number
  }
}

interface SubscriptionPlan {
  _id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: {
    maxDecks: number
    aiFlashcardCredits: number
    aiQuizCredits: number
    aiNotesCredits: number
    aiAssistantCredits: number
  }
  isActive: boolean
}

interface UserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => void
}

interface FormData {
  name: string
  email: string
  role: string // This will store the plan ID
  isActive: boolean
  password?: string
  confirmPassword?: string
  subscription?: {
    plan: string
    status: 'active' | 'inactive' | 'cancelled'
    expiresAt?: string
  }
}

export default function UserModal({ user, isOpen, onClose, onSave }: UserModalProps) {
  const adminApi = useAdminApi()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: '', // Will be set to first available plan ID
    isActive: true,
    password: '',
    confirmPassword: '',
    subscription: undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  const isEditing = !!user

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      setLoadingPlans(true)
      const response = await adminApi.get('/api/admin/plans')
      
      if (response.success && response.data) {
        // Filter only active plans and sort by price
        const activePlans = response.data
          .filter((plan: SubscriptionPlan) => plan.isActive)
          .sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.price.monthly - b.price.monthly)
        setSubscriptionPlans(activePlans)
        
        // Set default plan for new users (first/cheapest plan)
        if (!user && activePlans.length > 0) {
          setFormData(prev => ({
            ...prev,
            role: activePlans[0]._id
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      // Set fallback plans if API fails
      setSubscriptionPlans([])
    } finally {
      setLoadingPlans(false)
    }
  }

  // Fetch plans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans()
    }
  }, [isOpen])

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      // For existing users, try to find their current plan ID
      let userPlanId = ''
      if (user.subscription?.plan && subscriptionPlans.length > 0) {
        const currentPlan = subscriptionPlans.find(plan => 
          plan.name.toLowerCase() === user.subscription?.plan.toLowerCase() ||
          plan._id === user.subscription?.plan
        )
        userPlanId = currentPlan?._id || (subscriptionPlans[0]?._id || '')
      } else if (subscriptionPlans.length > 0) {
        userPlanId = subscriptionPlans[0]._id
      }

      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: userPlanId,
        isActive: user.isActive ?? true, // Use nullish coalescing to handle undefined
        subscription: user.subscription
      })
      setShowPasswordFields(false)
    } else {
      setFormData({
        name: '',
        email: '',
        role: subscriptionPlans.length > 0 ? subscriptionPlans[0]._id : '',
        isActive: true,
        password: '',
        confirmPassword: ''
      })
      setShowPasswordFields(true)
    }
    setErrors({})
  }, [user, subscriptionPlans])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation (for new users or when changing password)
    if (!isEditing || showPasswordFields) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const userData = {
        ...formData,
        ...(isEditing && { _id: user._id })
      }
      
      // Remove password fields if not needed
      if (isEditing && !showPasswordFields) {
        delete userData.password
        delete userData.confirmPassword
      }
      
      await onSave(userData)
    } catch (error) {
      console.error('Error saving user:', error)
      setErrors({ submit: 'Failed to save user. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block align-bottom bg-gradient-to-br from-accent-obsidian via-accent-obsidian to-gray-900 rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-accent-silver/20 relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-neon to-blue-500 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {isEditing ? 'Edit User' : 'Create New User'}
                  </h3>
                  <p className="text-sm text-accent-silver/70">
                    {isEditing ? 'Update user information and settings' : 'Add a new user to the system'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-accent-silver/60 hover:text-white transition-colors p-2 hover:bg-accent-silver/10 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-accent-silver/5 rounded-lg p-4 border border-accent-silver/10">
                <h4 className="text-sm font-medium text-white mb-4 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-accent-neon" />
                  Personal Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-silver/60" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all ${
                          errors.name ? 'border-red-400' : 'border-accent-silver/20'
                        }`}
                        placeholder="Enter full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-silver/60" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all ${
                          errors.email ? 'border-red-400' : 'border-accent-silver/20'
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="bg-accent-silver/5 rounded-lg p-4 border border-accent-silver/10">
                <h4 className="text-sm font-medium text-white mb-4 flex items-center">
                  <StarIcon className="w-4 h-4 mr-2 text-accent-neon" />
                  Account Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subscription Plan Field */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Subscription Plan
                    </label>
                    {loadingPlans ? (
                      <div className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-accent-silver/60 flex items-center">
                        <div className="w-4 h-4 border-2 border-accent-silver/20 border-t-accent-neon rounded-full animate-spin mr-2"></div>
                        Loading plans...
                      </div>
                    ) : (
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                        disabled={subscriptionPlans.length === 0}
                      >
                        {subscriptionPlans.length === 0 ? (
                          <option value="" className="bg-accent-obsidian text-white">No plans available</option>
                        ) : (
                          subscriptionPlans.map((plan) => (
                            <option key={plan._id} value={plan._id} className="bg-accent-obsidian text-white">
                              {plan.name} - ${plan.price.monthly}/month
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  </div>

                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Account Status
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          checked={formData.isActive}
                          onChange={() => handleInputChange('isActive', true)}
                          className="text-accent-neon focus:ring-accent-neon"
                        />
                        <span className="ml-2 text-sm text-white flex items-center">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mr-1" />
                          Active
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          checked={!formData.isActive}
                          onChange={() => handleInputChange('isActive', false)}
                          className="text-accent-neon focus:ring-accent-neon"
                        />
                        <span className="ml-2 text-sm text-white flex items-center">
                          <XCircleIcon className="w-4 h-4 text-red-400 mr-1" />
                          Inactive
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              {(isEditing || !isEditing) && (
                <div className="bg-accent-silver/5 rounded-lg p-4 border border-accent-silver/10">
                  <h4 className="text-sm font-medium text-white mb-4 flex items-center">
                    <KeyIcon className="w-4 h-4 mr-2 text-accent-neon" />
                    Security Settings
                  </h4>
                  
                  {isEditing && (
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showPasswordFields}
                          onChange={(e) => setShowPasswordFields(e.target.checked)}
                          className="text-accent-neon focus:ring-accent-neon"
                        />
                        <span className="ml-2 text-sm text-white">
                          Change password
                        </span>
                      </label>
                    </div>
                  )}

                  {(!isEditing || showPasswordFields) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Password Field */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-silver/60" />
                          <input
                            type="password"
                            value={formData.password || ''}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all ${
                              errors.password ? 'border-red-400' : 'border-accent-silver/20'
                            }`}
                            placeholder="Enter password"
                          />
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-silver/60" />
                          <input
                            type="password"
                            value={formData.confirmPassword || ''}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all ${
                              errors.confirmPassword ? 'border-red-400' : 'border-accent-silver/20'
                            }`}
                            placeholder="Confirm password"
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="flex items-center p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-accent-silver/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 border border-accent-silver/30 rounded-lg text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-accent-neon to-blue-500 hover:from-accent-neon/90 hover:to-blue-500/90 text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    isEditing ? 'Update User' : 'Create User'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
