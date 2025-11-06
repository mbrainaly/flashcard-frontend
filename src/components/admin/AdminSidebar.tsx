'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentIcon,
  NewspaperIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  Bars3BottomLeftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permissions?: string[]
  roles?: string[]
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: HomeIcon
  },
  {
    name: 'User Management',
    href: '/admin/dashboard/users',
    icon: UsersIcon,
    permissions: ['users.read']
  },
  {
    name: 'Content Management',
    href: '/admin/dashboard/content',
    icon: DocumentTextIcon,
    permissions: ['content.read'],
    children: [
      {
        name: 'Decks',
        href: '/admin/dashboard/content/decks',
        icon: DocumentIcon,
        permissions: ['content.read']
      },
      {
        name: 'Cards',
        href: '/admin/dashboard/content/cards',
        icon: DocumentIcon,
        permissions: ['content.read']
      },
      {
        name: 'Quizzes',
        href: '/admin/dashboard/content/quizzes',
        icon: DocumentIcon,
        permissions: ['content.read']
      },
      {
        name: 'Notes',
        href: '/admin/dashboard/content/notes',
        icon: DocumentIcon,
        permissions: ['content.read']
      }
    ]
  },
  {
    name: 'Analytics',
    href: '/admin/dashboard/analytics',
    icon: ChartBarIcon,
    permissions: ['analytics.read']
  },
  {
    name: 'Subscriptions',
    href: '/admin/dashboard/subscriptions',
    icon: CreditCardIcon,
    permissions: ['subscriptions.read']
  },
  {
    name: 'Blog Management',
    href: '/admin/dashboard/blogs',
    icon: NewspaperIcon,
    permissions: ['blogs.read']
  },
  {
    name: 'Page Management',
    href: '/admin/dashboard/pages',
    icon: DocumentIcon,
    permissions: ['pages.read']
  },
  {
    name: 'Testimonials',
    href: '/admin/dashboard/testimonials',
    icon: ChatBubbleLeftRightIcon,
    permissions: ['pages.read']
  },
  {
    name: 'Footer Menu',
    href: '/admin/dashboard/footer',
    icon: Bars3BottomLeftIcon,
    permissions: ['pages.read']
  },
  {
    name: 'Queries',
    href: '/admin/dashboard/queries',
    icon: ChatBubbleLeftRightIcon,
    permissions: ['queries.read']
  },
  {
    name: 'Settings',
    href: '/admin/dashboard/settings',
    icon: Cog6ToothIcon,
    roles: ['super_admin', 'admin']
  }
]

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export default function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const { admin, hasPermission, hasRole } = useAdminAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Filter menu items based on permissions and roles
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Check permissions
      if (item.permissions && !item.permissions.some(permission => hasPermission(permission))) {
        return false
      }
      
      // Check roles
      if (item.roles && !item.roles.some(role => hasRole(role))) {
        return false
      }
      
      return true
    }).map(item => ({
      ...item,
      children: item.children ? filterMenuItems(item.children) : undefined
    }))
  }

  const filteredMenuItems = filterMenuItems(menuItems)

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  const isExpanded = (itemName: string) => expandedItems.includes(itemName)

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-accent-obsidian border-r border-accent-silver/10 h-screen sticky top-0 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent-silver/10">
          <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-accent-neon rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-black" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                <p className="text-accent-silver text-xs">
                  {admin?.role.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            )}
          </motion.div>
          
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-accent-silver/10 transition-colors"
            >
              {collapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-accent-silver" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4 text-accent-silver" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="admin-scrollable flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <div key={item.name}>
              {/* Main menu item */}
              <div className="relative">
                <Link
                  href={item.children ? '#' : item.href}
                  onClick={(e) => {
                    if (item.children) {
                      e.preventDefault()
                      toggleExpanded(item.name)
                    }
                  }}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-accent-neon text-black'
                      : 'text-accent-silver hover:bg-accent-silver/10 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                  
                  {!collapsed && (
                    <>
                      <span className="font-medium">{item.name}</span>
                      {item.children && (
                        <ChevronRightIcon 
                          className={`w-4 h-4 ml-auto transition-transform ${
                            isExpanded(item.name) ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </>
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {item.name}
                  </div>
                )}
              </div>

              {/* Submenu items */}
              {item.children && !collapsed && (
                <motion.div
                  initial={false}
                  animate={{ 
                    height: isExpanded(item.name) ? 'auto' : 0,
                    opacity: isExpanded(item.name) ? 1 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                          ${isActive(child.href)
                            ? 'bg-accent-neon/20 text-accent-neon'
                            : 'text-accent-silver hover:bg-accent-silver/10 hover:text-white'
                          }
                        `}
                      >
                        <child.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        {/* User info at bottom */}
        {!collapsed && admin && (
          <div className="p-4 border-t border-accent-silver/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-neon/20 rounded-full flex items-center justify-center">
                <span className="text-accent-neon font-medium text-sm">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {admin.name}
                </p>
                <p className="text-accent-silver text-xs truncate">
                  {admin.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
