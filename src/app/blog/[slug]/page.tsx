import { Metadata } from 'next'
import BlogPostClient from './BlogPostClient'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${params.slug}`, {
      cache: 'no-store' // Ensure fresh data for SEO
    })
    
    if (!response.ok) {
      return {
        title: 'Blog Post Not Found - AIFlash',
        description: 'The requested blog post could not be found.'
      }
    }

    const data = await response.json()
    const post = data.data

    return {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      keywords: post.seo?.keywords?.join(', ') || '',
      openGraph: {
        title: post.seo?.title || post.title,
        description: post.seo?.description || post.excerpt,
        images: [
          {
            url: post.featuredImage || '/images/blog/default-featured.jpg',
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ],
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author.name],
        tags: post.tags?.map((tag: any) => tag.name) || [],
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiflash.com'}/blog/${params.slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seo?.title || post.title,
        description: post.seo?.description || post.excerpt,
        images: [post.featuredImage || '/images/blog/default-featured.jpg'],
      },
      alternates: {
        canonical: post.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiflash.com'}/blog/${params.slug}`,
      },
      other: {
        'article:author': post.author.name,
        'article:published_time': post.publishedAt,
        ...(post.tags && post.tags.reduce((acc: any, tag: any, index: number) => {
          acc[`article:tag:${index}`] = tag.name;
          return acc;
        }, {}))
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post - AIFlash',
      description: 'Read our latest blog post about AI-powered learning tools.'
    }
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />
}