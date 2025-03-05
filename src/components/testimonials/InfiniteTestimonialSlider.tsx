'use client'

import { useEffect, useRef } from 'react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Harvard University',
    content: 'Studyflash saved me so much time studying for my investment banking midterm!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    date: '12d',
    likes: '16',
  },
  {
    name: 'Michael Park',
    role: 'ETH Zürich',
    content: 'Thank you this app is revolutionary! And it helps a lot!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    date: '27d',
    likes: '9',
  },
  {
    name: 'Emma Watson',
    role: 'University of Cambridge',
    content: 'Created very quickly answers questions and layout!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    date: '12d',
    likes: '4',
  },
  {
    name: 'James Miller',
    role: 'HEC Paris',
    content: 'I tried it its a miracle! The AI generation is incredibly accurate.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    date: '3d',
    likes: '3',
  },
  {
    name: 'Sophia Rodriguez',
    role: 'Stanford University',
    content: 'The spaced repetition system really helps with retention!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    date: '5d',
    likes: '21',
  },
  {
    name: 'David Kim',
    role: 'MIT',
    content: 'Perfect for preparing for my engineering exams.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    date: '8d',
    likes: '15',
  },
  {
    name: 'Lisa Wang',
    role: 'Yale University',
    content: 'The AI-generated explanations are incredibly helpful.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
    date: '6d',
    likes: '18',
  },
  {
    name: 'Alex Thompson',
    role: 'Oxford University',
    content: 'Great for collaborative study sessions with classmates!',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556',
    date: '4d',
    likes: '12',
  },
  {
    name: 'Maria Garcia',
    role: 'UC Berkeley',
    content: 'The progress tracking features keep me motivated.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    date: '9d',
    likes: '24',
  },
  {
    name: 'Thomas Weber',
    role: 'TU Munich',
    content: 'Excellent for memorizing complex technical concepts.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    date: '7d',
    likes: '19',
  },
  {
    name: 'Anna Kowalski',
    role: 'University of Warsaw',
    content: 'Makes studying medical terminology so much easier!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    date: '11d',
    likes: '27',
  },
  {
    name: 'Raj Patel',
    role: 'IIT Bombay',
    content: 'The AI helps me understand complex math concepts better.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    date: '6d',
    likes: '31',
  },
  {
    name: 'Nina Ivanova',
    role: 'Moscow State University',
    content: 'Perfect tool for learning multiple languages simultaneously!',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b',
    date: '8d',
    likes: '23',
  },
  {
    name: 'Carlos Santos',
    role: 'University of São Paulo',
    content: 'Helped me ace my medical board exams!',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce',
    date: '5d',
    likes: '42',
  },
  {
    name: 'Yuki Tanaka',
    role: 'University of Tokyo',
    content: 'The spaced repetition algorithm is incredibly effective.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    date: '4d',
    likes: '28',
  },
  {
    name: 'Lucas Martin',
    role: 'Sciences Po',
    content: 'Great for political science and history courses!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    date: '9d',
    likes: '17',
  },
  {
    name: 'Olivia Brown',
    role: 'University of Melbourne',
    content: 'The AI-generated practice questions are spot-on!',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
    date: '7d',
    likes: '34',
  },
  {
    name: 'Ahmed Hassan',
    role: 'American University in Cairo',
    content: 'Perfect for studying both in English and Arabic!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    date: '3d',
    likes: '25',
  },
  {
    name: 'Isabella Silva',
    role: 'University of Barcelona',
    content: 'Love the collaborative features for group study!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    date: '6d',
    likes: '19',
  },
  {
    name: 'Felix Schmidt',
    role: 'University of Vienna',
    content: 'Excellent for preparing for psychology exams!',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556',
    date: '5d',
    likes: '22',
  },
  {
    name: 'Sophie Dubois',
    role: 'Sorbonne University',
    content: 'The AI explanations are clear and comprehensive.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    date: '8d',
    likes: '29',
  },
  {
    name: 'Lars Nielsen',
    role: 'University of Copenhagen',
    content: 'Great for collaborative research projects!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    date: '4d',
    likes: '16',
  },
  {
    name: 'Elena Popov',
    role: 'University of St. Petersburg',
    content: 'Makes learning organic chemistry much easier!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    date: '7d',
    likes: '33',
  },
  {
    name: 'Marco Rossi',
    role: 'University of Milan',
    content: 'Perfect for medical school preparation!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    date: '5d',
    likes: '27',
  },
  {
    name: 'Aisha Rahman',
    role: 'National University of Singapore',
    content: 'The AI helps me study more efficiently!',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
    date: '6d',
    likes: '31',
  },
  {
    name: 'John O&apos;Connor',
    role: 'Trinity College Dublin',
    content: 'Fantastic for literature analysis and quotes!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    date: '9d',
    likes: '24',
  },
  {
    name: 'Marie Lefebvre',
    role: 'McGill University',
    content: 'The bilingual support is amazing!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    date: '4d',
    likes: '18',
  },
  {
    name: 'Chen Wei',
    role: 'Tsinghua University',
    content: 'Excellent for computer science concepts!',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556',
    date: '7d',
    likes: '35',
  },
  {
    name: 'Ana Martinez',
    role: 'University of Buenos Aires',
    content: 'The progress tracking keeps me motivated!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    date: '5d',
    likes: '26',
  },
  {
    name: 'Liam O&apos;Brien',
    role: 'University of Edinburgh',
    content: 'Perfect for law school preparation!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    date: '8d',
    likes: '29',
  },
  {
    name: 'Fatima Al-Sayed',
    role: 'King&apos;s College London',
    content: 'The AI explanations are incredibly helpful!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    date: '6d',
    likes: '32',
  },
  {
    name: 'Hans Mueller',
    role: 'University of Heidelberg',
    content: 'Great for physics and mathematics!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    date: '4d',
    likes: '23',
  },
  {
    name: 'Priya Sharma',
    role: 'Delhi University',
    content: 'The flashcard creation is so intuitive!',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
    date: '7d',
    likes: '28',
  },
  {
    name: 'Gabriel Santos',
    role: 'University of Lisbon',
    content: 'Makes language learning much easier!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    date: '5d',
    likes: '21',
  },
  {
    name: 'Zara Ahmed',
    role: 'University College London',
    content: 'Perfect for biochemistry studies!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    date: '8d',
    likes: '34',
  },
  {
    name: 'Antoine Dupont',
    role: 'École Polytechnique',
    content: 'The AI-generated examples are very helpful!',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556',
    date: '6d',
    likes: '25',
  },
  {
    name: 'Marta Kowalska',
    role: 'University of Warsaw',
    content: 'Great for preparing for medical exams!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    date: '4d',
    likes: '30',
  },
  {
    name: 'Akiko Sato',
    role: 'Kyoto University',
    content: 'The spaced repetition system is fantastic!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    date: '7d',
    likes: '27',
  },
  {
    name: 'Mohamed Ibrahim',
    role: 'University of Cape Town',
    content: 'Helps me stay organized with my studies!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    date: '5d',
    likes: '22',
  },
  {
    name: 'Clara Fernandez',
    role: 'University of Madrid',
    content: 'The collaborative features are amazing!',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
    date: '8d',
    likes: '31',
  },
  {
    name: 'Viktor Petrov',
    role: 'University of Sofia',
    content: 'Perfect for studying economics!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    date: '6d',
    likes: '24',
  },
  {
    name: 'Leila Benali',
    role: 'Sciences Po Paris',
    content: 'The AI helps me understand complex topics!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    date: '4d',
    likes: '29',
  },
  {
    name: 'Oscar Andersson',
    role: 'Stockholm University',
    content: 'Great for environmental science studies!',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556',
    date: '7d',
    likes: '26',
  },
  {
    name: 'Ling Zhang',
    role: 'Peking University',
    content: 'The progress analytics are very helpful!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    date: '5d',
    likes: '33',
  },
  {
    name: 'Andrei Volkov',
    role: 'Lomonosov University',
    content: 'Makes studying mathematics enjoyable!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    date: '8d',
    likes: '28',
  },
  {
    name: 'Julia Santos',
    role: 'University of Porto',
    content: 'The AI explanations are very clear!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    date: '6d',
    likes: '25',
  },
  {
    name: 'Ibrahim Al-Hassan',
    role: 'American University of Beirut',
    content: 'Perfect for engineering studies!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    date: '4d',
    likes: '30',
  },
  {
    name: 'Sophia Papadopoulos',
    role: 'University of Athens',
    content: 'The flashcard system is revolutionary!',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
    date: '7d',
    likes: '27',
  },
  {
    name: 'Jan Kowalski',
    role: 'Jagiellonian University',
    content: 'Great for history and archaeology!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    date: '5d',
    likes: '24',
  },
  {
    name: 'Emilia Romano',
    role: 'University of Bologna',
    content: 'The study scheduling is very helpful!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    date: '8d',
    likes: '31',
  }
]

