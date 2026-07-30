import dotenv from 'dotenv';

// Load .env file
dotenv.config();

/**
 * Centralized environment configuration.
 * All environment variables are accessed through this module.
 */
const config = Object.freeze({
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database (Supabase PostgreSQL via Prisma)
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_dev_secret',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // AI Service
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
});

export default config;
