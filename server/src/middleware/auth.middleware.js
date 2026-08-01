import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import config from '../config/env.js';
import { prisma } from '../config/db.js';

// Prisma select — never expose password hash on req.user
const userPublicFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  avatar: true,
  addressStreet: true,
  addressCity: true,
  addressState: true,
  addressZipCode: true,
  addressCountry: true,
  isActive: true,
  isEmailVerified: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * protect — Verify JWT and attach authenticated user to req.user.
 *
 * Accepts token from:
 *   1. Authorization: Bearer <token>  header
 *   2. HttpOnly `token` cookie (set on login/register)
 *
 * Rejects with 401 if token is missing, invalid, or expired.
 * Rejects with 403 if account is deactivated.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  // Verify signature and expiry — throws JsonWebTokenError / TokenExpiredError
  const decoded = jwt.verify(token, config.jwtSecret);

  // Fetch user using select — password hash never loaded into req.user
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: userPublicFields,
  });

  if (!user) {
    res.status(401);
    throw new Error('Not authorized — user account no longer exists');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact support.');
  }

  req.user = user;
  next();
});

/**
 * authorize — Role-based access control guard.
 *
 * Must be used AFTER protect (req.user must already be set).
 *
 * @param  {...string} roles — Allowed roles, e.g. authorize('admin', 'fleet_manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      res.status(403);
      throw new Error(
        `Access denied — role '${req.user?.role}' is not permitted to access this resource`,
      );
    }
    next();
  };
};
