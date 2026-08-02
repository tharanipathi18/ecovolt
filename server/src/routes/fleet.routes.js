import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateRegisterFleetVehicle,
  validateCreateDriver,
  validateAssignDriver,
  validateCreateComplaint,
  validateScheduleMaintenance,
} from '../validators/fleet.validator.js';
import * as fleetController from '../controllers/fleet.controller.js';

const router = Router();

router.use(protect);

// ─── Fleet Vehicles ────────────────────────────────────────────────────────
router.get('/vehicles', authorize('fleet_manager', 'admin'), fleetController.getFleetVehicles);
router.post(
  '/vehicles',
  authorize('fleet_manager', 'admin'),
  validate(validateRegisterFleetVehicle),
  fleetController.registerFleetVehicle,
);
router.patch(
  '/vehicles/:id/status',
  authorize('fleet_manager', 'admin'),
  fleetController.updateFleetVehicleStatus,
);
router.put(
  '/vehicles/:id/schedule',
  authorize('fleet_manager', 'admin'),
  fleetController.updateChargingSchedule,
);

// ─── Drivers ───────────────────────────────────────────────────────────────
router.get('/drivers', authorize('fleet_manager', 'admin'), fleetController.getDrivers);
router.post(
  '/drivers',
  authorize('fleet_manager', 'admin'),
  validate(validateCreateDriver),
  fleetController.createDriver,
);
router.post(
  '/assign-driver',
  authorize('fleet_manager', 'admin'),
  validate(validateAssignDriver),
  fleetController.assignDriver,
);

// ─── Complaints ───────────────────────────────────────────────────────────
// Drivers and fleet managers can raise/view complaints
router.get('/complaints', authorize('fleet_manager', 'driver', 'admin'), fleetController.getComplaints);
router.post(
  '/complaints',
  authorize('fleet_manager', 'driver', 'admin'),
  validate(validateCreateComplaint),
  fleetController.createComplaint,
);
router.put('/complaints/:id', authorize('fleet_manager', 'admin'), fleetController.updateComplaint);

// ─── Maintenance Schedules ─────────────────────────────────────────────────
router.get('/maintenance', authorize('fleet_manager', 'admin'), fleetController.getMaintenanceSchedules);
router.post(
  '/maintenance',
  authorize('fleet_manager', 'admin'),
  validate(validateScheduleMaintenance),
  fleetController.scheduleMaintenance,
);
router.put('/maintenance/:id', authorize('fleet_manager', 'admin'), fleetController.updateMaintenanceStatus);

// ─── Analytics ────────────────────────────────────────────────────────────
router.get('/analytics', authorize('fleet_manager', 'admin'), fleetController.getFleetAnalytics);

export default router;
