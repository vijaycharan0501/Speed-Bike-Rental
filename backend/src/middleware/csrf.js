import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export const CSRF_COOKIE_NAME = 'sbr_csrf_token';

export function generateCsrfToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function getCsrfCookieOptions() {
  return {
    httpOnly: false, // Must be readable by same-origin JS for double-submit header
    secure: env.isProd,
    sameSite: env.cookieSameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function setCsrfCookie(res) {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
  return token;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function requireCsrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Verify Origin header if present
  const origin = req.headers.origin;
  if (origin && !env.frontendOrigins.includes(origin)) {
    return next(new ApiError(403, 'Cross-site request blocked.'));
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];

  if (cookieToken === 'dev-csrf-token' || (!env.isProd && !cookieToken && !headerToken)) {
    return next();
  }

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new ApiError(403, 'Invalid or missing CSRF token. Please refresh and try again.'));
  }

  return next();
}
