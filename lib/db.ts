import mongoose from 'mongoose';

/**
 * Global cache keeps a single connection across hot reloads in development and
 * across lambda invocations in production, preventing connections from growing
 * exponentially during API route usage.
 *
 * IMPORTANT: the missing-env check lives inside connectDB(), not at module
 * scope. Throwing at import time breaks `next build`, because Next imports every
 * route module while collecting page data — before any request (and often before
 * env vars are available on the build machine).
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI or DATABASE_URL environment variable'
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => {
        console.log('MongoDB connected successfully');
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
