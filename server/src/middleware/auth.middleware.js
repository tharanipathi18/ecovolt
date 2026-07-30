import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import config from '../config/env.js';
import { prisma } from '../config/db.js';

/**
 * Protect routes — verify JWT token and attach full user to request.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookie
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user via Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401);
      throw new Error('Not authorized — user no longer exists');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated');
    }

    // Exclude password from req.user
    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Not authorized — token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Not authorized — invalid token');
    }
    throw err;
  }
});

/**
 * Role-based authorization middleware.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'fleet_manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      res.status(403);
      throw new Error(`Role '${req.user?.role}' is not authorized to access this resource`);
    }
    next();
  };
};
