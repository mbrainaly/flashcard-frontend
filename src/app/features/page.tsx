import Link from 'next/link'
import {
  BoltIcon,
  SparklesIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ClockIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

const primaryFeatures = [
  {
    name: 'AI-Powered Generation',
    description:
      'Create flashcards and quizzes instantly using advanced AI technology. Our system understands context and generates effective study materials.',
    icon: SparklesIcon,
  },
  {
    name: 'Smart Spaced Repetition',
    description:
      'Optimize your learning with our intelligent spaced repetition system that adapts to your performance and learning patterns.',
    icon: BoltIcon,
  },
  {
    name: 'Progress Analytics',
    description:
      'Track your learning journey with detailed analytics. Understand your strengths, weaknesses, and learning trends.',
    icon: ChartBarIcon,
  },
  {
    name: 'Mobile Friendly',
    description:
      'Study anywhere, anytime with our responsive mobile interface. Your flashcards sync across all devices.',
    icon: DevicePhoneMobileIcon,
  },
]

const secondaryFeatures = [
  {
    name: 'Collaborative Learning',
    description:
      'Share decks with friends, collaborate on study materials, and learn together. Create study groups and track group progress.',
    icon: UserGroupIcon,
  },
  {
    name: 'Smart Scheduling',
    description:
      'Let our AI create personalized study schedules based on your goals, availability, and learning patterns.',
    icon: ClockIcon,
  },
  {
    name: 'Content Verification',
    description:
      'Our AI ensures accuracy by cross-referencing information and providing source citations for generated content.',
    icon: ScaleIcon,
  },
  {
    name: 'Interactive Learning',
    description:
      'Engage with your study materials through various question types, interactive exercises, and real-time feedback.',
    icon: ChatBubbleLeftRightIcon,
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-accent-obsidian">
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
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-6xl">
              Features that make learning easier
            </h1>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              Discover how AIFlash combines artificial intelligence with proven learning techniques to help you
              study more effectively and achieve better results.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
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
            </div>
          </div>
        </div>
      </div>

      {/* Primary features section */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-accent-neon">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            Core Features
          </p>
          <p className="mt-6 text-lg leading-8 text-accent-silver">
            Our core features are designed to make your learning experience more efficient and effective.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
            {primaryFeatures.map((feature) => (
              <div key={feature.name} className="group relative bg-glass backdrop-blur-sm rounded-xl p-6 sm:p-8 ring-1 ring-accent-silver/10 transition-all duration-300 hover:ring-accent-neon/30">
                <div className="text-base font-semibold leading-7 text-white">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-neon group-hover:shadow-neon transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-accent-obsidian" aria-hidden="true" />
                  </div>
                  {feature.name}
                </div>
                <div className="mt-1 flex flex-auto flex-col text-base leading-7 text-accent-silver">
                  <p className="flex-auto">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary features section */}
      <div className="w-full bg-[#111111] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-base font-semibold leading-7 text-accent-neon">Advanced capabilities</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              Additional Features
            </p>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              Take your learning to the next level with our advanced features designed for serious learners.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {secondaryFeatures.map((feature) => (
              <div key={feature.name} className="bg-[#1a1a1a] rounded-xl p-6 ring-1 ring-accent-silver/10 hover:ring-accent-neon/30 transition-all duration-300">
                <div className="mb-5 h-12 w-12 rounded-lg bg-[#222222] flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-accent-neon" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold leading-7 text-white mb-2">
                  {feature.name}
                </h3>
                <p className="text-sm leading-6 text-accent-silver">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="relative isolate mt-16 px-6 py-32 sm:py-40 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            Ready to transform your learning?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-accent-silver">
            Join thousands of students who are already using AIFlash to achieve their learning goals faster and
            more effectively.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
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
          </div>
        </div>
      </div>
    </div>
  )
} 