import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/stats', requireAuth, StatsController.getStats);

export default router;
