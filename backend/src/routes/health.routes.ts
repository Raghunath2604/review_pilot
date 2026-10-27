import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

router.get('/', HealthController.check);
router.get('/health', HealthController.check);

export default router;
