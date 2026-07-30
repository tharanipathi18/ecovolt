import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateCreatePort,
  validateUpdatePort,
  validateStartSession,
  validateAllocateEnergy,
  validateAddToQueue,
} from '../validators/charging.validator.js';
import * as chargingController from '../controllers/charging.controller.js';

const router = Router();

// Apply auth protection
router.use(protect);

/**
 * @route   GET /api/charging/ports
 * @desc    Get all charging ports
 * @access  Private
 */
router.get('/ports', chargingController.getPorts);

/**
 * @route   POST /api/charging/ports
 * @desc    Create a new charging port
 * @access  Private (ev_port, admin)
 */
router.post(
  '/ports',
  authorize('ev_port', 'admin'),
  validate(validateCreatePort),
  chargingController.createPort,
);

/**
 * @route   GET /api/charging/ports/:id
 * @desc    Get single charging port by ID
 * @access  Private
 */
router.get('/ports/:id', chargingController.getPortById);

/**
 * @route   PUT /api/charging/ports/:id
 * @desc    Update charging port
 * @access  Private (ev_port, admin)
 */
router.put(
  '/ports/:id',
  authorize('ev_port', 'admin'),
  validate(validateUpdatePort),
  chargingController.updatePort,
);

/**
 * @route   POST /api/charging/sessions/start
 * @desc    Start a new charging session
 * @access  Private
 */
router.post(
  '/sessions/start',
  validate(validateStartSession),
  chargingController.startSession,
);

/**
 * @route   PATCH /api/charging/sessions/:id/stop
 * @desc    Stop an active charging session
 * @access  Private
 */
router.patch('/sessions/:id/stop', chargingController.stopSession);

/**
 * @route   POST /api/charging/allocate-energy
 * @desc    Allocate renewable energy to port
 * @access  Private (ev_port, generator, admin)
 */
router.post(
  '/allocate-energy',
  authorize('ev_port', 'generator', 'admin'),
  validate(validateAllocateEnergy),
  chargingController.allocateEnergy,
);

/**
 * @route   GET /api/charging/queue/:portId
 * @desc    Get waiting queue for port
 * @access  Private
 */
router.get('/queue/:portId', chargingController.getQueue);

/**
 * @route   POST /api/charging/queue
 * @desc    Add vehicle to queue
 * @access  Private
 */
router.post('/queue', validate(validateAddToQueue), chargingController.addToQueue);

/**
 * @route   GET /api/charging/analytics
 * @desc    Get charging analytics
 * @access  Private (ev_port, admin)
 */
router.get(
  '/analytics',
  authorize('ev_port', 'admin'),
  chargingController.getAnalytics,
);

export default router;
