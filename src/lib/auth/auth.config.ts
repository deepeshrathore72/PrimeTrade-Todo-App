import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { loginSchema } from '@/lib/validations';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validated = loginSchema.safeParse(credentials);
          if (!validated.success) {
            return null;
          }

          const { email, password } = validated.data;

          await connectDB();

          // Find user with password
          const user = await User.findOne({ email: email.toLowerCase() }).select(
            '+password'
          );

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            image: user.avatar || null,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/error',
    newUser: '/dashboard',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          await connectDB();

          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user for OAuth (without password - they can set one later)
            const names = (user.name || 'User').split(' ');
            const firstName = names[0] || 'User';
            const lastName = names.slice(1).join(' ') || '';

            await User.create({
              email: user.email,
              firstName,
              lastName,
              avatar: user.image || '',
              // No password for OAuth users - they can set one via profile settings
              provider: account.provider,
              providerId: account.providerAccountId,
              emailVerified: true,
            });
          } else {
            // Update existing user with provider info if not set
            if (!existingUser.provider) {
              existingUser.provider = account.provider;
              existingUser.providerId = account.providerAccountId;
              if (!existingUser.avatar && user.image) {
                existingUser.avatar = user.image;
              }
              await existingUser.save();
            }
          }

          return true;
        } catch (error) {
          console.error('OAuth sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.firstName = session.firstName;
        token.lastName = session.lastName;
        token.picture = session.image;
      }

      // Fetch fresh user data from database
      if (token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.picture = dbUser.avatar || token.picture;
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
