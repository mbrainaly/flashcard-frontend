'use client'

import Link from 'next/link'
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  UserGroupIcon, 
  RocketLaunchIcon, 
  LightBulbIcon,
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const stats = [
  { id: 1, name: 'Active users', value: '50,000+', icon: UserGroupIcon },
  { id: 2, name: 'Universities', value: '100+', icon: AcademicCapIcon },
  { id: 3, name: 'Flashcards created', value: '1M+', icon: SparklesIcon },
  { id: 4, name: 'Success rate', value: '99.9%', icon: RocketLaunchIcon },
]

const values = [
  {
    name: 'Innovation',
    icon: BeakerIcon,
    description:
      'We push the boundaries of what\'s possible in education technology, constantly innovating to provide the best learning experience.',
  },
  {
    name: 'User-Centric',
    icon: HeartIcon,
    description:
      'Every feature we build starts with our users. We listen, learn, and adapt to create tools that truly enhance learning.',
  },
  {
    name: 'Excellence',
    icon: SparklesIcon,
    description:
      'We strive for excellence in everything we do, from our AI algorithms to our user interface and customer support.',
  },
  {
    name: 'Accessibility',
    icon: GlobeAltIcon,
    description:
      'Education should be accessible to everyone. We work to make our platform available and useful for learners worldwide.',
  },
]

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AboutPage() {
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

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
          >
            <div className="flex items-center gap-x-3">
              <div className="h-10 w-10 rounded-full bg-accent-neon/10 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-accent-neon" />
              </div>
              <h2 className="text-base font-semibold leading-7 text-accent-neon">Our Story</h2>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-6xl">
              About AIFlash
            </h1>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              We're on a mission to revolutionize how students learn. By combining artificial intelligence with proven
              learning techniques, we're making education more effective and accessible than ever before.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/auth/register"
                className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
              >
                Join us
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
              >
                Contact us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32"
          >
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="relative">
                <div className="absolute -inset-y-6 -inset-x-4 z-0 scale-95 bg-gradient-to-r from-accent-neon/10 to-accent-gold/10 opacity-20 blur-2xl transform-gpu rotate-3 rounded-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Students collaborating with AI-powered study tools"
                  width={2432}
                  height={1442}
                  className="relative z-10 w-[76rem] rounded-xl bg-glass shadow-premium ring-1 ring-accent-silver/10 backdrop-blur-sm animate-float"
                  style={{ animationDelay: '1s' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats section */}
      <div className="relative py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.id} 
                variants={fadeIn}
                className="mx-auto flex max-w-xs flex-col gap-y-4 group"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-accent-neon/10 flex items-center justify-center group-hover:bg-accent-neon/20 transition-colors duration-300">
                  <stat.icon className="h-8 w-8 text-accent-neon" />
                </div>
                <dt className="text-base leading-7 text-accent-silver">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-5xl">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mission section */}
      <div className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
              <div>
                <h2 className="text-base font-semibold leading-7 text-accent-neon">Our mission</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
                  Transforming education through AI
                </p>
                <p className="mt-6 text-lg leading-8 text-accent-silver">
                  At AIFlash, we believe that learning should be efficient, engaging, and personalized. Our platform combines cutting-edge AI technology with proven learning methodologies to create a revolutionary study experience.
                </p>
                <p className="mt-6 text-lg leading-8 text-accent-silver">
                  We're dedicated to helping students achieve their academic goals by providing tools that adapt to their unique learning styles and needs. Our intelligent flashcards and quizzes are designed to optimize retention and make studying more effective.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-y-6 -inset-x-4 z-0 scale-95 bg-gradient-to-r from-accent-gold/10 to-accent-neon/10 opacity-20 blur-2xl transform-gpu -rotate-3 rounded-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Student using AI learning tools"
                  className="relative z-10 w-full rounded-xl bg-glass shadow-premium ring-1 ring-accent-silver/10 backdrop-blur-sm"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Values section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl lg:mx-0"
          >
            <h2 className="text-base font-semibold leading-7 text-accent-neon">Our values</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              What drives us
            </p>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              Our values shape everything we do, from how we build our product to how we interact with our users.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
          >
            {values.map((value) => (
              <motion.div 
                key={value.name} 
                variants={fadeIn}
                className="relative group bg-glass backdrop-blur-sm rounded-xl p-8 ring-1 ring-accent-silver/10 transition-all duration-300 hover:ring-accent-neon/30 hover:shadow-lg hover:shadow-accent-neon/5"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-neon/10 group-hover:bg-accent-neon/20 transition-colors duration-300">
                  <value.icon className="h-6 w-6 text-accent-neon" aria-hidden="true" />
                </div>
                <dt className="font-semibold text-white">{value.name}</dt>
                <dd className="mt-4 text-accent-silver">{value.description}</dd>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Team section */}
      <div className="relative py-24 sm:py-32 bg-gradient-to-b from-accent-obsidian to-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-base font-semibold leading-7 text-accent-neon">Our team</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              Meet the minds behind AIFlash
            </p>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              We're a diverse team of educators, engineers, and designers passionate about transforming education.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {[
              {
                name: 'Alex Johnson',
                role: 'Founder & CEO',
                image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
                bio: 'Former educator with a passion for technology and learning science.'
              },
              {
                name: 'Sarah Chen',
                role: 'CTO',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
                bio: 'AI researcher with expertise in natural language processing and educational technology.'
              },
              {
                name: 'Michael Rodriguez',
                role: 'Head of Product',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
                bio: 'Product designer focused on creating intuitive and engaging learning experiences.'
              }
            ].map((person, index) => (
              <motion.div 
                key={person.name} 
                variants={fadeIn}
                className="relative group"
              >
                <div className="relative h-64 overflow-hidden rounded-xl bg-glass backdrop-blur-sm ring-1 ring-accent-silver/10 group-hover:ring-accent-neon/30 transition-all duration-300">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-obsidian via-transparent to-transparent"></div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                  <p className="text-sm text-accent-neon">{person.role}</p>
                  <p className="mt-2 text-sm text-accent-silver">{person.bio}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-accent-neon/10 flex items-center justify-center mb-8">
            <RocketLaunchIcon className="h-8 w-8 text-accent-neon" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            Join us in revolutionizing education
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-accent-silver">
            Be part of the future of learning. Start your journey with AIFlash today and experience the
            difference intelligent flashcards can make.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
            >
              Get started
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 