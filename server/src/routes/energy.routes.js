import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateCreateGenerator,
  validateUpdateGenerator,
  validateUploadEnergy,
  validateCreateOffer,
  validateCreatePurchaseRequest,
  validateUpdateRequestStatus,
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
  authorize('generator', 'admin', 'ev_port'),
  energyController.getTransactions,
);

// ─── ENERGY MARKETPLACE & TRADING ROUTES ─────────────────────────────────────

/**
 * @route   POST /api/energy/offers
 * @desc    Publish energy offer to marketplace
 * @access  Private (generator, admin)
 */
router.post(
  '/offers',
  authorize('generator', 'admin'),
  validate(validateCreateOffer),
  energyController.createOffer,
);

/**
 * @route   GET /api/energy/offers
 * @desc    Get active marketplace energy offers
 * @access  Private (ev_port, generator, admin)
 */
router.get(
  '/offers',
  authorize('ev_port', 'generator', 'admin'),
  energyController.getActiveOffers,
);

/**
 * @route   GET /api/energy/offers/my
 * @desc    Get generator's published offers
 * @access  Private (generator, admin)
 */
router.get(
  '/offers/my',
  authorize('generator', 'admin'),
  energyController.getMyOffers,
);

/**
 * @route   POST /api/energy/requests
 * @desc    Submit purchase request for energy offer
 * @access  Private (ev_port, admin)
 */
router.post(
  '/requests',
  authorize('ev_port', 'admin'),
  validate(validateCreatePurchaseRequest),
  energyController.createPurchaseRequest,
);

/**
 * @route   GET /api/energy/requests/received
 * @desc    Get purchase requests received by generator operator
 * @access  Private (generator, admin)
 */
router.get(
  '/requests/received',
  authorize('generator', 'admin'),
  energyController.getReceivedRequests,
);

/**
 * @route   GET /api/energy/requests/my
 * @desc    Get purchase requests submitted by port owner
 * @access  Private (ev_port, admin)
 */
router.get(
  '/requests/my',
  authorize('ev_port', 'admin'),
  energyController.getMyPurchaseRequests,
);

/**
 * @route   PUT /api/energy/requests/:id/status
 * @desc    Accept or reject purchase request
 * @access  Private (generator, admin)
 */
router.put(
  '/requests/:id/status',
  authorize('generator', 'admin'),
  validate(validateUpdateRequestStatus),
  energyController.updateRequestStatus,
);

/**
 * @route   GET /api/energy/admin/trading
 * @desc    Get admin trading overview
 * @access  Private (admin)
 */
router.get(
  '/admin/trading',
  authorize('admin'),
  energyController.getAdminTradingData,
);

export default router;