// Split testimonials into three rows
const row1 = testimonials.slice(0, Math.floor(testimonials.length / 3))
const row2 = testimonials.slice(Math.floor(testimonials.length / 3), Math.floor(2 * testimonials.length / 3))
const row3 = testimonials.slice(Math.floor(2 * testimonials.length / 3))

// Duplicate each row for seamless loop
const duplicatedRow1 = [...row1, ...row1]
const duplicatedRow2 = [...row2, ...row2]
const duplicatedRow3 = [...row3, ...row3]

export default function InfiniteTestimonialSlider() {
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const row3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row1Element = row1Ref.current
    const row2Element = row2Ref.current
    const row3Element = row3Ref.current
    if (!row1Element || !row2Element || !row3Element) return

    let animationFrameId: number
    let startTime: number | null = null
    const duration = 50000 // 50 seconds for one complete cycle

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = (progress % duration) / duration

      // Different speeds and directions for each row
      const translateX1 = -percentage * (row1Element.scrollWidth / 2)
      const translateX2 = -(1 - percentage) * (row2Element.scrollWidth / 2) // Reverse direction
      const translateX3 = -percentage * (row3Element.scrollWidth / 2)

      row1Element.style.transform = `translateX(${translateX1}px)`
      row2Element.style.transform = `translateX(${translateX2}px)`
      row3Element.style.transform = `translateX(${translateX3}px)`

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  const renderTestimonialRow = (testimonials: typeof row1, ref: React.RefObject<HTMLDivElement>) => (
    <div className="relative overflow-hidden w-full mb-8">
      <div
        ref={ref}
        className="flex gap-6 transition-transform duration-100 ease-linear"
        style={{ width: 'fit-content' }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={`${testimonial.name}-${index}`}
            className="flex-none w-[350px] bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10 hover:ring-accent-neon/30 group transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-accent-neon group-hover:ring-accent-gold transition-all duration-300"
                  />
                  <div className="absolute -inset-1 rounded-full bg-accent-neon/20 group-hover:bg-accent-gold/20 blur transition-all duration-300" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-accent-neon transition-colors duration-300">
                  {testimonial.name}
                </p>
                <p className="text-sm text-accent-silver">{testimonial.role}</p>
                <p className="mt-2 text-sm text-accent-silver/90 leading-relaxed">
                  {testimonial.content}
                </p>
                <div className="mt-3 flex items-center space-x-4">
                  <span className="text-xs text-accent-silver/70">{testimonial.date}</span>
                  <button className="text-xs text-accent-silver/70 hover:text-accent-neon transition-colors">
                    Reply
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      className="text-accent-silver/70 hover:text-accent-neon transition-colors"
                      aria-label="Like this review"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                    <span className="text-xs text-accent-silver/70">{testimonial.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {renderTestimonialRow(duplicatedRow1, row1Ref)}
      {renderTestimonialRow(duplicatedRow2, row2Ref)}
      {renderTestimonialRow(duplicatedRow3, row3Ref)}
    </div>
  )
} 