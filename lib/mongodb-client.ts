import { MongoClient } from 'mongodb';

/**
 * Lazily-created MongoClient promise.
 *
 * IMPORTANT: this module must not throw at import time. `lib/auth.ts` imports it,
 * and every route/page imports `auth`, so a module-scope throw makes `next build`
 * fail while collecting page data whenever MONGODB_URI is absent from the build
 * environment. The connection is only established the first time something
 * actually awaits this promise, i.e. at request time.
 */

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!uri) {
    return Promise.reject(
      new Error('Please define the MONGODB_URI environment variable')
    );
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri, {}).connect();
  }

  return globalWithMongo._mongoClientPromise;
}

const clientPromise = {
  then(onfulfilled: unknown, onrejected: unknown) {
    return createClientPromise().then(
      onfulfilled as never,
      onrejected as never
    );
  },
  catch(onrejected: unknown) {
    return createClientPromise().catch(onrejected as never);
  },
  finally(onfinally: () => void) {
    return createClientPromise().finally(onfinally);
  },
  [Symbol.toStringTag]: 'Promise',
} as unknown as Promise<MongoClient>;

export default clientPromise;
