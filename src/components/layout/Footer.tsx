import Link from 'next/link'
import { useSeoSettings } from '@/hooks/useSeoSettings'
import { useFooterData } from '@/hooks/useFooterData'

// Social media icons
const socialIcons = {
  twitter: (props: any) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  ),
  github: (props: any) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  linkedin: (props: any) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
        clipRule="evenodd"
      />
    </svg>
  ),
  facebook: (props: any) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: (props: any) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  youtube: (props: any) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

export default function Footer() {
  const { seoSettings } = useSeoSettings()
  const { footerData, loading } = useFooterData()

  if (loading) {
    return (
      <footer className="bg-accent-obsidian border-t border-accent-silver/10">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-accent-silver/20 rounded w-1/4 mx-auto mb-8"></div>
            <div className="h-6 bg-accent-silver/20 rounded w-1/6 mx-auto"></div>
          </div>
        </div>
      </footer>
    )
  }

  if (!footerData) {
    return null
  }

  // Sort links by order
  const sortedLinks = [...footerData.links].sort((a, b) => a.order - b.order)
  const sortedSocialLinks = [...footerData.socialLinks].sort((a, b) => a.order - b.order)

  return (
    <footer className="bg-accent-obsidian border-t border-accent-silver/10">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        {/* Main navigation - keeping original centered style */}
        <nav className="mb-12 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {/* Simple links in the original centered layout */}
          {sortedLinks.map((link) => (
            <div key={link.id} className="pb-6 sm:pb-0">
              <Link
                href={link.url}
                className="text-sm leading-6 text-accent-silver hover:text-accent-neon transition-colors duration-300"
              >
                {link.title}
              </Link>
            </div>
          ))}
        </nav>

        {/* Social links - keeping original centered style */}
        <div className="mt-8 flex justify-center space-x-10">
          {sortedSocialLinks
            .filter(social => social.url) // Only show social links with URLs
            .map((social) => {
              const IconComponent = socialIcons[social.icon.toLowerCase() as keyof typeof socialIcons]
              return IconComponent ? (
                <Link
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-silver hover:text-accent-neon transition-colors duration-300"
                >
                  <span className="sr-only">{social.platform}</span>
                  <IconComponent className="h-6 w-6" aria-hidden="true" />
                </Link>
              ) : null
            })}
        </div>

        {/* Logo and copyright - keeping original style */}
        <div className="mt-10 flex flex-col items-center">
          <div className="bg-glass backdrop-blur-sm px-4 py-2 rounded-full shadow-neon mb-4">
            <Link href="/" className="flex items-center">
              {seoSettings?.logoUrl && (
                <img
                  src={seoSettings.logoUrl}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                />
              )}
            </Link>
          </div>
          <p className="mt-2 text-center text-xs leading-5 text-accent-silver">
            {footerData.bottomText || `© ${new Date().getFullYear()} FlashCard App. All rights reserved.`}
          </p>
        </div>

        {/* Animated background elements - keeping original */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </footer>
  )
} 