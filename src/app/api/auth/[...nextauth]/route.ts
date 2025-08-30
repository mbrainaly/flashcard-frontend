import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const action = credentials.action || 'login'
          const endpoint = action === 'register' ? 'register' : 'login'
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              ...(action === 'register' ? { name: credentials.name } : {})
            }),
          })

          const user = await res.json()

          if (res.ok && user) {
            return user
          }

          throw new Error(user.message || 'Authentication failed')
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Authentication failed')
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          console.log('Google OAuth sign-in attempt:', { email: user.email, name: user.name });

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              providerId: account.providerAccountId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Google auth failed:', errorData);
            return false;
          }

          const authData = await response.json();
          console.log('Google auth successful:', authData);

          // Store the backend token in the user object so it can be accessed in JWT callback
          user.token = authData.token;
          user.id = authData.user.id;
          user.accessToken = authData.token;

          return true;
        } catch (error) {
          console.error('Google OAuth error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image

        // Set access token for both credentials and Google OAuth
        if (account?.provider === 'credentials') {
          token.accessToken = user.token
        } else if (account?.provider === 'google') {
          token.accessToken = user.accessToken || user.token
        }

        // For subsequent JWT refreshes, maintain the access token
        if (user.accessToken) {
          token.accessToken = user.accessToken
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
        session.user.accessToken = token.accessToken
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST } 