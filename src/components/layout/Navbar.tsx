'use client'

import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useSeoSettings } from '@/hooks/useSeoSettings'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { seoSettings } = useSeoSettings()
  
  // Debug SEO settings
  console.log('Navbar SEO Settings:', seoSettings)

  return (
    <Disclosure as="nav" className="bg-accent-obsidian border-b border-accent-silver/10 relative z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center gap-4">
              {/* Left section - Logo */}
              <div className="bg-glass backdrop-blur-sm px-4 py-2 rounded-full shadow-neon">
                <Link href="/" className="flex items-center">
                  {seoSettings?.logoUrl ? (
                    <img
                      src={seoSettings.logoUrl}
                      alt="Logo"
                      className="h-8 w-auto object-contain"
                      onError={(e) => {
                        console.error('Logo failed to load:', seoSettings.logoUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">
                      {seoSettings?.siteName || 'FlashCard App'}
                    </div>
                  )}
                </Link>
              </div>

              {/* Middle section - Navigation */}
              <div className="hidden sm:block flex-1 max-w-2xl">
                <div className="bg-glass backdrop-blur-sm px-4 py-2 rounded-full shadow-premium ring-1 ring-accent-silver/10">
                  <div className="flex justify-center space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? 'text-accent-neon'
                            : 'text-accent-silver hover:text-accent-neon',
                          'text-sm font-medium transition-colors duration-300'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right section - Auth buttons */}
              <div className="hidden sm:block">
                <div className="bg-glass backdrop-blur-sm px-4 py-2 rounded-full shadow-premium ring-1 ring-accent-silver/10">
                  {session ? (
                    <Menu as="div" className="relative">
                      <Menu.Button className="flex rounded-full bg-glass text-sm focus:outline-none focus:ring-2 focus:ring-accent-neon">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-glass flex items-center justify-center ring-2 ring-accent-neon">
                          <span className="text-accent-neon font-medium">
                            {session.user?.name?.[0] || 'U'}
                          </span>
                        </div>
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-glass backdrop-blur-sm py-1 shadow-premium ring-1 ring-accent-silver/10 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/dashboard"
                                className={classNames(
                                  active ? 'bg-accent-neon/10' : '',
                                  'block px-4 py-2 text-sm text-accent-silver hover:text-accent-neon transition-colors duration-300'
                                )}
                              >
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/profile"
                                className={classNames(
                                  active ? 'bg-accent-neon/10' : '',
                                  'block px-4 py-2 text-sm text-accent-silver hover:text-accent-neon transition-colors duration-300'
                                )}
                              >
                                Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => signOut()}
                                className={classNames(
                                  active ? 'bg-accent-neon/10' : '',
                                  'block w-full px-4 py-2 text-left text-sm text-accent-silver hover:text-accent-neon transition-colors duration-300'
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <Link
                        href="/auth/login"
                        className="text-accent-silver hover:text-accent-neon text-sm font-medium transition-colors duration-300"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/register"
                        className="bg-accent-neon text-accent-obsidian hover:bg-white px-4 py-1 rounded-full text-sm font-medium transition-colors duration-300 shadow-neon hover:shadow-none"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-full p-2 text-accent-silver hover:bg-glass hover:text-accent-neon focus:outline-none transition-colors duration-300">
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

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'text-accent-neon bg-glass'
                      : 'text-accent-silver hover:bg-glass hover:text-accent-neon',
                    'block px-3 py-2 rounded-full text-base font-medium transition-colors duration-300'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-accent-silver/10 pb-3 pt-4">
              {session ? (
                <div className="space-y-1 px-4">
                  <Disclosure.Button
                    as={Link}
                    href="/dashboard"
                    className="block rounded-full px-3 py-2 text-base font-medium text-accent-silver hover:bg-glass hover:text-accent-neon transition-colors duration-300"
                  >
                    Dashboard
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/profile"
                    className="block rounded-full px-3 py-2 text-base font-medium text-accent-silver hover:bg-glass hover:text-accent-neon transition-colors duration-300"
                  >
                    Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut()}
                    className="block w-full rounded-full px-3 py-2 text-left text-base font-medium text-accent-silver hover:bg-glass hover:text-accent-neon transition-colors duration-300"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              ) : (
                <div className="space-y-1 px-4">
                  <Disclosure.Button
                    as={Link}
                    href="/auth/login"
                    className="block rounded-full px-3 py-2 text-base font-medium text-accent-silver hover:bg-glass hover:text-accent-neon transition-colors duration-300"
                  >
                    Log in
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/auth/register"
                    className="block rounded-full px-3 py-2 text-base font-medium text-accent-silver hover:bg-glass hover:text-accent-neon transition-colors duration-300"
                  >
                    Sign up
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
} 