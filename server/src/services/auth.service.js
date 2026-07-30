import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import config from '../config/env.js';

/** Generate JWT Access Token */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * Register a new user.
 */
export const registerUser = async (data) => {
  const { name, email, password, role, phone } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'ev_user',
      phone,
    },
  });

  const token = generateToken(user.id, user.role);
  delete user.password;
  return { user, token };
};

/**
 * Login user.
 */
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
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

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const token = generateToken(user.id, user.role);
  delete user.password;
  return { user, token };
};

/**
 * Get user profile by ID.
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  delete user.password;
  return user;
};

/**
 * Forgot password.
 */
export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
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

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetExpire = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: resetExpire,
    },
  });

  return resetToken;
};

/**
 * Reset password.
 */
export const resetPassword = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

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
  });

  const token = generateToken(updatedUser.id, updatedUser.role);
  delete updatedUser.password;
  return { user: updatedUser, token };
};

/**
 * Change password.
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

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
  });

  const token = generateToken(updatedUser.id, updatedUser.role);
  delete updatedUser.password;
  return { user: updatedUser, token };
};
