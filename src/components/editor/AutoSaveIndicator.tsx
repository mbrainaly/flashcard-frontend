import { motion } from 'framer-motion'
import { ArrowPathIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  error: string | null
  lastSaved: Date | null
}

export default function AutoSaveIndicator({
  isSaving,
  error,
  lastSaved,
}: AutoSaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    })
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isSaving ? (
        <motion.div
          className="flex items-center gap-1 text-accent-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </motion.div>
      ) : error ? (
        <motion.div
          className="flex items-center gap-1 text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ExclamationCircleIcon className="h-4 w-4" />
          <span>{error}</span>
        </motion.div>
      ) : lastSaved ? (
        <motion.div
          className="flex items-center gap-1 text-accent-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckIcon className="h-4 w-4 text-green-500" />
          <span>Saved at {formatTime(lastSaved)}</span>
        </motion.div>
      ) : null}
    </div>
  )
} 