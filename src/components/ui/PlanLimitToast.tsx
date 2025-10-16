'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ExclamationTriangleIcon, XMarkIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { formatPlanLimitError, getPlanLimitErrorType, getPlanUpgradeMessage } from '@/utils/planLimitErrors'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PlanLimitToastProps {
  error: any;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function PlanLimitToast({ 
  error, 
  isVisible, 
  onClose, 
  autoClose = true, 
  duration = 8000 
}: PlanLimitToastProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  
  const errorMessage = formatPlanLimitError(error);
  const errorType = getPlanLimitErrorType(error?.message || '');
  const upgradeMessage = getPlanUpgradeMessage(errorType);

  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleUpgrade = () => {
    router.push('/billing');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 w-full max-w-md"
        >
          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-2xl border border-gray-200 dark:border-accent-silver/20 overflow-hidden">
            {/* Progress bar */}
            {autoClose && !isClosing && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="h-1 bg-yellow-500"
              />
            )}

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Plan Limit Reached
                    </h4>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Error Message */}
              <div className="mb-3">
                <p className="text-sm text-gray-700 dark:text-accent-silver">
                  {errorMessage}
                </p>
              </div>

              {/* Upgrade Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  {upgradeMessage}
                </p>
                <button
                  onClick={handleUpgrade}
                  className="inline-flex items-center space-x-1 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium px-3 py-1.5 rounded-md text-xs transition-colors"
                >
                  <ArrowUpIcon className="w-3 h-3" />
                  <span>Upgrade</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
