'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon,
  HomeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BoltIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Flashcards', href: '/decks', icon: BookOpenIcon },
  { name: 'Notes', href: '/notes/list', icon: DocumentTextIcon },
  { name: 'Quizzes', href: '/quizzes', icon: AcademicCapIcon },
  { name: 'AI Study Assistant', href: '/study', icon: BoltIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <Disclosure as="nav" className="bg-accent-obsidian border-b border-accent-silver/10 relative z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-neon/5 via-transparent to-accent-gold/5" />

            <div className="relative flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">
                    AIFlash
                  </Link>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    const Icon = item.icon
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive
                            ? 'bg-accent-neon/10 border-accent-neon text-accent-neon'
                            : 'border-transparent text-accent-silver hover:bg-white/5 hover:border-accent-silver/50 hover:text-white',
                          'inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-neon focus:ring-offset-2 focus:ring-offset-accent-obsidian hover:bg-white/10 transition-colors p-0.5">
                      <span className="sr-only">Open user menu</span>
                      {session?.user?.image ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={session.user.image}
                          alt={session.user.name || 'User avatar'}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-accent-neon/20 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-accent-neon" />
                        </div>
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-glass backdrop-blur-sm py-1 shadow-lg ring-1 ring-accent-silver/10 focus:outline-none">
                      <div className="px-4 py-2 border-b border-accent-silver/10">
                        <p className="text-sm font-medium text-white truncate">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-accent-silver truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/billing"
                            className={classNames(
                              active ? 'bg-white/5' : '',
                              'flex items-center gap-2 px-4 py-2 text-sm text-accent-silver hover:text-white transition-colors'
                            )}
                          >
                            <CreditCardIcon className="h-5 w-5" />
                            Billing
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={classNames(
                              active ? 'bg-white/5' : '',
                              'flex items-center gap-2 px-4 py-2 text-sm text-accent-silver hover:text-white transition-colors'
                            )}
                          >
                            <Cog6ToothIcon className="h-5 w-5" />
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut()}
                            className={classNames(
                              active ? 'bg-white/5' : '',
                              'flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-accent-silver hover:text-white transition-colors'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-accent-silver hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-neon">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={classNames(
                      isActive
                        ? 'bg-accent-neon/10 border-accent-neon text-accent-neon'
                        : 'border-transparent text-accent-silver hover:bg-white/5 hover:border-accent-silver/50 hover:text-white',
                      'flex items-center gap-2 border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors duration-300'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Disclosure.Button>
                )
              })}
            </div>
            <div className="border-t border-accent-silver/10 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || 'User avatar'}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-accent-neon/20 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-accent-neon" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{session?.user?.name}</div>
                  <div className="text-sm font-medium text-accent-silver">{session?.user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  as={Link}
                  href="/billing"
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium text-accent-silver hover:bg-white/5 hover:text-white transition-colors"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Billing
                </Disclosure.Button>
                <Disclosure.Button
                  as={Link}
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium text-accent-silver hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  Settings
                </Disclosure.Button>
                <Disclosure.Button
                  as="button"
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-base font-medium text-accent-silver hover:bg-white/5 hover:text-white transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
} 