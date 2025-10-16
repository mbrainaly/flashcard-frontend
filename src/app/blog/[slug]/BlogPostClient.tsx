'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline'
import { formatBlogContent } from '@/utils/contentFormatter'

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author: {
    name: string
    role: string
    image: string
  }
  categories: Array<{
    name: string
    slug: string
    href: string
  }>
  tags: Array<{
    name: string
    slug: string
    href: string
  }>
  publishedAt: string
  views: number
  likes: number
  readingTime: number
  featuredImage: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

interface BlogPostClientProps {
  slug: string
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog post')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setPost(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch blog post')
        }
      } catch (error) {
        console.error('Error fetching blog post:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBlogPost()
    }
  }, [slug])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

        <div className="relative mx-auto max-w-4xl px-6 py-24">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-accent-silver/10 rounded w-3/4"></div>
            <div className="h-64 bg-accent-silver/10 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-accent-silver/10 rounded w-full"></div>
              <div className="h-4 bg-accent-silver/10 rounded w-5/6"></div>
              <div className="h-4 bg-accent-silver/10 rounded w-4/5"></div>
            </div>
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

        <div className="relative mx-auto max-w-4xl px-6 py-24">
          {/* Error state */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-white">Blog Post Not Found</h1>
            <p className="text-accent-silver/80 text-lg">{error}</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-accent-neon text-black rounded-lg font-medium hover:bg-accent-neon/90 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
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

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            href="/blog"
            className="inline-flex items-center text-accent-silver hover:text-accent-neon transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 overflow-hidden"
        >
          {/* Featured Image */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/blog/default-featured.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-accent-obsidian/60 via-transparent to-transparent" />
            
            {/* Category badge */}
            {post.categories?.[0] && (
              <div className="absolute top-6 left-6">
                <Link href={post.categories[0].href}>
                  <span className="inline-flex items-center rounded-full bg-glass px-3 py-1 text-sm font-medium text-accent-neon ring-1 ring-inset ring-accent-neon/20 backdrop-blur-sm transition-colors hover:text-white">
                    {post.categories[0].name}
                  </span>
                </Link>
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            {/* Article header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              
              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-accent-silver/70 mb-6">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.image}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/authors/default-avatar.jpg';
                    }}
                  />
                  <span>{post.author.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{post.readingTime} min read</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{post.views} views</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{post.likes} likes</span>
                </div>
              </div>
            </header>

            {/* Article content */}
            <div 
              className="prose prose-lg prose-invert max-w-none
                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
                prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8 prose-h2:leading-tight prose-h2:border-b prose-h2:border-accent-silver/20 prose-h2:pb-3
                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:leading-tight prose-h3:text-accent-neon
                prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5 prose-h4:leading-tight prose-h4:text-accent-silver
                prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-4 prose-h5:font-semibold
                prose-h6:text-base prose-h6:mb-2 prose-h6:mt-4 prose-h6:font-medium prose-h6:text-accent-silver/80
                prose-p:text-accent-silver/90 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                prose-a:text-accent-neon prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-white
                prose-strong:text-white prose-strong:font-bold
                prose-em:text-accent-silver prose-em:italic
                prose-code:text-accent-neon prose-code:bg-accent-silver/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-accent-silver/5 prose-pre:border prose-pre:border-accent-silver/20 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                prose-blockquote:border-l-4 prose-blockquote:border-accent-neon prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:text-accent-silver/80 prose-blockquote:italic prose-blockquote:bg-accent-silver/5 prose-blockquote:rounded-r-lg
                prose-ul:text-accent-silver/90 prose-ul:mb-4 prose-ul:space-y-2
                prose-ol:text-accent-silver/90 prose-ol:mb-4 prose-ol:space-y-2
                prose-li:text-accent-silver/90 prose-li:leading-relaxed prose-li:mb-1
                prose-li:marker:text-accent-neon
                prose-table:border-collapse prose-table:border prose-table:border-accent-silver/20 prose-table:rounded-lg prose-table:overflow-hidden
                prose-th:bg-accent-silver/10 prose-th:text-white prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-accent-silver/20
                prose-td:p-3 prose-td:border prose-td:border-accent-silver/20 prose-td:text-accent-silver/90
                prose-hr:border-accent-silver/20 prose-hr:my-8
                prose-img:rounded-lg prose-img:shadow-lg prose-img:mx-auto
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content).html }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-accent-silver/20">
                <h3 className="text-sm font-medium text-accent-silver/60 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag.slug} href={tag.href}>
                      <span className="inline-flex items-center px-3 py-1 text-sm bg-accent-silver/5 text-accent-silver/80 rounded-full border border-accent-silver/20 hover:bg-accent-silver/10 hover:text-white transition-colors">
                        #{tag.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.article>

        {/* Back to blog button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Link 
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-accent-neon text-black rounded-lg font-medium hover:bg-accent-neon/90 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to All Posts
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
