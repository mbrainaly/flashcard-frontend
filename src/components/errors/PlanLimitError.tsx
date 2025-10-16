'use client'

import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { formatPlanLimitError, getPlanLimitErrorType, getPlanUpgradeMessage } from '@/utils/planLimitErrors'
import { useRouter } from 'next/navigation'

interface PlanLimitErrorProps {
  error: any;
  onClose?: () => void;
  showUpgradeButton?: boolean;
}

export default function PlanLimitError({ error, onClose, showUpgradeButton = true }: PlanLimitErrorProps) {
  const router = useRouter();
  const errorMessage = formatPlanLimitError(error);
  const errorType = getPlanLimitErrorType(error?.message || '');
  const upgradeMessage = getPlanUpgradeMessage(errorType);

  const handleUpgrade = () => {
    router.push('/billing');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-accent-obsidian rounded-xl shadow-2xl border border-gray-200 dark:border-accent-silver/20"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-accent-silver/20">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Plan Limit Reached
              </h3>
              <p className="text-sm text-gray-500 dark:text-accent-silver/70">
                You've reached your current plan's limit
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {errorMessage}
            </p>
          </div>

          {showUpgradeButton && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {upgradeMessage}
              </p>
              <button
                onClick={handleUpgrade}
                className="inline-flex items-center space-x-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span>Upgrade Plan</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-accent-silver/20">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-accent-silver hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-accent-silver/30 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
