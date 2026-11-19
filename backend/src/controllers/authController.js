import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { loginSchema } from '../validators/authValidators.js';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '../middleware/auth.js';
import { CSRF_COOKIE_NAME, getCsrfCookieOptions, setCsrfCookie } from '../middleware/csrf.js';

export async function loginAdmin(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!admin || !admin.isActive) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign(
      { sub: admin._id.toString(), role: admin.role, email: admin.email, name: admin.name },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    const csrfToken = setCsrfCookie(res);

    return sendSuccess(res, {
      message: 'Logged in successfully.',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          lastLoginAt: admin.lastLoginAt,
        },
        csrfToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutAdmin(_req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, { ...getAuthCookieOptions(), maxAge: undefined });
  res.clearCookie(CSRF_COOKIE_NAME, { ...getCsrfCookieOptions(), maxAge: undefined });
  return sendSuccess(res, { message: 'Logged out successfully.' });
}

export async function getCurrentAdmin(req, res) {
  const csrfToken = req.cookies?.[CSRF_COOKIE_NAME] || setCsrfCookie(res);
  return sendSuccess(res, {
    data: {
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        lastLoginAt: req.admin.lastLoginAt,
      },
      csrfToken,
    },
  });
}
