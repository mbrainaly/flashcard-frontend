'use client'

import { CheckIcon } from '@heroicons/react/20/solid'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const tiers = [
  {
    name: 'Basic',
    id: 'tier-basic',
    planId: 'basic',
    href: '/auth/register',
    price: { monthly: '$0', annually: '$0' },
    description: 'Perfect for getting started with flashcards.',
    features: [
      'Up to 50 flashcards',
      'Basic AI card generation',
      'Study progress tracking',
      'Mobile-friendly interface',
      'Community templates',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    planId: 'pro',
    href: '/auth/register',
    price: { monthly: '$15', annually: '$144' },
    description: 'Ideal for serious learners and students.',
    features: [
      'Unlimited flashcards',
      'Advanced AI generation',
      'Custom study schedules',
      'Performance analytics',
      'Priority support',
      'Offline access',
      'Export capabilities',
    ],
    featured: true,
  },
  {
    name: 'Team',
    id: 'tier-team',
    planId: 'team',
    href: '/auth/register',
    price: { monthly: '$49', annually: '$468' },
    description: 'For educational institutions and study groups.',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Admin dashboard',
      'Usage analytics',
      'API access',
      'Custom branding',
      'Dedicated support',
    ],
    featured: false,
  },
]

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
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
                <span className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">{tier.price.monthly}</span>
                <span className="text-sm font-semibold leading-6 text-accent-silver">/month</span>
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
          ))}
        </div>
      </div>
    </div>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
} 