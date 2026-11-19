import { ZodError } from 'zod';
import multer from 'multer';
import { env } from '../config/env.js';

export function notFoundHandler(_req, res) {
  return res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
  });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: details[0]?.message || 'Validation failed.',
      details,
    });
  }

  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image exceeds the maximum allowed size of 5MB.'
        : err.message;
    return res.status(400).json({ success: false, message: msg });
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: details[0]?.message || 'Database validation failed.',
      details,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid identifier format.',
    });
  }

  if (err.code === 11000) {
    const dupField = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${dupField} already exists.`,
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode >= 500 && env.isProd
      ? 'An unexpected server error occurred. Please try again later.'
      : err.message || 'Internal server error.';

  if (statusCode >= 500) {
    console.error('[Error]', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}
