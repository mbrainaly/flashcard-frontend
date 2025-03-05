import { DocumentTextIcon, DocumentIcon, LinkIcon } from '@heroicons/react/24/outline'

export type InputTab = 'text' | 'document' | 'url'

interface TabSelectorProps {
  activeTab: InputTab
  onTabChange: (tab: InputTab) => void
}

const tabs = [
  { id: 'text' as const, name: 'Text', icon: DocumentTextIcon },
  { id: 'document' as const, name: 'Document', icon: DocumentIcon },
  { id: 'url' as const, name: 'URL', icon: LinkIcon },
]

export default function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex space-x-1 rounded-xl bg-glass backdrop-blur-sm p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
              transition-all duration-200
              ${
                isActive
                  ? 'bg-accent-neon/20 text-accent-neon'
                  : 'text-accent-silver hover:bg-white/5 hover:text-white'
              }
            `}
          >
            <Icon className="h-5 w-5" />
            {tab.name}
          </button>
        )
      })}
    </div>
  )
} 