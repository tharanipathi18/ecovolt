import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateRegisterVehicle,
  validateCreateBooking,
  validateUpdateProfile,
} from '../validators/evUser.validator.js';
import * as evUserController from '../controllers/evUser.controller.js';

const router = Router();

router.use(protect);

router.get('/vehicles', evUserController.getUserVehicles);
router.post('/vehicles', validate(validateRegisterVehicle), evUserController.registerVehicle);
router.get('/vehicles/:id', evUserController.getVehicleDetails);

router.get('/nearby-stations', evUserController.getNearbyStations);

router.post('/bookings', validate(validateCreateBooking), evUserController.createBooking);
router.get('/bookings', evUserController.getUserBookings);

router.get('/charging-history', evUserController.getUserChargingHistory);
router.get('/sustainability', evUserController.getSustainabilityMetrics);

router.put('/profile', validate(validateUpdateProfile), evUserController.updateUserProfile);

export default router;
