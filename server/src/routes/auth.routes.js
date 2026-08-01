import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// Public auth routes
router.post('/google', authController.googleAuth);
router.post('/register', validate(validateRegister), authController.register);
router.post('/login', validate(validateLogin), authController.login);
router.post('/forgot-password', validate(validateForgotPassword), authController.forgotPassword);
router.post('/reset-password/:token', validate(validateResetPassword), authController.resetPassword);

// Protected auth routes
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, validate(validateChangePassword), authController.changePassword);

export default router;
