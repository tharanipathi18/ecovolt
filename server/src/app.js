import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import energyRoutes from './routes/energy.routes.js';
import chargingRoutes from './routes/charging.routes.js';
import fleetRoutes from './routes/fleet.routes.js';
import adminRoutes from './routes/admin.routes.js';
import evUserRoutes from './routes/evUser.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/error.middleware.js';

/**
 * Express application factory.
 * Configures middleware, routes, and error handling.
 */
const app = express();

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());

const corsOptions = {
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight for ALL routes (must come before rate limiting and routes)
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─── Request Performance Logger ─────────────────────────────
app.use((req, _res, next) => {
  const start = Date.now();
  const endpoint = `${req.method} ${req.originalUrl}`;

  _res.on('finish', () => {
    const duration = Date.now() - start;
    if (config.nodeEnv === 'development') {
      console.info(`[PERF] Incoming Request: ${endpoint} | Status: ${_res.statusCode} | Duration: ${duration}ms`);
    }
  });
  next();
});

// ─── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ───────────────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'EcoVolt API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/charging', chargingRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ev', evUserRoutes);
app.use('/api/ai', aiRoutes);

// ─── Error Handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
