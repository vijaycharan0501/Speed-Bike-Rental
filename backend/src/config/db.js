import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let uri = env.mongodbUri;

  if (!uri && env.useMemoryDb && !env.isProd) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('[DB] Using in-memory MongoDB server for local development/testing');
  }

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not configured. Set MONGODB_URI in backend/.env (or USE_MEMORY_DB=true for local testing).'
    );
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true,
  });

  console.log(`[DB] Connected to MongoDB (${mongoose.connection.name})`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
