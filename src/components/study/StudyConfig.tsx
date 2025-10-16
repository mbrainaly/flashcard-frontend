import { motion } from 'framer-motion'
import { Switch } from '@headlessui/react'
import {
  ArrowsUpDownIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export interface StudyConfig {
  cardOrder: 'sequential' | 'random'
  cardDirection: 'front-to-back' | 'back-to-front' | 'mixed'
  dailyLimit: number
  showProgress: boolean
}

interface StudyConfigProps {
  config: StudyConfig
  onChange: (config: Partial<StudyConfig>) => void
}

export default function StudyConfig({
  config,
  onChange,
}: StudyConfigProps) {
  return (
    <div className="space-y-6">
      {/* Card Order */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowsUpDownIcon className="h-5 w-5 text-accent-silver" />
          <div>
            <h3 className="text-sm font-medium text-white">Card Order</h3>
            <p className="text-xs text-accent-silver">
              Choose how cards are presented
            </p>
          </div>
        </div>
        <select
          id="card-order"
          aria-label="Card order"
          value={config.cardOrder}
          onChange={(e) =>
            onChange({ cardOrder: e.target.value as 'sequential' | 'random' })
          }
          className="rounded-lg bg-glass px-3 py-1.5 text-sm text-accent-silver ring-1 ring-accent-silver/10 focus:outline-none focus:ring-2 focus:ring-accent-neon"
        >
          <option value="sequential">Sequential</option>
          <option value="random">Random</option>
        </select>
      </div>

      {/* Card Direction */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowsUpDownIcon className="h-5 w-5 text-accent-silver rotate-90" />
          <div>
            <h3 className="text-sm font-medium text-white">Card Direction</h3>
            <p className="text-xs text-accent-silver">
              Set which side to show first
            </p>
          </div>
        </div>
        <select
          id="card-direction"
          aria-label="Card direction"
          value={config.cardDirection}
          onChange={(e) =>
            onChange({
              cardDirection: e.target.value as
                | 'front-to-back'
                | 'back-to-front'
                | 'mixed',
            })
          }
          className="rounded-lg bg-glass px-3 py-1.5 text-sm text-accent-silver ring-1 ring-accent-silver/10 focus:outline-none focus:ring-2 focus:ring-accent-neon"
        >
          <option value="front-to-back">Front to Back</option>
          <option value="back-to-front">Back to Front</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      {/* Daily Limit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClockIcon className="h-5 w-5 text-accent-silver" />
          <div>
            <h3 className="text-sm font-medium text-white">Daily Card Limit</h3>
            <p className="text-xs text-accent-silver">
              Maximum cards to review per day
            </p>
          </div>
        </div>
        <input
          type="number"
          id="daily-limit"
          aria-label="Daily card limit"
          min={1}
          max={100}
          value={config.dailyLimit}
          onChange={(e) =>
            onChange({ dailyLimit: parseInt(e.target.value) })
          }
          className="w-20 rounded-lg bg-glass px-3 py-1.5 text-sm text-accent-silver ring-1 ring-accent-silver/10 focus:outline-none focus:ring-2 focus:ring-accent-neon"
        />
      </div>

      {/* Progress Tracking */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="h-5 w-5 text-accent-silver" />
          <div>
            <h3 className="text-sm font-medium text-white">Show Progress</h3>
            <p className="text-xs text-accent-silver">
              Display learning statistics
            </p>
          </div>
        </div>
        <Switch
          checked={config.showProgress}
          onChange={(checked) => onChange({ showProgress: checked })}
          className={`${
            config.showProgress ? 'bg-accent-neon' : 'bg-glass'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-neon focus:ring-offset-2 focus:ring-offset-black`}
        >
          <span
            className={`${
              config.showProgress ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>

    </div>
  )
} 