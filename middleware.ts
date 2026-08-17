// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge gate for the dashboard.
 *
 * This checks only for the presence of the Auth.js session cookie — it does not
 * verify the JWT. That is deliberate: middleware runs on the Edge runtime, and
 * importing `auth()` here would drag Mongoose (and the whole Node-only auth
 * config) into an environment that cannot run it.
 *
 * The cookie check is a cheap redirect for logged-out visitors, NOT an
 * authorisation boundary. Every API route independently calls `requireUserId()`
 * and scopes its queries by that id, so a forged cookie buys nothing.
 */
const SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  // Names used by NextAuth v4 style deployments, kept for compatibility.
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

const PROTECTED_PREFIXES = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  // Round-trip the original destination so login can send the user back.
  loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Only run on dashboard paths: static assets, the landing page and API routes
  // never need this middleware, and skipping them keeps the Edge invocation count down.
  matcher: ['/dashboard/:path*'],
};
