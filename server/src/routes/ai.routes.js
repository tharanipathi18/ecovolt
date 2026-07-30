import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

router.use(protect);

router.post('/predict-demand', aiController.predictDemand);
router.post('/predict-battery', aiController.predictBattery);
router.post('/predict-maintenance', aiController.predictMaintenance);
router.post('/recommend-charging', aiController.recommendCharging);

export default router;
