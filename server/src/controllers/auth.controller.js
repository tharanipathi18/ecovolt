import asyncHandler from 'express-async-handler';
import * as authService from '../services/auth.service.js';
import config from '../config/env.js';

/**
 * Helper — send token response with HTTP-only cookie.
 */
const sendTokenResponse = (res, statusCode, user, token, message) => {
  const cookieOptions = {
    expires: new Date(Date.now() + config.jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      data: { user, token },
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  sendTokenResponse(res, 201, user, token, 'Registration successful');
});

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  sendTokenResponse(res, 200, user, token, 'Login successful');
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);

  res.status(200).json({
    success: true,
    message: 'User profile retrieved',
    data: { user },
  });
});

/**
 * @desc    Logout user — clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (_req, res) => {
  res
    .status(200)
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000), // 5 seconds
      httpOnly: true,
    })
    .json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
});

/**
 * @desc    Forgot password — generate reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const resetToken = await authService.forgotPassword(email);

  // In production, send this via email.
  // For development, return in response.
  const resetUrl = `${config.corsOrigin}/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: 'Password reset instructions have been sent to your email',
    data: config.nodeEnv === 'development' ? { resetToken, resetUrl } : null,
  });
});

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token: resetToken } = req.params;
  const { password } = req.body;

  const { user, token } = await authService.resetPassword(resetToken, password);
  sendTokenResponse(res, 200, user, token, 'Password reset successful');
});

/**
 * @desc    Change password (authenticated)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { user, token } = await authService.changePassword(
    req.user.id,
    currentPassword,
    newPassword,
  );
  sendTokenResponse(res, 200, user, token, 'Password changed successfully');
});
