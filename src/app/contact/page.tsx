'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/solid'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-accent-obsidian">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative isolate">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
            <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
              <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden lg:w-1/2">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
                <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">Get in touch</h2>
              <p className="mt-6 text-lg leading-8 text-accent-silver">
                Have questions about AIFlash? We're here to help. Send us a message and we'll get back to you
                as soon as possible.
              </p>
              <dl className="mt-10 space-y-4 text-base leading-7 text-accent-silver">
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Address</span>
                    <BuildingOffice2Icon className="h-7 w-6 text-accent-neon" aria-hidden="true" />
                  </dt>
                  <dd>
                    545 Mavis Island
                    <br />
                    Chicago, IL 99191
                  </dd>
                </div>
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Telephone</span>
                    <PhoneIcon className="h-7 w-6 text-accent-neon" aria-hidden="true" />
                  </dt>
                  <dd>
                    <a className="hover:text-accent-neon transition-colors" href="tel:+1 (555) 234-5678">
                      +1 (555) 234-5678
                    </a>
                  </dd>
                </div>
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Email</span>
                    <EnvelopeIcon className="h-7 w-6 text-accent-neon" aria-hidden="true" />
                  </dt>
                  <dd>
                    <a className="hover:text-accent-neon transition-colors" href="mailto:hello@aiflash.com">
                      hello@aiflash.com
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
            <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold leading-6 text-accent-silver">
                    First name
                  </label>
                  <div className="relative mt-2.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserIcon className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 bg-white/90 px-3.5 pl-10 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                      placeholder="Your first name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold leading-6 text-accent-silver">
                    Last name
                  </label>
                  <div className="relative mt-2.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserIcon className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 bg-white/90 px-3.5 pl-10 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-semibold leading-6 text-accent-silver">
                    Email
                  </label>
                  <div className="relative mt-2.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <EnvelopeIcon className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 bg-white/90 px-3.5 pl-10 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                      placeholder="Your email address"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-accent-silver">
                    Phone number
                  </label>
                  <div className="relative mt-2.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <PhoneIcon className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 bg-white/90 px-3.5 pl-10 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-semibold leading-6 text-accent-silver">
                    Message
                  </label>
                  <div className="mt-2.5">
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 bg-white/90 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
                >
                  Send message
                </motion.button>
              </div>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-md bg-accent-neon/10 p-4"
                >
                  <p className="text-sm text-accent-neon text-center">
                    Thank you for your message. We'll get back to you soon!
                  </p>
                </motion.div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 