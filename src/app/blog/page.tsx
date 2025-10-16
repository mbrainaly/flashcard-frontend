'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  author: {
    name: string
    role: string
    image: string
  }
  category: {
    title: string
    slug: string
    href: string
  }
  publishedAt: string
  views: number
  likes: number
  readingTime: number
  featuredImage: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }

        const data = await response.json()
        
        if (data.success) {
          setPosts(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch blog posts')
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        setError('Failed to load blog posts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-accent-obsidian min-h-screen">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              Latest from AIFlash
            </h2>
            <p className="mt-2 text-lg leading-8 text-accent-silver">
              Learn about the latest developments in AI-powered learning and study techniques.
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-accent-silver/10 rounded-2xl h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-accent-obsidian min-h-screen">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
              Latest from AIFlash
            </h2>
            <p className="mt-2 text-lg leading-8 text-accent-silver">
              Learn about the latest developments in AI-powered learning and study techniques.
            </p>
          </div>
          
          {/* Error state */}
          <div className="mx-auto mt-16 max-w-md text-center">
            <div className="text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-accent-silver">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-accent-neon text-black rounded-lg font-medium hover:bg-accent-neon/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-accent-obsidian min-h-screen">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon sm:text-4xl">
            Latest from AIFlash
          </h2>
          <p className="mt-2 text-lg leading-8 text-accent-silver">
            Learn about the latest developments in AI-powered learning and study techniques.
          </p>
        </div>
        {posts.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <div className="text-accent-silver/60 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-accent-silver">No blog posts available yet.</p>
            <p className="text-accent-silver/60 text-sm mt-2">Check back soon for the latest updates!</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {posts.map((post, index) => (
              <motion.article 
                key={post._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-glass backdrop-blur-sm transition-all duration-300 hover:ring-2 hover:ring-accent-neon/30"
              >
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/blog/default-featured.jpg';
                  }}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-accent-obsidian/80 via-accent-obsidian/40" />
                <div className="absolute inset-0 -z-10 ring-1 ring-inset ring-accent-silver/10" />

                <div className="p-8 sm:p-10">
                  <time dateTime={post.publishedAt} className="text-sm leading-6 text-accent-silver">
                    {formatDate(post.publishedAt)}
                  </time>
                  <Link href={post.category.href}>
                    <span className="relative z-10 mt-2 inline-flex items-center rounded-full bg-glass px-3 py-1 text-sm font-medium text-accent-neon ring-1 ring-inset ring-accent-neon/20 backdrop-blur-sm transition-colors hover:text-white">
                      {post.category.title}
                    </span>
                  </Link>
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-accent-silver">{post.excerpt}</p>
                  <div className="mt-6 flex items-center gap-x-4">
                    <img 
                      src={post.author.image} 
                      alt={post.author.name} 
                      className="h-10 w-10 rounded-full bg-accent-silver/10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/authors/default-avatar.jpg';
                      }}
                    />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-white">
                        {post.author.name}
                      </p>
                      <p className="text-accent-silver">{post.author.role}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-x-2 text-xs text-accent-silver/60">
                      <span>{post.readingTime} min read</span>
                      <span>•</span>
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
} 