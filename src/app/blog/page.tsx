import Link from 'next/link'

const posts = [
  {
    id: 1,
    title: 'The Future of Learning: AI-Powered Flashcards',
    description:
      'Discover how artificial intelligence is revolutionizing the way we learn and retain information through smart flashcard technology.',
    date: 'Mar 16, 2024',
    category: { title: 'Technology', href: '#' },
    author: {
      name: 'Dr. Sarah Chen',
      role: 'AI Learning Specialist',
      image: '/authors/sarah-chen.jpg',
    },
  },
  {
    id: 2,
    title: 'Mastering Spaced Repetition: A Scientific Approach',
    description:
      'Learn about the science behind spaced repetition and how it can significantly improve your memory retention and learning efficiency.',
    date: 'Mar 10, 2024',
    category: { title: 'Learning', href: '#' },
    author: {
      name: 'Prof. Michael Roberts',
      role: 'Cognitive Science Researcher',
      image: '/authors/michael-roberts.jpg',
    },
  },
  {
    id: 3,
    title: 'Study Techniques That Actually Work',
    description:
      'Evidence-based study methods that have been proven to enhance learning outcomes and help students achieve better results.',
    date: 'Mar 5, 2024',
    category: { title: 'Education', href: '#' },
    author: {
      name: 'Emma Thompson',
      role: 'Education Consultant',
      image: '/authors/emma-thompson.jpg',
    },
  },
  // More posts...
]

export default function BlogPage() {
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
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-glass backdrop-blur-sm transition-all duration-300 hover:ring-2 hover:ring-accent-neon/30">
              <img
                src={post.author.image}
                alt=""
                className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-accent-obsidian/50 via-accent-obsidian/20" />
              <div className="absolute inset-0 -z-10 ring-1 ring-inset ring-accent-silver/10" />

              <div className="p-8 sm:p-10">
                <time dateTime={post.date} className="text-sm leading-6 text-accent-silver">
                  {post.date}
                </time>
                <Link href={post.category.href}>
                  <span className="relative z-10 mt-2 inline-flex items-center rounded-full bg-glass px-3 py-1 text-sm font-medium text-accent-neon ring-1 ring-inset ring-accent-neon/20 backdrop-blur-sm transition-colors hover:text-white">
                    {post.category.title}
                  </span>
                </Link>
                <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                  <Link href={`/blog/posts/${post.id}`}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-6 text-accent-silver">{post.description}</p>
                <div className="mt-6 flex items-center gap-x-4">
                  <img src={post.author.image} alt="" className="h-10 w-10 rounded-full bg-accent-silver/10" />
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-white">
                      <span className="absolute inset-0" />
                      {post.author.name}
                    </p>
                    <p className="text-accent-silver">{post.author.role}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
} 