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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * Checks for duplicate email, hashes the password with bcrypt (12 rounds),
 * creates the user record via Prisma, and returns a signed JWT.
 *
 * @param {{ name: string, email: string, password: string, role?: string, phone?: string }} data
 * @returns {{ user: object, token: string }}
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

  // 2. Hash password — 12 salt rounds is the security/performance sweet spot
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Persist user — select only public fields, password hash never leaves the service
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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authenticate user with email + password.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {{ user: object, token: string }}
 */
export const loginUser = async ({ email, password }) => {
  // Fetch WITH password for bcrypt comparison (only time we need it)
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

  // Update last login timestamp
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
    select: userPublicFields,
  });

  const token = generateToken(updatedUser.id, updatedUser.role);
  return { user: updatedUser, token };
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a user's public profile by their ID.
 *
 * @param {string} userId
 * @returns {object} user (without password)
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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a password-reset token and store its hash in the DB.
 * Returns the raw (unhashed) token to be sent via email.
 *
 * @param {string} email
 * @returns {string} rawResetToken
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

  // Generate cryptographically secure raw token — only the hash is stored
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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reset a user's password using a valid reset token.
 *
 * @param {string} rawResetToken
 * @param {string} newPassword
 * @returns {{ user: object, token: string }}
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

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Change an authenticated user's password.
 *
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {{ user: object, token: string }}
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Fetch WITH password for bcrypt comparison
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
