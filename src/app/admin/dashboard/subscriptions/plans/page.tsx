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
import Link from 'next/link'

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
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  limits: {
    decks: number | 'unlimited'
    cards: number | 'unlimited'
    storage: string
    support: string
  }
  isActive: boolean
  isPopular: boolean
}

export default function PlanManagementPage() {
  const { hasPermission } = useAdminAuth()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: 0,
    interval: 'monthly',
    features: [''],
    limits: {
      decks: 10,
      cards: 100,
      storage: '1GB',
      support: 'Email'
    },
    isActive: true,
    isPopular: false
  })

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockPlans: SubscriptionPlan[] = [
          {
            _id: '1',
            name: 'Basic',
            description: 'Perfect for getting started with flashcards',
            price: 9.99,
            interval: 'monthly',
            features: [
              'Up to 10 decks',
              'Up to 100 cards per deck',
              'Basic analytics',
              'Email support'
            ],
            limits: {
              decks: 10,
              cards: 100,
              storage: '1GB',
              support: 'Email'
            },
            isActive: true,
            isPopular: false,
            stripePriceId: 'price_basic_monthly',
            subscriberCount: 456,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15'
          },
          {
            _id: '2',
            name: 'Pro',
            description: 'For serious learners who need more features',
            price: 19.99,
            interval: 'monthly',
            features: [
              'Unlimited decks',
              'Unlimited cards',
              'Advanced analytics',
              'Priority email support',
              'Export to PDF',
              'Collaboration features'
            ],
            limits: {
              decks: 'unlimited',
              cards: 'unlimited',
              storage: '10GB',
              support: 'Priority Email'
            },
            isActive: true,
            isPopular: true,
            stripePriceId: 'price_pro_monthly',
            subscriberCount: 678,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15'
          },
          {
            _id: '3',
            name: 'Premium',
            description: 'Everything you need for professional use',
            price: 39.99,
            interval: 'monthly',
            features: [
              'Everything in Pro',
              'AI-powered study recommendations',
              'Advanced spaced repetition',
              'Live chat support',
              'Custom branding',
              'API access',
              'Team management'
            ],
            limits: {
              decks: 'unlimited',
              cards: 'unlimited',
              storage: '100GB',
              support: 'Live Chat'
            },
            isActive: true,
            isPopular: false,
            stripePriceId: 'price_premium_monthly',
            subscriberCount: 234,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15'
          },
          {
            _id: '4',
            name: 'Enterprise',
            description: 'For organizations and large teams',
            price: 99.99,
            interval: 'monthly',
            features: [
              'Everything in Premium',
              'Dedicated account manager',
              'Custom integrations',
              'SSO authentication',
              'Advanced security',
              'Custom contracts',
              'Phone support'
            ],
            limits: {
              decks: 'unlimited',
              cards: 'unlimited',
              storage: 'Unlimited',
              support: 'Phone + Dedicated Manager'
            },
            isActive: true,
            isPopular: false,
            stripePriceId: 'price_enterprise_monthly',
            subscriberCount: 89,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15'
          }
        ]
        setPlans(mockPlans)
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      interval: 'monthly',
      features: [''],
      limits: {
        decks: 10,
        cards: 100,
        storage: '1GB',
        support: 'Email'
      },
      isActive: true,
      isPopular: false
    })
    setShowModal(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      interval: plan.interval,
      features: plan.features,
      limits: plan.limits,
      isActive: plan.isActive,
      isPopular: plan.isPopular
    })
    setShowModal(true)
  }

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }))
  }

  if (!hasPermission('subscriptions.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage subscription plans.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-accent-silver/20 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-accent-silver/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/dashboard/subscriptions"
            className="p-2 rounded-lg border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Create and manage subscription plans and pricing
            </p>
          </div>
        </div>
        
        {hasPermission('subscriptions.write') && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreatePlan}
              className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Plan
            </button>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border ${
              plan.isPopular 
                ? 'border-accent-neon ring-2 ring-accent-neon/20' 
                : 'border-gray-200 dark:border-accent-silver/10'
            } p-6`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-neon text-black">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-accent-silver mb-4">
                {plan.description}
              </p>
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                </span>
                <span className="text-sm text-gray-500 dark:text-accent-silver ml-1">
                  /{plan.interval}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start">
                  <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-accent-silver">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-accent-silver/10 pt-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-accent-silver">Subscribers:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {plan.subscriberCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500 dark:text-accent-silver">Status:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  plan.isActive 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium">
                <EyeIcon className="w-4 h-4 inline mr-1" />
                View
              </button>
              {hasPermission('subscriptions.write') && (
                <>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 text-sm font-medium"
                  >
                    <PencilIcon className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="flex-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium">
                    <TrashIcon className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-br from-accent-obsidian via-accent-obsidian to-gray-900 rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-2xl sm:w-full border border-accent-silver/20 relative z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-accent-silver hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
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
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-silver">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                      placeholder="19.99"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-2">
                    Billing Interval
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData(prev => ({ ...prev, interval: e.target.value as 'monthly' | 'yearly' }))}
                    className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
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

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-accent-silver">
                    Features
                  </label>
                  <button
                    onClick={handleAddFeature}
                    className="text-accent-neon hover:text-accent-neon/80 text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                        placeholder="Feature description..."
                      />
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
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
                  className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
