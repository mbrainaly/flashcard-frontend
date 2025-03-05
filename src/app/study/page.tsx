'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpenIcon, 
  QuestionMarkCircleIcon, 
  LightBulbIcon,
  PencilSquareIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline'
import NotesQA from '@/components/study/NotesQA'
import ConceptExplanations from '@/components/study/ConceptExplanations'
import PracticeProblems from '@/components/study/PracticeProblems'
import HomeworkHelp from '@/components/study/HomeworkHelp'

type StudyFeature = 'notes' | 'concepts' | 'practice' | 'homework'

interface FeatureTab {
  id: StudyFeature
  name: string
  description: string
  icon: typeof BookOpenIcon
}

const features: FeatureTab[] = [
  {
    id: 'notes',
    name: 'Notes Q&A',
    description: 'Ask questions about your notes and get instant answers',
    icon: BookOpenIcon
  },
  {
    id: 'concepts',
    name: 'Concept Explanations',
    description: 'Get detailed explanations of complex topics',
    icon: LightBulbIcon
  },
  {
    id: 'practice',
    name: 'Practice Problems',
    description: 'Generate custom practice problems',
    icon: PencilSquareIcon
  },
  {
    id: 'homework',
    name: 'Homework Help',
    description: 'Get real-time assistance with your homework',
    icon: AcademicCapIcon
  }
]

export default function StudyAssistantPage() {
  const [activeFeature, setActiveFeature] = useState<StudyFeature>('notes')

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'notes':
        return <NotesQA />
      case 'concepts':
        return <ConceptExplanations />
      case 'practice':
        return <PracticeProblems />
      case 'homework':
        return <HomeworkHelp />
      default:
        return (
          <div className="text-center text-accent-silver py-12">
            <QuestionMarkCircleIcon className="h-12 w-12 mx-auto mb-4 text-accent-neon animate-pulse" />
            <p>This feature is coming soon!</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-accent-obsidian py-12">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            AI Study Assistant
          </motion.h1>
          <motion.p 
            className="text-accent-silver text-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your personal AI-powered study companion
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`p-6 rounded-xl backdrop-blur-sm ring-1 transition-all
                ${activeFeature === feature.id 
                  ? 'bg-accent-neon/10 ring-accent-neon text-white' 
                  : 'bg-glass ring-accent-silver/10 text-accent-silver hover:ring-accent-neon/30 hover:text-white'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <feature.icon className={`h-8 w-8 mb-4 ${activeFeature === feature.id ? 'text-accent-neon' : 'text-accent-silver'}`} />
              <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
              <p className="text-sm opacity-80">{feature.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Feature Content */}
        <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
          {renderFeatureContent()}
        </div>
      </div>
    </div>
  )
} 