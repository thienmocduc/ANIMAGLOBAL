'use strict';
const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;

  // Log all 5xx errors
  if (status >= 500) {
    logger.error(`[${req.method}] ${req.path} → ${status}: ${err.message}`, {
      stack: err.stack, user: req.user?.id
    });
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry', detail: err.detail });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Foreign key violation', detail: err.detail });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid UUID format' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  return res.status(401).json({ error: 'Invalid token' });
  if (err.name === 'TokenExpiredError')  return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });

  // Operational errors (AppError instances)
  if (err.isOperational) {
    return res.status(status).json({ error: err.message });
  }

  // Unhandled errors
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
}

module.exports = { errorHandler, AppError };
