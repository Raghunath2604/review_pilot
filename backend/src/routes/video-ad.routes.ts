import { Router } from 'express';
import { VideoAdController } from '../controllers/video-ad.controller.js';

const router = Router();

router.post('/generate', VideoAdController.generate);
router.get('/templates', VideoAdController.getTemplates);

export default router;
