// lib/auth.ts
import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './db';
import User from '@/models/User';
import clientPromise from './mongodb-client';

/**
 * OAuth providers are registered only when their credentials exist. Auth.js
 * throws at request time for a provider configured with `undefined!` secrets, so
 * a developer without Google/GitHub apps can still sign in with a password.
 */
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

providers.push(
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? '')
        .toLowerCase()
        .trim();
      const password = String(credentials?.password ?? '');

      if (!email || !password) return null;

      await connectDB();
      const user = await User.findOne({ email });

      // Every failure path returns the same `null`: distinguishing "no such user"
      // from "wrong password" would let an attacker enumerate registered emails.
      if (!user?.password) return null;

      const isCorrectPassword = await bcrypt.compare(password, user.password);

      if (!isCorrectPassword) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The adapter persists OAuth accounts/users through the raw MongoDB driver.
  adapter: MongoDBAdapter(clientPromise),
  /**
   * JWT sessions, not database sessions. The Credentials provider cannot create
   * database sessions, and a stateless token means route handlers can read the
   * user id without an extra query on every request.
   */
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the sign-in pass; afterwards the id rides in the token.
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
