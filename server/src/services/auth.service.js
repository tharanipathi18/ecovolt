import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import config from '../config/env.js';

// ─── Prisma select — never return the password hash ───────────────
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

/** Generate a signed JWT Access Token */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * Handle Google OAuth login / upsert user into Prisma DB.
 * One Google account = One EcoVolt account.
 */
export const googleOAuthLogin = async ({ email, name, avatar, role }) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    const error = new Error('Google authentication failed: Invalid or unverified email identity.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  // Security constraint: OAuth sign-ups can assign requested roles EXCEPT admin
  const assignedRole = role && role !== 'admin' ? role : 'ev_user';

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: userPublicFields,
  });

  if (!user) {
    // Generate secure random password for OAuth accounts
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    user = await prisma.user.create({
      data: {
        name: name ? name.trim() : normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        avatar: avatar || null,
        isEmailVerified: true,
        lastLogin: new Date(),
      },
      select: userPublicFields,
    });
  } else {
    // Update last login timestamp and avatar if available
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        avatar: avatar || user.avatar,
      },
      select: userPublicFields,
    });
  }

  const token = generateToken(user.id, user.role);
  return { user, token };
};

/**
 * Register a new user.
 */
export const registerUser = async (data) => {
  const { name, email, password, role, phone } = data;

  // 1. Check for existing account
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password — 12 salt rounds
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Persist user
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'ev_user',
      phone: phone || null,
    },
    select: userPublicFields,
  });

  // 4. Sign token and return
  const token = generateToken(user.id, user.role);
  return { user, token };
};

/**
 * Authenticate user with email + password.
 */
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
    select: userPublicFields,
  });

  const token = generateToken(updatedUser.id, updatedUser.role);
  return { user: updatedUser, token };
};

/**
 * Get a user's public profile by their ID.
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicFields,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Generate a password-reset token.
 */
export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    const error = new Error('No account found with that email address');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('This account has been deactivated');
    error.statusCode = 403;
    throw error;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const resetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: resetExpire,
    },
  });

  return rawToken;
};

/**
 * Reset a user's password using a valid reset token.
 */
export const resetPassword = async (rawResetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { gt: new Date() },
    },
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
    select: userPublicFields,
  });

  const token = generateToken(updatedUser.id, updatedUser.role);
  return { user: updatedUser, token };
};

/**
 * Change an authenticated user's password.
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
    select: userPublicFields,
  });

  const token = generateToken(updatedUser.id, updatedUser.role);
  return { user: updatedUser, token };
};
