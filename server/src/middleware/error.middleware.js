import config from '../config/env.js';

/**
 * Handle 404 — Route not found.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler.
 *
 * Handles Prisma-specific errors, JWT errors, and generic application errors.
 * Stack traces are only included in development mode.
 */
export const errorHandler = (err, _req, res, _next) => {
  // Use err.statusCode (set by service layer), res.statusCode (set by controller), or 500
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  // ─── Prisma Error Codes ────────────────────────────────────────────
  // P2002 — Unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    const fields = err.meta?.target?.join(', ') || 'field';
    response.message = `A record with this ${fields} already exists`;
    return res.status(409).json(response);
  }

  // P2025 — Record not found (e.g. update/delete on non-existent ID)
  if (err.code === 'P2025') {
    response.message = err.meta?.cause || 'Record not found';
    return res.status(404).json(response);
  }

  // P2003 — Foreign key constraint violation
  if (err.code === 'P2003') {
    response.message = 'Related record not found';
    return res.status(400).json(response);
  }

  // P2014 — Relation violation
  if (err.code === 'P2014') {
    response.message = 'Invalid relation in request data';
    return res.status(400).json(response);
  }

  // ─── JWT Errors ────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    response.message = 'Invalid token — please log in again';
    return res.status(401).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    response.message = 'Token expired — please log in again';
    return res.status(401).json(response);
  }

  // ─── Generic fallthrough ───────────────────────────────────────────
  res.status(statusCode).json(response);
};
