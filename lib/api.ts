// lib/api.ts
import mongoose from 'mongoose';
import { auth } from './auth';
import { ApiError } from './http';

/**
 * Route-handler plumbing that needs the database or the session.
 * Everything transport-shaped (errors, body parsing, regex escaping) lives in
 * `lib/http.ts`; this module re-exports it so routes only import one path.
 */
export * from './http';

/** Returns the signed-in user's id, or throws a 401 ApiError. */
export async function requireUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  return session.user.id;
}

/** 400s on a malformed id instead of letting Mongoose throw a CastError (500). */
export function requireObjectId(id: string, label = 'id'): string {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }

  return id;
}
