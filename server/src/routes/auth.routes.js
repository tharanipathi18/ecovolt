import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword, validateChangePassword } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(validateRegister), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', validate(validateLogin), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate reset password token
 * @access  Public
 */
router.post('/forgot-password', validate(validateForgotPassword), authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password/:token', validate(validateResetPassword), authController.resetPassword);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.put('/change-password', protect, validate(validateChangePassword), authController.changePassword);

export default router;
