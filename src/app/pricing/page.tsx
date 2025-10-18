'use client'

import { CheckIcon } from '@heroicons/react/20/solid'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getPublicPlans, Plan } from '@/services/subscription.service'

interface PricingTier {
  name: string;
  id: string;
  planId: string;
  href: string;
  price: { monthly: string; annually: string };
  description: string;
  features: string[];
  featured: boolean;
}

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly')
  const [hasYearlyPlans, setHasYearlyPlans] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch plans from database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        const plans = await getPublicPlans()
        
        // Transform database plans to pricing tier format
        const transformedTiers: PricingTier[] = plans.map((plan: Plan) => {
          const monthlyPrice = typeof plan.price === 'object' ? plan.price.monthly : plan.price
          const yearlyPrice = typeof plan.price === 'object' && plan.price.yearly ? plan.price.yearly : 0
          
          return {
            name: plan.name === 'Basic' ? 'Free' : plan.name,
            id: `tier-${plan.id}`,
            planId: plan.id,
            href: '/auth/register',
            price: { 
              monthly: `$${monthlyPrice}`, 
              annually: `$${yearlyPrice}` 
            },
            description: getDescriptionForPlan(plan.name),
            features: plan.features,
            featured: plan.isPopular || false // Use database isPopular field
          }
        })
        
        // Check if any plan has yearly pricing
        const hasYearly = plans.some(plan => typeof plan.price === 'object' && plan.price.yearly !== undefined && plan.price.yearly > 0)
        setHasYearlyPlans(hasYearly)
        
        setTiers(transformedTiers)
      } catch (error) {
        console.error('Error fetching plans:', error)
        // Fallback to empty array if fetch fails
        setTiers([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  // Helper function to get description for each plan
  const getDescriptionForPlan = (planName: string): string => {
    switch (planName) {
      case 'Basic':
      case 'Free':
        return 'Perfect for getting started with flashcards.'
      case 'Pro':
        return 'Ideal for serious learners and students.'
      case 'Team':
      case 'Enterprise':
        return 'For educational institutions and study groups.'
      default:
        return 'A great plan for your learning needs.'
    }
  }

  const handleUpgradeClick = (tier) => {
    if (status === 'authenticated') {
      // For logged-in users, redirect to billing page with the selected plan
      router.push(`/billing?plan=${tier.planId}`)
    } else {
      // For non-logged-in users, redirect to registration
      router.push(tier.href)
    }
  }

  return (
    <div className="bg-accent-obsidian py-24 sm:py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-20 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-accent-neon">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-5xl">
            Choose the right plan for&nbsp;you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-accent-silver">
          Choose a plan that best fits your needs. All plans include our core features with varying levels of
          functionality and support.
        </p>
        
        {/* Billing Interval Toggle */}
        {hasYearlyPlans && (
          <div className="mt-10 flex justify-center">
            <div className="relative flex bg-accent-silver/10 p-1 rounded-full">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-accent-neon text-black'
                    : 'text-accent-silver hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('annually')}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingInterval === 'annually'
                    ? 'bg-accent-neon text-black'
                    : 'text-accent-silver hover:text-white'
                }`}
              >
                Annually
                <span className="ml-2 text-xs bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full">
                  Save up to 20%
                </span>
              </button>
            </div>
          </div>
        )}
        
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-3xl p-8 xl:p-10 bg-glass backdrop-blur-sm ring-1 ring-accent-silver/10 animate-pulse"
              >
                <div className="h-6 bg-accent-silver/20 rounded mb-4"></div>
                <div className="h-4 bg-accent-silver/20 rounded mb-6"></div>
                <div className="h-10 bg-accent-silver/20 rounded mb-6"></div>
                <div className="h-10 bg-accent-silver/20 rounded mb-8"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-accent-silver/20 rounded"></div>
                  ))}
                </div>
              </div>
            ))
          ) : tiers.length === 0 ? (
            // No plans available
            <div className="col-span-3 text-center py-12">
              <p className="text-accent-silver">No pricing plans available at the moment.</p>
              <p className="text-accent-silver/70 text-sm mt-2">Please check back later or contact support.</p>
            </div>
          ) : (
            // Render actual tiers - filter based on billing interval
            tiers
              .filter((tier) => {
                // If yearly is selected, only show plans that have yearly pricing
                if (billingInterval === 'annually') {
                  const yearlyPrice = parseInt(tier.price.annually.replace('$', ''))
                  return yearlyPrice > 0
                }
                // For monthly, show all plans
                return true
              })
              .map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured ? 'ring-2 ring-accent-neon shadow-neon' : 'ring-1 ring-accent-silver/10',
                'rounded-3xl p-8 xl:p-10 bg-glass backdrop-blur-sm transition-all duration-300 hover:ring-accent-neon/30'
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className={classNames(
                  tier.featured ? 'text-accent-neon' : 'text-white',
                  'text-lg font-semibold leading-8'
                )}>
                  {tier.name}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-accent-silver">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">
                  {billingInterval === 'monthly' ? tier.price.monthly : tier.price.annually}
                </span>
                <span className="text-sm font-semibold leading-6 text-accent-silver">
                  /{billingInterval === 'monthly' ? 'month' : 'year'}
                </span>
              </p>
              <button
                onClick={() => handleUpgradeClick(tier)}
                className={classNames(
                  tier.featured
                    ? 'bg-accent-neon text-accent-obsidian hover:bg-white shadow-neon hover:shadow-none'
                    : 'bg-glass text-accent-neon hover:bg-accent-neon hover:text-accent-obsidian',
                  'mt-6 block rounded-full py-2 px-3 text-center text-sm font-semibold leading-6 transition-all duration-300 w-full'
                )}
              >
                {isClient && status === 'authenticated' 
                  ? (tier.name === 'Basic' ? 'Downgrade' : 'Upgrade Now') 
                  : 'Get started today'}
              </button>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-accent-silver">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className={classNames(
                      tier.featured ? 'text-accent-neon' : 'text-accent-silver',
                      'h-6 w-5 flex-none'
                    )} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
} 