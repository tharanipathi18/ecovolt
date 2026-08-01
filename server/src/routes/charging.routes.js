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

/** Station Application (Prospective Station Owner) */
router.post('/apply-station', chargingController.applyStation);

/** Ports */
router.get('/ports', chargingController.getPorts);
router.post(
  '/ports',
  authorize('ev_port', 'admin'),
  validate(validateCreatePort),
  chargingController.createPort,
);
router.get('/ports/:id', chargingController.getPortById);
router.put(
  '/ports/:id',
  authorize('ev_port', 'admin'),
  validate(validateUpdatePort),
  chargingController.updatePort,
);

/** Sessions */
router.get('/sessions', chargingController.getSessions);
router.post(
  '/sessions/start',
  validate(validateStartSession),
  chargingController.startSession,
);
router.patch('/sessions/:id/stop', chargingController.stopSession);

/** Bookings (Station Owner / Operator Approval) */
router.get('/bookings', authorize('ev_port', 'admin'), chargingController.getOperatorBookings);
router.put('/bookings/:id/status', authorize('ev_port', 'admin'), chargingController.updateBookingStatus);

/** Energy Allocation */
router.post(
  '/allocate-energy',
  authorize('ev_port', 'generator', 'admin'),
  validate(validateAllocateEnergy),
  chargingController.allocateEnergy,
);

/** Queue */
router.get('/queue/:portId', chargingController.getQueue);
router.post('/queue', validate(validateAddToQueue), chargingController.addToQueue);

/** Analytics */
router.get('/analytics', authorize('ev_port', 'admin'), chargingController.getAnalytics);

export default router;
