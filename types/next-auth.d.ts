// types/next-auth.d.ts
import 'next-auth';
import 'next-auth/jwt';

/**
 * Auth.js ships a Session type without `user.id`. The jwt/session callbacks in
 * lib/auth.ts put it there, so the type is widened here — otherwise every
 * `session.user.id` read in a route handler would need a cast.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
