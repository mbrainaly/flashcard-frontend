import { useState, useEffect } from 'react'
import { GeneratorConfig } from './GeneratorOptions'

const DEFAULT_CONFIG: GeneratorConfig = {
  numberOfCards: 10,
  difficulty: 'intermediate',
  includeHints: true,
  includeExamples: true,
}

const STORAGE_KEY = 'aiflash_generator_config'

export default function useGeneratorOptions() {
  // Initialize state from localStorage or default config
  const [config, setConfig] = useState<GeneratorConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG
    
    const savedConfig = localStorage.getItem(STORAGE_KEY)
    return savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG
  })

  // Save config changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  // Reset config to defaults
  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
  }

  // Update individual config values
  const updateConfig = (updates: Partial<GeneratorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return {
    config,
    updateConfig,
    resetConfig,
  }
} 