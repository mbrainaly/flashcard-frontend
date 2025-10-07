'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ReceiptRefundIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { createCheckoutSession, updateSubscription, getSubscription, getPlans, Subscription, Plan } from '@/services/subscription.service'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

interface BillingPlan {
  id: string
  name: string
  price: string
  monthlyPrice: number
  description: string
  features: string[]
  isPopular?: boolean
  isCurrent?: boolean
  featured?: boolean
  isSelected?: boolean
}

// Component that uses useSearchParams
function BillingContent() {
  const { data: session, status } = useSession()
  const accessToken = (session?.user as Record<string, unknown> | undefined)?.['accessToken'] as string | undefined
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans')
  const [dbPlans, setDbPlans] = useState<Plan[] | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Log session data for debugging
  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    console.log('Access token:', accessToken)
    
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/billing')
    }
  }, [session, status, router])

  // Check for success or canceled parameters in the URL
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const planId = searchParams.get('plan')

  // Build plans from backend
  const plans: BillingPlan[] = (dbPlans || []).map((p) => ({
    id: p.id,
    name: p.name === 'Basic' ? 'Free' : p.name,
    price: `$${p.price}`,
    monthlyPrice: p.price,
    description: p.name === 'Basic' ? 'Everything you need to try AIFlash for free.' : p.name === 'Pro' ? 'Advanced tools for serious learners.' : 'Best for organizations that need scale.',
    isPopular: p.id === 'pro',
    featured: p.id === 'pro',
    isCurrent: subscription?.plan === p.id,
    isSelected: planId === p.id,
    features: p.features,
  }))

  // Helper function to get plan name from plan ID
  const getPlanName = (planId: string): string => {
    // First check database plans
    const dbPlan = dbPlans?.find(p => p.id === planId)
    if (dbPlan) {
      return dbPlan.name === 'Basic' ? 'Free' : dbPlan.name
    }
    
    // Fallback to hardcoded plan names
    switch (planId) {
      case 'basic':
        return 'Free'
      case 'pro':
        return 'Pro'
      case 'team':
        return 'Enterprise'
      default:
        return 'Unknown'
    }
  }

  // Helper function to get plan price from plan ID
  const getPlanPrice = (planId: string): number => {
    // First check database plans
    const dbPlan = dbPlans?.find(p => p.id === planId)
    if (dbPlan) {
      return dbPlan.price
    }
    
    // Fallback to hardcoded prices
    switch (planId) {
      case 'basic':
        return 0
      case 'pro':
        return 15
      case 'team':
        return 49
      default:
        return 0
    }
  }

  const currentPlanName = subscription ? getPlanName(subscription.plan) : 'Free'
  const currentPlanPrice = subscription ? getPlanPrice(subscription.plan) : 0

  const billingHistory = [
    {
      id: '1',
      date: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : new Date().toLocaleDateString(),
      amount: currentPlanPrice,
      status: `${currentPlanName} Plan`,
      description: `${currentPlanName} Plan - Monthly`
    }
  ]

  // Handle subscription upgrade
  const handleUpgrade = async (planId: string) => {
    try {
      setIsLoading(true)
      setMessage(null)
      
      // Find the selected plan to check if it's free
      const selectedPlan = plans.find(p => p.id === planId)
      const isFree = selectedPlan?.monthlyPrice === 0
      
      if (planId === 'basic' || isFree) {
        // Handle free plans directly
        console.log(`Upgrading to free plan: ${planId}`)
        
        if (isFree) {
          // For database plans with price = 0, use createCheckoutSession which will handle it directly
          const response = await createCheckoutSession(planId)
          
          if (response.isFree) {
            // Free plan was assigned directly
            setMessage({ type: 'success', text: response.message || 'Successfully upgraded to free plan' })
            // Refresh subscription data
            fetchSubscription()
          } else {
            throw new Error('Unexpected response for free plan')
          }
        } else {
          // Legacy basic plan handling
          await updateSubscription(planId)
          setMessage({ type: 'success', text: 'Successfully downgraded to Free plan' })
          // Refresh subscription data
          fetchSubscription()
        }
      } else {
        // Create checkout session for paid plans
        console.log(`Creating checkout session for paid plan: ${planId}`)
        
        try {
          const response = await createCheckoutSession(planId)
          
          if (response.url) {
            console.log(`Redirecting to checkout URL: ${response.url}`)
            // Redirect to Stripe Checkout
            window.location.href = response.url
          } else if (response.isFree) {
            // This shouldn't happen for paid plans, but handle it just in case
            setMessage({ type: 'success', text: response.message || 'Successfully upgraded plan' })
            fetchSubscription()
          } else {
            throw new Error('No checkout URL returned from server')
          }
        } catch (checkoutError: any) {
          console.error('Checkout session error:', checkoutError)
          setMessage({ 
            type: 'error', 
            text: `Failed to create checkout session: ${checkoutError.message || 'Unknown error'}` 
          })
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to process upgrade: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch subscription data
  const fetchSubscription = async () => {
    // Only fetch if authenticated
    if (status !== 'authenticated' || !accessToken) {
      console.log('Not authenticated, skipping subscription fetch')
      return
    }
    
    try {
      setIsLoading(true)
      const data = await getSubscription()
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setMessage({ type: 'error', text: 'Failed to load subscription details' })
      
      // If we get a 401 error, the token might be invalid or expired
      if (error instanceof Error && error.message.includes('401')) {
        console.log('Authentication error, redirecting to login')
        router.push('/auth/login?callbackUrl=/billing')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle successful payment
  const handleSuccessfulPayment = async () => {
    try {
      setIsLoading(true)
      if (planId) {
        await updateSubscription(planId)
        setMessage({ type: 'success', text: `Successfully upgraded to ${planId === 'pro' ? 'Pro' : 'Enterprise'} plan` })
        // Refresh subscription data
        await fetchSubscription()
        // Remove query parameters
        router.replace('/billing')
      }
    } catch (error) {
      console.error('Error updating subscription after payment:', error)
      setMessage({ type: 'error', text: 'Failed to update subscription. Please contact support.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch subscription data when authenticated
  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      fetchSubscription()
    }
  }, [status, session])

  // Fetch plans from backend
  useEffect(() => {
    const load = async () => {
      try {
        const p = await getPlans()
        setDbPlans(p)
      } catch (e) {
        console.error('Failed to load plans', e)
      }
    }
    load()
  }, [])

  // Handle URL parameters for payment success/cancel
  useEffect(() => {
    if (success === 'true' && planId) {
      handleSuccessfulPayment()
    } else if (canceled === 'true') {
      setMessage({ type: 'error', text: 'Payment was canceled.' })
    }
    
    // If a plan is selected from the pricing page, scroll to the plans section
    if (planId && !success && !canceled) {
      setActiveTab('plans')
      // Scroll to the plans section after a short delay to ensure rendering
      setTimeout(() => {
        const planElement = document.getElementById(`plan-${planId}`)
        if (planElement) {
          planElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 300)
    }
    
    // Clean up URL parameters only for success/canceled
    if (success || canceled) {
      router.replace('/billing')
    }
  }, [success, canceled, planId, router])

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-obsidian flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian py-8">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Billing Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
        >
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-accent-neon/20 flex items-center justify-center ring-2 ring-accent-neon">
                <CreditCardIcon className="h-8 w-8 text-accent-neon" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
              <p className="text-accent-silver">Manage your subscription and payment history</p>
            </div>
          </div>
        </motion.div>

        {/* Status Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <div className="h-5 w-5 mr-2 text-red-400">⚠️</div>
              )}
              {message.text}
            </div>
          </motion.div>
        )}

        {/* Current Subscription */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-accent-silver">
                  You are currently on the <span className="text-accent-neon font-medium">{currentPlanName} Plan</span>
                </p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-accent-silver mt-1">
                    Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-accent-neon/10 px-3 py-1 rounded-full">
                  <span className="text-accent-neon text-sm font-medium">{subscription.credits} Credits</span>
                </div>
                <div className="bg-accent-neon/10 px-3 py-1 rounded-full">
                  <span className="text-accent-neon text-sm font-medium">{subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'plans'
                ? 'bg-accent-neon text-black font-medium'
                : 'bg-white/5 text-accent-silver hover:bg-white/10 hover:text-white'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-accent-neon text-black font-medium'
                : 'bg-white/5 text-accent-silver hover:bg-white/10 hover:text-white'
            }`}
          >
            Billing History
          </button>
        </div>

        {activeTab === 'plans' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                id={`plan-${plan.id}`}
                className={classNames(
                  plan.featured ? 'ring-2 ring-accent-neon shadow-neon' : 'ring-1 ring-accent-silver/10',
                  plan.isSelected ? 'ring-2 ring-accent-gold shadow-gold' : '',
                  'rounded-3xl p-8 bg-glass backdrop-blur-sm transition-all duration-300 hover:ring-accent-neon/30 relative'
                )}
              >
                {plan.isCurrent && (
                  <div className="absolute top-0 right-0 bg-accent-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                    CURRENT PLAN
                  </div>
                )}
                {plan.isSelected && !plan.isCurrent && (
                  <div className="absolute top-0 right-0 bg-accent-neon text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                    SELECTED
                  </div>
                )}
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className={classNames(
                    plan.featured ? 'text-accent-neon' : 'text-white',
                    'text-lg font-semibold leading-8'
                  )}>
                    {plan.name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-accent-silver">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">{plan.price}</span>
                  <span className="text-sm font-semibold leading-6 text-accent-silver">/month</span>
                </p>
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.isCurrent}
                  className={classNames(
                    plan.isCurrent
                      ? 'bg-white/10 text-accent-silver cursor-not-allowed'
                      : plan.featured
                        ? 'bg-accent-neon text-accent-obsidian hover:bg-white shadow-neon hover:shadow-none'
                        : 'bg-glass text-accent-neon hover:bg-accent-neon hover:text-accent-obsidian',
                    'mt-6 block rounded-full py-2 px-3 text-center text-sm font-semibold leading-6 transition-all duration-300 w-full'
                  )}
                >
                  {plan.isCurrent ? 'Current Plan' : plan.id === 'basic' ? 'Downgrade' : 'Upgrade Now'}
                </button>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-accent-silver">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className={classNames(
                        plan.featured ? 'text-accent-neon' : 'text-accent-silver',
                        'h-6 w-5 flex-none'
                      )} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <ReceiptRefundIcon className="h-5 w-5 text-accent-neon" />
              Payment History
            </h2>
            
            {billingHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-accent-silver/10">
                      <th className="text-left py-3 px-4 text-accent-silver font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-accent-silver font-medium">Description</th>
                      <th className="text-left py-3 px-4 text-accent-silver font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-accent-silver font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((item) => (
                      <tr key={item.id} className="border-b border-accent-silver/10">
                        <td className="py-3 px-4 text-white">{item.date}</td>
                        <td className="py-3 px-4 text-white">{item.description}</td>
                        <td className="py-3 px-4 text-white">${item.amount}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-accent-silver">No billing history available</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function BillingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner />
      <p className="ml-2 text-gray-700 dark:text-gray-300">Loading billing information...</p>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoading />}>
      <BillingContent />
    </Suspense>
  )
} 