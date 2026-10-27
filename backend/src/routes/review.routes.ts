import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createReviewSchema } from '../schemas/review.schema.js';
import { reviewRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  reviewRateLimiter,
  validateRequest(createReviewSchema),
  ReviewController.create
);
router.get('/', ReviewController.list);
router.get('/:id', ReviewController.getById);

export default router;
