import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateRegisterFleetVehicle,
  validateCreateDriver,
  validateAssignDriver,
  validateCreateMaintenance,
} from '../validators/fleet.validator.js';
import * as fleetController from '../controllers/fleet.controller.js';

const router = Router();

router.use(protect);

router.get('/vehicles', authorize('fleet_manager', 'admin'), fleetController.getFleetVehicles);
router.post(
  '/vehicles',
  authorize('fleet_manager', 'admin'),
  validate(validateRegisterFleetVehicle),
  fleetController.registerFleetVehicle,
);

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

router.put(
  '/schedule/:id',
  authorize('fleet_manager', 'admin'),
  fleetController.updateChargingSchedule,
);

router.post(
  '/maintenance',
  authorize('fleet_manager', 'admin'),
  validate(validateCreateMaintenance),
  fleetController.createMaintenanceReport,
);

router.get(
  '/maintenance',
  authorize('fleet_manager', 'admin'),
  fleetController.getMaintenanceReports,
);

router.get(
  '/analytics',
  authorize('fleet_manager', 'admin'),
  fleetController.getFleetAnalytics,
);

export default router;
