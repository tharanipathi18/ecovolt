import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateUpdateUserRole } from '../validators/admin.validator.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// Apply auth & admin role protection to ALL admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.put('/users/:id', validate(validateUpdateUserRole), adminController.updateUser);

/** Charging Station Owner Application Governance */
router.get('/station-applications/pending', adminController.getPendingStationApplications);
router.put('/station-applications/:id/review', adminController.reviewStationApplication);

/** Admin Management Data Queries */
router.get('/vehicles', adminController.getVehicles);
router.get('/bookings', adminController.getBookings);
router.get('/sessions', adminController.getSessions);
router.get('/generators', adminController.getGenerators);
router.get('/ports', adminController.getChargingPorts);

/* ==========================================================
   ENERGY GENERATOR APPROVAL
========================================================= */

// Get all pending generator requests
router.get('/generator-applications/pending', adminController.getPendingGeneratorApplications);

// Review generator application (Approve or Reject)
router.put('/generator-applications/:id/review', adminController.reviewGeneratorApplication);


export default router;
