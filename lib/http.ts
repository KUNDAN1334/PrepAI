// lib/http.ts
import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';

/**
 * Transport-level helpers with no auth or database imports.
 *
 * Keeping them free of `./auth` (and therefore of Mongoose and the Auth.js
 * adapter) is what lets the unit tests import and exercise them directly.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status });
}

/** Parses+validates a JSON body against a Zod schema, 400ing on failure. */
export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;

  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, 'Request body must be valid JSON');
  }

  const result = schema.safeParse(raw);

  if (!result.success) {
    throw new ApiError(400, 'Validation failed', flattenZodError(result.error));
  }

  return result.data;
}

export function flattenZodError(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'body';
    if (!fields[key]) fields[key] = issue.message;
  }

  return fields;
}

/**
 * Wraps a handler so thrown ApiErrors become their intended status code and
 * anything unexpected becomes a 500 with the details kept server-side.
 */
export function withErrorHandling<Args extends unknown[]>(
  routeName: string,
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return jsonError(error.status, error.message, error.details);
      }

      if (error instanceof ZodError) {
        return jsonError(400, 'Validation failed', flattenZodError(error));
      }

      console.error(`[${routeName}]`, error);
      return jsonError(500, 'Something went wrong. Please try again.');
    }
  };
}

/** Escapes user input before it is used inside a RegExp (injection / ReDoS guard). */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
