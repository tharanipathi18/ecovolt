import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateUpdateUserRole,
  validateSendNotification,
  validateUpdateSystemSettings,
} from '../validators/admin.validator.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// Apply auth & admin role protection to ALL admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', adminController.getOverview);

router.get('/users', adminController.getUsers);
router.put('/users/:id', validate(validateUpdateUserRole), adminController.updateUser);

router.get('/generators', adminController.getGenerators);
router.get('/ports', adminController.getPorts);
router.get('/transactions', adminController.getTransactions);

router.post('/notifications', validate(validateSendNotification), adminController.sendNotification);

router.get('/settings', adminController.getSettings);
router.put('/settings', validate(validateUpdateSystemSettings), adminController.updateSettings);

export default router;
