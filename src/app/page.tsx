'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import {
  AcademicCapIcon,
  BoltIcon,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import useAuthModals from '@/hooks/useAuthModals'
import AuthModals from '@/components/auth/AuthModals'
import { motion } from 'framer-motion'
import AnimatedText from '@/components/ui/AnimatedText'
import { useRef, useEffect, useState } from 'react'

// Animation keyframes for the testimonial slider
const testimonialAnimation = `
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-350px * 4 - 6rem));
  }
}
`;

// Core features for the first section
const coreFeatures = [
  {
    name: 'AI-Powered Learning',
    description: 'Generate flashcards and quizzes instantly using advanced AI technology. Our system analyzes your content and creates optimized study materials tailored to your learning style.',
    icon: SparklesIcon,
  },
  {
    name: 'Smart Study System',
    description: 'Optimize your learning with spaced repetition and personalized study schedules. Our algorithm adapts to your performance, focusing on areas where you need more practice.',
    icon: BoltIcon,
  },
  {
    name: 'Comprehensive Analytics',
    description: 'Monitor your learning journey with detailed analytics and insights. Track your progress, identify weak areas, and visualize your improvement over time with interactive dashboards.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Collaborative Learning',
    description: 'Share decks and study with friends to enhance your learning experience. Create study groups, collaborate on materials, and compete on leaderboards for motivation.',
    icon: UserGroupIcon,
  },
]

// Advanced features for the second section - matching the screenshot exactly
const advancedFeatures = [
  {
    name: 'Collaborative Learning',
    description: 'Share decks with friends, collaborate on study materials, and learn together. Create study groups and track group progress.',
    icon: UserGroupIcon,
  },
  {
    name: 'Smart Scheduling',
    description: 'Let our AI create personalized study schedules based on your goals, availability, and learning patterns.',
    icon: ClockIcon,
  },
  {
    name: 'Content Verification',
    description: 'Our AI ensures accuracy by cross-referencing information and providing source citations for generated content.',
    icon: ScaleIcon,
  },
  {
    name: 'Interactive Learning',
    description: 'Engage with your study materials through various question types, interactive exercises, and real-time feedback.',
    icon: ChatBubbleLeftRightIcon,
  },
]

const heroTexts = [
  'AI-Powered Flashcards',
  'Master Any Subject',
  'Learn Faster & Better',
  'Remember Everything'
]

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const textReveal = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
}

