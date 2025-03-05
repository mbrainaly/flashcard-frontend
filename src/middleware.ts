import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
})

// This config name must be exactly 'config' for Next.js middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/decks/:path*',
    '/study/:path*',
    '/quizzes/:path*',
  ],
} 