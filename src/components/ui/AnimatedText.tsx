import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedTextProps {
  texts: string[]
  interval?: number
}

export default function AnimatedText({ texts, interval = 5000 }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <div className="relative h-[3.5em] sm:h-[2em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-accent-neon to-accent-silver"
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
} 