export default function Home() {
  const {
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    openRegister,
    closeLogin,
    closeRegister,
  } = useAuthModals()

  // Animation states for the AI flashcard generation process
  const [animationStep, setAnimationStep] = useState(0)
  const animationRef = useRef(null)
  
  // Hero section quiz generation animation
  const [quizStep, setQuizStep] = useState(0)
  const quizSteps = ["Analyzing content...", "Identifying key concepts...", "Generating questions...", "Creating quiz..."]
  const quizSample = {
    question: "What is the primary function of mitochondria in cells?",
    options: [
      "Energy production (ATP)",
      "Protein synthesis",
      "Cell division",
      "Waste removal"
    ],
    correctAnswer: 0
  }
  
  // Sample flashcards that will be "generated" during the animation
  const sampleFlashcards = [
    {
      front: "What is the capital of France?",
      back: "Paris"
    },
    {
      front: "What is the powerhouse of the cell?",
      back: "Mitochondria"
    },
    {
      front: "What is the formula for calculating the area of a circle?",
      back: "A = πr²"
    }
  ]

  // Animation steps for the flashcard generation section
  const animationSteps = [
    { title: "Input Content", description: "Upload your study material or enter text" },
    { title: "AI Analysis", description: "Our AI analyzes key concepts and important information" },
    { title: "Generating Flashcards", description: "Creating optimized flashcards from the content" },
    { title: "Ready to Study", description: "Personalized flashcards ready for your study session" }
  ]

  // Hero animation effect - auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setQuizStep((prev) => (prev + 1) % (quizSteps.length + 1))
    }, 1800)
    
    return () => clearInterval(interval)
  }, [])

  // Scroll animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          // Start the animation sequence when the section is visible
          let step = 0
          const interval = setInterval(() => {
            if (step < quizSteps.length) {
              setAnimationStep(step)
              step++
            } else {
              clearInterval(interval)
            }
          }, 1500) // Advance to next step every 1.5 seconds
          
          return () => clearInterval(interval)
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the element is visible
    )

    if (animationRef.current) {
      observer.observe(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        observer.unobserve(animationRef.current)
      }
    }
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-accent-obsidian min-h-screen"
    >
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-20 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 pt-8 sm:pb-16 lg:flex lg:px-8 lg:py-20">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-4"
          >
            <motion.div 
              variants={fadeInUp}
              className="mt-12 sm:mt-16 lg:mt-8"
            >
              <button onClick={openRegister} className="inline-flex space-x-6">
                <span className="rounded-full bg-glass px-3 py-1 text-sm font-medium text-accent-neon ring-1 ring-inset ring-accent-neon/20 backdrop-blur-sm">
                  What&apos;s new
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium text-accent-silver">
                  <span>Just shipped v1.0</span>
                  <ArrowRightIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                </span>
              </button>
            </motion.div>
            <motion.h1 
              variants={textReveal}
              className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl"
            >
             {' '}
              <AnimatedText texts={heroTexts} />
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="mt-4 text-lg leading-7 text-accent-silver"
            >
              Transform your study experience with AIFlash. Create intelligent flashcards and quizzes instantly,
              track your progress, and master any subject with our advanced AI technology.
            </motion.p>
            
            {/* Quiz Generation Animation */}
            <motion.div
              variants={fadeInUp}
              className="mt-6 bg-[#111111]/70 backdrop-blur-sm rounded-lg p-4 border border-accent-silver/10 overflow-hidden"
            >
              <div className="flex items-center mb-2">
                <CpuChipIcon className="h-5 w-5 text-accent-neon mr-2" />
                <h3 className="text-sm font-medium text-white">AI Quiz Generator</h3>
              </div>
              
              <div className="h-[120px]">
                {quizStep < quizSteps.length ? (
                  <div className="flex flex-col h-full justify-center">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-accent-neon rounded-full animate-pulse mr-2"></div>
                      <p className="text-accent-silver text-sm">{quizSteps[quizStep]}</p>
                    </div>
                    <div className="mt-3 h-2 bg-accent-silver/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-neon transition-all duration-500 ease-out"
                        style={{ width: `${(quizStep + 1) / quizSteps.length * 100}%` }}
                      ></div>
                    </div>
                    
                    {quizStep === 2 && (
                      <div className="mt-3 text-xs text-accent-silver/80 animate-fadeIn">
                        <p className="text-accent-neon text-xs">Generated question:</p>
                        <p>{quizSample.question}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    <p className="text-white text-xs font-medium mb-2">{quizSample.question}</p>
                    <div className="space-y-1.5">
                      {quizSample.options.map((option, idx) => (
                        <div 
                          key={idx} 
                          className={`text-xs p-1.5 px-2 rounded ${idx === quizSample.correctAnswer ? 'bg-accent-neon/20 text-accent-neon border border-accent-neon/30' : 'bg-[#222] text-accent-silver border border-transparent'}`}
                        >
                          {option}
                          {idx === quizSample.correctAnswer && (
                            <span className="ml-1 text-accent-neon">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="mt-6 flex items-center gap-x-4"
            >
              <button
                onClick={openRegister}
                className="relative group rounded-full bg-accent-neon px-4 py-2.5 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
              >
                Get started
              </button>
              <Link 
                href="/about" 
                className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-10 flex max-w-2xl sm:mt-16 lg:ml-8 lg:mr-0 lg:mt-0 lg:max-w-none xl:ml-16"
          >
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Student using flashcard app on laptop with notes"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-lg bg-glass shadow-premium ring-1 ring-accent-silver/10 backdrop-blur-sm animate-float"
                style={{ animationDelay: '1s' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Flashcard Generation Animation */}
      <div 
        ref={animationRef}
        className="relative py-16 sm:py-24 bg-gradient-to-b from-accent-obsidian to-[#111111] overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold leading-7 text-accent-neon">How it works</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              AI-Powered Flashcard Generation
            </p>
            <p className="mt-6 text-lg leading-8 text-accent-silver max-w-3xl mx-auto">
              Watch how our advanced AI transforms your study material into effective flashcards in seconds
            </p>
          </div>

          {/* Process Steps */}
          <div className="relative mb-16">
            <div className="absolute top-5 left-[calc(50%-1px)] h-[calc(100%-40px)] w-0.5 bg-gradient-to-b from-accent-neon/50 to-accent-gold/50" />
            
            <div className="grid grid-cols-1 gap-12">
              {animationSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: animationStep >= index ? 1 : 0.3,
                    y: animationStep >= index ? 0 : 20
                  }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex items-start ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:gap-10`}
                >
                  <div className={`flex-none ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} md:w-5/12`}>
                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-accent-silver">{step.description}</p>
                  </div>
                  
                  <div className="absolute left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-accent-obsidian">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${animationStep >= index ? 'bg-accent-neon' : 'bg-accent-silver/20'} transition-colors duration-500`}>
                      {animationStep > index ? (
                        <CheckCircleIcon className="h-5 w-5 text-accent-obsidian" />
                      ) : animationStep === index ? (
                        <CpuChipIcon className="h-5 w-5 text-accent-obsidian animate-pulse" />
                      ) : (
                        <span className="text-xs font-medium text-accent-obsidian">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`flex-none ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} md:w-5/12`}>
                    {index === 0 && animationStep >= 0 && (
                      <div className="p-4 bg-[#1a1a1a] rounded-lg ring-1 ring-accent-silver/10">
                        <div className="h-32 flex items-center justify-center text-accent-silver">
                          <p className="text-sm">
                            {animationStep === 0 ? (
                              <span className="inline-block animate-pulse">
                                Mitochondria is the powerhouse of the cell. It generates most of the cell&apos;s supply of adenosine triphosphate (ATP), used as a source of chemical energy. The mitochondrion is enclosed by a double membrane, and the intermembrane space is the space between the outer and inner membranes.
                              </span>
                            ) : (
                              "Mitochondria is the powerhouse of the cell. It generates most of the cell&apos;s supply of adenosine triphosphate (ATP), used as a source of chemical energy."
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {index === 1 && animationStep >= 1 && (
                      <div className="p-4 bg-[#1a1a1a] rounded-lg ring-1 ring-accent-silver/10">
                        <div className="h-32 overflow-hidden">
                          <div className={`transition-all duration-1000 ${animationStep === 1 ? 'animate-pulse' : ''}`}>
                            <p className="text-xs text-accent-neon mb-2">Key concepts identified:</p>
                            <ul className="text-xs text-accent-silver space-y-1">
                              <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-accent-neon mr-1.5"></span>Mitochondria</li>
                              <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-accent-neon mr-1.5"></span>Powerhouse of the cell</li>
                              <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-accent-neon mr-1.5"></span>ATP generation</li>
                              <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-accent-neon mr-1.5"></span>Double membrane structure</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index === 2 && animationStep >= 2 && (
                      <div className="p-4 bg-[#1a1a1a] rounded-lg ring-1 ring-accent-silver/10">
                        <div className="h-32 flex items-center justify-center">
                          <div className={`w-full max-w-xs transform transition-all duration-500 ${animationStep === 2 ? 'animate-pulse' : ''}`}>
                            <div className="bg-[#222] p-3 rounded-lg mb-2 text-center">
                              <p className="text-white text-sm font-medium">What is the powerhouse of the cell?</p>
                            </div>
                            <div className="bg-[#222] p-3 rounded-lg text-center">
                              <p className="text-accent-neon text-sm font-medium">Mitochondria</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index === 3 && animationStep >= 3 && (
                      <div className="p-4 bg-[#1a1a1a] rounded-lg ring-1 ring-accent-silver/10">
                        <div className="h-32 flex items-center justify-center">
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {sampleFlashcards.map((card, cardIndex) => (
                              <div 
                                key={cardIndex}
                                className="flex-shrink-0 w-48 bg-[#222] p-3 rounded-lg text-center transform transition-all duration-300 hover:scale-105"
                              >
                                <p className="text-white text-xs font-medium mb-2">{card.front}</p>
                                <p className="text-accent-neon text-xs">{card.back}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={openRegister}
              className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
            >
              Try it yourself
            </button>
          </div>
        </div>
      </div>

      {/* Testimonial section */}
      <div className="relative isolate overflow-hidden bg-[#0a0a0a] py-16 sm:py-24">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[100px] bg-gradient-to-b from-accent-obsidian to-transparent" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '7s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-xl text-center"
          >
            <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-5xl">
              Loved by 50,000+ students
            </h2>
            <p className="mt-3 text-xl text-accent-silver">
              from top universities
            </p>
          </motion.div>

          {/* University logos */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-10 flex max-w-lg flex-wrap justify-center gap-x-8 gap-y-6 sm:gap-x-10 lg:max-w-4xl lg:gap-x-12"
          >
            {[
              { name: 'HEC Paris', logo: '/hec.avif' },
              { name: 'ETH Zürich', logo: '/ETH.avif' },
              { name: 'University of Cambridge', logo: '/Cambridge.avif' },
              { name: 'Harvard University', logo: '/Harvard.avif' }
            ].map((university, index) => (
              <motion.div 
                key={university.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex flex-col items-center"
              >
                <div className="h-16 w-auto relative group">
                  <img
                    className="h-full w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    src={university.logo}
                    alt={university.name}
                  />
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-neon group-hover:w-full transition-all duration-300"></div>
                </div>
                <p className="mt-2 text-xs text-accent-silver opacity-70 group-hover:opacity-100">{university.name}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative mt-16"
          >
            <style jsx global>{testimonialAnimation}</style>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none z-10"></div>
            
            <div className="mx-auto overflow-hidden">
              <div className="relative flex gap-6 overflow-hidden py-4">
                <div 
                  className="flex gap-6 animate-[scroll_30s_linear_infinite]"
                  style={{ width: 'fit-content' }}
                >
                  {[
                    {
                      name: 'Lucas Martin',
                      role: 'Sciences Po',
                      image: '/testimonials/user1.jpg',
                      text: 'Great for political science and history courses!',
                      time: '9d',
                      likes: 17
                    },
                    {
                      name: 'Sarah Chen',
                      role: 'Harvard University',
                      image: '/testimonials/user2.jpg',
                      text: 'Studyflash saved me so much time studying for my investment banking midterm!',
                      time: '12d',
                      likes: 16
                    },
                    {
                      name: 'Michael Park',
                      role: 'ETH Zürich',
                      image: '/testimonials/user3.jpg',
                      text: 'Thank you this app is revolutionary! And it helps a lot!',
                      time: '27d',
                      likes: 9
                    },
                    {
                      name: 'Emma Rodriguez',
                      role: 'Stanford University',
                      image: '/testimonials/user4.jpg',
                      text: 'The AI quiz generation feature is incredible for exam prep!',
                      time: '3d',
                      likes: 24
                    },
                    // Duplicate cards to create seamless loop
                    {
                      name: 'Lucas Martin',
                      role: 'Sciences Po',
                      image: '/testimonials/user1.jpg',
                      text: 'Great for political science and history courses!',
                      time: '9d',
                      likes: 17
                    },
                    {
                      name: 'Sarah Chen',
                      role: 'Harvard University',
                      image: '/testimonials/user2.jpg',
                      text: 'Studyflash saved me so much time studying for my investment banking midterm!',
                      time: '12d',
                      likes: 16
                    },
                    {
                      name: 'Michael Park',
                      role: 'ETH Zürich',
                      image: '/testimonials/user3.jpg',
                      text: 'Thank you this app is revolutionary! And it helps a lot!',
                      time: '27d',
                      likes: 9
                    },
                    {
                      name: 'Emma Rodriguez',
                      role: 'Stanford University',
                      image: '/testimonials/user4.jpg',
                      text: 'The AI quiz generation feature is incredible for exam prep!',
                      time: '3d',
                      likes: 24
                    }
                  ].map((testimonial, index) => (
                    <div
                      key={index}
                      className="flex-none w-[350px] bg-[#151515] rounded-xl p-6 shadow-premium ring-1 ring-accent-silver/10 backdrop-blur-sm hover:shadow-lg hover:bg-[#181818] transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-accent-neon/20">
                          <div className="absolute inset-0 bg-gradient-to-br from-accent-neon/20 to-accent-gold/20 animate-pulse"></div>
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=111111&color=80E9FF`;
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{testimonial.name}</h3>
                          <p className="text-sm text-accent-silver">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-base text-white leading-relaxed">{testimonial.text}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-accent-silver">
                          <span>{testimonial.time}</span>
                          <button className="text-accent-silver hover:text-accent-neon transition-colors">Reply</button>
                        </div>
                        <div className="flex items-center gap-1 text-accent-silver">
                          <button className="group flex items-center gap-1 hover:text-accent-neon transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:fill-accent-neon/10 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{testimonial.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-10 text-center"
          >
            <button
              onClick={openRegister}
              className="inline-flex items-center rounded-full bg-accent-neon px-4 py-2 text-sm font-semibold text-accent-obsidian shadow-neon hover:shadow-none hover:bg-white transition-all duration-300"
            >
              Join our community
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Feature section */}
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 sm:mt-24 lg:px-8"
      >
        <motion.div 
          variants={fadeInUp}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-accent-neon">Study smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            Everything you need to excel in your studies
          </p>
          <p className="mt-6 text-lg leading-8 text-accent-silver">
            Our platform combines the power of AI with proven learning techniques to help you achieve your
            learning goals faster and more effectively.
          </p>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          className="mx-auto mt-16 sm:mt-20 lg:mt-24"
        >
          <dl className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-glass backdrop-blur-sm rounded-xl p-6 sm:p-8 ring-1 ring-accent-silver/10 transition-all duration-300 hover:ring-accent-neon/30"
              >
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-neon group-hover:shadow-neon transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-accent-obsidian" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-accent-silver">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </motion.div>

      {/* Additional Features Section */}
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="w-full mt-16 sm:mt-24 bg-gradient-to-b from-accent-obsidian to-[#111111]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            variants={fadeInUp}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-base font-semibold leading-7 text-accent-neon">Advanced capabilities</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              Additional Features
            </p>
            <p className="mt-6 text-lg leading-8 text-accent-silver">
              Take your learning to the next level with our advanced features designed for serious learners.
            </p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            className="mx-auto mt-16 sm:mt-20 w-full"
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {advancedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-[#1a1a1a] rounded-xl p-5 sm:p-6 ring-1 ring-accent-silver/10 transition-all duration-300 hover:ring-accent-neon/30"
                >
                  <div className="mb-5 h-12 w-12 rounded-lg bg-[#222222] flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-accent-neon" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold leading-7 text-white mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-sm leading-6 text-accent-silver">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA section */}
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="relative isolate mt-16 px-6 py-16 sm:mt-24 sm:py-24 lg:px-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <motion.div 
          variants={fadeInUp}
          className="mx-auto max-w-2xl text-center relative"
        >
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            Ready to transform your learning?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-accent-silver">
            Join thousands of students who are already using AIFlash to achieve their learning goals faster and
            more effectively.
          </p>
          <motion.div 
            variants={fadeInUp}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <button
              onClick={openRegister}
              className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
            >
              Get started for free
            </button>
            <Link 
              href="/contact" 
              className="text-sm font-semibold leading-6 text-accent-neon hover:text-white transition-colors"
            >
              Contact sales <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={closeLogin}
        onRegisterClose={closeRegister}
        onSwitchToRegister={() => {
          closeLogin()
          openRegister()
        }}
        onSwitchToLogin={() => {
          closeRegister()
          openLogin()
        }}
      />
    </motion.div>
  )
}
