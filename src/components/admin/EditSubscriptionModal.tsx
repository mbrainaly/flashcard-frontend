'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Subscription {
  _id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  plan: {
    name: string
    price: number
    interval: string
    features: string[]
  }
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  createdAt: string
  lastPayment?: string
}

interface EditSubscriptionModalProps {
  subscription: Subscription
  onClose: () => void
  onUpdate: (data: any) => void
}

export default function EditSubscriptionModal({ subscription, onClose, onUpdate }: EditSubscriptionModalProps) {
  const [formData, setFormData] = useState({
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd.split('T')[0], // Convert to date input format
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onUpdate({
        status: formData.status,
        currentPeriodEnd: new Date(formData.currentPeriodEnd).toISOString(),
        cancelAtPeriodEnd: formData.cancelAtPeriodEnd,
        notes: formData.notes
      })
    } catch (error) {
      console.error('Error updating subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-2xl border border-gray-200 dark:border-accent-silver/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Subscription
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Information (Read-only) */}
          <div className="bg-accent-silver/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">User Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Name</label>
                <p className="text-sm text-gray-900 dark:text-white">{subscription.user.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Email</label>
                <p className="text-sm text-gray-900 dark:text-white">{subscription.user.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Plan</label>
                <p className="text-sm text-gray-900 dark:text-white">{subscription.plan.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Price</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  ${subscription.plan.price}/{subscription.plan.interval}
                </p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-accent-silver/5 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
              >
                <option value="active" className="bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white">Active</option>
                <option value="cancelled" className="bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white">Cancelled</option>
                <option value="past_due" className="bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white">Past Due</option>
                <option value="trialing" className="bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white">Trialing</option>
              </select>
            </div>

            <div>
              <label htmlFor="currentPeriodEnd" className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                Current Period End
              </label>
              <input
                type="date"
                id="currentPeriodEnd"
                name="currentPeriodEnd"
                value={formData.currentPeriodEnd}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-accent-silver/5 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="cancelAtPeriodEnd"
              name="cancelAtPeriodEnd"
              checked={formData.cancelAtPeriodEnd}
              onChange={handleChange}
              className="w-4 h-4 text-accent-neon bg-accent-silver/5 border-accent-silver/20 rounded focus:ring-accent-neon focus:ring-2"
            />
            <label htmlFor="cancelAtPeriodEnd" className="ml-2 text-sm text-gray-700 dark:text-accent-silver">
              Cancel at period end
            </label>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this subscription change..."
              className="w-full px-3 py-2 bg-white dark:bg-accent-silver/5 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-accent-silver/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-accent-silver bg-white dark:bg-accent-silver/10 border border-gray-300 dark:border-accent-silver/20 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-black bg-accent-neon hover:bg-accent-neon/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Subscription'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
