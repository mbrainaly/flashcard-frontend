import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import useAuthModals from '@/hooks/useAuthModals'
import AuthModals from './auth/AuthModals'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact', href: '/contact' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { data: session } = useSession()
  const {
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    openRegister,
    closeLogin,
    closeRegister,
  } = useAuthModals()

  return (
    <>
      <Disclosure as="nav" className="bg-accent-obsidian border-b border-accent-silver/10 relative z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/">
                      <Image
                        className="h-8 w-auto"
                        src="/logo.svg"
                        alt="AIFlash"
                        width={32}
                        height={32}
                        priority
                      />
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-accent-silver hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {session ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-accent-obsidian text-sm focus:outline-none focus:ring-2 focus:ring-accent-neon focus:ring-offset-2 focus:ring-offset-accent-obsidian">
                          <span className="sr-only">Open user menu</span>
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={session.user?.image || '/default-avatar.png'}
                            alt=""
                            width={32}
                            height={32}
                          />
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-accent-obsidian py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/dashboard"
                                className={classNames(
                                  active ? 'bg-accent-silver/10' : '',
                                  'block px-4 py-2 text-sm text-accent-silver hover:text-white transition-colors'
                                )}
                              >
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/settings"
                                className={classNames(
                                  active ? 'bg-accent-silver/10' : '',
                                  'block px-4 py-2 text-sm text-accent-silver hover:text-white transition-colors'
                                )}
                              >
                                Settings
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => signOut()}
                                className={classNames(
                                  active ? 'bg-accent-silver/10' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-accent-silver hover:text-white transition-colors'
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
                      <button
                        onClick={openLogin}
                        className="text-accent-silver hover:text-white transition-colors"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={openRegister}
                        className="relative group inline-flex items-center rounded-full bg-accent-neon px-4 py-1.5 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
                      >
                        Sign up
                      </button>
                    </div>
                  )}
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-accent-silver hover:bg-accent-silver/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-neon">
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
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className="block py-2 pl-3 pr-4 text-base font-medium text-accent-silver hover:bg-accent-silver/10 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              {session ? (
                <div className="border-t border-accent-silver/10 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <Image
                        className="h-10 w-10 rounded-full"
                        src={session.user?.image || '/default-avatar.png'}
                        alt=""
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{session.user?.name}</div>
                      <div className="text-sm font-medium text-accent-silver">{session.user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={Link}
                      href="/dashboard"
                      className="block px-4 py-2 text-base font-medium text-accent-silver hover:bg-accent-silver/10 hover:text-white transition-colors"
                    >
                      Dashboard
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      href="/settings"
                      className="block px-4 py-2 text-base font-medium text-accent-silver hover:bg-accent-silver/10 hover:text-white transition-colors"
                    >
                      Settings
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-accent-silver hover:bg-accent-silver/10 hover:text-white transition-colors"
                    >
                      Sign out
                    </Disclosure.Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-accent-silver/10 pb-3 pt-4 px-4 space-y-3">
                  <button
                    onClick={openLogin}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-accent-silver hover:bg-accent-silver/10 hover:text-white transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={openRegister}
                    className="relative group flex w-full justify-center rounded-full bg-accent-neon px-4 py-2 text-base font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={closeLogin}
        onRegisterClose={closeRegister}
        onSwitchToRegister={() => {
          closeLogin()
          openRegister()
        }}
        onSwitchToLogin={() => {
          closeRegister()
          openLogin()
        }}
      />
    </>
  )
} 