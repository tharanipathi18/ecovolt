import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import config from './env.js';

// Node global singleton pattern for PrismaClient
// Prevents connection pool exhaustion in development environments with hot reloading or nodemon
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: config.databaseUrl || process.env.DATABASE_URL,
    log: config.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Instantiate Supabase Client (optional direct Supabase APIs).
 */
export const supabase =
  config.supabaseUrl && config.supabaseSecretKey
    ? createClient(config.supabaseUrl, config.supabaseSecretKey)
    : null;

/**
 * Database connection test.
 */
const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL environment variable is missing.');
      return;
    }

    // Connect to PostgreSQL database using Prisma
    await prisma.$connect();
    console.info('✅ Supabase PostgreSQL Connected via Prisma Singleton');
  } catch (error) {
    console.error(`❌ Prisma Connection Error: ${error.message}`);
  }
};

export default connectDB;
