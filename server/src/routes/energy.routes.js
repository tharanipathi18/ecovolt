import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateCreateGenerator,
  validateUpdateGenerator,
  validateUploadEnergy,
} from '../validators/energy.validator.js';
import * as energyController from '../controllers/energy.controller.js';

const router = Router();

// Apply auth protection to all energy routes
router.use(protect);

/**
 * @route   GET /api/energy/generators
 * @desc    Get all generators for current operator
 * @access  Private (generator, admin)
 */
router.get(
  '/generators',
  authorize('generator', 'admin'),
  energyController.getGenerators,
);

/**
 * @route   POST /api/energy/generators
 * @desc    Create a new generator facility
 * @access  Private (generator, admin)
 */
router.post(
  '/generators',
  authorize('generator', 'admin'),
  validate(validateCreateGenerator),
  energyController.createGenerator,
);

/**
 * @route   GET /api/energy/generators/:id
 * @desc    Get generator by ID
 * @access  Private (generator, admin)
 */
router.get(
  '/generators/:id',
  authorize('generator', 'admin'),
  energyController.getGeneratorById,
);

/**
 * @route   PUT /api/energy/generators/:id
 * @desc    Update generator details
 * @access  Private (generator, admin)
 */
router.put(
  '/generators/:id',
  authorize('generator', 'admin'),
  validate(validateUpdateGenerator),
  energyController.updateGenerator,
);

/**
 * @route   POST /api/energy/production/upload
 * @desc    Upload energy production log
 * @access  Private (generator, admin)
 */
router.post(
  '/production/upload',
  authorize('generator', 'admin'),
  validate(validateUploadEnergy),
  energyController.uploadEnergyProduction,
);

/**
 * @route   GET /api/energy/analytics
 * @desc    Get energy generation & revenue analytics
 * @access  Private (generator, admin)
 */
router.get(
  '/analytics',
  authorize('generator', 'admin'),
  energyController.getAnalytics,
);

/**
 * @route   GET /api/energy/transactions
 * @desc    Get energy credit dispatch transactions
 * @access  Private (generator, admin)
 */
router.get(
  '/transactions',
  authorize('generator', 'admin'),
  energyController.getTransactions,
);

export default router;
