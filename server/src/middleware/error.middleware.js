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
 * Normalizes error responses and hides stack traces in production.
 */
export const errorHandler = (err, _req, res, _next) => {
  // Use err.statusCode (set by service layer), res.statusCode (set by controller), or 500
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    response.message = 'Resource not found';
    return res.status(404).json(response);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    response.message = `Duplicate value for field: ${field}`;
    return res.status(400).json(response);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    response.message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json(response);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    response.message = 'Invalid token';
    return res.status(401).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    response.message = 'Token expired';
    return res.status(401).json(response);
  }

  res.status(statusCode).json(response);
};
