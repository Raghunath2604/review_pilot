import { Router } from 'express';
import { FindingController } from '../controllers/finding.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { updateFeedbackSchema } from '../schemas/finding.schema.js';

const router = Router();

router.use(requireAuth);

router.patch(
  '/:id/feedback',
  validateRequest(updateFeedbackSchema),
  FindingController.updateFeedback
);

export default router;
