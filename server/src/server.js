import app from './app.js';
import { config, connectDB } from './config/index.js';

/**
 * Server entry point.
 * Connects to database and starts the Express server.
 */
const startServer = async () => {
  // Connect to Supabase PostgreSQL via Prisma
  await connectDB();

  // Start Express server
  const server = app.listen(config.port, () => {
    console.info(`🚀 Server running on port ${config.port}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.info(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.info('💤 Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
